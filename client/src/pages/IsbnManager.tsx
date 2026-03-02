/**
 * ISBN & Metadata Manager
 * Per-project ISBN, LCCN, BISAC codes, CIP data, and ONIX export.
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookMarked, Copy, Check, Download, Info, Plus, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// ─── BISAC categories (top-level) ─────────────────────────────────────────────
const BISAC_CATEGORIES = [
  { code: "BIB000000", label: "BIBLES / General" },
  { code: "BIB001000", label: "BIBLES / Christian Standard Bible / General" },
  { code: "BIB002000", label: "BIBLES / English Standard Version / General" },
  { code: "BIB003000", label: "BIBLES / King James Version / General" },
  { code: "BIB004000", label: "BIBLES / New International Version / General" },
  { code: "BIB005000", label: "BIBLES / New King James Version / General" },
  { code: "BIB006000", label: "BIBLES / New Living Translation / General" },
  { code: "FIC000000", label: "FICTION / General" },
  { code: "FIC002000", label: "FICTION / Action & Adventure" },
  { code: "FIC009000", label: "FICTION / Fantasy / General" },
  { code: "FIC028000", label: "FICTION / Mystery & Detective / General" },
  { code: "FIC032000", label: "FICTION / Romance / General" },
  { code: "FIC044000", label: "FICTION / Science Fiction / General" },
  { code: "NON000000", label: "NONFICTION / General" },
  { code: "REL000000", label: "RELIGION / General" },
  { code: "REL006000", label: "RELIGION / Biblical Studies / General" },
  { code: "REL012000", label: "RELIGION / Christian Living / General" },
  { code: "REL013000", label: "RELIGION / Christian Ministry / General" },
  { code: "REL040000", label: "RELIGION / Theology" },
  { code: "SEL000000", label: "SELF-HELP / General" },
  { code: "EDU000000", label: "EDUCATION / General" },
  { code: "JUV000000", label: "JUVENILE FICTION / General" },
  { code: "YAF000000", label: "YOUNG ADULT FICTION / General" },
  { code: "POE000000", label: "POETRY / General" },
  { code: "BIO000000", label: "BIOGRAPHY & AUTOBIOGRAPHY / General" },
  { code: "HIS000000", label: "HISTORY / General" },
  { code: "PHI000000", label: "PHILOSOPHY / General" },
  { code: "PSY000000", label: "PSYCHOLOGY / General" },
  { code: "SCI000000", label: "SCIENCE / General" },
  { code: "TEC000000", label: "TECHNOLOGY & ENGINEERING / General" },
];

// ─── Languages ─────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Spanish" },
  { code: "fre", label: "French" },
  { code: "ger", label: "German" },
  { code: "por", label: "Portuguese" },
  { code: "ita", label: "Italian" },
  { code: "chi", label: "Chinese" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "ara", label: "Arabic" },
  { code: "rus", label: "Russian" },
  { code: "heb", label: "Hebrew" },
  { code: "gre", label: "Greek" },
  { code: "lat", label: "Latin" },
];

// ─── Edition types ─────────────────────────────────────────────────────────────
const EDITION_TYPES = [
  "First Edition",
  "Second Edition",
  "Third Edition",
  "Revised Edition",
  "Revised and Updated Edition",
  "Anniversary Edition",
  "Collector's Edition",
  "Deluxe Edition",
  "Study Edition",
  "Abridged Edition",
  "Unabridged Edition",
  "Illustrated Edition",
  "Large Print Edition",
  "Gift Edition",
  "Custom Edition",
];

// ─── ISBN-10 from ISBN-13 ──────────────────────────────────────────────────────
function isbn13to10(isbn13: string): string {
  const digits = isbn13.replace(/[-\s]/g, "");
  if (digits.length !== 13 || !digits.startsWith("978")) return "";
  const core = digits.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(core[i]) * (10 - i);
  }
  const check = (11 - (sum % 11)) % 11;
  const checkChar = check === 10 ? "X" : String(check);
  return core + checkChar;
}

// ─── ISBN-13 check digit validation ───────────────────────────────────────────
function validateIsbn13(isbn: string): boolean {
  const digits = isbn.replace(/[-\s]/g, "");
  if (digits.length !== 13 || !/^\d{13}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(digits[12]);
}

export default function IsbnManager() {
  const [, navigate] = useLocation();

  // Core metadata
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [authors, setAuthors] = useState<string[]>([""]);
  const [publisher, setPublisher] = useState("");
  const [imprint, setImprint] = useState("");
  const [editionType, setEditionType] = useState("First Edition");
  const [pubYear, setPubYear] = useState(new Date().getFullYear().toString());
  const [languageCode, setLanguageCode] = useState("eng");

  // ISBNs
  const [isbn13, setIsbn13] = useState("");
  const [isbn13Ebook, setIsbn13Ebook] = useState("");
  const [isbn13Audio, setIsbn13Audio] = useState("");

  // Library data
  const [lccn, setLccn] = useState("");
  const [copyrightYear, setCopyrightYear] = useState(new Date().getFullYear().toString());
  const [copyrightHolder, setCopyrightHolder] = useState("");

  // BISAC
  const [bisacCodes, setBisacCodes] = useState<string[]>(["BIB000000"]);

  // Description
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");

  // Physical specs
  const [pageCount, setPageCount] = useState("");
  const [trimSize, setTrimSize] = useState("");
  const [weight, setWeight] = useState("");

  const [copied, setCopied] = useState(false);

  // Derived
  const isbn10 = useMemo(() => isbn13to10(isbn13), [isbn13]);
  const isbn13Valid = isbn13.replace(/[-\s]/g, "").length === 13 ? validateIsbn13(isbn13) : null;

  const addAuthor = () => setAuthors(prev => [...prev, ""]);
  const removeAuthor = (i: number) => setAuthors(prev => prev.filter((_, idx) => idx !== i));
  const updateAuthor = (i: number, val: string) => setAuthors(prev => prev.map((a, idx) => idx === i ? val : a));

  const addBisac = () => setBisacCodes(prev => [...prev, "FIC000000"]);
  const removeBisac = (i: number) => setBisacCodes(prev => prev.filter((_, idx) => idx !== i));
  const updateBisac = (i: number, val: string) => setBisacCodes(prev => prev.map((c, idx) => idx === i ? val : c));

  // ONIX XML generation
  const generateOnix = () => {
    const authorElements = authors.filter(Boolean).map((a, i) =>
      `    <Contributor>
      <SequenceNumber>${i + 1}</SequenceNumber>
      <ContributorRole>A01</ContributorRole>
      <PersonName>${a}</PersonName>
    </Contributor>`
    ).join("\n");

    const bisacElements = bisacCodes.map(code =>
      `    <Subject>
      <SubjectSchemeIdentifier>10</SubjectSchemeIdentifier>
      <SubjectCode>${code}</SubjectCode>
    </Subject>`
    ).join("\n");

    const isbnElements = [
      isbn13 && `    <ProductIdentifier>
      <ProductIDType>15</ProductIDType>
      <IDValue>${isbn13.replace(/[-\s]/g, "")}</IDValue>
    </ProductIdentifier>`,
      isbn10 && `    <ProductIdentifier>
      <ProductIDType>02</ProductIDType>
      <IDValue>${isbn10}</IDValue>
    </ProductIdentifier>`,
    ].filter(Boolean).join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<ONIXMessage release="3.0"
  xmlns="http://ns.editeur.org/onix/3.0/reference">
  <Header>
    <Sender>
      <SenderName>${publisher || "Publisher Name"}</SenderName>
    </Sender>
    <SentDateTime>${new Date().toISOString().slice(0, 10).replace(/-/g, "")}</SentDateTime>
    <MessageNote>Generated by Create Design Publish LLC</MessageNote>
  </Header>
  <Product>
    <RecordReference>${isbn13.replace(/[-\s]/g, "") || "RECORD_REF"}</RecordReference>
    <NotificationType>03</NotificationType>
    <ProductIdentifier>
      <ProductIDType>01</ProductIDType>
      <IDValue>${lccn || "LCCN_HERE"}</IDValue>
    </ProductIdentifier>
${isbnElements}
    <DescriptiveDetail>
      <ProductComposition>00</ProductComposition>
      <ProductForm>BB</ProductForm>
      <TitleDetail>
        <TitleType>01</TitleType>
        <TitleElement>
          <TitleElementLevel>01</TitleElementLevel>
          <TitleText>${title}</TitleText>
          ${subtitle ? `<Subtitle>${subtitle}</Subtitle>` : ""}
        </TitleElement>
      </TitleDetail>
${authorElements}
      <Language>
        <LanguageRole>01</LanguageRole>
        <LanguageCode>${languageCode}</LanguageCode>
      </Language>
      ${pageCount ? `<Extent>
        <ExtentType>00</ExtentType>
        <ExtentValue>${pageCount}</ExtentValue>
        <ExtentUnit>03</ExtentUnit>
      </Extent>` : ""}
${bisacElements}
    </DescriptiveDetail>
    <PublishingDetail>
      <Publisher>
        <PublishingRole>01</PublishingRole>
        <PublisherName>${publisher}</PublisherName>
        ${imprint ? `<ImprintName>${imprint}</ImprintName>` : ""}
      </Publisher>
      <PublishingDate>
        <PublishingDateRole>01</PublishingDateRole>
        <Date>${pubYear}0101</Date>
      </PublishingDate>
      <CopyrightStatement>
        <CopyrightYear>${copyrightYear}</CopyrightYear>
        <CopyrightOwner>
          <PersonName>${copyrightHolder || authors.filter(Boolean)[0] || "Author Name"}</PersonName>
        </CopyrightOwner>
      </CopyrightStatement>
    </PublishingDetail>
    ${shortDesc || longDesc ? `<CollateralDetail>
      ${shortDesc ? `<TextContent>
        <TextType>02</TextType>
        <ContentAudience>00</ContentAudience>
        <Text>${shortDesc}</Text>
      </TextContent>` : ""}
      ${longDesc ? `<TextContent>
        <TextType>03</TextType>
        <ContentAudience>00</ContentAudience>
        <Text>${longDesc}</Text>
      </TextContent>` : ""}
    </CollateralDetail>` : ""}
  </Product>
</ONIXMessage>`;
  };

  const handleCopyOnix = () => {
    navigator.clipboard.writeText(generateOnix());
    setCopied(true);
    toast.success("ONIX 3.0 XML copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadOnix = () => {
    const xml = generateOnix();
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_") || "book"}_onix3.xml`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ONIX XML downloaded");
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
          <BookMarked className="w-5 h-5 text-[#c9a96e]" />
          <div>
            <h1 className="text-lg font-serif font-bold leading-tight">ISBN & Metadata Manager</h1>
            <p className="text-xs text-[#a08060]">ISBN, BISAC, LCCN, and ONIX 3.0 export</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-[#c9a96e] text-[#c9a96e] hover:bg-[#3d2810] gap-1.5 text-xs"
            onClick={handleCopyOnix}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy ONIX"}
          </Button>
          <Button
            size="sm"
            className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] gap-1.5 text-xs font-semibold"
            onClick={handleDownloadOnix}
          >
            <Download className="w-3.5 h-3.5" />
            Export ONIX 3.0
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title & Authors */}
            <Card className="border-[#e8dfd0]">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">1</span>
                  Title & Authors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Title *</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="Full title of the book" />
                </div>
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Subtitle</Label>
                  <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="Optional subtitle" />
                </div>
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Authors / Contributors</Label>
                  <div className="space-y-2 mt-1">
                    {authors.map((author, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={author}
                          onChange={e => updateAuthor(i, e.target.value)}
                          className="border-[#d4c8b4]"
                          placeholder={`Author ${i + 1} full name`}
                        />
                        {authors.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#a89880] hover:text-red-600 shrink-0"
                            onClick={() => removeAuthor(i)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#d4c8b4] text-[#5c3d2e] hover:bg-[#f0e8d8] gap-1.5"
                      onClick={addAuthor}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Author
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Publisher & Edition */}
            <Card className="border-[#e8dfd0]">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">2</span>
                  Publisher & Edition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Publisher Name *</Label>
                    <Input value={publisher} onChange={e => setPublisher(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="e.g., Crossway Books" />
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Imprint</Label>
                    <Input value={imprint} onChange={e => setImprint(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="Optional imprint name" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Edition</Label>
                    <Select value={editionType} onValueChange={setEditionType}>
                      <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EDITION_TYPES.map(e => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Publication Year</Label>
                    <Input value={pubYear} onChange={e => setPubYear(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="2025" />
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Language</Label>
                    <Select value={languageCode} onValueChange={setLanguageCode}>
                      <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => (
                          <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ISBNs */}
            <Card className="border-[#e8dfd0]">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">3</span>
                  ISBN Numbers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[#5c3d2e] font-semibold text-sm">ISBN-13 (Print)</Label>
                    {isbn13.replace(/[-\s]/g, "").length === 13 && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 px-1.5 ${isbn13Valid ? "border-green-500 text-green-700" : "border-red-400 text-red-600"}`}
                      >
                        {isbn13Valid ? "Valid" : "Invalid check digit"}
                      </Badge>
                    )}
                  </div>
                  <Input
                    value={isbn13}
                    onChange={e => setIsbn13(e.target.value)}
                    className="mt-1 border-[#d4c8b4] font-mono"
                    placeholder="978-0-00-000000-0"
                  />
                  {isbn10 && (
                    <p className="text-xs text-[#8b7b6b] mt-1">
                      ISBN-10: <span className="font-mono font-medium text-[#5c3d2e]">{isbn10}</span>
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">ISBN-13 (eBook)</Label>
                    <Input value={isbn13Ebook} onChange={e => setIsbn13Ebook(e.target.value)} className="mt-1 border-[#d4c8b4] font-mono" placeholder="978-0-00-000000-0" />
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">ISBN-13 (Audiobook)</Label>
                    <Input value={isbn13Audio} onChange={e => setIsbn13Audio(e.target.value)} className="mt-1 border-[#d4c8b4] font-mono" placeholder="978-0-00-000000-0" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">LCCN (Library of Congress)</Label>
                    <Input value={lccn} onChange={e => setLccn(e.target.value)} className="mt-1 border-[#d4c8b4] font-mono" placeholder="2025000000" />
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Copyright Year</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={copyrightYear} onChange={e => setCopyrightYear(e.target.value)} className="border-[#d4c8b4]" placeholder="2025" />
                      <Input value={copyrightHolder} onChange={e => setCopyrightHolder(e.target.value)} className="border-[#d4c8b4] flex-1" placeholder="Copyright holder name" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BISAC Codes */}
            <Card className="border-[#e8dfd0]">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">4</span>
                  BISAC Subject Codes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bisacCodes.map((code, i) => (
                  <div key={i} className="flex gap-2">
                    <Select value={code} onValueChange={val => updateBisac(i, val)}>
                      <SelectTrigger className="border-[#d4c8b4] bg-white text-[#3a2a1a] flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BISAC_CATEGORIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} — {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {bisacCodes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#a89880] hover:text-red-600 shrink-0"
                        onClick={() => removeBisac(i)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {bisacCodes.length < 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#d4c8b4] text-[#5c3d2e] hover:bg-[#f0e8d8] gap-1.5"
                    onClick={addBisac}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add BISAC Code
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Descriptions */}
            <Card className="border-[#e8dfd0]">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">5</span>
                  Descriptions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Short Description (200 chars)</Label>
                  <Textarea
                    value={shortDesc}
                    onChange={e => setShortDesc(e.target.value)}
                    className="mt-1 border-[#d4c8b4]"
                    rows={3}
                    placeholder="Brief description for catalog listings and metadata feeds"
                    maxLength={200}
                  />
                  <p className="text-xs text-[#a89880] mt-1 text-right">{shortDesc.length}/200</p>
                </div>
                <div>
                  <Label className="text-[#5c3d2e] font-semibold text-sm">Long Description (back cover / online)</Label>
                  <Textarea
                    value={longDesc}
                    onChange={e => setLongDesc(e.target.value)}
                    className="mt-1 border-[#d4c8b4]"
                    rows={6}
                    placeholder="Full back-cover blurb or online product description"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Physical specs */}
            <Card className="border-[#e8dfd0]">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">6</span>
                  Physical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Page Count</Label>
                    <Input value={pageCount} onChange={e => setPageCount(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="320" />
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Trim Size</Label>
                    <Input value={trimSize} onChange={e => setTrimSize(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder='6" × 9"' />
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Weight (lbs)</Label>
                    <Input value={weight} onChange={e => setWeight(e.target.value)} className="mt-1 border-[#d4c8b4]" placeholder="1.2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary & Export */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Summary card */}
              <div className="bg-[#2c1a00] rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <BookMarked className="w-4 h-4 text-[#c9a96e]" />
                  <span className="text-sm font-semibold text-[#c9a96e] tracking-wide uppercase">Metadata Summary</span>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div>
                    <span className="text-[#a08060] text-xs">Title</span>
                    <p className="text-white font-medium leading-tight">{title || "—"}</p>
                    {subtitle && <p className="text-[#c9a96e]/70 text-xs">{subtitle}</p>}
                  </div>
                  <div>
                    <span className="text-[#a08060] text-xs">Author(s)</span>
                    <p className="text-white font-medium">{authors.filter(Boolean).join(", ") || "—"}</p>
                  </div>
                  <Separator className="bg-[#4a3828]" />
                  <div className="flex justify-between">
                    <span className="text-[#a08060]">ISBN-13</span>
                    <span className="text-white font-mono text-xs">{isbn13 || "—"}</span>
                  </div>
                  {isbn10 && (
                    <div className="flex justify-between">
                      <span className="text-[#a08060]">ISBN-10</span>
                      <span className="text-white font-mono text-xs">{isbn10}</span>
                    </div>
                  )}
                  {lccn && (
                    <div className="flex justify-between">
                      <span className="text-[#a08060]">LCCN</span>
                      <span className="text-white font-mono text-xs">{lccn}</span>
                    </div>
                  )}
                  <Separator className="bg-[#4a3828]" />
                  <div className="flex justify-between">
                    <span className="text-[#a08060]">Publisher</span>
                    <span className="text-white text-xs text-right">{publisher || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a08060]">Edition</span>
                    <span className="text-white text-xs">{editionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a08060]">Language</span>
                    <span className="text-white text-xs">{LANGUAGES.find(l => l.code === languageCode)?.label}</span>
                  </div>
                  {bisacCodes.length > 0 && (
                    <>
                      <Separator className="bg-[#4a3828]" />
                      <div>
                        <span className="text-[#a08060] text-xs">BISAC Codes</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {bisacCodes.map(code => (
                            <span key={code} className="text-[10px] bg-[#4a3828] text-[#c9a96e] px-1.5 py-0.5 rounded font-mono">
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Export buttons */}
              <Button
                className="w-full bg-[#8b5e3c] hover:bg-[#7a4f30] text-white gap-2"
                onClick={handleDownloadOnix}
              >
                <Download className="w-4 h-4" />
                Export ONIX 3.0 XML
              </Button>

              <Button
                variant="outline"
                className="w-full border-[#c9a96e] text-[#5c3d2e] hover:bg-[#fdf5ec] gap-2"
                onClick={handleCopyOnix}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy ONIX XML"}
              </Button>

              <div className="bg-[#fdf5ec] rounded-xl p-4 border border-[#e8ddd0]">
                <p className="text-xs font-semibold text-[#5c3d2e] uppercase tracking-wide mb-2">About ONIX 3.0</p>
                <p className="text-xs text-[#7a5c3a] leading-relaxed">
                  ONIX for Books is the international standard for representing and communicating book industry product information. ONIX 3.0 XML is required by Ingram, Baker & Taylor, Amazon, and most major distributors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
