import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Printer, Copy, Check, Download, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

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

const PAPER_TYPES = [
  { id: "india-24", name: "India Paper 24 lb", ppi: 1040, description: "Ultra-thin, opaque, cream-toned" },
  { id: "india-28", name: "India Paper 28 lb", ppi: 900, description: "Slightly heavier India paper" },
  { id: "bible-30", name: "Bible Paper 30 lb", ppi: 800, description: "Standard Bible paper" },
  { id: "offset-50", name: "Offset 50 lb (standard)", ppi: 440, description: "Standard book stock" },
  { id: "offset-60", name: "Offset 60 lb (medium)", ppi: 380, description: "Medium weight offset" },
  { id: "coated-80", name: "Coated 80 lb (gloss)", ppi: 280, description: "Glossy coated stock" },
  { id: "custom", name: "Custom PPI", ppi: 0, description: "Enter your own PPI value" },
];

const BINDING_TYPES = [
  { id: "perfect", name: "Perfect Bound (adhesive)", boardThickness: 0.0, adhesiveAdd: 0.06 },
  { id: "case-bound", name: "Case Bound (hardcover)", boardThickness: 0.098, adhesiveAdd: 0.0 },
  { id: "smyth-sewn", name: "Smyth-Sewn Hardcover", boardThickness: 0.098, adhesiveAdd: 0.0 },
  { id: "smyth-limp", name: "Smyth-Sewn Limp", boardThickness: 0.030, adhesiveAdd: 0.0 },
  { id: "saddle-stitch", name: "Saddle Stitch (stapled)", boardThickness: 0.0, adhesiveAdd: 0.0 },
];

const COLOR_MODES = [
  { id: "cmyk", name: "CMYK (4-Color Process)", description: "Standard for full-color printing" },
  { id: "grayscale", name: "Grayscale (Black Only)", description: "Black ink only — most text interiors" },
  { id: "1color", name: "1-Color (Pantone)", description: "Single spot color throughout" },
  { id: "2color", name: "2-Color (Duotone)", description: "Two spot colors — economical and striking" },
];

const PDF_STANDARDS = [
  { id: "pdfx1a", name: "PDF/X-1a:2001", description: "Most widely accepted — CMYK only, all fonts embedded" },
  { id: "pdfx3", name: "PDF/X-3:2002", description: "Supports ICC color management profiles" },
  { id: "pdfx4", name: "PDF/X-4:2010", description: "Supports transparency and ICC — modern standard" },
];

const BLEED = 0.125;
const SAFE_ZONE = 0.125;

export default function PrintSpecs() {
  const [, navigate] = useLocation();

  const [trimSizeId, setTrimSizeId] = useState("6x9");
  const [customW, setCustomW] = useState("6");
  const [customH, setCustomH] = useState("9");
  const [paperTypeId, setPaperTypeId] = useState("offset-50");
  const [customPpi, setCustomPpi] = useState("440");
  const [bindingTypeId, setBindingTypeId] = useState("perfect");
  const [pageCount, setPageCount] = useState("320");
  const [colorModeId, setColorModeId] = useState("grayscale");
  const [pdfStandardId, setPdfStandardId] = useState("pdfx1a");
  const [resolution, setResolution] = useState("300");
  const [coverColorMode, setCoverColorMode] = useState("cmyk");

  const trimSize = TRIM_SIZES.find(t => t.id === trimSizeId)!;
  const paper = PAPER_TYPES.find(p => p.id === paperTypeId)!;
  const binding = BINDING_TYPES.find(b => b.id === bindingTypeId)!;
  const colorMode = COLOR_MODES.find(c => c.id === colorModeId)!;
  const coverColor = COLOR_MODES.find(c => c.id === coverColorMode)!;
  const pdfStandard = PDF_STANDARDS.find(s => s.id === pdfStandardId)!;

  const trimW = trimSizeId === "custom" ? Number(customW) || 0 : trimSize.w;
  const trimH = trimSizeId === "custom" ? Number(customH) || 0 : trimSize.h;
  const ppi = paperTypeId === "custom" ? Number(customPpi) || 0 : paper.ppi;
  const pages = Number(pageCount) || 0;
  const dpi = Number(resolution) || 300;

  const specs = useMemo(() => {
    if (!trimW || !trimH) return null;

    const textBlock = pages > 0 && ppi > 0 ? pages / ppi : 0;
    const spineIn = textBlock + (2 * binding.boardThickness) + binding.adhesiveAdd;
    const spineMm = spineIn * 25.4;

    const trimWithBleedW = trimW + (BLEED * 2);
    const trimWithBleedH = trimH + (BLEED * 2);

    const safeW = trimW - (SAFE_ZONE * 2);
    const safeH = trimH - (SAFE_ZONE * 2);

    const fullWrapW = (trimW * 2) + spineIn + (BLEED * 2);
    const fullWrapH = trimH + (BLEED * 2);

    const interiorPixelW = Math.ceil(trimWithBleedW * dpi);
    const interiorPixelH = Math.ceil(trimWithBleedH * dpi);
    const coverPixelW = Math.ceil(fullWrapW * dpi);
    const coverPixelH = Math.ceil(fullWrapH * dpi);

    return {
      spineIn: Math.round(spineIn * 1000) / 1000,
      spineMm: Math.round(spineMm * 10) / 10,
      textBlock: Math.round(textBlock * 1000) / 1000,
      trimWithBleedW: Math.round(trimWithBleedW * 1000) / 1000,
      trimWithBleedH: Math.round(trimWithBleedH * 1000) / 1000,
      trimWithBleedWmm: Math.round(trimWithBleedW * 25.4 * 10) / 10,
      trimWithBleedHmm: Math.round(trimWithBleedH * 25.4 * 10) / 10,
      safeW: Math.round(safeW * 1000) / 1000,
      safeH: Math.round(safeH * 1000) / 1000,
      fullWrapW: Math.round(fullWrapW * 1000) / 1000,
      fullWrapH: Math.round(fullWrapH * 1000) / 1000,
      fullWrapWmm: Math.round(fullWrapW * 25.4 * 10) / 10,
      fullWrapHmm: Math.round(fullWrapH * 25.4 * 10) / 10,
      interiorPixelW,
      interiorPixelH,
      coverPixelW,
      coverPixelH,
    };
  }, [trimW, trimH, pages, ppi, binding.boardThickness, binding.adhesiveAdd, dpi]);

  const [copied, setCopied] = useState(false);

  const specText = specs ? [
    "══════════════════════════════════════════════════════════",
    "           PRESS-READY FILE SPECIFICATION SHEET",
    "══════════════════════════════════════════════════════════",
    "",
    "── BOOK DETAILS ───────────────────────────────────────────",
    `Trim Size:             ${trimSizeId === "custom" ? `${trimW}" × ${trimH}"` : trimSize.name}`,
    `Trim (mm):             ${Math.round(trimW * 25.4 * 10) / 10} × ${Math.round(trimH * 25.4 * 10) / 10} mm`,
    `Page Count:            ${pages.toLocaleString()} pp`,
    `Paper Stock:           ${paper.name} (${ppi} PPI)`,
    `Binding:               ${binding.name}`,
    "",
    "── SPINE ──────────────────────────────────────────────────",
    `Text Block Thickness:  ${specs.textBlock}" (${Math.round(specs.textBlock * 25.4 * 10) / 10} mm)`,
    `Spine Width:           ${specs.spineIn}" (${specs.spineMm} mm)`,
    "",
    "── BLEED & SAFE ZONE ──────────────────────────────────────",
    `Bleed:                 ${BLEED}" (${Math.round(BLEED * 25.4 * 10) / 10} mm) on all sides`,
    `Safe Zone:             ${SAFE_ZONE}" (${Math.round(SAFE_ZONE * 25.4 * 10) / 10} mm) inside trim edge`,
    `Safe Content Area:     ${specs.safeW}" × ${specs.safeH}" per page`,
    "",
    "── INTERIOR PAGE DIMENSIONS ───────────────────────────────",
    `Trim Size:             ${trimW}" × ${trimH}"`,
    `With Bleed:            ${specs.trimWithBleedW}" × ${specs.trimWithBleedH}"`,
    `With Bleed (mm):       ${specs.trimWithBleedWmm} × ${specs.trimWithBleedHmm} mm`,
    `Pixel Dimensions:      ${specs.interiorPixelW} × ${specs.interiorPixelH} px @ ${dpi} DPI`,
    "",
    "── FULL-WRAP COVER DIMENSIONS ─────────────────────────────",
    `Cover Width:           ${specs.fullWrapW}" (${specs.fullWrapWmm} mm)`,
    `Cover Height:          ${specs.fullWrapH}" (${specs.fullWrapHmm} mm)`,
    `Cover Pixels:          ${specs.coverPixelW} × ${specs.coverPixelH} px @ ${dpi} DPI`,
    `Layout:                Bleed + Back + Spine + Front + Bleed`,
    "",
    "── INTERIOR COLOR & PRINT ─────────────────────────────────",
    `Interior Color Mode:   ${colorMode.name}`,
    `Cover Color Mode:      ${coverColor.name}`,
    `Resolution:            ${dpi} DPI minimum`,
    "",
    "── FILE FORMAT REQUIREMENTS ───────────────────────────────",
    `PDF Standard:          ${pdfStandard.name}`,
    `Font Embedding:        ALL fonts must be embedded or outlined`,
    `Transparency:          Must be flattened (PDF/X-1a) or preserved (PDF/X-4)`,
    `Layers:                Flatten to single layer before export`,
    `ICC Profile:           Use printer-supplied ICC profile or GRACoL 2006`,
    `Crop Marks:            Include crop marks and bleed marks`,
    "",
    "── BLACK INK GUIDELINES ───────────────────────────────────",
    `Body Text Black:       K100 only (C0 M0 Y0 K100)`,
    `Rich Black (covers):   C60 M40 Y40 K100`,
    `Registration Black:    NEVER use — causes ink overload`,
    "",
    "── IMAGE REQUIREMENTS ─────────────────────────────────────",
    `Interior Images:       ${dpi} DPI minimum at final print size`,
    `Cover Images:          300 DPI minimum at final print size`,
    `Line Art:              1200 DPI recommended`,
    `Color Space:           Match interior/cover color mode above`,
    "",
    "── PREFLIGHT CHECKLIST ────────────────────────────────────",
    `☐  All fonts embedded or converted to outlines`,
    `☐  Images at correct DPI and color space`,
    `☐  Bleed extends ${BLEED}" beyond trim on all sides`,
    `☐  No text or critical elements within safe zone`,
    `☐  PDF exported to ${pdfStandard.name} standard`,
    `☐  Transparency flattened (if required by standard)`,
    `☐  Correct page count (must be even for most printers)`,
    `☐  Spine width verified with printer`,
    `☐  Barcode area clear on back cover (2" × 1.2")`,
    `☐  Color proof reviewed and approved`,
    "",
    "══════════════════════════════════════════════════════════",
    `Generated by Create Design Publish — ${new Date().toLocaleDateString()}`,
    "══════════════════════════════════════════════════════════",
  ].join("\n") : "";

  const handleCopy = () => {
    if (!specText) return;
    navigator.clipboard.writeText(specText);
    setCopied(true);
    toast.success("Spec sheet copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!specText) return;
    const blob = new Blob([specText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Print-Specs-${trimW}x${trimH}-${pages}pp.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Spec sheet downloaded");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-burgundy" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-walnut">Print Specs</h1>
              <p className="text-sm text-walnut/60">Generate press-ready file specifications for your printer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-gold/30 text-walnut hover:bg-gold/10 gap-1.5 text-xs"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-gold/30 text-walnut hover:bg-gold/10 gap-1.5 text-xs"
              onClick={handleDownload}
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
            <Button
              size="sm"
              className="bg-burgundy hover:bg-burgundy/90 text-parchment gap-1.5 text-xs font-semibold"
              onClick={handlePrint}
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gold/20 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-walnut flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center text-sm font-bold">1</span>
                  Trim Size & Page Count
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-walnut/80 font-semibold text-sm">Trim Size</Label>
                  <Select value={trimSizeId} onValueChange={setTrimSizeId}>
                    <SelectTrigger className="mt-1 border-gold/20 bg-white text-walnut">
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
                      <Label className="text-walnut/80 font-semibold text-sm">Width (inches)</Label>
                      <Input value={customW} onChange={e => setCustomW(e.target.value)} className="mt-1 border-gold/20" placeholder="6.0" />
                    </div>
                    <div>
                      <Label className="text-walnut/80 font-semibold text-sm">Height (inches)</Label>
                      <Input value={customH} onChange={e => setCustomH(e.target.value)} className="mt-1 border-gold/20" placeholder="9.0" />
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-walnut/80 font-semibold text-sm">Page Count</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <Input
                      value={pageCount}
                      onChange={e => setPageCount(e.target.value)}
                      className="border-gold/20 max-w-[140px]"
                      placeholder="320"
                    />
                    <span className="text-sm text-walnut/60">pages</span>
                    {pages > 0 && pages % 2 !== 0 && (
                      <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-xs">
                        Odd page count — most printers require even
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-walnut flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center text-sm font-bold">2</span>
                  Paper & Binding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-walnut/80 font-semibold text-sm">Paper Type</Label>
                    <Select value={paperTypeId} onValueChange={setPaperTypeId}>
                      <SelectTrigger className="mt-1 border-gold/20 bg-white text-walnut">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAPER_TYPES.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {paperTypeId === "custom" && (
                      <Input value={customPpi} onChange={e => setCustomPpi(e.target.value)} className="mt-2 border-gold/20" placeholder="PPI (e.g. 440)" />
                    )}
                  </div>
                  <div>
                    <Label className="text-walnut/80 font-semibold text-sm">Binding Type</Label>
                    <Select value={bindingTypeId} onValueChange={setBindingTypeId}>
                      <SelectTrigger className="mt-1 border-gold/20 bg-white text-walnut">
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
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-walnut flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center text-sm font-bold">3</span>
                  Color & Print Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-walnut/80 font-semibold text-sm">Interior Color Mode</Label>
                    <Select value={colorModeId} onValueChange={setColorModeId}>
                      <SelectTrigger className="mt-1 border-gold/20 bg-white text-walnut">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_MODES.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-walnut/50 mt-1">{colorMode.description}</p>
                  </div>
                  <div>
                    <Label className="text-walnut/80 font-semibold text-sm">Cover Color Mode</Label>
                    <Select value={coverColorMode} onValueChange={setCoverColorMode}>
                      <SelectTrigger className="mt-1 border-gold/20 bg-white text-walnut">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_MODES.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-walnut/50 mt-1">{coverColor.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-walnut/80 font-semibold text-sm">Resolution (DPI)</Label>
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger className="mt-1 border-gold/20 bg-white text-walnut">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">300 DPI — Standard</SelectItem>
                        <SelectItem value="600">600 DPI — High Quality</SelectItem>
                        <SelectItem value="1200">1200 DPI — Line Art</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-walnut/80 font-semibold text-sm">PDF Standard</Label>
                    <Select value={pdfStandardId} onValueChange={setPdfStandardId}>
                      <SelectTrigger className="mt-1 border-gold/20 bg-white text-walnut">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PDF_STANDARDS.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-walnut/50 mt-1">{pdfStandard.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {specs && (
              <>
                <Card className="border-burgundy/20 bg-burgundy/5 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-base text-burgundy">Interior Page Specs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Trim Size</span>
                      <span className="font-semibold text-walnut">{trimW}" × {trimH}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-walnut/70">With Bleed</span>
                      <span className="font-semibold text-walnut">{specs.trimWithBleedW}" × {specs.trimWithBleedH}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Safe Area</span>
                      <span className="font-semibold text-walnut">{specs.safeW}" × {specs.safeH}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Pixels @ {dpi} DPI</span>
                      <span className="font-semibold text-walnut">{specs.interiorPixelW} × {specs.interiorPixelH}</span>
                    </div>
                    <Separator className="bg-burgundy/10" />
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Bleed</span>
                      <span className="font-semibold text-walnut">{BLEED}" ({Math.round(BLEED * 25.4 * 10) / 10} mm)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Safe Zone</span>
                      <span className="font-semibold text-walnut">{SAFE_ZONE}" ({Math.round(SAFE_ZONE * 25.4 * 10) / 10} mm)</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gold/20 bg-gold/5 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-base text-walnut">Spine & Cover</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Spine Width</span>
                      <span className="font-semibold text-walnut">{specs.spineIn}" ({specs.spineMm} mm)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Text Block</span>
                      <span className="font-semibold text-walnut">{specs.textBlock}"</span>
                    </div>
                    <Separator className="bg-gold/20" />
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Full Wrap</span>
                      <span className="font-semibold text-walnut">{specs.fullWrapW}" × {specs.fullWrapH}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Full Wrap (mm)</span>
                      <span className="font-semibold text-walnut">{specs.fullWrapWmm} × {specs.fullWrapHmm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Cover Pixels</span>
                      <span className="font-semibold text-walnut">{specs.coverPixelW} × {specs.coverPixelH}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gold/20 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-base text-walnut">File Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-walnut/70">PDF Standard</span>
                      <span className="font-semibold text-walnut">{pdfStandard.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Interior Color</span>
                      <span className="font-semibold text-walnut">{colorMode.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Cover Color</span>
                      <span className="font-semibold text-walnut">{coverColor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Resolution</span>
                      <span className="font-semibold text-walnut">{dpi} DPI</span>
                    </div>
                    <Separator className="bg-gold/10" />
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Fonts</span>
                      <span className="font-semibold text-walnut">Must embed all</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-walnut/70">Body Black</span>
                      <span className="font-semibold text-walnut">K100 only</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gold/20 bg-cream/30 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-base text-walnut flex items-center gap-2">
                      <Info className="w-4 h-4 text-burgundy" />
                      Preflight Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-walnut/80">
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-0.5">☐</span>
                        <span>All fonts embedded or outlined</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-0.5">☐</span>
                        <span>Images at {dpi}+ DPI</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-0.5">☐</span>
                        <span>Bleed extends {BLEED}" beyond trim</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-0.5">☐</span>
                        <span>No content in safe zone</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-0.5">☐</span>
                        <span>{pdfStandard.name} export</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-0.5">☐</span>
                        <span>Spine width confirmed with printer</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-0.5">☐</span>
                        <span>Barcode area clear (2" × 1.2")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-burgundy mt-0.5">☐</span>
                        <span>Color proof reviewed</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
