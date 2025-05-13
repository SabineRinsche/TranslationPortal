import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { useTranslationStore } from '@/hooks/useTranslationStore';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FileAnalysis } from '@shared/schema';
import { Cloud, FileText, File } from 'lucide-react';

const FileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { setFileAnalysis, setShowFileAnalysis } = useTranslationStore();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 95 ? 95 : newProgress;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Make the actual upload request
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const fileAnalysis: FileAnalysis = await response.json();
      
      // Complete the progress animation
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Set the file analysis in the store
      setFileAnalysis(fileAnalysis);
      setShowFileAnalysis(true);

      toast({
        title: "File Upload Complete",
        description: "Your file has been analyzed successfully.",
      });
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      console.error('Upload error:', error);
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    }
  }, [setFileAnalysis, setShowFileAnalysis, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/html': ['.html'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-lg font-semibold text-card-foreground mb-2">Upload Your Document</h2>
      <p className="text-sm text-muted-foreground mb-4">Drag and drop your file or click to browse. We support multiple formats and can analyze text in images.</p>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/10 dark:bg-primary/20' 
            : 'border-muted hover:border-primary hover:bg-muted/50'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Cloud className="h-12 w-12 mx-auto text-primary" />
        ) : (
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Drag your file here, or <span className="text-primary font-medium">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Supported formats: PDF, DOCX, XLSX, PPTX, TXT, HTML
        </p>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-card-foreground">{fileName}</span>
            <span className="text-primary">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
