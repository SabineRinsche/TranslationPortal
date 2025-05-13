import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslationStore } from '@/hooks/useTranslationStore';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { InsertTranslationRequest } from '@shared/schema';

interface LanguageOption {
  value: string;
  label: string;
}

const languages: LanguageOption[] = [
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Hindi', label: 'Hindi' },
];

const FileAnalysis = () => {
  const { 
    fileAnalysis, 
    selectedLanguages, 
    setSelectedLanguages,
    calculationSummary,
    setCalculationSummary
  } = useTranslationStore();
  const { toast } = useToast();

  const calculateTranslation = () => {
    if (!fileAnalysis) return;
    
    const charsPerLanguage = fileAnalysis.charCount;
    const totalChars = charsPerLanguage * selectedLanguages.length;
    const creditsRequired = totalChars; // 1 character = 1 credit
    const costInPounds = totalChars * 0.01; // 1 character = £0.01
    
    setCalculationSummary({
      totalChars,
      creditsRequired,
      totalCost: `£${costInPounds.toFixed(2)}`
    });
  };

  // Recalculate when selected languages change
  useEffect(() => {
    if (selectedLanguages.length > 0 && fileAnalysis) {
      calculateTranslation();
    } else {
      setCalculationSummary(null);
    }
  }, [selectedLanguages, fileAnalysis]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!fileAnalysis || !calculationSummary) {
        throw new Error("Missing file analysis or calculation");
      }
      
      const translationRequest: InsertTranslationRequest = {
        fileName: fileAnalysis.fileName,
        fileFormat: fileAnalysis.fileFormat,
        fileSize: fileAnalysis.fileSize,
        wordCount: fileAnalysis.wordCount,
        charCount: fileAnalysis.charCount,
        imagesWithText: fileAnalysis.imagesWithText,
        subjectMatter: fileAnalysis.subjectMatter,
        sourceLanguage: fileAnalysis.sourceLanguage,
        targetLanguages: selectedLanguages,
        creditsRequired: calculationSummary.creditsRequired,
        totalCost: calculationSummary.totalCost,
      };
      
      return await apiRequest('POST', '/api/translation-requests', translationRequest);
    },
    onSuccess: () => {
      toast({
        title: "Request submitted successfully",
        description: "Your translation request has been submitted. We'll process it shortly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit request",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    submitMutation.mutate();
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    if (checked) {
      setSelectedLanguages(prev => [...prev, language]);
    } else {
      setSelectedLanguages(prev => prev.filter(lang => lang !== language));
    }
  };

  if (!fileAnalysis) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">File Analysis</h2>
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          Analysis Complete
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">File Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">File Name:</span>
              <span className="font-medium text-slate-800">{fileAnalysis.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">File Format:</span>
              <span className="font-medium text-slate-800">{fileAnalysis.fileFormat}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">File Size:</span>
              <span className="font-medium text-slate-800">
                {fileAnalysis.fileSize < 1024 
                  ? `${fileAnalysis.fileSize} B` 
                  : fileAnalysis.fileSize < 1024 * 1024 
                    ? `${(fileAnalysis.fileSize / 1024).toFixed(1)} KB` 
                    : `${(fileAnalysis.fileSize / (1024 * 1024)).toFixed(1)} MB`
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Subject Matter:</span>
              <span className="font-medium text-slate-800">{fileAnalysis.subjectMatter}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Content Analysis</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Word Count:</span>
              <span className="font-medium text-slate-800">{fileAnalysis.wordCount.toLocaleString()} words</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Character Count:</span>
              <span className="font-medium text-slate-800">{fileAnalysis.charCount.toLocaleString()} chars</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Images with Text:</span>
              <span className="font-medium text-slate-800">{fileAnalysis.imagesWithText} detected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Source Language:</span>
              <span className="font-medium text-slate-800">{fileAnalysis.sourceLanguage}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-3">Select Target Languages</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {languages.map((language) => (
            <label 
              key={language.value}
              className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <Checkbox 
                id={`lang-${language.value}`} 
                checked={Array.isArray(selectedLanguages) && selectedLanguages.includes(language.value)}
                onCheckedChange={(checked) => 
                  handleLanguageChange(language.value, checked as boolean)
                }
              />
              <span className="text-sm">{language.label}</span>
            </label>
          ))}
        </div>
        
        {calculationSummary && (
          <div className="mt-4 bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Translation Summary</h3>
            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Selected Languages:</span>
                <span className="font-medium text-slate-800">{selectedLanguages.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Characters:</span>
                <span className="font-medium text-slate-800">{calculationSummary.totalChars.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Credits Required:</span>
                <span className="font-medium text-slate-800">{calculationSummary.creditsRequired.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Cost:</span>
                <span className="font-medium text-slate-800">{calculationSummary.totalCost}</span>
              </div>
            </div>
            <Button 
              className="w-full py-2" 
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Translation Request"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileAnalysis;
