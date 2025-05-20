import { create } from 'zustand';
import { FileAnalysis } from '@shared/schema';

interface CalculationSummary {
  totalChars: number;
  creditsRequired: number;
  totalCost: string;
}

interface TranslationStore {
  // UI state
  showFileUpload: boolean;
  showFileAnalysis: boolean;
  showApiDocs: boolean;
  
  // Data
  fileAnalysis: FileAnalysis | null;
  selectedLanguages: string[];
  selectedWorkflow: string | null;
  showWorkflowSelection: boolean;
  calculationSummary: CalculationSummary | null;
  showCalculationMessage: boolean;
  
  // Actions
  setShowFileUpload: (show: boolean) => void;
  setShowFileAnalysis: (show: boolean) => void;
  setShowApiDocs: (show: boolean) => void;
  setFileAnalysis: (analysis: FileAnalysis) => void;
  setSelectedLanguages: (languages: string[] | ((prev: string[]) => string[])) => void;
  setSelectedWorkflow: (workflow: string | null) => void;
  setShowWorkflowSelection: (show: boolean) => void;
  setCalculationSummary: (summary: CalculationSummary | null) => void;
  setShowCalculationMessage: (show: boolean) => void;
  reset: () => void;
}

export const useTranslationStore = create<TranslationStore>((set) => ({
  // Initial UI state
  showFileUpload: false,
  showFileAnalysis: false,
  showApiDocs: false,
  
  // Initial data
  fileAnalysis: null,
  selectedLanguages: [],
  selectedWorkflow: null,
  showWorkflowSelection: false,
  calculationSummary: null,
  showCalculationMessage: false,
  
  // Actions
  setShowFileUpload: (show) => set({ showFileUpload: show }),
  setShowFileAnalysis: (show) => set({ showFileAnalysis: show }),
  setShowApiDocs: (show) => set({ showApiDocs: show }),
  setFileAnalysis: (analysis) => set({ fileAnalysis: analysis }),
  setSelectedLanguages: (languages) => set((state) => ({ 
    selectedLanguages: typeof languages === 'function' 
      ? languages(state.selectedLanguages) 
      : languages 
  })),
  setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
  setShowWorkflowSelection: (show) => set({ showWorkflowSelection: show }),
  setCalculationSummary: (summary) => set({ calculationSummary: summary }),
  setShowCalculationMessage: (show) => set({ showCalculationMessage: show }),
  reset: () => set({
    showFileUpload: false,
    showFileAnalysis: false,
    showApiDocs: false,
    fileAnalysis: null,
    selectedLanguages: [],
    selectedWorkflow: null,
    showWorkflowSelection: false,
    calculationSummary: null,
    showCalculationMessage: false,
  }),
}));
