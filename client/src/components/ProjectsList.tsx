import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Search, Filter, ArrowUpDown, Clock, Calendar, FileText, Briefcase } from 'lucide-react';
import { TranslationRequest } from '@shared/schema';

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
  
  // Fetch all translation requests
  const { data: jobs, isLoading } = useQuery<TranslationRequest[]>({
    queryKey: ['/api/translation-requests'],
  });
  
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <Card>
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
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-medium">{job.projectName || job.fileName}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={statusColors[job.status as keyof typeof statusColors] || statusColors.pending}
                      >
                        {job.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                      
                      {job.priority && (
                        <Badge 
                          className={priorityColors[job.priority as keyof typeof priorityColors] || priorityColors.medium}
                          variant="outline"
                        >
                          {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} Priority
                        </Badge>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {getWorkflowName(job.workflow)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(job.createdAt)}
                    </div>
                    
                    {job.dueDate && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        Due: {formatDate(job.dueDate)}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/jobs/${job.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
                
                {/* Progress bar for completion percentage */}
                {job.completionPercentage !== undefined && job.completionPercentage !== null && job.completionPercentage > 0 && (
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
  );
}