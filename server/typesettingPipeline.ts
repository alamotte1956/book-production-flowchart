/**
 * AI Typesetting Pipeline
 * 1. Uses LLM to detect chapters and structure the manuscript
 * 2. Generates press-ready HTML from the structured content
 * 3. Renders to PDF via Puppeteer and EPUB via epub-gen-memory
 */
import puppeteer from "puppeteer-core";
import { invokeLLM as _originalInvokeLLM } from "./_core/llm";
import type { InvokeParams, InvokeResult } from "./_core/llm";

async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY || process.env.OPENAI_API_KEY || "";
  const useOpenAI = !process.env.BUILT_IN_FORGE_API_KEY && !!process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const apiUrl = process.env.BUILT_IN_FORGE_API_URL?.trim()
    ? `${process.env.BUILT_IN_FORGE_API_URL.replace(/\/$/, "")}/v1/chat/completions`
    : useOpenAI
      ? "https://api.openai.com/v1/chat/completions"
      : "https://forge.manus.im/v1/chat/completions";

  console.log(`[Pipeline invokeLLM] useOpenAI=${useOpenAI}, keyLen=${apiKey.length}, url=${apiUrl}`);

  const messages = params.messages.map((m: any) => {
    if (typeof m.content === "string") return m;
    if (Array.isArray(m.content)) {
      return {
        ...m,
        content: m.content.map((c: any) => {
          if (c.type === "text") return c;
          if (c.type === "image_url") return c;
          if (c.type === "file_url") return { type: "text", text: `[File: ${c.file_url?.url}]` };
          return c;
        }),
      };
    }
    return m;
  });

  const payload: Record<string, unknown> = {
    model: useOpenAI ? "gpt-4o" : "gemini-2.5-flash",
    messages,
    max_tokens: useOpenAI ? 16384 : 32768,
  };

  if (!useOpenAI) {
    payload.thinking = { budget_tokens: 128 };
  }

  if (params.response_format) {
    payload.response_format = params.response_format;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
  }

  return (await response.json()) as InvokeResult;
}
import { getTrimSize, getTypesettingStyle, type TrimSize, type TypesettingStyle } from "./typesettingStyles";

export type Chapter = {
  number: number;
  title: string;
  body: string; // HTML-safe text
};

export type ParsedBook = {
  title: string;
  author: string;
  chapters: Chapter[];
  frontmatter?: string;
  backmatter?: string;
};

export type ProduceOptions = {
  trimSizeId: string;
  styleId: string;
  title: string;
  author: string;
  includeBleed?: boolean;
  estimatedPageCount?: number;
  isbn?: string;
  publisher?: string;
  description?: string;
};

export type ProduceResult = {
  pdfBuffer: Buffer;
  epubBuffer: Buffer;
  printReadyPdfBuffer?: Buffer;
  chapterCount: number;
  wordCount: number;
  parsedBook: ParsedBook;
  trimSize: TrimSize;
  style: TypesettingStyle;
};

const KDP_BLEED_IN = 0.125;

function getKdpMinInsideMargin(pageCount: number): number {
  if (pageCount >= 400) return 1.0;
  if (pageCount >= 150) return 0.75;
  return 0.375;
}

export type KdpTrimOverrides = {
  widthIn: number;
  heightIn: number;
  marginTopIn: number;
  marginBottomIn: number;
  marginInsideIn: number;
  marginOutsideIn: number;
};

export function computeKdpBleedTrim(trim: TrimSize, estimatedPageCount: number): KdpTrimOverrides {
  const minInside = getKdpMinInsideMargin(estimatedPageCount);
  const marginInsideIn = Math.max(trim.marginInsideIn, minInside);
  const marginOutsideIn = Math.max(trim.marginOutsideIn, 0.25);
  const marginTopIn = Math.max(trim.marginTopIn, 0.25);
  const marginBottomIn = Math.max(trim.marginBottomIn, 0.25);

  return {
    widthIn: trim.widthIn + KDP_BLEED_IN,
    heightIn: trim.heightIn + 2 * KDP_BLEED_IN,
    marginTopIn: marginTopIn + KDP_BLEED_IN,
    marginBottomIn: marginBottomIn + KDP_BLEED_IN,
    marginInsideIn,
    marginOutsideIn: marginOutsideIn + KDP_BLEED_IN,
  };
}

// ─── Pipeline stage error wrapper ────────────────────────────────────────────

/**
 * Wraps an async operation in a named pipeline stage.
 * On failure it re-throws an Error whose message is prefixed with
 * "[Stage: <stageName>] " so the caller can identify the failure point.
 * The original stack is preserved via the `cause` property.
 */
async function runStage<T>(stageName: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const original = err instanceof Error ? err : new Error(String(err));
    // Don't double-wrap if already staged
    if (original.message.startsWith('[Stage:')) throw original;
    const wrapped = new Error(`[Stage: ${stageName}] ${original.message}`);
    wrapped.stack = `[Stage: ${stageName}]\n${original.stack ?? original.message}`;
    (wrapped as Error & { cause?: unknown }).cause = original;
    throw wrapped;
  }
}

// ─── Step 1: LLM Chapter Detection ──────────────────────────────────────────

const CHAPTER_HEADING_RE = /^(?:\s*(?:chapter|ch\.?)\s+(?:\d+|[ivxlcdm]+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)(?:\s*[:.–—-]\s*.*)?|part\s+(?:\d+|[ivxlcdm]+)(?:\s*[:.–—-]\s*.*)?|\d+\s*[:.–—]\s*.+)$/im;

function splitChaptersByRegex(rawText: string, title: string, author: string): ParsedBook {
  const lines = rawText.split(/\r?\n/);
  const chapterStarts: { index: number; heading: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.length > 0 && trimmed.length < 200 && CHAPTER_HEADING_RE.test(trimmed)) {
      chapterStarts.push({ index: i, heading: trimmed });
    }
  }

  if (chapterStarts.length === 0) {
    const LINES_PER_CHUNK = 2500;
    const chapters: ParsedBook["chapters"] = [];
    for (let start = 0; start < lines.length; start += LINES_PER_CHUNK) {
      const chunkLines = lines.slice(start, start + LINES_PER_CHUNK);
      chapters.push({
        number: chapters.length + 1,
        title: `Section ${chapters.length + 1}`,
        body: chunkLines.join("\n"),
      });
    }
    return { title, author, chapters };
  }

  let frontmatter = "";
  if (chapterStarts[0].index > 0) {
    frontmatter = lines.slice(0, chapterStarts[0].index).join("\n").trim();
  }

  const chapters: ParsedBook["chapters"] = [];
  for (let c = 0; c < chapterStarts.length; c++) {
    const startLine = chapterStarts[c].index + 1;
    const endLine = c + 1 < chapterStarts.length ? chapterStarts[c + 1].index : lines.length;
    const body = lines.slice(startLine, endLine).join("\n").trim();
    const heading = chapterStarts[c].heading;

    let chapterTitle = heading;
    const titleMatch = heading.match(/^(?:chapter|ch\.?)\s+(?:\d+|[ivxlcdm]+|\w+)\s*[:.–—-]\s*(.+)$/i);
    if (titleMatch) chapterTitle = titleMatch[1].trim();

    chapters.push({
      number: c + 1,
      title: chapterTitle,
      body,
    });
  }

  let backmatter = "";
  const lastChapter = chapters[chapters.length - 1];
  if (lastChapter) {
    const backPatterns = /^(?:epilogue|afterword|acknowledgements?|appendix|about the author|bibliography|notes|index)\b/im;
    const bodyLines = lastChapter.body.split(/\r?\n/);
    for (let i = 0; i < bodyLines.length; i++) {
      if (backPatterns.test(bodyLines[i].trim())) {
        backmatter = bodyLines.slice(i).join("\n").trim();
        lastChapter.body = bodyLines.slice(0, i).join("\n").trim();
        break;
      }
    }
  }

  return { title, author, frontmatter, chapters, backmatter };
}

export async function detectChapters(
  rawText: string,
  title: string,
  author: string
): Promise<ParsedBook> {
  return runStage("chapter-detection", async () => {
    const LLM_CHAR_LIMIT = 80000;

    if (rawText.length > LLM_CHAR_LIMIT) {
      console.log(`[Stage: chapter-detection] Manuscript is ${rawText.length} chars (>${LLM_CHAR_LIMIT}), using regex-based chapter splitting for full content`);
      const result = splitChaptersByRegex(rawText, title, author);
      console.log(`[Stage: chapter-detection] Regex split found ${result.chapters.length} chapters from ${rawText.length} chars`);
      return result;
    }

    let response: Awaited<ReturnType<typeof invokeLLM>>;
    try {
      response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a professional book typesetter. Your job is to parse a raw manuscript and extract its structure.
Identify chapters by looking for patterns like "Chapter 1", "CHAPTER ONE", "Part I", numbered sections, or clear thematic breaks.
Return a JSON object with this exact structure:
{
  "title": "Book title (use provided title if not found in text)",
  "author": "Author name (use provided author if not found in text)",
  "frontmatter": "Any preface, foreword, introduction text (plain text, may be empty string)",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title or 'Chapter 1' if untitled",
      "body": "Full chapter text as plain text paragraphs separated by double newlines"
    }
  ],
  "backmatter": "Any epilogue, afterword, acknowledgements (plain text, may be empty string)"
}
Preserve all paragraph breaks. Do not summarize or shorten any text. Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Title: ${title}\nAuthor: ${author}\n\nManuscript:\n\n${rawText}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 32768,
      });
    } catch (llmErr: unknown) {
      const msg = llmErr instanceof Error ? llmErr.message : String(llmErr);
      console.warn(`[Stage: chapter-detection] LLM failed (${msg}); falling back to regex-based splitting`);
      return splitChaptersByRegex(rawText, title, author);
    }

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string" || content.trim() === "") {
      throw new Error("LLM returned empty or non-string content for chapter detection");
    }

    let parsed: ParsedBook;
    try {
      parsed = JSON.parse(content) as ParsedBook;
    } catch (parseErr: unknown) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      console.warn(`[Stage: chapter-detection] JSON parse failed (${msg}); falling back to regex-based splitting`);
      return splitChaptersByRegex(rawText, title, author);
    }

    if (!parsed.chapters || parsed.chapters.length === 0) {
      console.warn(`[Stage: chapter-detection] LLM returned 0 chapters; falling back to regex-based splitting`);
      return splitChaptersByRegex(rawText, title, author);
    }

    return parsed;
  });
}

// ─── Step 2: HTML Generation ─────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function smartTypography(text: string): string {
  let s = text;
  s = s.replace(/---/g, "\u2014");
  s = s.replace(/--/g, "\u2013");
  s = s.replace(/\.\.\./g, "\u2026");
  s = s.replace(/(^|[\s([\u201C])"/g, "$1\u201C");
  s = s.replace(/"/g, "\u201D");
  s = s.replace(/(^|[\s([\u2018])'/g, "$1\u2018");
  s = s.replace(/'/g, "\u2019");
  return s;
}

function textToHtmlParagraphs(text: string, dropCap: boolean, isFirstChapter: boolean): string {
  const blocks = text.split(/\n{2,}/).filter(p => p.trim().length > 0);
  const SCENE_BREAK_RE = /^(\*\s*\*\s*\*|#\s*#\s*#|~\s*~\s*~|-\s*-\s*-|—\s*—\s*—|\* \* \*|§)$/;

  return blocks.map((p, i) => {
    const trimmed = p.trim().replace(/\n/g, " ");
    if (SCENE_BREAK_RE.test(trimmed)) {
      return `<div class="scene-break" role="separator"><span class="scene-break-ornament">\u2042</span></div>`;
    }
    const escaped = smartTypography(escapeHtml(trimmed));
    const isFirstPara = i === 0;
    if (dropCap && isFirstChapter && isFirstPara && escaped.length > 1) {
      const firstChar = escaped[0] ?? "";
      const rest = escaped.slice(1);
      return `<p class="first-para drop-cap"><span class="drop-cap-letter">${firstChar}</span>${rest}</p>`;
    }
    if (isFirstPara) {
      return `<p class="first-para">${escaped}</p>`;
    }
    return `<p>${escaped}</p>`;
  }).join("\n");
}

/**
 * Converts a paragraph of scripture text into HTML with inline verse numbers.
 * Verse numbers are detected as patterns like "1 ", "2 ", "10 " at the start of
 * sentences or after a period/newline. They are wrapped in <sup class="vn"> tags.
 *
 * Input example:  "1 In the beginning God created... 2 And the earth was..."
 * Output example: "<sup class='vn'>1</sup> In the beginning... <sup class='vn'>2</sup> And..."
 */
function renderVerseText(text: string): string {
  // Match verse numbers: a number (1-3 digits) followed by a space at the start
  // of the text or after a sentence boundary
  const escaped = escapeHtml(text.trim().replace(/\n/g, " "));
  // Replace patterns like "1 " at start, or " 2 " mid-sentence (preceded by space)
  return escaped.replace(
    /(^|(?<=\s))(\d{1,3})(?=\s)/g,
    (_, pre, num) => `${pre}<sup class="vn">${num}</sup>`
  );
}

function textToHtmlParagraphsScripture(text: string): string {
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 0);
  return paragraphs.map(p => {
    const withVerses = renderVerseText(p);
    return `<p>${withVerses}</p>`;
  }).join("\n");
}

export function generateBookHtml(
  book: ParsedBook,
  trim: TrimSize,
  style: TypesettingStyle,
  bleedOverrides?: KdpTrimOverrides
): string {
  const pageWidthIn = bleedOverrides?.widthIn ?? trim.widthIn;
  const pageHeightIn = bleedOverrides?.heightIn ?? trim.heightIn;
  const mTopIn = bleedOverrides?.marginTopIn ?? trim.marginTopIn;
  const mBottomIn = bleedOverrides?.marginBottomIn ?? trim.marginBottomIn;
  const mInsideIn = bleedOverrides?.marginInsideIn ?? trim.marginInsideIn;
  const mOutsideIn = bleedOverrides?.marginOutsideIn ?? trim.marginOutsideIn;

  const isScripture = style.doubleColumn && style.verseNumbers;

  const textAreaHeight = pageHeightIn - mTopIn - mBottomIn;
  const chapterDropIn = Math.min(textAreaHeight * 0.3, 2.5);
  const headingBaseFontPt = style.chapterHeadingSize;
  const chapterNumFontPt = Math.round(headingBaseFontPt * 0.65);
  const titleFontPt = headingBaseFontPt;
  const dropCapFontPt = Math.round(headingBaseFontPt * 3);
  const dropCapLines = 3;

  const chapters = book.chapters.map((ch, idx) => {
    const isFirst = idx === 0;
    const bodyHtml = isScripture
      ? textToHtmlParagraphsScripture(ch.body)
      : textToHtmlParagraphs(ch.body, style.dropCap, isFirst);
    const breakClass = style.chapterBreakStyle === "page-break" ? "page-break" : "large-space";
    const chapterLabel = isScripture
      ? (ch.title && ch.title !== `Chapter ${ch.number}` ? escapeHtml(ch.title) : `Chapter ${ch.number}`)
      : `Chapter ${ch.number}`;
    const hasCustomTitle = !isScripture && ch.title && ch.title !== `Chapter ${ch.number}` && ch.title !== `Section ${ch.number}`;
    const chapterSubtitle = hasCustomTitle
      ? `<h2 class="chapter-title">${smartTypography(escapeHtml(ch.title))}</h2>` : "";
    const ornament = isScripture ? "" : `<div class="chapter-ornament">\u2767</div>`;
    return `
    <section class="chapter ${breakClass}" id="chapter-${ch.number}">
      <div class="chapter-heading">
        <div class="chapter-number">${chapterLabel}</div>
        ${chapterSubtitle}
        ${ornament}
      </div>
      <div class="chapter-body">
        ${bodyHtml}
      </div>
    </section>`;
  }).join("\n");

  const year = new Date().getFullYear();

  const halfTitleHtml = `
  <div class="half-title-page">
    <div class="half-title-text">${smartTypography(escapeHtml(book.title))}</div>
  </div>`;

  const copyrightHtml = `
  <div class="copyright-page">
    <p class="copyright-title">${smartTypography(escapeHtml(book.title))}</p>
    <p class="copyright-line">&copy; ${year} ${smartTypography(escapeHtml(book.author))}. All rights reserved.</p>
    <p class="copyright-line">No part of this publication may be reproduced, distributed, or transmitted in any form without the prior written permission of the author, except for brief quotations in reviews.</p>
    <p class="copyright-line">Published by Easy Book Publishers</p>
    <p class="copyright-line">Typeset with Easy Book Publishers &mdash; easybookpublishers.com</p>
  </div>`;

  const frontmatterHtml = book.frontmatter?.trim()
    ? `<section class="frontmatter page-break">
        <div class="chapter-body fm-body">${textToHtmlParagraphs(book.frontmatter, false, false)}</div>
      </section>`
    : "";

  const backmatterHtml = book.backmatter?.trim()
    ? `<section class="backmatter page-break">
        <div class="chapter-heading bm-heading">
          <div class="chapter-ornament">\u2767</div>
          <h2 class="chapter-title">Acknowledgements</h2>
        </div>
        <div class="chapter-body bm-body">${textToHtmlParagraphs(book.backmatter, false, false)}</div>
      </section>`
    : "";

  const trimMetaTag = bleedOverrides
    ? `\n  <!-- KDP Print-Ready: trim ${trim.widthIn}\u00D7${trim.heightIn}in, bleed ${KDP_BLEED_IN}in outside/top/bottom -->`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(book.title)}</title>${trimMetaTag}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${style.googleFontsUrl}" rel="stylesheet" />
  <style>
    @page {
      size: ${pageWidthIn}in ${pageHeightIn}in;
      margin-top: ${mTopIn}in;
      margin-bottom: ${mBottomIn}in;
      margin-left: ${mInsideIn}in;
      margin-right: ${mOutsideIn}in;
    }
    @page :left {
      margin-left: ${mOutsideIn}in;
      margin-right: ${mInsideIn}in;
    }
    @page :right {
      margin-left: ${mInsideIn}in;
      margin-right: ${mOutsideIn}in;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: ${pageWidthIn}in;
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize}pt;
      line-height: ${style.lineHeight};
      color: ${style.bodyColor};
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "onum" 1;
      font-kerning: normal;
    }

    /* ── Half-Title Page ── */
    .half-title-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: ${textAreaHeight}in;
      text-align: center;
      page-break-after: always;
    }
    .half-title-text {
      font-family: ${style.chapterHeadingFont};
      font-size: ${headingBaseFontPt * 1.2}pt;
      color: ${style.headingColor};
      letter-spacing: 0.04em;
      font-weight: 400;
    }

    /* ── Title Page ── */
    .title-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: ${textAreaHeight}in;
      text-align: center;
      page-break-after: always;
    }
    .title-page-rule {
      width: 2in;
      height: 0;
      border: none;
      border-top: 0.75pt solid ${style.headingColor};
      margin: 0.35in auto;
      opacity: 0.6;
    }
    .title-page h1 {
      font-family: ${style.chapterHeadingFont};
      font-size: ${headingBaseFontPt * 1.8}pt;
      color: ${style.headingColor};
      font-weight: 600;
      letter-spacing: 0.03em;
      line-height: 1.2;
      margin-bottom: 0;
    }
    .title-page .subtitle {
      font-family: ${style.chapterHeadingFont};
      font-size: ${headingBaseFontPt * 0.75}pt;
      color: ${style.headingColor};
      font-weight: 400;
      font-style: italic;
      letter-spacing: 0.02em;
      margin-top: 0.15in;
    }
    .title-page .author {
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize + 2}pt;
      color: ${style.bodyColor};
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 400;
    }
    .title-page .publisher-mark {
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize - 1}pt;
      color: ${style.bodyColor};
      opacity: 0.5;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 1in;
    }

    /* ── Copyright Page ── */
    .copyright-page {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: ${textAreaHeight}in;
      padding-bottom: 0.5in;
      page-break-after: always;
    }
    .copyright-title {
      font-family: ${style.chapterHeadingFont};
      font-size: ${style.fontSize}pt;
      font-weight: 600;
      font-style: italic;
      color: ${style.headingColor};
      margin-bottom: 0.2in;
    }
    .copyright-line {
      font-size: ${Math.max(style.fontSize - 2, 7.5)}pt;
      line-height: 1.6;
      color: ${style.bodyColor};
      margin-bottom: 0.08in;
    }

    /* ── Chapter Layout ── */
    .page-break { page-break-before: always; }
    .large-space { margin-top: ${chapterDropIn}in; }
    .chapter { padding-bottom: 0.3in; }

    .chapter-heading {
      text-align: center;
      margin-bottom: 0.5in;
      padding-top: ${chapterDropIn}in;
    }
    .chapter-number {
      font-family: ${style.chapterHeadingFont};
      font-size: ${chapterNumFontPt}pt;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: ${style.headingColor};
      font-weight: 400;
      margin-bottom: 0.15in;
    }
    .chapter-title {
      font-family: ${style.chapterHeadingFont};
      font-size: ${titleFontPt}pt;
      font-weight: 600;
      color: ${style.headingColor};
      line-height: 1.3;
      margin-top: 0.08in;
      margin-bottom: 0;
    }
    .chapter-ornament {
      font-size: ${Math.round(style.fontSize * 1.1)}pt;
      color: ${style.headingColor};
      opacity: 0.4;
      margin-top: 0.15in;
      letter-spacing: 0.3em;
    }

    /* ── Body Text ── */
    .chapter-body p {
      text-indent: 1.5em;
      margin-bottom: 0;
      text-align: justify;
      hyphens: auto;
      -webkit-hyphens: auto;
      orphans: 3;
      widows: 3;
      word-spacing: -0.02em;
    }
    .chapter-body p.first-para {
      text-indent: 0;
    }

    /* ── Scene Break ── */
    .scene-break {
      text-align: center;
      margin: 0.4in 0;
      line-height: 1;
    }
    .scene-break-ornament {
      font-size: ${style.fontSize + 2}pt;
      color: ${style.headingColor};
      opacity: 0.45;
      letter-spacing: 0.5em;
    }

    /* ── Drop Cap ── */
    .drop-cap { text-indent: 0 !important; }
    .drop-cap-letter {
      float: left;
      font-family: ${style.chapterHeadingFont};
      font-size: ${dropCapFontPt}pt;
      line-height: ${1.0 / dropCapLines * dropCapLines * 0.82};
      padding-right: 0.06in;
      margin-top: 0.04in;
      color: ${style.headingColor};
      font-weight: 600;
    }

    /* ── Front/Back Matter ── */
    .frontmatter, .backmatter { padding-bottom: 0.5in; }
    .fm-body p, .bm-body p {
      text-indent: 0;
      margin-bottom: 0.12in;
    }
    .bm-heading {
      padding-top: ${chapterDropIn}in;
    }

    /* ── Scripture / Reference double-column layout ── */
    ${isScripture ? `
    .chapter-body {
      column-count: 2;
      column-gap: 0.25in;
      column-rule: 0.4pt solid ${style.headingColor}33;
    }
    .chapter-heading {
      column-span: all;
      text-align: center;
      border-bottom: 0.5pt solid ${style.headingColor}44;
      padding-bottom: 0.1in;
      margin-bottom: 0.2in;
      padding-top: 0.3in;
    }
    .chapter-number {
      font-size: ${style.chapterHeadingSize}pt;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: ${style.headingColor};
    }
    .chapter-ornament { display: none; }
    .chapter-body p {
      text-indent: 0;
      margin-bottom: 0.04in;
      text-align: justify;
      hyphens: auto;
      -webkit-hyphens: auto;
      orphans: 2;
      widows: 2;
    }
    sup.vn {
      font-size: 0.58em;
      font-weight: 700;
      color: ${style.headingColor};
      vertical-align: super;
      line-height: 0;
      margin-right: 0.04em;
      margin-left: 0.02em;
      font-style: normal;
    }
    ` : ""}
  </style>
</head>
<body>
  ${halfTitleHtml}

  <!-- Title Page -->
  <div class="title-page">
    <h1>${smartTypography(escapeHtml(book.title))}</h1>
    <hr class="title-page-rule" />
    <div class="author">${smartTypography(escapeHtml(book.author))}</div>
    <div class="publisher-mark">Easy Book Publishers</div>
  </div>

  ${copyrightHtml}
  ${frontmatterHtml}
  ${chapters}
  ${backmatterHtml}
</body>
</html>`;
}

// ─── Step 3: PDF Rendering via Puppeteer ─────────────────────────────────────

export async function renderToPdf(html: string, trim: TrimSize, bleedOverrides?: KdpTrimOverrides): Promise<Buffer> {
  return runStage("pdf-rendering", async () => {
    // /usr/bin/chromium-browser is a shell wrapper; puppeteer-core v24+ requires the actual binary
    const chromiumPath = await (async () => {
      if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
      const fs = await import("fs");
      const candidates = [
        "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/lib/chromium-browser/chromium-browser",
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) return c;
      }
      return "chromium";
    })();

    let browser: Awaited<ReturnType<typeof puppeteer.launch>>;
    try {
      browser = await puppeteer.launch({
        executablePath: chromiumPath,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--font-render-hinting=none",
        ],
        headless: true,
      });
    } catch (launchErr: unknown) {
      const msg = launchErr instanceof Error ? launchErr.message : String(launchErr);
      throw new Error(`Chromium browser failed to launch (path: ${chromiumPath}): ${msg}`);
    }

    try {
      const page = await browser.newPage();

      try {
        await page.setContent(html, { waitUntil: "networkidle0", timeout: 300000 });
      } catch (contentErr: unknown) {
        const msg = contentErr instanceof Error ? contentErr.message : String(contentErr);
        throw new Error(`Page content load timed out or failed: ${msg}`);
      }

      // Wait for fonts to load
      await page.evaluateHandle("document.fonts.ready");

      const pW = bleedOverrides?.widthIn ?? trim.widthIn;
      const pH = bleedOverrides?.heightIn ?? trim.heightIn;
      const pMT = bleedOverrides?.marginTopIn ?? trim.marginTopIn;
      const pMB = bleedOverrides?.marginBottomIn ?? trim.marginBottomIn;
      const pML = bleedOverrides?.marginInsideIn ?? trim.marginInsideIn;
      const pMR = bleedOverrides?.marginOutsideIn ?? trim.marginOutsideIn;

      const isKdpPrint = !!bleedOverrides;

      let pdfBuffer: Uint8Array;
      try {
        pdfBuffer = await page.pdf({
          width: `${pW}in`,
          height: `${pH}in`,
          printBackground: true,
          margin: {
            top: `${pMT}in`,
            bottom: `${pMB}in`,
            left: `${pML}in`,
            right: `${pMR}in`,
          },
          displayHeaderFooter: !isKdpPrint,
          ...(isKdpPrint ? {} : {
            headerTemplate: `<div style="font-size:8pt;font-family:serif;width:100%;text-align:center;color:#555;padding:0 ${pML}in;"></div>`,
            footerTemplate: `<div style="font-size:8pt;font-family:serif;width:100%;text-align:center;color:#555;padding:0 ${pML}in;"><span class="pageNumber"></span></div>`,
          }),
        });
      } catch (pdfErr: unknown) {
        const msg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
        throw new Error(`Puppeteer PDF generation failed (trim: ${pW}×${pH}in): ${msg}`);
      }

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close().catch(() => { /* ignore close errors */ });
    }
  });
}

// ─── Step 4: EPUB Generation ─────────────────────────────────────────────────

export type EpubMetadata = {
  isbn?: string;
  publisher?: string;
  description?: string;
};

function generateCopyrightPageHtml(book: ParsedBook, meta: EpubMetadata): string {
  const year = new Date().getFullYear();
  const publisher = meta.publisher || "Easy Book Publishers";
  const lines = [
    `<div style="text-align:center;margin-top:2em;">`,
    `<p style="font-size:1.2em;font-weight:bold;margin-bottom:1em;">${escapeHtml(book.title)}</p>`,
    `<p style="margin-bottom:2em;">by ${escapeHtml(book.author)}</p>`,
    `<p style="margin-bottom:0.5em;">&copy; ${year} ${escapeHtml(book.author)}. All rights reserved.</p>`,
    `<p style="margin-bottom:0.5em;">Published by ${escapeHtml(publisher)}</p>`,
  ];
  if (meta.isbn) {
    lines.push(`<p style="margin-bottom:0.5em;">ISBN: ${escapeHtml(meta.isbn)}</p>`);
  }
  lines.push(
    `<p style="margin-bottom:0.5em;font-size:0.85em;">No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.</p>`,
    `</div>`
  );
  return lines.join("\n");
}

function generateTocNavHtml(chapters: Array<{ title?: string; content: string }>): string {
  const items = chapters.map((ch, i) =>
    `<li><a href="chapter-${i}.xhtml">${escapeHtml(ch.title || `Chapter ${i}`)}</a></li>`
  ).join("\n      ");
  return `<nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      ${items}
    </ol>
  </nav>`;
}

export async function renderToEpub(book: ParsedBook, style: TypesettingStyle, meta?: EpubMetadata): Promise<Buffer> {
  return runStage("epub-generation", async () => {
    const epubMeta = meta || {};
    let Epub: (...args: unknown[]) => Promise<Uint8Array>;
    try {
      const EpubModule = await import("epub-gen-memory");
      Epub = EpubModule.EPub || EpubModule.default?.EPub || EpubModule.default;
      if (typeof Epub !== "function") {
        throw new Error(`EPub export is ${typeof Epub}, not a function. Keys: ${Object.keys(EpubModule).join(", ")}`);
      }
    } catch (importErr: unknown) {
      const msg = importErr instanceof Error ? importErr.message : String(importErr);
      throw new Error(`Failed to import epub-gen-memory: ${msg}`);
    }

    const content: Array<{ title?: string; content: string }> = [];

    content.push({
      title: "Copyright",
      content: generateCopyrightPageHtml(book, epubMeta),
    });

    content.push({
      title: "Table of Contents",
      content: generateTocNavHtml(
        book.chapters.map(ch => ({
          title: ch.title || `Chapter ${ch.number}`,
          content: "",
        }))
      ),
    });

    if (book.frontmatter?.trim()) {
      content.push({
        title: "Introduction",
        content: `<div>${book.frontmatter.split(/\n{2,}/).map(p =>
          `<p style="text-indent:1.5em;margin:0;">${escapeHtml(p.trim())}</p>`
        ).join("")}</div>`,
      });
    }

    for (const ch of book.chapters) {
      const SCENE_BREAK_RE = /^(\*\s*\*\s*\*|#\s*#\s*#|~\s*~\s*~|-\s*-\s*-|—\s*—\s*—|\* \* \*|§)$/;
      const chapterHtml = ch.body.split(/\n{2,}/).map((p, pi) => {
        const trimmed = p.trim().replace(/\n/g, " ");
        if (SCENE_BREAK_RE.test(trimmed)) {
          return `<p style="text-align:center;margin:1.5em 0;font-size:1.2em;letter-spacing:0.5em;opacity:0.4;">\u2042</p>`;
        }
        const escaped = smartTypography(escapeHtml(trimmed));
        if (pi === 0) return `<p style="margin:0;text-align:justify;">${escaped}</p>`;
        return `<p style="text-indent:1.5em;margin:0;text-align:justify;">${escaped}</p>`;
      }).join("");
      content.push({
        title: ch.title || `Chapter ${ch.number}`,
        content: `<div>${chapterHtml}</div>`,
      });
    }

    if (book.backmatter?.trim()) {
      content.push({
        title: "Acknowledgements",
        content: `<div>${book.backmatter.split(/\n{2,}/).map(p =>
          `<p style="text-indent:1.5em;margin:0;">${escapeHtml(p.trim())}</p>`
        ).join("")}</div>`,
      });
    }

    const publisher = epubMeta.publisher || "Easy Book Publishers";
    const description = epubMeta.description || `${book.title} by ${book.author}`;
    const publishDate = new Date().toISOString().split("T")[0];

    const epubOptions: Record<string, unknown> = {
      title: book.title,
      author: book.author,
      publisher,
      description,
      lang: "en",
      date: publishDate,
      css: `
        body {
          font-family: ${style.fontFamily};
          font-size: 1em;
          line-height: ${style.lineHeight};
          color: ${style.bodyColor};
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          orphans: 3;
          widows: 3;
        }
        h1, h2 {
          font-family: ${style.chapterHeadingFont};
          color: ${style.headingColor};
          text-align: center;
          page-break-after: avoid;
          margin-top: 2em;
          margin-bottom: 0.3em;
          line-height: 1.3;
        }
        h1 { font-size: 1.4em; font-weight: 600; letter-spacing: 0.02em; }
        h2 { font-size: 1.1em; font-weight: 400; font-style: italic; margin-top: 0.2em; }
        p { text-indent: 1.5em; margin: 0; text-align: justify; hyphens: auto; -webkit-hyphens: auto; }
        p:first-of-type { text-indent: 0; }
        nav#toc ol { list-style-type: none; padding-left: 0; }
        nav#toc li { margin-bottom: 0.6em; }
        nav#toc a { text-decoration: none; color: inherit; font-family: ${style.chapterHeadingFont}; }
      `,
    };

    if (epubMeta.isbn) {
      epubOptions.identifier = epubMeta.isbn;
    }

    let epubBuffer: Uint8Array;
    try {
      const epub = new (Epub as new (options: Record<string, unknown>, content: Array<{ title?: string; content: string }>) => { genEpub: () => Promise<Uint8Array> })(epubOptions, content);
      epubBuffer = await epub.genEpub();
    } catch (epubErr: unknown) {
      const msg = epubErr instanceof Error ? epubErr.message : String(epubErr);
      throw new Error(`epub-gen-memory failed (title: "${book.title}", chapters: ${book.chapters.length}): ${msg}`);
    }

    return Buffer.from(epubBuffer);
  });
}

// ─── Main Pipeline Entry Point ────────────────────────────────────────────────

export async function produceBook(
  rawText: string,
  options: ProduceOptions
): Promise<ProduceResult> {
  let trim: TrimSize;
  let style: TypesettingStyle;

  try {
    trim = getTrimSize(options.trimSizeId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`[Stage: config-resolution] Invalid trim size ID "${options.trimSizeId}": ${msg}`);
  }

  try {
    style = getTypesettingStyle(options.styleId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`[Stage: config-resolution] Invalid typesetting style ID "${options.styleId}": ${msg}`);
  }

  // Step 1: Parse chapters with AI
  const book = await detectChapters(rawText, options.title, options.author);

  // Step 2: Generate screen HTML (synchronous — wrap in try/catch for safety)
  let html: string;
  try {
    html = generateBookHtml(book, trim!, style!);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`[Stage: html-generation] Failed to build book HTML: ${msg}`);
  }

  const includeBleed = options.includeBleed ?? true;
  const wordCount = book.chapters.reduce(
    (acc, ch) => acc + ch.body.split(/\s+/).filter(Boolean).length,
    0
  );
  const estimatedPageCount = options.estimatedPageCount ?? Math.ceil(wordCount / 250);

  // Step 3: Render PDF and EPUB — the individual stage wrappers already prefix
  // the message with [Stage: ...] so the caller can identify the failure point.
  const renderTasks: Promise<Buffer>[] = [
    renderToPdf(html, trim!),
    renderToEpub(book, style!, {
      isbn: options.isbn,
      publisher: options.publisher,
      description: options.description,
    }),
  ];

  let printReadyPdfPromise: Promise<Buffer> | undefined;
  if (includeBleed) {
    const bleedOverrides = computeKdpBleedTrim(trim!, estimatedPageCount);
    let bleedHtml: string;
    try {
      bleedHtml = generateBookHtml(book, trim!, style!, bleedOverrides);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`[Stage: html-generation-kdp] Failed to build KDP bleed HTML: ${msg}`);
    }
    printReadyPdfPromise = renderToPdf(bleedHtml, trim!, bleedOverrides);
    renderTasks.push(printReadyPdfPromise);
  }

  const results = await Promise.all(renderTasks);
  const pdfBuffer = results[0];
  const epubBuffer = results[1];
  const printReadyPdfBuffer = includeBleed ? results[2] : undefined;

  return {
    pdfBuffer,
    epubBuffer,
    printReadyPdfBuffer,
    chapterCount: book.chapters.length,
    wordCount,
    parsedBook: book,
    trimSize: trim!,
    style: style!,
  };
}
