/**
 * Manuscript Parser
 * Extracts plain text from .docx, .pdf, and .txt files.
 */
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export type ParsedManuscript = {
  text: string;
  wordCount: number;
  format: "docx" | "pdf" | "txt";
};

export async function parseManuscript(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ParsedManuscript> {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";

  // DOCX
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    return { text, wordCount: countWords(text), format: "docx" };
  }

  // PDF
  if (mimeType === "application/pdf" || ext === "pdf") {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    const text = result.text.trim();
    return { text, wordCount: countWords(text), format: "pdf" };
  }

  // TXT (plain text, markdown, etc.)
  const text = buffer.toString("utf-8").trim();
  return { text, wordCount: countWords(text), format: "txt" };
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
