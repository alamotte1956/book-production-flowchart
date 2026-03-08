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
import { ArrowLeft, Layers, Printer, Copy, Check, Info, Download, ShoppingCart, AlertTriangle, CheckCircle2 } from "lucide-react";
import RelatedTools from "@/components/RelatedTools";
import SiteFooter from "@/components/SiteFooter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { exportSpecSheetAsPdf } from "@/lib/exportPdf";
import WhatsNext from "@/components/WhatsNext";
import type { NextPrompt } from "@shared/prompts";

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

// ─── Amazon KDP Paper Stocks ─────────────────────────────────────────────────
const KDP_PAPER_STOCKS = [
  { id: "white-50", name: "White Paper (50 lb)", ppi: 400 },
  { id: "cream-50", name: "Cream Paper (50 lb)", ppi: 440 },
];

// ─── Amazon KDP Accepted Trim Sizes ──────────────────────────────────────────
const KDP_ACCEPTED_TRIM_SIZES = [
  "5x8", "5.25x8", "5.5x8.5", "6x9", "6.5x9.25", "7x10", "7.5x9.25", "8x10", "8.5x11",
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

  // KDP section
  const [kdpPaperStockId, setKdpPaperStockId] = useState("white-50");

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

  const kdpPaperStock = KDP_PAPER_STOCKS.find(p => p.id === kdpPaperStockId)!;
  const isKdpTrimSize = KDP_ACCEPTED_TRIM_SIZES.includes(trimSizeId);

  const kdpSpecs = useMemo(() => {
    if (!trimW || !trimH || pages <= 0) return null;

    const kdpPpi = kdpPaperStock.ppi;
    const kdpSpineIn = pages / kdpPpi;
    const kdpFullWidth = BLEED + trimW + kdpSpineIn + trimW + BLEED;
    const kdpFullHeight = trimH + (BLEED * 2);

    const barcodeZoneW = 2.0;
    const barcodeZoneH = 1.2;

    return {
      paperName: kdpPaperStock.name,
      ppi: kdpPpi,
      spineIn: Math.round(kdpSpineIn * 1000) / 1000,
      spineMm: Math.round(kdpSpineIn * 25.4 * 10) / 10,
      fullWidth: Math.round(kdpFullWidth * 1000) / 1000,
      fullHeight: Math.round(kdpFullHeight * 1000) / 1000,
      fullWidthMm: Math.round(kdpFullWidth * 25.4 * 10) / 10,
      fullHeightMm: Math.round(kdpFullHeight * 25.4 * 10) / 10,
      barcodeZoneW,
      barcodeZoneH,
      isAcceptedTrimSize: isKdpTrimSize,
    };
  }, [trimW, trimH, pages, kdpPaperStock, isKdpTrimSize]);

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
    "",
    `Easy Book Publishers — ${new Date().toLocaleDateString()}`,
    "══════════════════════════════════════════════════",
  ].join("\n") : "";

  const kdpSpecText = kdpSpecs ? [
    "══════════════════════════════════════════════════",
    "     AMAZON KDP COVER TEMPLATE SPECIFICATIONS",
    "══════════════════════════════════════════════════",
    "",
    `TRIM SIZE:           ${trimSizeId === "custom" ? `${trimW}" × ${trimH}"` : trimSize.name}`,
    `KDP COMPATIBLE:      ${kdpSpecs.isAcceptedTrimSize ? "YES ✓" : "NO ✗ — This trim size is not accepted by KDP"}`,
    `PAGE COUNT:          ${pages.toLocaleString()} pp`,
    `PAPER STOCK:         ${kdpSpecs.paperName} (${kdpSpecs.ppi} PPI)`,
    "",
    "── KDP SPINE CALCULATION ──────────────────────────",
    `Formula:             Page Count ÷ PPI = Spine Width`,
    `Calculation:         ${pages} ÷ ${kdpSpecs.ppi} = ${kdpSpecs.spineIn}"`,
    `Spine Width:         ${kdpSpecs.spineIn}" (${kdpSpecs.spineMm}mm)`,
    "",
    "── FULL COVER DIMENSIONS (Amazon Formula) ────────",
    `Formula:             Bleed + Back + Spine + Front + Bleed`,
    `Full Width:          ${BLEED}" + ${trimW}" + ${kdpSpecs.spineIn}" + ${trimW}" + ${BLEED}" = ${kdpSpecs.fullWidth}"`,
    `Full Height:         ${trimH}" + ${BLEED * 2}" (top + bottom bleed) = ${kdpSpecs.fullHeight}"`,
    `Full Cover Size:     ${kdpSpecs.fullWidth}" × ${kdpSpecs.fullHeight}"`,
    `Full Cover (mm):     ${kdpSpecs.fullWidthMm} × ${kdpSpecs.fullHeightMm}mm`,
    "",
    "── BLEED ──────────────────────────────────────────",
    `Bleed:               ${BLEED}" (${Math.round(BLEED * 25.4 * 10) / 10}mm) on outside, top, and bottom edges`,
    "",
    "── BARCODE PLACEMENT ZONE ─────────────────────────",
    `Location:            Bottom-right of back cover`,
    `Size:                ${kdpSpecs.barcodeZoneW}" × ${kdpSpecs.barcodeZoneH}"`,
    `Note:                Amazon places its own barcode here. Keep this area clear.`,
    "",
    "── KDP PAPER STOCK PPI VALUES ─────────────────────",
    `White Paper (50 lb): 400 PPI`,
    `Cream Paper (50 lb): 440 PPI`,
    "",
    "── KDP FILE REQUIREMENTS ──────────────────────────",
    `Format:              PDF`,
    `Color Space:         CMYK (no RGB, no spot colors)`,
    `Resolution:          300 DPI minimum`,
    `Bleed:               0.125" on all outside edges`,
    `Fonts:               All fonts must be embedded`,
    `Transparency:        Must be flattened`,
    `Layers:              Must be flattened to single layer`,
    "",
    "══════════════════════════════════════════════════",
  ].join("\n") : "";

  const handleDownloadKdpSpec = async () => {
    if (!kdpSpecs) return;
    try {
    await exportSpecSheetAsPdf({
      title: "Amazon KDP Cover Template Specifications",
      subtitle: `${trimSizeId === "custom" ? `${trimW}" × ${trimH}"` : trimSize.name} · ${pages} pages`,
      filename: `KDP-Cover-Spec-${trimW}x${trimH}-${pages}pp.pdf`,
      sections: [
        {
          title: "Book Details",
          rows: [
            { label: "Trim Size", value: trimSizeId === "custom" ? `${trimW}" × ${trimH}"` : trimSize.name },
            { label: "KDP Compatible", value: kdpSpecs.isAcceptedTrimSize ? "YES ✓" : "NO ✗" },
            { label: "Page Count", value: `${pages.toLocaleString()} pp` },
            { label: "Paper Stock", value: `${kdpSpecs.paperName} (${kdpSpecs.ppi} PPI)` },
          ],
        },
        {
          title: "KDP Spine Calculation",
          rows: [
            { label: "Formula", value: "Page Count ÷ PPI = Spine Width" },
            { label: "Calculation", value: `${pages} ÷ ${kdpSpecs.ppi} = ${kdpSpecs.spineIn}"` },
            { label: "Spine Width", value: `${kdpSpecs.spineIn}" (${kdpSpecs.spineMm}mm)`, bold: true },
          ],
        },
        {
          title: "Full Cover Dimensions (Amazon Formula)",
          rows: [
            { label: "Full Width", value: `${kdpSpecs.fullWidth}"` },
            { label: "Full Height", value: `${kdpSpecs.fullHeight}"` },
            { label: "Full Cover (mm)", value: `${kdpSpecs.fullWidthMm} × ${kdpSpecs.fullHeightMm}mm` },
          ],
        },
        {
          title: "Bleed & Barcode",
          rows: [
            { label: "Bleed", value: `${BLEED}" on outside, top, and bottom edges` },
            { label: "Barcode Zone", value: `${kdpSpecs.barcodeZoneW}" × ${kdpSpecs.barcodeZoneH}" — bottom-right of back cover` },
          ],
        },
        {
          title: "KDP File Requirements",
          rows: [
            { label: "Format", value: "PDF" },
            { label: "Color Space", value: "CMYK (no RGB, no spot colors)" },
            { label: "Resolution", value: "300 DPI minimum" },
            { label: "Fonts", value: "All fonts must be embedded" },
            { label: "Transparency", value: "Must be flattened" },
          ],
        },
      ],
    });
    } catch (err) {
      toast.error("PDF generation failed. Please try again.");
    }
  };

  const handleCopy = () => {
    if (!specText) return;
    navigator.clipboard.writeText(specText);
    setCopied(true);
    toast.success("Spec sheet copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = async () => {
    if (!specs) return;
    try {
    await exportSpecSheetAsPdf({
      title: "Cover Design Specification Sheet",
      subtitle: `${trimSizeId === "custom" ? `${trimW}" × ${trimH}"` : trimSize.name} · ${pages} pages`,
      filename: `Cover-Spec-${trimW}x${trimH}-${pages}pp.pdf`,
      sections: [
        {
          title: "Book Details",
          rows: [
            { label: "Trim Size", value: trimSizeId === "custom" ? `${trimW}" × ${trimH}"` : trimSize.name },
            { label: "Binding", value: binding.name },
            { label: "Page Count", value: `${pages.toLocaleString()} pp` },
            { label: "Paper", value: `${paper.name} (${ppi} PPI)` },
          ],
        },
        {
          title: "Spine",
          rows: [
            { label: "Text Block", value: `${specs.textBlock}" (${Math.round(specs.textBlock * 25.4 * 10) / 10}mm)` },
            { label: "Spine Width", value: `${specs.spineIn}" (${specs.spineMm}mm)`, bold: true },
          ],
        },
        {
          title: "Full Wrap Dimensions (with bleed)",
          rows: [
            { label: "Width", value: `${specs.fullWrapW}" (${specs.fullWrapWmm}mm)` },
            { label: "Height", value: `${specs.fullWrapH}" (${specs.fullWrapHmm}mm)` },
          ],
        },
        {
          title: "Individual Panel Dimensions",
          rows: [
            { label: "Front Cover", value: `${trimW}" × ${trimH}" (trim)` },
            { label: "Back Cover", value: `${trimW}" × ${trimH}" (trim)` },
            { label: "Spine", value: `${specs.spineIn}" × ${trimH}" (trim)` },
          ],
        },
        {
          title: "Bleed & Safe Zone",
          rows: [
            { label: "Bleed", value: `${BLEED}" on all sides` },
            { label: "Safe Zone", value: `${SAFE_ZONE}" inside trim edge` },
            { label: "Safe Content Area", value: `${specs.safeW}" × ${specs.safeH}" per panel` },
          ],
        },
        {
          title: "Print Specifications",
          rows: [
            { label: "Color Mode", value: colorMode.name },
            { label: "Laminate", value: laminate.name },
            ...(selectedFinishes.length > 0 ? [{ label: "Special Finishes", value: selectedFinishes.join(", ") }] : []),
            { label: "Resolution", value: "300 DPI minimum (600 DPI preferred)" },
            { label: "PDF Standard", value: "PDF/X-1a or PDF/X-4" },
            { label: "Font Embedding", value: "All fonts must be embedded" },
          ],
        },
      ],
    });
    } catch (err) {
      toast.error("PDF generation failed. Please try again.");
    }
  };

  const toggleFinish = (finish: string) => {
    setSelectedFinishes(prev =>
      prev.includes(finish) ? prev.filter(f => f !== finish) : [...prev, finish]
    );
  };

  return (
    <div className="min-h-screen bg-[#f3efe6]">
      {/* Header */}
      <header className="bg-[#2a1a0a] text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-lg">
        <button
          onClick={() => navigate("/dashboard")}
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
                    <span className="text-sm text-[#7a6e60]">pages</span>
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
                    <p className="text-xs text-[#7a6e60] mt-1">{colorMode.desc}</p>
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
                    <p className="text-xs text-[#7a6e60] mt-1">{laminate.desc}</p>
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
                  <p className="text-xs text-[#7a6e60] mt-3 text-center">
                    Diagram is proportional. Red = bleed area, blue dashed = safe zone.
                  </p>
                </CardContent>
              </Card>
            )}
            {/* Amazon KDP Cover Section */}
            <Card className="border-[#e8dfd0] bg-white shadow-sm border-l-4 border-l-[#ff9900]">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#ff9900]" />
                  Amazon KDP Cover Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {!isKdpTrimSize && trimSizeId !== "custom" && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800">
                      The selected trim size <strong>{trimSize.name}</strong> is not accepted by Amazon KDP. Choose a KDP-compatible trim size for print-on-demand.
                    </p>
                  </div>
                )}
                {trimSizeId === "custom" && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800">
                      Custom trim sizes may not be accepted by Amazon KDP. Verify your dimensions against <a href="https://kdp.amazon.com/en_US/help/topic/G201834180" target="_blank" rel="noopener noreferrer" className="underline font-semibold">KDP's accepted sizes</a>.
                    </p>
                  </div>
                )}
                {isKdpTrimSize && (
                  <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-green-800">
                      <strong>{trimSize.name}</strong> is accepted by Amazon KDP.
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">KDP Paper Stock</Label>
                  <Select value={kdpPaperStockId} onValueChange={setKdpPaperStockId}>
                    <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KDP_PAPER_STOCKS.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} — {p.ppi} PPI</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-[#7a6e60] mt-1">Amazon KDP uses specific PPI values per paper stock to calculate spine width.</p>
                </div>

                {kdpSpecs && (
                  <>
                    <div className="bg-[#fff8f0] border border-[#ffe0b2] rounded-lg p-4 space-y-3">
                      <p className="text-xs font-semibold text-[#e65100] uppercase tracking-wide">KDP Cover Dimensions</p>

                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-xs text-[#7a6e60] mb-1">Amazon's formula: <strong>Bleed + Back + Spine + Front + Bleed</strong></p>
                          <p className="text-[#3a2a1a] font-mono text-xs">
                            {BLEED}" + {trimW}" + {kdpSpecs.spineIn}" + {trimW}" + {BLEED}" = <strong>{kdpSpecs.fullWidth}"</strong>
                          </p>
                        </div>

                        <Separator className="bg-[#ffe0b2]" />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-[#7a6e60]">Full Cover Width</span>
                            <p className="font-bold text-[#e65100]">{kdpSpecs.fullWidth}" <span className="font-normal text-xs text-[#7a6e60]">({kdpSpecs.fullWidthMm}mm)</span></p>
                          </div>
                          <div>
                            <span className="text-xs text-[#7a6e60]">Full Cover Height</span>
                            <p className="font-bold text-[#e65100]">{kdpSpecs.fullHeight}" <span className="font-normal text-xs text-[#7a6e60]">({kdpSpecs.fullHeightMm}mm)</span></p>
                          </div>
                          <div>
                            <span className="text-xs text-[#7a6e60]">KDP Spine Width</span>
                            <p className="font-bold text-[#3a2a1a]">{kdpSpecs.spineIn}" <span className="font-normal text-xs text-[#7a6e60]">({kdpSpecs.spineMm}mm)</span></p>
                          </div>
                          <div>
                            <span className="text-xs text-[#7a6e60]">Bleed (all outside edges)</span>
                            <p className="font-bold text-[#3a2a1a]">{BLEED}" <span className="font-normal text-xs text-[#7a6e60]">({Math.round(BLEED * 25.4 * 10) / 10}mm)</span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg p-4">
                      <p className="text-xs font-semibold text-[#5c3d2e] uppercase tracking-wide mb-2">Barcode Placement Zone</p>
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-10 border-2 border-dashed border-[#374151] rounded flex items-center justify-center bg-white shrink-0">
                          <span className="text-[8px] text-[#374151] font-mono">ISBN</span>
                        </div>
                        <div className="text-xs text-[#5c3d2e] space-y-1">
                          <p><strong>{kdpSpecs.barcodeZoneW}" × {kdpSpecs.barcodeZoneH}"</strong> — bottom-right of back cover</p>
                          <p className="text-[#7a6e60]">Amazon automatically places its barcode in this area. Keep this zone clear of any design elements.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg p-4">
                      <p className="text-xs font-semibold text-[#5c3d2e] uppercase tracking-wide mb-2">KDP Paper Stock PPI Reference</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {KDP_PAPER_STOCKS.map(stock => (
                          <div key={stock.id} className={`flex justify-between p-2 rounded ${stock.id === kdpPaperStockId ? "bg-[#fff3e0] border border-[#ff9900]" : "bg-white border border-[#e0e0e0]"}`}>
                            <span className="text-[#3a2a1a]">{stock.name}</span>
                            <span className="font-bold text-[#5c3d2e]">{stock.ppi} PPI</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-[#ff9900] hover:bg-[#e68a00] text-white gap-2 font-semibold"
                      onClick={handleDownloadKdpSpec}
                    >
                      <Download className="w-4 h-4" />
                      Download KDP Cover Spec (PDF)
                    </Button>
                  </>
                )}

                {!kdpSpecs && (
                  <div className="bg-[#f5ede4] rounded-lg p-4 text-center">
                    <p className="text-sm text-[#7a5c3a]">Enter your trim size and page count above to generate KDP cover template specifications.</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                    Export Spec Sheet (PDF)
                  </Button>

                  <WhatsNext
                    compact
                    className="mt-2"
                    prompts={[
                      {
                        id: "after_cover_isbn",
                        title: "Assign an ISBN & Metadata",
                        description: "Your cover specs are set! Next, add your ISBN-13 and metadata so your barcode and distribution records are ready.",
                        actionLabel: "Open ISBN Manager",
                        actionRoute: "/isbn-manager",
                        icon: "isbn",
                        priority: "high",
                      } satisfies NextPrompt,
                    ]}
                  />
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
      <div className="border-t border-[#e8dfd0] bg-[#f3efe6] px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-[#7a6e60] mb-3 font-semibold uppercase tracking-wide">Other Self-Publishing Tools</p>
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedTools currentPage="cover-designer" />
      </div>
      <SiteFooter />
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
