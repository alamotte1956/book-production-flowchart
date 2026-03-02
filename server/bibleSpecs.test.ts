/**
 * Tests for Bible publishing specifications in shared/bibleSpecs.ts:
 * - Trim sizes (general + Bible-specific)
 * - Paper types
 * - Binding types
 * - Bible edition types and translations
 * - Typesetting styles (including scripture style)
 * - calculateSpineWidth helper
 */
import { describe, it, expect } from "vitest";
import {
  TRIM_SIZES,
  PAPER_TYPES,
  BINDING_TYPES,
  BIBLE_EDITION_TYPES,
  BIBLE_TRANSLATIONS,
  TYPESETTING_STYLES,
  calculateSpineWidth,
  getBibleTrimSizes,
  getBibleStyles,
} from "../shared/bibleSpecs";

// ─── Trim Sizes ────────────────────────────────────────────────────────────────
describe("TRIM_SIZES", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(TRIM_SIZES)).toBe(true);
    expect(TRIM_SIZES.length).toBeGreaterThan(0);
  });

  it("each trim size has required fields", () => {
    for (const t of TRIM_SIZES) {
      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("widthIn");
      expect(t).toHaveProperty("heightIn");
      expect(typeof t.widthIn).toBe("number");
      expect(typeof t.heightIn).toBe("number");
      expect(t.widthIn).toBeGreaterThan(0);
      expect(t.heightIn).toBeGreaterThan(0);
    }
  });

  it("includes standard 5.25×8 Bible trim", () => {
    const standard = TRIM_SIZES.find(t => t.id === "bible-standard");
    expect(standard).toBeDefined();
    expect(standard!.widthIn).toBe(5.25);
    expect(standard!.heightIn).toBe(8);
  });

  it("includes compact pocket Bible trim", () => {
    const compact = TRIM_SIZES.find(t => t.id === "bible-compact");
    expect(compact).toBeDefined();
    expect(compact!.widthIn).toBeLessThan(5);
  });

  it("includes large print Bible trim", () => {
    const largePrint = TRIM_SIZES.find(t => t.id === "bible-large-print" || t.id === "bible-giant-print");
    expect(largePrint).toBeDefined();
    expect(largePrint!.widthIn).toBeGreaterThanOrEqual(6);
  });

  it("includes journaling Bible trim with wide outer margin", () => {
    const journaling = TRIM_SIZES.find(t => t.id === "bible-journaling");
    expect(journaling).toBeDefined();
    expect(journaling!.marginOutsideIn).toBeGreaterThan(1.5);
  });

  it("Bible trim sizes have bibleSize flag", () => {
    const bibleSizes = TRIM_SIZES.filter(t => t.id.startsWith("bible-"));
    expect(bibleSizes.length).toBeGreaterThan(0);
    for (const t of bibleSizes) {
      expect(t.bibleSize).toBe(true);
    }
  });

  it("all IDs are unique", () => {
    const ids = TRIM_SIZES.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── getBibleTrimSizes helper ──────────────────────────────────────────────────
describe("getBibleTrimSizes", () => {
  it("returns only Bible-specific trim sizes", () => {
    const bibleSizes = getBibleTrimSizes();
    expect(bibleSizes.length).toBeGreaterThan(0);
    for (const t of bibleSizes) {
      expect(t.bibleSize).toBe(true);
    }
  });

  it("does not include general trade sizes", () => {
    const bibleSizes = getBibleTrimSizes();
    const hasGeneral = bibleSizes.some(t => t.id === "6x9" || t.id === "5.5x8.5");
    expect(hasGeneral).toBe(false);
  });
});

// ─── Paper Types ───────────────────────────────────────────────────────────────
describe("PAPER_TYPES", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(PAPER_TYPES)).toBe(true);
    expect(PAPER_TYPES.length).toBeGreaterThan(0);
  });

  it("each paper type has id, label, ppi, description", () => {
    for (const p of PAPER_TYPES) {
      expect(p).toHaveProperty("id");
      expect(p).toHaveProperty("label");
      expect(p).toHaveProperty("ppi");
      expect(p).toHaveProperty("description");
      expect(p.ppi).toBeGreaterThan(0);
    }
  });

  it("includes India paper with high PPI (≥ 900)", () => {
    const india = PAPER_TYPES.find(p => p.ppi >= 900);
    expect(india).toBeDefined();
  });

  it("India 24 lb has the highest PPI", () => {
    const india24 = PAPER_TYPES.find(p => p.id === "india-24");
    expect(india24).toBeDefined();
    const maxPpi = Math.max(...PAPER_TYPES.map(p => p.ppi));
    expect(india24!.ppi).toBe(maxPpi);
  });

  it("Bible-grade papers have bibleGrade flag", () => {
    const bibleGrade = PAPER_TYPES.filter(p => p.bibleGrade);
    expect(bibleGrade.length).toBeGreaterThan(0);
    // India papers should be Bible grade
    const india = PAPER_TYPES.find(p => p.id === "india-24");
    expect(india!.bibleGrade).toBe(true);
  });

  it("heavier paper has lower PPI than lighter paper", () => {
    const india24 = PAPER_TYPES.find(p => p.id === "india-24")!;
    const coated80 = PAPER_TYPES.find(p => p.id === "coated-80")!;
    expect(india24.ppi).toBeGreaterThan(coated80.ppi);
  });

  it("all IDs are unique", () => {
    const ids = PAPER_TYPES.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── Binding Types ─────────────────────────────────────────────────────────────
describe("BINDING_TYPES", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(BINDING_TYPES)).toBe(true);
    expect(BINDING_TYPES.length).toBeGreaterThan(0);
  });

  it("each binding type has id, label, coverBoardThicknessIn, description", () => {
    for (const b of BINDING_TYPES) {
      expect(b).toHaveProperty("id");
      expect(b).toHaveProperty("label");
      expect(b).toHaveProperty("coverBoardThicknessIn");
      expect(b).toHaveProperty("description");
      expect(typeof b.coverBoardThicknessIn).toBe("number");
      expect(b.coverBoardThicknessIn).toBeGreaterThanOrEqual(0);
    }
  });

  it("includes Smyth-sewn hardcover (the gold standard)", () => {
    const smyth = BINDING_TYPES.find(b => b.id === "smyth-sewn-hardcover");
    expect(smyth).toBeDefined();
    expect(smyth!.coverBoardThicknessIn).toBeGreaterThan(0);
  });

  it("all IDs are unique", () => {
    const ids = BINDING_TYPES.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── Bible Edition Types ───────────────────────────────────────────────────────
describe("BIBLE_EDITION_TYPES", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(BIBLE_EDITION_TYPES)).toBe(true);
    expect(BIBLE_EDITION_TYPES.length).toBeGreaterThan(5);
  });

  it("each edition type has id, label, description, defaultTrimSizeId, defaultStyleId", () => {
    for (const e of BIBLE_EDITION_TYPES) {
      expect(e).toHaveProperty("id");
      expect(e).toHaveProperty("label");
      expect(e).toHaveProperty("description");
      expect(e).toHaveProperty("defaultTrimSizeId");
      expect(e).toHaveProperty("defaultStyleId");
    }
  });

  it("includes standard edition", () => {
    const standard = BIBLE_EDITION_TYPES.find(e => e.id === "standard");
    expect(standard).toBeDefined();
  });

  it("includes study Bible edition", () => {
    const study = BIBLE_EDITION_TYPES.find(e => e.id === "study");
    expect(study).toBeDefined();
  });

  it("includes journaling Bible edition", () => {
    const journaling = BIBLE_EDITION_TYPES.find(e => e.id === "journaling");
    expect(journaling).toBeDefined();
  });

  it("includes large print edition", () => {
    const largePrint = BIBLE_EDITION_TYPES.find(e => e.id === "large-print");
    expect(largePrint).toBeDefined();
  });

  it("includes children's Bible edition", () => {
    const childrens = BIBLE_EDITION_TYPES.find(e => e.id === "childrens");
    expect(childrens).toBeDefined();
  });

  it("includes compact/pocket edition", () => {
    const compact = BIBLE_EDITION_TYPES.find(e => e.id === "compact");
    expect(compact).toBeDefined();
  });

  it("each edition has a features array", () => {
    for (const e of BIBLE_EDITION_TYPES) {
      expect(Array.isArray(e.features)).toBe(true);
      expect(e.features.length).toBeGreaterThan(0);
    }
  });

  it("all IDs are unique", () => {
    const ids = BIBLE_EDITION_TYPES.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── Bible Translations ────────────────────────────────────────────────────────
describe("BIBLE_TRANSLATIONS", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(BIBLE_TRANSLATIONS)).toBe(true);
    expect(BIBLE_TRANSLATIONS.length).toBeGreaterThan(5);
  });

  it("each translation has id, label, fullName", () => {
    for (const t of BIBLE_TRANSLATIONS) {
      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("label");
      expect(t).toHaveProperty("fullName");
    }
  });

  it("includes KJV", () => {
    expect(BIBLE_TRANSLATIONS.some(t => t.label === "KJV")).toBe(true);
  });

  it("includes NIV", () => {
    expect(BIBLE_TRANSLATIONS.some(t => t.label === "NIV")).toBe(true);
  });

  it("includes ESV", () => {
    expect(BIBLE_TRANSLATIONS.some(t => t.label === "ESV")).toBe(true);
  });

  it("includes NKJV", () => {
    expect(BIBLE_TRANSLATIONS.some(t => t.label === "NKJV")).toBe(true);
  });

  it("includes NLT", () => {
    expect(BIBLE_TRANSLATIONS.some(t => t.label === "NLT")).toBe(true);
  });

  it("includes a custom/other option", () => {
    expect(BIBLE_TRANSLATIONS.some(t => t.id === "custom")).toBe(true);
  });

  it("all IDs are unique", () => {
    const ids = BIBLE_TRANSLATIONS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── Typesetting Styles (Bible) ────────────────────────────────────────────────
describe("TYPESETTING_STYLES — Bible styles", () => {
  it("includes the scripture style", () => {
    const scripture = TYPESETTING_STYLES.find(s => s.id === "scripture");
    expect(scripture).toBeDefined();
  });

  it("scripture style has doubleColumn = true", () => {
    const scripture = TYPESETTING_STYLES.find(s => s.id === "scripture")!;
    expect(scripture.doubleColumn).toBe(true);
  });

  it("scripture style has verseNumbers = true", () => {
    const scripture = TYPESETTING_STYLES.find(s => s.id === "scripture")!;
    expect(scripture.verseNumbers).toBe(true);
  });

  it("each style has id, label, fontFamily, fontSize, lineHeight", () => {
    for (const s of TYPESETTING_STYLES) {
      expect(s).toHaveProperty("id");
      expect(s).toHaveProperty("label");
      expect(s).toHaveProperty("fontFamily");
      expect(s).toHaveProperty("fontSize");
      expect(s).toHaveProperty("lineHeight");
    }
  });

  it("getBibleStyles returns only Bible-specific styles", () => {
    const bibleStyles = getBibleStyles();
    expect(bibleStyles.length).toBeGreaterThan(0);
    for (const s of bibleStyles) {
      expect(s.bibleStyle).toBe(true);
    }
  });

  it("all style IDs are unique", () => {
    const ids = TYPESETTING_STYLES.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── calculateSpineWidth ───────────────────────────────────────────────────────
describe("calculateSpineWidth", () => {
  it("returns spineWidthIn and spineWidthMm", () => {
    const result = calculateSpineWidth(1200, "india-24", "smyth-sewn-hardcover");
    expect(result).toHaveProperty("spineWidthIn");
    expect(result).toHaveProperty("spineWidthMm");
    expect(result).toHaveProperty("notes");
  });

  it("spine width is positive for valid inputs", () => {
    const result = calculateSpineWidth(1200, "india-24", "smyth-sewn-hardcover");
    expect(result.spineWidthIn).toBeGreaterThan(0);
    expect(result.spineWidthMm).toBeGreaterThan(0);
  });

  it("thinner paper produces narrower spine for same page count", () => {
    const thin = calculateSpineWidth(1200, "india-24", "smyth-sewn-hardcover");
    const thick = calculateSpineWidth(1200, "coated-80", "smyth-sewn-hardcover");
    expect(thin.spineWidthIn).toBeLessThan(thick.spineWidthIn);
  });

  it("more pages produces wider spine for same paper", () => {
    const small = calculateSpineWidth(800, "india-24", "smyth-sewn-hardcover");
    const large = calculateSpineWidth(1600, "india-24", "smyth-sewn-hardcover");
    expect(large.spineWidthIn).toBeGreaterThan(small.spineWidthIn);
  });

  it("spine width in mm is approximately 25.4× the inch value", () => {
    const result = calculateSpineWidth(1200, "india-24", "smyth-sewn-hardcover");
    const expected = result.spineWidthIn * 25.4;
    expect(Math.abs(result.spineWidthMm - expected)).toBeLessThan(0.1);
  });

  it("standard KJV Bible (1200pp, India 24lb, Smyth-sewn) spine is between 1\" and 2\"", () => {
    const result = calculateSpineWidth(1200, "india-24", "smyth-sewn-hardcover");
    expect(result.spineWidthIn).toBeGreaterThan(1.0);
    expect(result.spineWidthIn).toBeLessThan(2.0);
  });

  it("includes human-readable notes string", () => {
    const result = calculateSpineWidth(1200, "india-24", "smyth-sewn-hardcover");
    expect(typeof result.notes).toBe("string");
    expect(result.notes.length).toBeGreaterThan(0);
  });
});
