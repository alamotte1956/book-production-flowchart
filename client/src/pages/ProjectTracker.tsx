import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { phases, type Phase, type Step, type StepInput } from "@/data/flowchartData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import {
  BookOpen, ArrowLeft, Check, SkipForward, Upload, X, FileText, Image,
  File as FileIcon, Trash2, ChevronDown, ChevronRight, ExternalLink, Loader2,
  Lightbulb, PenTool, FileEdit, Send, Search, FileSignature, Layers, AlignLeft,
  CheckSquare, MessageSquare, Type, LayoutGrid, Eye, RefreshCw, ShieldCheck,
  ClipboardCheck, Barcode, Printer, Palette, BookCopy, Microscope,
  Warehouse, Truck, Megaphone, Headphones, TrendingUp, Globe,
  Calendar, AlertTriangle, Clock, Download, ChevronsDown, ChevronsUp, Copy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useMemo, useCallback, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import { motion, AnimatePresence } from "framer-motion";

// Icon map for dynamic rendering
const iconMap: Record<string, LucideIcon> = {
  Lightbulb, PenTool, FileEdit, Send, Search, FileSignature, Layers, AlignLeft,
  CheckSquare, MessageSquare, Type, Image, LayoutGrid, Eye, RefreshCw, ShieldCheck,
  ClipboardCheck, BookOpen, Barcode, FileText, Printer, Palette, BookCopy, Microscope,
  Warehouse, Truck, Megaphone, Headphones, TrendingUp, Globe,
};

type StepStatusType = "pending" | "complete" | "skipped";

interface StepStatusMap {
  [stepId: string]: { status: StepStatusType; notes: string | null };
}

interface FileMap {
  [key: string]: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    mimeType: string | null;
    fileSize: number | null;
  }>;
}

interface DueDateMap {
  [phaseId: string]: number; // Unix timestamp ms
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FileIcon;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.includes("pdf")) return FileText;
  return FileIcon;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDueDateStatus(dueDate: number, phaseComplete: boolean): "on-track" | "due-soon" | "overdue" | "complete" {
  if (phaseComplete) return "complete";
  const now = Date.now();
  const diff = dueDate - now;
  if (diff < 0) return "overdue";
  if (diff < 7 * 24 * 60 * 60 * 1000) return "due-soon"; // within 7 days
  return "on-track";
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Input Slot Component ───────────────────────────────────────

function InputSlot({
  input, stepId, projectId, files, stepStatus, printMode,
}: {
  input: StepInput;
  stepId: string;
  projectId: number;
  files: FileMap[string];
  stepStatus: StepStatusType;
  printMode?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const uploadMutation = trpc.file.upload.useMutation({
    onSuccess: () => {
      utils.project.get.invalidate({ projectId });
      toast.success("File uploaded");
    },
    onError: (err) => toast.error(`Upload failed: ${err.message}`),
  });
  const deleteMutation = trpc.file.delete.useMutation({
    onSuccess: () => {
      utils.project.get.invalidate({ projectId });
      toast.success("File removed");
    },
  });

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large (max 20 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        projectId, stepId, inputName: input.name,
        fileName: file.name, mimeType: file.type, fileSize: file.size, fileBase64: base64,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [projectId, stepId, input.name, uploadMutation]);

  const isDisabled = stepStatus === "skipped";

  return (
    <div className={`rounded-lg border p-4 transition-colors ${isDisabled ? "bg-gray-50 border-gray-200 opacity-60" : "bg-white border-[#e8dfd0] hover:border-[#c9a96e]/50"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-sm text-[#3a2a1a]">{input.name}</h5>
          <p className="text-xs text-[#8b7b6b] mt-0.5">{input.description}</p>
        </div>
        {!isDisabled && !printMode && (
          <>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
            <Button
              variant="outline" size="sm"
              className="shrink-0 border-[#c9a96e]/40 text-[#8b7b6b] hover:bg-[#f5efe0] hover:text-[#5c3d2e]"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
              <span className="ml-1.5 text-xs">Upload</span>
            </Button>
          </>
        )}
      </div>

      {files && files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f) => {
            const Icon = getFileIcon(f.mimeType);
            return (
              <div key={f.id} className="flex items-center gap-2 bg-[#f8f5ef] rounded-md px-3 py-2 text-xs">
                <Icon size={14} className="text-[#c9a96e] shrink-0" />
                <a href={f.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="text-[#5c3d2e] hover:underline truncate flex-1 min-w-0">
                  {f.fileName}
                </a>
                {f.fileSize && <span className="text-[#a89880] shrink-0">{formatFileSize(f.fileSize)}</span>}
                <a href={f.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <ExternalLink size={12} className="text-[#a89880] hover:text-[#5c3d2e]" />
                </a>
                {!isDisabled && !printMode && (
                  <button
                    onClick={() => deleteMutation.mutate({ fileId: f.id, projectId })}
                    className="shrink-0 text-[#a89880] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {(!files || files.length === 0) && printMode && (
        <p className="text-xs text-[#a89880] italic mt-1">No files uploaded</p>
      )}
    </div>
  );
}

// ─── Step Card Component ────────────────────────────────────────

function StepCard({
  step, phase, projectId, stepStatus, fileMap, globalIndex, printMode,
}: {
  step: Step;
  phase: Phase;
  projectId: number;
  stepStatus: { status: StepStatusType; notes: string | null };
  fileMap: FileMap;
  globalIndex: number;
  printMode?: boolean;
}) {
  const [expanded, setExpanded] = useState(!!printMode);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState(stepStatus.notes || "");
  const utils = trpc.useUtils();

  const updateMutation = trpc.step.updateStatus.useMutation({
    onSuccess: () => { utils.project.get.invalidate({ projectId }); },
  });

  const Icon = iconMap[step.icon] || BookOpen;
  const status = stepStatus.status;

  const statusColors: Record<StepStatusType, string> = {
    pending: "bg-white border-[#e8dfd0]",
    complete: "bg-[#f0faf2] border-[#4a6741]/30",
    skipped: "bg-gray-50 border-gray-200",
  };

  const statusBadge: Record<StepStatusType, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-[#f0e8d8] text-[#8b7b6b]" },
    complete: { label: "Complete", color: "bg-[#d4edda] text-[#2d4a3e]" },
    skipped: { label: "Skipped", color: "bg-gray-200 text-gray-500" },
  };

  const handleStatusChange = (newStatus: StepStatusType) => {
    updateMutation.mutate({ projectId, stepId: step.id, status: newStatus, notes: noteText || undefined });
  };

  const handleSaveNotes = () => {
    updateMutation.mutate({ projectId, stepId: step.id, status, notes: noteText || undefined });
    toast.success("Notes saved");
  };

  const fileCount = step.inputs.reduce((acc, input) => {
    const key = `${step.id}:${input.name}`;
    return acc + (fileMap[key]?.length || 0);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: globalIndex * 0.03 }}
    >
      <Card className={`${statusColors[status]} transition-all duration-200 overflow-hidden print:break-inside-avoid`}>
        <CardContent className="p-0">
          <button
            className="w-full text-left px-5 py-4 flex items-center gap-4"
            onClick={() => !printMode && setExpanded(!expanded)}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: status === "skipped" ? "#e5e7eb" : `${phase.accentColor}20` }}
            >
              {status === "complete" ? (
                <Check size={20} className="text-[#4a6741]" />
              ) : status === "skipped" ? (
                <SkipForward size={18} className="text-gray-400" />
              ) : (
                <Icon size={20} style={{ color: phase.accentColor }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={`font-serif text-base ${status === "skipped" ? "text-gray-400 line-through" : "text-[#3a2a1a]"}`}>
                  {step.title}
                </h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge[status].color}`}>
                  {statusBadge[status].label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-[#a89880]">{step.inputs.length} inputs</span>
                {fileCount > 0 && <span className="text-xs text-[#4a6741]">{fileCount} file{fileCount > 1 ? "s" : ""}</span>}
                {stepStatus.notes && <span className="text-xs text-[#c9a96e]">Has notes</span>}
              </div>
            </div>
            {!printMode && (expanded ? <ChevronDown size={18} className="text-[#a89880]" /> : <ChevronRight size={18} className="text-[#a89880]" />)}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={printMode ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-4">
                  <p className="text-sm text-[#8b7b6b] leading-relaxed">{step.description}</p>

                  {/* Action buttons — hidden in print mode */}
                  {!printMode && (
                    <div className="flex items-center gap-2 flex-wrap print:hidden" onClick={(e) => e.stopPropagation()}>
                      {status !== "complete" && (
                        <Button size="sm" className="bg-[#4a6741] hover:bg-[#3a5731] text-white"
                          onClick={(e) => { e.stopPropagation(); handleStatusChange("complete"); }}
                          disabled={updateMutation.isPending}>
                          <Check size={14} className="mr-1.5" /> Mark Complete
                        </Button>
                      )}
                      {status !== "skipped" && (
                        <Button size="sm" variant="outline" className="border-gray-300 text-gray-500 hover:bg-gray-100"
                          onClick={(e) => { e.stopPropagation(); handleStatusChange("skipped"); }}
                          disabled={updateMutation.isPending}>
                          <SkipForward size={14} className="mr-1.5" /> Skip
                        </Button>
                      )}
                      {status !== "pending" && (
                        <Button size="sm" variant="outline" className="border-[#c9a96e]/40 text-[#8b7b6b]"
                          onClick={(e) => { e.stopPropagation(); handleStatusChange("pending"); }}
                          disabled={updateMutation.isPending}>
                          Reset to Pending
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-[#8b7b6b]"
                        onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}>
                        {showNotes ? "Hide Notes" : "Add Notes"}
                      </Button>
                    </div>
                  )}

                  {/* Notes */}
                  {(showNotes || (printMode && stepStatus.notes)) && (
                    <div className="space-y-2">
                      {printMode ? (
                        <div className="bg-[#f8f5ef] rounded-lg p-3 text-sm text-[#5c3d2e]">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#a89880]">Notes</span>
                          <p className="mt-1">{stepStatus.notes}</p>
                        </div>
                      ) : (
                        <>
                          <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add notes about this step..." className="border-[#d4c8b4] text-sm" rows={3} />
                          <Button size="sm" variant="outline" className="border-[#c9a96e]/40" onClick={handleSaveNotes}>
                            Save Notes
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Input slots */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#a89880]">Required Inputs</h5>
                    {step.inputs.map((input) => {
                      const key = `${step.id}:${input.name}`;
                      return (
                        <InputSlot key={key} input={input} stepId={step.id} projectId={projectId}
                          files={fileMap[key] || []} stepStatus={status} printMode={printMode} />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Due Date Picker ────────────────────────────────────────────

function DueDatePicker({
  phaseId, projectId, currentDueDate, phaseComplete,
}: {
  phaseId: string;
  projectId: number;
  currentDueDate: number | undefined;
  phaseComplete: boolean;
}) {
  const utils = trpc.useUtils();
  const setMutation = trpc.dueDate.set.useMutation({
    onSuccess: () => { utils.project.get.invalidate({ projectId }); toast.success("Due date set"); },
  });
  const removeMutation = trpc.dueDate.remove.useMutation({
    onSuccess: () => { utils.project.get.invalidate({ projectId }); toast.success("Due date removed"); },
  });

  const dueDateStatus = currentDueDate ? getDueDateStatus(currentDueDate, phaseComplete) : null;

  const statusStyles: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
    "on-track": { bg: "bg-[#d4edda]", text: "text-[#2d4a3e]", icon: Clock },
    "due-soon": { bg: "bg-amber-100", text: "text-amber-700", icon: AlertTriangle },
    "overdue": { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle },
    "complete": { bg: "bg-[#d4edda]", text: "text-[#2d4a3e]", icon: Check },
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {currentDueDate && dueDateStatus ? (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${statusStyles[dueDateStatus].bg} ${statusStyles[dueDateStatus].text}`}>
              {(() => { const StatusIcon = statusStyles[dueDateStatus].icon; return <StatusIcon size={10} />; })()}
              {formatDate(currentDueDate)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0e8d8] text-[#8b7b6b]">
              <Calendar size={10} />
              Set due date
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-white border-[#e8dfd0]" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[#5c3d2e]">Phase Due Date</p>
          <input
            type="date"
            className="w-full border border-[#d4c8b4] rounded-md px-3 py-2 text-sm text-[#3a2a1a] focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/50"
            defaultValue={currentDueDate ? new Date(currentDueDate).toISOString().split("T")[0] : ""}
            onChange={(e) => {
              if (e.target.value) {
                const ts = new Date(e.target.value + "T23:59:59").getTime();
                setMutation.mutate({ projectId, phaseId, dueDate: ts });
              }
            }}
          />
          {currentDueDate && (
            <Button size="sm" variant="outline" className="w-full text-xs border-gray-300 text-gray-500"
              onClick={() => removeMutation.mutate({ projectId, phaseId })}>
              <X size={12} className="mr-1" /> Remove due date
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Phase Section Component ────────────────────────────────────

function PhaseSection({
  phase, projectId, statusMap, fileMap, dueDateMap, globalOffset, printMode,
}: {
  phase: Phase;
  projectId: number;
  statusMap: StepStatusMap;
  fileMap: FileMap;
  dueDateMap: DueDateMap;
  globalOffset: number;
  printMode?: boolean;
}) {
  const completedInPhase = phase.steps.filter(
    (s) => statusMap[s.id]?.status === "complete" || statusMap[s.id]?.status === "skipped"
  ).length;
  const pct = phase.steps.length > 0 ? Math.round((completedInPhase / phase.steps.length) * 100) : 0;
  const phaseComplete = completedInPhase === phase.steps.length;

  return (
    <section id={`phase-${phase.id}`} className="scroll-mt-20 print:break-before-page">
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: phase.accentColor }}
        >
          {phase.number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-xl text-[#3a2a1a]">{phase.title}</h3>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-xs text-[#8b7b6b]">{phase.subtitle}</p>
            {!printMode && (
              <DueDatePicker
                phaseId={phase.id}
                projectId={projectId}
                currentDueDate={dueDateMap[phase.id]}
                phaseComplete={phaseComplete}
              />
            )}
            {printMode && dueDateMap[phase.id] && (
              <span className="text-xs text-[#8b7b6b]">Due: {formatDate(dueDateMap[phase.id])}</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-sm font-semibold" style={{ color: phase.accentColor }}>{pct}%</span>
          <div className="w-24 mt-1">
            <Progress value={pct} className="h-1.5" />
          </div>
        </div>
      </div>

      <div className="space-y-3 border-l-2 pl-4" style={{ borderColor: `${phase.accentColor}30` }}>
        {phase.steps.map((step, idx) => (
          <StepCard
            key={step.id}
            step={step} phase={phase} projectId={projectId}
            stepStatus={statusMap[step.id] || { status: "pending", notes: null }}
            fileMap={fileMap} globalIndex={globalOffset + idx} printMode={printMode}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function ProjectTracker() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [printMode, setPrintMode] = useState(false);

  const duplicateMutation = trpc.project.duplicate.useMutation({
    onSuccess: (newProject) => {
      toast.success(`Duplicated as "${newProject.title}"`);
      navigate(`/project/${newProject.id}`);
    },
    onError: () => toast.error("Failed to duplicate project"),
  });

  const { data, isLoading, error } = trpc.project.get.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  // Build lookup maps
  const statusMap = useMemo<StepStatusMap>(() => {
    const map: StepStatusMap = {};
    data?.statuses?.forEach((s) => {
      map[s.stepId] = { status: s.status as StepStatusType, notes: s.notes };
    });
    return map;
  }, [data?.statuses]);

  const fileMap = useMemo<FileMap>(() => {
    const map: FileMap = {};
    data?.files?.forEach((f) => {
      const key = `${f.stepId}:${f.inputName}`;
      if (!map[key]) map[key] = [];
      map[key].push({ id: f.id, fileName: f.fileName, fileUrl: f.fileUrl, mimeType: f.mimeType, fileSize: f.fileSize });
    });
    return map;
  }, [data?.files]);

  const dueDateMap = useMemo<DueDateMap>(() => {
    const map: DueDateMap = {};
    data?.dueDates?.forEach((d) => { map[d.phaseId] = d.dueDate; });
    return map;
  }, [data?.dueDates]);

  // Progress stats
  const totalSteps = phases.reduce((acc, p) => acc + p.steps.length, 0);
  const completedSteps = Object.values(statusMap).filter(
    (s) => s.status === "complete" || s.status === "skipped"
  ).length;
  const overallPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Due date summary
  const overduePhases = useMemo(() => {
    return phases.filter((p) => {
      const dd = dueDateMap[p.id];
      if (!dd) return false;
      const done = p.steps.filter(s => statusMap[s.id]?.status === "complete" || statusMap[s.id]?.status === "skipped").length;
      return done < p.steps.length && dd < Date.now();
    });
  }, [dueDateMap, statusMap]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#c9a96e]" size={32} />
      </div>
    );
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8b7b6b]">Please log in to view this project</p>
          <Button variant="outline" className="mt-4" onClick={() => { window.location.href = getLoginUrl(); }}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8b7b6b]">Project not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
            <ArrowLeft size={16} className="mr-2" /> Back to projects
          </Button>
        </div>
      </div>
    );
  }

  const { project } = data;

  let stepOffset = 0;

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#2a1a0a] text-[#f5efe0] shadow-lg print:static print:bg-white print:text-[#3a2a1a] print:shadow-none print:border-b print:border-[#e8dfd0]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost" size="icon"
            className="text-[#c9a96e] hover:bg-[#c9a96e]/10 print:hidden"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-xl truncate">{project.title}</h1>
            <div className="flex items-center gap-3 text-xs text-[#c9a96e]/70 print:text-[#8b7b6b]">
              {project.author && <span>by {project.author}</span>}
              {project.genre && <span>• {project.genre}</span>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 print:hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="sm"
                  className={`text-[#c9a96e]/70 hover:text-[#c9a96e] hover:bg-[#c9a96e]/10 ${printMode ? "bg-[#c9a96e]/20 text-[#c9a96e]" : ""}`}
                  onClick={() => setPrintMode(!printMode)}
                >
                  {printMode ? <ChevronsUp size={16} /> : <ChevronsDown size={16} />}
                  <span className="ml-1.5 text-xs hidden sm:inline">{printMode ? "Collapse All" : "Expand All"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{printMode ? "Collapse all steps" : "Expand all steps"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="sm"
                  className="text-[#c9a96e]/70 hover:text-[#c9a96e] hover:bg-[#c9a96e]/10"
                  onClick={() => duplicateMutation.mutate({ projectId })}
                  disabled={duplicateMutation.isPending}
                >
                  {duplicateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
                  <span className="ml-1.5 text-xs hidden sm:inline">Duplicate</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a copy of this project</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="sm"
                  className="text-[#c9a96e]/70 hover:text-[#c9a96e] hover:bg-[#c9a96e]/10"
                  onClick={() => window.print()}
                >
                  <Download size={16} />
                  <span className="ml-1.5 text-xs hidden sm:inline">Export</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Print / Save as PDF</TooltipContent>
            </Tooltip>
          </div>

          <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-[#c9a96e] print:text-[#3a2a1a]">{overallPct}%</span>
            <div className="w-32 mt-1">
              <Progress value={overallPct} className="h-2 bg-[#c9a96e]/20" />
            </div>
            <span className="text-[10px] text-[#c9a96e]/50 print:text-[#8b7b6b]">{completedSteps}/{totalSteps} steps</span>
          </div>
        </div>
      </header>

      {/* Overdue alert banner */}
      {overduePhases.length > 0 && !printMode && (
        <div className="bg-red-50 border-b border-red-200 print:hidden">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-3">
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">
              <strong>{overduePhases.length} phase{overduePhases.length > 1 ? "s" : ""} overdue:</strong>{" "}
              {overduePhases.map(p => p.title).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar — phase navigation */}
        <aside className="hidden lg:block w-52 shrink-0 print:hidden">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#a89880] mb-3">Chapters</p>
            {phases.map((phase) => {
              const done = phase.steps.filter(
                (s) => statusMap[s.id]?.status === "complete" || statusMap[s.id]?.status === "skipped"
              ).length;
              const dd = dueDateMap[phase.id];
              const phaseComplete = done === phase.steps.length;
              const isOverdue = dd && !phaseComplete && dd < Date.now();
              return (
                <a
                  key={phase.id}
                  href={`#phase-${phase.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isOverdue ? "text-red-600 hover:bg-red-50" : "text-[#5c3d2e] hover:bg-[#f0e8d8]"}`}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: isOverdue ? "#dc2626" : phase.accentColor }}
                  >
                    {phaseComplete ? <Check size={10} /> : phase.number}
                  </span>
                  <span className="truncate flex-1">{phase.title}</span>
                  <span className="text-[10px] text-[#a89880]">{done}/{phase.steps.length}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main content — left-aligned */}
        <main className="flex-1 min-w-0 space-y-10">
          {phases.map((phase) => {
            const currentOffset = stepOffset;
            stepOffset += phase.steps.length;
            return (
              <PhaseSection
                key={phase.id}
                phase={phase} projectId={projectId}
                statusMap={statusMap} fileMap={fileMap} dueDateMap={dueDateMap}
                globalOffset={currentOffset} printMode={printMode}
              />
            );
          })}

          {/* Footer */}
          <div className="text-center py-12 print:hidden">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-[#c9a96e]/30" />
              <BookOpen size={20} className="text-[#c9a96e]/50" />
              <div className="h-px w-12 bg-[#c9a96e]/30" />
            </div>
            <p className="font-serif text-lg text-[#c9a96e]/60 italic">
              "Every book is a journey."
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
