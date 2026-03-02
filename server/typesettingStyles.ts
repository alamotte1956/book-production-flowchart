/**
 * Typesetting Styles and Trim Sizes
 * Defines CSS and layout parameters for each supported book style and trim size.
 */

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
  /** When true, body text is rendered in two columns (Scripture / Reference layout) */
  doubleColumn?: boolean;
  /** When true, inline verse numbers are rendered as superscripts */
  verseNumbers?: boolean;
};

export const TRIM_SIZES: TrimSize[] = [
  {
    id: "5x8",
    label: "5\" × 8\" (Digest)",
    widthIn: 5, heightIn: 8,
    marginTopIn: 0.875, marginBottomIn: 0.875,
    marginInsideIn: 0.875, marginOutsideIn: 0.625,
    headerFooterIn: 0.375,
  },
  {
    id: "5.5x8.5",
    label: "5.5\" × 8.5\" (Trade Paperback)",
    widthIn: 5.5, heightIn: 8.5,
    marginTopIn: 1.0, marginBottomIn: 1.0,
    marginInsideIn: 1.0, marginOutsideIn: 0.75,
    headerFooterIn: 0.4,
  },
  {
    id: "6x9",
    label: "6\" × 9\" (Standard Trade)",
    widthIn: 6, heightIn: 9,
    marginTopIn: 1.0, marginBottomIn: 1.0,
    marginInsideIn: 1.0, marginOutsideIn: 0.75,
    headerFooterIn: 0.4,
  },
  {
    id: "7x10",
    label: "7\" × 10\" (Textbook)",
    widthIn: 7, heightIn: 10,
    marginTopIn: 1.125, marginBottomIn: 1.125,
    marginInsideIn: 1.125, marginOutsideIn: 0.875,
    headerFooterIn: 0.5,
  },
  {
    id: "8x10",
    label: "8\" × 10\" (Large Format)",
    widthIn: 8, heightIn: 10,
    marginTopIn: 1.25, marginBottomIn: 1.25,
    marginInsideIn: 1.25, marginOutsideIn: 1.0,
    headerFooterIn: 0.5,
  },
  {
    id: "8.5x11",
    label: "8.5\" × 11\" (Letter / Workbook)",
    widthIn: 8.5, heightIn: 11,
    marginTopIn: 1.25, marginBottomIn: 1.25,
    marginInsideIn: 1.25, marginOutsideIn: 1.0,
    headerFooterIn: 0.5,
  },
];

export const TYPESETTING_STYLES: TypesettingStyle[] = [
  {
    id: "literary-fiction",
    label: "Literary Fiction",
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
  {
    id: "scripture",
    label: "Scripture / Reference",
    // Gentium Book Plus is a high-quality open-source font designed for scripture and multilingual text
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
  },
];

export function getTrimSize(id: string): TrimSize {
  return TRIM_SIZES.find(t => t.id === id) ?? TRIM_SIZES[2]; // default 6x9
}

export function getTypesettingStyle(id: string): TypesettingStyle {
  return TYPESETTING_STYLES.find(s => s.id === id) ?? TYPESETTING_STYLES[0];
}
