/**
 * CDP Book Templates
 * One-click presets for every book type Easy Book Publishers has historically produced.
 * Each template pre-fills the Auto-Produce and Bible Studio settings so users can recreate
 * a professionally-styled book in a single click.
 */

export type CDPTemplateCategory =
  | "Bible Editions"
  | "Christian Living"
  | "Devotionals & Inspiration"
  | "Children's Christian"
  | "Prayer & Spiritual Practice"
  | "Pastoral & Ministry"
  | "Christian Biography"
  | "Academic & Theological"
  | "Music & Audio";

export type CDPTemplate = {
  id: string;
  label: string;
  category: CDPTemplateCategory;
  description: string;
  /** Short tagline shown on the card */
  tagline: string;
  /** Icon name (lucide) used on the card */
  icon: string;
  /** Accent color for the card border/badge */
  accentColor: string;
  /** Auto-Produce style ID */
  styleId: string;
  /** Trim size ID */
  trimSizeId: string;
  /** Bible edition type ID (only for Bible editions) */
  bibleEditionTypeId?: string;
  /** Bible translation ID (only for Bible editions) */
  translationId?: string;
  /** Paper type ID */
  paperTypeId: string;
  /** Binding type ID */
  bindingTypeId: string;
  /** Typical page count range */
  pageCountRange: [number, number];
  /** Key formatting features for this template */
  features: string[];
  /** Example CDP titles that match this template */
  exampleTitles: string[];
  /** Recommended trim size label for display */
  trimLabel: string;
  /** Whether this is a Bible-type template */
  isBible: boolean;
};

// ─── Bible Edition Templates ──────────────────────────────────────────────────

export const CDP_TEMPLATES: CDPTemplate[] = [
  // ── Bible Editions ──────────────────────────────────────────────────────────
  {
    id: "study-bible",
    label: "Study Bible",
    category: "Bible Editions",
    tagline: "Wide margins, study notes, cross-references, concordance",
    description:
      "The flagship Bible format. Wide-margin layout with two-column text, extensive study notes in the outer margin, center-column cross-references, concordance, maps, and book introductions. Printed on thin-offset paper for manageable bulk.",
    icon: "BookOpen",
    accentColor: "#7c3aed",
    styleId: "scripture-wide-margin",
    trimSizeId: "bible-wide-margin",
    bibleEditionTypeId: "study",
    translationId: "kjv",
    paperTypeId: "thin-offset-40",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [1800, 2400],
    features: [
      "Two-column scripture text",
      "Wide outer margin (2\") for study notes",
      "Center-column cross-references",
      "Concordance",
      "Full-color maps",
      "Book introductions",
      "Smyth-sewn hardcover",
    ],
    exampleTitles: [
      "The Thompson Chain-Reference Bible",
      "The Open Bible",
      "The Scofield Reference Bible",
    ],
    trimLabel: "6.5\" × 9.25\"",
    isBible: true,
  },
  {
    id: "devotional-bible",
    label: "Devotional Bible",
    category: "Bible Editions",
    tagline: "Daily devotional readings integrated with scripture",
    description:
      "Scripture text with devotional readings, application notes, and a structured reading plan. Two-column layout on devotional-grade paper. Ideal for personal quiet time and gift editions.",
    icon: "Heart",
    accentColor: "#db2777",
    styleId: "scripture-devotional",
    trimSizeId: "bible-standard",
    bibleEditionTypeId: "devotional",
    translationId: "kjv",
    paperTypeId: "thin-offset-40",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [1400, 1800],
    features: [
      "Two-column scripture text",
      "Daily devotional readings",
      "Application notes",
      "365-day reading plan",
      "Presentation page",
    ],
    exampleTitles: [
      "The Daily Walk Bible",
      "The One Year Bible",
      "The Devotional Study Bible",
    ],
    trimLabel: "5.25\" × 8\"",
    isBible: true,
  },
  {
    id: "reference-bible",
    label: "Reference Bible",
    category: "Bible Editions",
    tagline: "Center-column references, concordance, maps, footnotes",
    description:
      "Comprehensive reference apparatus with center-column cross-references, extensive concordance, full-color maps, and detailed footnotes. Standard two-column layout on India paper.",
    icon: "BookMarked",
    accentColor: "#0369a1",
    styleId: "scripture",
    trimSizeId: "bible-reference",
    bibleEditionTypeId: "reference",
    translationId: "kjv",
    paperTypeId: "india-28",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [1600, 2000],
    features: [
      "Two-column scripture text",
      "Center-column cross-references",
      "Exhaustive concordance",
      "Full-color maps",
      "Detailed footnotes",
      "Book introductions",
    ],
    exampleTitles: [
      "The New Oxford Annotated Bible",
      "The Ryrie Study Bible",
      "The MacArthur Study Bible",
    ],
    trimLabel: "6.25\" × 9.25\"",
    isBible: true,
  },
  {
    id: "journaling-bible",
    label: "Journaling Bible",
    category: "Bible Editions",
    tagline: "Extra-wide ruled margin for notes, art, and reflection",
    description:
      "Single-column scripture text with a 2.25\" ruled outer margin for personal notes, artwork, and devotional writing. Printed on cream offset paper that accepts ink and watercolor. Concealed wire-O binding lies completely flat.",
    icon: "PenLine",
    accentColor: "#b45309",
    styleId: "scripture-journaling",
    trimSizeId: "bible-journaling",
    bibleEditionTypeId: "journaling",
    translationId: "kjv",
    paperTypeId: "cream-offset-60",
    bindingTypeId: "concealed-wire-o",
    pageCountRange: [1200, 1600],
    features: [
      "Single-column scripture text",
      "2.25\" ruled journaling margin",
      "Cream offset paper (accepts ink)",
      "Concealed Wire-O binding (lies flat)",
      "Minimal section headings",
    ],
    exampleTitles: [
      "The Inspire Bible",
      "The Art Bible",
      "The Journaling Bible",
    ],
    trimLabel: "6\" × 9\" (wide margin)",
    isBible: true,
  },
  {
    id: "large-print-bible",
    label: "Large Print Bible",
    category: "Bible Editions",
    tagline: "13pt text for comfortable reading without strain",
    description:
      "Two-column layout with 13pt Gentium Book Plus text and generous leading. Cream offset paper for eye comfort. Smyth-sewn hardcover in a larger format. Ideal for seniors and readers with low vision.",
    icon: "ZoomIn",
    accentColor: "#059669",
    styleId: "scripture-large-print",
    trimSizeId: "bible-large-print",
    bibleEditionTypeId: "large-print",
    translationId: "kjv",
    paperTypeId: "cream-offset-60",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [1800, 2400],
    features: [
      "13pt body text",
      "Two-column layout",
      "Generous leading (1.6×)",
      "Cream offset paper",
      "Larger format (6\" × 9\")",
    ],
    exampleTitles: [
      "The Large Print KJV Bible",
      "The Giant Print Reference Bible",
    ],
    trimLabel: "6\" × 9\"",
    isBible: true,
  },
  {
    id: "compact-bible",
    label: "Compact / Pocket Bible",
    category: "Bible Editions",
    tagline: "Shirt-pocket size on ultra-thin India paper",
    description:
      "The smallest Bible format. Two-column layout at 9.5pt on 24lb India paper. Minimal margins, no cross-references. Flexible cover for easy carry. Perfect for travel, military, and outreach.",
    icon: "Package",
    accentColor: "#64748b",
    styleId: "scripture",
    trimSizeId: "bible-compact",
    bibleEditionTypeId: "compact",
    translationId: "kjv",
    paperTypeId: "india-24",
    bindingTypeId: "smyth-sewn-limp",
    pageCountRange: [800, 1200],
    features: [
      "Ultra-compact format (4.25\" × 6.5\")",
      "24lb India paper",
      "Two-column layout",
      "Flexible limp cover",
      "Minimal margins",
    ],
    exampleTitles: [
      "The Pocket New Testament",
      "The Military Bible",
      "The Outreach Bible",
    ],
    trimLabel: "4.25\" × 6.5\"",
    isBible: true,
  },
  {
    id: "childrens-bible",
    label: "Children's Bible",
    category: "Bible Editions",
    tagline: "Friendly typography with space for full-color illustrations",
    description:
      "Single-column layout with Nunito 13pt text, generous leading, and illustration-ready page design. Coated paper for full-color art. Larger format for comfortable handling by young readers.",
    icon: "Star",
    accentColor: "#7c3aed",
    styleId: "scripture-childrens",
    trimSizeId: "bible-childrens",
    bibleEditionTypeId: "childrens",
    translationId: "kjv",
    paperTypeId: "coated-80",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [400, 800],
    features: [
      "Child-friendly Nunito font",
      "13pt body text",
      "Single-column layout",
      "Coated paper for illustrations",
      "Larger format (7\" × 9\")",
    ],
    exampleTitles: [
      "The Beginner's Bible",
      "The Children's Illustrated Bible",
      "The Read-Aloud Bible",
    ],
    trimLabel: "7\" × 9\"",
    isBible: true,
  },
  {
    id: "youth-bible",
    label: "Youth Bible",
    category: "Bible Editions",
    tagline: "Life-application notes for teens and young adults",
    description:
      "Single-column narrative layout with topical life-application notes, a topical index, and engaging section headings. Designed for teenagers and young adults exploring faith.",
    icon: "Users",
    accentColor: "#0284c7",
    styleId: "scripture-single-column",
    trimSizeId: "bible-standard",
    bibleEditionTypeId: "youth",
    translationId: "niv",
    paperTypeId: "thin-offset-40",
    bindingTypeId: "smyth-sewn-softcover",
    pageCountRange: [1200, 1600],
    features: [
      "Single-column narrative layout",
      "Life-application notes",
      "Topical index",
      "Section headings",
      "Softcover binding",
    ],
    exampleTitles: [
      "The Teen Study Bible",
      "The Youth Walk Bible",
      "The Life Application Youth Bible",
    ],
    trimLabel: "5.25\" × 8\"",
    isBible: true,
  },
  {
    id: "parallel-bible",
    label: "Parallel Bible",
    category: "Bible Editions",
    tagline: "Two translations side by side for comparison",
    description:
      "Two translations printed in synchronized side-by-side columns for easy comparison. Single-column layout per translation with translation headers. India paper to manage bulk.",
    icon: "Columns",
    accentColor: "#0f766e",
    styleId: "scripture-single-column",
    trimSizeId: "bible-wide-margin",
    bibleEditionTypeId: "parallel",
    translationId: "kjv",
    paperTypeId: "india-28",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [1600, 2200],
    features: [
      "Side-by-side translations",
      "Synchronized verse layout",
      "Translation column headers",
      "India paper",
    ],
    exampleTitles: [
      "The Parallel Bible (KJV/NIV)",
      "The Four-Translation Parallel Bible",
    ],
    trimLabel: "6.5\" × 9.25\"",
    isBible: true,
  },
  {
    id: "interlinear-bible",
    label: "Interlinear Bible",
    category: "Bible Editions",
    tagline: "Original Hebrew/Greek with word-for-word English below",
    description:
      "Original language text (Hebrew OT / Greek NT) with English word-for-word translation printed below each word. Strong's numbers and parsing codes. Single-column layout on thin-offset paper.",
    icon: "Languages",
    accentColor: "#92400e",
    styleId: "scripture-single-column",
    trimSizeId: "bible-wide-margin",
    bibleEditionTypeId: "interlinear",
    translationId: "kjv",
    paperTypeId: "thin-offset-40",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [1800, 2600],
    features: [
      "Original language text (Hebrew/Greek)",
      "Word-for-word English translation",
      "Strong's concordance numbers",
      "Parsing codes",
      "Single-column layout",
    ],
    exampleTitles: [
      "The Interlinear Bible (Jay P. Green)",
      "The Hebrew-Greek Key Word Study Bible",
    ],
    trimLabel: "6.5\" × 9.25\"",
    isBible: true,
  },
  {
    id: "gift-bible",
    label: "Gift Bible",
    category: "Bible Editions",
    tagline: "Premium presentation edition with gilded edges and ribbon",
    description:
      "Standard two-column layout with premium production values: gilded page edges, ribbon marker, flexible leather-look cover, and a presentation inscription page. The ideal gift edition.",
    icon: "Gift",
    accentColor: "#b45309",
    styleId: "scripture",
    trimSizeId: "bible-standard",
    bibleEditionTypeId: "gift",
    translationId: "kjv",
    paperTypeId: "india-24",
    bindingTypeId: "smyth-sewn-limp",
    pageCountRange: [1200, 1600],
    features: [
      "Gilded page edges",
      "Ribbon marker",
      "Flexible leather-look cover",
      "Presentation inscription page",
      "Two-column layout",
    ],
    exampleTitles: [
      "The Bride's Bible",
      "The Confirmation Bible",
      "The Family Heirloom Bible",
    ],
    trimLabel: "5.25\" × 8\"",
    isBible: true,
  },
  {
    id: "harmony-gospels",
    label: "Harmony of the Gospels",
    category: "Bible Editions",
    tagline: "Matthew, Mark, Luke, John arranged in parallel columns",
    description:
      "The four Gospels arranged in synchronized parallel columns so readers can compare the same events across all four accounts. Includes a harmony chart and cross-reference index.",
    icon: "LayoutGrid",
    accentColor: "#4f46e5",
    styleId: "scripture-single-column",
    trimSizeId: "bible-wide-margin",
    bibleEditionTypeId: "harmony",
    translationId: "kjv",
    paperTypeId: "india-28",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [600, 900],
    features: [
      "Four-column parallel layout",
      "Synchronized pericopes",
      "Harmony chart",
      "Cross-reference index",
    ],
    exampleTitles: [
      "A Harmony of the Gospels (Robertson)",
      "Gospel Parallels (Throckmorton)",
    ],
    trimLabel: "6.5\" × 9.25\"",
    isBible: true,
  },

  // ── Christian Living / Discipleship ─────────────────────────────────────────
  {
    id: "christian-living",
    label: "Christian Living / Discipleship",
    category: "Christian Living",
    tagline: "Practical faith application for everyday believers",
    description:
      "Standard trade paperback with Lora serif at 11.5pt. Chapter-based structure with application questions, pull quotes, and scripture references. The most common non-Bible format.",
    icon: "Cross",
    accentColor: "#7c3aed",
    styleId: "christian-living",
    trimSizeId: "6x9",
    paperTypeId: "cream-offset-60",
    bindingTypeId: "perfect-bound",
    pageCountRange: [160, 280],
    features: [
      "6\" × 9\" trade paperback",
      "Lora serif, 11.5pt",
      "Chapter application questions",
      "Pull quotes",
      "Scripture reference integration",
    ],
    exampleTitles: [
      "Experiencing God (Blackaby)",
      "The Purpose Driven Life (Warren)",
      "Mere Christianity (Lewis)",
    ],
    trimLabel: "6\" × 9\"",
    isBible: false,
  },
  {
    id: "discipleship-workbook",
    label: "Discipleship Workbook",
    category: "Christian Living",
    tagline: "Interactive study guide with fill-in exercises",
    description:
      "Workbook-style layout with generous white space for written responses, fill-in exercises, and group discussion questions. Spiral or perfect bound for ease of use in small-group settings.",
    icon: "ClipboardList",
    accentColor: "#0369a1",
    styleId: "christian-living",
    trimSizeId: "8.5x11",
    paperTypeId: "offset-50",
    bindingTypeId: "perfect-bound",
    pageCountRange: [80, 160],
    features: [
      "8.5\" × 11\" workbook format",
      "Fill-in response lines",
      "Group discussion questions",
      "Generous white space",
      "Scripture memory verses",
    ],
    exampleTitles: [
      "Experiencing God Workbook",
      "The Disciple-Making Church Workbook",
    ],
    trimLabel: "8.5\" × 11\"",
    isBible: false,
  },

  // ── Devotionals & Inspiration ────────────────────────────────────────────────
  {
    id: "daily-devotional",
    label: "Daily Devotional",
    category: "Devotionals & Inspiration",
    tagline: "365 short daily readings with scripture and reflection",
    description:
      "One reading per day, each 300–500 words, with an opening scripture verse, devotional body, and closing prayer or reflection prompt. EB Garamond with drop caps. Compact 5.5\" × 8.5\" format.",
    icon: "Sun",
    accentColor: "#d97706",
    styleId: "devotional",
    trimSizeId: "5.5x8.5",
    paperTypeId: "cream-offset-60",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [380, 420],
    features: [
      "5.5\" × 8.5\" format",
      "EB Garamond with drop caps",
      "Opening scripture verse per entry",
      "Closing prayer/reflection",
      "365-day structure",
    ],
    exampleTitles: [
      "My Utmost for His Highest (Chambers)",
      "Jesus Calling (Young)",
      "Morning and Evening (Spurgeon)",
    ],
    trimLabel: "5.5\" × 8.5\"",
    isBible: false,
  },
  {
    id: "inspirational-gift",
    label: "Inspirational Gift Book",
    category: "Devotionals & Inspiration",
    tagline: "Short, uplifting readings with generous white space",
    description:
      "Small-format gift book with short inspirational passages, scripture quotes, and generous white space for a premium feel. Often features full-color or two-color printing.",
    icon: "Sparkles",
    accentColor: "#db2777",
    styleId: "devotional",
    trimSizeId: "5x8",
    paperTypeId: "coated-80",
    bindingTypeId: "case-bound",
    pageCountRange: [80, 160],
    features: [
      "5\" × 8\" gift format",
      "Generous white space",
      "Scripture quotes",
      "Two-color or full-color printing",
      "Case-bound hardcover",
    ],
    exampleTitles: [
      "God Calling",
      "Streams in the Desert",
      "The Practice of the Presence of God",
    ],
    trimLabel: "5\" × 8\"",
    isBible: false,
  },

  // ── Children's Christian ─────────────────────────────────────────────────────
  {
    id: "childrens-christian-picture",
    label: "Children's Picture Book",
    category: "Children's Christian",
    tagline: "Full-color illustrated story for ages 3–7",
    description:
      "32-page full-color picture book format. Large Nunito text at 14pt with generous leading. Illustration-first layout with text integrated into the art. Coated 80lb paper, case-bound hardcover.",
    icon: "Image",
    accentColor: "#7c3aed",
    styleId: "childrens-christian",
    trimSizeId: "8.5x8.5",
    paperTypeId: "coated-80",
    bindingTypeId: "case-bound",
    pageCountRange: [24, 48],
    features: [
      "8.5\" × 8.5\" square format",
      "Full-color illustrations",
      "Nunito 14pt text",
      "Coated 80lb paper",
      "Case-bound hardcover",
    ],
    exampleTitles: [
      "The Very Hungry Caterpillar (Christian edition)",
      "God Made Me (Arch Books series)",
      "The Berenstain Bears and the Big Question",
    ],
    trimLabel: "8.5\" × 8.5\"",
    isBible: false,
  },
  {
    id: "childrens-christian-chapter",
    label: "Children's Chapter Book",
    category: "Children's Christian",
    tagline: "Faith-based chapter book for ages 8–12",
    description:
      "Chapter book format with Nunito 13pt text, generous leading, and chapter-opening illustrations. 5.5\" × 8.5\" trim. Perfect for middle-grade Christian fiction and non-fiction.",
    icon: "BookOpen",
    accentColor: "#0284c7",
    styleId: "childrens-christian",
    trimSizeId: "5.5x8.5",
    paperTypeId: "offset-50",
    bindingTypeId: "perfect-bound",
    pageCountRange: [120, 240],
    features: [
      "5.5\" × 8.5\" format",
      "Nunito 13pt text",
      "Chapter-opening illustrations",
      "Faith-based themes",
    ],
    exampleTitles: [
      "The Chronicles of Narnia (Lewis)",
      "The Sugar Creek Gang (Hutchens)",
      "Mandie and the Secret Tunnel (Leppard)",
    ],
    trimLabel: "5.5\" × 8.5\"",
    isBible: false,
  },

  // ── Prayer & Spiritual Practice ──────────────────────────────────────────────
  {
    id: "prayer-guide",
    label: "Prayer Guide",
    category: "Prayer & Spiritual Practice",
    tagline: "Structured prayer prompts and scripture-based intercession",
    description:
      "Compact format with Gentium Book Plus at 12pt. Structured prayer prompts, scripture passages, and space for personal prayer notes. Often used in prayer rooms and small groups.",
    icon: "HandsPraying",
    accentColor: "#4f46e5",
    styleId: "prayer-spiritual",
    trimSizeId: "5x8",
    paperTypeId: "cream-offset-60",
    bindingTypeId: "perfect-bound",
    pageCountRange: [80, 160],
    features: [
      "5\" × 8\" compact format",
      "Gentium Book Plus, 12pt",
      "Structured prayer prompts",
      "Scripture integration",
      "Personal notes space",
    ],
    exampleTitles: [
      "The Power of a Praying Wife (Omartian)",
      "Praying the Scriptures (Jodie Berndt)",
      "Too Busy Not to Pray (Hybels)",
    ],
    trimLabel: "5\" × 8\"",
    isBible: false,
  },
  {
    id: "spiritual-journal",
    label: "Spiritual Journal / Notebook",
    category: "Prayer & Spiritual Practice",
    tagline: "Guided journal with prompts, scripture, and ruled pages",
    description:
      "Guided journal with dated entry pages, opening scripture quote, reflection prompts, and ruled writing lines. Cream offset paper. Concealed Wire-O or smyth-sewn softcover.",
    icon: "NotebookPen",
    accentColor: "#b45309",
    styleId: "prayer-spiritual",
    trimSizeId: "6x9",
    paperTypeId: "cream-offset-60",
    bindingTypeId: "concealed-wire-o",
    pageCountRange: [160, 240],
    features: [
      "6\" × 9\" journal format",
      "Dated entry pages",
      "Opening scripture quote",
      "Reflection prompts",
      "Ruled writing lines",
    ],
    exampleTitles: [
      "The One Year Prayer Journal",
      "Streams in the Desert Journal",
    ],
    trimLabel: "6\" × 9\"",
    isBible: false,
  },

  // ── Pastoral & Ministry ──────────────────────────────────────────────────────
  {
    id: "pastoral-leadership",
    label: "Pastoral Leadership Book",
    category: "Pastoral & Ministry",
    tagline: "Practical ministry guidance for pastors and church leaders",
    description:
      "Standard trade format with Source Serif 4 at 11pt. Chapter-based with ministry case studies, scripture references, and leadership principles. Often includes foreword by a recognized ministry leader.",
    icon: "Church",
    accentColor: "#1d4ed8",
    styleId: "pastoral-ministry",
    trimSizeId: "6x9",
    paperTypeId: "offset-50",
    bindingTypeId: "perfect-bound",
    pageCountRange: [200, 320],
    features: [
      "6\" × 9\" trade format",
      "Source Serif 4, 11pt",
      "Ministry case studies",
      "Scripture references",
      "Leadership principles",
    ],
    exampleTitles: [
      "Spiritual Leadership (Sanders)",
      "The Making of a Leader (Clinton)",
      "Courageous Leadership (Hybels)",
    ],
    trimLabel: "6\" × 9\"",
    isBible: false,
  },
  {
    id: "sermon-resource",
    label: "Sermon Resource / Preaching Guide",
    category: "Pastoral & Ministry",
    tagline: "Expository outlines, illustrations, and application points",
    description:
      "Reference-style format with Source Serif 4. Organized by book of the Bible or topical series. Includes expository outlines, sermon illustrations, cross-references, and application points.",
    icon: "Mic",
    accentColor: "#0f766e",
    styleId: "pastoral-ministry",
    trimSizeId: "6x9",
    paperTypeId: "offset-50",
    bindingTypeId: "perfect-bound",
    pageCountRange: [240, 400],
    features: [
      "6\" × 9\" reference format",
      "Expository outlines",
      "Sermon illustrations",
      "Cross-references",
      "Application points",
    ],
    exampleTitles: [
      "The Preacher's Outline & Sermon Bible",
      "Expository Sermons on the Old Testament (Criswell)",
    ],
    trimLabel: "6\" × 9\"",
    isBible: false,
  },

  // ── Christian Biography ──────────────────────────────────────────────────────
  {
    id: "christian-biography",
    label: "Christian Biography / Testimony",
    category: "Christian Biography",
    tagline: "Narrative life story of a faith journey",
    description:
      "Narrative non-fiction format with Lora serif at 11pt and drop caps. Chapter-based chronological structure with photo insert section. Standard 6\" × 9\" trade format.",
    icon: "User",
    accentColor: "#92400e",
    styleId: "christian-biography",
    trimSizeId: "6x9",
    paperTypeId: "offset-50",
    bindingTypeId: "perfect-bound",
    pageCountRange: [200, 320],
    features: [
      "6\" × 9\" trade format",
      "Lora serif with drop caps",
      "Chronological narrative",
      "Photo insert section",
      "Chapter epigraphs",
    ],
    exampleTitles: [
      "Through Gates of Splendor (Elliot)",
      "The Hiding Place (ten Boom)",
      "Shadow of the Almighty (Elliot)",
    ],
    trimLabel: "6\" × 9\"",
    isBible: false,
  },
  {
    id: "missionary-memoir",
    label: "Missionary Memoir",
    category: "Christian Biography",
    tagline: "First-person account of mission work and faith",
    description:
      "First-person narrative memoir with Lora serif. Includes maps of mission field, photo section, and glossary of cultural terms. Often includes foreword by mission organization.",
    icon: "Globe",
    accentColor: "#0369a1",
    styleId: "christian-biography",
    trimSizeId: "5.5x8.5",
    paperTypeId: "offset-50",
    bindingTypeId: "perfect-bound",
    pageCountRange: [180, 280],
    features: [
      "5.5\" × 8.5\" format",
      "First-person narrative",
      "Mission field maps",
      "Photo section",
      "Cultural glossary",
    ],
    exampleTitles: [
      "Peace Child (Richardson)",
      "Bruchko (Olson)",
      "Lords of the Earth (Richardson)",
    ],
    trimLabel: "5.5\" × 8.5\"",
    isBible: false,
  },

  // ── Academic & Theological ───────────────────────────────────────────────────
  {
    id: "theological-commentary",
    label: "Theological Commentary",
    category: "Academic & Theological",
    tagline: "Verse-by-verse exegesis with footnotes and bibliography",
    description:
      "Academic format with Source Serif 4 at 10.5pt. Verse-by-verse exegesis, extensive footnotes, bibliography, scripture index, and subject index. Often part of a multi-volume series.",
    icon: "GraduationCap",
    accentColor: "#1d4ed8",
    styleId: "theological-academic",
    trimSizeId: "6x9",
    paperTypeId: "offset-50",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [400, 800],
    features: [
      "6\" × 9\" academic format",
      "Source Serif 4, 10.5pt",
      "Verse-by-verse exegesis",
      "Extensive footnotes",
      "Scripture and subject index",
      "Bibliography",
    ],
    exampleTitles: [
      "The New International Commentary on the NT",
      "The Expositor's Bible Commentary",
      "The Word Biblical Commentary",
    ],
    trimLabel: "6\" × 9\"",
    isBible: false,
  },
  {
    id: "systematic-theology",
    label: "Systematic Theology",
    category: "Academic & Theological",
    tagline: "Comprehensive doctrinal survey with scripture proofs",
    description:
      "Large-format academic text with Source Serif 4 at 10.5pt. Organized by doctrinal loci with scripture proof texts, historical theology notes, and extensive cross-references. Often 700+ pages.",
    icon: "Library",
    accentColor: "#4f46e5",
    styleId: "theological-academic",
    trimSizeId: "7x10",
    paperTypeId: "offset-50",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [600, 1200],
    features: [
      "7\" × 10\" academic format",
      "Doctrinal loci organization",
      "Scripture proof texts",
      "Historical theology notes",
      "Extensive cross-references",
      "Comprehensive index",
    ],
    exampleTitles: [
      "Systematic Theology (Grudem)",
      "Christian Theology (Erickson)",
      "Institutes of the Christian Religion (Calvin)",
    ],
    trimLabel: "7\" × 10\"",
    isBible: false,
  },
  {
    id: "seminary-textbook",
    label: "Seminary Textbook",
    category: "Academic & Theological",
    tagline: "Course textbook with learning objectives and review questions",
    description:
      "Textbook format with Source Serif 4. Chapter learning objectives, key terms highlighted, review questions, and suggested reading lists. Designed for seminary and Bible college courses.",
    icon: "BookMarked",
    accentColor: "#0f766e",
    styleId: "theological-academic",
    trimSizeId: "7x10",
    paperTypeId: "offset-50",
    bindingTypeId: "perfect-bound",
    pageCountRange: [300, 600],
    features: [
      "7\" × 10\" textbook format",
      "Chapter learning objectives",
      "Key terms highlighted",
      "Review questions",
      "Suggested reading lists",
    ],
    exampleTitles: [
      "Introduction to Biblical Hermeneutics",
      "New Testament Survey (Tenney)",
    ],
    trimLabel: "7\" × 10\"",
    isBible: false,
  },

  // ── Music & Audio ────────────────────────────────────────────────────────────
  {
    id: "hymnal",
    label: "Hymnal / Songbook",
    category: "Music & Audio",
    tagline: "Congregational hymns with music notation and lyrics",
    description:
      "Hymnal format with music notation (4-part SATB), lyrics, scripture references, and topical index. Pew-grade binding for heavy use. Standard hymnal size.",
    icon: "Music",
    accentColor: "#7c3aed",
    styleId: "music-audio-packaging",
    trimSizeId: "5.5x8.5",
    paperTypeId: "offset-50",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [400, 800],
    features: [
      "5.5\" × 8.5\" hymnal format",
      "4-part SATB notation",
      "Lyrics and scripture references",
      "Topical and first-line index",
      "Pew-grade binding",
    ],
    exampleTitles: [
      "The Baptist Hymnal",
      "Hymns of Grace",
      "The Celebration Hymnal",
    ],
    trimLabel: "5.5\" × 8.5\"",
    isBible: false,
  },
  {
    id: "worship-resource",
    label: "Worship Resource / Choir Book",
    category: "Music & Audio",
    tagline: "Choral arrangements, liturgy, and worship planning",
    description:
      "Choir and worship leader resource with choral arrangements, liturgical texts, worship planning guides, and seasonal content. Spiral or saddle-stitch for music stand use.",
    icon: "Music2",
    accentColor: "#db2777",
    styleId: "music-audio-packaging",
    trimSizeId: "8.5x11",
    paperTypeId: "offset-50",
    bindingTypeId: "perfect-bound",
    pageCountRange: [80, 200],
    features: [
      "8.5\" × 11\" music stand format",
      "Choral arrangements",
      "Liturgical texts",
      "Worship planning guides",
      "Seasonal content",
    ],
    exampleTitles: [
      "The Worship Leader's Handbook",
      "Choral Praise (Lifeway)",
    ],
    trimLabel: "8.5\" × 11\"",
    isBible: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCDPTemplatesByCategory(
  category: CDPTemplateCategory
): CDPTemplate[] {
  return CDP_TEMPLATES.filter((t) => t.category === category);
}

export function getCDPTemplate(id: string): CDPTemplate | undefined {
  return CDP_TEMPLATES.find((t) => t.id === id);
}

export const CDP_TEMPLATE_CATEGORIES: CDPTemplateCategory[] = [
  "Bible Editions",
  "Christian Living",
  "Devotionals & Inspiration",
  "Children's Christian",
  "Prayer & Spiritual Practice",
  "Pastoral & Ministry",
  "Christian Biography",
  "Academic & Theological",
  "Music & Audio",
];
