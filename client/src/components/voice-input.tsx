import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Mic, Square } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  language: string;
}

export default function VoiceInput({ onTranscript, language }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  
  const { startListening, stopListening, isSupported } = useSpeechRecognition({
    onResult: (transcript) => {
      onTranscript(transcript);
      setIsListening(false);
      toast({
        title: "Voice captured",
        description: "Your voice input has been converted to text.",
      });
    },
    onError: (error) => {
      setIsListening(false);
      toast({
        title: "Voice recognition error",
        description: "Please try again or type your message.",
        variant: "destructive",
      });
    },
    language
  });

  const handleVoiceToggle = () => {
    if (!isSupported) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleVoiceToggle}
      className={isListening ? "bg-destructive/10 border-destructive/30" : ""}
      title={isListening ? "Stop Recording" : "Voice Input"}
      data-testid="voice-input"
    >
      {isListening ? (
        <Square className="h-4 w-4 text-destructive" />
      ) : (
        <Mic className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
}
