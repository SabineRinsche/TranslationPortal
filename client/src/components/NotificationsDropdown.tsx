import { useState, useEffect } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'wouter';
import { useNotifications } from '@/contexts/NotificationContext';

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [_, setLocation] = useLocation();
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);

  // Trigger pulse animation when new notifications arrive
  useEffect(() => {
    if (unreadCount > previousUnreadCount && previousUnreadCount !== 0) {
      setShowPulse(true);
      // Remove pulse effect after animation completes
      const timer = setTimeout(() => {
        setShowPulse(false);
      }, 2000); // 2 seconds for the pulse animation
      
      return () => clearTimeout(timer);
    }
    setPreviousUnreadCount(unreadCount);
  }, [unreadCount, previousUnreadCount]);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'status_change':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  // Handle notification click - mark as read and navigate to jobs list with selected job
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    if (notification.jobId) {
      // Close dropdown
      setOpen(false);
      
      // Navigate to jobs list and store jobId in sessionStorage to open the details dialog
      sessionStorage.setItem('openJobDetails', notification.jobId.toString());
      setLocation('/');
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${showPulse ? 'animate-pulse-ring' : ''}`}
          aria-label="Notifications"
        >
          <Bell className={`h-5 w-5 transition-all duration-200 ${
            unreadCount > 0 ? 'text-primary' : 'text-muted-foreground'
          } ${showPulse ? 'animate-bell-ring' : ''}`} />
          {unreadCount > 0 && (
            <span className={`absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center transition-all duration-200 ${
              showPulse ? 'animate-bounce scale-110' : ''
            }`}>
              {unreadCount}
            </span>
          )}
          {showPulse && (
            <>
              <span className="absolute inset-0 rounded-full bg-accent/20 animate-ping"></span>
              <span className="absolute inset-0 rounded-full bg-accent/10 animate-ping delay-75"></span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
              className="h-auto py-0 px-2 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-2 p-3 cursor-pointer ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {formatDistanceToNow(notification.date, { addSuffix: true })}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-4 px-2 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            )}
          </DropdownMenuGroup>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}