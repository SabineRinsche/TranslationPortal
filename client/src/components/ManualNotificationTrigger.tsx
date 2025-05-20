import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";

export function ManualNotificationTrigger() {
  const { addNotification } = useNotifications();

  // Function to simulate a job completion
  const simulateJobCompletion = () => {
    addNotification({
      title: "Job Completed",
      message: "Translation job \"Sample Translation Project\" has been completed",
      type: "job_complete",
      jobId: 1 // This would typically be the actual job ID
    });
  };

  return (
    <Button 
      className="absolute bottom-4 right-4 z-50" 
      onClick={simulateJobCompletion}
    >
      Test Notification
    </Button>
  );
}