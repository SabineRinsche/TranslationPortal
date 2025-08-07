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
import { Brain, Cpu, Sparkles, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// Remove ChatContext dependency

interface LanguageOption {
  value: string;
  label: string;
}

// Full list of memoQ supported languages
const languages: LanguageOption[] = [
  { value: 'Albanian', label: 'Albanian' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Armenian', label: 'Armenian' },
  { value: 'Azerbaijani', label: 'Azerbaijani' },
  { value: 'Basque', label: 'Basque' },
  { value: 'Belarusian', label: 'Belarusian' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Bosnian', label: 'Bosnian' },
  { value: 'Bulgarian', label: 'Bulgarian' },
  { value: 'Catalan', label: 'Catalan' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Croatian', label: 'Croatian' },
  { value: 'Czech', label: 'Czech' },
  { value: 'Danish', label: 'Danish' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'English', label: 'English' },
  { value: 'Estonian', label: 'Estonian' },
  { value: 'Finnish', label: 'Finnish' },
  { value: 'French', label: 'French' },
  { value: 'Galician', label: 'Galician' },
  { value: 'Georgian', label: 'Georgian' },
  { value: 'German', label: 'German' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Hebrew', label: 'Hebrew' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Hungarian', label: 'Hungarian' },
  { value: 'Icelandic', label: 'Icelandic' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'Irish', label: 'Irish' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Kazakh', label: 'Kazakh' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Latvian', label: 'Latvian' },
  { value: 'Lithuanian', label: 'Lithuanian' },
  { value: 'Macedonian', label: 'Macedonian' },
  { value: 'Malay', label: 'Malay' },
  { value: 'Maltese', label: 'Maltese' },
  { value: 'Norwegian', label: 'Norwegian' },
  { value: 'Persian', label: 'Persian' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Romanian', label: 'Romanian' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Serbian', label: 'Serbian' },
  { value: 'Slovak', label: 'Slovak' },
  { value: 'Slovenian', label: 'Slovenian' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Swedish', label: 'Swedish' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Ukrainian', label: 'Ukrainian' },
  { value: 'Urdu', label: 'Urdu' },
  { value: 'Vietnamese', label: 'Vietnamese' },
  { value: 'Welsh', label: 'Welsh' },
];

// Define language groups for quick selection
interface LanguageGroup {
  name: string;
  languages: string[];
}

const languageGroups: LanguageGroup[] = [
  { 
    name: 'FIGS', 
    languages: ['French', 'Italian', 'German', 'Spanish'] 
  },
  { 
    name: 'EFIGS', 
    languages: ['English', 'French', 'Italian', 'German', 'Spanish'] 
  },
  { 
    name: 'Western European', 
    languages: ['Dutch', 'English', 'French', 'German', 'Italian', 'Portuguese', 'Spanish'] 
  },
  { 
    name: 'Eastern European', 
    languages: ['Bulgarian', 'Czech', 'Hungarian', 'Polish', 'Romanian', 'Russian', 'Slovak', 'Ukrainian'] 
  },
  { 
    name: 'Asian Languages', 
    languages: ['Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese'] 
  },
  { 
    name: 'Nordic', 
    languages: ['Danish', 'Finnish', 'Icelandic', 'Norwegian', 'Swedish'] 
  },
];

const FileAnalysis = () => {
  // Define available translation workflows
  const workflows = [
    { 
      id: 'ai-translation', 
      name: 'Automated AI Translation only', 
      description: 'Automated translation workflow, which leverages your translation assets and our state of the art AI enabled translation systems.',
      icon: <Brain className="h-5 w-5 text-blue-500" />
    },
    { 
      id: 'ai-translation-qc', 
      name: 'Automated AI Translation, followed by LQE', 
      description: 'The automated translation workflow is enhanced with an automated LQE (language quality evaluation) step, to provide guidance on quality achieved by the automated translation process. This allows you to decide if the workflow needs further improvement for your content types and language pairs.',
      icon: <Cpu className="h-5 w-5 text-purple-500" />
    },
    { 
      id: 'ai-translation-human', 
      name: 'Automated AI Translation, LQE and Human review', 
      description: 'Following automated translation, the automated LQE will decide which segments should be reviewed by a human to improve quality. Human reviews allow the system to learn by enhancing your translation assets, and improve quality further in the future.',
      icon: <Sparkles className="h-5 w-5 text-yellow-500" />
    },
  ];
  
  const { 
    fileAnalysis, 
    selectedLanguages, 
    setSelectedLanguages,
    selectedWorkflow,
    setSelectedWorkflow,
    calculationSummary,
    setCalculationSummary,
    setShowCalculationMessage
  } = useTranslationStore();
  const { toast } = useToast();

  const calculateTranslation = () => {
    if (!fileAnalysis || !selectedWorkflow) return;
    
    const charsPerLanguage = fileAnalysis.characterCount;
    const totalChars = charsPerLanguage * selectedLanguages.length;
    
    // Apply credit requirements based on workflow type
    let creditsPerChar = 1; // Base rate: 1 credit per character
    if (selectedWorkflow === 'ai-translation-qc') {
      creditsPerChar = 2; // 2 credits per character for Quality Assurance
    } else if (selectedWorkflow === 'ai-translation-human') {
      creditsPerChar = 3; // 3 credits per character for Expert Review
    }
    
    const creditsRequired = Math.ceil(totalChars * creditsPerChar);
    const costInPounds = creditsRequired * 0.001; // 1 credit = £0.001
    
    setCalculationSummary({
      totalChars,
      creditsRequired,
      totalCost: `£${costInPounds.toFixed(2)}`
    });
  };

  // Step management
  const [showCalculation, setShowCalculation] = useState(false);
  const [showWorkflowStep, setShowWorkflowStep] = useState(false);
  
  const handleCompleteLanguageSelection = () => {
    if (selectedLanguages.length > 0 && fileAnalysis) {
      setShowWorkflowStep(true);
    } else {
      toast({
        title: "Selection required",
        description: "Please select at least one target language.",
        variant: "destructive",
      });
    }
  };
  
  const handleCompleteWorkflowSelection = () => {
    if (selectedWorkflow && fileAnalysis) {
      calculateTranslation();
      setShowCalculation(true);
      
      // Trigger the chat message - no need for additional toast since info is displayed in the summary
      setShowCalculationMessage(true);
    } else {
      toast({
        title: "Selection required",
        description: "Please select a workflow for your translation.",
        variant: "destructive",
      });
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!fileAnalysis || !calculationSummary) {
        throw new Error("Missing file analysis or calculation");
      }
      
      // We don't need to explicitly add userId as the server will add it from the authenticated user
      // But for TypeScript, we need to cast it to satisfy the type check
      // We'll create a partial object and cast to the type to avoid TypeScript errors
      // The server will handle adding any missing required fields like userId
      const translationRequest: Partial<InsertTranslationRequest> = {
        fileName: fileAnalysis.fileName,
        fileFormat: fileAnalysis.fileFormat,
        fileSize: fileAnalysis.fileSize,
        wordCount: fileAnalysis.wordCount,
        characterCount: fileAnalysis.characterCount,
        imagesWithText: fileAnalysis.imagesWithText,
        subjectMatter: fileAnalysis.subjectMatter,
        sourceLanguage: fileAnalysis.sourceLanguage,
        targetLanguages: selectedLanguages,
        workflow: selectedWorkflow,
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
      setSelectedLanguages((prev: string[]) => [...prev, language]);
    } else {
      setSelectedLanguages((prev: string[]) => prev.filter((lang: string) => lang !== language));
    }
  };
  
  // Add function to handle language group selection
  const handleLanguageGroupSelection = (group: LanguageGroup) => {
    // Get list of currently selected languages
    const currentlySelected = [...selectedLanguages];
    
    // Check if all languages in the group are already selected
    const allSelected = group.languages.every(lang => currentlySelected.includes(lang));
    
    if (allSelected) {
      // If all are selected, deselect the entire group
      setSelectedLanguages((prev: string[]) => 
        prev.filter(lang => !group.languages.includes(lang))
      );
    } else {
      // Otherwise, add any missing languages from the group
      const newSelection = [...currentlySelected];
      
      group.languages.forEach(lang => {
        if (!newSelection.includes(lang)) {
          newSelection.push(lang);
        }
      });
      
      setSelectedLanguages(newSelection);
    }
  };

  if (!fileAnalysis) return null;

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-card-foreground">File Analysis</h2>
        <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">
          Analysis Complete
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">File Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">File Name:</span>
              <span className="font-medium text-card-foreground">{fileAnalysis.fileName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">File Format:</span>
              <span className="font-medium text-card-foreground">{fileAnalysis.fileFormat}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">File Size:</span>
              <span className="font-medium text-card-foreground">
                {fileAnalysis.fileSize < 1024 
                  ? `${fileAnalysis.fileSize} B` 
                  : fileAnalysis.fileSize < 1024 * 1024 
                    ? `${(fileAnalysis.fileSize / 1024).toFixed(1)} KB` 
                    : `${(fileAnalysis.fileSize / (1024 * 1024)).toFixed(1)} MB`
                }
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Content Analysis</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Word Count:</span>
              <span className="font-medium text-card-foreground">{fileAnalysis.wordCount.toLocaleString()} words</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Character Count:</span>
              <span className="font-medium text-card-foreground">{fileAnalysis.characterCount.toLocaleString()} chars</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Images with Text:</span>
              <span className="font-medium text-card-foreground">{fileAnalysis.imagesWithText} detected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source Language:</span>
              <span className="font-medium text-card-foreground">
                {fileAnalysis.sourceLanguage}
                <Badge variant="outline" className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs">
                  Auto-detected
                </Badge>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subject Matter:</span>
              <span className="font-medium text-card-foreground">
                {fileAnalysis.subjectMatter}
                <Badge variant="outline" className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs">
                  Auto-detected
                </Badge>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-card-foreground mb-3">Select Target Languages</h3>
        
        {/* Language Groups Section */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Language Groups</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {languageGroups.map((group) => {
              const allSelected = group.languages.every(lang => selectedLanguages.includes(lang));
              const someSelected = group.languages.some(lang => selectedLanguages.includes(lang));
              
              return (
                <button
                  key={group.name}
                  onClick={() => handleLanguageGroupSelection(group)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    allSelected 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : someSelected
                        ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground border border-border'
                  }`}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Individual Languages Section */}
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Individual Languages</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 max-h-60 overflow-y-auto pr-1">
          {languages.map((language) => (
            <label 
              key={language.value}
              className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/70 cursor-pointer"
            >
              <Checkbox 
                id={`lang-${language.value}`} 
                checked={Array.isArray(selectedLanguages) && selectedLanguages.includes(language.value)}
                onCheckedChange={(checked) => 
                  handleLanguageChange(language.value, checked as boolean)
                }
              />
              <span className="text-sm text-muted-foreground">{language.label}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-4">
          {!showWorkflowStep && !showCalculation ? (
            <Button 
              className="w-full py-2" 
              onClick={handleCompleteLanguageSelection}
            >
              Continue to Workflow Selection
            </Button>
          ) : showWorkflowStep && !showCalculation ? (
            <>
              <h3 className="text-sm font-medium mb-2">Select Translation Workflow</h3>
              <TooltipProvider>
                <div className="space-y-3 mb-4">
                  {workflows.map((workflow) => (
                    <div 
                      key={workflow.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedWorkflow === workflow.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/30'
                      }`}
                      onClick={() => setSelectedWorkflow(workflow.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{workflow.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{workflow.name}</h4>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{workflow.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipProvider>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="flex-1 py-2" 
                  onClick={() => {
                    setShowWorkflowStep(false);
                    setSelectedWorkflow(null);
                  }}
                >
                  Back to Languages
                </Button>
                <Button 
                  className="flex-1 py-2" 
                  onClick={handleCompleteWorkflowSelection}
                >
                  Calculate Translation
                </Button>
              </div>
            </>
          ) : calculationSummary && (
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-card-foreground mb-2">Translation Summary</h3>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Languages:</span>
                  <span className="font-medium text-card-foreground">{selectedLanguages.join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workflow:</span>
                  <span className="font-medium text-card-foreground">
                    {workflows.find(w => w.id === selectedWorkflow)?.name || 'Standard Translation'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Characters:</span>
                  <span className="font-medium text-card-foreground">{calculationSummary.totalChars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits Required:</span>
                  <span className="font-medium text-card-foreground">{calculationSummary.creditsRequired.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cost:</span>
                  <span className="font-medium text-card-foreground">{calculationSummary.totalCost}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="flex-1 py-2" 
                  onClick={() => {
                    setShowCalculation(false);
                    setShowWorkflowStep(true);
                  }}
                >
                  Edit Selection
                </Button>
                <Button 
                  className="flex-1 py-2" 
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileAnalysis;
