/**
 * AI Typesetting Pipeline
 * 1. Uses LLM to detect chapters and structure the manuscript
 * 2. Generates press-ready HTML from the structured content
 * 3. Renders to PDF via Puppeteer and EPUB via epub-gen-memory
 */
import puppeteer from "puppeteer-core";
import { invokeLLM } from "./_core/llm";
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

export async function detectChapters(
  rawText: string,
  title: string,
  author: string
): Promise<ParsedBook> {
  return runStage("chapter-detection", async () => {
    // Truncate very long manuscripts to avoid token limits — process in chunks if needed
    const MAX_CHARS = 80000;
    const truncated = rawText.length > MAX_CHARS
      ? rawText.slice(0, MAX_CHARS) + "\n\n[... manuscript continues ...]"
      : rawText;

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
            content: `Title: ${title}\nAuthor: ${author}\n\nManuscript:\n\n${truncated}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 32768,
      });
    } catch (llmErr: unknown) {
      const msg = llmErr instanceof Error ? llmErr.message : String(llmErr);
      throw new Error(`LLM call failed during chapter detection: ${msg}`);
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
      console.warn(`[Stage: chapter-detection] JSON parse failed (${msg}); falling back to single-chapter mode. Raw LLM response length: ${content.length}`);
      // Fallback: treat entire text as a single chapter
      return {
        title,
        author,
        chapters: [{ number: 1, title: "Full Text", body: rawText }],
      };
    }

    if (!parsed.chapters || parsed.chapters.length === 0) {
      console.warn(`[Stage: chapter-detection] LLM returned 0 chapters; falling back to single-chapter mode. Title: "${title}", Author: "${author}"`);
      return {
        title,
        author,
        chapters: [{ number: 1, title: "Full Text", body: rawText }],
      };
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

function textToHtmlParagraphs(text: string, dropCap: boolean, isFirst: boolean): string {
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 0);
  return paragraphs.map((p, i) => {
    const escaped = escapeHtml(p.trim().replace(/\n/g, " "));
    if (dropCap && isFirst && i === 0) {
      const firstChar = escaped[0] ?? "";
      const rest = escaped.slice(1);
      return `<p class="drop-cap"><span class="drop-cap-letter">${firstChar}</span>${rest}</p>`;
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

  const chapters = book.chapters.map((ch, idx) => {
    const isFirst = idx === 0;
    const bodyHtml = isScripture
      ? textToHtmlParagraphsScripture(ch.body)
      : textToHtmlParagraphs(ch.body, style.dropCap, isFirst);
    const breakClass = style.chapterBreakStyle === "page-break" ? "page-break" : "large-space";
    // Scripture uses book/chapter heading style (e.g. "Genesis 1") instead of "Chapter N"
    const chapterLabel = isScripture
      ? (ch.title && ch.title !== `Chapter ${ch.number}` ? escapeHtml(ch.title) : `Chapter ${ch.number}`)
      : `Chapter ${ch.number}`;
    const chapterSubtitle = isScripture ? "" :
      (ch.title && ch.title !== `Chapter ${ch.number}` ? `<h1 class="chapter-title">${escapeHtml(ch.title)}</h1>` : "");
    return `
    <section class="chapter ${breakClass}" id="chapter-${ch.number}">
      <div class="chapter-heading">
        <div class="chapter-number">${chapterLabel}</div>
        ${chapterSubtitle}
      </div>
      <div class="chapter-body">
        ${bodyHtml}
      </div>
    </section>`;
  }).join("\n");

  const frontmatterHtml = book.frontmatter?.trim()
    ? `<section class="frontmatter page-break">
        <div class="chapter-body">${textToHtmlParagraphs(book.frontmatter, false, false)}</div>
      </section>`
    : "";

  const backmatterHtml = book.backmatter?.trim()
    ? `<section class="backmatter page-break">
        <div class="chapter-heading"><h1 class="chapter-title">Acknowledgements</h1></div>
        <div class="chapter-body">${textToHtmlParagraphs(book.backmatter, false, false)}</div>
      </section>`
    : "";

  const bleedMarks = "";

  const trimMetaTag = bleedOverrides
    ? `\n  <!-- KDP Print-Ready: trim ${trim.widthIn}×${trim.heightIn}in, bleed ${KDP_BLEED_IN}in outside/top/bottom -->`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(book.title)}</title>${trimMetaTag}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="${style.googleFontsUrl}" rel="stylesheet" />
  <style>
    @page {
      size: ${pageWidthIn}in ${pageHeightIn}in;
      margin-top: ${mTopIn}in;
      margin-bottom: ${mBottomIn}in;
      margin-left: ${mInsideIn}in;
      margin-right: ${mOutsideIn}in;${bleedMarks}
    }
    @page :left {
      margin-left: ${mOutsideIn}in;
      margin-right: ${mInsideIn}in;
    }
    @page :right {
      margin-left: ${mInsideIn}in;
      margin-right: ${mOutsideIn}in;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: ${pageWidthIn}in;
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize}pt;
      line-height: ${style.lineHeight};
      color: ${style.bodyColor};
      background: #ffffff;
    }
    .title-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: ${pageHeightIn - mTopIn - mBottomIn}in;
      text-align: center;
      page-break-after: always;
    }
    .title-page h1 {
      font-family: ${style.chapterHeadingFont};
      font-size: ${style.chapterHeadingSize * 1.6}pt;
      color: ${style.headingColor};
      margin-bottom: 0.5in;
      font-weight: 600;
    }
    .title-page .author {
      font-size: ${style.fontSize + 2}pt;
      color: ${style.bodyColor};
      font-style: italic;
    }
    .page-break { page-break-before: always; }
    .large-space { margin-top: 2in; }
    .chapter { padding-bottom: 0.5in; }
    .chapter-heading {
      text-align: center;
      margin-bottom: 0.4in;
      padding-top: 0.5in;
    }
    .chapter-number {
      font-family: ${style.chapterHeadingFont};
      font-size: ${style.fontSize + 1}pt;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: ${style.headingColor};
      margin-bottom: 0.1in;
    }
    .chapter-title {
      font-family: ${style.chapterHeadingFont};
      font-size: ${style.chapterHeadingSize}pt;
      font-weight: 600;
      color: ${style.headingColor};
      line-height: 1.25;
    }
    .chapter-body p {
      text-indent: 1.5em;
      margin-bottom: 0;
      text-align: justify;
      hyphens: auto;
      orphans: 2;
      widows: 2;
    }
    .chapter-body p:first-child {
      text-indent: 0;
    }
    .drop-cap { text-indent: 0 !important; }
    .drop-cap-letter {
      float: left;
      font-family: ${style.chapterHeadingFont};
      font-size: ${style.chapterHeadingSize * 2.2}pt;
      line-height: 0.75;
      padding-right: 0.05in;
      padding-top: 0.05in;
      color: ${style.headingColor};
      font-weight: 600;
    }
    .frontmatter, .backmatter { padding-bottom: 0.5in; }

    /* ── Scripture / Reference double-column layout ── */
    ${isScripture ? `
    .chapter-body {
      column-count: 2;
      column-gap: 0.25in;
      column-rule: 0.5pt solid #c8b89a;
    }
    .chapter-heading {
      column-span: all;
      text-align: center;
      border-bottom: 1pt solid #2c1a00;
      padding-bottom: 0.1in;
      margin-bottom: 0.2in;
    }
    .chapter-number {
      font-size: ${style.chapterHeadingSize}pt;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: ${style.headingColor};
    }
    .chapter-body p {
      text-indent: 0;
      margin-bottom: 0.05in;
      text-align: justify;
      hyphens: auto;
      orphans: 2;
      widows: 2;
    }
    sup.vn {
      font-size: 0.6em;
      font-weight: 700;
      color: ${style.headingColor};
      vertical-align: super;
      line-height: 0;
      margin-right: 0.05em;
      font-style: normal;
    }
    ` : ""}
  </style>
</head>
<body>
  <!-- Title Page -->
  <div class="title-page">
    <h1>${escapeHtml(book.title)}</h1>
    <div class="author">${escapeHtml(book.author)}</div>
  </div>

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
    const chromiumPath =
      process.env.CHROMIUM_PATH ||
      "/usr/lib/chromium-browser/chromium-browser";

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
        await page.setContent(html, { waitUntil: "networkidle0", timeout: 60000 });
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
    let EpubModule: { default: (...args: unknown[]) => Promise<Uint8Array> };
    try {
      EpubModule = await import("epub-gen-memory") as typeof EpubModule;
    } catch (importErr: unknown) {
      const msg = importErr instanceof Error ? importErr.message : String(importErr);
      throw new Error(`Failed to import epub-gen-memory: ${msg}`);
    }
    const Epub = EpubModule.default;

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
      content.push({
        title: ch.title || `Chapter ${ch.number}`,
        content: `<div>${ch.body.split(/\n{2,}/).map(p =>
          `<p style="text-indent:1.5em;margin:0;text-align:justify;">${escapeHtml(p.trim().replace(/\n/g, " "))}</p>`
        ).join("")}</div>`,
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
        body { font-family: ${style.fontFamily}; font-size: 1em; line-height: ${style.lineHeight}; color: ${style.bodyColor}; }
        h1 { font-family: ${style.chapterHeadingFont}; font-size: 1.5em; color: ${style.headingColor}; text-align: center; margin: 1em 0; }
        p { text-indent: 1.5em; margin: 0; text-align: justify; }
        nav#toc ol { list-style-type: none; padding-left: 0; }
        nav#toc li { margin-bottom: 0.5em; }
        nav#toc a { text-decoration: none; color: inherit; }
      `,
    };

    if (epubMeta.isbn) {
      epubOptions.identifier = epubMeta.isbn;
    }

    let epubBuffer: Uint8Array;
    try {
      epubBuffer = await Epub(
        epubOptions,
        content
      );
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
