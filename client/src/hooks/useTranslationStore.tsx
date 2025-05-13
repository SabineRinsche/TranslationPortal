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
  calculationSummary: CalculationSummary | null;
  
  // Actions
  setShowFileUpload: (show: boolean) => void;
  setShowFileAnalysis: (show: boolean) => void;
  setShowApiDocs: (show: boolean) => void;
  setFileAnalysis: (analysis: FileAnalysis) => void;
  setSelectedLanguages: (languages: string[] | ((prev: string[]) => string[])) => void;
  setCalculationSummary: (summary: CalculationSummary | null) => void;
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
  calculationSummary: null,
  
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
  setCalculationSummary: (summary) => set({ calculationSummary: summary }),
  reset: () => set({
    showFileUpload: false,
    showFileAnalysis: false,
    showApiDocs: false,
    fileAnalysis: null,
    selectedLanguages: [],
    calculationSummary: null,
  }),
}));
