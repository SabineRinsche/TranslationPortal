import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { TranslationRequest, ProjectUpdate } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  UserCircle
} from 'lucide-react';

// Define project status badges
const statusColors = {
  'pending': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  'in-progress': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'review': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  'completed': 'bg-green-100 text-green-800 hover:bg-green-200',
  'on-hold': 'bg-red-100 text-red-800 hover:bg-red-200'
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

// Schema for project update form
const projectUpdateSchema = z.object({
  updateText: z.string().min(3, { message: "Update text is required" }),
  updateType: z.enum(['note', 'status_change', 'milestone', 'issue']),
  newStatus: z.string().optional(),
});

// Schema for project edit form
const projectEditSchema = z.object({
  projectName: z.string().min(3, { message: "Project name is required" }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in-progress', 'review', 'completed', 'on-hold']),
  dueDate: z.date().optional(),
  assignedTo: z.string().optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
});

export default function ProjectDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const projectId = parseInt(params.id);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  
  // Define the extended project type with updates
  interface ProjectWithUpdates extends TranslationRequest {
    updates?: ProjectUpdate[];
  }
  
  // Fetch project details
  const { 
    data: project, 
    isLoading, 
    error 
  } = useQuery<ProjectWithUpdates>({
    queryKey: ['/api/translation-requests', projectId],
    enabled: !isNaN(projectId),
  });
  
  // Form for adding project updates
  const updateForm = useForm({
    resolver: zodResolver(projectUpdateSchema),
    defaultValues: {
      updateText: '',
      updateType: 'note' as const,
      newStatus: undefined,
    },
  });
  
  // Form for editing project details
  const editForm = useForm({
    resolver: zodResolver(projectEditSchema),
    defaultValues: {
      projectName: '',
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: undefined,
      assignedTo: '',
      completionPercentage: 0,
    },
  });
  
  // Update form values when project data is loaded
  useEffect(() => {
    if (project) {
      editForm.reset({
        projectName: project.projectName || project.fileName,
        priority: ((project.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent'),
        status: (project.status as 'pending' | 'in-progress' | 'review' | 'completed' | 'on-hold'),
        dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
        assignedTo: project.assignedTo || '',
        completionPercentage: project.completionPercentage || 0,
      });
    }
  }, [project, editForm]);
  
  // Add project update mutation
  const addUpdateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectUpdateSchema>) => {
      return apiRequest('POST', `/api/translation-requests/${projectId}/updates`, data);
    },
    onSuccess: () => {
      toast({
        title: "Update added",
        description: "Project update has been added successfully",
      });
      updateForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/translation-requests', projectId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add update",
        variant: "destructive",
      });
    },
  });
  
  // Update project details mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectEditSchema>) => {
      return apiRequest('PATCH', `/api/translation-requests/${projectId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Project updated",
        description: "Project details have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/translation-requests', projectId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update project details",
        variant: "destructive",
      });
    },
  });
  
  const onUpdateSubmit = (values: z.infer<typeof projectUpdateSchema>) => {
    addUpdateMutation.mutate(values);
  };
  
  const onEditSubmit = (values: z.infer<typeof projectEditSchema>) => {
    updateProjectMutation.mutate(values);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
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
  
  if (error || !project) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load project details</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Could not load project details. The project may not exist or there was an error fetching the data.</p>
            <Button onClick={() => setLocation('/dashboard')} className="mt-4">Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {project.projectName || project.fileName}
          </h1>
          <p className="text-muted-foreground">Project #{project.id}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setLocation('/dashboard')} variant="outline">Back to Dashboard</Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:w-[400px]">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="translation">Translation</TabsTrigger>
        </TabsList>
        
        {/* Project Details Tab */}
        <TabsContent value="details">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Overview of the translation project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">
                      <Badge 
                        className={statusColors[project.status as keyof typeof statusColors] || statusColors.pending}
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                    <div className="mt-1">
                      <Badge 
                        className={priorityColors[project.priority as keyof typeof priorityColors] || priorityColors.medium}
                      >
                        {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Completion</h3>
                  <div className="mt-1">
                    <Progress 
                      value={project.completionPercentage || 0} 
                      className="h-2" 
                    />
                    <p className="text-xs text-right mt-1">{project.completionPercentage || 0}% Complete</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                    <p className="mt-1 flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                      {formatDate(project.createdAt)}
                    </p>
                  </div>
                  
                  {project.dueDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                      <p className="mt-1 flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        {formatDate(project.dueDate)}
                      </p>
                    </div>
                  )}
                </div>
                
                {project.assignedTo && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Assigned To</h3>
                    <p className="mt-1 flex items-center text-sm">
                      <UserCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                      {project.assignedTo}
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
                  <p className="mt-1">{project.fileName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Format</h3>
                  <p className="mt-1">{project.fileFormat}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Size</h3>
                  <p className="mt-1">{(project.fileSize / 1024).toFixed(2)} KB</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Source Language</h3>
                  <p className="mt-1">{project.sourceLanguage}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Target Languages</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {project.targetLanguages.map((lang: string) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Translation Type</h3>
                  <p className="mt-1">{
                    project.workflow === 'ai-translation-qc' 
                      ? 'AI Translation with Quality Assurance'
                      : project.workflow === 'ai-translation-human'
                        ? 'AI Translation with Expert Review'
                        : 'AI Neural Translation'
                  }</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Project Updates Tab */}
        <TabsContent value="updates">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Project Updates</CardTitle>
                  <CardDescription>Status updates and notes</CardDescription>
                </CardHeader>
                <CardContent>
                  {project.updates && project.updates.length > 0 ? (
                    <div className="space-y-4">
                      {project.updates.map((update: any) => (
                        <div key={update.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {updateTypeIcons[update.updateType as keyof typeof updateTypeIcons] || updateTypeIcons.note}
                              <span className="font-medium ml-1">
                                {update.updateType.replace('_', ' ').charAt(0).toUpperCase() + update.updateType.replace('_', ' ').slice(1)}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(update.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2">{update.updateText}</p>
                          {update.updateType === 'status_change' && update.newStatus && (
                            <div className="mt-2">
                              <Badge className={statusColors[update.newStatus as keyof typeof statusColors] || statusColors.pending}>
                                Status changed to: {update.newStatus.charAt(0).toUpperCase() + update.newStatus.slice(1).replace('-', ' ')}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No updates yet.</p>
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
                        name="updateText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Update Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter update details..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="review">Review</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="on-hold">On Hold</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={addUpdateMutation.isPending}
                      >
                        {addUpdateMutation.isPending ? "Adding..." : "Add Update"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Edit Project Tab */}
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Project</CardTitle>
              <CardDescription>Update project details and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Name of assignee" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="on-hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button 
                                  variant="outline" 
                                  className={`w-full justify-start text-left font-normal ${
                                    !field.value && "text-muted-foreground"
                                  }`}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : "Select due date"}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="completionPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Completion Percentage</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Current progress: {field.value || 0}%
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={updateProjectMutation.isPending}
                  >
                    {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Translation Tab */}
        <TabsContent value="translation">
          <Card>
            <CardHeader>
              <CardTitle>Translation Details</CardTitle>
              <CardDescription>View translation details and progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Source</h3>
                  <p className="mt-1">{project.sourceLanguage}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Target Languages</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {project.targetLanguages.map((lang: string) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Content Statistics</h3>
                <div className="grid md:grid-cols-3 gap-4 mt-2">
                  <div className="bg-muted rounded-md p-3">
                    <p className="text-xs text-muted-foreground">Word Count</p>
                    <p className="text-xl font-bold">{project.wordCount.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-muted rounded-md p-3">
                    <p className="text-xs text-muted-foreground">Character Count</p>
                    <p className="text-xl font-bold">{project.charCount.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-muted rounded-md p-3">
                    <p className="text-xs text-muted-foreground">Images with Text</p>
                    <p className="text-xl font-bold">{project.imagesWithText}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Translation Flow</h3>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</div>
                    <div className="h-1 flex-1 bg-primary mx-2"></div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">2</div>
                    <div className="h-1 flex-1 bg-primary/20 mx-2"></div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">3</div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <div className="text-center w-1/3">
                      <p className="font-medium">File Analysis</p>
                      <p className="text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center w-1/3">
                      <p className="font-medium">Translation</p>
                      <p className="text-muted-foreground">
                        {project.status === 'in-progress' ? 'In Progress' : 
                         project.status === 'completed' ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                    <div className="text-center w-1/3">
                      <p className="font-medium">Delivery</p>
                      <p className="text-muted-foreground">
                        {project.status === 'completed' ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Translation Process</h3>
                <p className="mt-1">
                  {project.workflow === 'ai-translation-qc' 
                    ? 'AI Translation with Quality Assurance - Machine translation with automatic quality control checks.'
                    : project.workflow === 'ai-translation-human'
                      ? 'AI Translation with Expert Review - Machine translation followed by human expert review and editing.'
                      : 'AI Neural Translation - High-quality neural machine translation.'}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                disabled={project.status !== 'completed'}
                onClick={() => {
                  toast({
                    title: "Translation downloaded",
                    description: "The translation files have been downloaded.",
                  });
                }}
              >
                Download Translation
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}