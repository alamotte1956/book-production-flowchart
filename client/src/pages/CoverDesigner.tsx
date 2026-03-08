/**
 * Cover Designer — Full-Wrap Cover Specification Generator
 * Calculates exact cover dimensions for front, back, and spine
 * with bleed, safe zone, and print-ready file specifications.
 */
import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Layers, Printer, Copy, Check, Info, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// ─── Trim sizes ────────────────────────────────────────────────────────────────
const TRIM_SIZES = [
  { id: "4.25x6.875", name: "4.25\" × 6.875\" — Mass Market Paperback", w: 4.25, h: 6.875 },
  { id: "5x8", name: "5\" × 8\" — Digest", w: 5, h: 8 },
  { id: "5.25x8", name: "5.25\" × 8\" — Bible Standard", w: 5.25, h: 8 },
  { id: "5.5x8.5", name: "5.5\" × 8.5\" — Trade Paperback", w: 5.5, h: 8.5 },
  { id: "6x9", name: "6\" × 9\" — Standard Trade", w: 6, h: 9 },
  { id: "6.5x9.25", name: "6.5\" × 9.25\" — Wide Margin Study", w: 6.5, h: 9.25 },
  { id: "7x10", name: "7\" × 10\" — Textbook / Large Print", w: 7, h: 10 },
  { id: "7.5x9.25", name: "7.5\" × 9.25\" — Children's", w: 7.5, h: 9.25 },
  { id: "8x10", name: "8\" × 10\" — Large Format", w: 8, h: 10 },
  { id: "8.5x11", name: "8.5\" × 11\" — Letter / Workbook", w: 8.5, h: 11 },
  { id: "custom", name: "Custom size", w: 0, h: 0 },
];

// ─── Paper types with PPI ──────────────────────────────────────────────────────
const PAPER_TYPES = [
  { id: "india-24", name: "India Paper 24 lb", ppi: 1040 },
  { id: "india-28", name: "India Paper 28 lb", ppi: 900 },
  { id: "bible-30", name: "Bible Paper 30 lb", ppi: 800 },
  { id: "offset-50", name: "Offset 50 lb (standard)", ppi: 440 },
  { id: "offset-60", name: "Offset 60 lb (medium)", ppi: 380 },
  { id: "coated-80", name: "Coated 80 lb (gloss)", ppi: 280 },
  { id: "custom", name: "Custom PPI", ppi: 0 },
];

// ─── Binding types ─────────────────────────────────────────────────────────────
const BINDING_TYPES = [
  { id: "perfect", name: "Perfect Bound (adhesive)", boardThickness: 0.0 },
  { id: "case-bound", name: "Case Bound (hardcover)", boardThickness: 0.098 },
  { id: "smyth-sewn", name: "Smyth-Sewn Hardcover", boardThickness: 0.098 },
  { id: "smyth-limp", name: "Smyth-Sewn Limp", boardThickness: 0.030 },
  { id: "wire-o", name: "Wire-O / Coil Bound", boardThickness: 0.0 },
  { id: "saddle-stitch", name: "Saddle Stitch (stapled)", boardThickness: 0.0 },
];

// ─── Color modes ───────────────────────────────────────────────────────────────
const COLOR_MODES = [
  { id: "cmyk-4color", name: "CMYK 4-Color Process", desc: "Full color — standard for most covers" },
  { id: "cmyk-spot", name: "CMYK + Spot (Pantone)", desc: "4-color + 1 or 2 Pantone spot colors" },
  { id: "2color", name: "2-Color (Duotone)", desc: "Two Pantone colors — economical and striking" },
  { id: "1color", name: "1-Color (Monotone)", desc: "Single Pantone color — minimal, elegant" },
];

// ─── Laminate finishes ─────────────────────────────────────────────────────────
const LAMINATES = [
  { id: "gloss", name: "Gloss Laminate", desc: "High-shine finish — vibrant colors, durable" },
  { id: "matte", name: "Matte Laminate", desc: "Flat, non-reflective — sophisticated look" },
  { id: "soft-touch", name: "Soft-Touch Matte", desc: "Velvety texture — premium feel" },
  { id: "satin", name: "Satin / Silk Laminate", desc: "Between gloss and matte" },
  { id: "none", name: "None (uncoated)", desc: "No laminate — for specialty substrates" },
];

// ─── Special finishes ──────────────────────────────────────────────────────────
const SPECIAL_FINISHES = [
  "Spot UV Gloss",
  "Foil Stamping (Gold)",
  "Foil Stamping (Silver)",
  "Foil Stamping (Custom Color)",
  "Embossing",
  "Debossing",
  "Die-Cut",
  "Raised Spot UV",
  "Holographic Foil",
];

// ─── Bleed standard ───────────────────────────────────────────────────────────
const BLEED = 0.125; // 1/8 inch standard bleed
const SAFE_ZONE = 0.125; // 1/8 inch safe zone from trim edge

export default function CoverDesigner() {
  const [, navigate] = useLocation();

  // Trim size
  const [trimSizeId, setTrimSizeId] = useState("6x9");
  const [customW, setCustomW] = useState("6");
  const [customH, setCustomH] = useState("9");

  // Paper & binding
  const [paperTypeId, setPaperTypeId] = useState("offset-50");
  const [customPpi, setCustomPpi] = useState("440");
  const [bindingTypeId, setBindingTypeId] = useState("perfect");
  const [pageCount, setPageCount] = useState("320");

  // Cover specs
  const [colorModeId, setColorModeId] = useState("cmyk-4color");
  const [laminateId, setLaminateId] = useState("gloss");
  const [selectedFinishes, setSelectedFinishes] = useState<string[]>([]);
  const [barcode, setBarcode] = useState(true);
  const [authorPhoto, setAuthorPhoto] = useState(false);

  // Derived
  const trimSize = TRIM_SIZES.find(t => t.id === trimSizeId)!;
  const paper = PAPER_TYPES.find(p => p.id === paperTypeId)!;
  const binding = BINDING_TYPES.find(b => b.id === bindingTypeId)!;
  const colorMode = COLOR_MODES.find(c => c.id === colorModeId)!;
  const laminate = LAMINATES.find(l => l.id === laminateId)!;

  const trimW = trimSizeId === "custom" ? Number(customW) || 0 : trimSize.w;
  const trimH = trimSizeId === "custom" ? Number(customH) || 0 : trimSize.h;
  const ppi = paperTypeId === "custom" ? Number(customPpi) || 0 : paper.ppi;
  const pages = Number(pageCount) || 0;

  const specs = useMemo(() => {
    if (!trimW || !trimH) return null;

    // Spine calculation
    const textBlock = pages > 0 && ppi > 0 ? pages / ppi : 0;
    const adhesiveAdd = bindingTypeId === "perfect" ? 0.06 : 0;
    const spineIn = textBlock + (2 * binding.boardThickness) + adhesiveAdd;
    const spineMm = spineIn * 25.4;

    // Full wrap dimensions (with bleed)
    const fullWrapW = (trimW * 2) + spineIn + (BLEED * 2);
    const fullWrapH = trimH + (BLEED * 2);

    // Safe zone (content must stay inside)
    const safeW = trimW - (SAFE_ZONE * 2);
    const safeH = trimH - (SAFE_ZONE * 2);

    // Barcode area (back cover, bottom right)
    const barcodeW = 2.0; // standard ISBN barcode width
    const barcodeH = 1.2; // standard ISBN barcode height

    return {
      spineIn: Math.round(spineIn * 1000) / 1000,
      spineMm: Math.round(spineMm * 10) / 10,
      fullWrapW: Math.round(fullWrapW * 1000) / 1000,
      fullWrapH: Math.round(fullWrapH * 1000) / 1000,
      fullWrapWmm: Math.round(fullWrapW * 25.4 * 10) / 10,
      fullWrapHmm: Math.round(fullWrapH * 25.4 * 10) / 10,
      safeW: Math.round(safeW * 1000) / 1000,
      safeH: Math.round(safeH * 1000) / 1000,
      barcodeW,
      barcodeH,
      textBlock: Math.round(textBlock * 1000) / 1000,
    };
  }, [trimW, trimH, pages, ppi, binding.boardThickness, bindingTypeId]);

  const [copied, setCopied] = useState(false);

  const specText = specs ? [
    "══════════════════════════════════════════════════",
    "         COVER DESIGN SPECIFICATION SHEET",
    "══════════════════════════════════════════════════",
    "",
    `TRIM SIZE:           ${trimSizeId === "custom" ? `${trimW}" × ${trimH}"` : trimSize.name}`,
    `BINDING:             ${binding.name}`,
    `PAGE COUNT:          ${pages.toLocaleString()} pp`,
    `PAPER:               ${paper.name} (${ppi} PPI)`,
    "",
    "── SPINE ──────────────────────────────────────────",
    `Text Block:          ${specs.textBlock}" (${Math.round(specs.textBlock * 25.4 * 10) / 10}mm)`,
    `Spine Width:         ${specs.spineIn}" (${specs.spineMm}mm)`,
    "",
    "── FULL WRAP DIMENSIONS (with bleed) ──────────────",
    `Width:               ${specs.fullWrapW}" (${specs.fullWrapWmm}mm)`,
    `Height:              ${specs.fullWrapH}" (${specs.fullWrapHmm}mm)`,
    "",
    "── INDIVIDUAL PANEL DIMENSIONS ────────────────────",
    `Front Cover:         ${trimW}" × ${trimH}" (trim)`,
    `Back Cover:          ${trimW}" × ${trimH}" (trim)`,
    `Spine:               ${specs.spineIn}" × ${trimH}" (trim)`,
    "",
    "── BLEED & SAFE ZONE ──────────────────────────────",
    `Bleed:               ${BLEED}" (${Math.round(BLEED * 25.4 * 10) / 10}mm) on all sides`,
    `Safe Zone:           ${SAFE_ZONE}" (${Math.round(SAFE_ZONE * 25.4 * 10) / 10}mm) inside trim edge`,
    `Safe Content Area:   ${specs.safeW}" × ${specs.safeH}" per panel`,
    "",
    "── PRINT SPECIFICATIONS ────────────────────────────",
    `Color Mode:          ${colorMode.name}`,
    `Laminate:            ${laminate.name}`,
    ...(selectedFinishes.length > 0 ? [`Special Finishes:    ${selectedFinishes.join(", ")}`] : []),
    `Resolution:          300 DPI minimum (600 DPI preferred)`,
    `PDF Standard:        PDF/X-1a or PDF/X-4`,
    `Font Embedding:      All fonts must be embedded`,
    `Black Text:          Rich black = K100 only (not 4-color black)`,
    ...(barcode ? [`Barcode Area:        2.0" × 1.2" — bottom-right of back cover`] : []),
    "",
    "══════════════════════════════════════════════════",
  ].join("\n") : "";

  const handleCopy = () => {
    if (!specText) return;
    navigator.clipboard.writeText(specText);
    setCopied(true);
    toast.success("Spec sheet copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleFinish = (finish: string) => {
    setSelectedFinishes(prev =>
      prev.includes(finish) ? prev.filter(f => f !== finish) : [...prev, finish]
    );
  };

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <header className="bg-[#2a1a0a] text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-lg">
        <button
          onClick={() => navigate("/")}
          className="text-[#c9a96e] hover:text-white transition-colors p-1 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-[#c9a96e]" />
          <div>
            <h1 className="text-lg font-serif font-bold leading-tight">Cover Designer</h1>
            <p className="text-xs text-[#a08060]">Full-wrap cover specification generator</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-[#c9a96e] text-[#c9a96e] hover:bg-[#3d2810] gap-1.5 text-xs"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Spec"}
          </Button>
          <Button
            size="sm"
            className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] gap-1.5 text-xs font-semibold"
            onClick={handlePrint}
          >
            <Printer className="w-3.5 h-3.5" />
            Print Spec
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Configuration */}
          <div className="lg:col-span-2 space-y-8">

            {/* Trim Size */}
            <Card className="border-[#e8dfd0] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">1</span>
                  Trim Size
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Book Trim Size</Label>
                  <Select value={trimSizeId} onValueChange={setTrimSizeId}>
                    <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIM_SIZES.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {trimSizeId === "custom" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#5c3d2e] font-semibold text-sm">Width (inches)</Label>
                      <Input value={customW} onChange={e => setCustomW(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="6.0" />
                    </div>
                    <div>
                      <Label className="text-[#5c3d2e] font-semibold text-sm">Height (inches)</Label>
                      <Input value={customH} onChange={e => setCustomH(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="9.0" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Paper & Binding */}
            <Card className="border-[#e8dfd0] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">2</span>
                  Paper & Binding (for spine calculation)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Paper Type</Label>
                    <Select value={paperTypeId} onValueChange={setPaperTypeId}>
                      <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAPER_TYPES.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {paperTypeId === "custom" && (
                      <Input value={customPpi} onChange={e => setCustomPpi(e.target.value)} className="mt-2 border-[#d4c8b4]" placeholder="PPI (e.g. 440)" />
                    )}
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Binding Type</Label>
                    <Select value={bindingTypeId} onValueChange={setBindingTypeId}>
                      <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BINDING_TYPES.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Final Page Count</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <Input
                      value={pageCount}
                      onChange={e => setPageCount(e.target.value)}
                      className="border-[#d4c8b4] max-w-[140px]"
                      placeholder="320"
                    />
                    <span className="text-sm text-[#8b7b6b]">pages</span>
                    {specs && (
                      <span className="text-sm text-[#5c3d2e] font-medium">
                        → Spine: <strong>{specs.spineIn}"</strong>
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Print Specifications */}
            <Card className="border-[#e8dfd0] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">3</span>
                  Print Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Color Mode</Label>
                    <Select value={colorModeId} onValueChange={setColorModeId}>
                      <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_MODES.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#8b7b6b] mt-1">{colorMode.desc}</p>
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Laminate Finish</Label>
                    <Select value={laminateId} onValueChange={setLaminateId}>
                      <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LAMINATES.map(l => (
                          <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#8b7b6b] mt-1">{laminate.desc}</p>
                  </div>
                </div>

                {/* Special finishes */}
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Special Finishes (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SPECIAL_FINISHES.map(finish => (
                      <button
                        key={finish}
                        onClick={() => toggleFinish(finish)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          selectedFinishes.includes(finish)
                            ? "bg-[#8b5e3c] text-white border-[#8b5e3c]"
                            : "bg-white text-[#5c3d2e] border-[#d4c8b4] hover:border-[#c9a96e]"
                        }`}
                      >
                        {finish}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Barcode & author photo */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={barcode}
                      onChange={e => setBarcode(e.target.checked)}
                      className="accent-[#8b5e3c] w-4 h-4"
                    />
                    <span className="text-sm text-[#3a2a1a]">Include barcode area on back cover</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={authorPhoto}
                      onChange={e => setAuthorPhoto(e.target.checked)}
                      className="accent-[#8b5e3c] w-4 h-4"
                    />
                    <span className="text-sm text-[#3a2a1a]">Author photo on back cover</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Visual diagram */}
            {specs && trimW > 0 && trimH > 0 && (
              <Card className="border-[#e8dfd0] bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">4</span>
                    Cover Layout Diagram
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CoverDiagram
                    trimW={trimW}
                    trimH={trimH}
                    spineIn={specs.spineIn}
                    bleed={BLEED}
                    safeZone={SAFE_ZONE}
                    barcode={barcode}
                    authorPhoto={authorPhoto}
                  />
                  <p className="text-xs text-[#8b7b6b] mt-3 text-center">
                    Diagram is proportional. Red = bleed area, blue dashed = safe zone.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Spec summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {specs ? (
                <>
                  {/* Dimensions card */}
                  <div className="bg-[#2c1a00] rounded-xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="w-4 h-4 text-[#c9a96e]" />
                      <span className="text-sm font-semibold text-[#c9a96e] tracking-wide uppercase">Cover Dimensions</span>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#a08060]">Full Wrap Width</span>
                        <span className="text-white font-bold">{specs.fullWrapW}"</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a08060]">Full Wrap Height</span>
                        <span className="text-white font-bold">{specs.fullWrapH}"</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a08060]">Full Wrap (mm)</span>
                        <span className="text-[#c9a96e] font-medium">{specs.fullWrapWmm} × {specs.fullWrapHmm}mm</span>
                      </div>
                      <Separator className="bg-[#4a3828]" />
                      <div className="flex justify-between">
                        <span className="text-[#a08060]">Front / Back Panel</span>
                        <span className="text-white font-medium">{trimW}" × {trimH}"</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a08060]">Spine Width</span>
                        <span className="text-[#c9a96e] font-bold">{specs.spineIn}" ({specs.spineMm}mm)</span>
                      </div>
                      <Separator className="bg-[#4a3828]" />
                      <div className="flex justify-between">
                        <span className="text-[#a08060]">Bleed (all sides)</span>
                        <span className="text-white font-medium">{BLEED}"</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a08060]">Safe Zone</span>
                        <span className="text-white font-medium">{SAFE_ZONE}" inside trim</span>
                      </div>
                    </div>
                  </div>

                  {/* Print specs card */}
                  <div className="bg-[#fdf5ec] rounded-xl p-4 border border-[#e8ddd0]">
                    <p className="text-xs font-semibold text-[#5c3d2e] uppercase tracking-wide mb-3">Print File Requirements</p>
                    <div className="space-y-1.5 text-xs text-[#7a5c3a]">
                      <div className="flex justify-between">
                        <span>Color Mode</span>
                        <span className="font-medium">{colorMode.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resolution</span>
                        <span className="font-medium">300 DPI min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PDF Standard</span>
                        <span className="font-medium">PDF/X-1a or X-4</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fonts</span>
                        <span className="font-medium">Must be embedded</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Laminate</span>
                        <span className="font-medium">{laminate.name}</span>
                      </div>
                      {selectedFinishes.length > 0 && (
                        <div className="pt-1 border-t border-[#e8ddd0]">
                          <span className="text-[#5c3d2e] font-semibold">Special Finishes:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedFinishes.map(f => (
                              <Badge key={f} variant="outline" className="text-[9px] border-[#c9a96e] text-[#8b5e3c] py-0 px-1">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-[#8b5e3c] hover:bg-[#7a4f30] text-white gap-2"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied to Clipboard!" : "Copy Full Spec Sheet"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-[#c9a96e] text-[#5c3d2e] hover:bg-[#fdf5ec] gap-2"
                    onClick={handlePrint}
                  >
                    <Printer className="w-4 h-4" />
                    Print Spec Sheet
                  </Button>
                </>
              ) : (
                <div className="bg-[#f5ede4] rounded-xl p-6 text-center border border-[#e8ddd0]">
                  <Layers className="w-8 h-8 text-[#c9a96e] mx-auto mb-3" />
                  <p className="text-sm text-[#7a5c3a]">Enter your trim size and page count to calculate cover dimensions.</p>
                </div>
              )}
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
              { href: "/bible-studio", label: "Bible Design Studio" },
              { href: "/spine-calculator", label: "Spine Calculator" },
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
    </div>
  );
}

// ─── Cover Diagram Component ──────────────────────────────────────────────────

function CoverDiagram({
  trimW, trimH, spineIn, bleed, safeZone, barcode, authorPhoto,
}: {
  trimW: number;
  trimH: number;
  spineIn: number;
  bleed: number;
  safeZone: number;
  barcode: boolean;
  authorPhoto: boolean;
}) {
  const totalW = trimW * 2 + spineIn + bleed * 2;
  const totalH = trimH + bleed * 2;
  const scale = Math.min(600 / (totalW * 96), 300 / (totalH * 96));
  const px = (inches: number) => inches * 96 * scale;

  const svgW = px(totalW);
  const svgH = px(totalH);
  const bleedPx = px(bleed);
  const safePx = px(safeZone);
  const spinePx = px(spineIn);
  const panelPx = px(trimW);
  const panelHPx = px(trimH);

  return (
    <div className="flex justify-center overflow-x-auto">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="border border-[#e8ddd0] rounded-lg bg-white"
      >
        {/* Bleed area (full background) */}
        <rect x={0} y={0} width={svgW} height={svgH} fill="#fee2e2" opacity={0.5} />

        {/* Back cover */}
        <rect x={bleedPx} y={bleedPx} width={panelPx} height={panelHPx} fill="#e8f4fd" stroke="#3b82f6" strokeWidth={1} />
        {/* Safe zone - back */}
        <rect
          x={bleedPx + safePx} y={bleedPx + safePx}
          width={panelPx - safePx * 2} height={panelHPx - safePx * 2}
          fill="none" stroke="#3b82f6" strokeWidth={0.5} strokeDasharray="4,2"
        />
        <text x={bleedPx + panelPx / 2} y={bleedPx + panelHPx / 2 - 8} textAnchor="middle" fontSize={10 * scale * 2} fill="#1e40af" fontFamily="serif">
          BACK COVER
        </text>
        {barcode && (
          <>
            <rect
              x={bleedPx + panelPx - safePx - px(2.0)}
              y={bleedPx + panelHPx - safePx - px(1.2)}
              width={px(2.0)} height={px(1.2)}
              fill="#fff" stroke="#374151" strokeWidth={0.5}
            />
            <text
              x={bleedPx + panelPx - safePx - px(1.0)}
              y={bleedPx + panelHPx - safePx - px(0.5)}
              textAnchor="middle" fontSize={7 * scale * 2} fill="#374151"
            >
              Barcode
            </text>
          </>
        )}
        {authorPhoto && (
          <rect
            x={bleedPx + safePx} y={bleedPx + safePx}
            width={px(1.5)} height={px(2.0)}
            fill="#f3f4f6" stroke="#9ca3af" strokeWidth={0.5} strokeDasharray="3,2"
          />
        )}

        {/* Spine */}
        <rect x={bleedPx + panelPx} y={bleedPx} width={spinePx} height={panelHPx} fill="#fef3c7" stroke="#d97706" strokeWidth={1} />
        <text
          x={bleedPx + panelPx + spinePx / 2}
          y={bleedPx + panelHPx / 2}
          textAnchor="middle"
          fontSize={Math.min(9 * scale * 2, spinePx * 0.7)}
          fill="#92400e"
          transform={`rotate(-90, ${bleedPx + panelPx + spinePx / 2}, ${bleedPx + panelHPx / 2})`}
        >
          SPINE
        </text>

        {/* Front cover */}
        <rect x={bleedPx + panelPx + spinePx} y={bleedPx} width={panelPx} height={panelHPx} fill="#f0fdf4" stroke="#16a34a" strokeWidth={1} />
        {/* Safe zone - front */}
        <rect
          x={bleedPx + panelPx + spinePx + safePx} y={bleedPx + safePx}
          width={panelPx - safePx * 2} height={panelHPx - safePx * 2}
          fill="none" stroke="#16a34a" strokeWidth={0.5} strokeDasharray="4,2"
        />
        <text
          x={bleedPx + panelPx + spinePx + panelPx / 2}
          y={bleedPx + panelHPx / 2}
          textAnchor="middle" fontSize={10 * scale * 2} fill="#15803d" fontFamily="serif"
        >
          FRONT COVER
        </text>

        {/* Dimension labels */}
        <text x={bleedPx + panelPx / 2} y={svgH - 2} textAnchor="middle" fontSize={7 * scale * 2} fill="#6b7280">
          {trimW}"
        </text>
        <text x={bleedPx + panelPx + spinePx / 2} y={svgH - 2} textAnchor="middle" fontSize={7 * scale * 2} fill="#92400e">
          {spineIn}"
        </text>
        <text x={bleedPx + panelPx + spinePx + panelPx / 2} y={svgH - 2} textAnchor="middle" fontSize={7 * scale * 2} fill="#6b7280">
          {trimW}"
        </text>
      </svg>
    </div>
  );
}
