import React from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, CheckCircle, ArrowRight, Cpu, Sparkles, Network, Zap } from 'lucide-react';

interface TranslationLoaderProps {
  type: 'upload' | 'analysis' | 'translation' | 'complete';
  text?: string;
}

export const TranslationLoader: React.FC<TranslationLoaderProps> = ({ 
  type, 
  text = 'Loading...' 
}) => {
  // Different AI-themed loader animations based on the stage of the translation process
  switch (type) {
    case 'upload':
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="relative w-24 h-24">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2
              }}
            >
              <FileText size={48} className="text-primary/70" />
            </motion.div>

            {/* AI "scanning" effect */}
            <motion.div
              className="absolute inset-0"
              initial={{ top: 0 }}
              animate={{ 
                top: ['0%', '100%', '0%']
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.5,
                ease: "easeInOut"
              }}
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0" />
            </motion.div>

            {/* AI "processing" circles */}
            <motion.div
              className="absolute -bottom-2 -right-2 bg-blue-500/20 dark:bg-blue-400/20 rounded-full p-1"
              animate={{ 
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                delay: 0.2
              }}
            >
              <Cpu size={15} className="text-blue-600 dark:text-blue-400" />
            </motion.div>
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground">{text}</p>
        </div>
      );

    case 'analysis': 
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="relative w-28 h-28">
            {/* AI Brain */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2 
              }}
            >
              <Brain size={56} className="text-primary/80" />
            </motion.div>
            
            {/* "Neural connections" - animated dots */}
            <motion.div 
              className="absolute top-0 left-0 h-2 w-2 rounded-full bg-blue-500"
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.2, 1, 0.2],
                x: [0, 10, 0],
                y: [0, 10, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                delay: 0.2
              }}
            />
            
            <motion.div 
              className="absolute top-1/4 right-1/4 h-2 w-2 rounded-full bg-purple-500"
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.2, 1, 0.2],
                x: [0, -15, 0],
                y: [0, 5, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: 0.5
              }}
            />
            
            <motion.div 
              className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500"
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.2, 1, 0.2],
                x: [0, -10, 0],
                y: [0, -15, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                delay: 0.8
              }}
            />

            {/* Data flow lines */}
            <motion.div
              className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              animate={{
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5
              }}
            />
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground">{text}</p>
        </div>
      );
      
    case 'translation':
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Neural network background */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center opacity-20"
              animate={{ 
                rotate: [0, 360],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 10,
                ease: "linear"
              }}
            >
              <Network size={80} className="text-primary" strokeWidth={1} />
            </motion.div>

            {/* AI transformation effect */}
            <div className="relative flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="relative"
              >
                <span className="text-lg font-bold">EN</span>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: 0.5
                  }}
                >
                  <Sparkles size={12} className="text-yellow-500" />
                </motion.div>
              </motion.div>

              <motion.div
                animate={{
                  x: [0, 5, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5
                }}
              >
                <Zap size={20} className="text-primary" />
              </motion.div>

              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: 0.5
                }}
                className="relative"
              >
                <span className="text-lg font-bold">ES</span>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: 0
                  }}
                >
                  <Sparkles size={12} className="text-yellow-500" />
                </motion.div>
              </motion.div>
            </div>

            {/* AI processing pulses */}
            <motion.div
              className="absolute h-full w-full rounded-full border border-primary/30"
              animate={{
                scale: [0, 1.5],
                opacity: [0.7, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeOut"
              }}
            />
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground">{text}</p>
        </div>
      );

    case 'complete':
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 1.2, 1]
              }}
              transition={{ duration: 0.8 }}
              className="text-green-500"
            >
              <CheckCircle size={64} />
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                delay: 0.3,
                duration: 1.5
              }}
            >
              <Sparkles size={20} className="text-yellow-400" />
            </motion.div>
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground">{text}</p>
        </div>
      );

    default:
      return <div className="p-6 text-center">{text}</div>;
  }
};

export default TranslationLoader;