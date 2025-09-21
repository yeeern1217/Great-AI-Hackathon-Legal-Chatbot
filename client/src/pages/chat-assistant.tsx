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
    <main className="pt-24"> {/* push down by 64px */}
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
    </main>
  );
}
