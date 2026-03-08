/**
 * ISBN Lookup Page
 * Users enter any book ISBN to retrieve metadata from Open Library and Google Books,
 * then see the best-matching EBP production template auto-suggested with a one-click
 * "Recreate This Book" button that opens the Publishing Wizard.
 */

import { useState, useCallback, useEffect } from "react";
import RelatedTools from "@/components/RelatedTools";
import SiteFooter from "@/components/SiteFooter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Search, BookOpen, User, Building2, Calendar, FileText,
  Ruler, ExternalLink, Sparkles, ChevronRight, AlertCircle,
  Loader2, CheckCircle2, BookMarked, ArrowLeft,
} from "lucide-react";
import { ErrorDetail } from "@/components/ErrorDetail";
import { useLocation, Link } from "wouter";
import EBPProductionWizard from "@/components/EBPProductionWizard";
import type { EBPTemplate, EBPTemplateCategory } from "../../../shared/ebpTemplates";
import { Award, Palette, Layers } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type KPAMatch = {
  templateId: string;
  templateLabel: string;
  category: string;
  designCredit: "cover" | "cover+interior" | "full";
  bookTitle: string;
  author: string;
  publisher: string;
  year: number;
  accentColor: string;
  features: string[];
  trimLabel: string;
};

type LookupResult = {
  isbn: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedYear?: number;
  pageCount?: number;
  dimensions?: string;
  widthIn?: number;
  heightIn?: number;
  description?: string;
  coverImageUrl?: string;
  subjects?: string[];
  language?: string;
  source: "open-library" | "google-books" | "combined";
  suggestedTemplate?: EBPTemplate;
  matchConfidence?: number;
  matchReason?: string;
  kpaMatch?: KPAMatch;
};

// ─── Confidence Badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  if (pct >= 70) return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{pct}% match</Badge>;
  if (pct >= 40) return <Badge className="bg-amber-100 text-amber-800 border-amber-200">{pct}% match</Badge>;
  return <Badge className="bg-slate-100 text-slate-600 border-slate-200">{pct}% match</Badge>;
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function BookResultCard({
  result,
  onRecreate,
}: {
  result: LookupResult;
  onRecreate: (template: EBPTemplate, book: LookupResult) => void;
}) {
  const sourceLabel =
    result.source === "combined" ? "Open Library + Google Books"
    : result.source === "open-library" ? "Open Library"
    : "Google Books";

  return (
    <div className="space-y-6">
      {/* Book metadata card */}
      <Card className="border-[#c9a96e]/30 bg-[#faf6ef]">
        <CardContent className="p-6">
          <div className="flex gap-5">
            {/* Cover image */}
            <div className="flex-shrink-0">
              {result.coverImageUrl ? (
                <img
                  src={result.coverImageUrl}
                  alt={`Cover of ${result.title}`}
                  className="w-24 h-36 object-cover rounded shadow-md border border-[#c9a96e]/20"
                />
              ) : (
                <div className="w-24 h-36 bg-[#e8ddd0] rounded shadow-md border border-[#c9a96e]/20 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-[#c9a96e]" />
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-xl font-bold text-[#3b2a1a] leading-tight">
                {result.title}
              </h2>
              {result.subtitle && (
                <p className="mt-1 text-sm text-[#7a6e60] italic">{result.subtitle}</p>
              )}

              <div className="mt-3 space-y-1.5">
                {result.authors.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-[#5c3d2e]">
                    <User className="w-3.5 h-3.5 text-[#c9a96e]" />
                    <span>{result.authors.join(", ")}</span>
                  </div>
                )}
                {result.publisher && (
                  <div className="flex items-center gap-2 text-sm text-[#5c3d2e]">
                    <Building2 className="w-3.5 h-3.5 text-[#c9a96e]" />
                    <span>{result.publisher}</span>
                  </div>
                )}
                {result.publishedYear && (
                  <div className="flex items-center gap-2 text-sm text-[#5c3d2e]">
                    <Calendar className="w-3.5 h-3.5 text-[#c9a96e]" />
                    <span>{result.publishedYear}</span>
                  </div>
                )}
                {result.pageCount && (
                  <div className="flex items-center gap-2 text-sm text-[#5c3d2e]">
                    <FileText className="w-3.5 h-3.5 text-[#c9a96e]" />
                    <span>{result.pageCount.toLocaleString()} pages</span>
                  </div>
                )}
                {result.dimensions && (
                  <div className="flex items-center gap-2 text-sm text-[#5c3d2e]">
                    <Ruler className="w-3.5 h-3.5 text-[#c9a96e]" />
                    <span>{result.dimensions}</span>
                  </div>
                )}
              </div>

              {result.subjects && result.subjects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {result.subjects.slice(0, 5).map(s => (
                    <Badge key={s} variant="outline" className="text-xs text-[#7a6e60] border-[#c9a96e]/30">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {result.description && (
            <>
              <Separator className="my-4 bg-[#c9a96e]/20" />
              <p className="text-sm text-[#5c3d2e] leading-relaxed line-clamp-3">{result.description}</p>
            </>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-[#b0a090]">
              Data from {sourceLabel} · ISBN {result.isbn}
            </span>
            <a
              href={`https://openlibrary.org/isbn/${result.isbn}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#c9a96e] hover:text-[#a07840] transition-colors"
            >
              View on Open Library <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* KP&A Exact Match Banner */}
      {result.kpaMatch && (
        <Card className="border-amber-300/60 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base text-amber-900">
                <Award className="w-4 h-4 text-amber-600" />
                Koechel Peterson &amp; Associates Design Match
              </CardTitle>
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: result.kpaMatch.accentColor + "20",
                  color: result.kpaMatch.accentColor,
                  border: `1px solid ${result.kpaMatch.accentColor}50`,
                }}
              >
                {result.kpaMatch.designCredit === "full"
                  ? "Full Design"
                  : result.kpaMatch.designCredit === "cover+interior"
                  ? "Cover + Interior"
                  : "Cover Design"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: result.kpaMatch.accentColor + "15",
                  border: `1.5px solid ${result.kpaMatch.accentColor}40`,
                }}
              >
                <Palette className="w-5 h-5" style={{ color: result.kpaMatch.accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-800 font-medium">
                  This book was designed by Koechel Peterson &amp; Associates.
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Template: <span className="font-semibold">{result.kpaMatch.templateLabel}</span>
                  &nbsp;·&nbsp;{result.kpaMatch.category}
                  &nbsp;·&nbsp;{result.kpaMatch.trimLabel}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.kpaMatch.features.slice(0, 4).map((f) => (
                    <Badge
                      key={f}
                      variant="outline"
                      className="text-xs border-amber-300 text-amber-800"
                    >
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button
                className="w-full text-white"
                style={{ backgroundColor: result.kpaMatch.accentColor }}
                onClick={() => {
                  // Build a synthetic EBPTemplate from the KP&A match to open the wizard
                  const syntheticTemplate: EBPTemplate = {
                    id: result.kpaMatch!.templateId,
                    label: result.kpaMatch!.templateLabel,
                    tagline: `Designed by Koechel Peterson & Associates — ${result.kpaMatch!.category}`,
                    category: result.kpaMatch!.category as EBPTemplateCategory,
                    trimLabel: result.kpaMatch!.trimLabel,
                    trimSizeId: "",
                    styleId: "",
                    bindingTypeId: "case-bound",
                    pageCountRange: [100, 500] as [number, number],
                    features: result.kpaMatch!.features,
                    accentColor: result.kpaMatch!.accentColor,
                    exampleTitles: [result.kpaMatch!.bookTitle],
                    icon: "Palette",
                    description: `KP&A-designed ${result.kpaMatch!.category} template`,
                    paperTypeId: "standard-offset",
                    isBible: false,
                  };
                  onRecreate(syntheticTemplate, result);
                }}
              >
                <Layers className="w-4 h-4 mr-2" />
                Use KP&amp;A Template to Recreate This Book
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <p className="mt-2 text-xs text-amber-700/70 text-center">
                Opens the Publishing Wizard pre-filled with this book's KP&amp;A production specs.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* EBP Template suggestion */}
      {result.suggestedTemplate && (
        <Card className="border-[#7c3aed]/20 bg-gradient-to-br from-[#faf6ef] to-[#f3eeff]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base text-[#3b2a1a]">
                <Sparkles className="w-4 h-4 text-[#7c3aed]" />
                Suggested Production Template
              </CardTitle>
              {result.matchConfidence !== undefined && (
                <ConfidenceBadge confidence={result.matchConfidence} />
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: result.suggestedTemplate.accentColor + "20", border: `1.5px solid ${result.suggestedTemplate.accentColor}40` }}
              >
                <BookMarked className="w-5 h-5" style={{ color: result.suggestedTemplate.accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#3b2a1a]">{result.suggestedTemplate.label}</h3>
                <p className="text-sm text-[#7a6e60] mt-0.5">{result.suggestedTemplate.tagline}</p>
                <p className="text-xs text-[#b0a090] mt-1 italic">{result.matchReason}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {result.suggestedTemplate.trimLabel}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {result.suggestedTemplate.pageCountRange[0]}–{result.suggestedTemplate.pageCountRange[1]} pages
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {result.suggestedTemplate.category}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                onClick={() => onRecreate(result.suggestedTemplate!, result)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Recreate This Book
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <p className="mt-3 text-xs text-[#b0a090] text-center">
              This will open the Publishing Wizard pre-filled with this book's specs and the matched template.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ISBNLookup() {
  const [, navigate] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [searchIsbn, setSearchIsbn] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardTemplate, setWizardTemplate] = useState<EBPTemplate | null>(null);
  const [wizardBook, setWizardBook] = useState<LookupResult | null>(null);

  // ── Recent Lookups (localStorage) ───────────────────────────────────────────
  type RecentEntry = { isbn: string; title: string };
  const STORAGE_KEY = "ebp-isbn-recent";
  const [recentLookups, setRecentLookups] = useState<RecentEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RecentEntry[]) : [];
    } catch {
      return [];
    }
  });

  const addToRecent = useCallback((isbn: string, title: string) => {
    setRecentLookups(prev => {
      const filtered = prev.filter(e => e.isbn !== isbn);
      const next = [{ isbn, title }, ...filtered].slice(0, 5);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentLookups([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const { data, isLoading, error } = trpc.book.lookupByIsbn.useQuery(
    { isbn: searchIsbn! },
    { enabled: !!searchIsbn, retry: false }
  );

  // When a successful result arrives, add it to recent history
  useEffect(() => {
    if (data && searchIsbn) {
      addToRecent(searchIsbn, data.title || searchIsbn);
    }
  }, [data, searchIsbn, addToRecent]);

  const handleSearch = useCallback(() => {
    const clean = inputValue.replace(/[-\s]/g, "");
    if (clean.length < 10) return;
    setSearchIsbn(clean);
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRecreate = (template: EBPTemplate, book: LookupResult) => {
    setWizardTemplate(template);
    setWizardBook(book);
    setWizardOpen(true);
  };

  // Example ISBNs for quick testing
  const exampleIsbns = [
    { isbn: "9780736907972", label: "New Inductive Study Bible", isKpa: true },
    { isbn: "1590523318",    label: "His Princess",             isKpa: true },
    { isbn: "9781414381503", label: "Life Recovery Bible",      isKpa: true },
    { isbn: "9781404189584", label: "Heavens Proclaim His Glory", isKpa: true },
    { isbn: "9781496453907", label: "Jerusalem Rising",          isKpa: true },
    { isbn: "9781595304452", label: "Each Day a New Beginning (KP&A Hallmark)", isKpa: true },
    { isbn: "9780785250777", label: "Thompson Chain-Reference Bible" },
    { isbn: "9780310908501", label: "The Purpose Driven Life" },
    { isbn: "9780884197508", label: "The Hiding Place" },
  ];

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <div className="bg-[#2c1a00] text-white px-6 py-8 border-b border-[#4a3828]">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[#c9a96e] text-sm hover:text-white transition-colors mb-4 flex items-center gap-1.5 hover:gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#c9a96e]/20 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-[#c9a96e]" />
            </div>
            <h1 className="font-serif text-2xl font-bold">ISBN Book Lookup</h1>
          </div>
          <p className="text-[#a08060] text-sm leading-relaxed">
            Enter any book's ISBN to retrieve its production specifications and get an instant
            template recommendation for recreating it.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter ISBN-10 or ISBN-13 (e.g. 9780785250777)"
            className="flex-1 bg-white border-[#c9a96e]/30 focus-visible:ring-[#c9a96e]/50 text-[#3b2a1a] placeholder:text-[#b0a090]"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading || inputValue.replace(/[-\s]/g, "").length < 10}
            className="bg-[#8b5e3c] hover:bg-[#7a4f30] text-white px-6"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="ml-2">Look Up</span>
          </Button>
        </div>

        {/* Example ISBNs */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-[#b0a090] self-center">Try:</span>
          {exampleIsbns.map(ex => (
            <button
              key={ex.isbn}
              onClick={() => { setInputValue(ex.isbn); setSearchIsbn(ex.isbn); }}
              title={ex.isKpa ? `KP&A-designed title — ${ex.isbn}` : ex.isbn}
              className={[
                "inline-flex items-center gap-1 text-xs underline underline-offset-2 transition-colors",
                ex.isKpa
                  ? "text-amber-700 hover:text-amber-900"
                  : "text-[#c9a96e] hover:text-[#a07840]",
              ].join(" ")}
            >
              {ex.isKpa && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"
                  aria-label="KP&A designed"
                />
              )}
              {ex.label}
            </button>
          ))}
        </div>

        {/* KP&A legend */}
        <p className="mt-1.5 text-[10px] text-[#b0a090] flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
          <span>Amber dot indicates a title designed by{" "}<Link href="/templates" className="underline text-amber-700 hover:text-amber-900 transition-colors">Koechel Peterson &amp; Associates (KP&amp;A)</Link>{" "}— searching these will surface a matching KP&A production template.</span>
        </p>

        {/* Recent Lookups */}
        {recentLookups.length > 0 && (
          <div className="mt-4 border border-[#c9a96e]/20 rounded-lg bg-white/60 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#7a6e60] tracking-wide uppercase">Recent Lookups</span>
              <button
                onClick={clearRecent}
                className="text-[10px] text-[#b0a090] hover:text-[#7a6e60] transition-colors underline"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentLookups.map(entry => (
                <button
                  key={entry.isbn}
                  onClick={() => { setInputValue(entry.isbn); setSearchIsbn(entry.isbn); }}
                  className="inline-flex items-center gap-1.5 text-xs bg-[#f5efe6] hover:bg-[#ede5d8] text-[#5c3d2e] border border-[#c9a96e]/30 rounded-full px-3 py-1 transition-colors"
                  title={entry.isbn}
                >
                  <BookMarked className="w-3 h-3 text-[#c9a96e]" />
                  <span className="max-w-[180px] truncate">{entry.title}</span>
                  <span className="text-[#b0a090] font-mono text-[10px]">{entry.isbn}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results area */}
        <div className="mt-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#c9a96e]" />
              <p className="text-[#7a6e60] text-sm">Searching Open Library and Google Books…</p>
            </div>
          )}

          {error && !isLoading && (
            <ErrorDetail error={error} context="ISBN Lookup" />
          )}

          {data && !isLoading && !error && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-[#5c3d2e] font-medium">Book found</span>
              </div>
              <BookResultCard result={data as LookupResult} onRecreate={handleRecreate} />
            </div>
          )}

          {!searchIsbn && !isLoading && (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-[#c9a96e]/65 mx-auto mb-4" />
              <p className="text-[#7a6e60] text-sm">
                Enter an ISBN above to look up any book's production specifications.
              </p>
              <p className="text-[#b0a090] text-xs mt-2">
                Supports ISBN-10 and ISBN-13 formats, with or without hyphens.
              </p>
              <div className="mt-8 mx-auto max-w-md border border-[#e8dfd0] rounded-lg bg-white/80 px-5 py-4">
                <p className="text-sm font-semibold text-[#5c3d2e] mb-1">Need to purchase an ISBN?</p>
                <p className="text-xs text-[#7a6e60] mb-3">
                  In the US, ISBNs are issued exclusively by Bowker. A single ISBN costs $125; a block of 10 costs $295. Each format (hardcover, paperback, EPUB) requires its own ISBN.
                </p>
                <a
                  href="https://www.myidentifiers.com/identify-protect-your-book/isbn/buy-isbn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c9a96e] hover:text-[#b8923e] transition-colors"
                >
                  Purchase ISBNs at myidentifiers.com <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Tools footer backlinks */}
      <div className="border-t border-[#e8dfd0] bg-[#faf6ef] px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-[#7a6e60] mb-3 font-semibold uppercase tracking-wide">Other Self-Publishing Tools</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/isbn-manager", label: "ISBN & Metadata" },
              { href: "/bible-studio", label: "Bible Design Studio" },
              { href: "/spine-calculator", label: "Spine Calculator" },
              { href: "/cover-designer", label: "Cover Designer" },
              { href: "/timeline", label: "Production Timeline" },
              { href: "/auto-produce/0", label: "Auto-Produce" },
              { href: "/resources", label: "Resources Hub" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-xs px-3 py-1.5 rounded-full border border-[#d4c8b4] text-[#5c3d2e] hover:bg-[#c9a96e]/10 hover:border-[#c9a96e]/50 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Publishing Wizard */}
      {wizardOpen && wizardTemplate && (
        <EBPProductionWizard
          template={wizardTemplate}
          prefillBook={wizardBook ? {
            title: wizardBook.title,
            author: wizardBook.authors[0] ?? "",
            pageCount: wizardBook.pageCount,
            isbn: wizardBook.isbn,
          } : undefined}
          onClose={() => setWizardOpen(false)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedTools currentPage="isbn-lookup" />
      </div>
      <SiteFooter />
    </div>
  );
}
