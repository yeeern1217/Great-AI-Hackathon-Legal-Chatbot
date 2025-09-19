import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import TypingIndicator from "./typing-indicator";
import VoiceInput from "./voice-input";
import FileUpload from "./file-upload";
import { Bot, User, Send, Trash2, Download } from "lucide-react";
import type { ChatMessage } from "@shared/schema";

interface ChatInterfaceProps {
  sessionId: string;
}

export default function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [documentContext, setDocumentContext] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/session", sessionId, "messages"] });
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Quick action queries
  const quickActions = [
    { id: "consumer-rights", label: "Consumer Rights", query: "What are my consumer rights in India?" },
    { id: "cyber-crime", label: "Cyber Crime", query: "How do I report cyber crime in India?" },
    { id: "property-law", label: "Property Law", query: "What are the basics of property law in India?" },
    { id: "family-law", label: "Family Law", query: "Tell me about family law in India" }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
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

  const handleFileUpload = (file: File) => {
    // File upload will be handled by the FileUpload component
    toast({
      title: "File Uploaded",
      description: `Analyzing ${file.name}...`,
    });
  };

  const handleAnalysisComplete = (analysis: string) => {
    setDocumentContext(analysis);
    // Optionally, add the analysis to the chat display right away
    queryClient.setQueryData(["/api/chat/session", sessionId, "messages"], (oldData: any) => {
      const newMessages = oldData ? [...oldData] : [];
      newMessages.push({ id: Date.now().toString(), role: 'assistant', content: `Document Analysis:\n${analysis}`, createdAt: new Date().toISOString() });
      return newMessages;
    });
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="overflow-hidden">
      {/* Chat Header */}
      <CardHeader className="border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Legal Assistant</h3>
              <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" title="Clear Chat" data-testid="clear-chat">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" title="Download Chat" data-testid="download-chat">
              <Download className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Chat Messages */}
      <CardContent className="p-0">
        <div className="chat-container p-4 space-y-4 overflow-y-auto" style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            // Welcome Message
            <div className="flex items-start space-x-3 animate-fade-in">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4 max-w-md">
                <p className="text-sm text-foreground mb-2">Hello! I'm your AI legal assistant for Indian laws. I can help you understand:</p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                  <li>• Indian Penal Code basics</li>
                  <li>• Fundamental rights and duties</li>
                  <li>• Consumer and cyber laws</li>
                  <li>• Property and family law</li>
                </ul>
                <p className="text-xs text-muted-foreground italic">
                  Disclaimer: I provide general legal information only. For specific legal advice, consult a qualified advocate.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg: ChatMessage) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 animate-fade-in ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`rounded-2xl p-4 max-w-md ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/50 text-foreground rounded-tl-sm"}`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-accent-foreground" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {sendMessageMutation.isPending && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-end space-x-3">
            <FileUpload onFileUpload={handleFileUpload} onAnalysisComplete={handleAnalysisComplete} sessionId={sessionId} />
            {/* <VoiceInput onTranscript={handleVoiceInput} language={selectedLanguage} /> */}

            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Indian laws, consumer rights, legal procedures..."
                className="resize-none pr-16 min-h-[44px]"
                maxLength={500}
                data-testid="message-input"
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {message.length}/500
              </div>
            </div>

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-20" data-testid="language-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇬🇧 EN</SelectItem>
                <SelectItem value="hi">🇮🇳 हिं</SelectItem>
                <SelectItem value="bn">🇮🇳 বাং</SelectItem>
                <SelectItem value="te">🇮🇳 తె</SelectItem>
                <SelectItem value="ta">🇮🇳 த</SelectItem>
                <SelectItem value="mr">🇮🇳 मर</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              data-testid="send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {quickActions.map((action) => (
              <Badge
                key={action.id}
                variant="secondary"
                className="cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleQuickAction(action.query)}
                data-testid={`quick-action-${action.id}`}
              >
                {action.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
