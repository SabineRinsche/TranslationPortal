import { useState, useEffect } from 'react';
import { X, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface HelpStep {
  title: string;
  description: string;
  target: string; // CSS selector for the target element
  position?: 'top' | 'right' | 'bottom' | 'left';
}

interface HelpTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpTour({ isOpen, onClose }: HelpTourProps) {
  const [location] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<HelpStep[]>([]);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tourPosition, setTourPosition] = useState({ top: 0, left: 0 });

  // Define the help steps for different pages
  useEffect(() => {
    // Reset step when location changes
    setCurrentStep(0);
    
    // Define page-specific help steps
    if (location === '/') {
      setSteps([
        {
          title: 'Welcome to Alpha Translation',
          description: 'This dashboard gives you an overview of your translation projects and activities.',
          target: '.page-header',
          position: 'bottom'
        },
        {
          title: 'Job Management',
          description: 'View and manage all your translation jobs from this panel. Click on a job to view details.',
          target: '.jobs-list',
          position: 'right'
        },
        {
          title: 'Upload New Files',
          description: 'Click here to upload new files for translation or submit API requests.',
          target: '.upload-button',
          position: 'bottom'
        },
        {
          title: 'Translation Analytics',
          description: 'Track your translation activity, credits usage, and trends over time.',
          target: '.dashboard-analytics',
          position: 'left'
        },
        {
          title: 'Your Profile',
          description: 'Access your account details, subscription info, and user preferences.',
          target: '.user-menu-button',
          position: 'bottom'
        },
      ]);
    } else if (location.startsWith('/job/')) {
      setSteps([
        {
          title: 'Job Details',
          description: 'This page shows detailed information about your translation job.',
          target: '.job-details-header',
          position: 'bottom'
        },
        {
          title: 'Translation Status',
          description: 'Track the current status of your translation job here.',
          target: '.job-status',
          position: 'right'
        },
        {
          title: 'Download Files',
          description: 'Download your translated files once the job is complete.',
          target: '.download-button',
          position: 'top'
        },
        {
          title: 'Job Updates',
          description: 'View the history of updates and changes to your job.',
          target: '.job-updates',
          position: 'left'
        },
      ]);
    } else if (location === '/profile') {
      setSteps([
        {
          title: 'User Profile',
          description: 'View and edit your personal information and preferences.',
          target: '.profile-header',
          position: 'bottom'
        },
        {
          title: 'Account Details',
          description: 'Manage your account information and subscription details.',
          target: '.account-details',
          position: 'right'
        },
        {
          title: 'Billing & Credits',
          description: 'View your available credits and billing information.',
          target: '.billing-section',
          position: 'left'
        },
      ]);
    }
  }, [location]);

  // Find and position the tour relative to the target element
  useEffect(() => {
    if (!isOpen || steps.length === 0) return;

    const step = steps[currentStep];
    const target = document.querySelector(step.target) as HTMLElement;
    setTargetElement(target);

    if (target) {
      const rect = target.getBoundingClientRect();
      const position = step.position || 'bottom';
      
      const calculatePosition = () => {
        switch (position) {
          case 'top':
            return {
              top: rect.top - 140,
              left: rect.left + rect.width / 2 - 150,
            };
          case 'right':
            return {
              top: rect.top + rect.height / 2 - 70,
              left: rect.right + 20,
            };
          case 'bottom':
            return {
              top: rect.bottom + 20,
              left: rect.left + rect.width / 2 - 150,
            };
          case 'left':
            return {
              top: rect.top + rect.height / 2 - 70,
              left: rect.left - 320,
            };
          default:
            return {
              top: rect.bottom + 20,
              left: rect.left + rect.width / 2 - 150,
            };
        }
      };

      const newPosition = calculatePosition();
      setTourPosition(newPosition);
      
      // Highlight the target element
      target.classList.add('help-highlight');
    }

    return () => {
      // Remove highlight when component unmounts or step changes
      if (target) {
        target.classList.remove('help-highlight');
      }
    };
  }, [isOpen, currentStep, steps]);

  // Handle next/previous navigation
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Determine position arrow class based on step position
  const getArrowClass = () => {
    const position = steps[currentStep]?.position || 'bottom';
    switch (position) {
      case 'top': return 'help-arrow-bottom';
      case 'right': return 'help-arrow-left';
      case 'bottom': return 'help-arrow-top';
      case 'left': return 'help-arrow-right';
      default: return 'help-arrow-top';
    }
  };

  if (!isOpen || steps.length === 0) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      {/* Help tooltip */}
      <div 
        className={`fixed z-[60] bg-card border shadow-lg rounded-lg p-4 w-[300px] ${getArrowClass()}`}
        style={{
          top: `${tourPosition.top}px`,
          left: `${tourPosition.left}px`,
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-accent">{steps[currentStep].title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onClose}
            aria-label="Close help tour"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm mb-4">{steps[currentStep].description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} of {steps.length}
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={handleNext}
              className="h-8"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                'Finish'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}