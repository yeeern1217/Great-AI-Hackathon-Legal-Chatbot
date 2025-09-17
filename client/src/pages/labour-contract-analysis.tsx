import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface AnalysisResult {
  analysis?: {
    clause: string;
    risk: 'Red' | 'Yellow' | 'Green';
    explanation: string;
  }[];
  error?: string;
}

export default function LabourContractAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsLoading(true);
      const response = await fetch("/api/analyze-labour-contract-file", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to analyze file");
      }
      const result = await response.json() as AnalysisResult;
      setAnalysisResult(result);
      setIsLoading(false);
      return result;
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    mutation.mutate(formData);
  };

  const getRiskColor = (risk: 'Red' | 'Yellow' | 'Green') => {
    switch (risk) {
      case 'Red':
        return 'bg-red-500';
      case 'Yellow':
        return 'bg-yellow-500';
      case 'Green':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle> Labour Contract Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="labour-contract">Upload your agreement (PDF, image, or text)</Label>
            <Input id="labour-contract" type="file" onChange={handleFileChange} accept=".txt,.md,image/*,application/pdf" />
          </div>
          <Button onClick={handleAnalyzeClick} disabled={!file || isLoading} className="mt-4">
            {isLoading ? "Analyzing..." : "Analyze Document"}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent>
            {analysisResult.error && (
              <p className="text-red-500">{analysisResult.error}</p>
            )}
            {analysisResult.analysis && (
              <div className="space-y-4">
                {analysisResult.analysis.map((item, index) => (
                  <div key={index} className="p-4 border rounded-md">
                    <div className="flex items-center mb-2">
                      <Badge className={`${getRiskColor(item.risk)} mr-2`}>{item.risk}</Badge>
                      <p className="font-semibold">Clause</p>
                    </div>
                    <p className="mb-2 text-sm text-gray-700 bg-gray-100 p-2 rounded">{item.clause}</p>
                    <p className="font-semibold">Explanation</p>
                    <p className="text-sm">{item.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
