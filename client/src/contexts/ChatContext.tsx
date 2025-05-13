import { createContext, useContext } from 'react';

interface ChatContextType {
  addCalculationMessage: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}