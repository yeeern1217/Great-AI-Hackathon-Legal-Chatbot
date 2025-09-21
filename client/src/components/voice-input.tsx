import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Mic, Square } from "lucide-react";
import axios from "axios";

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  language: string;
}

export default function VoiceInput({ onTranscript, language }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleTranscribe = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");
    formData.append("language", language);

    try {
      const response = await axios.post("/api/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onTranscript(response.data.transcript);
      toast({
        title: "Voice captured",
        description: "Your voice input has been converted to text.",
      });
    } catch (error) {
      toast({
        title: "Transcription error",
        description: "Could not transcribe audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };
        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
          handleTranscribe(audioBlob);
          audioChunks.current = [];
        };
        mediaRecorder.current.start();
        setIsRecording(true);
      })
      .catch(err => {
        toast({
          title: "Microphone error",
          description: "Could not access microphone. Please check permissions.",
          variant: "destructive",
        });
      });
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleVoiceToggle}
      className={isRecording ? "bg-destructive/10 border-destructive/30" : ""}
      title={isRecording ? "Stop Recording" : "Voice Input"}
      data-testid="voice-input"
    >
      {isRecording ? (
        <Square className="h-4 w-4 text-destructive" />
      ) : (
        <Mic className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
}