export const languageMap = {
  en: { code: "en-US", name: "English", flag: "🇬🇧" },
  hi: { code: "hi-IN", name: "हिंदी", flag: "🇮🇳" },
  bn: { code: "bn-IN", name: "বাংলা", flag: "🇮🇳" },
  te: { code: "te-IN", name: "తెలుగు", flag: "🇮🇳" },
  ta: { code: "ta-IN", name: "தமிழ்", flag: "🇮🇳" },
  mr: { code: "mr-IN", name: "मराठी", flag: "🇮🇳" }
};

export function getLanguageConfig(languageKey: string) {
  return languageMap[languageKey as keyof typeof languageMap] || languageMap.en;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && 
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
}
