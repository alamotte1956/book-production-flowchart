/**
 * EBP Production Wizard
 * A 5-step guided modal that takes a EBP template and walks the user through
 * every step needed to recreate a book in that style:
 *   Step 1 — Template Confirmation
 *   Step 2 — Book Details (title, author, or ISBN prefill)
 *   Step 3 — Typesetting Configuration (pre-filled from template)
 *   Step 4 — Manuscript Upload
 *   Step 5 — Launch Auto-Produce
 */

import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BookOpen, CheckCircle2, ChevronRight, ChevronLeft,
  Sparkles, Upload, Loader2, BookMarked, Rocket, X,
  AlertCircle, User, Hash,
} from "lucide-react";
import type { EBPTemplate } from "../../../shared/ebpTemplates";

// ─── Shared bibleSpecs imports ────────────────────────────────────────────────
// We import the arrays directly from the shared module so the wizard always
// shows the same options as the rest of the app.
import { TYPESETTING_STYLES, TRIM_SIZES, FONT_FAMILIES } from "../../../shared/bibleSpecs";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EBPProductionWizardProps = {
  template: EBPTemplate;
  /** Optional pre-filled book metadata (e.g. from ISBN lookup) */
  prefillBook?: {
    title?: string;
    author?: string;
    pageCount?: number;
    isbn?: string;
  };
  onClose: () => void;
};

type WizardStep = 1 | 2 | 3 | 4 | 5;

// ─── Step indicator ───────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { n: 1 as const, label: "Template" },
  { n: 2 as const, label: "Book Details" },
  { n: 3 as const, label: "Typesetting" },
  { n: 4 as const, label: "Manuscript" },
  { n: 5 as const, label: "Produce" },
];

function StepIndicator({ current }: { current: WizardStep }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {WIZARD_STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className={`flex flex-col items-center gap-1 ${i > 0 ? "ml-1" : ""}`}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s.n < current
                  ? "bg-emerald-500 text-white"
                  : s.n === current
                  ? "bg-[#7c3aed] text-white ring-2 ring-[#7c3aed]/30"
                  : "bg-[#e8ddd0] text-[#b0a090]"
              }`}
            >
              {s.n < current ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
            </div>
            <span
              className={`text-[10px] font-medium hidden sm:block ${
                s.n === current ? "text-[#7c3aed]" : "text-[#b0a090]"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < WIZARD_STEPS.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 mb-4 ${
                s.n < current ? "bg-emerald-400" : "bg-[#e8ddd0]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EBPProductionWizard({
  template,
  prefillBook,
  onClose,
}: EBPProductionWizardProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [step, setStep] = useState<WizardStep>(1);

  // Step 2: Book details
  const [title, setTitle] = useState(prefillBook?.title ?? "");
  const [author, setAuthor] = useState(prefillBook?.author ?? "");
  const [isbn, setIsbn] = useState(prefillBook?.isbn ?? "");

  // Step 3: Typesetting config (pre-filled from template)
  const [styleId, setStyleId] = useState(template.styleId);
  const [trimSizeId, setTrimSizeId] = useState(template.trimSizeId);
  const [fontOverrideBody, setFontOverrideBody] = useState("");
  const [fontOverrideHeading, setFontOverrideHeading] = useState("");

  // Step 4: Manuscript
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Step 5: Job launch
  const [projectId, setProjectId] = useState<number | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const createProject = trpc.project.create.useMutation();
  const startJob = trpc.autoProduce.start.useMutation();

  // ── Helpers ────────────────────────────────────────────────────────────────

  const canAdvance = (): boolean => {
    if (step === 2) return title.trim().length > 0;
    if (step === 4) return selectedFile !== null;
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedExts = /\.(docx?|txt|text|log|asc|rtf|epub|pdf|odt|pages|md|markdown|mdx|html?|xml|xlsx?|numbers|ods|csv|tsv|json|ya?ml|png|jpe?g|webp|tiff?|gif|svg|zip|rar)$/i;
    if (!allowedExts.test(file.name)) {
      setFileError("Unsupported file type. Accepted: Word, PDF, TXT, MD, HTML, RTF, EPUB, spreadsheets, images, and more.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setFileError("File too large. Maximum size is 50 MB.");
      return;
    }
    setFileError(null);
    setSelectedFile(file);
  };

  const handleLaunch = async () => {
    if (!user) return;
    if (!selectedFile) return;
    setLaunching(true);
    setLaunchError(null);

    try {
      // 1. Create project
      let pid = projectId;
      if (!pid) {
        const proj = await createProject.mutateAsync({
          title: title.trim(),
          author: author.trim() || undefined,
          genre: template.category,
          bibleEditionType: (template as { bibleEditionTypeId?: string }).bibleEditionTypeId,
          bibleTranslation: (template as { translationId?: string }).translationId,
        });
        pid = proj.id;
        setProjectId(pid);
        await utils.project.list.invalidate();
      }

      // 2. Read file as base64
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const fileBase64 = btoa(binary);

      // 3. Start production job
      const result = await startJob.mutateAsync({
        projectId: pid,
        trimSizeId,
        styleId,
        outputFormat: "both",
        fileName: selectedFile.name,
        mimeType: selectedFile.type || "application/octet-stream",
        fileBase64,
        fontOverrideBody: fontOverrideBody && fontOverrideBody !== "__default" ? fontOverrideBody : undefined,
        fontOverrideHeading: fontOverrideHeading && fontOverrideHeading !== "__default" ? fontOverrideHeading : undefined,
      });

      setJobId(result.jobId);
      setStep(5);
    } catch (err) {
      setLaunchError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLaunching(false);
    }
  };

  // ── Step content ───────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      // ── Step 1: Template confirmation ──────────────────────────────────────
      case 1:
        return (
          <div className="space-y-5">
            <div
              className="rounded-xl p-5 border"
              style={{
                backgroundColor: template.accentColor + "10",
                borderColor: template.accentColor + "30",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: template.accentColor + "20" }}
                >
                  <BookMarked className="w-6 h-6" style={{ color: template.accentColor }} />
                </div>
                <div>
                  <h3 className="font-bold text-[#3b2a1a] text-lg">{template.label}</h3>
                  <p className="text-sm text-[#7a6e60] mt-0.5">{template.tagline}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs">{template.trimLabel}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.pageCountRange[0]}–{template.pageCountRange[1]} pages
                    </Badge>
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#5c3d2e] leading-relaxed">{template.description}</p>

            <div>
              <h4 className="text-sm font-semibold text-[#6b5f53] uppercase tracking-wider mb-2">
                Key Production Features
              </h4>
              <ul className="space-y-1.5">
                {template.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#5c3d2e]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {prefillBook && (
              <div className="bg-[#f0ebe3] rounded-lg p-3 border border-[#c9a96e]/20">
                <p className="text-sm font-medium text-[#6b5f53] uppercase tracking-wider mb-1">
                  Pre-filled from ISBN lookup
                </p>
                <p className="text-sm font-semibold text-[#3b2a1a]">{prefillBook.title}</p>
                {prefillBook.author && (
                  <p className="text-sm text-[#6b5f53]">by {prefillBook.author}</p>
                )}
                {prefillBook.isbn && (
                  <p className="text-sm text-[#7a6e60]">ISBN {prefillBook.isbn}</p>
                )}
              </div>
            )}
          </div>
        );

      // ── Step 2: Book details ───────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-[#7a6e60]">
              Enter the details for the book you want to recreate. These will be used to create a
              new project.
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="ebpwiz-title" className="text-sm font-medium text-[#3b2a1a]">
                  Book Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ebpwiz-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. The Purpose Driven Life"
                  className="mt-1 border-[#c9a96e]/30 focus-visible:ring-[#c9a96e]/50"
                />
              </div>
              <div>
                <Label htmlFor="ebpwiz-author" className="text-sm font-medium text-[#3b2a1a]">
                  Author
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#b0a090]" />
                  <Input
                    id="ebpwiz-author"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    placeholder="e.g. Rick Warren"
                    className="pl-9 border-[#c9a96e]/30 focus-visible:ring-[#c9a96e]/50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ebpwiz-isbn" className="text-sm font-medium text-[#3b2a1a]">
                  ISBN (optional)
                </Label>
                <div className="relative mt-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#b0a090]" />
                  <Input
                    id="ebpwiz-isbn"
                    value={isbn}
                    onChange={e => setIsbn(e.target.value)}
                    placeholder="e.g. 9780310908501"
                    className="pl-9 border-[#c9a96e]/30 focus-visible:ring-[#c9a96e]/50"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      // ── Step 3: Typesetting config ─────────────────────────────────────────
      case 3: {
        // Show all styles/trim sizes but mark the template's recommended ones
        return (
          <div className="space-y-5">
            <div className="bg-[#f0ebe3] rounded-lg p-3 border border-[#c9a96e]/20">
              <div className="flex items-center gap-2 text-sm text-[#6b5f53]">
                <Sparkles className="w-3.5 h-3.5 text-[#c9a96e]" />
                Pre-filled from the{" "}
                <strong className="text-[#5c3d2e]">{template.label}</strong> template. Adjust if
                needed.
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-[#3b2a1a]">Typesetting Style</Label>
                <Select value={styleId} onValueChange={setStyleId}>
                  <SelectTrigger className="mt-1 border-[#c9a96e]/30 focus:ring-[#c9a96e]/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TYPESETTING_STYLES.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                        {s.id === template.styleId ? " ★" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-[#3b2a1a]">Trim Size</Label>
                <Select value={trimSizeId} onValueChange={setTrimSizeId}>
                  <SelectTrigger className="mt-1 border-[#c9a96e]/30 focus:ring-[#c9a96e]/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TRIM_SIZES.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                        {t.id === template.trimSizeId ? " ★" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-[#3b2a1a]">Body Font <span className="text-xs font-normal text-[#8b7a6a]">(optional)</span></Label>
                <Select value={fontOverrideBody} onValueChange={setFontOverrideBody}>
                  <SelectTrigger className="mt-1 border-[#c9a96e]/30 focus:ring-[#c9a96e]/50">
                    <SelectValue placeholder="Use style default" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__default">Use style default</SelectItem>
                    {FONT_FAMILIES.filter(f => f.category === "serif" || f.category === "sans-serif").map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.label} <span className="text-xs text-[#8b7a6a]">({f.category})</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-[#3b2a1a]">Heading & Chapter Font <span className="text-xs font-normal text-[#8b7a6a]">(optional)</span></Label>
                <Select value={fontOverrideHeading} onValueChange={setFontOverrideHeading}>
                  <SelectTrigger className="mt-1 border-[#c9a96e]/30 focus:ring-[#c9a96e]/50">
                    <SelectValue placeholder="Use style default" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="__default">Use style default</SelectItem>
                    {FONT_FAMILIES.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.label} <span className="text-xs text-[#8b7a6a]">({f.category})</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-sm text-[#7a6e60]">★ = recommended for this template</p>
          </div>
        );
      }

      // ── Step 4: Manuscript upload ──────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-5">
            <p className="text-sm text-[#7a6e60]">
              Upload your manuscript file. The AI typesetting engine will format it using the
              selected style and trim size to produce a press-ready PDF and EPUB.
            </p>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                selectedFile
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-[#c9a96e]/40 bg-[#f3efe6] hover:border-[#c9a96e] hover:bg-[#f5efe5]"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc,.odt,.pages,.pdf,.txt,.text,.log,.asc,.md,.markdown,.mdx,.html,.htm,.xml,.rtf,.xlsx,.xls,.numbers,.ods,.csv,.tsv,.json,.yaml,.yml,.epub,.png,.jpg,.jpeg,.webp,.tiff,.tif,.gif,.svg,.zip,.rar"
                className="hidden"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <p className="font-medium text-emerald-700">{selectedFile.name}</p>
                  <p className="text-sm text-emerald-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Click to change
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-[#c9a96e]/80" />
                  <p className="font-medium text-[#5c3d2e]">Click to upload manuscript</p>
                  <p className="text-sm text-[#7a6e60]">All text formats accepted · Max 50 MB</p>
                </div>
              )}
            </div>

            {fileError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{fileError}</p>
              </div>
            )}

            <div className="bg-[#f0ebe3] rounded-lg p-3 border border-[#c9a96e]/20 space-y-1">
              <p className="text-sm font-semibold text-[#5c3d2e]">Production summary</p>
              <p className="text-sm text-[#6b5f53]">Template: {template.label}</p>
              <p className="text-sm text-[#6b5f53]">
                Style: {TYPESETTING_STYLES.find(s => s.id === styleId)?.label ?? styleId}
              </p>
              <p className="text-sm text-[#6b5f53]">
                Trim: {TRIM_SIZES.find(t => t.id === trimSizeId)?.label ?? trimSizeId}
              </p>
              <p className="text-sm text-[#6b5f53]">Output: PDF + EPUB</p>
            </div>
          </div>
        );

      // ── Step 5: Launch ─────────────────────────────────────────────────────
      case 5:
        if (launching) {
          return (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-10 h-10 animate-spin text-[#7c3aed]" />
              <p className="font-medium text-[#3b2a1a]">Launching production job…</p>
              <p className="text-sm text-[#7a6e60]">
                Creating your project and starting the AI typesetting pipeline.
              </p>
            </div>
          );
        }

        if (launchError) {
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Launch failed</p>
                  <p className="text-sm text-red-600 mt-1">{launchError}</p>
                </div>
              </div>
              <Button
                onClick={handleLaunch}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white w-full"
              >
                Try Again
              </Button>
            </div>
          );
        }

        if (jobId) {
          return (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#3b2a1a] text-lg">Production job launched!</h3>
                <p className="text-sm text-[#7a6e60] mt-1">
                  Job #{jobId} is now running. The AI is typesetting your manuscript.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 border-[#c9a96e]/30"
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-[#3b2a1a] hover:bg-[#5c3d2e] text-white"
                  onClick={() => {
                    onClose();
                    if (projectId) navigate(`/project/${projectId}`);
                  }}
                >
                  View Project
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          );
        }

        // Ready to launch
        return (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="w-14 h-14 bg-[#7c3aed]/10 rounded-full flex items-center justify-center">
                <Rocket className="w-7 h-7 text-[#7c3aed]" />
              </div>
              <div>
                <h3 className="font-bold text-[#3b2a1a] text-lg">Ready to produce</h3>
                <p className="text-sm text-[#7a6e60] mt-1">
                  Click below to create your project and start the AI typesetting pipeline.
                </p>
              </div>
            </div>

            <div className="bg-[#f0ebe3] rounded-lg p-4 border border-[#c9a96e]/20 text-left space-y-2">
              <p className="text-sm font-semibold text-[#5c3d2e] uppercase tracking-wider">
                Final Summary
              </p>
              <Separator className="bg-[#c9a96e]/20" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-[#7a6e60]">Book</span>
                <span className="text-[#3b2a1a] font-medium truncate">{title}</span>
                {author && (
                  <>
                    <span className="text-[#7a6e60]">Author</span>
                    <span className="text-[#3b2a1a] truncate">{author}</span>
                  </>
                )}
                <span className="text-[#7a6e60]">Template</span>
                <span className="text-[#3b2a1a]">{template.label}</span>
                <span className="text-[#7a6e60]">Style</span>
                <span className="text-[#3b2a1a]">
                  {TYPESETTING_STYLES.find(s => s.id === styleId)?.label ?? styleId}
                </span>
                <span className="text-[#7a6e60]">Trim</span>
                <span className="text-[#3b2a1a]">
                  {TRIM_SIZES.find(t => t.id === trimSizeId)?.label ?? trimSizeId}
                </span>
                <span className="text-[#7a6e60]">Manuscript</span>
                <span className="text-[#3b2a1a] truncate">{selectedFile?.name ?? "—"}</span>
              </div>
            </div>


            <Button
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white h-11 text-base font-semibold"
              onClick={handleLaunch}
              disabled={!user || launching}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Launch Production Job
            </Button>
          </div>
        );
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const stepTitles: Record<WizardStep, string> = {
    1: "Confirm Template",
    2: "Book Details",
    3: "Typesetting Configuration",
    4: "Upload Manuscript",
    5: "Launch Production",
  };

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#f3efe6] border-[#c9a96e]/30">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-[#3b2a1a] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#c9a96e]" />
              Production Wizard
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-[#b0a090] hover:text-[#5c3d2e] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-[#7a6e60] mt-1">{stepTitles[step]}</p>
        </DialogHeader>

        <StepIndicator current={step} />

        <div className="min-h-[280px]">{renderStep()}</div>

        {/* Navigation — hidden on step 5 after launch */}
        {!(step === 5 && (jobId || launching)) && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-[#c9a96e]/20">
            {step > 1 && step < 5 && (
              <Button
                variant="outline"
                className="flex-1 border-[#c9a96e]/30 text-[#5c3d2e]"
                onClick={() => setStep(s => (s - 1) as WizardStep)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            {step < 5 && (
              <Button
                className="flex-1 bg-[#3b2a1a] hover:bg-[#5c3d2e] text-white"
                disabled={!canAdvance()}
                onClick={() => setStep(s => (s + 1) as WizardStep)}
              >
                {step === 4 ? (
                  <>
                    Review &amp; Launch <Rocket className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
