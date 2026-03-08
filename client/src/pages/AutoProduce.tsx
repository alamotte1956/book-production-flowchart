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
import { Link, useParams, useLocation, useSearch } from "wouter";
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
  ChevronDown, ChevronUp, RefreshCw, Copy, Terminal,
  File, Image, Archive, FileCode, FileSpreadsheet, ShieldCheck, Info,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import WhatsNext from "@/components/WhatsNext";
import type { NextPrompt } from "@shared/prompts";
import { isKdpCompatible } from "@shared/bibleSpecs";
import JSZip from "jszip";

const MAX_FILE_SIZE_MB = 50;
const ACCEPTED_TYPES = [
  // Word
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  // PDF
  "application/pdf",
  // Plain text & markup
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "text/html",
  "application/xhtml+xml",
  "text/xml",
  "application/xml",
  "text/rtf",
  "application/rtf",
  "application/x-rtf",
  // Excel / Spreadsheets
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  // Apple Numbers (zip-based)
  "application/vnd.apple.numbers",
  "application/x-iwork-numbers-sffnumbers",
  // OpenDocument
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  // CSV / TSV
  "text/csv",
  "application/csv",
  "text/tab-separated-values",
  // Data formats
  "application/json",
  "text/json",
  // ePub
  "application/epub+zip",
  // Images
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/tiff",
  "image/gif",
  "image/svg+xml",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/octet-stream",
];
const ACCEPTED_EXT = [
  ".docx", ".doc", ".odt", ".pages",
  ".pdf",
  ".txt", ".text", ".log", ".asc",
  ".md", ".markdown", ".mdx",
  ".html", ".htm", ".xml",
  ".rtf",
  ".xlsx", ".xls",
  ".numbers",
  ".ods",
  ".csv", ".tsv",
  ".json", ".yaml", ".yml",
  ".epub",
  // Images
  ".png", ".jpg", ".jpeg", ".webp", ".tiff", ".tif", ".gif", ".svg",
  // Archives
  ".zip", ".rar",
].join(",");

const FORMAT_BADGES = [
  { label: "DOCX", group: "word" },
  { label: "DOC", group: "word" },
  { label: "ODT", group: "word" },
  { label: "Pages", group: "word" },
  { label: "PDF", group: "pdf" },
  { label: "RTF", group: "rich" },
  { label: "TXT", group: "text" },
  { label: "MD", group: "markup" },
  { label: "HTML", group: "markup" },
  { label: "XML", group: "markup" },
  { label: "CSV", group: "data" },
  { label: "TSV", group: "data" },
  { label: "JSON", group: "data" },
  { label: "YAML", group: "data" },
  { label: "XLSX", group: "sheet" },
  { label: "XLS", group: "sheet" },
  { label: "Numbers", group: "sheet" },
  { label: "EPUB", group: "ebook" },
  { label: "PNG", group: "image" },
  { label: "JPG", group: "image" },
  { label: "WebP", group: "image" },
  { label: "SVG", group: "image" },
  { label: "TIFF", group: "image" },
  { label: "GIF", group: "image" },
  { label: "ZIP", group: "archive" },
  { label: "RAR", group: "archive" },
] as const;

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
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [retryJobId, setRetryJobId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data: job } = trpc.autoProduce.status.useQuery(
    { jobId },
    {
      refetchInterval: enabled ? 3000 : false,
      enabled,
    }
  );

  const retryMutation = trpc.autoProduce.retry.useMutation({
    onSuccess: (data) => {
      setRetryJobId(data.jobId);
      setEnabled(true);
      utils.autoProduce.list.invalidate({ projectId });
      toast.success("Retry started — the AI is reprocessing your manuscript.");
    },
    onError: (err) => {
      toast.error(`Retry failed: ${err.message}`);
    },
  });

  useEffect(() => {
    if (job?.status === "complete" || job?.status === "error") {
      setEnabled(false);
    }
  }, [job?.status]);

  if (!job) return null;

  const pct = progressPercent(job.status);
  const isActive = job.status === "queued" || job.status === "processing";

  return (
    <Card className="border border-[#e8dfd0] bg-white shadow-sm">
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
            <CardTitle className="text-sm font-semibold text-[#2c1a00]">
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

        {job.status === "error" && (
          <div className="rounded-lg border border-red-200 bg-red-50 overflow-hidden">
            {/* Error header */}
            <div className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800 mb-1">Production Failed</p>
                {job.errorMessage && (
                  <p className="text-sm text-red-700 break-words leading-relaxed">
                    {job.errorMessage}
                  </p>
                )}
              </div>
            </div>

            {(job.errorType === "format_unsupported" || job.errorType === "parse_empty") && (
              <div className="mx-4 mb-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-amber-700" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      {job.errorType === "format_unsupported"
                        ? "Unsupported File Format"
                        : "No Text Could Be Extracted"}
                    </p>
                    <p className="text-sm text-amber-800 mb-2">
                      {job.errorType === "format_unsupported"
                        ? <>The file <strong className="font-mono">{job.manuscriptFileName ?? "uploaded file"}</strong>{(() => { const ext = (job.manuscriptFileName ?? "").split(".").pop()?.toLowerCase(); return ext ? <> (.<span className="font-mono">{ext}</span>)</> : null; })()} is in a format that Auto-Produce cannot process directly.</>
                        : <>No readable text was found in <strong className="font-mono">{job.manuscriptFileName ?? "the uploaded file"}</strong>{(() => { const ext = (job.manuscriptFileName ?? "").split(".").pop()?.toLowerCase(); return ext ? <> (.<span className="font-mono">{ext}</span>)</> : null; })()} . The file may be image-only, password-protected, or empty.</>
                      }
                    </p>
                    <p className="text-xs font-semibold text-amber-800 mb-2">Convert your file using one of these tools, then re-upload:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { name: "Microsoft Word", desc: "Open → File → Save As → .docx" },
                        { name: "Google Docs", desc: "Upload → File → Download as → .docx" },
                        { name: "LibreOffice Writer", desc: "Free & open-source — export to .docx or .pdf" },
                        { name: "Pandoc (CLI)", desc: "pandoc input.ext -o output.docx" },
                      ].map(tool => (
                        <div key={tool.name} className="flex items-start gap-2 bg-white/70 rounded border border-amber-200 px-3 py-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-amber-900">{tool.name}</p>
                            <p className="text-xs text-amber-700">{tool.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-amber-700 mt-2">
                      Supported formats: <strong>.docx</strong>, <strong>.pdf</strong>, <strong>.txt</strong>, <strong>.md</strong>, <strong>.html</strong>, <strong>.rtf</strong>, <strong>.csv</strong>, <strong>.json</strong>, <strong>.xlsx</strong>, <strong>.odt</strong>, <strong>.epub</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
              {(job.retryCount ?? 0) >= 3 ? (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100 border border-red-200 rounded-md px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    <strong>Max retries reached</strong> (3 of 3 attempts used). Please upload a corrected manuscript file to start a new job.
                  </span>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  className="bg-red-600 hover:bg-red-700 text-white gap-2 text-xs"
                  disabled={retryMutation.isPending}
                  onClick={() => retryMutation.mutate({ jobId: job.id })}
                >
                  {retryMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  {retryMutation.isPending
                    ? "Retrying…"
                    : `Retry Job (${(job.retryCount ?? 0) + 1} of 3)`}
                </Button>
              )}
              {job.errorMessage && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-100 gap-2 text-xs"
                  onClick={() => {
                    const report = JSON.stringify({
                      context: "Auto-Produce",
                      timestamp: new Date().toISOString(),
                      jobId: job.id,
                      file: job.manuscriptFileName ?? "(unknown)",
                      trimSizeId: job.trimSizeId,
                      styleId: job.styleId,
                      wordCount: job.wordCount ?? 0,
                      chapterCount: job.chapterCount ?? 0,
                      retryCount: job.retryCount ?? 0,
                      failedStage: (job as { failedStage?: string }).failedStage ?? null,
                      errorType: job.errorType ?? null,
                      errorMessage: job.errorMessage,
                      failedAt: new Date(job.updatedAt).toISOString(),
                    }, null, 2);
                    navigator.clipboard.writeText(report).catch(() => {
                      const ta = document.createElement("textarea");
                      ta.value = report;
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand("copy");
                      document.body.removeChild(ta);
                    });
                    toast.success("Full error report copied to clipboard");
                  }}
                >
                  <Copy className="w-3 h-3" />
                  Copy Error Report
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-800 hover:bg-red-100 gap-1 text-xs ml-auto"
                onClick={() => setShowTechDetails(v => !v)}
              >
                <Terminal className="w-3 h-3" />
                Technical Details
                {showTechDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
            </div>

            {/* Collapsible technical details */}
            {showTechDetails && (
              <div className="border-t border-red-200 bg-red-900/5 px-4 py-3">
                <p className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" />
                  Diagnostic Information
                </p>
                <div className="font-mono text-xs text-red-800 space-y-1 bg-white/60 rounded border border-red-200 p-3">
                  <div className="flex gap-2">
                    <span className="text-red-500 w-28 flex-shrink-0">Job ID</span>
                    <span>#{job.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-red-500 w-28 flex-shrink-0">File</span>
                    <span className="break-all">{job.manuscriptFileName ?? "(unknown)"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-red-500 w-28 flex-shrink-0">Trim Size</span>
                    <span>{job.trimSizeId}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-red-500 w-28 flex-shrink-0">Style</span>
                    <span>{job.styleId}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-red-500 w-28 flex-shrink-0">Failed At</span>
                    <span>{new Date(job.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-red-500 w-28 flex-shrink-0">Retry Attempts</span>
                    <span className={(job.retryCount ?? 0) >= 3 ? "text-red-600 font-semibold" : ""}>
                      {job.retryCount ?? 0} of 3{(job.retryCount ?? 0) >= 3 ? " — limit reached" : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-red-500 w-28 flex-shrink-0">Error Type</span>
                    <span className="font-semibold">{job.errorType ?? "unknown"}</span>
                  </div>
                  {(job as { failedStage?: string }).failedStage && (
                    <div className="flex gap-2">
                      <span className="text-red-500 w-28 flex-shrink-0">Failed Stage</span>
                      <span className="font-semibold text-red-700">{(job as { failedStage?: string }).failedStage}</span>
                    </div>
                  )}
                  {job.wordCount ? (
                    <div className="flex gap-2">
                      <span className="text-red-500 w-28 flex-shrink-0">Words Parsed</span>
                      <span>{job.wordCount.toLocaleString()} (parsing succeeded)</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <span className="text-red-500 w-28 flex-shrink-0">Words Parsed</span>
                      <span className="text-red-600">0 (failed during parsing)</span>
                    </div>
                  )}
                  {job.errorMessage && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <p className="text-red-500 mb-1">Full Error Message</p>
                      <p className="text-red-800 break-all whitespace-pre-wrap">{job.errorMessage}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-red-600 mt-2">
                  <strong>Tip:</strong> The <em>Failed Stage</em> field tells you exactly where the pipeline stopped.
                  {" "}"chapter-detection" → LLM issue (retry or simplify the file).
                  {" "}"pdf-rendering" → Chromium issue (retry usually resolves this).
                  {" "}"epub-generation" → EPUB packaging issue (retry or switch to PDF-only).
                  {" "}"config-resolution" → Invalid trim/style ID (contact support).
                  {" "}Use <strong>Copy Error Report</strong> to share the full report with support.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Show new retry job card if retry was triggered */}
        {retryJobId && retryJobId !== job.id && (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-center gap-2">
            <RefreshCw className="w-3 h-3 flex-shrink-0" />
            Retry job #{retryJobId} is now processing. Scroll down to see its status.
          </div>
        )}

        {job.status === "complete" && (() => {
          const kdpTrim = isKdpCompatible(job.trimSizeId);
          const hasKdpPdf = !!job.kdpPdfUrl;
          const hasBleed = hasKdpPdf;
          const hasFontEmbedding = true;
          const hasPdfFormat = !!job.pdfUrl;
          const hasEpubFormat = !!job.epubUrl;
          const allChecksPass = kdpTrim && hasBleed && hasFontEmbedding && hasPdfFormat && hasEpubFormat;

          return (
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex gap-3">
                {hasKdpPdf && (
                  <a
                    href={job.kdpPdfUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="default" size="sm" className="w-full bg-[#8b5e3c] hover:bg-[#7a4f30] text-white gap-2">
                      <FileDown className="w-4 h-4" />
                      Download Print PDF (KDP-Ready)
                    </Button>
                  </a>
                )}
                {!hasKdpPdf && job.pdfUrl && (
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
                    <Button variant="default" size="sm" className="w-full bg-[#5c3d8a] hover:bg-[#4a2d6e] text-white gap-2">
                      <BookOpen className="w-4 h-4" />
                      Download Kindle EPUB
                    </Button>
                  </a>
                )}
              </div>
              {hasKdpPdf && job.pdfUrl && (
                <a
                  href={job.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full border-[#d4b896] text-[#8b7b6b] hover:bg-[#f5ede4] gap-2">
                    <FileDown className="w-4 h-4" />
                    Download Screen PDF (no bleed)
                  </Button>
                </a>
              )}
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

              <div className="rounded-lg border border-[#e8dfd0] bg-[#fdf9f3] p-4 mt-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#8b5e3c]" />
                    <span className="text-sm font-semibold text-[#3d2b1f]">KDP Compliance Checklist</span>
                  </div>
                  {allChecksPass && (
                    <Badge className="bg-green-100 text-green-800 border-green-300 gap-1 text-xs font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready for Amazon
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {[
                    {
                      label: "Trim size",
                      pass: kdpTrim,
                      tooltip: "Amazon KDP only accepts specific trim sizes. Your selected size must match one of Amazon's accepted dimensions.",
                    },
                    {
                      label: "Interior margins",
                      pass: kdpTrim && hasBleed,
                      tooltip: "KDP requires minimum interior margins based on page count: ≥0.375\" for <150 pages, ≥0.75\" for 150–400 pages, ≥1.0\" for 400+ pages.",
                    },
                    {
                      label: "Bleed (0.125\" included)",
                      pass: hasBleed,
                      tooltip: "Print-ready PDFs for KDP must include 0.125\" bleed on the outside, top, and bottom edges so ink extends to the trim edge.",
                    },
                    {
                      label: "Font embedding",
                      pass: hasFontEmbedding,
                      tooltip: "All fonts must be embedded in the PDF to ensure consistent rendering. Google Fonts used in typesetting are embedded automatically.",
                    },
                    {
                      label: "File format",
                      pass: hasPdfFormat && hasEpubFormat,
                      tooltip: "KDP requires PDF for print interiors and EPUB for Kindle ebook. Both formats have been generated.",
                    },
                  ].map((check) => (
                    <div key={check.label} className="flex items-center gap-2">
                      {check.pass ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      )}
                      <span className={`text-xs ${check.pass ? "text-green-800" : "text-amber-700"}`}>
                        {check.label}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-[#b09880] cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[250px] text-xs">
                          {check.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
                {!allChecksPass && (
                  <p className="text-xs text-amber-700 mt-3 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {!kdpTrim
                      ? "Selected trim size is not accepted by Amazon KDP. Choose a KDP-compatible size for full compliance."
                      : "Some KDP requirements are not met. Review the checklist above."}
                  </p>
                )}
              </div>

              <WhatsNext
                compact
                className="mt-2"
                prompts={[
                  {
                    id: "after_produce_cover",
                    title: "Design Your Book Cover",
                    description: "Your interior is ready! Next, generate a full-wrap cover spec sheet with exact dimensions for your printer.",
                    actionLabel: "Open Cover Designer",
                    actionRoute: "/cover-designer",
                    icon: "cover_designer",
                    priority: "high",
                  } satisfies NextPrompt,
                ]}
              />
            </div>
          );
        })()}

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
  const searchString = useSearch();
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zipContents, setZipContents] = useState<Array<{ name: string; size: number }> | null>(null);
  const [trimSizeId, setTrimSizeId] = useState("");
  const [styleId, setStyleId] = useState("");
  const [outputFormat, setOutputFormat] = useState<"both" | "pdf" | "epub">("both");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [styleAutoSelected, setStyleAutoSelected] = useState(false);
  const [trimAutoSelected, setTrimAutoSelected] = useState(false);
  const [templateName, setTemplateName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate / revoke object URL for image previews
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const isImage = selectedFile.type.startsWith("image/");
    if (!isImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    const urlParams = new URLSearchParams(searchString);
    const paramStyle = urlParams.get("style");
    const paramTrim = urlParams.get("trim");
    const paramTemplate = urlParams.get("template");
    if (paramStyle && !styleId) {
      setStyleId(paramStyle);
      setStyleAutoSelected(true);
    }
    if (paramTrim && !trimSizeId) {
      setTrimSizeId(paramTrim);
      setTrimAutoSelected(true);
    }
    if (paramTemplate) {
      setTemplateName(paramTemplate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Read ZIP contents when a .zip file is selected
  useEffect(() => {
    if (!selectedFile) {
      setZipContents(null);
      return;
    }
    const isZip =
      selectedFile.type === "application/zip" ||
      selectedFile.type === "application/x-zip-compressed" ||
      selectedFile.name.toLowerCase().endsWith(".zip");
    if (!isZip) {
      setZipContents(null);
      return;
    }
    let cancelled = false;
    selectedFile.arrayBuffer().then((buf) => {
      return JSZip.loadAsync(buf);
    }).then((zip) => {
      if (cancelled) return;
      const entries: Array<{ name: string; size: number }> = [];
      zip.forEach((relativePath, file) => {
        if (!file.dir) {
          entries.push({
            name: relativePath,
            size: (file as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0,
          });
        }
      });
      entries.sort((a, b) => a.name.localeCompare(b.name));
      setZipContents(entries);
    }).catch(() => {
      if (!cancelled) setZipContents([]);
    });
    return () => { cancelled = true; };
  }, [selectedFile]);

  // Auto-select Scripture style + standard Bible trim when genre is "Bible / Scripture".
  // Only fires once when project data first loads (both fields are empty at that point).
  // Manually changing either dropdown clears its auto-selected indicator.
  useEffect(() => {
    if (!projectData?.project) return;
    const genre = projectData.project.genre;
    if (genre === "Bible / Scripture") {
      if (!styleId) {
        setStyleId("scripture");
        setStyleAutoSelected(true);
      }
      if (!trimSizeId) {
        setTrimSizeId("bible-standard");
        setTrimAutoSelected(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectData?.project?.genre]); // intentionally omit styleId/trimSizeId — fire only on genre load

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
        "Unsupported file type. Accepted: Word, PDF, TXT, MD, HTML, RTF, XLSX, ODT, CSV, EPUB, images (PNG/JPG/WebP/SVG/TIFF/GIF), and archives (ZIP/RAR)."
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
  const canSubmit = selectedFile && trimSizeId && styleId && !isSubmitting && projectId > 0;

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <header className="bg-[#2a1a0a] text-[#f5ede4] px-6 py-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/project/${projectId}`)}
              className="text-[#c9a96e] hover:text-white transition-colors p-1 rounded"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
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
        <Card className="border border-[#e8dfd0] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-[#2c1a00] text-xl">New Production Run</CardTitle>
            <CardDescription className="text-[#8b7b6b]">
              Configure your trim size and style, preview the look, then upload your manuscript to begin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {templateName && (
              <div className="flex items-center gap-3 rounded-lg border border-[#c9a96e]/30 bg-[#fdf9f3] px-4 py-3">
                <Info className="w-4 h-4 text-[#c9a96e] flex-shrink-0" />
                <p className="text-sm text-[#5c3d2e]">
                  Pre-filled from CDP template: <strong className="text-[#3d2b1f]">{templateName}</strong>.
                  {" "}Style and trim size have been set automatically — you can adjust them below.
                </p>
                <button
                  onClick={() => setTemplateName(null)}
                  className="ml-auto text-[#a89880] hover:text-[#5c3d2e] transition-colors p-0.5"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {/* Configuration row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#5c3d2e]">Trim Size</label>
                <Select value={trimSizeId} onValueChange={(v) => { setTrimSizeId(v); setTrimAutoSelected(false); }}>
                  <SelectTrigger className="border-[#d4b896]/60 bg-[#fdf9f3] text-[#3d2b1f]">
                    <SelectValue placeholder="Select trim size…" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.trimSizes.map(t => {
                      const kdp = isKdpCompatible(t.id);
                      return (
                        <SelectItem key={t.id} value={t.id}>
                          <span className="flex items-center gap-2">
                            {t.label} ({t.widthIn}" × {t.heightIn}")
                            {kdp && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-400 text-green-700 bg-green-50 font-medium">
                                KDP
                              </Badge>
                            )}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {trimAutoSelected && (
                  <p className="text-xs text-[#8b5e3c] flex items-center gap-1.5 mt-1">
                    <Sparkles className="w-3 h-3 flex-shrink-0" />
                    Auto-selected for Bible / Scripture (5.25" × 8"). You can change it above.
                  </p>
                )}
                {trimSizeId && !isKdpCompatible(trimSizeId) && (
                  <p className="text-xs text-amber-700 flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    This trim size is not accepted by Amazon KDP. If you plan to publish on Amazon, choose a size marked "KDP".
                  </p>
                )}
                {trimSizeId && isKdpCompatible(trimSizeId) && !trimAutoSelected && (
                  <p className="text-xs text-green-700 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    Amazon KDP compatible
                  </p>
                )}
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
                <div className="space-y-2 w-full">
                  {/* Image preview */}
                  {previewUrl && (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={previewUrl}
                        alt="Selected image preview"
                        className="max-h-40 max-w-full rounded-md object-contain border border-green-300 shadow-sm"
                      />
                      <p className="font-medium text-green-700 text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-green-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — click to change
                      </p>
                    </div>
                  )}

                  {/* ZIP contents preview */}
                  {zipContents !== null && !previewUrl && (
                    <div className="w-full text-left">
                      <div className="flex items-center gap-2 mb-2 justify-center">
                        <Archive className="w-6 h-6 text-amber-600" />
                        <p className="font-medium text-green-700 text-sm">{selectedFile.name}</p>
                        <span className="text-xs text-green-600">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      {zipContents.length === 0 ? (
                        <p className="text-xs text-center text-amber-600">ZIP appears to be empty or unreadable.</p>
                      ) : (
                        <div className="max-h-36 overflow-y-auto rounded-md border border-green-200 bg-green-50 divide-y divide-green-100">
                          {zipContents.map((entry) => {
                            const ext = entry.name.split(".").pop()?.toLowerCase() ?? "";
                            const isImg = ["png","jpg","jpeg","webp","gif","svg","tiff"].includes(ext);
                            const isDoc = ["docx","doc","pdf","txt","md","rtf","odt","epub"].includes(ext);
                            const isSheet = ["xlsx","xls","csv","ods"].includes(ext);
                            const isCode = ["html","htm","xml","json"].includes(ext);
                            const Icon = isImg ? Image : isDoc ? FileText : isSheet ? FileSpreadsheet : isCode ? FileCode : File;
                            const kb = entry.size > 0 ? `${(entry.size / 1024).toFixed(1)} KB` : "";
                            return (
                              <div key={entry.name} className="flex items-center gap-2 px-3 py-1.5">
                                <Icon className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                <span className="text-xs text-green-800 truncate flex-1" title={entry.name}>
                                  {entry.name.split("/").pop()}
                                </span>
                                {kb && <span className="text-[10px] text-green-500 flex-shrink-0">{kb}</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <p className="text-[10px] text-center text-green-600 mt-1.5">click to change</p>
                    </div>
                  )}

                  {/* Default non-image, non-zip file confirmation */}
                  {!previewUrl && zipContents === null && (
                    <>
                      <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                      <p className="font-medium text-green-700">{selectedFile.name}</p>
                      <p className="text-xs text-green-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — click to change
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-10 h-10 text-[#c9a96e] mx-auto" />
                  <div>
                    <p className="font-medium text-[#5c3d2e]">Drop your manuscript here</p>
                    <p className="text-xs text-[#8b7b6b] mt-1">
                      or click to browse — max {MAX_FILE_SIZE_MB}MB
                    </p>
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                      {FORMAT_BADGES.map((f) => (
                        <span
                          key={f.label}
                          className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-[#f5ede4] border border-[#d4b896]/40 text-[#5c3d2e]"
                        >
                          {f.label}
                        </span>
                      ))}
                    </div>
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

            {projectId === 0 && (
              <div className="text-xs text-center text-[#b09880] space-y-1">
                <p>You're previewing settings from a template.</p>
                <Link href="/dashboard" className="text-[#8b5e3c] underline hover:text-[#6b4226]">
                  Create a project first
                </Link>
                <span> to start production.</span>
              </div>
            )}
            {projectId > 0 && (!trimSizeId || !styleId || !selectedFile) && (
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
        <Card className="border border-[#e8dfd0] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-[#2c1a00] text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c9a96e]" />
              What the AI does
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: FileText, step: "1. Parse", desc: "Extracts text from 25+ formats including DOCX, PDF, TXT, MD, HTML, RTF, CSV, JSON, and more" },
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

      {/* Related Tools footer backlinks */}
      <div className="border-t border-[#e8dfd0] bg-[#faf6ef] px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-[#8b7b6b] mb-3 font-semibold uppercase tracking-wide">Other Self-Publishing Tools</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/bible-studio", label: "Bible Design Studio" },
              { href: "/spine-calculator", label: "Spine Calculator" },
              { href: "/cover-designer", label: "Cover Designer" },
              { href: "/isbn-manager", label: "ISBN & Metadata" },
              { href: "/timeline", label: "Production Timeline" },
              { href: "/resources", label: "Resources Hub" },
              { href: "/guide", label: "User Guide" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-xs px-3 py-1.5 rounded-full border border-[#d4c8b4] text-[#5c3d2e] hover:bg-[#c9a96e]/10 hover:border-[#c9a96e]/50 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
