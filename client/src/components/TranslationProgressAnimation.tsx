import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Zap, Clock, CheckCircle, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TranslationProgressProps {
  requestId: number;
  sourceLanguage: string;
  targetLanguages: string[];
  fileName: string;
  onComplete?: (translatedFiles: any[]) => void;
}

const TranslationProgressAnimation = ({
  requestId,
  sourceLanguage,
  targetLanguages,
  fileName,
  onComplete
}: TranslationProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'complete' | 'failed'>('pending');
  const [currentStage, setCurrentStage] = useState('Preparing translation...');
  const [translatedFiles, setTranslatedFiles] = useState<any[]>([]);
  const [animationStep, setAnimationStep] = useState(0);

  const stages = [
    'Preparing translation...',
    'Analyzing source content...',
    'Processing AI neural translation...',
    'Quality assurance check...',
    'Finalizing translations...',
    'Complete!'
  ];

  const floatingIcons = [
    { icon: Languages, delay: 0, x: 20, y: 30 },
    { icon: Zap, delay: 0.5, x: 60, y: 10 },
    { icon: Clock, delay: 1, x: 80, y: 50 },
  ];

  // Poll for translation status updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/translation-requests/${requestId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);
          setProgress(data.completionPercentage || 0);
          
          if (data.status === 'complete') {
            setTranslatedFiles(data.translatedFiles || []);
            onComplete?.(data.translatedFiles || []);
            clearInterval(pollInterval);
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Error polling translation status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [requestId, onComplete]);

  // Update current stage based on progress
  useEffect(() => {
    const stageIndex = Math.min(Math.floor((progress / 100) * stages.length), stages.length - 1);
    setCurrentStage(stages[stageIndex]);
  }, [progress]);

  // Animation step progression
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 3);
    }, 800);

    return () => clearInterval(stepInterval);
  }, []);

  // Simulate progress for pending/in-progress states
  useEffect(() => {
    if (status === 'pending' || status === 'in-progress') {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const increment = status === 'in-progress' ? 1 : 0.3;
          const maxProgress = status === 'in-progress' ? 95 : 20;
          return Math.min(prev + increment, maxProgress);
        });
      }, 1000);

      return () => clearInterval(progressInterval);
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'in-progress': return 'text-blue-500';
      case 'complete': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in-progress': return 'default';
      case 'complete': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <motion.div
            animate={{ rotate: status === 'in-progress' ? 360 : 0 }}
            transition={{ duration: 2, repeat: status === 'in-progress' ? Infinity : 0, ease: "linear" }}
          >
            <Languages className="h-6 w-6 text-primary" />
          </motion.div>
          Translating {fileName}
        </CardTitle>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="outline">{sourceLanguage}</Badge>
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-400"
          >
            →
          </motion.div>
          <div className="flex gap-1">
            {targetLanguages.map((lang, index) => (
              <Badge key={lang} variant={getStatusBadgeVariant()}>
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Floating animation background */}
        <div className="relative h-32 overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5">
          {floatingIcons.map(({ icon: Icon, delay, x, y }, index) => (
            <motion.div
              key={index}
              className="absolute text-primary/20"
              initial={{ x: 0, y: 0, scale: 0.5 }}
              animate={{
                x: [0, x, 0],
                y: [0, y, 0],
                scale: [0.5, 1, 0.5],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3,
                delay: delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ left: `${20 + index * 25}%`, top: `${30 + index * 15}%` }}
            >
              <Icon className="h-8 w-8" />
            </motion.div>
          ))}

          {/* Central pulsing circle */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
        </div>

        {/* Progress section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {currentStage}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Started</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {status === 'complete' ? 'Completed' : 'Processing...'}
            </span>
          </div>
        </div>

        {/* Status dots animation */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{
                scale: animationStep === index ? [1, 1.5, 1] : 1,
                opacity: animationStep === index ? [0.5, 1, 0.5] : 0.3
              }}
              transition={{ duration: 0.8 }}
            />
          ))}
        </div>

        {/* Completion state */}
        <AnimatePresence>
          {status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Translation Complete!</span>
              </div>
              
              {translatedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Translated Files:</h4>
                  {translatedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{file.fileName} ({file.language})</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Failed state */}
        <AnimatePresence>
          {status === 'failed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2"
            >
              <div className="text-red-600 font-medium">
                Translation failed. Please try again.
              </div>
              <Button variant="outline" size="sm">
                Retry Translation
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default TranslationProgressAnimation;