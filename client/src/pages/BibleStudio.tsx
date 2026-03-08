/**
 * Bible Design Studio
 * A comprehensive Bible edition configurator giving publishers complete freedom
 * to design any style of Bible — from compact pocket editions to giant-print
 * study Bibles with journaling margins, red-letter text, and full reference apparatus.
 * Includes AI Writing Assistant for generating back-cover blurbs, author bios, and marketing copy.
 */
import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, BookOpen, Printer, FileDown, ChevronRight, Info, Check, Sparkles, Wand2, Copy, RefreshCw, ChevronDown } from "lucide-react";
import WhatsNext from "@/components/WhatsNext";
import RelatedTools from "@/components/RelatedTools";
import SiteFooter from "@/components/SiteFooter";
import type { NextPrompt } from "@shared/prompts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { exportSpecSheetAsPdf } from "@/lib/exportPdf";
import {
  BIBLE_EDITION_TYPES,
  BIBLE_TRANSLATIONS,
  TRIM_SIZES,
  TYPESETTING_STYLES,
  PAPER_TYPES,
  BINDING_TYPES,
  TYPEFACES,
  TYPEFACE_PAIRINGS,
  calculateSpineWidth,
  getBibleTrimSizes,
  getBibleStyles,
  getTypefacesByCategory,
  type BibleEditionType,
  type TypefaceCategory,
} from "@shared/bibleSpecs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BibleConfig {
  editionTypeId: string;
  translationId: string;
  trimSizeId: string;
  styleId: string;
  paperTypeId: string;
  bindingTypeId: string;
  redLetter: boolean;
  crossReferences: boolean;
  centerColumnReferences: boolean;
  footnotes: boolean;
  sectionHeadings: boolean;
  poetryStanzas: boolean;
  versePerLine: boolean;
  concordance: boolean;
  maps: boolean;
  bookIntroductions: boolean;
  readingPlan: boolean;
  ribbonMarker: boolean;
  thumbIndex: boolean;
  gildedEdges: boolean;
  flexibleCover: boolean;
  twoColorPrinting: boolean;
  pageCount: number;
  bodyTypefaceId: string;
  headingTypefaceId: string;
  verseNumberTypefaceId: string;
}

const DEFAULT_CONFIG: BibleConfig = {
  editionTypeId: "standard",
  translationId: "kjv",
  trimSizeId: "bible-standard",
  styleId: "scripture",
  paperTypeId: "india-24",
  bindingTypeId: "smyth-sewn-hardcover",
  redLetter: false,
  crossReferences: true,
  centerColumnReferences: false,
  footnotes: false,
  sectionHeadings: true,
  poetryStanzas: true,
  versePerLine: false,
  concordance: false,
  maps: false,
  bookIntroductions: true,
  readingPlan: false,
  ribbonMarker: false,
  thumbIndex: false,
  gildedEdges: false,
  flexibleCover: false,
  twoColorPrinting: false,
  pageCount: 1200,
  bodyTypefaceId: "garamond",
  headingTypefaceId: "italic-garamond",
  verseNumberTypefaceId: "sans-roboto-condensed",
};

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4 mb-5">
      <div className="w-8 h-8 rounded-full bg-[#2c1a00] text-[#c9a96e] flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 shadow-sm">
        {step}
      </div>
      <div>
        <h2 className="text-lg font-serif font-semibold text-[#2c1a00]">{title}</h2>
        <p className="text-sm text-[#8b7b6b] mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Option Card ──────────────────────────────────────────────────────────────

function OptionCard({
  selected,
  onClick,
  title,
  subtitle,
  badge,
  features,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  features?: string[];
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-lg border-2 transition-all ${
        selected
          ? "border-[#8b5e3c] bg-[#fdf5ec] shadow-sm"
          : "border-[#e8ddd0] bg-white hover:border-[#c9a96e]/60 hover:bg-[#fdf9f3]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${selected ? "text-[#5c3d2e]" : "text-[#3d2b1f]"}`}>{title}</span>
            {badge && (
              <Badge variant="outline" className="text-[10px] border-[#c9a96e] text-[#8b5e3c] py-0 px-1.5">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && <p className="text-xs text-[#8b7b6b] mt-0.5 leading-relaxed">{subtitle}</p>}
          {features && features.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {features.slice(0, 4).map(f => (
                <span key={f} className="text-[10px] bg-[#f0e8dc] text-[#7a5c3a] px-1.5 py-0.5 rounded">
                  {f}
                </span>
              ))}
              {features.length > 4 && (
                <span className="text-[10px] text-[#a08060]">+{features.length - 4} more</span>
              )}
            </div>
          )}
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-[#8b5e3c] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Feature Toggle ───────────────────────────────────────────────────────────

function FeatureToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  premium,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  premium?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-[#f0e8dc] last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <Label htmlFor={id} className="text-sm font-medium text-[#3d2b1f] cursor-pointer leading-tight">
          {label}
        </Label>
        {premium && (
          <Badge variant="outline" className="text-[9px] border-[#c9a96e] text-[#8b5e3c] py-0 px-1">
            Premium
          </Badge>
        )}
        {description && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-[#b0a090] cursor-help flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px] text-xs">{description}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ─── Spec Summary ─────────────────────────────────────────────────────────────

function SpecSummary({ config }: { config: BibleConfig }) {
  const edition = BIBLE_EDITION_TYPES.find(e => e.id === config.editionTypeId);
  const translation = BIBLE_TRANSLATIONS.find(t => t.id === config.translationId);
  const trim = TRIM_SIZES.find(t => t.id === config.trimSizeId);
  const style = TYPESETTING_STYLES.find(s => s.id === config.styleId);
  const paper = PAPER_TYPES.find(p => p.id === config.paperTypeId);
  const binding = BINDING_TYPES.find(b => b.id === config.bindingTypeId);

  const spine = useMemo(
    () => calculateSpineWidth(config.pageCount, config.paperTypeId, config.bindingTypeId),
    [config.pageCount, config.paperTypeId, config.bindingTypeId]
  );

  const activeFeatures = [
    config.redLetter && "Red Letter",
    config.crossReferences && "Cross-References",
    config.centerColumnReferences && "Center Column Refs",
    config.footnotes && "Footnotes",
    config.sectionHeadings && "Section Headings",
    config.poetryStanzas && "Poetry Stanzas",
    config.versePerLine && "Verse-per-Line",
    config.concordance && "Concordance",
    config.maps && "Maps",
    config.bookIntroductions && "Book Introductions",
    config.readingPlan && "Reading Plan",
    config.ribbonMarker && "Ribbon Marker",
    config.thumbIndex && "Thumb Index",
    config.gildedEdges && "Gilded Edges",
    config.flexibleCover && "Flexible Cover",
    config.twoColorPrinting && "Two-Color Printing",
  ].filter(Boolean) as string[];

  const handleExportSpecSheet = async () => {
    try {
    await exportSpecSheetAsPdf({
      title: "Bible Edition Spec Sheet",
      subtitle: edition?.label ?? "Bible Edition",
      filename: `Bible-Spec-Sheet-${edition?.label ?? "Edition"}.pdf`,
      sections: [
        {
          title: "Core Specifications",
          rows: [
            { label: "Edition Type", value: edition?.label ?? "—" },
            { label: "Translation", value: `${translation?.label ?? "—"}${translation?.fullName ? ` (${translation.fullName})` : ""}` },
            { label: "Trim Size", value: trim?.label ?? "—" },
            { label: "Typesetting Style", value: style?.label ?? "—" },
            { label: "Paper Type", value: paper?.label ?? "—" },
            { label: "Binding Type", value: binding?.label ?? "—" },
          ],
        },
        {
          title: "Typeface Selection",
          rows: [
            { label: "Body Text", value: TYPEFACES.find(t => t.id === config.bodyTypefaceId)?.name ?? "—" },
            { label: "Chapter Headings", value: TYPEFACES.find(t => t.id === config.headingTypefaceId)?.name ?? "—" },
            { label: "Verse Numbers", value: TYPEFACES.find(t => t.id === config.verseNumberTypefaceId)?.name ?? "—" },
          ],
        },
        {
          title: "Physical Dimensions",
          rows: [
            { label: "Estimated Page Count", value: `${config.pageCount.toLocaleString()} pp` },
            { label: "Calculated Spine Width", value: `${spine.spineWidthIn.toFixed(3)}" / ${spine.spineWidthMm}mm`, bold: true },
          ],
        },
        ...(activeFeatures.length > 0 ? [{
          title: `Active Features (${activeFeatures.length})`,
          rows: activeFeatures.map(f => ({ label: f, value: "✓" })),
        }] : []),
      ],
      footerNote: spine.notes,
    });
    } catch (err) {
      toast.error("PDF generation failed. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#2c1a00] rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-[#c9a96e]" />
          <span className="text-sm font-semibold text-[#c9a96e] tracking-wide uppercase">Edition Spec Sheet</span>
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between gap-2">
            <span className="text-[#a08060]">Edition</span>
            <span className="text-white font-medium text-right">{edition?.label ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#a08060]">Translation</span>
            <span className="text-white font-medium text-right">{translation?.label ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#a08060]">Trim Size</span>
            <span className="text-white font-medium text-right">{trim?.label ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#a08060]">Typography</span>
            <span className="text-white font-medium text-right">{style?.label ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#a08060]">Paper</span>
            <span className="text-white font-medium text-right">{paper?.label ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#a08060]">Binding</span>
            <span className="text-white font-medium text-right">{binding?.label ?? "—"}</span>
          </div>
          <Separator className="bg-[#4a3828] my-1" />
          <div className="flex justify-between gap-2">
            <span className="text-[#a08060]">Body Typeface</span>
            <span className="text-white font-medium text-right">{TYPEFACES.find(t => t.id === config.bodyTypefaceId)?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#a08060]">Heading Typeface</span>
            <span className="text-white font-medium text-right">{TYPEFACES.find(t => t.id === config.headingTypefaceId)?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#a08060]">Verse # Typeface</span>
            <span className="text-white font-medium text-right">{TYPEFACES.find(t => t.id === config.verseNumberTypefaceId)?.name ?? "—"}</span>
          </div>
          <Separator className="bg-[#4a3828] my-1" />
          <div className="flex justify-between gap-2">
            <span className="text-[#a08060]">Page Count</span>
            <span className="text-white font-medium">{config.pageCount.toLocaleString()} pp</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#a08060]">Spine Width</span>
            <span className="text-[#c9a96e] font-bold">{spine.spineWidthIn.toFixed(3)}" / {spine.spineWidthMm}mm</span>
          </div>
        </div>
      </div>

      {activeFeatures.length > 0 && (
        <div className="bg-[#fdf5ec] rounded-xl p-4 border border-[#e8ddd0]">
          <p className="text-xs font-semibold text-[#5c3d2e] uppercase tracking-wide mb-3">Active Features ({activeFeatures.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {activeFeatures.map(f => (
              <span key={f} className="text-xs bg-[#8b5e3c] text-white px-2 py-0.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#f4f0ea] rounded-xl p-4 border border-[#e8ddd0]">
        <p className="text-xs font-semibold text-[#5c3d2e] uppercase tracking-wide mb-2">Spine Calculation</p>
        <p className="text-xs text-[#7a6050] leading-relaxed">{spine.notes}</p>
      </div>

      <Button
        className="w-full bg-[#8b5e3c] hover:bg-[#7a4f30] text-white gap-2"
        onClick={() => window.location.href = "/auto-produce/0"}
      >
        <Sparkles className="w-4 h-4" />
        Start Production with These Specs
        <ChevronRight className="w-4 h-4 ml-auto" />
      </Button>

      <Button
        variant="outline"
        className="w-full border-[#c9a96e] text-[#5c3d2e] hover:bg-[#fdf5ec] gap-2"
        onClick={() => window.location.href = "/spine-calculator"}
      >
        <Printer className="w-4 h-4" />
        Open Spine Calculator
      </Button>

      <Button
        variant="outline"
        className="w-full border-[#c9a96e] text-[#5c3d2e] hover:bg-[#fdf5ec] gap-2"
        onClick={handleExportSpecSheet}
      >
        <FileDown className="w-4 h-4" />
        Export Spec Sheet (Print / PDF)
      </Button>

      <WhatsNext
        compact
        className="mt-2"
        prompts={[
          {
            id: "after_bible_spine",
            title: "Calculate Your Spine Width",
            description: "Your Bible edition specs are configured! Next, calculate the exact spine width for your cover file using the Spine Calculator.",
            actionLabel: "Open Spine Calculator",
            actionRoute: "/spine-calculator",
            icon: "spine_calc",
            priority: "high",
          } satisfies NextPrompt,
        ]}
      />
    </div>
  );
}

// ─── AI Writing Assistant ─────────────────────────────────────────────────────

const COPY_TYPES = [
  { value: "back-cover-blurb", label: "Back-Cover Blurb", desc: "~150 words" },
  { value: "author-bio", label: "Author Biography", desc: "~100 words" },
  { value: "catalog-description", label: "Catalog Description", desc: "~200 words" },
  { value: "press-release", label: "Press Release", desc: "~300 words" },
  { value: "marketing-email", label: "Marketing Email", desc: "~250 words" },
] as const;

const TONES = [
  { value: "literary", label: "Literary" },
  { value: "commercial", label: "Commercial" },
  { value: "academic", label: "Academic" },
  { value: "inspirational", label: "Inspirational" },
  { value: "devotional", label: "Devotional" },
] as const;

function AIWritingAssistant() {
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [copyType, setCopyType] = useState<typeof COPY_TYPES[number]["value"]>("back-cover-blurb");
  const [tone, setTone] = useState<typeof TONES[number]["value"]>("inspirational");
  const [result, setResult] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="bg-white rounded-xl border border-[#e8ddd0] overflow-hidden">
      {/* Header — always visible */}
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-[#fdf9f3] transition-colors"
        onClick={() => setIsOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Wand2 size={16} className="text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-[#2c1a00]">AI Writing Assistant</h3>
            <p className="text-[11px] text-[#8b7b6b]">Generate blurbs, bios, and marketing copy</p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-[#a08060] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-[#f0e8dc] pt-4 space-y-4">
          {/* Copy type */}
          <div>
            <Label className="text-xs font-semibold text-[#5c3d2e] uppercase tracking-wide mb-2 block">Copy Type</Label>
            <div className="grid grid-cols-1 gap-1.5">
              {COPY_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => setCopyType(ct.value)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${
                    copyType === ct.value
                      ? "border-purple-400 bg-purple-50 text-purple-800"
                      : "border-[#e8ddd0] bg-white text-[#3d2b1f] hover:border-[#c9a96e]/60"
                  }`}
                >
                  <span className="font-medium">{ct.label}</span>
                  <span className="text-[10px] text-[#a08060]">{ct.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Book details */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#5c3d2e] uppercase tracking-wide block">Book Details</Label>
            <Input
              value={bookTitle}
              onChange={e => setBookTitle(e.target.value)}
              placeholder="Book title *"
              className="text-sm border-[#e8ddd0]"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Author name"
                className="text-sm border-[#e8ddd0]"
              />
              <Input
                value={genre}
                onChange={e => setGenre(e.target.value)}
                placeholder="Genre"
                className="text-sm border-[#e8ddd0]"
              />
            </div>
            <Textarea
              value={synopsis}
              onChange={e => setSynopsis(e.target.value)}
              placeholder="Brief synopsis or key selling points (optional)"
              className="text-sm border-[#e8ddd0] resize-none"
              rows={3}
            />
          </div>

          {/* Tone */}
          <div>
            <Label className="text-xs font-semibold text-[#5c3d2e] uppercase tracking-wide mb-2 block">Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
              <SelectTrigger className="border-[#e8ddd0] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate button */}
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

          {/* Result */}
          {result && (
            <div className="bg-[#fdf9f3] rounded-lg border border-[#e8ddd0] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#8b5e3c] uppercase tracking-wide">
                  {COPY_TYPES.find(ct => ct.value === copyType)?.label}
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
      )}
    </div>
  );
}

// ─── Recommended Typeface Pairings ───────────────────────────────────────────

function RecommendedPairings({ onApply }: { onApply: (bodyId: string, headingId: string, verseId: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-[#e8ddd0] overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-[#fdf9f3] transition-colors"
        onClick={() => setIsOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Sparkles size={16} className="text-amber-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-[#2c1a00]">Typeface Pairings</h3>
            <p className="text-[11px] text-[#8b7b6b]">Professional font combinations — one-click apply</p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-[#a08060] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-[#f0e8dc] pt-4 space-y-3">
          {TYPEFACE_PAIRINGS.map(pairing => {
            const bodyFace = TYPEFACES.find(t => t.id === pairing.bodyTypefaceId);
            const headingFace = TYPEFACES.find(t => t.id === pairing.headingTypefaceId);
            const verseFace = TYPEFACES.find(t => t.id === pairing.verseNumberTypefaceId);

            const fontUrls = Array.from(new Set(
              [bodyFace?.googleFontsUrl, headingFace?.googleFontsUrl, verseFace?.googleFontsUrl].filter((u): u is string => !!u)
            ));

            return (
              <div key={pairing.id} className="rounded-lg border border-[#e8ddd0] bg-[#fdf9f3] p-3">
                {fontUrls.map(url => <link key={url} rel="stylesheet" href={url} />)}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-[#2c1a00]">{pairing.name}</p>
                    <p className="text-[11px] text-[#8b7b6b] mt-0.5 leading-relaxed">{pairing.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {pairing.tags.map(tag => (
                    <span key={tag} className="text-[9px] bg-[#e8ddd0] text-[#5c3d2e] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5 mb-3 bg-white rounded-lg border border-[#f0e8dc] p-3">
                  <div>
                    <p className="text-[9px] text-[#a08060] uppercase tracking-wider font-bold mb-0.5">Body</p>
                    <p
                      className="text-sm text-[#2c1a00] leading-snug"
                      style={{ fontFamily: bodyFace?.cssFamily }}
                    >
                      In the beginning God created the heavens and the earth.
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#a08060] uppercase tracking-wider font-bold mb-0.5">Heading</p>
                    <p
                      className="text-base text-[#2c1a00] leading-snug"
                      style={{
                        fontFamily: headingFace?.cssFamily,
                        fontStyle: headingFace?.category === "italic" ? "italic" : "normal",
                      }}
                    >
                      Genesis · Chapter 1
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#a08060] uppercase tracking-wider font-bold mb-0.5">Verse Numbers</p>
                    <p
                      className="text-sm text-[#2c1a00] leading-snug"
                      style={{
                        fontFamily: verseFace?.cssFamily,
                        fontWeight: verseFace?.category === "sans-serif-bold" ? 700 : 400,
                      }}
                    >
                      ¹ In the beginning ² And the earth was
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#8b7b6b] mb-2">
                  <span>{bodyFace?.name} · {headingFace?.name} · {verseFace?.name}</span>
                </div>

                <Button
                  size="sm"
                  className="w-full bg-[#8b5e3c] hover:bg-[#7a4f30] text-white gap-1.5 text-xs"
                  onClick={() => {
                    onApply(pairing.bodyTypefaceId, pairing.headingTypefaceId, pairing.verseNumberTypefaceId);
                    toast.success(`Applied "${pairing.name}" typeface pairing`);
                  }}
                >
                  <Check size={12} />
                  Use This Pairing
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BibleStudio() {
  const [, navigate] = useLocation();
  const [config, setConfig] = useState<BibleConfig>(DEFAULT_CONFIG);

  const set = <K extends keyof BibleConfig>(key: K, value: BibleConfig[K]) =>
    setConfig(prev => ({ ...prev, [key]: value }));

  const applyEditionDefaults = (edition: BibleEditionType) => {
    setConfig(prev => ({
      ...prev,
      editionTypeId: edition.id,
      trimSizeId: edition.defaultTrimSizeId,
      styleId: edition.defaultStyleId,
      paperTypeId: edition.defaultPaperTypeId,
      redLetter: edition.id === "red-letter",
      crossReferences: ["study", "reference", "devotional"].includes(edition.id),
      centerColumnReferences: edition.id === "reference",
      footnotes: ["study", "reference"].includes(edition.id),
      sectionHeadings: !["compact"].includes(edition.id),
      concordance: ["study", "reference"].includes(edition.id),
      maps: ["study", "reference"].includes(edition.id),
      bookIntroductions: ["study", "reference", "devotional"].includes(edition.id),
      readingPlan: edition.id === "devotional",
      ribbonMarker: ["standard", "red-letter", "study", "reference"].includes(edition.id),
      thumbIndex: edition.id === "reference",
      gildedEdges: false,
      flexibleCover: ["compact", "pew"].includes(edition.id),
    }));
  };

  const bibleTrimSizes = getBibleTrimSizes();
  const bibleStyles = getBibleStyles();

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <header className="bg-[#2c1a00] text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-lg border-b border-[#4a3828]">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-[#c9a96e] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#3d2810]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#c9a96e]/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#c9a96e]" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold leading-tight">Bible Design Studio</h1>
            <p className="text-xs text-[#a08060]">Configure any Bible edition with complete freedom</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-[#c9a96e] text-[#c9a96e] hover:bg-[#3d2810] gap-1.5 text-xs"
            onClick={() => navigate("/auto-produce/0")}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Start Production
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Configuration panels */}
          <div className="lg:col-span-2 space-y-10">

            {/* Step 1: Edition Type */}
            <section>
              <SectionHeader step={1} title="Edition Type" subtitle="Choose the Bible format that defines your production goals" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BIBLE_EDITION_TYPES.map(edition => (
                  <OptionCard
                    key={edition.id}
                    selected={config.editionTypeId === edition.id}
                    onClick={() => applyEditionDefaults(edition)}
                    title={edition.label}
                    subtitle={edition.description}
                    features={edition.features}
                  />
                ))}
              </div>
            </section>

            {/* Step 2: Translation */}
            <section>
              <SectionHeader step={2} title="Translation / Version" subtitle="Select the Bible translation or enter a custom version" />
              {/* Public Domain group */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-[#4a7c59] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#4a7c59]" />
                  Public Domain — no license required
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BIBLE_TRANSLATIONS.filter(t => t.publicDomain).map(t => (
                    <OptionCard
                      key={t.id}
                      selected={config.translationId === t.id}
                      onClick={() => set("translationId", t.id)}
                      title={t.label}
                      subtitle={t.fullName}
                      badge={t.ukRestriction ? "UK Restriction" : "Public Domain"}
                    />
                  ))}
                </div>
              </div>
              {/* Licensed group */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-[#c0392b] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#c0392b]" />
                  Licensed — rights agreement required
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BIBLE_TRANSLATIONS.filter(t => !t.publicDomain && t.id !== "custom").map(t => (
                    <OptionCard
                      key={t.id}
                      selected={config.translationId === t.id}
                      onClick={() => set("translationId", t.id)}
                      title={t.label}
                      subtitle={t.fullName}
                      badge="Licensed"
                    />
                  ))}
                </div>
              </div>
              {/* Custom */}
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BIBLE_TRANSLATIONS.filter(t => t.id === "custom").map(t => (
                    <OptionCard
                      key={t.id}
                      selected={config.translationId === t.id}
                      onClick={() => set("translationId", t.id)}
                      title={t.label}
                      subtitle={t.fullName}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Step 3: Trim Size */}
            <section>
              <SectionHeader step={3} title="Trim Size" subtitle="Physical page dimensions — choose the size that fits your audience and binding" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {bibleTrimSizes.map(trim => (
                  <OptionCard
                    key={trim.id}
                    selected={config.trimSizeId === trim.id}
                    onClick={() => set("trimSizeId", trim.id)}
                    title={trim.label}
                    subtitle={trim.description}
                  />
                ))}
              </div>
              <div className="mt-3 p-3 bg-[#f5ede4] rounded-lg border border-[#e8ddd0]">
                <p className="text-xs text-[#7a5c3a] flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Need a custom trim size? Standard book trim sizes (5×8, 6×9, 7×10, etc.) are also available on the Auto-Produce page.
                </p>
              </div>
            </section>

            {/* Step 4: Typesetting Style */}
            <section>
              <SectionHeader step={4} title="Typesetting Style" subtitle="Typography, column layout, font size, and visual character of the text" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {bibleStyles.map(style => (
                  <OptionCard
                    key={style.id}
                    selected={config.styleId === style.id}
                    onClick={() => set("styleId", style.id)}
                    title={style.label}
                    subtitle={`${style.fontSize}pt · ${style.doubleColumn ? "Double column" : "Single column"} · ${style.lineHeight}× leading`}
                    badge={style.redLetter ? "Red Letter" : style.marginStyle === "journaling" ? "Journaling" : style.marginStyle === "wide" ? "Wide Margin" : undefined}
                  />
                ))}
              </div>
            </section>

            {/* Step 4b: Typeface Selection */}
            <section>
              <SectionHeader step={5} title="Typeface Selection" subtitle="Choose typefaces for body text, chapter headings, and verse numbers — three independent choices" />

              {/* Load selected Google Fonts dynamically */}
              {(() => {
                const bodyFace = TYPEFACES.find(t => t.id === config.bodyTypefaceId);
                const headingFace = TYPEFACES.find(t => t.id === config.headingTypefaceId);
                const verseFace = TYPEFACES.find(t => t.id === config.verseNumberTypefaceId);
                const urls = Array.from(new Set([bodyFace?.googleFontsUrl, headingFace?.googleFontsUrl, verseFace?.googleFontsUrl].filter((u): u is string => !!u)));
                return urls.map(url => <link key={url} rel="stylesheet" href={url} />);
              })()}

              <div className="space-y-6">
                {([
                  { label: "Body Text", key: "bodyTypefaceId" as const, categories: ["serif"] as TypefaceCategory[], desc: "The primary reading font — used for all scripture text" },
                  { label: "Chapter Headings & Titles", key: "headingTypefaceId" as const, categories: ["italic", "serif"] as TypefaceCategory[], desc: "Used for book names, chapter numbers, and section headers" },
                  { label: "Verse Numbers", key: "verseNumberTypefaceId" as const, categories: ["sans-serif-bold", "serif"] as TypefaceCategory[], desc: "Inline verse number style — often a contrasting face" },
                ] as const).map(({ label, key, categories, desc }) => {
                  const allFaces = categories.flatMap(cat => getTypefacesByCategory(cat));
                  const selectedFace = TYPEFACES.find(t => t.id === config[key]);
                  return (
                    <div key={key} className="bg-white rounded-xl border border-[#e8ddd0] p-4">
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-[#2c1a00]">{label}</p>
                        <p className="text-xs text-[#8b7b6b]">{desc}</p>
                      </div>

                      {/* Category tabs */}
                      <div className="flex gap-1.5 mb-3 flex-wrap">
                        {categories.map(cat => (
                          <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0e8d8] text-[#5c3d2e] font-semibold uppercase tracking-wide">
                            {cat === "sans-serif-bold" ? "Sans-Serif Bold" : cat === "italic" ? "Italic" : "Serif"}
                          </span>
                        ))}
                      </div>

                      {/* Font grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {allFaces.map(face => (
                          <button
                            key={face.id}
                            onClick={() => set(key, face.id)}
                            className={`text-left p-3 rounded-lg border transition-all ${
                              config[key] === face.id
                                ? "border-[#8b5e3c] bg-[#fdf5ec] shadow-sm"
                                : "border-[#e8ddd0] bg-white hover:border-[#c9a96e] hover:bg-[#faf6ef]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-[#3a2a1a] truncate">{face.name}</p>
                                <p className="text-[10px] text-[#a08060] mt-0.5 leading-tight">{face.note}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                {config[key] === face.id && (
                                  <Check className="w-3.5 h-3.5 text-[#8b5e3c]" />
                                )}
                                {face.bibleRecommended && (
                                  <span className="text-[9px] bg-[#c9a96e] text-[#2a1a0a] px-1.5 py-0.5 rounded font-bold">BIBLE</span>
                                )}
                              </div>
                            </div>
                            {/* Live preview */}
                            <p
                              className="mt-2 text-sm text-[#3a2a1a] leading-snug border-t border-[#f0e8dc] pt-2"
                              style={{
                                fontFamily: face.cssFamily,
                                fontStyle: face.category === "italic" ? "italic" : "normal",
                                fontWeight: face.category === "sans-serif-bold" ? 700 : 400,
                              }}
                            >
                              {key === "verseNumberTypefaceId" ? "¹ In the beginning" : key === "headingTypefaceId" ? "Genesis · Chapter 1" : "In the beginning God created the heavens and the earth."}
                            </p>
                          </button>
                        ))}
                      </div>

                      {/* Selected summary */}
                      {selectedFace && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-[#5c3d2e] bg-[#fdf5ec] rounded-lg px-3 py-2">
                          <Check className="w-3.5 h-3.5 text-[#8b5e3c] flex-shrink-0" />
                          <span>
                            <strong>{selectedFace.name}</strong>
                            <span className="text-[#a08060]"> — {selectedFace.cssFamily}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Step 6: Paper Type */}
            <section>
              <SectionHeader step={5} title="Paper Type" subtitle="Paper weight, opacity, and thickness — critical for Bible bulk and readability" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PAPER_TYPES.map(paper => (
                  <OptionCard
                    key={paper.id}
                    selected={config.paperTypeId === paper.id}
                    onClick={() => set("paperTypeId", paper.id)}
                    title={paper.label}
                    subtitle={paper.description}
                    badge={paper.bibleGrade ? "Bible Grade" : undefined}
                  />
                ))}
              </div>
            </section>

            {/* Step 6: Binding */}
            <section>
              <SectionHeader step={6} title="Binding Type" subtitle="How the book is assembled — determines durability, cost, and how it opens" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BINDING_TYPES.map(binding => (
                  <OptionCard
                    key={binding.id}
                    selected={config.bindingTypeId === binding.id}
                    onClick={() => set("bindingTypeId", binding.id)}
                    title={binding.label}
                    subtitle={binding.description}
                    badge={binding.bibleGrade ? "Bible Grade" : undefined}
                  />
                ))}
              </div>
            </section>

            {/* Step 7: Page Count */}
            <section>
              <SectionHeader step={7} title="Estimated Page Count" subtitle="Used to calculate spine width — update when your final page count is known" />
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#e8ddd0]">
                <div className="flex-1">
                  <input
                    type="range"
                    min={400}
                    max={2400}
                    step={50}
                    value={config.pageCount}
                    onChange={e => set("pageCount", parseInt(e.target.value))}
                    className="w-full accent-[#8b5e3c]"
                  />
                  <div className="flex justify-between text-xs text-[#a08060] mt-1">
                    <span>400 pp</span>
                    <span>1,200 pp</span>
                    <span>2,400 pp</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-[#2c1a00]">{config.pageCount.toLocaleString()}</div>
                  <div className="text-xs text-[#a08060]">pages</div>
                </div>
              </div>
            </section>

            {/* Step 8: Special Features */}
            <section>
              <SectionHeader step={8} title="Special Features" subtitle="Toggle every feature that will appear in your Bible edition" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="border-[#e8ddd0]">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm text-[#5c3d2e]">Text Features</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <FeatureToggle id="red-letter" label="Red Letter" description="Words of Christ printed in red/crimson" checked={config.redLetter} onCheckedChange={v => set("redLetter", v)} />
                    <FeatureToggle id="section-headings" label="Section Headings" description="Bold headings dividing the text into named sections" checked={config.sectionHeadings} onCheckedChange={v => set("sectionHeadings", v)} />
                    <FeatureToggle id="poetry-stanzas" label="Poetry Stanzas" description="Psalms, Proverbs, and poetic books formatted in stanza layout" checked={config.poetryStanzas} onCheckedChange={v => set("poetryStanzas", v)} />
                    <FeatureToggle id="verse-per-line" label="Verse-per-Line" description="Each verse begins on a new line (traditional KJV format)" checked={config.versePerLine} onCheckedChange={v => set("versePerLine", v)} />
                    <FeatureToggle id="two-color" label="Two-Color Printing" description="Red ink for red-letter text and section headings; requires two-color press run" checked={config.twoColorPrinting} onCheckedChange={v => set("twoColorPrinting", v)} premium />
                  </CardContent>
                </Card>

                <Card className="border-[#e8ddd0]">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm text-[#5c3d2e]">Reference Apparatus</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <FeatureToggle id="cross-refs" label="Cross-References" description="Footnote-style verse cross-references at bottom of page" checked={config.crossReferences} onCheckedChange={v => set("crossReferences", v)} />
                    <FeatureToggle id="center-col-refs" label="Center Column References" description="Cross-references in a narrow center column between text columns" checked={config.centerColumnReferences} onCheckedChange={v => set("centerColumnReferences", v)} />
                    <FeatureToggle id="footnotes" label="Textual Footnotes" description="Manuscript variant notes and translation footnotes" checked={config.footnotes} onCheckedChange={v => set("footnotes", v)} />
                    <FeatureToggle id="concordance" label="Concordance" description="Alphabetical word index with verse references" checked={config.concordance} onCheckedChange={v => set("concordance", v)} />
                    <FeatureToggle id="maps" label="Maps & Charts" description="Full-color or black-and-white Bible maps and charts" checked={config.maps} onCheckedChange={v => set("maps", v)} />
                  </CardContent>
                </Card>

                <Card className="border-[#e8ddd0]">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm text-[#5c3d2e]">Supplementary Content</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <FeatureToggle id="book-intros" label="Book Introductions" description="Brief introduction before each book of the Bible" checked={config.bookIntroductions} onCheckedChange={v => set("bookIntroductions", v)} />
                    <FeatureToggle id="reading-plan" label="Reading Plan" description="One-year or 90-day Bible reading schedule" checked={config.readingPlan} onCheckedChange={v => set("readingPlan", v)} />
                  </CardContent>
                </Card>

                <Card className="border-[#e8ddd0]">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm text-[#5c3d2e]">Physical Finishing</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <FeatureToggle id="ribbon" label="Ribbon Marker" description="Sewn-in ribbon page marker (one or two ribbons)" checked={config.ribbonMarker} onCheckedChange={v => set("ribbonMarker", v)} />
                    <FeatureToggle id="thumb-index" label="Thumb Index" description="Die-cut thumb tabs for quick navigation to each book" checked={config.thumbIndex} onCheckedChange={v => set("thumbIndex", v)} premium />
                    <FeatureToggle id="gilded" label="Gilded Edges" description="Gold, silver, or red gilded page edges" checked={config.gildedEdges} onCheckedChange={v => set("gildedEdges", v)} premium />
                    <FeatureToggle id="flexible" label="Flexible / Limp Cover" description="Soft, flexible cover that wraps around the text block" checked={config.flexibleCover} onCheckedChange={v => set("flexibleCover", v)} />
                  </CardContent>
                </Card>
              </div>
            </section>

          </div>

          {/* Right: Sticky spec summary + pairings + AI assistant */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <SpecSummary config={config} />
              <RecommendedPairings onApply={(bodyId, headingId, verseId) => {
                setConfig(prev => ({
                  ...prev,
                  bodyTypefaceId: bodyId,
                  headingTypefaceId: headingId,
                  verseNumberTypefaceId: verseId,
                }));
              }} />
              <AIWritingAssistant />
            </div>
          </div>

        </div>
      </div>

      {/* Related Tools footer backlinks */}
      <div className="border-t border-[#e8dfd0] bg-[#faf6ef] px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-[#8b7b6b] mb-3 font-semibold uppercase tracking-wide">Other Self-Publishing Tools</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/spine-calculator", label: "Spine Calculator" },
              { href: "/cover-designer", label: "Cover Designer" },
              { href: "/isbn-manager", label: "ISBN & Metadata" },
              { href: "/timeline", label: "Production Timeline" },
              { href: "/auto-produce", label: "Auto-Produce" },
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedTools currentPage="bible-studio" />
      </div>
      <SiteFooter />
    </div>
  );
}
