import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Search, Filter, ArrowUpDown, Clock, Calendar, FileText, Briefcase, Download, ExternalLink } from 'lucide-react';
import { TranslationRequest } from '@shared/schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

// Define status colors
const statusColors = {
  'pending': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  'translation-in-progress': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'lqa-in-progress': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  'human-reviewer-assigned': 'bg-violet-100 text-violet-800 hover:bg-violet-200',
  'human-review-in-progress': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  'complete': 'bg-green-100 text-green-800 hover:bg-green-200'
};

// Define priority colors
const priorityColors = {
  'low': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  'medium': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'high': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  'urgent': 'bg-red-100 text-red-800 hover:bg-red-200'
};

export default function JobsList() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedJob, setSelectedJob] = useState<TranslationRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Fetch all translation requests
  const { data: jobs, isLoading } = useQuery<TranslationRequest[]>({
    queryKey: ['/api/translation-requests'],
    staleTime: 30000, // 30 seconds
  });
  
  // Check if we should open a job details dialog from notification
  useEffect(() => {
    if (!jobs) return; // Skip if jobs aren't loaded yet
    
    const jobIdToOpen = sessionStorage.getItem('openJobDetails');
    if (jobIdToOpen) {
      // Clear the session storage item to prevent reopening on refresh
      sessionStorage.removeItem('openJobDetails');
      
      // Find the job with the specified ID and open its details dialog
      const jobId = parseInt(jobIdToOpen, 10);
      if (!isNaN(jobId)) {
        const jobToOpen = jobs.find(job => job.id === jobId);
        if (jobToOpen) {
          setSelectedJob(jobToOpen);
          setIsDetailsOpen(true);
        }
      }
    }
  }, [jobs]);
  
  // Filter and sort jobs
  const filteredJobs = jobs?.filter(job => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      job.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.projectName && job.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    // Apply status filter
    const matchesStatus = !statusFilter || statusFilter === 'all' || 
      job.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  }) || [];
  
  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    
    return sortOrder === 'desc' 
      ? dateB.getTime() - dateA.getTime() 
      : dateA.getTime() - dateB.getTime();
  });
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get a formatted workflow name
  const getWorkflowName = (workflow: string | null | undefined) => {
    if (!workflow) return 'AI Neural Translation';
    
    switch (workflow) {
      case 'ai-translation-qc':
        return 'AI Translation with QA';
      case 'ai-translation-human':
        return 'AI Translation with Expert Review';
      default:
        return 'AI Neural Translation';
    }
  };

  // Download file function (this would connect to your backend in a real implementation)
  const downloadFile = (jobId: number) => {
    alert(`Download functionality would connect to the backend to download file for job ${jobId}`);
    // In a real implementation, you would hit your backend API to download the file
    // window.open(`/api/translation-requests/${jobId}/download`, '_blank');
  };
  
  // Format file size
  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <>
      <Card className="jobs-list">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
            <div>
              <CardTitle>Translation Jobs</CardTitle>
              <CardDescription>Manage your translation jobs and track their status</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value || undefined)}
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="translation-in-progress">Translation in Progress</SelectItem>
                  <SelectItem value="lqa-in-progress">LQA in Progress</SelectItem>
                  <SelectItem value="human-reviewer-assigned">Reviewer Assigned</SelectItem>
                  <SelectItem value="human-review-in-progress">Human Review in Progress</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {sortedJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No translation jobs found</p>
              {searchTerm || statusFilter ? (
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters</p>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedJobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/jobs/${job.id}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <h3 className="font-medium text-lg">{job.projectName || job.fileName}</h3>
                        <Badge 
                          className={`ml-3 ${statusColors[(job.status || 'pending') as keyof typeof statusColors]}`}
                        >
                          {(job.status || 'pending').split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1.5" />
                          {formatDate(job.createdAt)}
                        </div>
                        
                        {job.dueDate && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1.5" />
                            Due: {formatDate(job.dueDate)}
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1.5" />
                          {getWorkflowName(job.workflow)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">From:</span>
                          <span className="font-medium">{job.sourceLanguage || "Unknown"}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">To:</span>
                          <span className="font-medium">
                            {job.targetLanguages && job.targetLanguages.length > 0 
                              ? (job.targetLanguages.length > 3 
                                  ? `${job.targetLanguages.slice(0, 2).join(", ")} +${job.targetLanguages.length - 2} more` 
                                  : job.targetLanguages.join(", "))
                              : "None"}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">Credits:</span>
                          <span className="font-medium">{job.creditsRequired?.toLocaleString() || "0"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 md:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJob(job);
                          setIsDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress bar for completion percentage */}
                  {job.completionPercentage !== undefined && 
                   job.completionPercentage !== null && 
                   job.completionPercentage > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${job.completionPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs text-muted-foreground">{job.completionPercentage}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      {selectedJob && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                {selectedJob.projectName || selectedJob.fileName}
                <Badge 
                  className={statusColors[(selectedJob.status || 'pending') as keyof typeof statusColors]}
                >
                  {(selectedJob.status || 'pending').split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Translation job details and file information
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="font-semibold mb-2">File Information</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-muted-foreground">File Name</TableCell>
                      <TableCell className="font-medium">{selectedJob.fileName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">File Size</TableCell>
                      <TableCell>
                        {formatFileSize(selectedJob.fileSize)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">File Format</TableCell>
                      <TableCell>{selectedJob.fileFormat || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Characters</TableCell>
                      <TableCell>{selectedJob.charCount?.toLocaleString() || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Translation Details</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Source Language</TableCell>
                      <TableCell>{selectedJob.sourceLanguage || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Target Languages</TableCell>
                      <TableCell>{selectedJob.targetLanguages?.join(', ') || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Workflow</TableCell>
                      <TableCell>{getWorkflowName(selectedJob.workflow)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Credits Required</TableCell>
                      <TableCell>{selectedJob.creditsRequired?.toLocaleString() || '0'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {selectedJob.dueDate && (
              <div className="flex items-center text-amber-600 mb-4">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">Due: {formatDate(selectedJob.dueDate)}</span>
              </div>
            )}

            {selectedJob.completionPercentage !== undefined && 
             selectedJob.completionPercentage !== null && 
             selectedJob.completionPercentage > 0 && (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{selectedJob.completionPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${selectedJob.completionPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <Button variant="outline" size="sm" className="sm:order-1" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>

              <div className="flex flex-col sm:flex-row gap-2 sm:order-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => downloadFile(selectedJob.id)}
                >
                  <Download className="h-4 w-4" />
                  Download Translated Files
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}