/**
 * Tests for the ISBN lookup helper and CDP template matcher.
 * Uses vi.mock to stub out the fetch calls so no real network is needed.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { lookupISBN, matchCDPTemplate } from "./isbnLookup";

// ─── Mock global fetch ────────────────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeOpenLibraryResponse(overrides: Record<string, unknown> = {}) {
  const isbn = (overrides.isbn as string) ?? "9780310908501";
  return {
    [`ISBN:${isbn}`]: {
      title: "The Purpose Driven Life",
      authors: [{ name: "Rick Warren" }],
      identifiers: { isbn_13: [isbn] },
      number_of_pages: 336,
      subjects: [{ name: "Christian life" }, { name: "Spiritual life" }],
      publishers: [{ name: "Zondervan" }],
      publish_date: "2002",
      ...overrides,
    },
  };
}

function makeGoogleBooksResponse(overrides: Record<string, unknown> = {}) {
  return {
    totalItems: 1,
    items: [
      {
        volumeInfo: {
          title: "The Purpose Driven Life",
          authors: ["Rick Warren"],
          publisher: "Zondervan",
          publishedDate: "2002",
          description: "A Christian living guide.",
          pageCount: 336,
          categories: ["Religion / Christian Living / General"],
          industryIdentifiers: [
            { type: "ISBN_13", identifier: "9780310908501" },
          ],
          imageLinks: {
            thumbnail: "https://example.com/cover.jpg",
          },
          language: "en",
          ...overrides,
        },
      },
    ],
  };
}

// ─── lookupISBN tests ─────────────────────────────────────────────────────────

describe("lookupISBN", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns merged metadata from Open Library and Google Books", async () => {
    // First call: Open Library; second call: Google Books
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeOpenLibraryResponse(),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeGoogleBooksResponse(),
      });

    const result = await lookupISBN("9780310908501");

    expect(result).not.toBeNull();
    expect(result!.title).toBe("The Purpose Driven Life");
    expect(result!.authors).toContain("Rick Warren");
    expect(result!.isbn).toBe("9780310908501");
    expect(result!.pageCount).toBe(336);
  });

  it("falls back to Google Books when Open Library returns no results", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // empty Open Library response
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeGoogleBooksResponse(),
      });

    const result = await lookupISBN("9780310908501");

    expect(result).not.toBeNull();
    expect(result!.title).toBe("The Purpose Driven Life");
  });

  it("returns null when both APIs return no results", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalItems: 0, items: [] }),
      });

    const result = await lookupISBN("0000000000000");
    expect(result).toBeNull();
  });

  it("returns null for an invalid ISBN format", async () => {
    const result = await lookupISBN("not-an-isbn");
    expect(result).toBeNull();
  });

  it("handles fetch errors gracefully and returns null", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await lookupISBN("9780310908501");
    expect(result).toBeNull();
  });

  it("attaches a suggestedTemplate to the result", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeOpenLibraryResponse(),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeGoogleBooksResponse(),
      });

    const result = await lookupISBN("9780310908501");
    expect(result).not.toBeNull();
    expect(result!.suggestedTemplate).toBeDefined();
    expect(result!.suggestedTemplate!.id).toBeTruthy();
  });
});

// ─── matchCDPTemplate tests ───────────────────────────────────────────────────

describe("matchCDPTemplate", () => {
  it("returns a template for a Christian living book", () => {
    const result = matchCDPTemplate({
      title: "The Purpose Driven Life",
      authors: ["Rick Warren"],
      isbn: "9780310908501",
      pageCount: 336,
      subjects: ["Christian life", "Spiritual life"],
      publisher: "Zondervan",
      publishedYear: 2002,
      language: "en",
    });

    expect(result).toBeDefined();
    expect(result.template).toBeDefined();
    expect(result.template.id).toBeTruthy();
    // Should match a Christian Living or similar category
    expect([
      "Christian Living",
      "Devotionals & Inspiration",
      "Pastoral & Ministry",
    ]).toContain(result.template.category);
  });

  it("returns a Bible template for a Bible book", () => {
    const result = matchCDPTemplate({
      title: "NIV Study Bible",
      authors: ["Zondervan"],
      isbn: "9780310438960",
      pageCount: 2200,
      subjects: ["Bible", "Bible study", "Scripture"],
      publisher: "Zondervan",
      publishedYear: 2011,
      language: "en",
    });

    expect(result).toBeDefined();
    expect(result.template.isBible).toBe(true);
  });

  it("returns a children's template for a children's book", () => {
    const result = matchCDPTemplate({
      title: "God Made You Special",
      authors: ["VeggieTales"],
      isbn: "9780310714200",
      pageCount: 32,
      subjects: ["Children", "Christian children", "Picture books"],
      publisher: "Zondervan",
      publishedYear: 2005,
      language: "en",
    });

    expect(result).toBeDefined();
    expect(result.template.category).toBe("Children's Christian");
  });

  it("returns a fallback template even for unrecognised subjects", () => {
    const result = matchCDPTemplate({
      title: "Unknown Book",
      authors: ["Unknown Author"],
      isbn: "9999999999999",
      pageCount: 200,
      subjects: [],
      publisher: "Unknown",
      publishedYear: 2020,
      language: "en",
    });

    // Should still return something rather than throwing
    expect(result).toBeDefined();
    expect(result.template).toBeDefined();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });

  it("returns a devotional template for a devotional book", () => {
    const result = matchCDPTemplate({
      title: "Jesus Calling",
      authors: ["Sarah Young"],
      isbn: "9780718081799",
      pageCount: 400,
      subjects: ["Devotional", "Daily devotional", "Quiet time"],
      publisher: "Thomas Nelson",
      publishedYear: 2004,
      language: "en",
    });

    expect(result).toBeDefined();
    expect([
      "Devotionals & Inspiration",
      "Prayer & Spiritual Practice",
      "Christian Living",
    ]).toContain(result.template.category);
  });

  it("returns a confidence score between 0 and 1", () => {
    const result = matchCDPTemplate({
      title: "Some Book",
      authors: ["Some Author"],
      isbn: "9780000000000",
      pageCount: 250,
      subjects: ["Christian life"],
      publisher: "Publisher",
    });

    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});

// ─── KP&A ISBN match tests ────────────────────────────────────────────────────

describe("lookupISBN — KP&A match", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("populates kpaMatch when the ISBN matches a known KP&A title (New Inductive Study Bible NASB)", async () => {
    // ISBN 9780736907972 = New Inductive Study Bible (NASB) — KP&A full design
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          "ISBN:9780736907972": {
            title: "The New Inductive Study Bible",
            authors: [{ name: "Precept Ministries International" }],
            publishers: [{ name: "Harvest House Publishers" }],
            publish_date: "2000",
            number_of_pages: 2288,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalItems: 0 }),
      });

    const result = await lookupISBN("9780736907972");

    expect(result).not.toBeNull();
    expect(result!.kpaMatch).toBeDefined();
    expect(result!.kpaMatch!.templateId).toBe("kpa-new-inductive-study-bible");
    expect(result!.kpaMatch!.designCredit).toBe("full");
    expect(result!.kpaMatch!.bookTitle).toBe("The New Inductive Study Bible (NASB)");
    expect(result!.kpaMatch!.publisher).toBe("Harvest House Publishers");
  });

  it("populates kpaMatch when the ISBN matches a KP&A cover-only title (Life Recovery Bible)", async () => {
    // ISBN 9781414381503 = Life Recovery Bible (NLT) — KP&A cover design
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          "ISBN:9781414381503": {
            title: "The Life Recovery Bible",
            authors: [{ name: "Stephen Arterburn" }],
            publishers: [{ name: "Tyndale House Publishers" }],
            publish_date: "1998",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalItems: 0 }),
      });

    const result = await lookupISBN("9781414381503");

    expect(result).not.toBeNull();
    expect(result!.kpaMatch).toBeDefined();
    expect(result!.kpaMatch!.templateId).toBe("kpa-life-recovery-bible");
    expect(result!.kpaMatch!.designCredit).toBe("cover");
    expect(result!.kpaMatch!.category).toBe("Recovery Bible");
  });

  it("populates kpaMatch for His Princess (cover+interior design)", async () => {
    // ISBN 1590523318 = His Princess — KP&A cover+interior design
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          "ISBN:1590523318": {
            title: "His Princess: Love Letters from Your King",
            authors: [{ name: "Sheri Rose Shepherd" }],
            publishers: [{ name: "Multnomah Gifts" }],
            publish_date: "2004",
            number_of_pages: 192,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalItems: 0 }),
      });

    const result = await lookupISBN("1590523318");

    expect(result).not.toBeNull();
    expect(result!.kpaMatch).toBeDefined();
    expect(result!.kpaMatch!.templateId).toBe("kpa-his-princess");
    expect(result!.kpaMatch!.designCredit).toBe("cover+interior");
    expect(result!.kpaMatch!.trimLabel).toBe("5.5\" × 8.5\"");
  });

  it("does NOT populate kpaMatch for a non-KP&A ISBN", async () => {
    // ISBN 9780310908501 = The Purpose Driven Life — not a KP&A title
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeOpenLibraryResponse(),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeGoogleBooksResponse(),
      });

    const result = await lookupISBN("9780310908501");

    expect(result).not.toBeNull();
    expect(result!.kpaMatch).toBeUndefined();
  });

  it("kpaMatch includes features and accentColor from the KP&A template", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          "ISBN:9780736907972": {
            title: "The New Inductive Study Bible",
            authors: [{ name: "Precept Ministries International" }],
            publishers: [{ name: "Harvest House Publishers" }],
            publish_date: "2000",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalItems: 0 }),
      });

    const result = await lookupISBN("9780736907972");

    expect(result!.kpaMatch!.features).toBeInstanceOf(Array);
    expect(result!.kpaMatch!.features.length).toBeGreaterThan(0);
    expect(result!.kpaMatch!.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
