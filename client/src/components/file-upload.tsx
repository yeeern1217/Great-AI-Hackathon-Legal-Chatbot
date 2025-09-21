import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Paperclip } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onAnalysisComplete: (analysis: string) => void;
  sessionId: string;
}

export default function FileUpload({ onFileUpload, onAnalysisComplete, sessionId }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "File uploaded successfully",
        description: "Your document has been analyzed.",
      });
      if (data.analysis) {
        onAnalysisComplete(data.analysis);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: "Please try again with a valid document.",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'text/plain',
        'text/markdown',
      ];

      if (!allowedTypes.includes(file.type)) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !['txt', 'md'].includes(fileExtension)) {
          toast({
            title: "Invalid file type",
            description: "Please upload PDF, images, or text documents only.",
            variant: "destructive",
          });
          return;
        }
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      onFileUpload(file);
      uploadMutation.mutate(file);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.txt,.md"
        onChange={handleFileSelect}
        data-testid="file-input"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMutation.isPending}
        title="Upload Document"
        data-testid="upload-button"
      >
        <Paperclip className="h-4 w-4 text-muted-foreground" />
      </Button>
    </>
  );
}