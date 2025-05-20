import React from 'react';
import { motion } from 'framer-motion';
import { Globe, FileText, CheckCircle, ArrowRight } from 'lucide-react';

interface TranslationLoaderProps {
  type: 'upload' | 'analysis' | 'translation' | 'complete';
  text?: string;
}

export const TranslationLoader: React.FC<TranslationLoaderProps> = ({ 
  type, 
  text = 'Loading...' 
}) => {
  // Different loader animations based on the stage of the translation process
  switch (type) {
    case 'upload':
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="relative w-20 h-20">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.5
              }}
            >
              <FileText size={48} className="text-primary/70" />
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ 
                rotate: [0, 360],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3
              }}
            >
              <FileText size={64} className="text-primary/20" />
            </motion.div>
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground">{text}</p>
        </div>
      );

    case 'analysis': 
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="relative w-24 h-24">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5 
              }}
            >
              <FileText size={40} className="text-primary/80" />
            </motion.div>
            
            <motion.div 
              className="absolute top-1 right-1"
              animate={{
                scale: [0.8, 1, 0.8],
                y: [0, -10, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                delay: 0.2
              }}
            >
              <span className="text-xl">🇬🇧</span>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-1 left-1"
              animate={{
                scale: [0.8, 1, 0.8],
                y: [0, 10, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: 0.5
              }}
            >
              <span className="text-xl">🇫🇷</span>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-1 right-1"
              animate={{
                scale: [0.8, 1, 0.8],
                y: [0, 5, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                delay: 0.8
              }}
            >
              <span className="text-xl">🇩🇪</span>
            </motion.div>
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground">{text}</p>
        </div>
      );
      
    case 'translation':
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="relative w-28 h-28">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                rotate: [0, 360]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 8,
                ease: "linear"
              }}
            >
              <Globe size={56} className="text-primary/70" strokeWidth={1.5} />
            </motion.div>
            
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut"
              }}
            >
              <span className="flex space-x-1 items-center">
                <motion.span 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 1.5,
                    delay: 0
                  }}
                  className="text-2xl"
                >
                  A
                </motion.span>
                <motion.span 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 1.5,
                    delay: 0.3
                  }}
                  className="text-2xl"
                >
                  <ArrowRight size={20} />
                </motion.span>
                <motion.span 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 1.5,
                    delay: 0.6
                  }}
                  className="text-2xl"
                >
                  B
                </motion.span>
              </span>
            </motion.div>
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground">{text}</p>
        </div>
      );

    case 'complete':
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.8 }}
            className="text-green-500"
          >
            <CheckCircle size={64} />
          </motion.div>
          <p className="text-center text-sm font-medium text-muted-foreground">{text}</p>
        </div>
      );

    default:
      return <div className="p-6 text-center">{text}</div>;
  }
};

export default TranslationLoader;