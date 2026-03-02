/**
 * Typesetting Styles, Trim Sizes, Paper Types, and Bible Edition Types
 * Defines CSS and layout parameters for all supported book styles and trim sizes,
 * with comprehensive support for specialty Bible publishing.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrimSize = {
  id: string;
  label: string;
  widthIn: number;
  heightIn: number;
  marginTopIn: number;
  marginBottomIn: number;
  marginInsideIn: number;
  marginOutsideIn: number;
  headerFooterIn: number;
  /** Whether this is a Bible-specific trim size */
  bibleSize?: boolean;
  /** Typical use description */
  description?: string;
};

export type TypesettingStyle = {
  id: string;
  label: string;
  fontFamily: string;
  fontSize: number; // pt
  lineHeight: number; // multiplier
  chapterHeadingFont: string;
  chapterHeadingSize: number; // pt
  dropCap: boolean;
  chapterBreakStyle: "page-break" | "large-space";
  bodyColor: string;
  headingColor: string;
  googleFontsUrl: string;
  /** When true, body text is rendered in two columns */
  doubleColumn?: boolean;
  /** When true, inline verse numbers are rendered as superscripts */
  verseNumbers?: boolean;
  /** When true, words of Christ are rendered in red */
  redLetter?: boolean;
  /** Margin style: standard, wide, journaling, study */
  marginStyle?: "standard" | "wide" | "journaling" | "study";
  /** Whether this is a Bible-specific style */
  bibleStyle?: boolean;
  /** Category group for display */
  group?: "General" | "Bible / Scripture";
};

export type PaperType = {
  id: string;
  label: string;
  weightLb: number;
  ppi: number; // pages per inch (for spine calculation)
  description: string;
  bibleGrade: boolean;
};

export type BibleEditionType = {
  id: string;
  label: string;
  description: string;
  defaultTrimSizeId: string;
  defaultStyleId: string;
  defaultPaperTypeId: string;
  features: string[];
};

export type BibleTranslation = {
  id: string;
  label: string;
  fullName: string;
};

export type BindingType = {
  id: string;
  label: string;
  description: string;
  coverBoardThicknessIn: number; // thickness added to spine per board
  bibleGrade: boolean;
};

// ─── Standard Book Trim Sizes ─────────────────────────────────────────────────

export const TRIM_SIZES: TrimSize[] = [
  {
    id: "5x8",
    label: "5\" × 8\" (Digest)",
    widthIn: 5, heightIn: 8,
    marginTopIn: 0.875, marginBottomIn: 0.875,
    marginInsideIn: 0.875, marginOutsideIn: 0.625,
    headerFooterIn: 0.375,
    description: "Compact trade paperback",
  },
  {
    id: "5.5x8.5",
    label: "5.5\" × 8.5\" (Trade Paperback)",
    widthIn: 5.5, heightIn: 8.5,
    marginTopIn: 1.0, marginBottomIn: 1.0,
    marginInsideIn: 1.0, marginOutsideIn: 0.75,
    headerFooterIn: 0.4,
    description: "Standard trade paperback",
  },
  {
    id: "6x9",
    label: "6\" × 9\" (Standard Trade)",
    widthIn: 6, heightIn: 9,
    marginTopIn: 1.0, marginBottomIn: 1.0,
    marginInsideIn: 1.0, marginOutsideIn: 0.75,
    headerFooterIn: 0.4,
    description: "Most common trade book size",
  },
  {
    id: "7x10",
    label: "7\" × 10\" (Textbook)",
    widthIn: 7, heightIn: 10,
    marginTopIn: 1.125, marginBottomIn: 1.125,
    marginInsideIn: 1.125, marginOutsideIn: 0.875,
    headerFooterIn: 0.5,
    description: "Academic and textbook format",
  },
  {
    id: "8x10",
    label: "8\" × 10\" (Large Format)",
    widthIn: 8, heightIn: 10,
    marginTopIn: 1.25, marginBottomIn: 1.25,
    marginInsideIn: 1.25, marginOutsideIn: 1.0,
    headerFooterIn: 0.5,
    description: "Large format / illustrated",
  },
  {
    id: "8.5x11",
    label: "8.5\" × 11\" (Letter / Workbook)",
    widthIn: 8.5, heightIn: 11,
    marginTopIn: 1.25, marginBottomIn: 1.25,
    marginInsideIn: 1.25, marginOutsideIn: 1.0,
    headerFooterIn: 0.5,
    description: "Workbook and study guide format",
  },
  // ─── Bible Trim Sizes ───────────────────────────────────────────────────────
  {
    id: "bible-compact",
    label: "4.25\" × 6.5\" (Bible Compact)",
    widthIn: 4.25, heightIn: 6.5,
    marginTopIn: 0.5, marginBottomIn: 0.5,
    marginInsideIn: 0.625, marginOutsideIn: 0.375,
    headerFooterIn: 0.3,
    bibleSize: true,
    description: "Compact / pocket Bible — fits in a shirt pocket",
  },
  {
    id: "bible-standard",
    label: "5.25\" × 8\" (Bible Standard)",
    widthIn: 5.25, heightIn: 8,
    marginTopIn: 0.625, marginBottomIn: 0.625,
    marginInsideIn: 0.75, marginOutsideIn: 0.5,
    headerFooterIn: 0.35,
    bibleSize: true,
    description: "Most common Bible trim — pew, personal, and gift editions",
  },
  {
    id: "bible-wide-margin",
    label: "6.5\" × 9.25\" (Bible Wide Margin)",
    widthIn: 6.5, heightIn: 9.25,
    marginTopIn: 0.75, marginBottomIn: 0.75,
    marginInsideIn: 0.875, marginOutsideIn: 1.75,
    headerFooterIn: 0.4,
    bibleSize: true,
    description: "Wide outer margin for notes — study and journaling editions",
  },
  {
    id: "bible-pew",
    label: "5.5\" × 8.5\" (Bible Pew Edition)",
    widthIn: 5.5, heightIn: 8.5,
    marginTopIn: 0.625, marginBottomIn: 0.625,
    marginInsideIn: 0.75, marginOutsideIn: 0.5,
    headerFooterIn: 0.35,
    bibleSize: true,
    description: "Pew Bible — durable, economical, institutional use",
  },
  {
    id: "bible-large-print",
    label: "6\" × 9\" (Bible Large Print)",
    widthIn: 6, heightIn: 9,
    marginTopIn: 0.75, marginBottomIn: 0.75,
    marginInsideIn: 0.875, marginOutsideIn: 0.625,
    headerFooterIn: 0.4,
    bibleSize: true,
    description: "Large print — 12–14pt body text for easy reading",
  },
  {
    id: "bible-giant-print",
    label: "7\" × 10\" (Bible Giant Print)",
    widthIn: 7, heightIn: 10,
    marginTopIn: 0.875, marginBottomIn: 0.875,
    marginInsideIn: 1.0, marginOutsideIn: 0.75,
    headerFooterIn: 0.45,
    bibleSize: true,
    description: "Giant print — 16–18pt body text for low-vision readers",
  },
  {
    id: "bible-reference",
    label: "6.25\" × 9.25\" (Bible Reference)",
    widthIn: 6.25, heightIn: 9.25,
    marginTopIn: 0.75, marginBottomIn: 0.75,
    marginInsideIn: 0.875, marginOutsideIn: 0.625,
    headerFooterIn: 0.4,
    bibleSize: true,
    description: "Reference Bible — center column cross-references and footnotes",
  },
  {
    id: "bible-journaling",
    label: "6\" × 9\" (Bible Journaling)",
    widthIn: 6, heightIn: 9,
    marginTopIn: 0.75, marginBottomIn: 0.75,
    marginInsideIn: 0.875, marginOutsideIn: 2.25,
    headerFooterIn: 0.4,
    bibleSize: true,
    description: "Journaling Bible — 2.25\" ruled outer margin for personal notes and art",
  },
  {
    id: "bible-childrens",
    label: "7\" × 9\" (Bible Children's)",
    widthIn: 7, heightIn: 9,
    marginTopIn: 0.875, marginBottomIn: 0.875,
    marginInsideIn: 1.0, marginOutsideIn: 0.75,
    headerFooterIn: 0.45,
    bibleSize: true,
    description: "Children's Bible — larger format for illustrations and larger text",
  },
];

// ─── Typesetting Styles ───────────────────────────────────────────────────────

export const TYPESETTING_STYLES: TypesettingStyle[] = [
  // General styles
  {
    id: "literary-fiction",
    label: "Literary Fiction",
    group: "General",
    fontFamily: "'Garamond', 'EB Garamond', Georgia, serif",
    fontSize: 11,
    lineHeight: 1.55,
    chapterHeadingFont: "'EB Garamond', Georgia, serif",
    chapterHeadingSize: 18,
    dropCap: true,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#1a1a1a",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap",
  },
  {
    id: "commercial-fiction",
    label: "Commercial Fiction",
    group: "General",
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
    fontSize: 11.5,
    lineHeight: 1.5,
    chapterHeadingFont: "'Palatino Linotype', serif",
    chapterHeadingSize: 20,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#111111",
    headingColor: "#111111",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap",
  },
  {
    id: "narrative-nonfiction",
    label: "Narrative Nonfiction",
    group: "General",
    fontFamily: "'Lora', Georgia, serif",
    fontSize: 11,
    lineHeight: 1.6,
    chapterHeadingFont: "'Lora', serif",
    chapterHeadingSize: 17,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#2c2c2c",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap",
  },
  {
    id: "academic-textbook",
    label: "Academic / Textbook",
    group: "General",
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontSize: 10.5,
    lineHeight: 1.5,
    chapterHeadingFont: "'Source Serif 4', serif",
    chapterHeadingSize: 16,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#000000",
    headingColor: "#1a3a5c",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap",
  },
  {
    id: "self-help",
    label: "Self-Help / Business",
    group: "General",
    fontFamily: "'Merriweather', Georgia, serif",
    fontSize: 11,
    lineHeight: 1.65,
    chapterHeadingFont: "'Merriweather', serif",
    chapterHeadingSize: 18,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#2d4a7a",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap",
  },
  {
    id: "childrens-chapter",
    label: "Children's Chapter Book",
    group: "General",
    fontFamily: "'Nunito', Arial, sans-serif",
    fontSize: 13,
    lineHeight: 1.8,
    chapterHeadingFont: "'Nunito', sans-serif",
    chapterHeadingSize: 22,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#4a2d8a",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,700;1,400&display=swap",
  },
  {
    id: "poetry",
    label: "Poetry",
    group: "General",
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: 12,
    lineHeight: 1.7,
    chapterHeadingFont: "'EB Garamond', serif",
    chapterHeadingSize: 16,
    dropCap: false,
    chapterBreakStyle: "large-space",
    bodyColor: "#1a1a1a",
    headingColor: "#1a1a1a",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap",
  },
  // Bible / Scripture styles
  {
    id: "scripture",
    label: "Scripture / Reference",
    group: "Bible / Scripture",
    fontFamily: "'Gentium Book Plus', 'EB Garamond', Georgia, serif",
    fontSize: 9.5,
    lineHeight: 1.45,
    chapterHeadingFont: "'Gentium Book Plus', Georgia, serif",
    chapterHeadingSize: 14,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#2c1a00",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&display=swap",
    doubleColumn: true,
    verseNumbers: true,
    bibleStyle: true,
    marginStyle: "standard",
  },
  {
    id: "scripture-red-letter",
    label: "Scripture — Red Letter",
    group: "Bible / Scripture",
    fontFamily: "'Gentium Book Plus', 'EB Garamond', Georgia, serif",
    fontSize: 9.5,
    lineHeight: 1.45,
    chapterHeadingFont: "'Gentium Book Plus', Georgia, serif",
    chapterHeadingSize: 14,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#2c1a00",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&display=swap",
    doubleColumn: true,
    verseNumbers: true,
    redLetter: true,
    bibleStyle: true,
    marginStyle: "standard",
  },
  {
    id: "scripture-single-column",
    label: "Scripture — Single Column Narrative",
    group: "Bible / Scripture",
    fontFamily: "'Gentium Book Plus', 'EB Garamond', Georgia, serif",
    fontSize: 10.5,
    lineHeight: 1.55,
    chapterHeadingFont: "'Gentium Book Plus', Georgia, serif",
    chapterHeadingSize: 15,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#2c1a00",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&display=swap",
    doubleColumn: false,
    verseNumbers: true,
    bibleStyle: true,
    marginStyle: "standard",
  },
  {
    id: "scripture-wide-margin",
    label: "Scripture — Wide Margin Study",
    group: "Bible / Scripture",
    fontFamily: "'Gentium Book Plus', 'EB Garamond', Georgia, serif",
    fontSize: 9.5,
    lineHeight: 1.45,
    chapterHeadingFont: "'Gentium Book Plus', Georgia, serif",
    chapterHeadingSize: 14,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#2c1a00",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&display=swap",
    doubleColumn: true,
    verseNumbers: true,
    bibleStyle: true,
    marginStyle: "wide",
  },
  {
    id: "scripture-journaling",
    label: "Scripture — Journaling Edition",
    group: "Bible / Scripture",
    fontFamily: "'Gentium Book Plus', 'EB Garamond', Georgia, serif",
    fontSize: 9.5,
    lineHeight: 1.45,
    chapterHeadingFont: "'Gentium Book Plus', Georgia, serif",
    chapterHeadingSize: 14,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#2c1a00",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&display=swap",
    doubleColumn: false,
    verseNumbers: true,
    bibleStyle: true,
    marginStyle: "journaling",
  },
  {
    id: "scripture-large-print",
    label: "Scripture — Large Print",
    group: "Bible / Scripture",
    fontFamily: "'Gentium Book Plus', 'EB Garamond', Georgia, serif",
    fontSize: 13,
    lineHeight: 1.6,
    chapterHeadingFont: "'Gentium Book Plus', Georgia, serif",
    chapterHeadingSize: 18,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#2c1a00",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&display=swap",
    doubleColumn: true,
    verseNumbers: true,
    bibleStyle: true,
    marginStyle: "standard",
  },
  {
    id: "scripture-giant-print",
    label: "Scripture — Giant Print",
    group: "Bible / Scripture",
    fontFamily: "'Gentium Book Plus', 'EB Garamond', Georgia, serif",
    fontSize: 16,
    lineHeight: 1.65,
    chapterHeadingFont: "'Gentium Book Plus', Georgia, serif",
    chapterHeadingSize: 22,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#2c1a00",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&display=swap",
    doubleColumn: false,
    verseNumbers: true,
    bibleStyle: true,
    marginStyle: "standard",
  },
  {
    id: "scripture-childrens",
    label: "Scripture — Children's Edition",
    group: "Bible / Scripture",
    fontFamily: "'Nunito', Arial, sans-serif",
    fontSize: 13,
    lineHeight: 1.75,
    chapterHeadingFont: "'Nunito', sans-serif",
    chapterHeadingSize: 20,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#5a2d82",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,700;1,400&display=swap",
    doubleColumn: false,
    verseNumbers: false,
    bibleStyle: true,
    marginStyle: "standard",
  },
  {
    id: "scripture-devotional",
    label: "Scripture — Devotional / Pew",
    group: "Bible / Scripture",
    fontFamily: "'Gentium Book Plus', 'EB Garamond', Georgia, serif",
    fontSize: 10,
    lineHeight: 1.5,
    chapterHeadingFont: "'Gentium Book Plus', Georgia, serif",
    chapterHeadingSize: 14,
    dropCap: false,
    chapterBreakStyle: "page-break",
    bodyColor: "#1a1a1a",
    headingColor: "#2c1a00",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&display=swap",
    doubleColumn: true,
    verseNumbers: true,
    bibleStyle: true,
    marginStyle: "standard",
  },
];

// ─── Paper Types ──────────────────────────────────────────────────────────────

export const PAPER_TYPES: PaperType[] = [
  {
    id: "india-24",
    label: "India / Bible Paper — 24 lb",
    weightLb: 24,
    ppi: 1040,
    description: "Ultra-thin, opaque, cream-toned. Industry standard for Bibles. Reduces bulk dramatically.",
    bibleGrade: true,
  },
  {
    id: "india-28",
    label: "India / Bible Paper — 28 lb",
    weightLb: 28,
    ppi: 900,
    description: "Slightly heavier India paper. Better opacity, still very thin. Premium Bible and reference editions.",
    bibleGrade: true,
  },
  {
    id: "thin-offset-40",
    label: "Thin Offset — 40 lb",
    weightLb: 40,
    ppi: 500,
    description: "Lightweight offset for study Bibles and devotionals where some bulk is acceptable.",
    bibleGrade: true,
  },
  {
    id: "offset-50",
    label: "Standard Offset — 50 lb",
    weightLb: 50,
    ppi: 400,
    description: "Standard book paper. Good for children's Bibles and illustrated editions.",
    bibleGrade: false,
  },
  {
    id: "cream-offset-60",
    label: "Cream Offset — 60 lb",
    weightLb: 60,
    ppi: 330,
    description: "Warm cream tone, easy on the eyes. Good for large print and journaling editions.",
    bibleGrade: false,
  },
  {
    id: "coated-80",
    label: "Coated — 80 lb",
    weightLb: 80,
    ppi: 250,
    description: "Glossy or matte coated. For illustrated children's Bibles with full-color art.",
    bibleGrade: false,
  },
];

// ─── Bible Edition Types ──────────────────────────────────────────────────────

export const BIBLE_EDITION_TYPES: BibleEditionType[] = [
  {
    id: "standard",
    label: "Standard / Personal",
    description: "Classic two-column layout with verse numbers. The most common Bible format.",
    defaultTrimSizeId: "bible-standard",
    defaultStyleId: "scripture",
    defaultPaperTypeId: "india-24",
    features: ["Double column", "Verse numbers", "Section headings", "Book introductions"],
  },
  {
    id: "red-letter",
    label: "Red Letter Edition",
    description: "Words of Christ printed in red. Standard two-column layout.",
    defaultTrimSizeId: "bible-standard",
    defaultStyleId: "scripture-red-letter",
    defaultPaperTypeId: "india-24",
    features: ["Double column", "Verse numbers", "Red letter", "Section headings"],
  },
  {
    id: "study",
    label: "Study Bible",
    description: "Wide margins with study notes, cross-references, and commentary.",
    defaultTrimSizeId: "bible-wide-margin",
    defaultStyleId: "scripture-wide-margin",
    defaultPaperTypeId: "thin-offset-40",
    features: ["Wide margin", "Study notes", "Cross-references", "Concordance", "Maps", "Book introductions"],
  },
  {
    id: "journaling",
    label: "Journaling Bible",
    description: "Extra-wide ruled outer margin for personal notes, artwork, and devotional writing.",
    defaultTrimSizeId: "bible-journaling",
    defaultStyleId: "scripture-journaling",
    defaultPaperTypeId: "cream-offset-60",
    features: ["Journaling margin (2.25\")", "Ruled lines", "Verse numbers", "Minimal section headings"],
  },
  {
    id: "pew",
    label: "Pew / Institutional",
    description: "Durable, economical edition for church pews and institutional use.",
    defaultTrimSizeId: "bible-pew",
    defaultStyleId: "scripture-devotional",
    defaultPaperTypeId: "india-28",
    features: ["Double column", "Verse numbers", "Durable binding", "Economical paper"],
  },
  {
    id: "large-print",
    label: "Large Print",
    description: "12–14pt body text for readers who need larger type.",
    defaultTrimSizeId: "bible-large-print",
    defaultStyleId: "scripture-large-print",
    defaultPaperTypeId: "cream-offset-60",
    features: ["Large type (13pt)", "Double column", "Verse numbers", "Generous leading"],
  },
  {
    id: "giant-print",
    label: "Giant Print",
    description: "16–18pt body text for low-vision readers. Single column layout.",
    defaultTrimSizeId: "bible-giant-print",
    defaultStyleId: "scripture-giant-print",
    defaultPaperTypeId: "cream-offset-60",
    features: ["Giant type (16pt)", "Single column", "Verse numbers", "Maximum readability"],
  },
  {
    id: "childrens",
    label: "Children's Bible",
    description: "Larger format with friendly typography for young readers. Designed for illustrations.",
    defaultTrimSizeId: "bible-childrens",
    defaultStyleId: "scripture-childrens",
    defaultPaperTypeId: "coated-80",
    features: ["Child-friendly font", "Larger type", "Illustration space", "Simplified verse layout"],
  },
  {
    id: "compact",
    label: "Compact / Pocket",
    description: "Smallest trim size — fits in a shirt pocket. Ultra-thin India paper.",
    defaultTrimSizeId: "bible-compact",
    defaultStyleId: "scripture",
    defaultPaperTypeId: "india-24",
    features: ["Compact size", "Ultra-thin paper", "Double column", "Minimal margins"],
  },
  {
    id: "reference",
    label: "Reference Bible",
    description: "Center-column cross-references, concordance, maps, and extensive footnotes.",
    defaultTrimSizeId: "bible-reference",
    defaultStyleId: "scripture",
    defaultPaperTypeId: "india-28",
    features: ["Center-column references", "Concordance", "Maps", "Footnotes", "Book introductions"],
  },
  {
    id: "devotional",
    label: "Devotional Bible",
    description: "Includes daily devotional readings alongside the biblical text.",
    defaultTrimSizeId: "bible-standard",
    defaultStyleId: "scripture-devotional",
    defaultPaperTypeId: "thin-offset-40",
    features: ["Devotional readings", "Double column", "Verse numbers", "Reading plan"],
  },
  {
    id: "parallel",
    label: "Parallel Bible",
    description: "Two or four translations printed side by side for comparison.",
    defaultTrimSizeId: "bible-wide-margin",
    defaultStyleId: "scripture-single-column",
    defaultPaperTypeId: "india-28",
    features: ["Side-by-side translations", "Synchronized verse layout", "Translation headers"],
  },
];

// ─── Bible Translations ───────────────────────────────────────────────────────

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  { id: "kjv", label: "KJV", fullName: "King James Version (1611)" },
  { id: "nkjv", label: "NKJV", fullName: "New King James Version" },
  { id: "niv", label: "NIV", fullName: "New International Version" },
  { id: "esv", label: "ESV", fullName: "English Standard Version" },
  { id: "nlt", label: "NLT", fullName: "New Living Translation" },
  { id: "nasb", label: "NASB", fullName: "New American Standard Bible" },
  { id: "csb", label: "CSB", fullName: "Christian Standard Bible" },
  { id: "amp", label: "AMP", fullName: "Amplified Bible" },
  { id: "msg", label: "MSG", fullName: "The Message (Eugene Peterson)" },
  { id: "nrsv", label: "NRSV", fullName: "New Revised Standard Version" },
  { id: "niv-uk", label: "NIVUK", fullName: "New International Version (UK)" },
  { id: "web", label: "WEB", fullName: "World English Bible (Public Domain)" },
  { id: "custom", label: "Custom / Other", fullName: "Custom translation or paraphrase" },
];

// ─── Binding Types ────────────────────────────────────────────────────────────

export const BINDING_TYPES: BindingType[] = [
  {
    id: "smyth-sewn-hardcover",
    label: "Smyth-Sewn Hardcover",
    description: "Signatures sewn together and case-bound. Lies flat when open. Most durable — standard for quality Bibles.",
    coverBoardThicknessIn: 0.098,
    bibleGrade: true,
  },
  {
    id: "smyth-sewn-limp",
    label: "Smyth-Sewn Limp Leather",
    description: "Sewn signatures with flexible leather or bonded leather cover. Classic Bible binding.",
    coverBoardThicknessIn: 0.04,
    bibleGrade: true,
  },
  {
    id: "smyth-sewn-softcover",
    label: "Smyth-Sewn Softcover",
    description: "Sewn signatures with flexible cover. Durable and lies flat. Good for pew Bibles.",
    coverBoardThicknessIn: 0.02,
    bibleGrade: true,
  },
  {
    id: "case-bound",
    label: "Case Bound (Adhesive)",
    description: "Glued signatures in a hardcover case. Less durable than Smyth-sewn but more economical.",
    coverBoardThicknessIn: 0.098,
    bibleGrade: false,
  },
  {
    id: "perfect-bound",
    label: "Perfect Bound",
    description: "Pages glued at spine. Most economical. Not recommended for Bibles — pages can fall out with heavy use.",
    coverBoardThicknessIn: 0,
    bibleGrade: false,
  },
  {
    id: "concealed-wire-o",
    label: "Concealed Wire-O",
    description: "Wire binding concealed in a soft cover. Lies completely flat. Good for journaling and study editions.",
    coverBoardThicknessIn: 0,
    bibleGrade: false,
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function getTrimSize(id: string): TrimSize {
  return TRIM_SIZES.find(t => t.id === id) ?? TRIM_SIZES.find(t => t.id === "6x9")!;
}

export function getTypesettingStyle(id: string): TypesettingStyle {
  return TYPESETTING_STYLES.find(s => s.id === id) ?? TYPESETTING_STYLES[0];
}

export function getPaperType(id: string): PaperType {
  return PAPER_TYPES.find(p => p.id === id) ?? PAPER_TYPES[0];
}

export function getBibleEditionType(id: string): BibleEditionType | undefined {
  return BIBLE_EDITION_TYPES.find(e => e.id === id);
}

export function getBibleTrimSizes(): TrimSize[] {
  return TRIM_SIZES.filter(t => t.bibleSize);
}

export function getBibleStyles(): TypesettingStyle[] {
  return TYPESETTING_STYLES.filter(s => s.bibleStyle);
}

/**
 * Calculate spine width in inches.
 * Formula: (pageCount / ppi) + (2 × coverBoardThicknessIn)
 */
export function calculateSpineWidth(
  pageCount: number,
  paperTypeId: string,
  bindingTypeId: string
): { spineWidthIn: number; spineWidthMm: number; notes: string } {
  const paper = getPaperType(paperTypeId);
  const binding = BINDING_TYPES.find(b => b.id === bindingTypeId) ?? BINDING_TYPES[0];
  const textBlockIn = pageCount / paper.ppi;
  const spineWidthIn = textBlockIn + (2 * binding.coverBoardThicknessIn);
  const spineWidthMm = spineWidthIn * 25.4;
  const notes = `${pageCount} pages ÷ ${paper.ppi} PPI (${paper.label}) + ${(binding.coverBoardThicknessIn * 2 * 25.4).toFixed(1)}mm cover boards (${binding.label})`;
  return { spineWidthIn: Math.round(spineWidthIn * 1000) / 1000, spineWidthMm: Math.round(spineWidthMm * 10) / 10, notes };
}
