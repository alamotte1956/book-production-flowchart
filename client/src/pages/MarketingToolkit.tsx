import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Megaphone, FileText, Image, Briefcase, Download, Eye } from "lucide-react";
import RelatedTools from "@/components/RelatedTools";
import SiteFooter from "@/components/SiteFooter";
import { toast } from "sonner";
import { exportSpecSheetAsPdf } from "@/lib/exportPdf";

const SOCIAL_PRESETS = [
  { id: "instagram", name: "Instagram Post", w: 1080, h: 1080 },
  { id: "facebook", name: "Facebook Cover", w: 1200, h: 630 },
  { id: "twitter", name: "Twitter / X Header", w: 1600, h: 900 },
  { id: "pinterest", name: "Pinterest Pin", w: 1000, h: 1500 },
] as const;

function drawSocialGraphic(
  canvas: HTMLCanvasElement,
  preset: (typeof SOCIAL_PRESETS)[number],
  title: string,
  author: string,
  coverUrl: string,
): Promise<void> {
  return new Promise((resolve) => {
    canvas.width = preset.w;
    canvas.height = preset.h;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#2a1a0a";
    ctx.fillRect(0, 0, preset.w, preset.h);

    const borderWidth = Math.round(preset.w * 0.02);
    ctx.strokeStyle = "#c9a96e";
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, preset.w - borderWidth, preset.h - borderWidth);

    const innerBorder = borderWidth + Math.round(preset.w * 0.015);
    ctx.strokeStyle = "rgba(201,169,110,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(innerBorder, innerBorder, preset.w - innerBorder * 2, preset.h - innerBorder * 2);

    const renderText = () => {
      const centerX = preset.w / 2;
      const titleSize = Math.round(preset.w * 0.06);
      const authorSize = Math.round(preset.w * 0.035);
      const brandSize = Math.round(preset.w * 0.018);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#c9a96e";
      ctx.font = `bold ${titleSize}px Georgia, serif`;
      const maxTextWidth = preset.w * 0.7;

      const words = (title || "Your Book Title").split(" ");
      const lines: string[] = [];
      let currentLine = "";
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxTextWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const lineHeight = titleSize * 1.3;
      const totalTextHeight = lines.length * lineHeight + authorSize * 2;
      let startY = preset.h / 2 - totalTextHeight / 2;

      if (coverUrl) {
        startY = preset.h * 0.55;
      }

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], centerX, startY + i * lineHeight);
      }

      const authorY = startY + lines.length * lineHeight + authorSize;
      ctx.fillStyle = "#e8dfd0";
      ctx.font = `italic ${authorSize}px Georgia, serif`;
      ctx.fillText(author || "Author Name", centerX, authorY);

      ctx.fillStyle = "rgba(201,169,110,0.5)";
      ctx.font = `${brandSize}px Georgia, serif`;
      ctx.fillText("Easy Book Publishers", centerX, preset.h - borderWidth * 3);
    };

    if (coverUrl) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const maxCoverH = preset.h * 0.4;
        const maxCoverW = preset.w * 0.25;
        const scale = Math.min(maxCoverW / img.width, maxCoverH / img.height);
        const cw = img.width * scale;
        const ch = img.height * scale;
        const cx = (preset.w - cw) / 2;
        const cy = preset.h * 0.08;

        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.drawImage(img, cx, cy, cw, ch);
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        renderText();
        resolve();
      };
      img.onerror = () => {
        renderText();
        resolve();
      };
      img.src = coverUrl;
    } else {
      renderText();
      resolve();
    }
  });
}

export default function MarketingToolkit() {
  const [, navigate] = useLocation();

  const [bookTitle, setBookTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [blurb, setBlurb] = useState("");
  const [genre, setGenre] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [isbn, setIsbn] = useState("");
  const [trimSize, setTrimSize] = useState("");
  const [pubDate, setPubDate] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [retailPrice, setRetailPrice] = useState("");

  const [sellSheetLoading, setSellSheetLoading] = useState(false);
  const [pressKitLoading, setPressKitLoading] = useState(false);

  const [selectedPreset, setSelectedPreset] = useState<string>("instagram");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewGenerated, setPreviewGenerated] = useState(false);

  const handleGenerateSellSheet = async () => {
    if (!bookTitle.trim()) {
      toast.error("Please enter a book title");
      return;
    }
    setSellSheetLoading(true);
    try {
      await exportSpecSheetAsPdf({
        title: bookTitle || "Book Sell Sheet",
        subtitle: authorName ? `by ${authorName}` : undefined,
        filename: `Sell-Sheet-${bookTitle.replace(/\s+/g, "-")}.pdf`,
        sections: [
          {
            title: "Book Information",
            rows: [
              { label: "Title", value: bookTitle, bold: true },
              ...(authorName ? [{ label: "Author", value: authorName }] : []),
              ...(genre ? [{ label: "Genre", value: genre }] : []),
              ...(isbn ? [{ label: "ISBN", value: isbn }] : []),
              ...(pubDate ? [{ label: "Publication Date", value: pubDate }] : []),
              ...(retailPrice ? [{ label: "Retail Price", value: `$${retailPrice}` }] : []),
            ],
          },
          ...(blurb
            ? [
                {
                  title: "Description",
                  rows: [{ label: "Synopsis", value: blurb }],
                },
              ]
            : []),
          {
            title: "Specifications",
            rows: [
              ...(trimSize ? [{ label: "Trim Size", value: trimSize }] : []),
              ...(pageCount ? [{ label: "Page Count", value: `${pageCount} pages` }] : []),
              { label: "Format", value: "Trade Paperback / Hardcover" },
              { label: "Distribution", value: "Available through major distributors" },
            ],
          },
          {
            title: "Ordering Information",
            rows: [
              { label: "Availability", value: "Amazon, Barnes & Noble, IngramSpark" },
              ...(isbn ? [{ label: "Order by ISBN", value: isbn }] : []),
              ...(retailPrice ? [{ label: "Suggested Retail", value: `$${retailPrice}` }] : []),
            ],
          },
        ],
        footerNote: coverImageUrl
          ? `Cover image available at: ${coverImageUrl}`
          : undefined,
      });
      toast.success("Sell sheet PDF downloaded!");
    } catch {
      toast.error("Failed to generate sell sheet PDF. Please try again.");
    } finally {
      setSellSheetLoading(false);
    }
  };

  const handleGeneratePreview = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preset = SOCIAL_PRESETS.find((p) => p.id === selectedPreset)!;
    await drawSocialGraphic(canvas, preset, bookTitle, authorName, coverImageUrl);
    setPreviewGenerated(true);
  }, [selectedPreset, bookTitle, authorName, coverImageUrl]);

  const handleDownloadSocial = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preset = SOCIAL_PRESETS.find((p) => p.id === selectedPreset)!;
    const link = document.createElement("a");
    link.download = `${(bookTitle || "book").replace(/\s+/g, "-")}-${preset.id}-${preset.w}x${preset.h}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${preset.name} graphic downloaded!`);
  }, [selectedPreset, bookTitle]);

  const handleGeneratePressKit = async () => {
    if (!bookTitle.trim()) {
      toast.error("Please enter a book title");
      return;
    }
    setPressKitLoading(true);
    try {
      await exportSpecSheetAsPdf({
        title: `Press Kit — ${bookTitle}`,
        subtitle: authorName ? `by ${authorName}` : undefined,
        filename: `Press-Kit-${bookTitle.replace(/\s+/g, "-")}.pdf`,
        sections: [
          {
            title: "Book Details",
            rows: [
              { label: "Title", value: bookTitle, bold: true },
              ...(authorName ? [{ label: "Author", value: authorName }] : []),
              ...(genre ? [{ label: "Genre / Category", value: genre }] : []),
              ...(isbn ? [{ label: "ISBN", value: isbn }] : []),
              ...(pubDate ? [{ label: "Publication Date", value: pubDate }] : []),
              ...(retailPrice ? [{ label: "Retail Price", value: `$${retailPrice}` }] : []),
              ...(trimSize ? [{ label: "Trim Size", value: trimSize }] : []),
              ...(pageCount ? [{ label: "Page Count", value: `${pageCount} pages` }] : []),
            ],
          },
          ...(blurb
            ? [
                {
                  title: "Book Description",
                  rows: [{ label: "Synopsis", value: blurb }],
                },
              ]
            : []),
          ...(authorBio
            ? [
                {
                  title: "About the Author",
                  rows: [{ label: "Biography", value: authorBio }],
                },
              ]
            : []),
          {
            title: "Media Assets",
            rows: [
              ...(coverImageUrl
                ? [{ label: "Cover Image", value: coverImageUrl }]
                : [{ label: "Cover Image", value: "Not provided" }]),
              { label: "High-Res Cover", value: "Available upon request" },
              { label: "Author Photo", value: "Available upon request" },
            ],
          },
          {
            title: "Key Facts",
            rows: [
              { label: "Publisher", value: "Easy Book Publishers" },
              { label: "Format", value: "Trade Paperback / Hardcover / eBook" },
              { label: "Distribution", value: "Amazon, Barnes & Noble, IngramSpark, and more" },
              { label: "Review Copies", value: "Available upon request" },
            ],
          },
          {
            title: "Contact",
            rows: [
              { label: "Publisher", value: "Easy Book Publishers" },
              { label: "Website", value: "easybookpublishers.com" },
            ],
          },
        ],
        footerNote: "For review copies, interviews, or media inquiries, please contact the publisher.",
      });
      toast.success("Press kit PDF downloaded!");
    } catch {
      toast.error("Failed to generate press kit PDF. Please try again.");
    } finally {
      setPressKitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3efe6]">
      <header className="bg-[#2a1a0a] text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-lg">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-[#c9a96e] hover:text-white transition-colors p-1 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <Megaphone className="w-5 h-5 text-[#c9a96e]" />
          <div>
            <h1 className="text-lg font-serif font-bold leading-tight">Marketing Toolkit</h1>
            <p className="text-xs text-[#a08060]">Sell sheets, social graphics & press kits</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-[#e8dfd0] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">1</span>
                  Book Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-[#5c3d2e]">Book Title *</Label>
                  <Input
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="Enter your book title"
                    className="border-[#e8dfd0] focus:border-[#c9a96e] bg-[#faf8f4]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#5c3d2e]">Author Name</Label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Author name"
                    className="border-[#e8dfd0] focus:border-[#c9a96e] bg-[#faf8f4]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#5c3d2e]">Cover Image URL</Label>
                  <Input
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    className="border-[#e8dfd0] focus:border-[#c9a96e] bg-[#faf8f4]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#5c3d2e]">Blurb / Description</Label>
                  <Textarea
                    value={blurb}
                    onChange={(e) => setBlurb(e.target.value)}
                    placeholder="Book description or back cover copy..."
                    rows={4}
                    className="border-[#e8dfd0] focus:border-[#c9a96e] bg-[#faf8f4]"
                  />
                </div>
                <Separator className="bg-[#e8dfd0]" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-[#5c3d2e]">Genre</Label>
                    <Input
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="e.g., Fiction"
                      className="border-[#e8dfd0] focus:border-[#c9a96e] bg-[#faf8f4]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#5c3d2e]">Page Count</Label>
                    <Input
                      value={pageCount}
                      onChange={(e) => setPageCount(e.target.value)}
                      placeholder="e.g., 320"
                      className="border-[#e8dfd0] focus:border-[#c9a96e] bg-[#faf8f4]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#5c3d2e]">ISBN</Label>
                    <Input
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="978-..."
                      className="border-[#e8dfd0] focus:border-[#c9a96e] bg-[#faf8f4]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#5c3d2e]">Trim Size</Label>
                    <Input
                      value={trimSize}
                      onChange={(e) => setTrimSize(e.target.value)}
                      placeholder='e.g., 6" × 9"'
                      className="border-[#e8dfd0] focus:border-[#c9a96e] bg-[#faf8f4]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#5c3d2e]">Pub Date</Label>
                    <Input
                      value={pubDate}
                      onChange={(e) => setPubDate(e.target.value)}
                      placeholder="e.g., June 2025"
                      className="border-[#e8dfd0] focus:border-[#c9a96e] bg-[#faf8f4]"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#5c3d2e]">Retail Price</Label>
                    <Input
                      value={retailPrice}
                      onChange={(e) => setRetailPrice(e.target.value)}
                      placeholder="e.g., 16.99"
                      className="border-[#e8dfd0] focus:border-[#c9a96e] bg-[#faf8f4]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#5c3d2e]">Author Bio (for Press Kit)</Label>
                  <Textarea
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    placeholder="Brief author biography..."
                    rows={3}
                    className="border-[#e8dfd0] focus:border-[#c9a96e] bg-[#faf8f4]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="sell-sheet" className="space-y-6">
              <TabsList className="bg-[#ede7d8] border border-[#e8dfd0] h-auto p-1 flex-wrap">
                <TabsTrigger value="sell-sheet" className="data-[state=active]:bg-white data-[state=active]:text-[#2c1a00] text-[#7a6e60] gap-1.5">
                  <FileText className="w-4 h-4" />
                  Sell Sheet
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-white data-[state=active]:text-[#2c1a00] text-[#7a6e60] gap-1.5">
                  <Image className="w-4 h-4" />
                  Social Graphics
                </TabsTrigger>
                <TabsTrigger value="press-kit" className="data-[state=active]:bg-white data-[state=active]:text-[#2c1a00] text-[#7a6e60] gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  Press Kit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sell-sheet">
                <Card className="border-[#e8dfd0] bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#c9a96e]" />
                      Sell Sheet / One-Sheet
                    </CardTitle>
                    <p className="text-sm text-[#7a6e60]">
                      Generate a professional one-sheet PDF with your book details, description, specs, and ordering information. Perfect for bookstores, distributors, and media contacts.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-[#faf8f4] border border-[#e8dfd0] rounded-lg p-4 space-y-3">
                      <h4 className="font-serif text-sm font-semibold text-[#2c1a00]">Your Sell Sheet Will Include:</h4>
                      <ul className="space-y-1.5 text-sm text-[#5c3d2e]">
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#c9a96e] text-[#8b5e3c] text-[10px]">✓</Badge>
                          Book title, author, genre, and ISBN
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#c9a96e] text-[#8b5e3c] text-[10px]">✓</Badge>
                          Full book description / synopsis
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#c9a96e] text-[#8b5e3c] text-[10px]">✓</Badge>
                          Physical specifications (trim, pages, format)
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#c9a96e] text-[#8b5e3c] text-[10px]">✓</Badge>
                          Ordering information and distribution channels
                        </li>
                      </ul>
                    </div>
                    <Button
                      onClick={handleGenerateSellSheet}
                      disabled={sellSheetLoading || !bookTitle.trim()}
                      className="w-full bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {sellSheetLoading ? "Generating PDF..." : "Download Sell Sheet PDF"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social">
                <Card className="border-[#e8dfd0] bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                      <Image className="w-5 h-5 text-[#c9a96e]" />
                      Social Media Graphics
                    </CardTitle>
                    <p className="text-sm text-[#7a6e60]">
                      Create branded graphics for social media platforms. Select a preset size, preview your graphic, then download as PNG.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-[#5c3d2e] mb-2 block">Platform Preset</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {SOCIAL_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              setSelectedPreset(preset.id);
                              setPreviewGenerated(false);
                            }}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              selectedPreset === preset.id
                                ? "border-[#c9a96e] bg-[#faf5eb] ring-1 ring-[#c9a96e]"
                                : "border-[#e8dfd0] bg-[#faf8f4] hover:border-[#c9a96e]/50"
                            }`}
                          >
                            <span className="text-sm font-semibold text-[#2c1a00] block">{preset.name}</span>
                            <span className="text-xs text-[#7a6e60]">{preset.w} × {preset.h}px</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleGeneratePreview}
                        variant="outline"
                        className="flex-1 border-[#c9a96e] text-[#5c3d2e] hover:bg-[#faf5eb] gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Generate Preview
                      </Button>
                      <Button
                        onClick={handleDownloadSocial}
                        disabled={!previewGenerated}
                        className="flex-1 bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download PNG
                      </Button>
                    </div>

                    <div className="bg-[#1a1008] rounded-lg p-4 flex items-center justify-center overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-[400px] rounded shadow-lg"
                        style={{ display: previewGenerated ? "block" : "none" }}
                      />
                      {!previewGenerated && (
                        <div className="text-center py-12 text-[#7a6e60]">
                          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">Click "Generate Preview" to see your graphic</p>
                          <p className="text-xs mt-1 text-[#a08060]">
                            Fill in book details on the left, then generate
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="press-kit">
                <Card className="border-[#e8dfd0] bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#c9a96e]" />
                      Press Kit Builder
                    </CardTitle>
                    <p className="text-sm text-[#7a6e60]">
                      Assemble a professional press kit PDF with your book details, author biography, media assets list, and contact information. Send to journalists, bloggers, and reviewers.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-[#faf8f4] border border-[#e8dfd0] rounded-lg p-4 space-y-3">
                      <h4 className="font-serif text-sm font-semibold text-[#2c1a00]">Your Press Kit Will Include:</h4>
                      <ul className="space-y-1.5 text-sm text-[#5c3d2e]">
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#c9a96e] text-[#8b5e3c] text-[10px]">✓</Badge>
                          Complete book details and specifications
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#c9a96e] text-[#8b5e3c] text-[10px]">✓</Badge>
                          Full book description / synopsis
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#c9a96e] text-[#8b5e3c] text-[10px]">✓</Badge>
                          Author biography
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#c9a96e] text-[#8b5e3c] text-[10px]">✓</Badge>
                          Media assets and cover image info
                        </li>
                        <li className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#c9a96e] text-[#8b5e3c] text-[10px]">✓</Badge>
                          Key facts and contact information
                        </li>
                      </ul>
                    </div>

                    {!authorBio.trim() && (
                      <div className="bg-[#fff8e1] border border-[#e8c84a]/30 rounded-lg p-3 text-sm text-[#7a6020]">
                        <strong>Tip:</strong> Add an author bio in the Book Details panel to make your press kit more complete.
                      </div>
                    )}

                    <Button
                      onClick={handleGeneratePressKit}
                      disabled={pressKitLoading || !bookTitle.trim()}
                      className="w-full bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {pressKitLoading ? "Generating PDF..." : "Download Press Kit PDF"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <RelatedTools currentPage="marketing-toolkit" />
      </div>

      <SiteFooter />
    </div>
  );
}
