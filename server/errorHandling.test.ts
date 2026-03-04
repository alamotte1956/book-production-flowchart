/**
 * errorHandling.test.ts
 *
 * Tests for the improved error handling paths:
 *   - lookupByIsbn throws structured errors for invalid ISBN and not-found cases
 *   - lookupISBN (alias) returns null on error instead of throwing
 *   - TRPCError classification logic (BAD_REQUEST vs NOT_FOUND vs INTERNAL_SERVER_ERROR)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { lookupByIsbn, lookupISBN } from "./isbnLookup";

// ─── Mock fetch so no real HTTP calls are made ────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeOpenLibraryResponse(data: object | null) {
  if (data === null) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ numFound: 0, docs: [] }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function makeGoogleBooksResponse(data: object | null) {
  if (data === null) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ totalItems: 0, items: [] }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

// ─── Invalid ISBN format ──────────────────────────────────────────────────────

describe("lookupByIsbn — invalid ISBN format", () => {
  it("throws a clear error for a too-short ISBN", async () => {
    await expect(lookupByIsbn("123")).rejects.toThrow(/invalid isbn/i);
  });

  it("throws a clear error for an ISBN with letters", async () => {
    await expect(lookupByIsbn("97801234ABCDE")).rejects.toThrow(/invalid isbn/i);
  });

  it("accepts a 10-digit ISBN after stripping dashes", async () => {
    // isbnLookup.ts fetches Open Library first, then Google Books
    // Open Library search endpoint returns docs array
    mockFetch.mockImplementation((url: string) => {
      const urlStr = String(url);
      if (urlStr.includes("openlibrary") && urlStr.includes("api/books")) {
        // Open Library api/books endpoint returns a keyed object
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              "ISBN:0736907972": {
                title: "Test Book",
                authors: [{ name: "Test Author" }],
                publishers: [{ name: "Test Pub" }],
                publish_date: "2020",
              },
            }),
        });
      }
      // Google Books returns empty
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ totalItems: 0, items: [] }),
      });
    });

    const result = await lookupByIsbn("0-7369-0797-2");
    expect(result.isbn).toBe("0736907972");
  });
});

// ─── Not found ────────────────────────────────────────────────────────────────

describe("lookupByIsbn — not found", () => {
  it("throws a clear error when both Open Library and Google Books return nothing", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ numFound: 0, docs: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ totalItems: 0, items: [] }),
      });

    await expect(lookupByIsbn("9780000000000")).rejects.toThrow(/no book found/i);
  });
});

// ─── lookupISBN alias — returns null on error ─────────────────────────────────

describe("lookupISBN alias", () => {
  it("returns null for an invalid ISBN instead of throwing", async () => {
    const result = await lookupISBN("INVALID");
    expect(result).toBeNull();
  });

  it("returns null when no book is found instead of throwing", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ numFound: 0, docs: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ totalItems: 0, items: [] }),
      });

    const result = await lookupISBN("9780000000000");
    expect(result).toBeNull();
  });
});

// ─── TRPCError code classification logic ─────────────────────────────────────

describe("TRPCError code classification (inline logic mirror)", () => {
  function classifyIsbnError(message: string): "BAD_REQUEST" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR" {
    const lower = message.toLowerCase();
    if (lower.includes("invalid isbn")) return "BAD_REQUEST";
    if (lower.includes("no book found") || lower.includes("not found")) return "NOT_FOUND";
    return "INTERNAL_SERVER_ERROR";
  }

  it("classifies 'Invalid ISBN format' as BAD_REQUEST", () => {
    expect(classifyIsbnError("Invalid ISBN format. Please enter a 10 or 13-digit ISBN.")).toBe("BAD_REQUEST");
  });

  it("classifies 'No book found for ISBN' as NOT_FOUND", () => {
    expect(classifyIsbnError("No book found for ISBN 9780000000000. Please verify the ISBN and try again.")).toBe("NOT_FOUND");
  });

  it("classifies a generic server error as INTERNAL_SERVER_ERROR", () => {
    expect(classifyIsbnError("Connection refused: upstream API unavailable")).toBe("INTERNAL_SERVER_ERROR");
  });

  it("classifies 'not found' (lowercase) as NOT_FOUND", () => {
    expect(classifyIsbnError("resource not found")).toBe("NOT_FOUND");
  });
});
