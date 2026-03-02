/**
 * Tests for genre-based step filtering logic.
 * The helper lives in shared/genreFilter.ts and is used by the Project Tracker.
 */
import { describe, it, expect } from "vitest";
import {
  getIrrelevantStepIds,
  getFilterReason,
  FICTION_GENRES,
  NONFICTION_GENRES,
  ACADEMIC_GENRES,
} from "../shared/genreFilter";

// ─── getIrrelevantStepIds ──────────────────────────────────────────────────

describe("getIrrelevantStepIds", () => {
  it("returns an empty set for null genre", () => {
    expect(getIrrelevantStepIds(null).size).toBe(0);
  });

  it("returns an empty set for undefined genre", () => {
    expect(getIrrelevantStepIds(undefined).size).toBe(0);
  });

  it("returns an empty set for empty string genre", () => {
    expect(getIrrelevantStepIds("").size).toBe(0);
  });

  it("returns an empty set for 'Other' genre", () => {
    expect(getIrrelevantStepIds("Other").size).toBe(0);
  });

  // Fiction genres — indexing should always be hidden
  it.each([...FICTION_GENRES])(
    "hides 'indexing' for fiction genre: %s",
    (genre) => {
      const hidden = getIrrelevantStepIds(genre);
      expect(hidden.has("indexing")).toBe(true);
    }
  );

  // Children's and Middle Grade — also hide 'rights'
  it("hides 'rights' for Children's", () => {
    const hidden = getIrrelevantStepIds("Children's");
    expect(hidden.has("rights")).toBe(true);
  });

  it("hides 'rights' for Middle Grade", () => {
    const hidden = getIrrelevantStepIds("Middle Grade");
    expect(hidden.has("rights")).toBe(true);
  });

  it("does NOT hide 'rights' for Literary Fiction", () => {
    const hidden = getIrrelevantStepIds("Literary Fiction");
    expect(hidden.has("rights")).toBe(false);
  });

  // Poetry and Graphic Novel — hide 'digital'
  it("hides 'digital' for Poetry", () => {
    const hidden = getIrrelevantStepIds("Poetry");
    expect(hidden.has("digital")).toBe(true);
  });

  it("hides 'digital' for Graphic Novel", () => {
    const hidden = getIrrelevantStepIds("Graphic Novel");
    expect(hidden.has("digital")).toBe(true);
  });

  it("does NOT hide 'digital' for Literary Fiction", () => {
    const hidden = getIrrelevantStepIds("Literary Fiction");
    expect(hidden.has("digital")).toBe(false);
  });

  // Nonfiction — Narrative Nonfiction and Memoir hide indexing
  it("hides 'indexing' for Narrative Nonfiction", () => {
    const hidden = getIrrelevantStepIds("Narrative Nonfiction");
    expect(hidden.has("indexing")).toBe(true);
  });

  it("hides 'indexing' for Memoir / Autobiography", () => {
    const hidden = getIrrelevantStepIds("Memoir / Autobiography");
    expect(hidden.has("indexing")).toBe(true);
  });

  it("does NOT hide 'indexing' for Self-Help / Personal Development", () => {
    const hidden = getIrrelevantStepIds("Self-Help / Personal Development");
    expect(hidden.has("indexing")).toBe(false);
  });

  it("does NOT hide 'indexing' for Business / Finance", () => {
    const hidden = getIrrelevantStepIds("Business / Finance");
    expect(hidden.has("indexing")).toBe(false);
  });

  // Academic — hides proposal, review, digital
  it("hides 'proposal' for Academic / Textbook", () => {
    const hidden = getIrrelevantStepIds("Academic / Textbook");
    expect(hidden.has("proposal")).toBe(true);
  });

  it("hides 'review' for Academic / Textbook", () => {
    const hidden = getIrrelevantStepIds("Academic / Textbook");
    expect(hidden.has("review")).toBe(true);
  });

  it("hides 'digital' for Academic / Textbook", () => {
    const hidden = getIrrelevantStepIds("Academic / Textbook");
    expect(hidden.has("digital")).toBe(true);
  });

  it("does NOT hide 'indexing' for Academic / Textbook", () => {
    const hidden = getIrrelevantStepIds("Academic / Textbook");
    expect(hidden.has("indexing")).toBe(false);
  });

  // Sanity: universal steps are never hidden for any genre
  it.each(["Literary Fiction", "Narrative Nonfiction", "Academic / Textbook"])(
    "never hides core production steps for %s",
    (genre) => {
      const hidden = getIrrelevantStepIds(genre);
      // These steps are universal and must never be hidden
      for (const step of ["writing", "copyedit", "typesetting", "printing", "binding"]) {
        expect(hidden.has(step)).toBe(false);
      }
    }
  );
});

// ─── getFilterReason ──────────────────────────────────────────────────────

describe("getFilterReason", () => {
  it("returns a reason string for indexing + Literary Fiction", () => {
    const reason = getFilterReason("indexing", "Literary Fiction");
    expect(typeof reason).toBe("string");
    expect(reason.length).toBeGreaterThan(10);
  });

  it("returns a specific reason for rights + Children's", () => {
    const reason = getFilterReason("rights", "Children's");
    expect(reason).toContain("agent");
  });

  it("returns a specific reason for proposal + Academic / Textbook", () => {
    const reason = getFilterReason("proposal", "Academic / Textbook");
    expect(reason).toContain("peer review");
  });

  it("returns a fallback reason for an unknown stepId", () => {
    const reason = getFilterReason("nonexistent-step", "Fantasy");
    expect(reason).toContain("Fantasy");
  });
});

describe("Bible / Scripture filtering", () => {
  it("hides 'proposal' for Bible / Scripture", () => {
    const hidden = getIrrelevantStepIds("Bible / Scripture");
    expect(hidden.has("proposal")).toBe(true);
  });

  it("hides 'review' for Bible / Scripture", () => {
    const hidden = getIrrelevantStepIds("Bible / Scripture");
    expect(hidden.has("review")).toBe(true);
  });

  it("does NOT hide 'indexing' for Bible / Scripture", () => {
    const hidden = getIrrelevantStepIds("Bible / Scripture");
    expect(hidden.has("indexing")).toBe(false);
  });

  it("does NOT hide 'digital' for Bible / Scripture", () => {
    const hidden = getIrrelevantStepIds("Bible / Scripture");
    expect(hidden.has("digital")).toBe(false);
  });

  it("returns a specific reason for proposal + Bible / Scripture", () => {
    const reason = getFilterReason("proposal", "Bible / Scripture");
    expect(reason).toContain("religious");
  });

  it("returns a specific reason for review + Bible / Scripture", () => {
    const reason = getFilterReason("review", "Bible / Scripture");
    expect(reason).toContain("religious");
  });
});

describe("Genre sets", () => {
  it("FICTION_GENRES contains expected genres", () => {
    expect(FICTION_GENRES.has("Literary Fiction")).toBe(true);
    expect(FICTION_GENRES.has("Science Fiction")).toBe(true);
    expect(FICTION_GENRES.has("Poetry")).toBe(true);
  });

  it("NONFICTION_GENRES contains expected genres", () => {
    expect(NONFICTION_GENRES.has("Narrative Nonfiction")).toBe(true);
    expect(NONFICTION_GENRES.has("Business / Finance")).toBe(true);
    expect(NONFICTION_GENRES.has("Bible / Scripture")).toBe(true);
  });

  it("ACADEMIC_GENRES contains expected genres", () => {
    expect(ACADEMIC_GENRES.has("Academic / Textbook")).toBe(true);
  });

  it("genre sets are mutually exclusive", () => {
    for (const g of FICTION_GENRES) {
      expect(NONFICTION_GENRES.has(g)).toBe(false);
      expect(ACADEMIC_GENRES.has(g)).toBe(false);
    }
    for (const g of NONFICTION_GENRES) {
      expect(FICTION_GENRES.has(g)).toBe(false);
      expect(ACADEMIC_GENRES.has(g)).toBe(false);
    }
  });
});
