import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { TranslationRequest, ProjectUpdate } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/contexts/NotificationContext';
import { format, parseISO } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  FileEdit,
  MessageCircle,
  AlertCircle,
  UserCircle,
  Briefcase,
  Download
} from 'lucide-react';

// Define job status badges
const statusColors = {
  'pending': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  'translation-in-progress': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'lqa-in-progress': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  'human-reviewer-assigned': 'bg-violet-100 text-violet-800 hover:bg-violet-200',
  'human-review-in-progress': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  'complete': 'bg-green-100 text-green-800 hover:bg-green-200'
};

// Define priority badges
const priorityColors = {
  'low': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  'medium': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'high': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  'urgent': 'bg-red-100 text-red-800 hover:bg-red-200'
};

// Define update type icons
const updateTypeIcons = {
  'note': <MessageCircle className="h-4 w-4 mr-1" />,
  'status_change': <CheckCircle2 className="h-4 w-4 mr-1" />,
  'milestone': <FileEdit className="h-4 w-4 mr-1" />,
  'issue': <AlertCircle className="h-4 w-4 mr-1" />
};

// Schema for job update form
const jobUpdateSchema = z.object({
  updateText: z.string().min(3, { message: "Update text is required" }),
  updateType: z.enum(['note', 'status_change', 'milestone', 'issue']),
  newStatus: z.string().optional(),
});

// Schema for job edit form
const jobEditSchema = z.object({
  projectName: z.string().min(3, { message: "Job name is required" }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'translation-in-progress', 'lqa-in-progress', 
                  'human-reviewer-assigned', 'human-review-in-progress', 'complete']),
  dueDate: z.date().optional(),
  assignedTo: z.string().optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
});

export default function JobDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const jobId = parseInt(params.id || "0");
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  
  // Define the extended job type with updates
  interface JobWithUpdates extends TranslationRequest {
    updates?: ProjectUpdate[];
  }
  
  // Fetch job details
  const { 
    data: job, 
    isLoading, 
    error 
  } = useQuery<JobWithUpdates>({
    queryKey: ['/api/translation-requests', jobId],
    enabled: !isNaN(jobId),
  });
  
  // Form for adding job updates
  const updateForm = useForm({
    resolver: zodResolver(jobUpdateSchema),
    defaultValues: {
      updateText: '',
      updateType: 'note' as const,
      newStatus: undefined,
    },
  });
  
  // Form for editing job details
  const editForm = useForm({
    resolver: zodResolver(jobEditSchema),
    defaultValues: {
      projectName: '',
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: undefined,
      assignedTo: '',
      completionPercentage: 0,
    },
  });
  
  // Update form values when job data is loaded
  useEffect(() => {
    if (job) {
      editForm.reset({
        projectName: job.projectName || job.fileName,
        priority: ((job.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent'),
        status: ((job.status || 'pending') as 'pending' | 'translation-in-progress' | 'lqa-in-progress' | 
                'human-reviewer-assigned' | 'human-review-in-progress' | 'complete'),
        dueDate: job.dueDate ? new Date(job.dueDate) : undefined,
        assignedTo: job.assignedTo || '',
        completionPercentage: job.completionPercentage || 0,
      });
    }
  }, [job, editForm]);
  
  // Add job update mutation
  const addUpdateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof jobUpdateSchema>) => {
      return apiRequest('POST', `/api/translation-requests/${jobId}/updates`, data);
    },
    onSuccess: () => {
      toast({
        title: "Update added",
        description: "Job update has been added successfully",
      });
      updateForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/translation-requests', jobId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add update",
        variant: "destructive",
      });
    },
  });
  
  // Get the notifications API
  const { addNotification } = useNotifications();

  // Update job details mutation
  const updateJobMutation = useMutation({
    mutationFn: async (data: z.infer<typeof jobEditSchema>) => {
      return apiRequest('PATCH', `/api/translation-requests/${jobId}`, data);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Job updated",
        description: "Job details have been updated successfully",
      });
      
      // Check if the job was marked as complete and send notification
      if (variables && variables.status === 'complete') {
        // Send notification for job completion
        addNotification({
          title: "Job Completed",
          message: `Translation job "${variables.projectName || 'Translation'}" has been completed`,
          type: "job_complete",
          jobId: Number(jobId)
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/translation-requests', jobId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update job details",
        variant: "destructive",
      });
    },
  });
  
  const onUpdateSubmit = (values: z.infer<typeof jobUpdateSchema>) => {
    addUpdateMutation.mutate(values);
  };
  
  const onEditSubmit = (values: z.infer<typeof jobEditSchema>) => {
    updateJobMutation.mutate(values);
  };
  
  // Format date for display
  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'PPP');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (error || !job) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load job details</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Could not load job details. The job may not exist or there was an error fetching the data.</p>
            <Button onClick={() => setLocation('/dashboard')} className="mt-4">Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6 job-details-header">
        <div>
          <h1 className="text-2xl font-bold">
            {job.projectName || job.fileName}
          </h1>
          <p className="text-muted-foreground">Job #{job.id}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setLocation('/dashboard')} variant="outline">Back to Dashboard</Button>
          {job.status === 'complete' && (
            <Button 
              onClick={() => alert('Downloading translated files...')} 
              variant="default"
              className="download-button"
            >
              <Download className="mr-2 h-4 w-4" />
              Download translated files
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:w-[300px]">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="translation">Translation</TabsTrigger>
        </TabsList>
        
        {/* Job Details Tab */}
        <TabsContent value="details">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
                <CardDescription>Overview of the translation job</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="job-status">
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">
                      <Badge 
                        className={statusColors[(job?.status || 'pending') as keyof typeof statusColors]}
                      >
                        {job?.status 
                          ? job.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                          : 'Pending'
                        }
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                    <div className="mt-1">
                      <Badge 
                        className={priorityColors[(job?.priority || 'medium') as keyof typeof priorityColors]}
                      >
                        {(job?.priority || 'medium').charAt(0).toUpperCase() + (job?.priority || 'medium').slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Completion</h3>
                  <div className="mt-1">
                    <Progress 
                      value={job.completionPercentage || 0} 
                      className="h-2" 
                    />
                    <p className="text-xs text-right mt-1">{job.completionPercentage || 0}% Complete</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                    <p className="mt-1 flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                  
                  {job.dueDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                      <p className="mt-1 flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        {formatDate(job.dueDate)}
                      </p>
                    </div>
                  )}
                </div>
                
                {job.assignedTo && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Assigned To</h3>
                    <p className="mt-1 flex items-center text-sm">
                      <UserCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                      {job.assignedTo}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Translation Details</CardTitle>
                <CardDescription>File and language information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">File</h3>
                  <p className="mt-1">{job.fileName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Format</h3>
                  <p className="mt-1">{job.fileFormat}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Size</h3>
                  <p className="mt-1">{(job.fileSize / 1024).toFixed(2)} KB</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Source Language</h3>
                  <p className="mt-1">{job.sourceLanguage}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Target Languages</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {job.targetLanguages && job.targetLanguages.length > 0 ? (
                      job.targetLanguages.map((lang: string) => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No target languages specified</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Translation Type</h3>
                  <p className="mt-1">{
                    job.workflow === 'ai-translation-qc' 
                      ? 'AI Translation with Quality Assurance'
                      : job.workflow === 'ai-translation-human'
                        ? 'AI Translation with Expert Review'
                        : 'AI Neural Translation'
                  }</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Job Updates Tab */}
        <TabsContent value="updates">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="h-full job-updates">
                <CardHeader>
                  <CardTitle>Job Updates</CardTitle>
                  <CardDescription>Status updates and notes</CardDescription>
                </CardHeader>
                <CardContent>
                  {job.updates && job.updates.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {[...job.updates]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((update) => (
                          <div key={update.id} className="p-3 bg-card border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <Badge className="mr-2">
                                  {updateTypeIcons[update.type as keyof typeof updateTypeIcons]}
                                  {update.type === 'note' ? 'Note' : 
                                    update.type === 'status_change' ? 'Status Change' : 
                                    update.type === 'milestone' ? 'Milestone' : 'Issue'}
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(update.createdAt)}
                                </p>
                              </div>
                              <p className="text-sm">{update.userId}</p>
                            </div>
                            <div className="mt-2">
                              <p>{update.content}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No updates yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Add Update</CardTitle>
                  <CardDescription>Add a note or status update</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...updateForm}>
                    <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                      <FormField
                        control={updateForm.control}
                        name="updateType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Update Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select update type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="note">Note</SelectItem>
                                <SelectItem value="status_change">Status Change</SelectItem>
                                <SelectItem value="milestone">Milestone</SelectItem>
                                <SelectItem value="issue">Issue</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {updateForm.watch('updateType') === 'status_change' && (
                        <FormField
                          control={updateForm.control}
                          name="newStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="translation-in-progress">Translation in Progress</SelectItem>
                                  <SelectItem value="lqa-in-progress">LQA in Progress</SelectItem>
                                  <SelectItem value="human-reviewer-assigned">Reviewer Assigned</SelectItem>
                                  <SelectItem value="human-review-in-progress">Human Review in Progress</SelectItem>
                                  <SelectItem value="complete">Complete</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={updateForm.control}
                        name="updateText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Update Details</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter update details..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={addUpdateMutation.isPending}>
                        {addUpdateMutation.isPending ? "Adding..." : "Add Update"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Translation Tab */}
        <TabsContent value="translation">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Translation Analysis</CardTitle>
                <CardDescription>Text metrics and analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Word Count</h3>
                    <p className="text-2xl font-bold mt-1">{job.wordCount || 0}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Character Count</h3>
                    <p className="text-2xl font-bold mt-1">{job.characterCount || 0}</p>
                  </div>
                </div>
                
                {job.imagesWithText > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Images with Text</h3>
                    <p className="mt-1">{job.imagesWithText}</p>
                  </div>
                )}
                
                {job.subjectMatter && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Subject Matter</h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {job.subjectMatter.split(',').map((subject, index) => (
                        <Badge key={index} variant="secondary">{subject.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Translation Preview</CardTitle>
                <CardDescription>Preview of the translated content</CardDescription>
              </CardHeader>
              <CardContent>
                {job.status === 'complete' ? (
                  <div>
                    <p>Your translation is ready for download.</p>
                    <Button 
                      onClick={() => alert('Downloading translated files...')} 
                      className="mt-4 download-button"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download translated files
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4 text-muted-foreground">
                      Translation in progress
                    </div>
                    <Progress value={job.completionPercentage || 0} className="h-2 w-[200px] mx-auto" />
                    <p className="text-xs mt-2">{job.completionPercentage || 0}% Complete</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}