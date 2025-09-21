import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Mic, Send, Bot, User, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import TypingIndicator from "./typing-indicator";
import VoiceInput from "./voice-input";
import FileUpload from "./file-upload";
import RecommendExpert from "./recommend-expert";
import type { ChatMessage } from "@shared/schema";
import lottie, { AnimationItem } from "lottie-web";
import animation from "../assets/chat-bot.json"

interface LottieRobotProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  size?: "small" | "medium" | "large" | "normal";
  rounded?: boolean;
}

interface ChatInterfaceProps {
  sessionId: string;
}

const LottieRobot = ({ isListening = false, isSpeaking = false, size = "normal", rounded = false }: LottieRobotProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationInstance = useRef<AnimationItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (containerRef.current && !animationInstance.current) {
      try {
        animationInstance.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: animation,
        });
        setIsLoaded(true);
      } catch (error) {
        console.error("Could not load Lottie animation:", error);
        setIsLoaded(false);
      }
    }

    return () => {
      animationInstance.current?.destroy();
      animationInstance.current = null;
    };
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case "large":
        return "w-40 h-40";
      case "medium":
        return "w-32 h-32";
      default:
        return "w-24 h-24";
    }
  };

  return (
    <motion.div
      className={`mx-auto ${getSizeClasses()} relative aspect-square`}
      animate={
        isListening || isSpeaking
          ? { scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] }
          : { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }
      }
      transition={{
        duration: isListening || isSpeaking ? 1.5 : 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Lottie container */}
      <div
        ref={containerRef}
        className={`w-full h-full ${rounded ? 'rounded-lg' : 'rounded-full'}`}
        style={{
          filter: isListening
            ? "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))"
            : isSpeaking
              ? "drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))"
              : "drop-shadow(0 0 15px rgba(147, 51, 234, 0.3))",
        }}
      />

      {/* Fallback Bot icon */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Bot
            className={`${size === "large"
              ? "w-20 h-20"
              : size === "medium"
                ? "w-16 h-16"
                : "w-12 h-12"
              } text-blue-500`}
          />
        </div>
      )}

      {(isListening || isSpeaking) && (
        <>
          <motion.div
            className={`absolute inset-0 ${isListening ? (rounded ? 'rounded-lg' : 'rounded-full') : 'rounded-full'} border ${isListening ? "border-blue-400/40" : "border-green-400/40"
              }`}
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.2, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className={`absolute inset-0 ${isListening ? (rounded ? 'rounded-lg' : 'rounded-full') : 'rounded-full'} border ${isListening ? "border-blue-300/20" : "border-green-300/20"
              }`}
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}
    </motion.div>
  );
};

// Enhanced Waveform for voice input
const Waveform = () => {
  const bars = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center space-x-1 h-16 mb-6">
      {bars.map((bar) => (
        <motion.div
          key={bar}
          className="w-1.5 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full"
          animate={{
            height: [8, 32, 16, 40, 12],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: bar * 0.1,
            ease: "easeInOut"
          }}
          style={{
            filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))'
          }}
        />
      ))}
    </div>
  );
};


// Custom Typing Indicator with glow
// Custom Typing Indicator with glow
const CustomTypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start space-x-3 mb-4"
  >
    <div
      className="bg-white/60 backdrop-blur-md rounded-3xl rounded-tl-sm p-4 border border-gray-200"
      style={{ boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)' }}
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: dot * 0.3,
            }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))' }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

export default function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [documentContext, setDocumentContext] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const sttAccumRef = useRef<string>("");
  const typedBeforeRef = useRef<string>("");


  // Quick action queries - Fixed arrangement
  const quickActions = [
    { id: "employment-act", label: "Employment Act", query: "What are the key provisions of the Employment Act 1955?" },
    { id: "unfair-dismissal", label: "Unfair Dismissal", query: "What constitutes unfair dismissal in Malaysia?" },
    { id: "epf-socso", label: "EPF & SOCSO", query: "Explain EPF and SOCSO contributions." },
    { id: "minimum-wage", label: "Minimum Wage", query: "What is the current minimum wage in Malaysia?" }
  ];

  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/session", sessionId, "messages"],
    enabled: !!sessionId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat/message", {
        sessionId,
        role: "user",
        content,
        documentContext,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/session", sessionId, "messages"] });
      setMessage("");

      // Auto-speak the response if it's text-based
      if (data?.content && !isListening) {
        handleTextToSpeech(data.content);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Text-to-Speech functionality
  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'ms' ? 'ms-MY' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = () => {
    const toSend = message.trim();
    if (!toSend) return;

    stopRecognition();
    setMessage("");

    // Optimistically add user message
    queryClient.setQueryData(["/api/chat/session", sessionId, "messages"], (oldData: any) => {
      const newMessages = oldData ? [...oldData] : [];
      newMessages.push({ id: Date.now().toString(), role: "user", content: toSend, createdAt: new Date().toISOString() });
      return newMessages;
    });

    sendMessageMutation.mutate(toSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (query: string) => {
    setMessage(query);
  };

  const handleVoiceInput = (transcript: string) => {
    setMessage(transcript);
  };

  const handleFileUpload = async (file: File) => {
    toast({
      title: "File uploaded",
      description: `Uploading ${file.name}...`,
    });

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`);
      }

      const data = await res.json();
      const extracted = data?.extractedText || data?.analysis || `Uploaded: ${file.name}`;

      setMessage(String(extracted).slice(0, 500));

      if (data?.documentContext) {
        setDocumentContext(data.documentContext);
      } else if (data?.analysis) {
        handleAnalysisComplete(data.analysis);
      }

      toast({
        title: "File ready",
        description: `Preview added to input.`,
      });
    } catch (err) {
      console.error("File upload failed", err);
      setMessage(`Uploaded file: ${file.name}`);
      toast({
        title: "Upload failed",
        description: "Showing filename in input as fallback.",
        variant: "destructive",
      });
    }
  };

  const handleAnalysisComplete = (analysis: string) => {
    setDocumentContext(analysis);
    queryClient.setQueryData(["/api/chat/session", sessionId, "messages"], (oldData: any) => {
      const newMessages = oldData ? [...oldData] : [];
      newMessages.push({ id: Date.now().toString(), role: 'assistant', content: `Document Analysis:\n${analysis}`, createdAt: new Date().toISOString() });
      return newMessages;
    });
  };

  const startRecognition = () => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support the Web Speech API.",
        variant: "destructive",
      });
      return;
    }

    typedBeforeRef.current = message || "";
    sttAccumRef.current = "";

    recognitionRef.current = new SpeechRecognitionCtor();
    recognitionRef.current.lang = selectedLanguage === "ms" ? "ms-MY" : "en-US";
    recognitionRef.current.interimResults = true;
    recognitionRef.current.continuous = true;

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          sttAccumRef.current += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Update state so Textarea shows live transcription
      setMessage((typedBeforeRef.current + sttAccumRef.current + interimTranscript).trim());
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current.onerror = (err: any) => {
      console.error("Speech recognition error", err);
      toast({
        title: "Speech recognition error",
        description: err?.error || "Unknown error",
        variant: "destructive",
      });
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start recognition:", err);
      toast({
        title: "Failed to start speech recognition",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };


  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleSpeechInput = () => {
    if (isListening) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();

  return (
    <div className="h-screen flex flex-col relative">
      {/* Voice Input Mode - Full Screen with Chatbot Animation */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm"
          >
            <LottieRobot isListening={true} size="large" />
            <Waveform />
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <h2 className="text-3xl font-semibold text-gray-800 mb-2">Listening...</h2>
              <p className="text-gray-600 text-lg">I'm listening to your question</p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSpeechInput}
              className="mt-8 px-6 py-3 bg-red-500 backdrop-blur-md rounded-full text-white border border-red-400 hover:bg-red-600 transition-colors"
              style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
            >
              Stop Listening
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <AnimatePresence>
        {!isListening && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-screen"
          >
            <div className="flex flex-col h-screen">
              {/* Welcome Screen with Animated Bot - Centered */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="fixed inset-0 flex flex-col items-center justify-center text-center mb-36 px-6 py-12"
                >
                  <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-6">
                    <LottieRobot size="large" isSpeaking={isSpeaking} />
                    <h1 className="text-4xl font-bold italic text-gray-800">
                           Sembang Dengan Lawy
                          </h1>
                    <p className="text-gray-600 max-w-md text-lg">
                      Your intelligent conversation partner for Malaysian labour laws
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Chat Messages with Bot Animation when speaking */}
              {messages.length > 0 && (
                <div className="flex-1 overflow-y-auto px-4 pt-28 pb-40" ref={messagesContainerRef} >


                  {messages.map((msg: ChatMessage) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-start space-x-3 mb-4 max-w-4xl mx-auto w-full ${msg.role === "user" ? "justify-end" : ""}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-10 h-10 flex items-center justify-center">
                          <LottieRobot
                            size="small"
                            rounded={true}
                            isSpeaking={isSpeaking}
                          />
                        </div>
                      )}
                      <div className="flex-1 max-w-md">
                        <div
                          className={`rounded-3xl p-4 border relative ${msg.role === "user"
                            ? "bg-blue-600/80 text-white rounded-3xl "
                            : "bg-white/20 text-gray-800 rounded-3xl "
                            }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          {msg.role === "assistant" && (
                            <button
                              onClick={() => isSpeaking ? stopSpeaking() : handleTextToSpeech(msg.content)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100/50 flex items-center justify-center hover:bg-gray-200/50 transition-colors"
                            >
                              {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                      {msg.role === "user" && (
                        <div
                          className="w-8 h-8 bg-gray-500/20 backdrop-blur-md rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200"
                          style={{ boxShadow: '0 0 15px rgba(107, 114, 128, 0.3)' }}
                        >
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {sendMessageMutation.isPending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-6"
                    >
                      <LottieRobot size="medium" isSpeaking={true} />
                      <p className="mt-3 text-gray-600 text-sm">Thinking...</p>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />

                  {isLoading && (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Input Area - Enhanced with glow */}
              {/* Fixed Bottom Input Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-6 px-6 z-40"
              >
                <div className="max-w-4xl mx-auto">
                  {/* Main Input Row */}
                  <div className="flex items-end space-x-3 mb-2">
                    {/* File Upload */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFileClick}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-all duration-200 border border-gray-200 shadow-sm"
                    >
                      <Upload className="w-5 h-5 text-gray-600" />
                    </motion.button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                    />

                    {/* Speech Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleSpeechInput}
                      className="w-12 h-12 bg-blue-500/20 backdrop-blur-md rounded-full flex items-center justify-center border border-blue-200 text-blue-600 hover:bg-blue-500/30 transition-all duration-200"
                      style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}
                    >
                      <Mic className="w-5 h-5" />
                    </motion.button>

                    {/* Text Area - Enhanced */}
                    <div className="flex-1 relative">
                      <motion.div
                        layout
                        className="bg-white/20 backdrop-blur-md rounded-3xl border border-gray-200 shadow-lg"
                        style={{ boxShadow: '0 0 25px rgba(255, 255, 255, 0.5)' }}
                      >
                        <div className="relative">
                          <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about Malaysian labour laws, employment rights, legal procedures..."
                            className="w-full p-4 pr-14 bg-transparent resize-none outline-none text-gray-800 placeholder-gray-500 min-h-[50px] max-h-24 border-none focus:ring-0"
                            rows={1}
                            maxLength={500}
                            data-testid="message-input"
                          />
                          <div className="absolute bottom-2 right-14 text-xs text-gray-400">
                            {message.length}/500
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendMessage}
                            disabled={!message.trim() || sendMessageMutation.isPending}
                            className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                            style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
                          >
                            <Send className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>

                    {/* Language Switch */}
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger
                        className="w-16 h-12 bg-white/60 backdrop-blur-md border-gray-200 text-gray-800 rounded-full"
                        data-testid="language-select"
                        style={{ boxShadow: '0 0 15px rgba(255, 255, 255, 0.4)' }}
                      >
                        <SelectValue className="text-lg">
                          {selectedLanguage === "en" ? "🇬🇧" : "🇲🇾"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-md border-gray-200">
                        <SelectItem value="en" className="text-gray-800 hover:bg-gray-100">🇬🇧 EN</SelectItem>
                        <SelectItem value="ms" className="text-gray-800 hover:bg-gray-100">🇲🇾 MS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick Actions - Fixed arrangement */}
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
                    {quickActions.map((action) => (
                      <motion.button
                        key={action.id}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickAction(action.query)}
                        className="bg-white/50 backdrop-blur-md rounded-full px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-white/70 transition-all duration-200 border border-gray-200"
                        style={{ boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}
                        data-testid={`quick-action-${action.id}`}
                      >
                        {action.label}
                      </motion.button>
                    ))}
                    {lastAssistantMessage && <RecommendExpert prompt={lastAssistantMessage.content} />}
                  </div>

                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-6 pb-0.5 pointer-events-none">
          <div className="max-w-4xl w-full pt-15">
            <p className="text-xs text-gray-500 text-center">
              Disclaimer: Lawy is an AI assistant and not a lawyer. This information is for guidance only and not legal advice. Please consult a qualified legal professional for advice specific to your situation.
            </p>
          </div>
        </div>
    </div>
  );
}