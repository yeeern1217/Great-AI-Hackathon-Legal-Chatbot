import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, AlertCircle, CheckCircle, Info } from "lucide-react";

// ===== TYPESCRIPT INTERFACES =====
interface Clause {
  title: string;
  originalText: string;
  color: 'Red' | 'Yellow' | 'Green';
  explanation: string;
  whyItMatters: string;
  suggestion: string;
}

interface AnalysisResult {
  summary: {
    criticalIssues: number;
    areasForCaution: number;
  };
  clauses: Clause[];
  documentText: string;
  error?: string;
}

// ===== HELPER FUNCTIONS =====
const getRiskAssets = (risk: 'Red' | 'Yellow' | 'Green' | undefined) => {
  switch (risk) {
    case 'Red':
      return {
        bgColor: 'bg-red-100',
        borderColor: 'border-red-500',
        textColor: 'text-red-800',
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      };
    case 'Yellow':
      return {
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-800',
        icon: <Info className="h-5 w-5 text-yellow-600" />,
      };
    case 'Green':
      return {
        bgColor: 'bg-green-100',
        borderColor: 'border-green-500',
        textColor: 'text-green-800',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      };
    default:
      return {
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-400',
        textColor: 'text-gray-800',
        icon: null,
      };
  }
};

// ===== SUB-COMPONENTS =====

const DocumentViewer = ({ documentText, clauses, onClauseClick }: { documentText: string; clauses: Clause[]; onClauseClick: (index: number) => void; }) => {
  if (!clauses || clauses.length === 0) {
    return <pre className="whitespace-pre-wrap font-sans">{documentText}</pre>;
  }

  const getHighlightColor = (color: 'Red' | 'Yellow' | 'Green') => {
    switch (color) {
      case 'Red': return 'bg-red-200';
      case 'Yellow': return 'bg-yellow-200';
      case 'Green': return 'bg-green-200';
    }
  }

  let lastIndex = 0;
  const parts: (string | JSX.Element)[] = [];

  clauses.forEach((clause, index) => {
    const startIndex = documentText.indexOf(clause.originalText, lastIndex);
    if (startIndex !== -1) {
      // Add the text before the clause
      parts.push(documentText.substring(lastIndex, startIndex));
      // Add the highlighted clause
      parts.push(
        <span
          key={index}
          id={`highlight-${index}`}
          className={`cursor-pointer rounded px-1 ${getHighlightColor(clause.color)}`}
          onClick={() => onClauseClick(index)}
        >
          {clause.originalText}
        </span>
      );
      lastIndex = startIndex + clause.originalText.length;
    }
  });

  // Add the remaining text after the last clause
  parts.push(documentText.substring(lastIndex));

  return <pre className="whitespace-pre-wrap font-sans">{parts}</pre>;
};


const ClauseCard = ({ clause, index }: { clause: Clause; index: number }) => {
  const { bgColor, borderColor, textColor, icon } = getRiskAssets(clause.color);

  return (
    <Card id={`clause-${index}`} className={`mb-4 border-l-4 ${borderColor} ${bgColor}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center text-lg ${textColor}`}>
          {icon}
          <span className="ml-2">{clause.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold">Simple Explanation</h4>
          <p className="text-sm">{clause.explanation}</p>
        </div>
        <div>
          <h4 className="font-semibold">Why It Matters</h4>
          <p className="text-sm">{clause.whyItMatters}</p>
        </div>
        <div>
          <h4 className="font-semibold">Actionable Suggestion</h4>
          <p className="text-sm">{clause.suggestion}</p>
        </div>
        <div className="mt-2">
            <p className="text-xs text-gray-500 font-mono bg-white p-2 rounded border">
              Original Text: "{clause.originalText}"
            </p>
        </div>
      </CardContent>
    </Card>
  );
};

const AnalysisPanel = ({ result }: { result: AnalysisResult }) => {
  const { summary, clauses } = result;

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-around">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{summary?.criticalIssues ?? 0}</p>
            <p className="text-sm text-red-600">Critical Issues</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{summary?.areasForCaution ?? 0}</p>
            <p className="text-sm text-yellow-600">Areas for Caution</p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div>
        <h3 className="text-xl font-bold mb-4">Detailed Breakdown</h3>
        {(clauses ?? []).sort((a, b) => {
          const order = { Red: 0, Yellow: 1, Green: 2 };
          return order[a.color] - order[b.color];
        }).map((clause, index) => (
          <ClauseCard key={index} clause={clause} index={index} />
        ))}
      </div>
    </div>
  );
};


// ===== MAIN COMPONENT =====
export default function LabourContractAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const analysisPanelRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: async (formData: FormData): Promise<AnalysisResult> => {
      setIsLoading(true);
      setAnalysisResult(null);
      const response = await fetch("/api/analyze-labour-contract-file", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        throw new Error(errorData.error || "Failed to analyze file");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setIsLoading(false);
    },
    onError: (error: Error) => {
      setAnalysisResult({ error: error.message, summary: { criticalIssues: 0, areasForCaution: 0 }, clauses: [], documentText: "" });
      setIsLoading(false);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setAnalysisResult(null); // Reset on new file selection
    }
  };

  const handleAnalyzeClick = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    mutation.mutate(formData);
  };

  const handleClauseClick = (index: number) => {
    const element = document.getElementById(`clause-${index}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const handleExport = () => {
    // Placeholder for PDF export functionality
    alert("PDF export functionality is not yet implemented.");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header & Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Labour Contract Analysis</CardTitle>
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-10">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
          <p className="ml-4 text-lg">Analyzing your document, please wait...</p>
        </div>
      )}

      {/* Error State */}
      {analysisResult?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{analysisResult.error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {analysisResult && !analysisResult.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Panel A: Document Viewer */}
          <div className="md:sticky top-6 h-fit">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Interactive Document Viewer</CardTitle>
                 <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent className="max-h-[80vh] overflow-y-auto">
                <DocumentViewer 
                  documentText={analysisResult.documentText} 
                  clauses={analysisResult.clauses}
                  onClauseClick={handleClauseClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* Panel B: AI Analysis */}
          <div ref={analysisPanelRef}>
            <AnalysisPanel result={analysisResult} />
          </div>
        </div>
      )}
    </main>
  );
}