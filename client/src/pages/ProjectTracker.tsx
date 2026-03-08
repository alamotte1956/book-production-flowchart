import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { phases, biblePhases, type Phase, type Step, type StepInput } from "@/data/flowchartData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen, ArrowLeft, Check, SkipForward, Upload, X, FileText, Image,
  File as FileIcon, Trash2, ChevronDown, ChevronRight, ExternalLink, Loader2,
  Lightbulb, PenTool, FileEdit, Send, Search, FileSignature, Layers, AlignLeft,
  CheckSquare, MessageSquare, Type, LayoutGrid, Eye, RefreshCw, ShieldCheck,
  ClipboardCheck, Barcode, Printer, Palette, BookCopy, Microscope,
  Warehouse, Truck, Megaphone, Headphones, TrendingUp, Globe,
  Calendar, AlertTriangle, Clock, Download, ChevronsDown, ChevronsUp, Copy, BarChart2, Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import { motion, AnimatePresence } from "framer-motion";
import { getIrrelevantStepIds, getFilterReason } from "@shared/genreFilter";

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
      <Card className={`${statusColors[status]} transition-all duration-200 overflow-hidden print:break-inside-avoid hover:shadow-md`}>
        <CardContent className="p-0">
          <button
            className="w-full text-left px-5 py-4 flex items-center gap-4"
            onClick={() => !printMode && setExpanded(!expanded)}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: status === "skipped" ? "#e5e7eb" : `${phase.accentColor}18` }}
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

                  {/* Status dropdown + notes toggle — hidden in print mode */}
                  {!printMode && (
                    <div className="flex items-center gap-2 flex-wrap print:hidden" onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={status}
                        onValueChange={(val) => handleStatusChange(val as StepStatusType)}
                        disabled={updateMutation.isPending}
                      >
                        <SelectTrigger
                          className={`w-40 h-8 text-xs font-medium border ${
                            status === "complete"
                              ? "border-[#4a6741]/40 bg-[#f0faf2] text-[#2d4a3e]"
                              : status === "skipped"
                              ? "border-gray-300 bg-gray-50 text-gray-500"
                              : "border-[#c9a96e]/40 bg-[#fdf9f3] text-[#8b7b6b]"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent onClick={(e) => e.stopPropagation()}>
                          <SelectItem value="pending">
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#a89880]" /> Pending</span>
                          </SelectItem>
                          <SelectItem value="complete">
                            <span className="flex items-center gap-1.5"><Check size={12} className="text-[#4a6741]" /> Complete</span>
                          </SelectItem>
                          <SelectItem value="skipped">
                            <span className="flex items-center gap-1.5"><SkipForward size={12} className="text-gray-400" /> Skipped</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {updateMutation.isPending && <Loader2 size={14} className="animate-spin text-[#c9a96e]" />}
                      <Button size="sm" variant="ghost" className="text-[#8b7b6b] h-8 text-xs"
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
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#a89880]">Required Inputs</h5>
                      {!printMode && (
                        <a
                          href={`/resources#resources-${step.resourceSection}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-[#c9a96e] hover:text-[#a07840] font-medium transition-colors"
                        >
                          <ExternalLink size={11} />
                          View Resources
                        </a>
                      )}
                    </div>
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

// ─── Genre list (shared with Create Project dialog on Home.tsx) ──────────────

const GENRES = [
  "Literary Fiction", "Commercial Fiction", "Mystery / Thriller", "Science Fiction",
  "Fantasy", "Romance", "Historical Fiction", "Horror", "Young Adult", "Middle Grade",
  "Children's", "Narrative Nonfiction", "Memoir / Autobiography",
  "Self-Help / Personal Development", "Business / Finance", "Academic / Textbook",
  "Poetry", "Graphic Novel", "Short Story Collection", "Bible / Scripture", "Other",
];

// ─── Inline Genre Editor ─────────────────────────────────────────────────────

function GenreEditor({ projectId, currentGenre }: { projectId: number; currentGenre: string | null | undefined }) {
  const [open, setOpen] = useState(false);
  const [localGenre, setLocalGenre] = useState(currentGenre ?? "");
  const utils = trpc.useUtils();

  // Keep local state in sync if the query re-fetches
  useEffect(() => { setLocalGenre(currentGenre ?? ""); }, [currentGenre]);

  const updateGenre = trpc.project.updateGenre.useMutation({
    onSuccess: () => {
      utils.project.get.invalidate({ projectId });
      toast.success("Genre updated");
      setOpen(false);
    },
    onError: () => toast.error("Failed to update genre"),
  });

  const handleSave = () => {
    updateGenre.mutate({ projectId, genre: localGenre || null });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 hover:text-[#c9a96e] transition-colors group print:hidden">
          {currentGenre ? (
            <>
              <span>• {currentGenre}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#c9a96e]/60 text-[10px] ml-0.5">(edit)</span>
            </>
          ) : (
            <span className="text-[#c9a96e]/40 hover:text-[#c9a96e]/70 italic">+ Add genre</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <p className="text-xs font-semibold text-[#3a2a1a] mb-2">Edit Genre</p>
        <Select
          value={localGenre}
          onValueChange={setLocalGenre}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select a genre" />
          </SelectTrigger>
          <SelectContent>
            {GENRES.map((g) => (
              <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm" className="flex-1 h-7 text-xs"
            onClick={handleSave}
            disabled={updateGenre.isPending}
          >
            {updateGenre.isPending ? <Loader2 size={12} className="animate-spin" /> : "Save"}
          </Button>
          <Button
            size="sm" variant="ghost" className="h-7 text-xs"
            onClick={() => { setLocalGenre(currentGenre ?? ""); setOpen(false); }}
          >
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Phase Section Component ────────────────────────────────────

function PhaseSection({
  phase, projectId, statusMap, fileMap, dueDateMap, globalOffset, printMode, hiddenStepIds, genre,
}: {
  phase: Phase;
  projectId: number;
  statusMap: StepStatusMap;
  fileMap: FileMap;
  dueDateMap: DueDateMap;
  globalOffset: number;
  printMode?: boolean;
  hiddenStepIds: Set<string>;
  genre: string | null | undefined;
}) {
  const [showHidden, setShowHidden] = useState(false);

  const visibleSteps = phase.steps.filter(s => !hiddenStepIds.has(s.id));
  const filteredSteps = phase.steps.filter(s => hiddenStepIds.has(s.id));

  const completedInPhase = visibleSteps.filter(
    (s) => statusMap[s.id]?.status === "complete" || statusMap[s.id]?.status === "skipped"
  ).length;
  const pct = visibleSteps.length > 0 ? Math.round((completedInPhase / visibleSteps.length) * 100) : 0;
  const phaseComplete = visibleSteps.length > 0 && completedInPhase === visibleSteps.length;

  return (
    <section id={`phase-${phase.id}`} className="scroll-mt-20 print:break-before-page">
      <div className="rounded-xl bg-gradient-to-r from-white/80 to-[#f8f5ef]/80 border border-[#e8dfd0] p-5 mb-5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-serif font-bold text-lg shrink-0 shadow-sm"
            style={{ backgroundColor: phase.accentColor }}
          >
            {phaseComplete ? <Check size={20} /> : phase.number}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-xl font-semibold text-[#3a2a1a] tracking-wide">{phase.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-[#8b7b6b] italic">{phase.subtitle}</p>
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
            <span className="text-lg font-serif font-bold" style={{ color: phase.accentColor }}>{pct}%</span>
            <div className="w-28 mt-1.5">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${phase.accentColor}15` }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: phase.accentColor }}
                />
              </div>
            </div>
            <span className="text-[10px] text-[#a89880] mt-0.5 block">{completedInPhase}/{visibleSteps.length} steps</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-l-2 pl-4 ml-1" style={{ borderColor: `${phase.accentColor}30` }}>
        {visibleSteps.map((step, idx) => (
          <StepCard
            key={step.id}
            step={step} phase={phase} projectId={projectId}
            stepStatus={statusMap[step.id] || { status: "pending", notes: null }}
            fileMap={fileMap} globalIndex={globalOffset + idx} printMode={printMode}
          />
        ))}

        {/* Hidden steps toggle */}
        {filteredSteps.length > 0 && !printMode && (
          <div className="mt-1">
            <button
              onClick={() => setShowHidden(v => !v)}
              className="flex items-center gap-2 text-xs text-[#a89880] hover:text-[#8b7b6b] transition-colors py-1.5 px-2 rounded-md hover:bg-[#f0e8d8]/60"
            >
              <Eye size={13} className={showHidden ? "opacity-100" : "opacity-50"} />
              {showHidden
                ? `Hide ${filteredSteps.length} step${filteredSteps.length !== 1 ? "s" : ""} not needed for ${genre}`
                : `${filteredSteps.length} step${filteredSteps.length !== 1 ? "s" : ""} hidden for ${genre} — click to show`}
              <ChevronDown size={12} className={`transition-transform ${showHidden ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showHidden && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden space-y-2 mt-2"
                >
                  {filteredSteps.map((step, idx) => (
                    <div key={step.id} className="opacity-50 relative">
                      <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                      <div className="mb-1 flex items-center gap-2 px-1">
                        <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full border border-gray-200">
                          Not needed for {genre}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              <AlertTriangle size={11} className="text-gray-300" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            {getFilterReason(step.id, genre ?? "")}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <StepCard
                        step={step} phase={phase} projectId={projectId}
                        stepStatus={statusMap[step.id] || { status: "pending", notes: null }}
                        fileMap={fileMap} globalIndex={globalOffset + visibleSteps.length + idx} printMode={printMode}
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
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
  const [showNotes, setShowNotes] = useState(false);

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

  // Bible projects get 3 extra phases (Text Prep, Reference Apparatus, Pre-Press)
  // MUST be declared first so totalSteps and overduePhases can use it
  const allPhases = useMemo(
    () => data?.project?.genre === "Bible / Scripture"
      ? [...phases, ...biblePhases]
      : phases,
    [data?.project?.genre]
  );

  // Genre-based step filtering — MUST be above early returns to satisfy Rules of Hooks
  const hiddenStepIds = useMemo(
    () => getIrrelevantStepIds(data?.project?.genre),
    [data?.project?.genre]
  );

  // Progress stats
  const totalSteps = useMemo(
    () => allPhases.reduce((acc, p) => acc + p.steps.length, 0),
    [allPhases]
  );
  const completedSteps = Object.values(statusMap).filter(
    (s) => s.status === "complete" || s.status === "skipped"
  ).length;
  const overallPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Due date summary
  const overduePhases = useMemo(() => {
    return allPhases.filter((p) => {
      const dd = dueDateMap[p.id];
      if (!dd) return false;
      const done = p.steps.filter(s => statusMap[s.id]?.status === "complete" || statusMap[s.id]?.status === "skipped").length;
      return done < p.steps.length && dd < Date.now();
    });
  }, [allPhases, dueDateMap, statusMap]);

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
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#2a1a0a] via-[#3a2414] to-[#2a1a0a] text-[#f5efe0] shadow-lg print:static print:bg-white print:text-[#3a2a1a] print:shadow-none print:border-b print:border-[#e8dfd0]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyMDEsMTY5LDExMCwwLjA1KSIvPjwvc3ZnPg==')] opacity-50 print:hidden" />
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4 relative">
          <Button
            variant="ghost" size="icon"
            className="text-[#c9a96e] hover:bg-[#c9a96e]/10 print:hidden"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-xl truncate tracking-wide">{project.title}</h1>
            <div className="flex items-center gap-3 text-xs text-[#c9a96e]/70 print:text-[#8b7b6b]">
              {project.author && <span className="italic">by {project.author}</span>}
              <GenreEditor projectId={projectId} currentGenre={project.genre} />
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
                  onClick={() => navigate(`/timeline/${projectId}`)}
                >
                  <BarChart2 size={16} />
                  <span className="ml-1.5 text-xs hidden sm:inline">Timeline</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Gantt timeline &amp; dashboard</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" size="sm"
                  className="text-[#f5c842]/80 hover:text-[#f5c842] hover:bg-[#f5c842]/10 border border-[#f5c842]/20"
                  onClick={() => navigate(`/auto-produce/${projectId}`)}
                >
                  <Wand2 size={16} />
                  <span className="ml-1.5 text-xs hidden sm:inline">Auto-Produce</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI-powered manuscript typesetting → PDF &amp; EPUB</TooltipContent>
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

          {/* Notes toggle */}
          <button
            onClick={() => setShowNotes(v => !v)}
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#c9a96e]/60 hover:text-[#c9a96e] transition-colors print:hidden"
          >
            <MessageSquare size={14} />
            Notes
          </button>

          <div className="text-right shrink-0">
            <span className="text-2xl font-serif font-bold text-[#c9a96e] print:text-[#3a2a1a]">{overallPct}%</span>
            <div className="w-32 mt-1">
              <div className="h-2 rounded-full overflow-hidden bg-[#c9a96e]/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c9a96e] to-[#e0c48a] transition-all duration-500 ease-out"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-[#c9a96e]/50 print:text-[#8b7b6b]">{completedSteps}/{totalSteps} steps</span>
          </div>
        </div>
      </header>

      {/* Notes Summary Panel */}
      {showNotes && (() => {
        const stepsWithNotes = phases.flatMap(p =>
          p.steps
            .filter(s => statusMap[s.id]?.notes)
            .map(s => ({ phase: p, step: s, notes: statusMap[s.id]!.notes! }))
        );
        return (
          <div className="bg-gradient-to-r from-amber-50/80 to-[#fdf9f3] border-b border-[#c9a96e]/20 print:hidden">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-sm font-semibold text-[#3a2a1a] flex items-center gap-2">
                  <MessageSquare size={14} className="text-[#c9a96e]" />
                  Notes Summary ({stepsWithNotes.length} step{stepsWithNotes.length !== 1 ? "s" : ""})
                </h3>
                <button onClick={() => setShowNotes(false)} className="text-[#a89880] hover:text-[#5c3d2e]">
                  <X size={14} />
                </button>
              </div>
              {stepsWithNotes.length === 0 ? (
                <p className="text-xs text-[#a89880] italic">No notes added to any steps yet. Expand a step and add notes to see them here.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stepsWithNotes.map(({ phase, step, notes }) => (
                    <div key={step.id} className="bg-white/80 rounded-lg border border-[#c9a96e]/20 p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{ backgroundColor: phase.accentColor }}
                        >{phase.number}</span>
                        <span className="text-xs font-semibold text-[#3a2a1a] truncate">{step.title}</span>
                      </div>
                      <p className="text-xs text-[#5c3d2e] leading-relaxed line-clamp-3">{notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Genre filter info banner */}
      {hiddenStepIds.size > 0 && !printMode && (
        <div className="bg-gradient-to-r from-[#f5ede4] to-[#faf6ef] border-b border-[#d4b896]/30 print:hidden">
          <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center gap-3">
            <Eye size={14} className="text-[#8b5e3c] shrink-0" />
            <p className="text-xs text-[#5c3d2e] flex-1">
              <strong>{hiddenStepIds.size} step{hiddenStepIds.size !== 1 ? "s" : ""}</strong> not typically needed for{" "}
              <strong>{project.genre}</strong> are hidden. Look for the "click to show" toggle within each phase.
            </p>
          </div>
        </div>
      )}

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
        <aside className="hidden lg:block w-56 shrink-0 print:hidden">
          <nav className="sticky top-24 space-y-1 bg-white/60 backdrop-blur-sm rounded-xl border border-[#e8dfd0] p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-[#c9a96e]/20" />
              <p className="text-xs font-serif font-semibold uppercase tracking-widest text-[#a89880]">Chapters</p>
              <div className="h-px flex-1 bg-[#c9a96e]/20" />
            </div>
            {allPhases.map((phase) => {
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
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isOverdue
                      ? "text-red-600 hover:bg-red-50 border border-red-200/50"
                      : phaseComplete
                      ? "text-[#4a6741] hover:bg-[#f0faf2] border border-[#4a6741]/10"
                      : "text-[#5c3d2e] hover:bg-[#f0e8d8] border border-transparent"
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: isOverdue ? "#dc2626" : phaseComplete ? "#4a6741" : phase.accentColor }}
                  >
                    {phaseComplete ? <Check size={11} /> : phase.number}
                  </span>
                  <span className="truncate flex-1 font-medium">{phase.title}</span>
                  <span className="text-[10px] font-medium text-[#a89880]">{done}/{phase.steps.length}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main content — left-aligned */}
        <main className="flex-1 min-w-0 space-y-10">
          {allPhases.map((phase) => {
            const currentOffset = stepOffset;
            stepOffset += phase.steps.length;
            return (
              <PhaseSection
                key={phase.id}
                phase={phase} projectId={projectId}
                statusMap={statusMap} fileMap={fileMap} dueDateMap={dueDateMap}
                globalOffset={currentOffset} printMode={printMode}
                hiddenStepIds={hiddenStepIds}
                genre={project.genre}
              />
            );
          })}

          {/* Footer */}
          <div className="text-center py-16 print:hidden">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a96e]/30" />
              <div className="w-8 h-8 rounded-full border-2 border-[#c9a96e]/20 flex items-center justify-center">
                <BookOpen size={16} className="text-[#c9a96e]/40" />
              </div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a96e]/30" />
            </div>
            <p className="font-serif text-lg text-[#c9a96e]/50 italic tracking-wide">
              "Every book is a journey."
            </p>
            <p className="text-xs text-[#a89880]/40 mt-2 tracking-wider uppercase">
              {completedSteps} of {totalSteps} steps complete
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
