/**
 * Spine Width Calculator & Binding Specification Tool
 * A comprehensive tool for Bible publishers to calculate exact spine widths
 * and generate complete binding specifications for any Bible edition.
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Ruler, BookOpen, Printer, Download, Copy, Check,
  Info, AlertTriangle, ChevronRight,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// ─── Paper types with PPI (pages per inch) ────────────────────────────────────
const PAPER_TYPES = [
  { id: "india-24lb", name: "India Paper — 24 lb (ultra-thin)", ppi: 1040, description: "Traditional Bible paper, extremely thin and lightweight. Used in most compact and standard Bibles." },
  { id: "india-28lb", name: "India Paper — 28 lb (standard thin)", ppi: 900, description: "Slightly heavier India paper. Good balance of thinness and durability." },
  { id: "bible-30lb", name: "Bible Paper — 30 lb (medium thin)", ppi: 800, description: "Medium-weight Bible paper. Common in study Bibles and reference editions." },
  { id: "bible-35lb", name: "Bible Paper — 35 lb (semi-opaque)", ppi: 680, description: "Heavier Bible paper with excellent opacity. Preferred for large-print editions." },
  { id: "offset-40lb", name: "Offset — 40 lb (lightweight)", ppi: 560, description: "Standard lightweight offset. Used in pew Bibles and budget editions." },
  { id: "offset-50lb", name: "Offset — 50 lb (standard)", ppi: 440, description: "Standard offset paper. Common for children's Bibles and illustrated editions." },
  { id: "offset-60lb", name: "Offset — 60 lb (medium)", ppi: 380, description: "Medium-weight offset. Used in hardcover and case-bound editions." },
  { id: "coated-80lb", name: "Coated — 80 lb (art/gloss)", ppi: 280, description: "Coated art paper. Used for illustrated Bibles with full-color photography." },
  { id: "custom", name: "Custom PPI (enter manually)", ppi: 0, description: "Enter a custom PPI value for specialty papers." },
];

// ─── Binding methods ───────────────────────────────────────────────────────────
const BINDING_METHODS = [
  { id: "smyth-sewn", name: "Smyth-Sewn (thread-sewn)", boardThickness: 0.098, description: "The gold standard for Bible binding. Signatures are sewn together with thread, then glued to a case. Opens flat and lasts generations." },
  { id: "smyth-sewn-limp", name: "Smyth-Sewn Limp Leather", boardThickness: 0.030, description: "Sewn signatures in a flexible leather cover without boards. Lightweight and flexible." },
  { id: "case-bound", name: "Case-Bound (hardcover)", boardThickness: 0.098, description: "Rigid hardcover with binder's boards. Standard for pulpit and presentation Bibles." },
  { id: "perfect-bound", name: "Perfect Bound (adhesive)", boardThickness: 0.0, description: "Pages glued at the spine. Less durable than sewn binding but lower cost." },
  { id: "wire-o", name: "Wire-O / Coil Bound", boardThickness: 0.0, description: "Metal coil binding. Used for journaling Bibles and workbooks." },
  { id: "coptic", name: "Coptic Stitch", boardThickness: 0.040, description: "Exposed spine binding that opens completely flat. Used for journaling and specialty editions." },
  { id: "quarter-bound", name: "Quarter-Bound (leather spine)", boardThickness: 0.098, description: "Leather spine with cloth or paper sides. Traditional presentation Bible style." },
];

// ─── Cover materials ───────────────────────────────────────────────────────────
const COVER_MATERIALS = [
  { id: "genuine-leather", name: "Genuine Leather (calfskin)", thickness: 0.040, description: "Traditional calfskin leather. The premium choice for presentation and pulpit Bibles." },
  { id: "bonded-leather", name: "Bonded Leather", thickness: 0.032, description: "Leather fibers bonded to a backing. More affordable than genuine leather." },
  { id: "imitation-leather", name: "Imitation Leather (leatherette)", thickness: 0.028, description: "PU or vinyl material with leather texture. Durable and water-resistant." },
  { id: "cloth", name: "Cloth (buckram / linen)", thickness: 0.020, description: "Woven fabric cover. Traditional for hardcover and pulpit Bibles." },
  { id: "paper-over-boards", name: "Paper Over Boards", thickness: 0.012, description: "Printed paper laminated to binder's boards. Used for children's and illustrated Bibles." },
  { id: "soft-touch", name: "Soft-Touch Laminate", thickness: 0.016, description: "Matte soft-touch laminated cover. Modern feel for contemporary editions." },
  { id: "custom", name: "Custom (enter thickness)", thickness: 0.0, description: "Enter a custom cover material thickness." },
];

// ─── Trim sizes ────────────────────────────────────────────────────────────────
const TRIM_SIZES = [
  { id: "3.5x5.5", name: "3.5\" × 5.5\" — Micro / Pocket", w: 3.5, h: 5.5 },
  { id: "4x6", name: "4\" × 6\" — Compact", w: 4, h: 6 },
  { id: "4.75x7.25", name: "4.75\" × 7.25\" — Standard Compact", w: 4.75, h: 7.25 },
  { id: "5.25x8", name: "5.25\" × 8\" — Standard Bible", w: 5.25, h: 8 },
  { id: "5.5x8.5", name: "5.5\" × 8.5\" — Large Compact", w: 5.5, h: 8.5 },
  { id: "6x9", name: "6\" × 9\" — Trade / Study", w: 6, h: 9 },
  { id: "6.5x9.25", name: "6.5\" × 9.25\" — Wide-Margin Study", w: 6.5, h: 9.25 },
  { id: "7x10", name: "7\" × 10\" — Large Print", w: 7, h: 10 },
  { id: "7.5x10.25", name: "7.5\" × 10.25\" — Large Print Plus", w: 7.5, h: 10.25 },
  { id: "8x10", name: "8\" × 10\" — Pulpit / Lectern", w: 8, h: 10 },
  { id: "8.5x11", name: "8.5\" × 11\" — Oversized Pulpit", w: 8.5, h: 11 },
  { id: "custom", name: "Custom size", w: 0, h: 0 },
];

// ─── Ribbon colors ─────────────────────────────────────────────────────────────
const RIBBON_COLORS = [
  "Gold", "Silver", "Red", "Burgundy", "Royal Blue", "Navy", "Forest Green",
  "Purple", "Black", "White", "Ivory", "Brown", "Tan", "Teal", "Custom",
];

// ─── Gilding options ───────────────────────────────────────────────────────────
const GILDING_OPTIONS = [
  { id: "none", name: "None" },
  { id: "gold-gilt", name: "Gold Gilt (full gold)" },
  { id: "silver-gilt", name: "Silver Gilt" },
  { id: "red-gilt", name: "Red Gilt" },
  { id: "gold-red-letter", name: "Gold Gilt with Red Letter Edges" },
  { id: "marbled", name: "Marbled Edges" },
  { id: "stained", name: "Stained Edges (color)" },
  { id: "custom", name: "Custom" },
];

// ─── Headband colors ───────────────────────────────────────────────────────────
const HEADBAND_COLORS = [
  "Gold/White", "Red/White", "Blue/White", "Black/White", "Gold/Red",
  "Purple/Gold", "Navy/Gold", "Green/Gold", "Custom",
];

// ─── Spine calculation ─────────────────────────────────────────────────────────
function calcSpine(
  pageCount: number,
  ppi: number,
  boardThickness: number,
  coverThickness: number,
  bindingMethod: string
): { spineIn: number; spineMm: number; coverWidthIn: number; coverWidthMm: number } {
  if (!pageCount || !ppi) return { spineIn: 0, spineMm: 0, coverWidthIn: 0, coverWidthMm: 0 };

  // Text block thickness = page count / PPI
  const textBlock = pageCount / ppi;

  // For perfect bound, add ~0.06" for adhesive
  const adhesiveAdd = bindingMethod === "perfect-bound" ? 0.06 : 0;

  // Total spine = text block + 2× board thickness + 2× cover material + adhesive
  const spineIn = textBlock + (2 * boardThickness) + (2 * coverThickness) + adhesiveAdd;
  const spineMm = spineIn * 25.4;

  // Cover width = trim width + spine + trim width + 2× board wrap (0.125" each side)
  // This is returned separately so the caller can add trim width
  return {
    spineIn: Math.round(spineIn * 1000) / 1000,
    spineMm: Math.round(spineMm * 10) / 10,
    coverWidthIn: 0, // caller adds trim width
    coverWidthMm: 0,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SpineCalculator() {
  const [, navigate] = useLocation();

  // Inputs
  const [pageCount, setPageCount] = useState<string>("1200");
  const [paperTypeId, setPaperTypeId] = useState("india-24lb");
  const [customPpi, setCustomPpi] = useState<string>("1040");
  const [bindingMethodId, setBindingMethodId] = useState("smyth-sewn");
  const [coverMaterialId, setCoverMaterialId] = useState("genuine-leather");
  const [customCoverThickness, setCustomCoverThickness] = useState<string>("0.040");
  const [trimSizeId, setTrimSizeId] = useState("5.25x8");
  const [customW, setCustomW] = useState<string>("5.25");
  const [customH, setCustomH] = useState<string>("8");

  // Binding spec options
  const [ribbonCount, setRibbonCount] = useState<string>("2");
  const [ribbonColor, setRibbonColor] = useState("Gold");
  const [gildingId, setGildingId] = useState("gold-gilt");
  const [headbandColor, setHeadbandColor] = useState("Gold/White");
  const [thumbIndex, setThumbIndex] = useState(false);
  const [redLetter, setRedLetter] = useState(false);
  const [copyrightPage, setCopyrightPage] = useState(true);
  const [concordance, setConcordance] = useState(false);
  const [maps, setMaps] = useState(false);
  const [crossRefs, setCrossRefs] = useState(false);
  const [footnotes, setFootnotes] = useState(false);
  const [sectionHeadings, setSectionHeadings] = useState(true);
  const [copied, setCopied] = useState(false);

  // Derived values
  const paper = PAPER_TYPES.find(p => p.id === paperTypeId)!;
  const binding = BINDING_METHODS.find(b => b.id === bindingMethodId)!;
  const coverMaterial = COVER_MATERIALS.find(c => c.id === coverMaterialId)!;
  const trimSize = TRIM_SIZES.find(t => t.id === trimSizeId)!;

  const ppi = paperTypeId === "custom" ? Number(customPpi) || 0 : paper.ppi;
  const coverThickness = coverMaterialId === "custom" ? Number(customCoverThickness) || 0 : coverMaterial.thickness;
  const trimW = trimSizeId === "custom" ? Number(customW) || 0 : trimSize.w;
  const trimH = trimSizeId === "custom" ? Number(customH) || 0 : trimSize.h;
  const pages = Number(pageCount) || 0;

  const spine = useMemo(() => calcSpine(pages, ppi, binding.boardThickness, coverThickness, bindingMethodId), [pages, ppi, binding.boardThickness, coverThickness, bindingMethodId]);

  const coverW = trimW > 0 ? Math.round((trimW * 2 + spine.spineIn + 0.25) * 1000) / 1000 : 0;
  const coverWmm = Math.round(coverW * 25.4 * 10) / 10;
  const coverHin = trimH > 0 ? Math.round((trimH + 0.25) * 1000) / 1000 : 0;
  const coverHmm = Math.round(coverHin * 25.4 * 10) / 10;

  const textBlockIn = pages > 0 && ppi > 0 ? Math.round((pages / ppi) * 1000) / 1000 : 0;
  const textBlockMm = Math.round(textBlockIn * 25.4 * 10) / 10;

  // Warnings
  const warnings: string[] = [];
  if (pages > 0 && ppi > 0) {
    if (spine.spineIn < 0.25) warnings.push("Spine is very narrow (< ¼\"). Consider a larger font size or more pages.");
    if (spine.spineIn > 3.0) warnings.push("Spine exceeds 3\". This is an unusually thick Bible — verify page count and paper selection.");
    if (bindingMethodId === "perfect-bound" && pages > 800) warnings.push("Perfect binding is not recommended for Bibles over 800 pages. Consider Smyth-sewn binding.");
  }

  // Spec sheet text
  const specSheet = useMemo(() => {
    if (!pages || !ppi) return "";
    const lines = [
      "═══════════════════════════════════════════════",
      "       BIBLE BINDING SPECIFICATION SHEET",
      "═══════════════════════════════════════════════",
      "",
      `TRIM SIZE:          ${trimSizeId === "custom" ? `${trimW}" × ${trimH}"` : trimSize.name}`,
      `PAGE COUNT:         ${pages.toLocaleString()} pp`,
      `PAPER:              ${paper.name}`,
      `PAPER PPI:          ${ppi} pages/inch`,
      "",
      "─── TEXT BLOCK ───────────────────────────────",
      `Text Block Thickness:   ${textBlockIn}" (${textBlockMm} mm)`,
      "",
      "─── BINDING ──────────────────────────────────",
      `Binding Method:         ${binding.name}`,
      `Board Thickness:        ${binding.boardThickness > 0 ? `${binding.boardThickness}" (${Math.round(binding.boardThickness * 25.4 * 10) / 10} mm)` : "N/A (no boards)"}`,
      `Cover Material:         ${coverMaterial.name}`,
      `Cover Thickness:        ${coverThickness}" (${Math.round(coverThickness * 25.4 * 10) / 10} mm)`,
      "",
      "─── SPINE ────────────────────────────────────",
      `SPINE WIDTH:            ${spine.spineIn}" (${spine.spineMm} mm)`,
      "",
      "─── COVER DIMENSIONS ─────────────────────────",
      `Cover Width (full wrap): ${coverW}" (${coverWmm} mm)`,
      `Cover Height:            ${coverHin}" (${coverHmm} mm)`,
      `  (includes 0.125" bleed each side)`,
      "",
      "─── FINISHING ────────────────────────────────",
      `Ribbon Markers:         ${ribbonCount} × ${ribbonColor}`,
      `Gilding:                ${GILDING_OPTIONS.find(g => g.id === gildingId)?.name}`,
      `Headband / Tailband:    ${headbandColor}`,
      `Thumb Index:            ${thumbIndex ? "Yes" : "No"}`,
      "",
      "─── INTERIOR FEATURES ────────────────────────",
      `Red-Letter Edition:     ${redLetter ? "Yes" : "No"}`,
      `Section Headings:       ${sectionHeadings ? "Yes" : "No"}`,
      `Cross-References:       ${crossRefs ? "Yes" : "No"}`,
      `Footnotes:              ${footnotes ? "Yes" : "No"}`,
      `Concordance:            ${concordance ? "Yes" : "No"}`,
      `Maps / Charts:          ${maps ? "Yes" : "No"}`,
      `Copyright Page:         ${copyrightPage ? "Yes" : "No"}`,
      "",
      "═══════════════════════════════════════════════",
      `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      "═══════════════════════════════════════════════",
    ];
    return lines.join("\n");
  }, [pages, ppi, trimSizeId, trimW, trimH, trimSize, paper, textBlockIn, textBlockMm, binding, coverMaterial, coverThickness, spine, coverW, coverWmm, coverHin, coverHmm, ribbonCount, ribbonColor, gildingId, headbandColor, thumbIndex, redLetter, sectionHeadings, crossRefs, footnotes, concordance, maps, copyrightPage]);

  function handleCopy() {
    navigator.clipboard.writeText(specSheet).then(() => {
      setCopied(true);
      toast.success("Specification sheet copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#faf6ef]/95 backdrop-blur border-b border-[#e8dfd0] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-[#5c3d2e] hover:bg-[#f0e8d8]">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#c9a96e]/20 flex items-center justify-center">
              <Ruler size={18} className="text-[#8b5e3c]" />
            </div>
            <div>
              <h1 className="font-serif text-xl text-[#3a2a1a] leading-tight">Spine Width Calculator</h1>
              <p className="text-xs text-[#8b7b6b]">Bible binding specification tool</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left column: inputs ── */}
        <div className="space-y-6">

          {/* Trim Size */}
          <Card className="border-[#e8dfd0] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg text-[#3a2a1a] flex items-center gap-2">
                <BookOpen size={18} className="text-[#c9a96e]" /> Trim Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={trimSizeId} onValueChange={setTrimSizeId}>
                <SelectTrigger className="border-[#d4c8b4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIM_SIZES.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {trimSizeId === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#5c3d2e]">Width (inches)</Label>
                    <Input value={customW} onChange={e => setCustomW(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="5.25" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#5c3d2e]">Height (inches)</Label>
                    <Input value={customH} onChange={e => setCustomH(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="8" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Page Count & Paper */}
          <Card className="border-[#e8dfd0] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg text-[#3a2a1a] flex items-center gap-2">
                <Printer size={18} className="text-[#c9a96e]" /> Paper & Page Count
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[#5c3d2e] font-semibold">Total Page Count</Label>
                <Input
                  value={pageCount}
                  onChange={e => setPageCount(e.target.value)}
                  className="mt-1 border-[#d4c8b4]"
                  placeholder="e.g., 1200"
                  type="number"
                  min={2}
                />
                <p className="text-xs text-[#8b7b6b] mt-1">Must be an even number. A standard complete Bible is typically 1,100–1,600 pages.</p>
              </div>
              <div>
                <Label className="text-[#5c3d2e] font-semibold">Paper Type</Label>
                <Select value={paperTypeId} onValueChange={setPaperTypeId}>
                  <SelectTrigger className="mt-1 border-[#d4c8b4]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAPER_TYPES.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#8b7b6b] mt-1">{paper.description}</p>
              </div>
              {paperTypeId === "custom" && (
                <div>
                  <Label className="text-xs text-[#5c3d2e]">Custom PPI (pages per inch)</Label>
                  <Input value={customPpi} onChange={e => setCustomPpi(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="e.g., 900" type="number" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Binding Method */}
          <Card className="border-[#e8dfd0] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg text-[#3a2a1a]">Binding Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={bindingMethodId} onValueChange={setBindingMethodId}>
                <SelectTrigger className="border-[#d4c8b4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BINDING_METHODS.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#8b7b6b]">{binding.description}</p>
            </CardContent>
          </Card>

          {/* Cover Material */}
          <Card className="border-[#e8dfd0] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg text-[#3a2a1a]">Cover Material</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={coverMaterialId} onValueChange={setCoverMaterialId}>
                <SelectTrigger className="border-[#d4c8b4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COVER_MATERIALS.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#8b7b6b]">{coverMaterial.description}</p>
              {coverMaterialId === "custom" && (
                <div>
                  <Label className="text-xs text-[#5c3d2e]">Cover Thickness (inches)</Label>
                  <Input value={customCoverThickness} onChange={e => setCustomCoverThickness(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="e.g., 0.040" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Finishing */}
          <Card className="border-[#e8dfd0] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg text-[#3a2a1a]">Finishing & Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Ribbon Markers</Label>
                  <Select value={ribbonCount} onValueChange={setRibbonCount}>
                    <SelectTrigger className="mt-1 border-[#d4c8b4]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["0","1","2","3","4","5","6"].map(n => <SelectItem key={n} value={n}>{n === "0" ? "None" : `${n} ribbon${n !== "1" ? "s" : ""}`}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Ribbon Color</Label>
                  <Select value={ribbonColor} onValueChange={setRibbonColor}>
                    <SelectTrigger className="mt-1 border-[#d4c8b4]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RIBBON_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Gilding</Label>
                  <Select value={gildingId} onValueChange={setGildingId}>
                    <SelectTrigger className="mt-1 border-[#d4c8b4]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GILDING_OPTIONS.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Headband / Tailband</Label>
                  <Select value={headbandColor} onValueChange={setHeadbandColor}>
                    <SelectTrigger className="mt-1 border-[#d4c8b4]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEADBAND_COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  { label: "Thumb Index", value: thumbIndex, set: setThumbIndex },
                  { label: "Red-Letter Edition", value: redLetter, set: setRedLetter },
                  { label: "Section Headings", value: sectionHeadings, set: setSectionHeadings },
                  { label: "Cross-References", value: crossRefs, set: setCrossRefs },
                  { label: "Footnotes", value: footnotes, set: setFootnotes },
                  { label: "Concordance", value: concordance, set: setConcordance },
                  { label: "Maps / Charts", value: maps, set: setMaps },
                  { label: "Copyright Page", value: copyrightPage, set: setCopyrightPage },
                ].map(({ label, value, set }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => set(!value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      value
                        ? "border-[#c9a96e] bg-[#fdf5e4] text-[#8b5e3c]"
                        : "border-[#e8dfd0] bg-white text-[#8b7b6b] hover:bg-[#f5f0e8]"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${value ? "bg-[#c9a96e] border-[#c9a96e]" : "border-[#d4c8b4]"}`}>
                      {value && <Check size={10} className="text-white" />}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right column: results ── */}
        <div className="space-y-6">
          {/* Spine result */}
          <Card className="border-[#c9a96e]/40 bg-gradient-to-br from-[#fdf5e4] to-[#faf6ef]">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-xl text-[#3a2a1a]">Calculated Spine Width</CardTitle>
            </CardHeader>
            <CardContent>
              {pages > 0 && ppi > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-5xl font-bold text-[#8b5e3c] font-mono">{spine.spineIn}"</p>
                      <p className="text-lg text-[#a89880] font-mono">{spine.spineMm} mm</p>
                    </div>
                    <div className="pb-2">
                      <Badge className="bg-[#c9a96e]/20 text-[#8b5e3c] border-[#c9a96e]/30">
                        {spine.spineIn < 0.5 ? "Slim" : spine.spineIn < 1.5 ? "Standard" : spine.spineIn < 2.5 ? "Thick" : "Extra Thick"}
                      </Badge>
                    </div>
                  </div>

                  {warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-700">{w}</p>
                    </div>
                  ))}

                  <Separator className="bg-[#e8dfd0]" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#8b7b6b]">Text block</span>
                      <span className="font-mono text-[#3a2a1a]">{textBlockIn}" ({textBlockMm} mm)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8b7b6b]">Board thickness (×2)</span>
                      <span className="font-mono text-[#3a2a1a]">{(binding.boardThickness * 2).toFixed(3)}" ({Math.round(binding.boardThickness * 2 * 25.4 * 10) / 10} mm)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8b7b6b]">Cover material (×2)</span>
                      <span className="font-mono text-[#3a2a1a]">{(coverThickness * 2).toFixed(3)}" ({Math.round(coverThickness * 2 * 25.4 * 10) / 10} mm)</span>
                    </div>
                    {bindingMethodId === "perfect-bound" && (
                      <div className="flex justify-between">
                        <span className="text-[#8b7b6b]">Adhesive allowance</span>
                        <span className="font-mono text-[#3a2a1a]">0.060" (1.5 mm)</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[#8b7b6b] text-sm">Enter page count and select paper type to calculate.</p>
              )}
            </CardContent>
          </Card>

          {/* Cover dimensions */}
          {trimW > 0 && spine.spineIn > 0 && (
            <Card className="border-[#e8dfd0] bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#3a2a1a]">Full Cover Dimensions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-[#f5f0e8] text-center">
                    <p className="text-xs text-[#8b7b6b] mb-1">Cover Width (full wrap)</p>
                    <p className="font-mono font-bold text-[#3a2a1a] text-lg">{coverW}"</p>
                    <p className="font-mono text-[#8b7b6b] text-xs">{coverWmm} mm</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#f5f0e8] text-center">
                    <p className="text-xs text-[#8b7b6b] mb-1">Cover Height</p>
                    <p className="font-mono font-bold text-[#3a2a1a] text-lg">{coverHin}"</p>
                    <p className="font-mono text-[#8b7b6b] text-xs">{coverHmm} mm</p>
                  </div>
                </div>
                <p className="text-xs text-[#8b7b6b]">Includes 0.125" bleed on all sides. Spine starts at {trimW + 0.125}" from the left edge of the cover file.</p>

                {/* Visual spine diagram */}
                <div className="mt-4 border border-[#e8dfd0] rounded-lg overflow-hidden">
                  <div className="flex h-16 text-[10px] font-mono">
                    <div className="flex-1 bg-[#f0e8d8] flex items-center justify-center text-[#8b7b6b] border-r border-[#e8dfd0]">
                      Back Cover<br />{trimW}"
                    </div>
                    <div
                      className="bg-[#c9a96e] flex items-center justify-center text-white font-bold text-center leading-tight"
                      style={{ width: `${Math.max(spine.spineIn / coverW * 100, 8)}%`, minWidth: "40px" }}
                    >
                      Spine<br />{spine.spineIn}"
                    </div>
                    <div className="flex-1 bg-[#f0e8d8] flex items-center justify-center text-[#8b7b6b] border-l border-[#e8dfd0]">
                      Front Cover<br />{trimW}"
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Spec sheet */}
          {pages > 0 && ppi > 0 && (
            <Card className="border-[#e8dfd0] bg-white">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="font-serif text-lg text-[#3a2a1a]">Specification Sheet</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border-[#d4c8b4] text-[#5c3d2e] hover:bg-[#f0e8d8]"
                >
                  {copied ? <Check size={14} className="mr-2 text-green-600" /> : <Copy size={14} className="mr-2" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="text-[10px] font-mono text-[#5c3d2e] bg-[#faf6ef] rounded-lg p-4 overflow-x-auto whitespace-pre leading-relaxed border border-[#e8dfd0]">
                  {specSheet}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
