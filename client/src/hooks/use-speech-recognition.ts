import { useRef, useCallback } from "react";

interface SpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  language?: string;
}

interface SpeechRecognitionAPI {
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

export function useSpeechRecognition({
  onResult,
  onError,
  language = "en-US"
}: SpeechRecognitionOptions): SpeechRecognitionAPI {
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== "undefined" && 
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const languageMap: Record<string, string> = {
    "en": "en-US",
    "hi": "hi-IN",
    "bn": "bn-IN",
    "te": "te-IN", 
    "ta": "ta-IN",
    "mr": "mr-IN"
  };

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError("Speech recognition not supported in this browser");
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = languageMap[language] || "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        onError(event.error);
      };

      recognitionRef.current.onend = () => {
        recognitionRef.current = null;
      };

      recognitionRef.current.start();
    } catch (error) {
      onError("Failed to start voice recognition");
    }
  }, [isSupported, language, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  return {
    startListening,
    stopListening,
    isSupported
  };
}
