import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { phases, biblePhases, type Phase, type Step, type StepInput } from "@/data/flowchartData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Sparkles, Star, Rocket, User, Tag, Ruler, CircleCheck, Circle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useMemo, useCallback, useRef, useEffect, type KeyboardEvent } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { getIrrelevantStepIds, getFilterReason } from "@shared/genreFilter";
import { getNextPrompts } from "@shared/prompts";
import type { ProjectPromptContext } from "@shared/prompts";
import WhatsNext from "@/components/WhatsNext";

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
    pending: "bg-white border-[#e8dfd0] hover:border-[#c9a96e]/40",
    complete: "bg-gradient-to-br from-[#f0faf2] to-[#e8f5ea] border-[#4a6741]/30",
    skipped: "bg-gray-50/80 border-gray-200",
  };

  const statusBadge: Record<StepStatusType, { label: string; dotColor: string; bgColor: string; textColor: string }> = {
    pending: { label: "Pending", dotColor: "bg-amber-400", bgColor: "bg-amber-50", textColor: "text-amber-700" },
    complete: { label: "Complete", dotColor: "bg-emerald-500", bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
    skipped: { label: "Skipped", dotColor: "bg-gray-400", bgColor: "bg-gray-100", textColor: "text-gray-500" },
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
      transition={{ delay: globalIndex * 0.03, duration: 0.35, ease: "easeOut" }}
    >
      <Card className={`${statusColors[status]} transition-all duration-300 overflow-hidden print:break-inside-avoid shadow-sm hover:shadow-lg group/card`}>
        <CardContent className="p-0">
          <button
            className="w-full text-left px-5 py-4 flex items-center gap-4"
            onClick={() => !printMode && setExpanded(!expanded)}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover/card:scale-105"
              style={{ backgroundColor: status === "skipped" ? "#e5e7eb" : `${phase.accentColor}18` }}
            >
              {status === "complete" ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                  <Check size={20} className="text-emerald-600" />
                </motion.div>
              ) : status === "skipped" ? (
                <SkipForward size={18} className="text-gray-400" />
              ) : (
                <Icon size={20} style={{ color: phase.accentColor }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <h4 className={`font-serif text-base ${status === "skipped" ? "text-gray-400 line-through" : "text-[#3a2a1a]"}`}>
                  {step.title}
                </h4>
                <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${statusBadge[status].bgColor} ${statusBadge[status].textColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge[status].dotColor}`} />
                  {statusBadge[status].label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-[#a89880]">{step.inputs.length} inputs</span>
                {fileCount > 0 && <span className="text-xs text-emerald-600 font-medium">{fileCount} file{fileCount > 1 ? "s" : ""}</span>}
                {stepStatus.notes && <span className="text-xs text-[#c9a96e] font-medium">Has notes</span>}
              </div>
            </div>
            {!printMode && (
              <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
                <ChevronRight size={18} className="text-[#a89880] group-hover/card:text-[#5c3d2e] transition-colors" />
              </motion.div>
            )}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={printMode ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
  "Poetry", "Graphic Novel", "Short Story Collection", "Bible / Scripture",
  "Christian Living", "Devotional", "Children's Christian", "Prayer", "Pastoral",
  "Biography", "Academic / Theological", "Music / Audio",
  "Other",
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
        <button data-genre-editor className="flex items-center gap-1 hover:text-[#c9a96e] transition-colors group print:hidden">
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

// ─── Inline Title Editor ─────────────────────────────────────────────────────

function TitleEditor({ projectId, currentTitle }: { projectId: number; currentTitle: string }) {
  const [open, setOpen] = useState(false);
  const [localTitle, setLocalTitle] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  useEffect(() => { setLocalTitle(currentTitle); }, [currentTitle]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.select(), 50); }, [open]);

  const updateMeta = trpc.project.updateMeta.useMutation({
    onSuccess: () => {
      utils.project.get.invalidate({ projectId });
      utils.project.list.invalidate();
      toast.success("Title updated");
      setOpen(false);
    },
    onError: () => toast.error("Failed to update title"),
  });

  const handleSave = () => {
    const trimmed = localTitle.trim();
    if (!trimmed) { toast.error("Title cannot be empty"); return; }
    if (trimmed === currentTitle) { setOpen(false); return; }
    updateMeta.mutate({ projectId, title: trimmed });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") { setLocalTitle(currentTitle); setOpen(false); }
  };

  return (
    <Popover open={open} onOpenChange={(v) => { if (!v) setLocalTitle(currentTitle); setOpen(v); }}>
      <PopoverTrigger asChild>
        <button data-title-editor className="font-serif text-xl truncate tracking-wide hover:text-[#c9a96e] transition-colors group flex items-center gap-1.5 print:pointer-events-none">
          {currentTitle}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#c9a96e]/60 text-[10px] print:hidden">(edit)</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <p className="text-xs font-semibold text-[#3a2a1a] mb-2">Edit Title</p>
        <Input
          ref={inputRef}
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm border-[#d4c8b4]"
          maxLength={255}
        />
        <div className="flex gap-2 mt-3">
          <Button
            size="sm" className="flex-1 h-7 text-xs"
            onClick={handleSave}
            disabled={updateMeta.isPending || !localTitle.trim()}
          >
            {updateMeta.isPending ? <Loader2 size={12} className="animate-spin" /> : "Save"}
          </Button>
          <Button
            size="sm" variant="ghost" className="h-7 text-xs"
            onClick={() => { setLocalTitle(currentTitle); setOpen(false); }}
          >
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Inline Author Editor ────────────────────────────────────────────────────

function AuthorEditor({ projectId, currentAuthor }: { projectId: number; currentAuthor: string | null | undefined }) {
  const [open, setOpen] = useState(false);
  const [localAuthor, setLocalAuthor] = useState(currentAuthor ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  useEffect(() => { setLocalAuthor(currentAuthor ?? ""); }, [currentAuthor]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.select(), 50); }, [open]);

  const updateMeta = trpc.project.updateMeta.useMutation({
    onSuccess: () => {
      utils.project.get.invalidate({ projectId });
      utils.project.list.invalidate();
      toast.success("Author updated");
      setOpen(false);
    },
    onError: () => toast.error("Failed to update author"),
  });

  const handleSave = () => {
    const trimmed = localAuthor.trim();
    if (trimmed === (currentAuthor ?? "")) { setOpen(false); return; }
    updateMeta.mutate({ projectId, author: trimmed || null });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") { setLocalAuthor(currentAuthor ?? ""); setOpen(false); }
  };

  return (
    <Popover open={open} onOpenChange={(v) => { if (!v) setLocalAuthor(currentAuthor ?? ""); setOpen(v); }}>
      <PopoverTrigger asChild>
        <button data-author-editor className="flex items-center gap-1 hover:text-[#c9a96e] transition-colors group print:hidden">
          {currentAuthor ? (
            <>
              <span className="italic">by {currentAuthor}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#c9a96e]/60 text-[10px] ml-0.5">(edit)</span>
            </>
          ) : (
            <span className="text-[#c9a96e]/40 hover:text-[#c9a96e]/70 italic">+ Add author</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <p className="text-xs font-semibold text-[#3a2a1a] mb-2">Edit Author</p>
        <Input
          ref={inputRef}
          value={localAuthor}
          onChange={(e) => setLocalAuthor(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Author name (optional)"
          className="h-8 text-sm border-[#d4c8b4]"
          maxLength={255}
        />
        <div className="flex gap-2 mt-3">
          <Button
            size="sm" className="flex-1 h-7 text-xs"
            onClick={handleSave}
            disabled={updateMeta.isPending}
          >
            {updateMeta.isPending ? <Loader2 size={12} className="animate-spin" /> : "Save"}
          </Button>
          <Button
            size="sm" variant="ghost" className="h-7 text-xs"
            onClick={() => { setLocalAuthor(currentAuthor ?? ""); setOpen(false); }}
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

  const PhaseIcon = iconMap[phase.steps[0]?.icon] || BookOpen;

  return (
    <section id={`phase-${phase.id}`} className="scroll-mt-20 print:break-before-page">
      <motion.div
        className={`relative rounded-2xl border-2 p-6 mb-6 backdrop-blur-sm overflow-hidden transition-all duration-500 ${
          phaseComplete
            ? "bg-gradient-to-br from-emerald-50/80 via-white/80 to-emerald-50/40 border-emerald-300/50"
            : "bg-gradient-to-br from-white/90 via-[#fdf9f3]/80 to-white/90 border-[#e8dfd0]"
        }`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 sm:w-12" style={{ backgroundColor: `${phase.accentColor}50` }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: phase.accentColor }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a89880]">Chapter {phase.number}</span>
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: phase.accentColor }} />
          <div className="h-px w-8 sm:w-12" style={{ backgroundColor: `${phase.accentColor}50` }} />
        </div>

        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-md transition-all duration-500 ${
                phaseComplete ? "scale-110" : ""
              }`}
              style={{ backgroundColor: phaseComplete ? "#059669" : phase.accentColor }}
            >
              {phaseComplete ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Check size={24} strokeWidth={3} />
                </motion.div>
              ) : phase.number}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${phase.accentColor}20` }}
            >
              <PhaseIcon size={12} style={{ color: phase.accentColor }} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3a2a1a] tracking-wide leading-tight">{phase.title}</h3>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
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
            <div className="flex items-center gap-1.5 justify-end">
              {phaseComplete && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                >
                  <Sparkles size={16} className="text-amber-500" />
                </motion.div>
              )}
              <span className="text-xl font-serif font-bold" style={{ color: phaseComplete ? "#059669" : phase.accentColor }}>{pct}%</span>
            </div>
            <div className="w-32 mt-2">
              <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: `${phase.accentColor}12` }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: phaseComplete ? "#059669" : phase.accentColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
            <span className="text-[10px] text-[#a89880] mt-1 block font-medium">{completedInPhase}/{visibleSteps.length} steps</span>
          </div>
        </div>

        {phaseComplete && (
          <motion.div
            className="mt-4 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 border border-emerald-200/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Star size={14} className="text-amber-500 fill-amber-500" />
            </motion.div>
            <span className="text-xs font-semibold text-emerald-700">Phase Complete!</span>
            <motion.div
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Star size={14} className="text-amber-500 fill-amber-500" />
            </motion.div>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px flex-1" style={{ backgroundColor: `${phase.accentColor}20` }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${phase.accentColor}40` }} />
          <div className="h-px flex-1" style={{ backgroundColor: `${phase.accentColor}20` }} />
        </div>
      </motion.div>

      <div className="space-y-3 relative ml-1 pl-4">
        <div className="absolute left-0 top-0 bottom-0 w-0.5">
          {visibleSteps.map((step, idx) => {
            const isComplete = statusMap[step.id]?.status === "complete" || statusMap[step.id]?.status === "skipped";
            const segmentHeight = `${100 / visibleSteps.length}%`;
            return (
              <div
                key={step.id}
                className="transition-colors duration-500"
                style={{
                  position: "absolute",
                  top: `${(idx / visibleSteps.length) * 100}%`,
                  height: segmentHeight,
                  width: "100%",
                  backgroundColor: isComplete ? "#c9a96e" : "#e0d6c8",
                }}
              />
            );
          })}
        </div>
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

// ─── AI Writing Assistant ────────────────────────────────────────

const TRACKER_COPY_TYPES = [
  { value: "back-cover-blurb", label: "Back-Cover Blurb", desc: "~150 words" },
  { value: "author-bio", label: "Author Biography", desc: "~100 words" },
  { value: "press-release", label: "Press Release", desc: "~300 words" },
  { value: "marketing-email", label: "Marketing Email", desc: "~250 words" },
  { value: "bisac-description", label: "BISAC Description", desc: "~100 words" },
  { value: "catalog-description", label: "Catalog Description", desc: "~200 words" },
] as const;

const BIBLE_COPY_TYPES = [
  { value: "toc-description", label: "Table of Contents Description", desc: "~150 words" },
  { value: "study-note-summary", label: "Study Note Summary", desc: "~200 words" },
  { value: "devotional-intro", label: "Devotional Introduction", desc: "~250 words" },
] as const;

const AI_TONES = [
  { value: "literary", label: "Literary" },
  { value: "commercial", label: "Commercial" },
  { value: "academic", label: "Academic" },
  { value: "inspirational", label: "Inspirational" },
  { value: "devotional", label: "Devotional" },
] as const;

type CopyTypeValue = typeof TRACKER_COPY_TYPES[number]["value"] | typeof BIBLE_COPY_TYPES[number]["value"];

function AIAssistantPanel({
  projectTitle,
  projectAuthor,
  projectGenre,
}: {
  projectTitle: string;
  projectAuthor: string | null | undefined;
  projectGenre: string | null | undefined;
}) {
  const [bookTitle, setBookTitle] = useState(projectTitle);
  const [author, setAuthor] = useState(projectAuthor ?? "");
  const [genre, setGenre] = useState(projectGenre ?? "");
  const [synopsis, setSynopsis] = useState("");
  const [copyType, setCopyType] = useState<CopyTypeValue>("back-cover-blurb");
  const [tone, setTone] = useState<typeof AI_TONES[number]["value"]>("inspirational");
  const [result, setResult] = useState("");

  useEffect(() => { setBookTitle(projectTitle); }, [projectTitle]);
  useEffect(() => { setAuthor(projectAuthor ?? ""); }, [projectAuthor]);
  useEffect(() => { setGenre(projectGenre ?? ""); }, [projectGenre]);

  const isBible = projectGenre === "Bible / Scripture";
  const allCopyTypes = isBible ? [...TRACKER_COPY_TYPES, ...BIBLE_COPY_TYPES] : TRACKER_COPY_TYPES;

  const generateMutation = trpc.ai.generateCopy.useMutation({
    onSuccess: (data) => {
      setResult(typeof data.content === "string" ? data.content : "");
    },
    onError: (err) => {
      toast.error("Failed to generate copy: " + err.message);
    },
  });

  const handleGenerate = () => {
    if (!bookTitle.trim()) {
      toast.error("Please enter a book title.");
      return;
    }
    generateMutation.mutate({
      type: copyType,
      bookTitle: bookTitle.trim(),
      author: author.trim() || undefined,
      genre: genre.trim() || undefined,
      synopsis: synopsis.trim() || undefined,
      tone,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#a89880] mb-2 block">Copy Type</label>
        <div className="space-y-1">
          {allCopyTypes.map(ct => (
            <button
              key={ct.value}
              onClick={() => setCopyType(ct.value)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${
                copyType === ct.value
                  ? "border-purple-400 bg-purple-50 text-purple-800"
                  : "border-[#e8dfd0] bg-white text-[#3d2b1f] hover:border-[#c9a96e]/60"
              }`}
            >
              <span className="font-medium text-xs">{ct.label}</span>
              <span className="text-[10px] text-[#a89880]">{ct.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#a89880] block">Book Details</label>
        <Input
          value={bookTitle}
          onChange={e => setBookTitle(e.target.value)}
          placeholder="Book title *"
          className="text-sm border-[#e8dfd0]"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Author"
            className="text-sm border-[#e8dfd0]"
          />
          <Input
            value={genre}
            onChange={e => setGenre(e.target.value)}
            placeholder="Genre"
            className="text-sm border-[#e8dfd0]"
          />
        </div>
        <Textarea
          value={synopsis}
          onChange={e => setSynopsis(e.target.value)}
          placeholder="Brief synopsis or key selling points (optional)"
          className="text-sm border-[#e8dfd0] resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#a89880] mb-2 block">Tone</label>
        <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
          <SelectTrigger className="border-[#e8dfd0] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_TONES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
        onClick={handleGenerate}
        disabled={generateMutation.isPending || !bookTitle.trim()}
      >
        {generateMutation.isPending ? (
          <><RefreshCw size={14} className="animate-spin" /> Generating…</>
        ) : (
          <><Wand2 size={14} /> Generate Copy</>
        )}
      </Button>

      {result && (
        <div className="bg-[#fdf9f3] rounded-lg border border-[#e8dfd0] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#8b5e3c] uppercase tracking-wide">
              {allCopyTypes.find(ct => ct.value === copyType)?.label}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-[#8b7b6b] hover:text-[#5c3d2e] transition-colors"
            >
              <Copy size={10} /> Copy
            </button>
          </div>
          <p className="text-xs text-[#3d2b1f] leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}

// ─── Export Project Summary ──────────────────────────────────────

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateProjectSummaryHTML({
  project,
  allPhases,
  statusMap,
  fileMap,
  dueDateMap,
  overallPct,
  completedSteps,
  totalSteps,
  hiddenStepIds,
}: {
  project: { title: string; author?: string | null; genre?: string | null };
  allPhases: Phase[];
  statusMap: StepStatusMap;
  fileMap: FileMap;
  dueDateMap: DueDateMap;
  overallPct: number;
  completedSteps: number;
  totalSteps: number;
  hiddenStepIds: Set<string>;
}): string {
  const now = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const phaseSections = allPhases.map((phase) => {
    const visibleSteps = phase.steps.filter(s => !hiddenStepIds.has(s.id));
    const done = visibleSteps.filter(s => statusMap[s.id]?.status === "complete" || statusMap[s.id]?.status === "skipped").length;
    const pct = visibleSteps.length > 0 ? Math.round((done / visibleSteps.length) * 100) : 0;
    const dd = dueDateMap[phase.id];

    const stepRows = visibleSteps.map((step) => {
      const st = statusMap[step.id] || { status: "pending", notes: null };
      const statusLabel = st.status === "complete" ? "✓ Complete" : st.status === "skipped" ? "⤳ Skipped" : "○ Pending";
      const statusColor = st.status === "complete" ? "#2d6a4f" : st.status === "skipped" ? "#6b7280" : "#92400e";

      const stepFiles: string[] = [];
      step.inputs.forEach((input) => {
        const key = `${step.id}:${input.name}`;
        const files = fileMap[key];
        if (files && files.length > 0) {
          files.forEach(f => stepFiles.push(f.fileName));
        }
      });

      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;font-size:14px;color:#3a2a1a;">${escHtml(step.title)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;font-size:13px;color:${statusColor};font-weight:600;">${statusLabel}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;font-size:13px;color:#5c3d2e;">${st.notes ? escHtml(st.notes) : "—"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;font-size:13px;color:#8b7b6b;">${stepFiles.length > 0 ? stepFiles.map(f => escHtml(f)).join(", ") : "—"}</td>
        </tr>`;
    }).join("");

    return `
      <div style="margin-bottom:32px;page-break-inside:avoid;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="width:36px;height:36px;border-radius:10px;background:${phase.accentColor};color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;font-family:Georgia,serif;">${phase.number}</div>
          <div style="flex:1;">
            <h2 style="margin:0;font-family:Georgia,serif;font-size:18px;color:#3a2a1a;">${phase.title}</h2>
            <p style="margin:2px 0 0;font-size:12px;color:#8b7b6b;font-style:italic;">${phase.subtitle}</p>
          </div>
          <div style="text-align:right;">
            <span style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:${phase.accentColor};">${pct}%</span>
            <div style="font-size:11px;color:#a89880;">${done}/${visibleSteps.length} steps</div>
            ${dd ? `<div style="font-size:11px;color:#8b7b6b;margin-top:2px;">Due: ${formatDate(dd)}</div>` : ""}
          </div>
        </div>
        <div style="background:${phase.accentColor}15;border-radius:6px;height:8px;overflow:hidden;margin-bottom:12px;">
          <div style="height:100%;width:${pct}%;background:${phase.accentColor};border-radius:6px;"></div>
        </div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e8dfd0;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f8f5ef;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#5c3d2e;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e8dfd0;">Step</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#5c3d2e;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e8dfd0;width:120px;">Status</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#5c3d2e;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e8dfd0;">Notes</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#5c3d2e;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e8dfd0;">Files</th>
            </tr>
          </thead>
          <tbody>${stepRows}</tbody>
        </table>
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Project Summary — ${escHtml(project.title)}</title>
  <style>
    @media print { body { margin: 0; } }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; color: #3a2a1a; margin: 0; padding: 40px; line-height: 1.5; }
    @page { margin: 1cm; }
  </style>
</head>
<body>
  <div style="max-width:900px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #c9a96e;">
      <h1 style="font-family:Georgia,serif;font-size:28px;color:#2a1a0a;margin:0 0 8px;">${escHtml(project.title)}</h1>
      <div style="font-size:14px;color:#8b7b6b;">
        ${project.author ? `<span>by ${escHtml(project.author)}</span>` : ""}
        ${project.author && project.genre ? " · " : ""}
        ${project.genre ? `<span>${escHtml(project.genre)}</span>` : ""}
      </div>
      <div style="font-size:12px;color:#a89880;margin-top:4px;">Exported on ${now}</div>
    </div>

    <div style="background:linear-gradient(135deg,#faf6ef,#f5efe0);border:1px solid #e8dfd0;border-radius:12px;padding:24px;margin-bottom:32px;text-align:center;">
      <div style="font-family:Georgia,serif;font-size:36px;font-weight:700;color:#c9a96e;">${overallPct}%</div>
      <div style="font-size:14px;color:#5c3d2e;margin-top:4px;">Overall Progress</div>
      <div style="background:#c9a96e20;border-radius:6px;height:10px;overflow:hidden;margin:12px auto 0;max-width:400px;">
        <div style="height:100%;width:${overallPct}%;background:linear-gradient(90deg,#c9a96e,#e0c48a);border-radius:6px;"></div>
      </div>
      <div style="font-size:12px;color:#a89880;margin-top:8px;">${completedSteps} of ${totalSteps} steps completed</div>
    </div>

    ${phaseSections}

    <div style="text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #e8dfd0;">
      <p style="font-family:Georgia,serif;font-size:14px;color:#c9a96e;font-style:italic;">"Every book is a journey."</p>
      <p style="font-size:11px;color:#a89880;">Generated by Easy Book Publishers</p>
    </div>
  </div>
</body>
</html>`;
}

function downloadProjectSummary(args: Parameters<typeof generateProjectSummaryHTML>[0]) {
  const html = generateProjectSummaryHTML(args);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${args.project.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-")}-summary.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Getting Started Checklist ───────────────────────────────────

function GettingStartedChecklist({
  projectId,
  projectTitle,
  projectAuthor,
  projectGenre,
}: {
  projectId: number;
  projectTitle: string;
  projectAuthor: string | null | undefined;
  projectGenre: string | null | undefined;
}) {
  const [, navigate] = useLocation();

  const items = [
    {
      label: "Set your book title",
      done: !!projectTitle && projectTitle !== "Untitled Project",
      icon: BookOpen,
      action: () => {
        const el = document.querySelector<HTMLButtonElement>('[data-title-editor]');
        el?.click();
      },
    },
    {
      label: "Add author name",
      done: !!projectAuthor,
      icon: User,
      action: () => {
        const el = document.querySelector<HTMLButtonElement>('[data-author-editor]');
        el?.click();
      },
    },
    {
      label: "Choose a genre",
      done: !!projectGenre,
      icon: Tag,
      action: () => {
        const el = document.querySelector<HTMLButtonElement>('[data-genre-editor]');
        el?.click();
      },
    },
    {
      label: "Upload your manuscript",
      done: false,
      icon: Upload,
      action: () => {
        const el = document.getElementById("phase-concept");
        el?.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      label: "Select a trim size",
      done: false,
      icon: Ruler,
      action: () => navigate("/print-specs"),
    },
    {
      label: "Run Auto-Produce",
      done: false,
      icon: Wand2,
      action: () => navigate(`/auto-produce/${projectId}`),
    },
  ];

  const doneCount = items.filter((i) => i.done).length;

  if (doneCount >= 3) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border-[#c9a96e]/40 bg-gradient-to-br from-[#fdf9f3] to-[#f5efe0] shadow-md mb-8 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#e0c48a] flex items-center justify-center shadow-sm">
              <Rocket size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#3a2a1a]">Getting Started</h3>
              <p className="text-xs text-[#8b7b6b]">Complete these steps to set up your project</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-sm font-semibold text-[#c9a96e]">{doneCount}/{items.length}</span>
              <div className="w-20 h-1.5 rounded-full bg-[#c9a96e]/20 mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c9a96e] to-[#e0c48a] transition-all duration-500"
                  style={{ width: `${(doneCount / items.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    item.done
                      ? "bg-[#f0faf2] border border-[#4a6741]/20 cursor-default"
                      : "bg-white border border-[#e8dfd0] hover:border-[#c9a96e]/50 hover:shadow-sm cursor-pointer"
                  }`}
                >
                  {item.done ? (
                    <CircleCheck size={18} className="text-emerald-500 shrink-0" />
                  ) : (
                    <Circle size={18} className="text-[#c9a96e]/40 shrink-0" />
                  )}
                  <ItemIcon size={16} className={item.done ? "text-emerald-500/60 shrink-0" : "text-[#c9a96e] shrink-0"} />
                  <span className={`text-sm font-medium ${item.done ? "text-[#4a6741] line-through" : "text-[#3a2a1a]"}`}>
                    {item.label}
                  </span>
                  {!item.done && (
                    <ChevronRight size={14} className="ml-auto text-[#a89880]" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
  const [showAI, setShowAI] = useState(false);
  const [showWhatsNext, setShowWhatsNext] = useState(false);

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

  const { data: promptContext } = trpc.prompts.getContext.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 && !!data }
  );

  const whatsNextPrompts = useMemo(() => {
    if (!promptContext) return [];
    return getNextPrompts(promptContext as ProjectPromptContext);
  }, [promptContext]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#c9a96e]" size={32} />
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
            <TitleEditor projectId={projectId} currentTitle={project.title} />
            <div className="flex items-center gap-3 text-xs text-[#c9a96e]/70 print:text-[#8b7b6b]">
              <AuthorEditor projectId={projectId} currentAuthor={project.author} />
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
                  onClick={() => {
                    downloadProjectSummary({
                      project,
                      allPhases,
                      statusMap,
                      fileMap,
                      dueDateMap,
                      overallPct,
                      completedSteps,
                      totalSteps,
                      hiddenStepIds,
                    });
                    toast.success("Project summary exported");
                  }}
                >
                  <Download size={16} />
                  <span className="ml-1.5 text-xs hidden sm:inline">Export Summary</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export project summary as HTML</TooltipContent>
            </Tooltip>
          </div>

          {/* What's Next toggle */}
          <button
            onClick={() => setShowWhatsNext(v => !v)}
            className={`hidden sm:flex items-center gap-1.5 text-xs transition-colors print:hidden ${showWhatsNext ? "text-amber-400" : "text-amber-300/60 hover:text-amber-400"}`}
          >
            <Lightbulb size={14} />
            What's Next
          </button>

          {/* Notes toggle */}
          <button
            onClick={() => setShowNotes(v => !v)}
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#c9a96e]/60 hover:text-[#c9a96e] transition-colors print:hidden"
          >
            <MessageSquare size={14} />
            Notes
          </button>

          {/* AI Assistant toggle */}
          <button
            onClick={() => setShowAI(v => !v)}
            className={`hidden sm:flex items-center gap-1.5 text-xs transition-colors print:hidden ${showAI ? "text-purple-400" : "text-purple-300/60 hover:text-purple-400"}`}
          >
            <Wand2 size={14} />
            AI Assistant
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

        {/* What's Next — collapsible right panel */}
        {showWhatsNext && (
          <aside className="hidden lg:block w-72 shrink-0 print:hidden order-last">
            <div className="sticky top-24 bg-white/80 backdrop-blur-sm rounded-xl border border-[#e8dfd0] p-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Lightbulb size={14} className="text-amber-600" />
                  </div>
                  <h3 className="text-sm font-serif font-semibold text-[#2c1a00]">What's Next?</h3>
                </div>
                <button onClick={() => setShowWhatsNext(false)} className="text-[#a89880] hover:text-[#5c3d2e] transition-colors">
                  <X size={14} />
                </button>
              </div>
              {whatsNextPrompts.length > 0 ? (
                <WhatsNext prompts={whatsNextPrompts} title="Suggested Actions" />
              ) : (
                <p className="text-xs text-[#a89880] italic">No suggestions available for this project yet.</p>
              )}
            </div>
          </aside>
        )}

        {/* AI Writing Assistant — collapsible right panel */}
        {showAI && (
          <aside className="hidden lg:block w-72 shrink-0 print:hidden order-last">
            <div className="sticky top-24 bg-white/80 backdrop-blur-sm rounded-xl border border-[#e8dfd0] p-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Wand2 size={14} className="text-purple-600" />
                  </div>
                  <h3 className="text-sm font-serif font-semibold text-[#2c1a00]">AI Assistant</h3>
                </div>
                <button onClick={() => setShowAI(false)} className="text-[#a89880] hover:text-[#5c3d2e] transition-colors">
                  <X size={14} />
                </button>
              </div>
              <AIAssistantPanel
                projectTitle={project.title}
                projectAuthor={project.author}
                projectGenre={project.genre}
              />
            </div>
          </aside>
        )}

        {/* Main content — left-aligned */}
        <main className="flex-1 min-w-0 space-y-10">
          <AnimatePresence>
            {completedSteps < 3 && !printMode && (
              <GettingStartedChecklist
                projectId={projectId}
                projectTitle={project.title}
                projectAuthor={project.author}
                projectGenre={project.genre}
              />
            )}
          </AnimatePresence>
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
