import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslationStore } from "@/hooks/useTranslationStore";
import { Send, FileText, HelpCircle, Image, Upload, Globe, Download, Zap, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  type: "bot" | "user";
  text: string;
  isTyping?: boolean;  // For typing animation
  emoji?: string;      // Optional emoji to display
  options?: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode; // Icon for option
    action: () => void;
  }>;
}

// Common questions and predefined answers
const commonQuestions = [
  {
    patterns: ["hello", "hi", "hey", "greetings"],
    response: "Hello! How can I assist with your translation needs today? 👋",
    suggestions: ["What languages do you support?", "How much does translation cost?", "Tell me about your AI"]
  },
  {
    patterns: ["language", "languages", "support", "translate"],
    response: "We support translation between 100+ languages including English, Spanish, French, German, Chinese, Japanese, and many more! 🌐",
    suggestions: ["Which languages are most popular?", "Can you translate specialized content?"]
  },
  {
    patterns: ["cost", "price", "pricing", "expensive", "cheap"],
    response: "Our pricing is straightforward: £0.01 per character, with potential workflow adjustments. Volume discounts are available for large projects! 💰",
    suggestions: ["Tell me about subscription options", "How are credits calculated?"]
  },
  {
    patterns: ["ai", "technology", "machine", "neural", "how does it work"],
    response: "Our AI translation uses advanced neural networks trained on billions of documents across domains. We combine machine learning with specialized language models for context-aware translations! ✨",
    suggestions: ["How accurate is the AI?", "Do you offer human review?"]
  },
  {
    patterns: ["help", "support", "assist", "contact"],
    response: "Need help? Our support team is available 24/7. You can also email support@alpha-ai.com or call +44 1234 567890 for immediate assistance. 🤝",
    suggestions: ["What file formats do you support?", "How long does translation take?"]
  },
  {
    patterns: ["format", "file", "document", "types"],
    response: "We support many file formats including PDF, DOCX, XLSX, PPTX, TXT, HTML, and ZIP archives. Our system preserves formatting during translation! 📄",
    suggestions: ["What about images with text?", "Maximum file size?"]
  },
  {
    patterns: ["time", "long", "duration", "turnaround", "fast"],
    response: "Translation time depends on volume and complexity. Small documents (under 1000 words) are typically ready within hours, while larger projects may take 1-2 business days. ⏱️",
    suggestions: ["Do you offer rush service?", "How do I check status?"]
  }
];

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
    calculationSummary,
    showCalculationMessage,
    setShowCalculationMessage
  } = useTranslationStore();
  
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Initial bot message with enhanced options and icons
  useEffect(() => {
    // Delay the welcome message slightly for a more natural feel
    setTimeout(() => {
      addMessage(
        "bot",
        "Welcome to Alpha's AI Translation Service! I'm here to help you with your translation request. How would you like to proceed?",
        [
          { 
            value: "upload", 
            label: "Upload a file for translation",
            icon: <Upload className="h-4 w-4 mr-2" />,
            action: () => {
              // First record the user's message
              addMessage("user", "I'd like to upload a file for translation.");
              
              // Then update the states
              useTranslationStore.setState({
                showFileUpload: true,
                showApiDocs: false,
                uploadOption: "translation"
              });
            }
          },
          { 
            value: "assets", 
            label: "Upload translation assets",
            icon: <FileText className="h-4 w-4 mr-2" />,
            action: () => {
              // First record the user's message
              addMessage("user", "I'd like to upload translation assets.");
              
              // Then update the states
              useTranslationStore.setState({
                showFileUpload: true,
                showApiDocs: false,
                uploadOption: "assets"
              });
            }
          },
          { 
            value: "api", 
            label: "Access API documentation",
            icon: <Globe className="h-4 w-4 mr-2" />,
            action: () => {
              // First record the user's message
              addMessage("user", "I'd like to access the API documentation.");
              
              // Then update the states
              useTranslationStore.setState({
                showApiDocs: true,
                showFileUpload: false
              });
            }
          },
          {
            value: "help",
            label: "What can you help me with?",
            icon: <HelpCircle className="h-4 w-4 mr-2" />,
            action: () => {
              addMessage("user", "What can you help me with?");
              showCapabilities();
            }
          }
        ]
      );
    }, 500);
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Track when to show specialized upload messages
  const uploadOption = useTranslationStore(state => state.uploadOption);
  const [hasShownUploadMessage, setHasShownUploadMessage] = useState(false);
  
  // Track when file upload panel is shown
  useEffect(() => {
    // Only track changes in showFileUpload
    if (!showFileUpload) {
      setHasShownUploadMessage(false);
    }
  }, [showFileUpload]);
  
  // Add appropriate upload message when upload option changes
  useEffect(() => {
    if (showFileUpload && !hasShownUploadMessage && uploadOption) {
      setHasShownUploadMessage(true);
      
      if (uploadOption === "assets") {
        addMessage("bot", "Please upload your translation assets using the panel on the right. You can upload translation memories, bilingual files, glossaries, reference materials, style guides, or any other supporting documents that will help with your translation.\n\nSupported formats: PDF, DOCX, XLSX, PPTX, TXT, HTML, ZIP");
      } else if (uploadOption === "translation") {
        addMessage("bot", "Great! Please upload your file using the panel on the right. I'll analyze it and help you select target languages.\n\nSupported formats: PDF, DOCX, XLSX, PPTX, TXT, HTML");
      }
    }
  }, [uploadOption, hasShownUploadMessage, showFileUpload]);
  
  // Track file uploads for translation assets
  const [hasUploadedAssets, setHasUploadedAssets] = useState(false);
  
  // After file upload, check if it was for translation assets and show confirmation
  useEffect(() => {
    if (fileAnalysis && uploadOption === "assets" && !hasUploadedAssets) {
      setHasUploadedAssets(true);
      
      // Clear file analysis panel
      setTimeout(() => {
        // Reset the file upload panel
        useTranslationStore.setState({ 
          showFileUpload: false,
          fileAnalysis: null,
          showFileAnalysis: false
        });
        
        // Show thank you message
        addMessage("bot", 
          "Thank you for uploading your translation assets! Our AI Translation team will be in touch soon to discuss how we can best leverage these assets to enhance your translation workflow.", 
          [
            {
              value: "upload-file",
              label: "Upload a translation file instead",
              icon: <Upload className="h-4 w-4 mr-2" />,
              action: () => {
                addMessage("user", "I'd like to upload a file for translation instead.");
                
                // Update the store directly
                useTranslationStore.setState({
                  showFileUpload: true,
                  showApiDocs: false,
                  uploadOption: "translation"
                });
                
                setHasShownUploadMessage(false);
              }
            }
          ]
        );
      }, 1500);
    }
  }, [fileAnalysis, uploadOption, hasUploadedAssets]);

  // Analysis completed message without redundant details
  useEffect(() => {
    if (fileAnalysis && showFileAnalysis) {
      addMessage("bot", 
        `Your file has been analyzed successfully. Please select your target languages in the panel to continue.`
      );
    }
  }, [fileAnalysis, showFileAnalysis]);

  // Add calculation summary message when showCalculationMessage is true
  useEffect(() => {
    if (showCalculationMessage && calculationSummary && selectedLanguages.length > 0 && fileAnalysis) {
      addMessage("bot", 
        `Based on your selections, here's the translation summary:\n\n` +
        `Target Languages: ${selectedLanguages.join(", ")}\n` +
        `Characters per Language: ${fileAnalysis.charCount.toLocaleString()}\n` +
        `Total Characters: ${calculationSummary.totalChars.toLocaleString()}\n` +
        `Credits Required: ${calculationSummary.creditsRequired.toLocaleString()} (1 credit per character)\n` +
        `Total Cost: ${calculationSummary.totalCost}\n`
      );
      // Reset the flag after showing the message
      setShowCalculationMessage(false);
    }
  }, [showCalculationMessage, calculationSummary, selectedLanguages, fileAnalysis]);

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

  // Enhanced message adding with typing animation
  const addMessage = (type: "bot" | "user", text: string, options?: Message["options"], emoji?: string) => {
    // Use a combination of timestamp and a random string to ensure truly unique IDs
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newMessage: Message = {
      id: uniqueId,
      type,
      text,
      options,
      emoji
    };
    
    if (type === "bot") {
      // First add a typing indicator
      const typingMessage: Message = {
        id: `typing-${uniqueId}`,
        type: "bot",
        text: "",
        isTyping: true
      };
      
      setMessages(prev => [...prev, typingMessage]);
      
      // Calculate a realistic typing delay based on message length
      const typingDelay = Math.min(1000, Math.max(500, text.length * 15));
      
      // Then replace it with the actual message after the delay
      setTimeout(() => {
        setMessages(prev => 
          prev.map(m => 
            m.id === typingMessage.id ? newMessage : m
          )
        );
      }, typingDelay);
    } else {
      // User messages appear immediately
      setMessages(prev => [...prev, newMessage]);
    }
  };

  // Find the best matching response for a user query
  const findBestResponse = (query: string): {response: string, suggestions: string[]} | null => {
    const normalizedQuery = query.toLowerCase();
    
    for (const question of commonQuestions) {
      // Check if the query contains any of the patterns
      if (question.patterns.some(pattern => normalizedQuery.includes(pattern))) {
        return {
          response: question.response,
          suggestions: question.suggestions
        };
      }
    }
    
    // If no match, return null
    return null;
  };

  // Generate quick reply options from suggestions
  const createQuickReplies = (suggestions: string[]) => {
    return suggestions.map(suggestion => ({
      value: suggestion.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      label: suggestion,
      action: () => {
        addMessage("user", suggestion);
        handleBotResponse(suggestion);
      }
    }));
  };

  // Handle the bot's response to user input
  const handleBotResponse = (userInput: string) => {
    // Try to find a matching predefined response
    const matchedResponse = findBestResponse(userInput);
    
    if (matchedResponse) {
      // If we have a match, use it with quick replies
      addMessage(
        "bot", 
        matchedResponse.response,
        createQuickReplies(matchedResponse.suggestions)
      );
    } else {
      // Default response for unrecognized queries
      addMessage(
        "bot", 
        "I'm here to help with your translation needs. How can I assist you further?",
        [
          {
            value: "help",
            label: "Show me what you can do",
            icon: <HelpCircle className="h-4 w-4 mr-2" />,
            action: () => {
              addMessage("user", "Show me what you can do");
              showCapabilities();
            }
          },
          {
            value: "upload",
            label: "Upload a file for translation",
            icon: <Upload className="h-4 w-4 mr-2" />,
            action: () => {
              addMessage("user", "I'd like to upload a file for translation.");
              
              // Update the store directly
              useTranslationStore.setState({
                showFileUpload: true,
                showApiDocs: false,
                uploadOption: "translation"
              });
            }
          }
        ]
      );
    }
  };

  // Show a message detailing what the chatbot can do
  const showCapabilities = () => {
    addMessage(
      "bot",
      "I can help you with many translation-related tasks! Here are some things you can ask me about:",
      [
        {
          value: "languages",
          label: "Languages we support",
          icon: <Globe className="h-4 w-4 mr-2" />,
          action: () => {
            addMessage("user", "What languages do you support?");
            handleBotResponse("languages");
          }
        },
        {
          value: "pricing",
          label: "Pricing information",
          icon: <Download className="h-4 w-4 mr-2" />,
          action: () => {
            addMessage("user", "How much does translation cost?");
            handleBotResponse("pricing");
          }
        },
        {
          value: "tech",
          label: "Our AI technology",
          icon: <Zap className="h-4 w-4 mr-2" />,
          action: () => {
            addMessage("user", "Tell me about your AI");
            handleBotResponse("ai");
          }
        },
        {
          value: "formats",
          label: "Supported file formats",
          icon: <FileText className="h-4 w-4 mr-2" />,
          action: () => {
            addMessage("user", "What file formats do you support?");
            handleBotResponse("format");
          }
        }
      ]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userInput = inputValue;
    addMessage("user", userInput);
    setInputValue("");
    
    // Process the user's input and generate a response
    handleBotResponse(userInput);
  };

  const handleOptionClick = (action: () => void) => {
    action();
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden flex flex-col h-[calc(100vh-5rem)]">
      <div className="p-4 border-b border-border bg-muted">
        <h2 className="text-lg font-semibold text-foreground">Alpha's AI Assistant</h2>
        <p className="text-sm text-muted-foreground">I'll guide you through your translation request and help optimize your workflow</p>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4" 
        ref={chatMessagesRef}
      >
        <AnimatePresence>
          {messages.map(message => (
            <motion.div 
              key={message.id} 
              className={`flex items-start space-x-2 ${message.type === 'user' ? 'justify-end' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {message.type === 'bot' && (
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-md">
                  <FileText className="h-5 w-5" />
                </div>
              )}
              
              <motion.div 
                className={`rounded-lg p-3 max-w-[85%] shadow-sm ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground/90'
                }`}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                {message.isTyping ? (
                  // Typing animation
                  <div className="flex items-center space-x-1 h-6">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-primary/70"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop", delay: 0 }}
                    />
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-primary/70"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop", delay: 0.15 }}
                    />
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-primary/70"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop", delay: 0.3 }}
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-line">
                      {message.emoji && <span className="mr-1">{message.emoji}</span>}
                      {message.text}
                    </p>
                    
                    {message.options && message.options.length > 0 && (
                      <div className="mt-3 flex flex-col space-y-2">
                        {message.options.map(option => (
                          <Button
                            key={option.value}
                            variant="outline"
                            className="justify-start h-auto py-2 px-3 text-left hover:bg-accent dark:hover:bg-accent group"
                            onClick={() => handleOptionClick(option.action)}
                          >
                            <div className="flex items-center w-full">
                              {option.icon}
                              <span className="flex-grow">{option.label}</span>
                              <motion.span 
                                className="opacity-0 group-hover:opacity-100 text-primary" 
                                initial={{ x: -5 }} 
                                animate={{ x: 0 }}
                                transition={{ duration: 0.2 }}
                              >→</motion.span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
              
              {message.type === 'user' && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-secondary-foreground shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        {/* Quick suggestions */}
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-accent transition-colors px-3 py-1 text-xs"
            onClick={() => {
              addMessage("user", "What languages do you support?");
              handleBotResponse("languages");
            }}
          >
            <Globe className="h-3 w-3 mr-1" />
            Languages
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-accent transition-colors px-3 py-1 text-xs"
            onClick={() => {
              addMessage("user", "How much does translation cost?");
              handleBotResponse("cost");
            }}
          >
            <Download className="h-3 w-3 mr-1" />
            Pricing
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-accent transition-colors px-3 py-1 text-xs"
            onClick={() => {
              addMessage("user", "Tell me about your AI technology");
              handleBotResponse("ai");
            }}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI Technology
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-accent transition-colors px-3 py-1 text-xs"
            onClick={() => {
              addMessage("user", "What file formats do you support?");
              handleBotResponse("format");
            }}
          >
            <FileText className="h-3 w-3 mr-1" />
            File Formats
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full border border-input rounded-lg text-sm pr-10 focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background text-foreground"
            />
            {inputValue.trim() === "" && (
              <motion.div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <HelpCircle className="h-4 w-4" />
              </motion.div>
            )}
          </div>
          <Button 
            type="submit" 
            size="icon" 
            className="bg-primary rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors"
            disabled={inputValue.trim() === ""}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;