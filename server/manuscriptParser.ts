/**
 * Manuscript Parser
 * Extracts plain text from a wide range of file formats:
 *
 * Document formats:  .docx, .doc, .odt, .pages
 * PDF:               .pdf
 * Spreadsheets:      .xlsx, .xls, .csv, .tsv, .numbers
 * Rich text:         .rtf
 * Web/markup:        .html, .htm, .xml
 * Markdown:          .md, .markdown, .mdx
 * Plain text:        .txt, .text, .log, .asc, .nfo
 * Data:              .json, .yaml, .yml
 */
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import * as XLSX from "xlsx";
import * as cheerio from "cheerio";

export type SupportedFormat =
  | "docx" | "pdf" | "xlsx" | "csv" | "rtf"
  | "html" | "markdown" | "txt" | "json" | "numbers" | "odt" | "epub";

export type ParsedManuscript = {
  text: string;
  wordCount: number;
  format: SupportedFormat;
};

const DOCX_MIMES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);
const XLSX_MIMES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.apple.numbers",
  "application/x-iwork-numbers-sffnumbers",
]);
const CSV_MIMES = new Set(["text/csv","text/tab-separated-values","application/csv"]);
const PDF_MIMES = new Set(["application/pdf"]);
const HTML_MIMES = new Set(["text/html","application/xhtml+xml","text/xml","application/xml"]);
const RTF_MIMES = new Set(["application/rtf","text/rtf","application/x-rtf"]);
const MARKDOWN_MIMES = new Set(["text/markdown","text/x-markdown"]);
const JSON_MIMES = new Set(["application/json","text/json"]);
const EPUB_MIMES = new Set(["application/epub+zip"]);

const EXT_FORMAT: Record<string, SupportedFormat> = {
  docx:"docx", doc:"docx", odt:"odt", pages:"docx",
  pdf:"pdf",
  xlsx:"xlsx", xls:"xlsx", numbers:"numbers", csv:"csv", tsv:"csv",
  rtf:"rtf",
  html:"html", htm:"html", xhtml:"html", xml:"html",
  md:"markdown", markdown:"markdown", mdx:"markdown",
  txt:"txt", text:"txt", log:"txt", asc:"txt", nfo:"txt",
  json:"json", yaml:"txt", yml:"txt",
  epub:"epub",
};

function detectFormat(mimeType: string, fileName: string): SupportedFormat {
  const mime = mimeType.toLowerCase().split(";")[0].trim();
  if (DOCX_MIMES.has(mime)) return "docx";
  if (PDF_MIMES.has(mime)) return "pdf";
  if (XLSX_MIMES.has(mime)) return "xlsx";
  if (CSV_MIMES.has(mime)) return "csv";
  if (HTML_MIMES.has(mime)) return "html";
  if (RTF_MIMES.has(mime)) return "rtf";
  if (MARKDOWN_MIMES.has(mime)) return "markdown";
  if (JSON_MIMES.has(mime)) return "json";
  if (EPUB_MIMES.has(mime)) return "epub";
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  return EXT_FORMAT[ext] ?? "txt";
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  return result.text.trim();
}

function parseXlsx(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const lines: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    if (csv.trim().length > 0) {
      lines.push(`=== ${sheetName} ===`);
      lines.push(csv.trim());
    }
  }
  return lines.join("\n\n");
}

function parseCsv(buffer: Buffer, fileName: string): string {
  const text = buffer.toString("utf-8");
  const isTsv = fileName.toLowerCase().endsWith(".tsv") ||
    (text.includes("\t") && !text.includes(","));
  if (isTsv) return text.replace(/\t/g, "  ").trim();
  return text.trim();
}

function parseRtf(buffer: Buffer): string {
  const rtf = buffer.toString("utf-8");
  return rtf
    .replace(/\{\\fonttbl[^}]*\}/g, "")
    .replace(/\{\\colortbl[^}]*\}/g, "")
    .replace(/\{\\stylesheet[^}]*\}/g, "")
    .replace(/\{\\info[^}]*\}/g, "")
    .replace(/\\par\b/g, "\n")
    .replace(/\\pard\b/g, "\n")
    .replace(/\\line\b/g, "\n")
    .replace(/\\[a-z*]+[-]?\d*/gi, "")
    .replace(/[{}]/g, "")
    .replace(/\\'[0-9a-f]{2}/gi, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseHtml(buffer: Buffer): string {
  const html = buffer.toString("utf-8");
  const $ = cheerio.load(html);
  $("script, style, nav, header, footer, aside").remove();
  const bodyText = $("body").length > 0 ? $("body").text() : $.text();
  return bodyText
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\t/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

function parseMarkdown(buffer: Buffer): string {
  const md = buffer.toString("utf-8");
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^>\s*/gm, "")
    .replace(/^[-*_]{3,}\s*$/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function parseEpub(buffer: Buffer): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const xhtmlFiles: { path: string; content: string }[] = [];

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const lower = path.toLowerCase();
    if (lower.endsWith(".xhtml") || lower.endsWith(".html") || lower.endsWith(".htm")) {
      const content = await entry.async("text");
      xhtmlFiles.push({ path, content });
    }
  }

  xhtmlFiles.sort((a, b) => a.path.localeCompare(b.path));

  const sections: string[] = [];
  for (const file of xhtmlFiles) {
    const $ = cheerio.load(file.content);
    $("script, style, nav, head").remove();
    const text = ($("body").length > 0 ? $("body").text() : $.text())
      .replace(/\n{3,}/g, "\n\n")
      .replace(/ {2,}/g, " ")
      .trim();
    if (text.length > 20) sections.push(text);
  }

  if (sections.length === 0) {
    return buffer.toString("utf-8").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  return sections.join("\n\n");
}

function extractStringsFromObject(obj: unknown, depth = 0): string[] {
  if (depth > 5) return [];
  if (typeof obj === "string") return [obj];
  if (Array.isArray(obj)) return obj.flatMap(v => extractStringsFromObject(v, depth + 1));
  if (obj && typeof obj === "object") {
    return Object.values(obj as Record<string, unknown>).flatMap(v =>
      extractStringsFromObject(v, depth + 1)
    );
  }
  return [];
}

function parseJson(buffer: Buffer): string {
  const raw = buffer.toString("utf-8");
  try {
    const obj = JSON.parse(raw);
    if (Array.isArray(obj)) {
      return obj.map(item =>
        typeof item === "string" ? item :
        Object.values(item as Record<string, unknown>)
          .filter(v => typeof v === "string").join(" ")
      ).join("\n\n");
    }
    return extractStringsFromObject(obj).join("\n\n");
  } catch {
    return raw.trim();
  }
}

export async function parseManuscript(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ParsedManuscript> {
  const format = detectFormat(mimeType, fileName);
  let text = "";

  switch (format) {
    case "docx":
    case "odt":
      try { text = await parseDocx(buffer); }
      catch { text = buffer.toString("utf-8").trim(); }
      break;
    case "pdf":
      text = await parsePdf(buffer);
      break;
    case "xlsx":
    case "numbers":
      text = parseXlsx(buffer);
      break;
    case "csv":
      text = parseCsv(buffer, fileName);
      break;
    case "rtf":
      text = parseRtf(buffer);
      break;
    case "html":
      text = parseHtml(buffer);
      break;
    case "markdown":
      text = parseMarkdown(buffer);
      break;
    case "json":
      text = parseJson(buffer);
      break;
    case "epub":
      try { text = await parseEpub(buffer); }
      catch { text = buffer.toString("utf-8").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
      break;
    case "txt":
    default:
      text = buffer.toString("utf-8").trim();
      break;
  }

  if (!text || text.length < 10) {
    text = buffer.toString("utf-8").trim();
  }

  return { text, wordCount: countWords(text), format };
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export const ACCEPTED_EXTENSIONS = [
  ".docx", ".doc", ".odt", ".pages",
  ".pdf",
  ".xlsx", ".xls", ".numbers", ".csv", ".tsv",
  ".rtf",
  ".html", ".htm", ".xml",
  ".md", ".markdown", ".mdx",
  ".txt", ".text", ".log", ".asc",
  ".json", ".yaml", ".yml",
  ".epub",
] as const;

export const SUPPORTED_FORMAT_GROUPS = [
  { label: "Word Processing", formats: "DOCX, DOC, ODT, Pages" },
  { label: "PDF", formats: "PDF" },
  { label: "E-book", formats: "EPUB" },
  { label: "Spreadsheets", formats: "XLSX, XLS, Numbers, CSV, TSV" },
  { label: "Rich Text", formats: "RTF" },
  { label: "Web / Markup", formats: "HTML, HTM, XML" },
  { label: "Markdown", formats: "MD, Markdown, MDX" },
  { label: "Plain Text", formats: "TXT, Text, LOG" },
  { label: "Data", formats: "JSON, YAML" },
] as const;

