import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { HelpTour } from '@/components/HelpTour';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function HelpButton() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => setShowHelp(true)}
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5 text-accent" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Help & Tour</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <HelpTour isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}