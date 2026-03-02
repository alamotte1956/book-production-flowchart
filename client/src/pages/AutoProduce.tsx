/**
 * Auto-Produce Page
 * Upload a manuscript, choose trim size and style, and let AI produce
 * a press-ready interior PDF and EPUB ebook.
 *
 * Style Preview: once trim size + style are selected, a "Preview Style"
 * button renders a one-page sample in a modal iframe so users can
 * confirm the look before committing to the full pipeline.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft, Upload, FileText, Wand2, Download, AlertCircle,
  CheckCircle2, Clock, Loader2, BookOpen, FileDown, Sparkles, Eye, X,
} from "lucide-react";

const MAX_FILE_SIZE_MB = 15;
const ACCEPTED_TYPES = [
  // Word
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  // PDF
  "application/pdf",
  // Plain text & markup
  "text/plain",
  "text/markdown",
  "text/html",
  "text/rtf",
  "application/rtf",
  // Excel / Spreadsheets
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  // Apple Numbers (zip-based)
  "application/vnd.apple.numbers",
  // OpenDocument
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  // CSV
  "text/csv",
  "application/csv",
  // ePub
  "application/epub+zip",
];
const ACCEPTED_EXT = [
  ".docx", ".doc",
  ".pdf",
  ".txt", ".md", ".markdown", ".html", ".htm",
  ".rtf",
  ".xlsx", ".xls",
  ".numbers",
  ".odt", ".ods",
  ".csv",
  ".epub",
].join(",");

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function statusLabel(status: string) {
  switch (status) {
    case "queued": return "Queued";
    case "processing": return "Processing";
    case "complete": return "Complete";
    case "error": return "Failed";
    default: return status;
  }
}

function statusColor(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "complete": return "default";
    case "error": return "destructive";
    case "processing": return "secondary";
    default: return "outline";
  }
}

function progressPercent(status: string) {
  switch (status) {
    case "queued": return 10;
    case "processing": return 60;
    case "complete": return 100;
    case "error": return 100;
    default: return 0;
  }
}

// ─── Style Preview Modal ──────────────────────────────────────────────────────

interface StylePreviewModalProps {
  open: boolean;
  onClose: () => void;
  styleId: string;
  trimSizeId: string;
}

function StylePreviewModal({ open, onClose, styleId, trimSizeId }: StylePreviewModalProps) {
  const { data, isLoading, error } = trpc.autoProduce.preview.useQuery(
    { styleId, trimSizeId },
    { enabled: open && !!styleId && !!trimSizeId }
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Write the HTML into the iframe once data arrives
  useEffect(() => {
    if (!data?.html || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (doc) {
      doc.open();
      doc.write(data.html);
      doc.close();
    }
  }, [data?.html]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-[#1a1008] border-[#4a3828]">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#4a3828]">
          <div>
            <DialogHeader>
              <DialogTitle className="text-[#f5ede4] font-serif text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#c9a96e]" />
                Style Preview
              </DialogTitle>
              <DialogDescription className="text-[#a08060] text-xs mt-0.5">
                {data ? (
                  <span>
                    <strong className="text-[#c9a96e]">{data.styleLabel}</strong>
                    {" · "}
                    <strong className="text-[#c9a96e]">{data.trimLabel}</strong>
                    {" — sample page rendered at actual proportions"}
                  </span>
                ) : (
                  "Rendering sample page…"
                )}
              </DialogDescription>
            </DialogHeader>
          </div>
          <button
            onClick={onClose}
            className="text-[#a08060] hover:text-[#f5ede4] transition-colors p-1 rounded"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview area */}
        <div className="relative bg-[#2a1f10] flex items-center justify-center"
          style={{ minHeight: 520 }}>
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-[#c9a96e]" />
              <p className="text-[#a08060] text-sm">Rendering style preview…</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-red-300 text-sm">Failed to load preview</p>
            </div>
          )}
          {data && (
            <div className="py-6 px-4 flex items-center justify-center w-full overflow-auto">
              {/* Scale the page to fit the modal without scrolling */}
              <div
                style={{
                  // Scale the page proportionally to fit within ~700px wide
                  transform: `scale(${Math.min(1, 700 / data.pageWidthPx)})`,
                  transformOrigin: "top center",
                  width: data.pageWidthPx,
                  height: data.pageHeightPx,
                  flexShrink: 0,
                }}
              >
                <iframe
                  ref={iframeRef}
                  title="Style Preview"
                  sandbox="allow-same-origin"
                  style={{
                    width: data.pageWidthPx,
                    height: data.pageHeightPx,
                    border: "none",
                    display: "block",
                    background: "#fff",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#4a3828] bg-[#1a1008]">
          <p className="text-xs text-[#7a6050]">
            This is a sample page using classic literature. Your manuscript will be typeset in this style.
          </p>
          <Button
            size="sm"
            onClick={onClose}
            className="bg-[#8b5e3c] hover:bg-[#7a4f30] text-white text-xs gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Looks good — continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Job Status Card ─────────────────────────────────────────────────────────

function JobCard({ jobId, projectId }: { jobId: number; projectId: number }) {
  const [enabled, setEnabled] = useState(true);
  const { data: job } = trpc.autoProduce.status.useQuery(
    { jobId },
    {
      refetchInterval: enabled ? 3000 : false,
      enabled,
    }
  );

  useEffect(() => {
    if (job?.status === "complete" || job?.status === "error") {
      setEnabled(false);
    }
  }, [job?.status]);

  if (!job) return null;

  const pct = progressPercent(job.status);
  const isActive = job.status === "queued" || job.status === "processing";

  return (
    <Card className="border border-[#d4b896]/40 bg-[#fdf9f3]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isActive ? (
              <Loader2 className="w-4 h-4 text-[#8b5e3c] animate-spin" />
            ) : job.status === "complete" ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <CardTitle className="text-sm font-semibold text-[#3d2b1f]">
              {job.manuscriptFileName ?? "Manuscript"}
            </CardTitle>
          </div>
          <Badge variant={statusColor(job.status)} className="text-xs">
            {statusLabel(job.status)}
          </Badge>
        </div>
        <div className="flex gap-4 text-xs text-[#8b7b6b] mt-1">
          <span>Trim: <strong>{job.trimSizeId}</strong></span>
          <span>Style: <strong>{job.styleId}</strong></span>
          {job.wordCount ? <span>{job.wordCount.toLocaleString()} words</span> : null}
          {job.chapterCount ? <span>{job.chapterCount} chapters</span> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-[#8b7b6b] mb-1">
            <span>{isActive ? "AI is typesetting your manuscript…" : job.status === "complete" ? "Production complete" : "Production failed"}</span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        {job.status === "error" && job.errorMessage && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <strong>Error:</strong> {job.errorMessage}
          </div>
        )}

        {job.status === "complete" && (
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex gap-3">
              {job.pdfUrl && (
                <a
                  href={job.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="default" size="sm" className="w-full bg-[#8b5e3c] hover:bg-[#7a4f30] text-white gap-2">
                    <FileDown className="w-4 h-4" />
                    Download Interior PDF
                  </Button>
                </a>
              )}
              {job.epubUrl && (
                <a
                  href={job.epubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full border-[#8b5e3c] text-[#8b5e3c] hover:bg-[#f5ede4] gap-2">
                    <BookOpen className="w-4 h-4" />
                    Download EPUB
                  </Button>
                </a>
              )}
            </div>
            {typeof (job as Record<string, unknown>).idmlUrl === 'string' && (
              <a
                href={(job as Record<string, unknown>).idmlUrl as string}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="w-full border-[#5c3d2e] text-[#5c3d2e] hover:bg-[#f5ede4] gap-2">
                  <FileDown className="w-4 h-4" />
                  Download InDesign (.idml)
                </Button>
              </a>
            )}
          </div>
        )}

        <p className="text-xs text-[#b09880]">
          Started {new Date(job.createdAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AutoProduce() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id ?? "0", 10);
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: options } = trpc.autoProduce.options.useQuery();
  const { data: jobs, refetch: refetchJobs } = trpc.autoProduce.list.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );
  const { data: projectData } = trpc.project.get.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [trimSizeId, setTrimSizeId] = useState("");
  const [styleId, setStyleId] = useState("");
  const [outputFormat, setOutputFormat] = useState<"both" | "pdf" | "epub">("both");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [styleAutoSelected, setStyleAutoSelected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-select Scripture / Reference style when the project genre is "Bible / Scripture"
  useEffect(() => {
    if (!projectData?.project) return;
    const genre = projectData.project.genre;
    if (genre === "Bible / Scripture" && !styleId) {
      setStyleId("scripture");
      setStyleAutoSelected(true);
    }
  }, [projectData?.project?.genre]);

  const startMutation = trpc.autoProduce.start.useMutation({
    onSuccess: () => {
      setSelectedFile(null);
      setTrimSizeId("");
      setStyleId("");
      refetchJobs();
      toast.success("Production job started! The AI is now typesetting your manuscript.");
    },
    onError: (err) => {
      toast.error(`Failed to start: ${err.message}`);
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    const validExt = ACCEPTED_EXT.split(",").includes(ext);
    const validMime = ACCEPTED_TYPES.includes(file.type);
    if (!validExt && !validMime) {
      toast.error(
        "Unsupported file type. Accepted: Word, PDF, TXT, MD, HTML, RTF, XLSX, XLS, Numbers, ODT, CSV, EPUB."
      );
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleSubmit = async () => {
    if (!selectedFile || !trimSizeId || !styleId) return;
    setIsSubmitting(true);
    try {
      const fileBase64 = await fileToBase64(selectedFile);
      await startMutation.mutateAsync({
        projectId,
        trimSizeId,
        styleId,
        outputFormat,
        fileName: selectedFile.name,
        mimeType: selectedFile.type || "text/plain",
        fileBase64,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b5e3c]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#5c3d2e] font-serif text-xl">Please sign in to use Auto-Produce.</p>
          <Button onClick={() => window.location.href = getLoginUrl()} className="bg-[#8b5e3c] hover:bg-[#7a4f30] text-white">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const project = projectData?.project;
  const canPreview = !!(trimSizeId && styleId);
  const canSubmit = selectedFile && trimSizeId && styleId && !isSubmitting;

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <header className="bg-[#1a1008] text-[#f5ede4] px-6 py-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/project/${projectId}`)}
              className="text-[#c9a96e] hover:text-[#f5ede4] hover:bg-[#2a1f10] gap-2 px-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tracker
            </Button>
            <div className="h-5 w-px bg-[#4a3828]" />
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c9a96e]" />
                <h1 className="font-serif text-lg font-semibold text-[#f5ede4]">Auto-Produce</h1>
              </div>
              {project && (
                <p className="text-xs text-[#a08060] mt-0.5">{project.title}</p>
              )}
            </div>
          </div>
          <div className="text-xs text-[#a08060]">
            AI-powered typesetting
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Intro */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#f5ede4] border border-[#d4b896]/50 rounded-full px-4 py-1.5 text-sm text-[#8b5e3c] font-medium">
            <Wand2 className="w-4 h-4" />
            AI Typesetting Pipeline
          </div>
          <h2 className="font-serif text-3xl text-[#3d2b1f]">Upload your manuscript</h2>
          <p className="text-[#8b7b6b] max-w-xl mx-auto text-sm leading-relaxed">
            Upload your manuscript in Word, PDF, or plain text format. The AI will detect chapters,
            apply professional typesetting, and produce a press-ready interior PDF and an EPUB ebook.
          </p>
        </div>

        {/* Upload Form */}
        <Card className="border border-[#d4b896]/40 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-[#3d2b1f] text-xl">New Production Run</CardTitle>
            <CardDescription className="text-[#8b7b6b]">
              Configure your trim size and style, preview the look, then upload your manuscript to begin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Configuration row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#5c3d2e]">Trim Size</label>
                <Select value={trimSizeId} onValueChange={setTrimSizeId}>
                  <SelectTrigger className="border-[#d4b896]/60 bg-[#fdf9f3] text-[#3d2b1f]">
                    <SelectValue placeholder="Select trim size…" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.trimSizes.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label} ({t.widthIn}" × {t.heightIn}")
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#5c3d2e]">Typesetting Style</label>
                <Select value={styleId} onValueChange={(v) => { setStyleId(v); setStyleAutoSelected(false); }}>
                  <SelectTrigger className="border-[#d4b896]/60 bg-[#fdf9f3] text-[#3d2b1f]">
                    <SelectValue placeholder="Select style…" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.styles.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {styleAutoSelected && (
                  <p className="text-xs text-[#8b5e3c] flex items-center gap-1.5 mt-1">
                    <Sparkles className="w-3 h-3 flex-shrink-0" />
                    Auto-selected based on your project genre (Bible / Scripture). You can change it above.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#5c3d2e]">Output Format</label>
                <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as "both" | "pdf" | "epub")}>
                  <SelectTrigger className="border-[#d4b896]/60 bg-[#fdf9f3] text-[#3d2b1f]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">
                      <span className="flex items-center gap-1.5"><FileDown className="w-3.5 h-3.5" /> Interior PDF + EPUB</span>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Interior PDF only</span>
                    </SelectItem>
                    <SelectItem value="epub">
                      <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> EPUB only</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview Style button — shown once both dropdowns are selected */}
            {canPreview && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f5ede4] border border-[#d4b896]/40">
                <Eye className="w-4 h-4 text-[#8b5e3c] flex-shrink-0" />
                <p className="text-sm text-[#5c3d2e] flex-1">
                  See how your book will look before committing to the full pipeline.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewOpen(true)}
                  className="border-[#8b5e3c] text-[#8b5e3c] hover:bg-[#f5ede4] gap-1.5 flex-shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview Style
                </Button>
              </div>
            )}

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-[#8b5e3c] bg-[#f5ede4]"
                  : selectedFile
                  ? "border-green-400 bg-green-50"
                  : "border-[#d4b896]/60 bg-[#fdf9f3] hover:border-[#8b5e3c]/50 hover:bg-[#f5ede4]/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXT}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                  <p className="font-medium text-green-700">{selectedFile.name}</p>
                  <p className="text-xs text-green-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — click to change
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-10 h-10 text-[#c9a96e] mx-auto" />
                  <div>
                    <p className="font-medium text-[#5c3d2e]">Drop your manuscript here</p>
                    <p className="text-xs text-[#8b7b6b] mt-1">
                      or click to browse — max {MAX_FILE_SIZE_MB}MB
                    </p>
                    <p className="text-[10px] text-[#b09880] mt-1">
                      Word · PDF · TXT · MD · HTML · RTF · XLSX · XLS · Numbers · ODT · CSV · EPUB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-[#8b5e3c] hover:bg-[#7a4f30] text-white font-medium py-5 gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting production…
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Start AI Production
                </>
              )}
            </Button>

            {(!trimSizeId || !styleId || !selectedFile) && (
              <p className="text-xs text-center text-[#b09880]">
                {!selectedFile ? "Upload a manuscript file" : !trimSizeId ? "Select a trim size" : "Select a typesetting style"} to continue
              </p>
            )}
          </CardContent>
        </Card>

        {/* Previous Jobs */}
        {jobs && jobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#8b7b6b]" />
              <h3 className="font-serif text-lg text-[#3d2b1f]">Production History</h3>
              <span className="text-xs text-[#b09880]">({jobs.length} run{jobs.length !== 1 ? "s" : ""})</span>
            </div>
            <div className="space-y-3">
              {[...jobs].reverse().map(job => (
                <JobCard key={job.id} jobId={job.id} projectId={projectId} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {jobs && jobs.length === 0 && (
          <div className="text-center py-12 text-[#b09880]">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No production runs yet. Upload your manuscript above to get started.</p>
          </div>
        )}

        {/* What the AI does */}
        <Card className="border border-[#d4b896]/30 bg-[#fdf9f3]">
          <CardHeader>
            <CardTitle className="font-serif text-[#3d2b1f] text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c9a96e]" />
              What the AI does
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: FileText, step: "1. Parse", desc: "Extracts text from your .docx, .pdf, or .txt file" },
                { icon: Wand2, step: "2. Structure", desc: "AI detects chapters, frontmatter, and backmatter" },
                { icon: BookOpen, step: "3. Typeset", desc: "Applies professional layout with your chosen style" },
                { icon: Download, step: "4. Output", desc: "Renders press-ready interior PDF and EPUB ebook" },
              ].map(({ icon: Icon, step, desc }) => (
                <div key={step} className="text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#f5ede4] border border-[#d4b896]/40 flex items-center justify-center mx-auto">
                    <Icon className="w-4 h-4 text-[#8b5e3c]" />
                  </div>
                  <p className="text-xs font-semibold text-[#5c3d2e]">{step}</p>
                  <p className="text-xs text-[#8b7b6b] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Style Preview Modal */}
      <StylePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        styleId={styleId}
        trimSizeId={trimSizeId}
      />
    </div>
  );
}
