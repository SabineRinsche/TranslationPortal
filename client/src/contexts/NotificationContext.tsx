import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';

// Define notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type: 'job_complete' | 'status_change' | 'system';
  jobId?: number;
}

// Define the shape of the context
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Custom hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

// Provider component
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  
  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Get job data to check for completed jobs
  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/translation-requests'],
  });

  // Track previously completed jobs to avoid duplicate notifications
  const [completedJobIds, setCompletedJobIds] = useState<number[]>([]);
  
  // Check for newly completed jobs
  useEffect(() => {
    if (jobs && Array.isArray(jobs)) {
      const newlyCompletedJobs = jobs.filter((job: any) => 
        job.status === 'complete' && !completedJobIds.includes(job.id)
      );
      
      if (newlyCompletedJobs.length > 0) {
        // Update the list of completed job IDs
        setCompletedJobIds(prev => [
          ...prev, 
          ...newlyCompletedJobs.map((job: any) => job.id)
        ]);
        
        // Create notifications for each newly completed job
        newlyCompletedJobs.forEach((job: any) => {
          const notification = {
            title: 'Job Completed',
            message: `Translation job "${job.projectName || job.fileName}" has been completed`,
            type: 'job_complete' as const,
            jobId: job.id
          };
          
          // Add to notifications list
          addNotification(notification);
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
            action: (
              <div className="p-1 rounded-full bg-green-500">
                <Bell className="h-4 w-4 text-white" />
              </div>
            )
          });
        });
      }
    }
  }, [jobs]);

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Remove a notification
  const removeNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Context value
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}