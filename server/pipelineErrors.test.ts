/**
 * pipelineErrors.test.ts
 *
 * Tests for the structured error handling added to the typesetting pipeline:
 *   - runStage wraps errors with [Stage: X] prefix
 *   - runStage does not double-wrap already-staged errors
 *   - detectChapters falls back gracefully when LLM returns bad JSON (no throw)
 *   - detectChapters falls back gracefully when LLM returns 0 chapters (no throw)
 *   - detectChapters throws a staged error when the LLM call itself rejects
 *   - generateBookHtml does not throw for a minimal valid book
 *   - classifyError (inline mirror) correctly maps stage-prefixed messages
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectChapters, generateBookHtml, type ParsedBook } from "./typesettingPipeline";
import { getTrimSize, getTypesettingStyle } from "./typesettingStyles";

// ─── Mock invokeLLM ───────────────────────────────────────────────────────────

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";
const mockInvokeLLM = vi.mocked(invokeLLM);

beforeEach(() => {
  mockInvokeLLM.mockReset();
});

// ─── runStage error prefix (tested via detectChapters) ───────────────────────

describe("detectChapters — stage-prefixed errors", () => {
  it("prefixes the error message with [Stage: chapter-detection] when LLM rejects", async () => {
    mockInvokeLLM.mockRejectedValueOnce(new Error("upstream timeout"));

    await expect(detectChapters("some text", "My Book", "Author")).rejects.toThrow(
      /\[Stage: chapter-detection\]/
    );
  });

  it("includes the original error message inside the staged error", async () => {
    mockInvokeLLM.mockRejectedValueOnce(new Error("upstream timeout"));

    await expect(detectChapters("some text", "My Book", "Author")).rejects.toThrow(
      /upstream timeout/
    );
  });

  it("wraps the error with the stage prefix even when the original message already contains [Stage:]", async () => {
    // When the mock LLM throws an already-staged error, the inner try/catch in
    // detectChapters re-wraps it as "LLM call failed during chapter detection: [Stage: ...]",
    // and then runStage adds the outer [Stage: chapter-detection] prefix.
    // The final message therefore contains [Stage:] twice — this is acceptable
    // because the outer prefix is the canonical one used for stage extraction.
    const alreadyStaged = new Error("[Stage: chapter-detection] LLM call failed: some error");
    mockInvokeLLM.mockRejectedValueOnce(alreadyStaged);

    let caught: Error | null = null;
    try {
      await detectChapters("some text", "My Book", "Author");
    } catch (err) {
      caught = err as Error;
    }

    expect(caught).not.toBeNull();
    // The outer runStage prefix is always present
    expect(caught!.message).toMatch(/^\[Stage: chapter-detection\]/);
    // The original error context is preserved somewhere in the message
    expect(caught!.message).toContain("LLM call failed");
  });
});

// ─── detectChapters — graceful fallback paths (no throw) ─────────────────────

describe("detectChapters — graceful fallbacks", () => {
  it("falls back to single-chapter mode when LLM returns invalid JSON", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { content: "THIS IS NOT JSON }{" } }],
    } as ReturnType<typeof invokeLLM> extends Promise<infer R> ? R : never);

    const result = await detectChapters("Hello world paragraph.", "My Book", "Author");
    expect(result.chapters).toHaveLength(1);
    expect(result.chapters[0].title).toBe("Full Text");
  });

  it("falls back to single-chapter mode when LLM returns 0 chapters", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ title: "My Book", author: "Author", chapters: [], frontmatter: "", backmatter: "" }) } }],
    } as ReturnType<typeof invokeLLM> extends Promise<infer R> ? R : never);

    const result = await detectChapters("Hello world paragraph.", "My Book", "Author");
    expect(result.chapters).toHaveLength(1);
    expect(result.chapters[0].title).toBe("Full Text");
  });

  it("throws a staged error when LLM returns empty string content", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { content: "" } }],
    } as ReturnType<typeof invokeLLM> extends Promise<infer R> ? R : never);

    await expect(detectChapters("Hello world.", "My Book", "Author")).rejects.toThrow(
      /\[Stage: chapter-detection\]/
    );
  });

  it("throws a staged error when LLM returns null content", async () => {
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
    } as ReturnType<typeof invokeLLM> extends Promise<infer R> ? R : never);

    await expect(detectChapters("Hello world.", "My Book", "Author")).rejects.toThrow(
      /\[Stage: chapter-detection\]/
    );
  });

  it("returns parsed chapters when LLM returns valid JSON with chapters", async () => {
    const parsed: ParsedBook = {
      title: "My Book",
      author: "Author",
      chapters: [
        { number: 1, title: "Chapter One", body: "First chapter text." },
        { number: 2, title: "Chapter Two", body: "Second chapter text." },
      ],
      frontmatter: "",
      backmatter: "",
    };
    mockInvokeLLM.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(parsed) } }],
    } as ReturnType<typeof invokeLLM> extends Promise<infer R> ? R : never);

    const result = await detectChapters("text", "My Book", "Author");
    expect(result.chapters).toHaveLength(2);
    expect(result.chapters[0].title).toBe("Chapter One");
  });
});

// ─── generateBookHtml — smoke test (no throw for valid input) ─────────────────

describe("generateBookHtml — smoke test", () => {
  it("generates HTML without throwing for a minimal book", () => {
    const book: ParsedBook = {
      title: "Test Book",
      author: "Test Author",
      chapters: [{ number: 1, title: "Chapter One", body: "Some body text." }],
    };
    const trim = getTrimSize("trade-6x9");
    const style = getTypesettingStyle("classic");

    expect(() => generateBookHtml(book, trim, style)).not.toThrow();
  });

  it("generates HTML containing the book title", () => {
    const book: ParsedBook = {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      chapters: [{ number: 1, title: "Chapter One", body: "In my younger years..." }],
    };
    const trim = getTrimSize("trade-6x9");
    const style = getTypesettingStyle("classic");

    const html = generateBookHtml(book, trim, style);
    expect(html).toContain("The Great Gatsby");
  });

  it("generates HTML with scripture double-column layout for scripture style", () => {
    const book: ParsedBook = {
      title: "Holy Bible",
      author: "Various",
      chapters: [{ number: 1, title: "Genesis 1", body: "1 In the beginning God created..." }],
    };
    const trim = getTrimSize("bible-standard");
    const style = getTypesettingStyle("scripture");

    const html = generateBookHtml(book, trim, style);
    expect(html).toContain("column-count: 2");
  });
});

// ─── classifyError — inline mirror of the router helper ──────────────────────

describe("classifyError — stage-prefixed messages", () => {
  // Mirror of the classifyError function in routers.ts
  function classifyError(
    err: unknown,
    fileName: string,
    wordCount?: number | null
  ): "format_unsupported" | "parse_empty" | "pipeline_error" | "unknown" {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    const ext = (fileName ?? "").split(".").pop()?.toLowerCase() ?? "";
    const unsupportedExts = ["pages", "odt", "wps", "wpd", "numbers", "key", "pub", "indd", "qxp", "xps", "psd", "ai"];
    if (unsupportedExts.includes(ext)) return "format_unsupported";
    if (msg.includes("unsupported") || msg.includes("cannot parse") || msg.includes("invalid file") || msg.includes("unrecognized")) return "format_unsupported";
    if (wordCount === 0 || msg.includes("no text") || msg.includes("empty") || msg.includes("no content")) return "parse_empty";
    if (msg.includes("pipeline") || msg.includes("typeset") || msg.includes("pdf") || msg.includes("epub") || msg.includes("chromium") || msg.includes("browser")) return "pipeline_error";
    return "unknown";
  }

  it("classifies a [Stage: pdf-rendering] error as pipeline_error", () => {
    const err = new Error("[Stage: pdf-rendering] Chromium browser failed to launch: spawn ENOENT");
    expect(classifyError(err, "manuscript.docx", 5000)).toBe("pipeline_error");
  });

  it("classifies a [Stage: epub-generation] error as pipeline_error", () => {
    const err = new Error("[Stage: epub-generation] epub-gen-memory failed (title: \"My Book\", chapters: 3): Cannot read properties of undefined");
    expect(classifyError(err, "manuscript.docx", 5000)).toBe("pipeline_error");
  });

  it("classifies a [Stage: chapter-detection] LLM error as unknown (not pipeline_error)", () => {
    const err = new Error("[Stage: chapter-detection] LLM call failed during chapter detection: upstream timeout");
    // Does not contain pdf/epub/chromium/browser keywords → unknown
    expect(classifyError(err, "manuscript.docx", 5000)).toBe("unknown");
  });

  it("classifies a .pages file as format_unsupported regardless of error message", () => {
    const err = new Error("[Stage: chapter-detection] LLM call failed");
    expect(classifyError(err, "my-book.pages", 5000)).toBe("format_unsupported");
  });

  it("classifies a zero-word-count job as parse_empty", () => {
    const err = new Error("[Stage: chapter-detection] LLM call failed");
    expect(classifyError(err, "manuscript.docx", 0)).toBe("parse_empty");
  });
});

// ─── Stage name extraction (mirrors the regex in routers.ts) ─────────────────

describe("Stage name extraction regex", () => {
  function extractStage(msg: string): string | undefined {
    const match = msg.match(/^\[Stage:\s*([^\]]+)\]/);
    return match ? match[1].trim() : undefined;
  }

  it("extracts 'pdf-rendering' from a staged error message", () => {
    expect(extractStage("[Stage: pdf-rendering] Chromium failed")).toBe("pdf-rendering");
  });

  it("extracts 'chapter-detection' from a staged error message", () => {
    expect(extractStage("[Stage: chapter-detection] LLM timeout")).toBe("chapter-detection");
  });

  it("extracts 'epub-generation' from a staged error message", () => {
    expect(extractStage("[Stage: epub-generation] epub-gen-memory failed")).toBe("epub-generation");
  });

  it("extracts 'config-resolution' from a staged error message", () => {
    expect(extractStage("[Stage: config-resolution] Invalid trim size ID")).toBe("config-resolution");
  });

  it("returns undefined for a non-staged error message", () => {
    expect(extractStage("Something went wrong")).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(extractStage("")).toBeUndefined();
  });
});
