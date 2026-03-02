/**
 * Tests for the IDML Generator
 * Verifies that generateIdml produces a valid ZIP buffer with the required
 * IDML package structure that InDesign CS4+ can open.
 */
import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { generateIdml, type IdmlOptions } from "./idmlGenerator";
import { getTrimSize, getTypesettingStyle } from "./typesettingStyles";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeOptions(overrides: Partial<IdmlOptions> = {}): IdmlOptions {
  return {
    title: "Test Bible",
    author: "Test Author",
    trimSize: getTrimSize("5.25x8"),
    style: getTypesettingStyle("scripture"),
    chapters: [
      {
        title: "Genesis 1",
        paragraphs: [
          "1 In the beginning God created the heavens and the earth.",
          "2 Now the earth was formless and empty.",
        ],
      },
      {
        title: "Genesis 2",
        paragraphs: ["1 Thus the heavens and the earth were completed."],
      },
    ],
    ...overrides,
  };
}

// ─── Package Structure Tests ─────────────────────────────────────────────────

describe("generateIdml — package structure", () => {
  it("returns a non-empty Buffer", async () => {
    const buf = await generateIdml(makeOptions());
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(1000);
  });

  it("produces a valid ZIP archive", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    expect(Object.keys(zip.files).length).toBeGreaterThan(5);
  });

  it("includes all required IDML package files", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const files = Object.keys(zip.files);

    const required = [
      "mimetype",
      "designmap.xml",
      "Resources/Preferences.xml",
      "Resources/Fonts.xml",
      "Resources/Graphic.xml",
      "Resources/Styles.xml",
      "Stories/Story_main.xml",
      "XML/BackingStory.xml",
      "XML/Tags.xml",
    ];
    for (const f of required) {
      expect(files, `Missing required file: ${f}`).toContain(f);
    }
  });

  it("mimetype entry contains the correct IDML MIME type string", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const mimetype = await zip.file("mimetype")!.async("string");
    expect(mimetype).toBe("application/vnd.adobe.indesign-idml-package");
  });

  it("includes at least one MasterSpread file", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const masterFiles = Object.keys(zip.files).filter(f =>
      f.startsWith("MasterSpreads/")
    );
    expect(masterFiles.length).toBeGreaterThan(0);
  });

  it("includes at least one Spread file", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const spreadFiles = Object.keys(zip.files).filter(f =>
      f.startsWith("Spreads/")
    );
    expect(spreadFiles.length).toBeGreaterThan(0);
  });
});

// ─── designmap.xml Tests ─────────────────────────────────────────────────────

describe("generateIdml — designmap.xml", () => {
  it("designmap.xml is valid XML with a Document element", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("designmap.xml")!.async("string");
    expect(xml).toContain("<Document");
    expect(xml).toContain("</Document>");
  });

  it("designmap.xml references the main story", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("designmap.xml")!.async("string");
    expect(xml).toContain("Story_main");
  });

  it("designmap.xml contains the book title", async () => {
    const buf = await generateIdml(makeOptions({ title: "Holy Scripture Test" }));
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("designmap.xml")!.async("string");
    expect(xml).toContain("Holy Scripture Test");
  });
});

// ─── Story Content Tests ─────────────────────────────────────────────────────

describe("generateIdml — story content", () => {
  it("Story_main.xml contains chapter titles", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("Stories/Story_main.xml")!.async("string");
    expect(xml).toContain("Genesis 1");
    expect(xml).toContain("Genesis 2");
  });

  it("Story_main.xml contains paragraph text content", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("Stories/Story_main.xml")!.async("string");
    expect(xml).toContain("In the beginning God created");
  });

  it("Story_main.xml has a Story element with a self attribute", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("Stories/Story_main.xml")!.async("string");
    expect(xml).toContain("<Story ");
    expect(xml).toContain('Self="Story_main"');
  });

  it("Story_main.xml contains ParagraphStyleRange elements", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("Stories/Story_main.xml")!.async("string");
    expect(xml).toContain("ParagraphStyleRange");
  });

  it("Story_main.xml escapes XML special characters in content", async () => {
    const opts = makeOptions({
      chapters: [
        {
          title: "Test & Escape",
          paragraphs: ["Text with <angle> brackets & ampersands."],
        },
      ],
    });
    const buf = await generateIdml(opts);
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("Stories/Story_main.xml")!.async("string");
    // Should not contain raw unescaped < or & in text content
    // The title and paragraph text should be XML-escaped
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&lt;");
  });
});

// ─── Styles Tests ─────────────────────────────────────────────────────────────

describe("generateIdml — styles", () => {
  it("Resources/Styles.xml contains paragraph style definitions", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("Resources/Styles.xml")!.async("string");
    expect(xml).toContain("ParagraphStyle");
  });

  it("Resources/Styles.xml references the style font family", async () => {
    const style = getTypesettingStyle("scripture");
    const fontName = style.fontFamily.replace(/'/g, "").split(",")[0].trim();
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("Resources/Styles.xml")!.async("string");
    expect(xml).toContain(fontName);
  });

  it("Resources/Fonts.xml contains a font entry", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("Resources/Fonts.xml")!.async("string");
    expect(xml).toContain("<Font ");
  });
});

// ─── Preferences / Page Size Tests ───────────────────────────────────────────

describe("generateIdml — preferences and page size", () => {
  it("Resources/Preferences.xml contains document preferences", async () => {
    const buf = await generateIdml(makeOptions());
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("Resources/Preferences.xml")!.async("string");
    expect(xml).toContain("DocumentPreference");
  });

  it("page dimensions reflect the chosen trim size", async () => {
    // "bible-standard" = 5.25" × 8" (Bible Standard)
    const trimSize = getTrimSize("bible-standard");
    const buf = await generateIdml(makeOptions({ trimSize }));
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("Resources/Preferences.xml")!.async("string");
    // 5.25 inches = 378 points; 8 inches = 576 points
    const widthPts = Math.round(5.25 * 72); // 378
    const heightPts = Math.round(8 * 72);   // 576
    expect(xml).toContain(String(widthPts));
    expect(xml).toContain(String(heightPts));
  });

  it("uses different page dimensions for a different trim size", async () => {
    const trimA = getTrimSize("bible-standard");
    const trimB = getTrimSize("8.5x11");
    const bufA = await generateIdml(makeOptions({ trimSize: trimA }));
    const bufB = await generateIdml(makeOptions({ trimSize: trimB }));
    const zipA = await JSZip.loadAsync(bufA);
    const zipB = await JSZip.loadAsync(bufB);
    const xmlA = await zipA.file("Resources/Preferences.xml")!.async("string");
    const xmlB = await zipB.file("Resources/Preferences.xml")!.async("string");
    expect(xmlA).not.toEqual(xmlB);
  });
});

// ─── Style Variant Tests ──────────────────────────────────────────────────────

describe("generateIdml — style variants", () => {
  const styleIds = [
    "literary-fiction",
    "academic",
    "children",
    "scripture",
    "large-print",
    "minimalist",
    "poetry",
  ];

  for (const styleId of styleIds) {
    it(`generates a valid IDML package for style: ${styleId}`, async () => {
      const style = getTypesettingStyle(styleId);
      const buf = await generateIdml(makeOptions({ style }));
      expect(buf).toBeInstanceOf(Buffer);
      expect(buf.length).toBeGreaterThan(500);
      const zip = await JSZip.loadAsync(buf);
      expect(zip.file("mimetype")).not.toBeNull();
      expect(zip.file("Stories/Story_main.xml")).not.toBeNull();
    });
  }
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe("generateIdml — edge cases", () => {
  it("handles a single chapter with no paragraphs gracefully", async () => {
    const opts = makeOptions({
      chapters: [{ title: "Empty Chapter", paragraphs: [] }],
    });
    const buf = await generateIdml(opts);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(500);
  });

  it("handles a book with many chapters", async () => {
    const chapters = Array.from({ length: 66 }, (_, i) => ({
      title: `Book ${i + 1}`,
      paragraphs: [`1 Verse one of book ${i + 1}.`, `2 Verse two of book ${i + 1}.`],
    }));
    const buf = await generateIdml(makeOptions({ chapters }));
    expect(buf).toBeInstanceOf(Buffer);
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("Stories/Story_main.xml")!.async("string");
    expect(xml).toContain("Book 1");
    expect(xml).toContain("Book 66");
  });

  it("handles special characters in title and author", async () => {
    const buf = await generateIdml(
      makeOptions({ title: "O'Brien & Sons <Publishers>", author: 'Dr. "Smith"' })
    );
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file("designmap.xml")!.async("string");
    // Should be XML-escaped and not break the XML
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&lt;");
  });

  it("redLetter option does not break generation", async () => {
    const buf = await generateIdml(makeOptions({ redLetter: true }));
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(500);
  });
});
