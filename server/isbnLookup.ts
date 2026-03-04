/**
 * ISBN Lookup Service
 * Queries Open Library and Google Books APIs to retrieve book metadata,
 * then auto-maps the result to the nearest CDP production template.
 */

import { CDP_TEMPLATES, CDPTemplate } from "../shared/cdpTemplates";
import { TRIM_SIZES } from "./typesettingStyles";

// ─── Types ────────────────────────────────────────────────────────────────────

export type IsbnLookupResult = {
  isbn: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedYear?: number;
  pageCount?: number;
  /** Physical dimensions as reported by the source (e.g. "6 x 9 inches") */
  dimensions?: string;
  /** Width in inches, parsed from dimensions when available */
  widthIn?: number;
  /** Height in inches, parsed from dimensions when available */
  heightIn?: number;
  description?: string;
  coverImageUrl?: string;
  subjects?: string[];
  language?: string;
  /** Source that returned the data */
  source: "open-library" | "google-books" | "combined";
  /** The best-matching CDP template for this book */
  suggestedTemplate?: CDPTemplate;
  /** Confidence score 0–1 for the template match */
  matchConfidence?: number;
  /** Human-readable explanation of why this template was chosen */
  matchReason?: string;
};

// ─── Open Library Fetcher ─────────────────────────────────────────────────────

async function fetchOpenLibrary(isbn: string): Promise<Partial<IsbnLookupResult> | null> {
  try {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json() as Record<string, unknown>;
    const key = `ISBN:${cleanIsbn}`;
    const book = data[key] as Record<string, unknown> | undefined;
    if (!book) return null;

    const authors = (book.authors as Array<{ name: string }> | undefined)?.map(a => a.name) ?? [];
    const publishers = (book.publishers as Array<{ name: string }> | undefined)?.map(p => p.name) ?? [];
    const subjects = (book.subjects as Array<{ name: string }> | undefined)?.map(s => s.name) ?? [];

    // Parse dimensions from Open Library physical_format or physical_dimensions
    const dimStr = (book.physical_dimensions as string | undefined) ?? "";
    const { widthIn, heightIn } = parseDimensions(dimStr);

    // Cover image
    const covers = book.cover as Record<string, string> | undefined;
    const coverImageUrl = covers?.large ?? covers?.medium ?? covers?.small;

    return {
      title: (book.title as string) ?? "",
      subtitle: book.subtitle as string | undefined,
      authors,
      publisher: publishers[0],
      publishedYear: parseYear(book.publish_date as string | undefined),
      pageCount: book.number_of_pages as number | undefined,
      dimensions: dimStr || undefined,
      widthIn,
      heightIn,
      description: (book.notes as string | undefined) ?? undefined,
      coverImageUrl,
      subjects,
      source: "open-library",
    };
  } catch {
    return null;
  }
}

// ─── Google Books Fetcher ─────────────────────────────────────────────────────

async function fetchGoogleBooks(isbn: string): Promise<Partial<IsbnLookupResult> | null> {
  try {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}&maxResults=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json() as { totalItems: number; items?: unknown[] };
    if (!data.totalItems || !data.items?.length) return null;

    const item = data.items[0] as { volumeInfo: Record<string, unknown> };
    const vi = item.volumeInfo;

    const authors = (vi.authors as string[] | undefined) ?? [];
    const subjects = (vi.categories as string[] | undefined) ?? [];

    // Google Books dimensions
    const dims = vi.dimensions as Record<string, string> | undefined;
    let widthIn: number | undefined;
    let heightIn: number | undefined;
    let dimStr: string | undefined;
    if (dims) {
      const h = parseFloat(dims.height ?? "");
      const w = parseFloat(dims.width ?? "");
      // Google Books returns cm; convert to inches
      if (!isNaN(h)) heightIn = h / 2.54;
      if (!isNaN(w)) widthIn = w / 2.54;
      if (heightIn && widthIn) dimStr = `${widthIn.toFixed(2)}" × ${heightIn.toFixed(2)}"`;
    }

    // Cover image
    const imageLinks = vi.imageLinks as Record<string, string> | undefined;
    const coverImageUrl = imageLinks?.extraLarge ?? imageLinks?.large ?? imageLinks?.thumbnail;

    // Description
    const description = (vi.description as string | undefined)?.slice(0, 500);

    return {
      title: (vi.title as string) ?? "",
      subtitle: vi.subtitle as string | undefined,
      authors,
      publisher: vi.publisher as string | undefined,
      publishedYear: parseYear(vi.publishedDate as string | undefined),
      pageCount: vi.pageCount as number | undefined,
      dimensions: dimStr,
      widthIn,
      heightIn,
      description,
      coverImageUrl,
      subjects,
      language: vi.language as string | undefined,
      source: "google-books",
    };
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseYear(dateStr: string | undefined): number | undefined {
  if (!dateStr) return undefined;
  const m = dateStr.match(/\d{4}/);
  return m ? parseInt(m[0]) : undefined;
}

function parseDimensions(dimStr: string): { widthIn?: number; heightIn?: number } {
  if (!dimStr) return {};
  // Patterns: "9.1 x 6.1 x 1.5 inches", "6 x 9 in", "22 x 15 cm"
  const inchMatch = dimStr.match(/([\d.]+)\s*[xX×]\s*([\d.]+)(?:\s*[xX×]\s*[\d.]+)?\s*(?:in|inch|inches)/i);
  if (inchMatch) {
    const a = parseFloat(inchMatch[1]);
    const b = parseFloat(inchMatch[2]);
    // Larger dimension is height
    return { widthIn: Math.min(a, b), heightIn: Math.max(a, b) };
  }
  const cmMatch = dimStr.match(/([\d.]+)\s*[xX×]\s*([\d.]+)(?:\s*[xX×]\s*[\d.]+)?\s*(?:cm|centimeter)/i);
  if (cmMatch) {
    const a = parseFloat(cmMatch[1]) / 2.54;
    const b = parseFloat(cmMatch[2]) / 2.54;
    return { widthIn: Math.min(a, b), heightIn: Math.max(a, b) };
  }
  return {};
}

// ─── CDP Template Matcher ─────────────────────────────────────────────────────

/**
 * Given book metadata, returns the best-matching CDP template and a confidence score.
 * Scoring factors:
 *   - Trim size proximity (40 pts max)
 *   - Page count within range (20 pts max)
 *   - Subject keyword match (40 pts max)
 */
export function matchCDPTemplate(book: Partial<IsbnLookupResult>): {
  template: CDPTemplate;
  confidence: number;
  reason: string;
} {
  const scores: Array<{ template: CDPTemplate; score: number; reasons: string[] }> = [];

  for (const template of CDP_TEMPLATES) {
    let score = 0;
    const reasons: string[] = [];

    // ── Trim size proximity (40 pts) ──────────────────────────────────────────
    if (book.widthIn && book.heightIn) {
      const trimSize = TRIM_SIZES.find(t => t.id === template.trimSizeId);
      if (trimSize) {
        const wDiff = Math.abs(book.widthIn - trimSize.widthIn);
        const hDiff = Math.abs(book.heightIn - trimSize.heightIn);
        const totalDiff = wDiff + hDiff;
        if (totalDiff < 0.25) { score += 40; reasons.push(`exact trim match (${trimSize.label})`); }
        else if (totalDiff < 0.75) { score += 25; reasons.push(`close trim match (${trimSize.label})`); }
        else if (totalDiff < 1.5) { score += 10; reasons.push(`approximate trim match`); }
      }
    }

    // ── Page count within range (20 pts) ─────────────────────────────────────
    if (book.pageCount) {
      const [lo, hi] = template.pageCountRange;
      if (book.pageCount >= lo && book.pageCount <= hi) {
        score += 20; reasons.push(`page count ${book.pageCount} in range ${lo}–${hi}`);
      } else {
        const nearMiss = Math.min(Math.abs(book.pageCount - lo), Math.abs(book.pageCount - hi));
        if (nearMiss < 100) { score += 10; reasons.push(`page count near range`); }
      }
    }

    // ── Subject / keyword match (40 pts) ─────────────────────────────────────
    const allSubjects = [
      ...(book.subjects ?? []),
      book.title ?? "",
      book.subtitle ?? "",
      book.description ?? "",
    ].join(" ").toLowerCase();

    const bibleKeywords = ["bible", "scripture", "testament", "kjv", "niv", "esv", "genesis", "revelation", "gospel", "epistle"];
    const devotionalKeywords = ["devotional", "daily", "quiet time", "meditation", "reflection", "morning", "evening"];
    const christianLivingKeywords = ["christian living", "discipleship", "faith", "spiritual growth", "purpose", "prayer", "worship"];
    const childrenKeywords = ["children", "kids", "picture book", "juvenile", "young reader", "ages 3", "ages 4", "ages 5", "ages 6", "ages 7", "ages 8"];
    const youthKeywords = ["teen", "youth", "young adult", "teenager", "adolescent"];
    const biographyKeywords = ["biography", "memoir", "testimony", "life story", "autobiography"];
    const academicKeywords = ["theology", "commentary", "exegesis", "hermeneutics", "systematic", "seminary", "academic", "scholarly"];
    const pastoralKeywords = ["pastor", "ministry", "church", "preaching", "sermon", "leadership", "congregation"];
    const musicKeywords = ["hymn", "worship", "choir", "music", "song", "praise", "liturgy"];

    const keywordSets: Record<string, string[]> = {
      "study-bible": bibleKeywords,
      "devotional-bible": [...bibleKeywords, ...devotionalKeywords],
      "reference-bible": bibleKeywords,
      "journaling-bible": [...bibleKeywords, "journal", "art", "creative"],
      "large-print-bible": [...bibleKeywords, "large print", "senior"],
      "compact-bible": [...bibleKeywords, "pocket", "compact", "travel", "military"],
      "childrens-bible": [...bibleKeywords, ...childrenKeywords],
      "youth-bible": [...bibleKeywords, ...youthKeywords],
      "parallel-bible": [...bibleKeywords, "parallel", "comparison", "translation"],
      "interlinear-bible": [...bibleKeywords, "interlinear", "hebrew", "greek", "original language"],
      "gift-bible": [...bibleKeywords, "gift", "presentation", "wedding", "confirmation"],
      "harmony-gospels": [...bibleKeywords, "harmony", "gospel", "matthew", "mark", "luke", "john"],
      "christian-living": christianLivingKeywords,
      "discipleship-workbook": [...christianLivingKeywords, "workbook", "study guide", "small group"],
      "daily-devotional": devotionalKeywords,
      "inspirational-gift": [...devotionalKeywords, "inspirational", "gift", "encouragement"],
      "childrens-christian-picture": [...childrenKeywords, "picture", "illustrated"],
      "childrens-christian-chapter": [...childrenKeywords, "chapter", "story"],
      "prayer-guide": ["prayer", "intercession", "spiritual practice", "praying"],
      "spiritual-journal": ["journal", "notebook", "reflection", "diary"],
      "pastoral-leadership": pastoralKeywords,
      "sermon-resource": [...pastoralKeywords, "sermon", "preaching", "expository"],
      "christian-biography": biographyKeywords,
      "missionary-memoir": [...biographyKeywords, "missionary", "mission", "cross-cultural"],
      "theological-commentary": academicKeywords,
      "systematic-theology": [...academicKeywords, "systematic"],
      "seminary-textbook": [...academicKeywords, "textbook", "course", "seminary"],
      "hymnal": musicKeywords,
      "worship-resource": [...musicKeywords, "choir", "liturgy"],
    };

    const templateKeywords = keywordSets[template.id] ?? [];
    const matchedKeywords = templateKeywords.filter(kw => allSubjects.includes(kw));
    if (matchedKeywords.length > 0) {
      const kwScore = Math.min(40, matchedKeywords.length * 8);
      score += kwScore;
      reasons.push(`subject match: ${matchedKeywords.slice(0, 3).join(", ")}`);
    }

    scores.push({ template, score, reasons });
  }

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const confidence = Math.min(1, best.score / 100);
  const reason = best.reasons.length > 0
    ? `Matched on: ${best.reasons.join("; ")}`
    : "Default match based on general Christian publishing format";

  return { template: best.template, confidence, reason };
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/** Alias for lookupByIsbn — used in tests */
export async function lookupISBN(isbn: string): Promise<IsbnLookupResult | null> {
  try {
    return await lookupByIsbn(isbn);
  } catch {
    return null;
  }
}

export async function lookupByIsbn(isbn: string): Promise<IsbnLookupResult> {
  const cleanIsbn = isbn.replace(/[-\s]/g, "");

  if (!/^\d{10}(\d{3})?$/.test(cleanIsbn)) {
    throw new Error("Invalid ISBN format. Please enter a 10 or 13-digit ISBN.");
  }

  // Query both sources in parallel
  const [olData, gbData] = await Promise.all([
    fetchOpenLibrary(cleanIsbn),
    fetchGoogleBooks(cleanIsbn),
  ]);

  if (!olData && !gbData) {
    throw new Error(`No book found for ISBN ${isbn}. Please verify the ISBN and try again.`);
  }

  // Merge: prefer Open Library for bibliographic data, Google Books for description/cover
  const merged: Partial<IsbnLookupResult> = {
    isbn: cleanIsbn,
    title: olData?.title || gbData?.title || "Unknown Title",
    subtitle: olData?.subtitle ?? gbData?.subtitle,
    authors: olData?.authors?.length ? olData.authors : (gbData?.authors ?? []),
    publisher: olData?.publisher ?? gbData?.publisher,
    publishedYear: olData?.publishedYear ?? gbData?.publishedYear,
    pageCount: olData?.pageCount ?? gbData?.pageCount,
    dimensions: olData?.dimensions ?? gbData?.dimensions,
    widthIn: olData?.widthIn ?? gbData?.widthIn,
    heightIn: olData?.heightIn ?? gbData?.heightIn,
    description: gbData?.description ?? olData?.description,
    coverImageUrl: gbData?.coverImageUrl ?? olData?.coverImageUrl,
    subjects: Array.from(new Set([...(olData?.subjects ?? []), ...(gbData?.subjects ?? [])])),
    language: olData?.language ?? gbData?.language,
    source: olData && gbData ? "combined" : olData ? "open-library" : "google-books",
  };

  // Match to CDP template
  const { template, confidence, reason } = matchCDPTemplate(merged);

  return {
    ...merged,
    isbn: cleanIsbn,
    title: merged.title!,
    authors: merged.authors!,
    source: merged.source!,
    suggestedTemplate: template,
    matchConfidence: confidence,
    matchReason: reason,
  };
}
