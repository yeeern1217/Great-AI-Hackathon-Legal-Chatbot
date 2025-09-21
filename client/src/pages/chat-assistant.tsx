import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ChatInterface from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Zap, Book, FileText, Mic, Languages, Shield } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { ChatSession, ChatMessage } from "@shared/schema";

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Create or get existing session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const newSessionId = uuidv4();
      const response = await apiRequest("POST", "/api/chat/session", {
        id: newSessionId,
        title: "Legal Consultation"
      });
      // or additional data. For now, we'll use the ID we sent.
      const session = await response.json() as Promise<ChatSession>;
      return { ...session, id: newSessionId };
    },
    onSuccess: (session) => {
      setSessionId(session.id);
      queryClient.invalidateQueries({ queryKey: ["/api/chat/session", session.id] });
    }
  });

  // Initialize session on component mount
  useEffect(() => {
    if (!sessionId) {
      createSessionMutation.mutate();
    }
  }, [sessionId]);

  const legalTopics = [
    "Employment Act 1955",
    "Industrial Relations Act 1967",
    "EPF Act 1991",
    "SOCSO Act 1969",
    "OSHA 1994",
  ];

  const features = [
    {
      icon: FileText,
      title: "Upload legal documents",
      description: "Analyze contracts, agreements, and legal papers"
    },
    {
      icon: Mic,
      title: "Voice input support",
      description: "Speak naturally in your preferred language"
    },
    {
      icon: Languages,
      title: "Multi-language support",
      description: "Supports English and Malay"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your conversations are kept confidential"
    }
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Section */}
      <div className="gradient-bg rounded-2xl p-8 text-white mb-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">AI-Powered Legal Assistant for Malaysian Labour Laws</h2>
          <p className="text-lg opacity-90 mb-6">
            Get instant information about Malaysian legal concepts, your rights, and basic legal procedures. 
            Upload documents, speak in your language, and get clear explanations.
          </p>
          <div className="flex flex-wrap gap-3">
            {legalTopics.map((topic) => (
              <Badge key={topic} variant="secondary" className="bg-white/20 text-white border-white/30">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {sessionId ? (
            <ChatInterface sessionId={sessionId} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Initializing legal assistant...</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-accent" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Legal Topics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5 text-primary" />
                Legal Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { id: "employment-act", label: "Employment Act 1955" },
                { id: "industrial-relations", label: "Industrial Relations Act 1967" },
                { id: "epf-act", label: "EPF Act 1991" },
                { id: "socso-act", label: "SOCSO Act 1969" },
                { id: "osha", label: "OSHA 1994" }
              ].map((topic) => (
                <Button
                  key={topic.id}
                  variant="ghost"
                  className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                  data-testid={`topic-${topic.id}`}
                >
                  {topic.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
