import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslationStore } from "@/hooks/useTranslationStore";
import { Send, Upload, FileText } from "lucide-react";

interface Message {
  id: string;
  type: "bot" | "user";
  text: string;
  options?: Array<{
    value: string;
    label: string;
    action: () => void;
  }>;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { 
    fileAnalysis, 
    showFileAnalysis, 
    showFileUpload, 
    showApiDocs, 
    setShowFileUpload, 
    setShowApiDocs,
    selectedLanguages,
    calculationSummary
  } = useTranslationStore();
  
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Initial bot message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        text: "Welcome to TranslateNow! I'm here to help you with your translation request. How would you like to proceed?",
        options: [
          { 
            value: "upload", 
            label: "Upload a file for translation", 
            action: () => {
              setShowFileUpload(true);
              setShowApiDocs(false);
              addMessage("user", "I'd like to upload a file for translation.");
            }
          },
          { 
            value: "api", 
            label: "Access API documentation", 
            action: () => {
              setShowApiDocs(true);
              setShowFileUpload(false);
              addMessage("user", "I'd like to access the API documentation.");
            }
          }
        ]
      }
    ]);
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Add new file upload instructions when file upload is shown
  useEffect(() => {
    if (showFileUpload) {
      addMessage("bot", "Great! Please upload your file using the panel on the right. I'll analyze it and help you select target languages.\n\nSupported formats: PDF, DOCX, XLSX, PPTX, TXT, HTML");
    }
  }, [showFileUpload]);

  // Add new file analysis message when analysis is completed
  useEffect(() => {
    if (fileAnalysis && showFileAnalysis) {
      addMessage("bot", 
        `I've analyzed your file. Here's what I found:\n\n` +
        `File Format: ${fileAnalysis.fileFormat}\n` +
        `File Size: ${formatFileSize(fileAnalysis.fileSize)}\n` +
        `Word Count: ${fileAnalysis.wordCount.toLocaleString()} words\n` +
        `Character Count: ${fileAnalysis.charCount.toLocaleString()} characters\n` +
        `Images with Text: ${fileAnalysis.imagesWithText} detected\n` +
        `Source Language: ${fileAnalysis.sourceLanguage}\n` +
        `Subject Matter: ${fileAnalysis.subjectMatter}\n\n` +
        `Please select your target languages in the panel.`
      );
    }
  }, [fileAnalysis, showFileAnalysis]);

  // Add calculation summary message when languages are selected
  useEffect(() => {
    if (calculationSummary && selectedLanguages.length > 0) {
      addMessage("bot", 
        `Based on your selections, here's the translation summary:\n\n` +
        `Target Languages: ${selectedLanguages.join(", ")}\n` +
        `Characters per Language: ${fileAnalysis?.charCount.toLocaleString()}\n` +
        `Total Characters: ${calculationSummary.totalChars.toLocaleString()}\n` +
        `Credits Required: ${calculationSummary.creditsRequired.toLocaleString()} (1 credit per character)\n` +
        `Total Cost: ${calculationSummary.totalCost}\n`
      );
    }
  }, [calculationSummary, selectedLanguages]);

  // Add API docs message when API is selected
  useEffect(() => {
    if (showApiDocs) {
      addMessage("bot", "You can use our API to submit translation requests programmatically. Check the documentation panel for details on how to authenticate and use our endpoints.");
    }
  }, [showApiDocs]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const addMessage = (type: "bot" | "user", text: string, options?: Message["options"]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      text,
      options
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    addMessage("user", inputValue);
    setInputValue("");
    
    // Simple bot response - in a real app, this would be more sophisticated
    setTimeout(() => {
      addMessage("bot", "I'm here to help with your translation needs. How can I assist you further?");
    }, 1000);
  };

  const handleOptionClick = (action: () => void) => {
    action();
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden flex flex-col h-[calc(100vh-5rem)]">
      <div className="p-4 border-b border-border bg-muted">
        <h2 className="text-lg font-semibold text-foreground">Translation Assistant</h2>
        <p className="text-sm text-muted-foreground">I'll guide you through your translation request</p>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4" 
        ref={chatMessagesRef}
      >
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex items-start space-x-2 ${message.type === 'user' ? 'justify-end' : ''}`}
          >
            {message.type === 'bot' && (
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
            )}
            
            <div 
              className={`rounded-lg p-3 max-w-[85%] ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              
              {message.options && message.options.length > 0 && (
                <div className="mt-3 flex flex-col space-y-2">
                  {message.options.map(option => (
                    <Button
                      key={option.value}
                      variant="outline"
                      className="justify-start h-auto py-2 px-3 text-left hover:bg-accent dark:hover:bg-accent"
                      onClick={() => handleOptionClick(option.action)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            {message.type === 'user' && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground"
          />
          <Button type="submit" size="icon" className="bg-primary rounded-lg text-primary-foreground hover:bg-primary/90">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;
