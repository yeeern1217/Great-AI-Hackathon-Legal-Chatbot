import { useState, useRef, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, AlertCircle, CheckCircle, Info, FileText, Shield, ShieldAlert, ShieldCheck, Paperclip, Upload, X, ChevronDown, ChevronUp, GripVertical, ExternalLink } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import Lottie from "lottie-react";
import runnerAnimation from "@/assets/chat-bot.json";

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
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-700',
        icon: <ShieldAlert className="h-5 w-5 text-red-600" />,
      };
    case 'Yellow':
      return {
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        textColor: 'text-yellow-700',
        icon: <Shield className="h-5 w-5 text-yellow-600" />,
      };
    case 'Green':
      return {
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        textColor: 'text-green-700',
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

const DocumentViewer = ({ file }: { file: File | null }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useMemo(() => {
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No document uploaded</p>
      </div>
    );
  }

  if (file.type === 'application/pdf' && pdfUrl) {
    return (
      <div className="h-96">
        <iframe
          src={pdfUrl}
          className="w-full h-full border rounded-lg"
          title="PDF Preview"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
      <p className="text-gray-500">Preview not available for this file type</p>
    </div>
  );
};

const ClauseCard = ({ clause, index, isExpanded, onToggle, onDragStart, onDragOver, onDrop, onDragEnd }: {
  clause: Clause;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}) => {
  const { bgColor, borderColor, textColor, icon } = getRiskAssets(clause.color);

  const getHeaderColor = (color: 'Red' | 'Yellow' | 'Green') => {
    switch (color) {
      case 'Red': return 'text-red-700';
      case 'Yellow': return 'text-yellow-700';
      case 'Green': return 'text-green-700';
      default: return 'text-gray-800';
    }
  };

  return (
    <div
      className={`mb-4 rounded-lg border-l-4 ${borderColor} ${bgColor} transition-all duration-300 ${isExpanded ? 'col-span-full' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
    >
      <Card className="h-full bg-transparent border-0 shadow-none">
        <CardHeader
          className="pb-2 cursor-pointer transition-all duration-300"
          onClick={onToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="mr-2 cursor-move opacity-70 hover:opacity-100 transition-opacity"
                draggable
                onDragStart={(e) => onDragStart(e, index)}
              >
                <GripVertical className="h-4 w-4" />
              </div>
              <CardTitle className={`flex gap-2 text-lg py-2 mb-2 ${textColor}`}>
                <span className="flex items-start">{icon}</span>
                <span className="flex flex-col justify-center leading-snug break-words mx-1">
                  {clause.title}
                </span>
              </CardTitle>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 transition-transform duration-300" />
            ) : (
              <ChevronDown className="h-5 w-5 transition-transform duration-300" />
            )}
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-3 pt-2 animate-in fade-in-50 duration-300">
            <div>
              <h4 className={`font-semibold `}>Simple Explanation</h4>
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
              <p className="text-xs text-gray-500 font-mono bg-white/50 p-2 rounded border">
                Original Text: "{clause.originalText}"
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

// ===== MAIN COMPONENT =====
export default function LabourContractAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [expandedClauses, setExpandedClauses] = useState<number[]>([]);
  const [clauseOrder, setClauseOrder] = useState<number[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      setClauseOrder(data.clauses.map((_, index) => index));
      setIsLoading(false);
    },
    onError: (error: Error) => {
      setAnalysisResult({ error: error.message, summary: { criticalIssues: 0, areasForCaution: 0 }, clauses: [], documentText: "" });
      setIsLoading(false);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setAnalysisResult(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeClick = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    mutation.mutate(formData);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setAnalysisResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleToggleClause = (index: number) => {
    if (expandedClauses.includes(index)) {
      setExpandedClauses(expandedClauses.filter(i => i !== index));
    } else {
      setExpandedClauses([...expandedClauses, index]);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Add a slight delay for smoother animation
    setTimeout(() => {
      if (e.currentTarget) {
        e.currentTarget.classList.add('opacity-50');
      }
    }, 10);
  };

  const handleDragOverClause = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (e.currentTarget) {
      e.currentTarget.classList.add('bg-white/20');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget) {
      e.currentTarget.classList.remove('bg-white/20');
    }
  };

  const handleDropClause = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (e.currentTarget) {
      e.currentTarget.classList.remove('bg-white/20');
    }

    if (draggedIndex === null) return;

    const newOrder = [...clauseOrder];
    const draggedItem = newOrder.splice(draggedIndex, 1)[0];
    newOrder.splice(index, 0, draggedItem);

    setClauseOrder(newOrder);
    setDraggedIndex(null);

    // Remove opacity class from dragged element
    const draggedElements = document.querySelectorAll('.opacity-50');
    draggedElements.forEach(el => el.classList.remove('opacity-50'));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Remove opacity class from all elements
    const draggedElements = document.querySelectorAll('.opacity-50');
    draggedElements.forEach(el => el.classList.remove('opacity-50'));
  };

  const handleExport = () => {
    if (!analysisResult) return;

    const doc = new jsPDF();
    const margin = 15;
    let y = margin;

    // Add title
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Labour Contract Analysis Report", margin, y);
    y += 15;

    // Add summary section
    doc.setFontSize(16);
    doc.text("Overall Summary", margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(220, 53, 69);
    doc.text(`Critical Issues: ${analysisResult.summary.criticalIssues}`, margin, y);
    y += 7;

    doc.setTextColor(255, 193, 7);
    doc.text(`Areas for Caution: ${analysisResult.summary.areasForCaution}`, margin, y);
    y += 10;

    doc.setTextColor(25, 135, 84);
    const standardClauses = analysisResult.clauses.filter(c => c.color === 'Green').length;
    doc.text(`Standard Clauses: ${standardClauses}`, margin, y);
    y += 15;

    doc.setTextColor(0, 0, 0);

    // Calculate health score
    const { redClauses, yellowClauses } = analysisResult.clauses.reduce((acc, clause) => {
      if (clause.color === 'Red') acc.redClauses++;
      if (clause.color === 'Yellow') acc.yellowClauses++;
      return acc;
    }, { redClauses: 0, yellowClauses: 0, greenClauses: 0 });

    const totalClauses = analysisResult.clauses.length;
    const healthScore = totalClauses > 0 ? Math.round(((totalClauses - redClauses - yellowClauses * 0.5) / totalClauses) * 100) : 100;

    doc.setTextColor(59, 130, 246);
    doc.text(`Health Score: ${healthScore}%`, margin, y);
    y += 15;
    doc.setTextColor(0, 0, 0);

    // Add detailed breakdown
    doc.setFontSize(16);
    doc.text("Detailed Breakdown", margin, y);
    y += 10;

    analysisResult.clauses.forEach((clause, index) => {
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
      doc.text(`${index + 1}. ${clause.title}`, margin, y);
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

      y += 8;
    });

    // Add footer with timestamp
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, margin, 280);

    doc.save("labour-contract-analysis-report.pdf");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" style={{
          animation: 'pulse-slow 6s infinite'
        }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" style={{
          animation: 'pulse-slower 8s infinite'
        }}></div>
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl" style={{
          animation: 'pulse-medium 4s infinite'
        }}></div>
      </div>

      {/* Embedded styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes pulse-slow {
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.15;
            }
          }
          
          @keyframes pulse-medium {
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.2;
            }
          }
          
          @keyframes pulse-slower {
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.12;
            }
          }
        `
      }} />

      {/* Header Section */}
      <div className="mt-12 mb-8 text-center relative">
        <div className="p-8 rounded-2xl">
          <h2 className="text-6xl font-bold text-foreground mb-4 bg-gradient-to-r from-blue-900 to-blue-900 bg-clip-text text-transparent">
            Labour Contract Analysis
          </h2>
          <p className="font-bold text-gray-600 text-lg max-w-4xl mx-auto">
            Upload your agreement to analyze for potential issues and get actionable suggestions
          </p>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mb-6 p-6 rounded-2xl backdrop-blur-md bg-white/30 border border-gray-300">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="labour-contract" className="text-lg font-semibold mb-4">Upload your agreement (PDF, image, or text)</Label>

          {/* Custom styled file upload area */}
          <div
            className="relative rounded-lg p-2 w-full border-2 border-dashed border-primary/40 bg-background hover:border-primary/60 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              id="labour-contract"
              type="file"
              onChange={handleFileChange}
              accept=".txt,.md,image/*,application/pdf"
              className="hidden"
            />

            <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full">
              <svg
                className='w-8 w-8 mb-3 text-primary'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 20 16'
              >
                <path
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                />
              </svg>
              <p className='mb-1 text-sm text-primary'>
                <span className='font-semibold'>Click to upload</span>
                &nbsp; or drag and drop
              </p>
              <p className='text-xs text-primary'>PDF, TXT, or Images</p>
            </div>
          </div>

          {/* File preview */}
          {file && (
            <div className="mt-3 p-3 bg-background border rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <Paperclip className="h-4 w-4 flex-shrink-0 stroke-current mr-2" />
                <p className="text-ellipsis overflow-hidden text-sm">
                  {fileName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Consent checkbox */}
          <div className="mt-4 flex items-center space-x-2">
            <Checkbox
              id="consent"
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked === true)}
            />
            <Label htmlFor="consent" className="text-sm">
              I hereby consent to the collection, processing, and disclosure of sensitive data for the purpose of obtaining insights.
            </Label>
          </div>
        </div>
        <Button onClick={handleAnalyzeClick} disabled={!file || isLoading} className="mt-4">
          {isLoading ? "Analyzing..." : "Analyze Document"}
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-10 space-y-4">
          <div className="w-48 h-48">
            <Lottie animationData={runnerAnimation} loop={true} />
          </div>
          <p className="text-lg font-semibold text-primary">
            Analyzing your document, please wait...
          </p>
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
        <div className="space-y-6">
          {/* Combined Dashboard Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Interactive Document Viewer */}
            <Card
              className="hover:shadow-xl transition-all duration-500 backdrop-blur-md bg-white/30 border-gray-300 relative overflow-hidden group"
              style={{
                backdropFilter: 'blur(10px)',
                transform: 'scale(1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Liquid glass effect elements */}
              <div className="absolute -top-4 -right-4 w-16 h-8 rounded-full bg-blue-400/20 blur-xl group-hover:bg-blue-400/30 transition-colors duration-300"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-8 rounded-full bg-purple-400/20 blur-xl group-hover:bg-purple-400/30 transition-colors duration-300"></div>

              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center backdrop-blur-sm bg-white/30">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="backdrop-blur-sm bg-white/30 border border-white/20 hover:bg-white/50"
                    onClick={handleExport}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
                <CardTitle className="text-lg">Interactive Document Viewer</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentViewer file={file} />
              </CardContent>
            </Card>

            {/* Column 2: Metrics and Charts */}
            <div className="space-y-6">
              {/* Four cards in a row */}
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className="hover:shadow-xl transition-all duration-500 backdrop-blur-md bg-white/30 border-gray-300 relative overflow-hidden group"
                  style={{
                    backdropFilter: 'blur(10px)',
                    transform: 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* Liquid glass effect elements */}
                  <div className="absolute -top-4 -right-4 w-16 h-8 rounded-full bg-blue-400/20 blur-xl group-hover:bg-blue-400/30 transition-colors duration-300"></div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-8 rounded-full bg-purple-400/20 blur-xl group-hover:bg-purple-400/30 transition-colors duration-300"></div>

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(() => {
                        const { redClauses, yellowClauses, greenClauses } = analysisResult.clauses.reduce((acc, clause) => {
                          if (clause.color === 'Red') acc.redClauses++;
                          if (clause.color === 'Yellow') acc.yellowClauses++;
                          if (clause.color === 'Green') acc.greenClauses++;
                          return acc;
                        }, { redClauses: 0, yellowClauses: 0, greenClauses: 0 });

                        const totalClauses = analysisResult.clauses.length;
                        return totalClauses > 0 ? Math.round(((totalClauses - redClauses - yellowClauses * 0.5) / totalClauses) * 100) : 100;
                      })()}%
                    </div>
                    <p className="text-xs text-muted-foreground">Based on issue severity</p>
                  </CardContent>
                </Card>

                <Card
                  className="hover:shadow-xl transition-all duration-500 backdrop-blur-md bg-white/30 border-gray-300 relative overflow-hidden group"
                  style={{
                    backdropFilter: 'blur(10px)',
                    transform: 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* Liquid glass effect elements */}
                  <div className="absolute -top-4 -right-4 w-16 h-8 rounded-full bg-red-400/20 blur-xl group-hover:bg-red-400/30 transition-colors duration-300"></div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-8 rounded-full bg-purple-400/20 blur-xl group-hover:bg-purple-400/30 transition-colors duration-300"></div>

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-600">Critical Issues</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {analysisResult.clauses.filter(c => c.color === 'Red').length}
                    </div>
                    <p className="text-xs text-muted-foreground">High-risk clauses found</p>
                  </CardContent>
                </Card>

                <Card
                  className="hover:shadow-xl transition-all duration-500 backdrop-blur-md bg-white/30 border-gray-300 relative overflow-hidden group"
                  style={{
                    backdropFilter: 'blur(10px)',
                    transform: 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* Liquid glass effect elements */}
                  <div className="absolute -top-4 -right-4 w-16 h-8 rounded-full bg-yellow-400/20 blur-xl group-hover:bg-yellow-400/30 transition-colors duration-300"></div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-8 rounded-full bg-purple-400/20 blur-xl group-hover:bg-purple-400/30 transition-colors duration-300"></div>

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-600">Areas for Caution</CardTitle>
                    <Shield className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {analysisResult.clauses.filter(c => c.color === 'Yellow').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Ambiguous clauses found</p>
                  </CardContent>
                </Card>

                <Card
                  className="hover:shadow-xl transition-all duration-500 backdrop-blur-md bg-white/30 border-gray-300 relative overflow-hidden group"
                  style={{
                    backdropFilter: 'blur(10px)',
                    transform: 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* Liquid glass effect elements */}
                  <div className="absolute -top-4 -right-4 w-16 h-8 rounded-full bg-green-400/20 blur-xl group-hover:bg-green-400/30 transition-colors duration-300"></div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-8 rounded-full bg-purple-400/20 blur-xl group-hover:bg-purple-400/30 transition-colors duration-300"></div>

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-600">Standard Clauses</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResult.clauses.filter(c => c.color === 'Green').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Fair clauses found</p>
                  </CardContent>
                </Card>
              </div>

              {/* Clause Distribution */}
              <Card
                className="hover:shadow-xl transition-all duration-500 backdrop-blur-md bg-white/30 border-gray-300 relative overflow-hidden group"
                style={{
                  backdropFilter: 'blur(10px)',
                  transform: 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {/* Liquid glass effect elements */}
                <div className="absolute -top-4 -right-4 w-16 h-8 rounded-full bg-blue-400/20 blur-xl group-hover:bg-blue-400/30 transition-colors duration-300"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-8 rounded-full bg-purple-400/20 blur-xl group-hover:bg-purple-400/30 transition-colors duration-300"></div>

                <CardHeader>
                  <CardTitle>Clause Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    critical: { label: "Critical", color: "#dc2626" },
                    caution: { label: "Caution", color: "#f59e0b" },
                    standard: { label: "Standard", color: "#22c55e" },
                  }} className="mx-auto aspect-square h-[250px]">
                    <PieChart>
                      <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={[
                          { name: 'Critical', value: analysisResult.clauses.filter(c => c.color === 'Red').length, fill: "#dc2626" },
                          { name: 'Caution', value: analysisResult.clauses.filter(c => c.color === 'Yellow').length, fill: "#f59e0b" },
                          { name: 'Standard', value: analysisResult.clauses.filter(c => c.color === 'Green').length, fill: "#22c55e" },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        {[
                          { name: 'Critical', value: analysisResult.clauses.filter(c => c.color === 'Red').length, fill: "#dc2626" },
                          { name: 'Caution', value: analysisResult.clauses.filter(c => c.color === 'Yellow').length, fill: "#f59e0b" },
                          { name: 'Standard', value: analysisResult.clauses.filter(c => c.color === 'Green').length, fill: "#22c55e" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Breakdown Section */}
          <div className="p-6 rounded-2xl backdrop-blur-md bg-white/30 border border-gray-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Detailed Breakdown</h3>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {clauseOrder.map((orderIndex, displayIndex) => {
                const clause = analysisResult.clauses[orderIndex];
                return (
                  <ClauseCard
                    key={orderIndex}
                    clause={clause}
                    index={orderIndex}
                    isExpanded={expandedClauses.includes(orderIndex)}
                    onToggle={() => handleToggleClause(orderIndex)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOverClause}
                    onDrop={handleDropClause}
                    onDragEnd={handleDragEnd}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}