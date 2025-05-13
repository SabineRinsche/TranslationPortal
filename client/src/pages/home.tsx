import { useEffect } from 'react';
import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import FileUpload from '@/components/FileUpload';
import FileAnalysis from '@/components/FileAnalysis';
import ApiDocumentation from '@/components/ApiDocumentation';
import { useTranslationStore } from '@/hooks/useTranslationStore';

const Home = () => {
  const { 
    showFileUpload, 
    showFileAnalysis, 
    showApiDocs,
    reset
  } = useTranslationStore();

  // Reset state when component mounts
  useEffect(() => {
    reset();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 dark:from-primary dark:to-blue-300 mb-2">Alpha's AI Client Translation Service</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Our powerful AI-driven translation platform translates documents into multiple languages with precision and speed. We can advise you on the best workflows to use and how to leverage your existing translation assets.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Chat Panel */}
          <div className="md:w-1/3">
            <ChatBot />
          </div>

          {/* Work Area */}
          <div className="md:w-2/3 flex flex-col space-y-6">
            {showFileUpload && !showFileAnalysis && <FileUpload />}
            {showFileAnalysis && <FileAnalysis />}
            {showApiDocs && <ApiDocumentation />}
            
            {/* Show file upload by default if nothing else is shown */}
            {!showFileUpload && !showFileAnalysis && !showApiDocs && <FileUpload />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
