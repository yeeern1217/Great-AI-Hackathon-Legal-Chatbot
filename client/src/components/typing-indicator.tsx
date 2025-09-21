import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3 animate-fade-in" data-testid="typing-indicator">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4">
        <div className="typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <span className="ml-2 text-sm text-muted-foreground">Legal Assistant is typing...</span>
        </div>
      </div>
    </div>
  );
}