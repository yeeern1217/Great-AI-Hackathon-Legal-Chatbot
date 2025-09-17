import { useState, useRef, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, AlertCircle, CheckCircle, Info, FileText, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

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
        icon: <ShieldAlert className="h-5 w-5 text-red-600" />,
      };
    case 'Yellow':
      return {
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-800',
        icon: <Shield className="h-5 w-5 text-yellow-600" />,
      };
    case 'Green':
      return {
        bgColor: 'bg-green-100',
        borderColor: 'border-green-500',
        textColor: 'text-green-800',
        icon: <ShieldCheck className="h-5 w-5 text-green-600" />,
      };
    default:
      return {
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-400',
        textColor: 'text-gray-800',
        icon: <FileText className="h-5 w-5 text-gray-600" />,
      };
  }
};

// ===== SUB-COMPONENTS =====

const DocumentViewer = ({ documentText, clauses, onClauseClick }: { documentText: string; clauses: Clause[]; onClauseClick: (index: number) => void; }) => {
  const parts = useMemo(() => {
    if (!clauses || clauses.length === 0) {
      return [{ type: 'text', content: documentText, clauseIndex: -1 }];
    }

    const processedParts: { type: 'text' | 'clause'; content: string; clauseIndex: number }[] = [];
    let lastIndex = 0;

    clauses.forEach((clause, index) => {
      const startIndex = documentText.indexOf(clause.originalText, lastIndex);
      if (startIndex !== -1) {
        if (startIndex > lastIndex) {
          processedParts.push({ type: 'text', content: documentText.substring(lastIndex, startIndex), clauseIndex: -1 });
        }
        processedParts.push({ type: 'clause', content: clause.originalText, clauseIndex: index });
        lastIndex = startIndex + clause.originalText.length;
      }
    });

    if (lastIndex < documentText.length) {
      processedParts.push({ type: 'text', content: documentText.substring(lastIndex), clauseIndex: -1 });
    }

    return processedParts;
  }, [documentText, clauses]);

  const getHighlightColor = (color: 'Red' | 'Yellow' | 'Green') => {
    switch (color) {
      case 'Red': return 'bg-red-100 border-red-200';
      case 'Yellow': return 'bg-yellow-100 border-yellow-200';
      case 'Green': return 'bg-green-100 border-green-200';
    }
  };

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'clause') {
          const clause = clauses[part.clauseIndex];
          return (
            <div
              key={index}
              id={`highlight-${part.clauseIndex}`}
              className={`cursor-pointer rounded-md border p-3 ${getHighlightColor(clause.color)}`}
              onClick={() => onClauseClick(part.clauseIndex)}
            >
              <p className="font-sans whitespace-pre-wrap">{part.content}</p>
            </div>
          );
        }
        return <p key={index} className="font-sans whitespace-pre-wrap">{part.content}</p>;
      })}
    </div>
  );
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
      <CardContent className="space-y-3 pt-2">
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

const DashboardView = ({ result }: { result: AnalysisResult }) => {
  const [filter, setFilter] = useState<'All' | 'Red' | 'Yellow' | 'Green'>('All');

  const greenClauses = result.clauses.length - result.summary.criticalIssues - result.summary.areasForCaution;
  const totalClauses = result.clauses.length;
  const healthScore = totalClauses > 0 ? Math.round(((totalClauses - result.summary.criticalIssues - result.summary.areasForCaution * 0.5) / totalClauses) * 100) : 100;

  const chartConfig = {
    critical: { label: "Critical", color: "#dc2626" }, // red-600
    caution: { label: "Caution", color: "#f59e0b" }, // amber-500
    standard: { label: "Standard", color: "#22c55e" }, // green-500
  }

  const chartData = [
    { name: 'Critical', value: result.summary.criticalIssues, fill: chartConfig.critical.color },
    { name: 'Caution', value: result.summary.areasForCaution, fill: chartConfig.caution.color },
    { name: 'Standard', value: greenClauses, fill: chartConfig.standard.color },
  ];

  const filteredClauses = useMemo(() => {
    if (filter === 'All') return result.clauses;
    return result.clauses.filter(c => c.color === filter);
  }, [filter, result.clauses]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthScore}%</div>
            <p className="text-xs text-muted-foreground">Based on issue severity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Critical Issues</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{result.summary.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">High-risk clauses found</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Areas for Caution</CardTitle>
            <Shield className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{result.summary.areasForCaution}</div>
            <p className="text-xs text-muted-foreground">Ambiguous clauses found</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Standard Clauses</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{greenClauses}</div>
            <p className="text-xs text-muted-foreground">Fair clauses found</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clause Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
            <PieChart>
              <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Detailed Breakdown</h3>
          <div className="flex space-x-2">
            <Button variant={filter === 'All' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('All')}>All</Button>
            <Button variant={filter === 'Red' ? 'destructive' : 'outline'} size="sm" onClick={() => setFilter('Red')}>Red</Button>
            <Button variant={filter === 'Yellow' ? 'secondary' : 'outline'} size="sm" onClick={() => setFilter('Yellow')}>Yellow</Button>
            <Button variant={filter === 'Green' ? 'ghost' : 'outline'} size="sm" onClick={() => setFilter('Green')}>Green</Button>
          </div>
        </div>
        {filteredClauses.map((clause, index) => (
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
      setAnalysisResult(null);
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
  
  const handleExport = (result: AnalysisResult | null) => {
    if (!result) return;

    const doc = new jsPDF();
    const margin = 15;
    let y = margin;

    doc.setFontSize(22);
    doc.text("Labour Contract Analysis Report", margin, y);
    y += 15;

    doc.setFontSize(16);
    doc.text("Overall Summary", margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(220, 53, 69);
    doc.text(`Critical Issues: ${result.summary.criticalIssues}`, margin, y);
    y += 7;

    doc.setTextColor(255, 193, 7);
    doc.text(`Areas for Caution: ${result.summary.areasForCaution}`, margin, y);
    y += 15;
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(16);
    doc.text("Detailed Breakdown", margin, y);
    y += 10;

    result.clauses.forEach((clause) => {
      if (y > 260) {
        doc.addPage();
        y = margin;
      }

      doc.setFontSize(14);
      let titleColor: [number, number, number] = [0, 0, 0];
      if (clause.color === 'Red') titleColor = [220, 53, 69];
      if (clause.color === 'Yellow') titleColor = [255, 193, 7];
      if (clause.color === 'Green') titleColor = [25, 135, 84];
      doc.setTextColor(...titleColor);
      doc.text(clause.title, margin, y);
      doc.setTextColor(0, 0, 0);
      y += 8;

      doc.setFontSize(10);
      
      const addWrappedText = (label: string, text: string) => {
        const splitText = doc.splitTextToSize(`${label}: ${text}`, 180);
        if (y + (splitText.length * 5) > 280) {
            doc.addPage();
            y = margin;
        }
        doc.text(splitText, margin + 5, y);
        y += (splitText.length * 5) + 3;
      }

      addWrappedText("Explanation", clause.explanation);
      addWrappedText("Why It Matters", clause.whyItMatters);
      addWrappedText("Suggestion", clause.suggestion);
      
      y += 5;
    });

    doc.save("labour-contract-analysis.pdf");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
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

      {isLoading && (
        <div className="flex items-center justify-center p-10">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
          <p className="ml-4 text-lg">Analyzing your document, please wait...</p>
        </div>
      )}

      {analysisResult?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{analysisResult.error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && !analysisResult.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:sticky top-6 h-fit">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Interactive Document Viewer</CardTitle>
                 <Button variant="outline" size="sm" onClick={() => handleExport(analysisResult)}>
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

          <div ref={analysisPanelRef}>
            <DashboardView result={analysisResult} />
          </div>
        </div>
      )}
    </main>
  );
}