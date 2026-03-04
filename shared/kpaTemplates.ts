/**
 * Koechel Peterson & Associates Book Templates
 *
 * Koechel Peterson & Associates (KP&A) was a premier Minneapolis-based book design
 * firm founded by David Koechel and John Peterson in 1974 (incorporated 1978).
 * Over five decades, KP&A provided cover design, interior layout, and typesetting
 * for major Christian publishers including Harvest House, Tyndale, Bethany House,
 * Multnomah/WaterBrook, Thomas Nelson, Precept Ministries, and Bronze Bow Publishing.
 *
 * David Koechel received the ECPA Jordan Lifetime Achievement Award in 2011 for
 * "changing the look of Christian publishing."
 *
 * These templates reproduce the production specs of actual KP&A-designed titles
 * so users can recreate books in the same style.
 */

export type KPATemplateCategory =
  | "Inductive Study Bible"
  | "Recovery Bible"
  | "Gift & Devotional"
  | "Christian Living"
  | "Inspirational Gift Book"
  | "Women's Christian Living"
  | "Men's Christian Living"
  | "Prayer & Spiritual Life"
  | "Children's Gift Book"
  | "Fitness & Health"
  | "Christian Fiction"
  | "Apologetics & Theology";

export type KPATemplate = {
  id: string;
  label: string;
  category: KPATemplateCategory;
  description: string;
  tagline: string;
  icon: string;
  accentColor: string;
  /** Auto-Produce style ID */
  styleId: string;
  /** Trim size ID */
  trimSizeId: string;
  /** Paper type ID */
  paperTypeId: string;
  /** Binding type ID */
  bindingTypeId: string;
  /** Typical page count range */
  pageCountRange: [number, number];
  /** Key formatting features */
  features: string[];
  /** Actual KP&A-designed titles that match this template */
  kpaTitles: {
    title: string;
    author: string;
    publisher: string;
    year: number;
    isbn?: string;
    pages?: number;
    designCredit: "cover" | "cover+interior" | "full";
  }[];
  trimLabel: string;
  isBible: boolean;
};

export const KPA_TEMPLATES: KPATemplate[] = [
  // ── Inductive Study Bibles ────────────────────────────────────────────────────
  {
    id: "kpa-new-inductive-study-bible",
    label: "New Inductive Study Bible",
    category: "Inductive Study Bible",
    tagline: "Full cover, interior design, and typesetting by KP&A",
    description:
      "KP&A's most comprehensive Bible design project. The New Inductive Study Bible (Precept Ministries / Harvest House) features full cover design, interior layout, and typesetting by Koechel Peterson & Associates. Two-column scripture text, wide margins for inductive study notes, Tabernacle and Temple illustrations by Stanley C. Stein, and full-color maps. Available in NASB and ESV editions.",
    icon: "BookOpen",
    accentColor: "#7c3aed",
    styleId: "scripture-wide-margin",
    trimSizeId: "bible-wide-margin",
    paperTypeId: "india-28",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [2200, 2300],
    features: [
      "Two-column scripture text",
      "Wide margins for inductive study notes",
      "Tabernacle and Temple illustrations",
      "Full-color maps",
      "Book introductions",
      "Concordance",
      "KP&A full cover + interior + typesetting",
    ],
    kpaTitles: [
      {
        title: "The New Inductive Study Bible (NASB)",
        author: "Precept Ministries International",
        publisher: "Harvest House Publishers",
        year: 2000,
        isbn: "9780736907972",
        pages: 2288,
        designCredit: "full",
      },
      {
        title: "The New Inductive Study Bible (ESV)",
        author: "Precept Ministries International",
        publisher: "Harvest House Publishers",
        year: 2013,
        isbn: "9780736957212",
        pages: 2288,
        designCredit: "full",
      },
      {
        title: "The New Inductive Study Bible (NASB, updated)",
        author: "Precept Ministries International",
        publisher: "Harvest House Publishers",
        year: 2013,
        isbn: "9780736957175",
        designCredit: "full",
      },
    ],
    trimLabel: "6.5\" × 9.25\"",
    isBible: true,
  },

  // ── Recovery Bible ────────────────────────────────────────────────────────────
  {
    id: "kpa-life-recovery-bible",
    label: "Life Recovery Bible",
    category: "Recovery Bible",
    tagline: "Recovery-focused Bible with 12-step study notes — cover by KP&A",
    description:
      "The Life Recovery Bible (Tyndale House) is a New Living Translation Bible with recovery-focused study notes, 12-step profiles, and topical articles integrated throughout. KP&A provided cover design. The interior features single-column NLT text with recovery notes in the margins and a recovery concordance.",
    icon: "Heart",
    accentColor: "#0369a1",
    styleId: "scripture",
    trimSizeId: "bible-standard",
    paperTypeId: "india-28",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [1400, 1600],
    features: [
      "Single-column NLT text",
      "Recovery-focused study notes",
      "12-step profiles throughout",
      "Topical recovery articles",
      "Recovery concordance",
      "KP&A cover design",
    ],
    kpaTitles: [
      {
        title: "The Life Recovery Bible (NLT)",
        author: "Stephen Arterburn & David Stoop",
        publisher: "Tyndale House Publishers",
        year: 1998,
        isbn: "9781414381503",
        designCredit: "cover",
      },
      {
        title: "The Life Recovery Bible (NLT, updated)",
        author: "Stephen Arterburn & David Stoop",
        publisher: "Tyndale House Publishers",
        year: 2014,
        isbn: "9781414387574",
        designCredit: "cover",
      },
    ],
    trimLabel: "5.25\" × 8\"",
    isBible: true,
  },

  // ── Gift & Devotional ─────────────────────────────────────────────────────────
  {
    id: "kpa-his-princess",
    label: "His Princess: Gift Devotional",
    category: "Gift & Devotional",
    tagline: "Full cover + interior design by KP&A — 192pp hardcover gift book",
    description:
      "His Princess: Love Letters from Your King (Multnomah Gifts, 2004) is a 192-page hardcover gift devotional by Sheri Rose Shepherd. KP&A provided full cover and interior design. The format features short devotional letters written as if from God to the reader, with decorative borders, pull quotes, and a gift-book aesthetic. Standard 5.5\" × 8.5\" hardcover with Smyth-sewn binding.",
    icon: "Crown",
    accentColor: "#db2777",
    styleId: "devotional",
    trimSizeId: "5.5x8.5",
    paperTypeId: "cream-offset-60",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [180, 200],
    features: [
      "5.5\" × 8.5\" hardcover gift format",
      "Short devotional letter format",
      "Decorative borders and pull quotes",
      "Gift-book aesthetic",
      "Smyth-sewn hardcover",
      "KP&A full cover + interior design",
    ],
    kpaTitles: [
      {
        title: "His Princess: Love Letters from Your King",
        author: "Sheri Rose Shepherd",
        publisher: "Multnomah Gifts",
        year: 2004,
        isbn: "1590523318",
        pages: 192,
        designCredit: "cover+interior",
      },
    ],
    trimLabel: "5.5\" × 8.5\"",
    isBible: false,
  },
  {
    id: "kpa-inspirational-gift-book",
    label: "Inspirational Gift Book (Hallmark / Gift)",
    category: "Inspirational Gift Book",
    tagline: "Short-form gift book with photography and inspirational text",
    description:
      "KP&A designed several short-form inspirational gift books for Hallmark and similar gift publishers. These feature photography or illustration integrated with short inspirational text, typically 64–128 pages, hardcover, in a compact square or portrait format.",
    icon: "Gift",
    accentColor: "#d97706",
    styleId: "devotional",
    trimSizeId: "5.5x8.5",
    paperTypeId: "coated-80",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [64, 128],
    features: [
      "Compact gift format",
      "Photography or illustration integrated",
      "Short inspirational text",
      "Full-color printing",
      "Hardcover gift binding",
    ],
    kpaTitles: [
      {
        title: "If Only I Knew",
        author: "Lance Wubbels",
        publisher: "Hallmark Books",
        year: 2002,
        designCredit: "full",
      },
      {
        title: "No Limits But the Sky",
        author: "Hallmark Cards, Inc.",
        publisher: "Hallmark Books",
        year: 2002,
        designCredit: "full",
      },
      {
        title: "Dance While You Can",
        author: "Koechel Peterson and Associates",
        publisher: "Hallmark Books",
        year: 2006,
        designCredit: "full",
      },
      {
        title: "The Heart of Easter",
        author: "David W. Rose",
        publisher: "Hallmark Books",
        year: 2005,
        designCredit: "full",
      },
    ],
    trimLabel: "5.5\" × 8.5\"",
    isBible: false,
  },

  // ── Women's Christian Living ──────────────────────────────────────────────────
  {
    id: "kpa-womens-christian-living",
    label: "Women's Christian Living",
    category: "Women's Christian Living",
    tagline: "Trade paperback for Christian women — cover by KP&A",
    description:
      "KP&A designed covers for numerous women's Christian living titles published by Harvest House. These are standard 6\" × 9\" trade paperbacks with warm, feminine cover aesthetics, chapter-based structure, application questions, and scripture integration.",
    icon: "Users",
    accentColor: "#db2777",
    styleId: "christian-living",
    trimSizeId: "6x9",
    paperTypeId: "cream-offset-60",
    bindingTypeId: "perfect-bound",
    pageCountRange: [160, 240],
    features: [
      "6\" × 9\" trade paperback",
      "Chapter-based structure",
      "Application questions",
      "Scripture integration",
      "Warm feminine cover aesthetic",
      "KP&A cover design",
    ],
    kpaTitles: [
      {
        title: "Youniquely Woman",
        author: "Kay Arthur, Emilie Barnes, Donna Otto",
        publisher: "Harvest House Publishers",
        year: 2008,
        isbn: "9780736917261",
        designCredit: "cover",
      },
      {
        title: "Liberated Through Submission",
        author: "P.B. Wilson",
        publisher: "Harvest House Publishers",
        year: 1990,
        isbn: "9780736918879",
        pages: 192,
        designCredit: "cover",
      },
      {
        title: "Why Did This Happen to Me?",
        author: "Kay Arthur",
        publisher: "Harvest House Publishers",
        year: 2008,
        isbn: "9780736954471",
        designCredit: "cover",
      },
      {
        title: "A Woman in the Making",
        author: "Lance Wubbels",
        publisher: "Thomas Nelson",
        year: 2003,
        isbn: "9781404100206",
        pages: 64,
        designCredit: "full",
      },
    ],
    trimLabel: "6\" × 9\"",
    isBible: false,
  },

  // ── Men's Christian Living ────────────────────────────────────────────────────
  {
    id: "kpa-mens-christian-living",
    label: "Men's Christian Living",
    category: "Men's Christian Living",
    tagline: "Trade paperback for Christian men — cover by KP&A",
    description:
      "KP&A designed covers for men's Christian living titles, including ECPA award-winning designs. These are standard 6\" × 9\" trade paperbacks with bold, masculine cover aesthetics, chapter-based structure, and practical application.",
    icon: "User",
    accentColor: "#1d4ed8",
    styleId: "christian-living",
    trimSizeId: "6x9",
    paperTypeId: "offset-50",
    bindingTypeId: "perfect-bound",
    pageCountRange: [160, 220],
    features: [
      "6\" × 9\" trade paperback",
      "Bold masculine cover aesthetic",
      "Chapter-based structure",
      "Practical application sections",
      "KP&A cover design (ECPA award winner)",
    ],
    kpaTitles: [
      {
        title: "What Every Man Wishes His Father Had Told Him",
        author: "Byron Forrest Yawn",
        publisher: "Harvest House Publishers",
        year: 2012,
        isbn: "9780736946384",
        pages: 190,
        designCredit: "cover",
      },
    ],
    trimLabel: "6\" × 9\"",
    isBible: false,
  },

  // ── Prayer & Spiritual Life ───────────────────────────────────────────────────
  {
    id: "kpa-prayer-book",
    label: "Prayer & Spiritual Life",
    category: "Prayer & Spiritual Life",
    tagline: "Devotional prayer book — cover by KP&A",
    description:
      "KP&A designed covers for prayer and spiritual life books published by NavPress and Harvest House. These are compact 5.5\" × 8.5\" or 6\" × 9\" trade paperbacks with a contemplative aesthetic, short chapters, and prayer prompts.",
    icon: "BookHeart",
    accentColor: "#0f766e",
    styleId: "prayer-spiritual-practice",
    trimSizeId: "5.5x8.5",
    paperTypeId: "cream-offset-60",
    bindingTypeId: "perfect-bound",
    pageCountRange: [160, 240],
    features: [
      "Compact devotional format",
      "Short chapters with prayer prompts",
      "Contemplative aesthetic",
      "Scripture integration",
      "KP&A cover design",
    ],
    kpaTitles: [
      {
        title: "Prayers to the Holy Spirit: Power and Light for Your Life",
        author: "Various",
        publisher: "NavPress",
        year: 2005,
        designCredit: "cover",
      },
      {
        title: "The Power of a Praying Mom 3-in-1 Collection",
        author: "Stormie Omartian",
        publisher: "Harvest House Publishers",
        year: 2011,
        isbn: "9780736946612",
        designCredit: "cover",
      },
    ],
    trimLabel: "5.5\" × 8.5\"",
    isBible: false,
  },

  // ── Inductive Bible Study Guides ──────────────────────────────────────────────
  {
    id: "kpa-inductive-study-guide",
    label: "New Inductive Study Series (NISS)",
    category: "Inductive Study Bible",
    tagline: "Precept Ministries inductive study guides — cover by KP&A",
    description:
      "The New Inductive Study Series (Harvest House / Precept Ministries) are individual book-of-the-Bible inductive study guides. KP&A designed the covers for the entire series. These are compact 5.5\" × 8.5\" trade paperbacks with observation, interpretation, and application sections for each passage.",
    icon: "Search",
    accentColor: "#7c3aed",
    styleId: "christian-living",
    trimSizeId: "5.5x8.5",
    paperTypeId: "offset-50",
    bindingTypeId: "perfect-bound",
    pageCountRange: [80, 160],
    features: [
      "5.5\" × 8.5\" study guide format",
      "Observation / Interpretation / Application structure",
      "Inductive study questions",
      "Scripture charts and outlines",
      "KP&A cover design (full series)",
    ],
    kpaTitles: [
      {
        title: "God, Are You There? (NISS)",
        author: "Kay Arthur",
        publisher: "Harvest House Publishers",
        year: 1994,
        isbn: "9780736907972",
        designCredit: "cover",
      },
      {
        title: "God's Blueprint for Bible Prophecy (NISS)",
        author: "Kay Arthur",
        publisher: "Precept Ministries",
        year: 2000,
        designCredit: "cover",
      },
      {
        title: "The God Who Cares and Knows You (NISS)",
        author: "Kay Arthur",
        publisher: "Precept Ministries",
        year: 2008,
        designCredit: "cover",
      },
      {
        title: "Desiring God's Own Heart (NISS)",
        author: "Kay Arthur",
        publisher: "Precept Ministries",
        year: 2000,
        designCredit: "cover",
      },
    ],
    trimLabel: "5.5\" × 8.5\"",
    isBible: false,
  },

  // ── Christian Living (General) ────────────────────────────────────────────────
  {
    id: "kpa-christian-living-general",
    label: "Christian Living (General Trade)",
    category: "Christian Living",
    tagline: "General Christian living trade paperback — cover by KP&A",
    description:
      "KP&A designed covers for a wide range of general Christian living titles across multiple publishers. These are standard 6\" × 9\" trade paperbacks with chapter-based structure and practical faith application.",
    icon: "BookOpen",
    accentColor: "#059669",
    styleId: "christian-living",
    trimSizeId: "6x9",
    paperTypeId: "offset-50",
    bindingTypeId: "perfect-bound",
    pageCountRange: [160, 280],
    features: [
      "6\" × 9\" trade paperback",
      "Chapter-based structure",
      "Practical faith application",
      "KP&A cover design",
    ],
    kpaTitles: [
      {
        title: "Becoming Who You Are: Embracing the Power of Your Identity in Christ",
        author: "Dutch Sheets",
        publisher: "Bethany House Publishers",
        year: 2010,
        pages: 207,
        designCredit: "cover",
      },
      {
        title: "9 Keys to Successful Leadership",
        author: "James Merritt",
        publisher: "Harvest House Publishers",
        year: 2002,
        designCredit: "cover",
      },
      {
        title: "In the Wilderness",
        author: "Ron DiCianni & Lance Wubbels",
        publisher: "Destiny Image Publishers",
        year: 2013,
        isbn: "9780768442168",
        designCredit: "cover",
      },
      {
        title: "Hope Against Hope: The Anchor of Our Soul",
        author: "Nancy Missler",
        publisher: "King's High Way Ministries",
        year: 2014,
        isbn: "9780990657101",
        designCredit: "cover",
      },
    ],
    trimLabel: "6\" × 9\"",
    isBible: false,
  },

  // ── Apologetics & Theology ────────────────────────────────────────────────────
  {
    id: "kpa-apologetics",
    label: "Apologetics & Theology",
    category: "Apologetics & Theology",
    tagline: "Theological trade book — cover or full design by KP&A",
    description:
      "KP&A designed covers and interiors for apologetics and theology titles. These are typically 6\" × 9\" trade paperbacks or hardcovers with academic-quality typesetting, footnotes, and bibliography.",
    icon: "GraduationCap",
    accentColor: "#1d4ed8",
    styleId: "theological-academic",
    trimSizeId: "6x9",
    paperTypeId: "offset-50",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [200, 400],
    features: [
      "6\" × 9\" trade or academic format",
      "Footnotes and bibliography",
      "Academic-quality typesetting",
      "KP&A cover or full design",
    ],
    kpaTitles: [
      {
        title: "Jerusalem Rising: The City of Peace Reawakens",
        author: "Aaron Klein",
        publisher: "Tyndale House Publishers",
        year: 2021,
        isbn: "9781496453907",
        pages: 208,
        designCredit: "full",
      },
      {
        title: "Trusting in the Names of God",
        author: "Kay Arthur",
        publisher: "Thomas Nelson",
        year: 1982,
        designCredit: "cover",
      },
    ],
    trimLabel: "6\" × 9\"",
    isBible: false,
  },

  // ── Fitness & Health ──────────────────────────────────────────────────────────
  {
    id: "kpa-fitness-health",
    label: "Fitness & Health (Bronze Bow)",
    category: "Fitness & Health",
    tagline: "Fitness trade book with full design by KP&A for Bronze Bow",
    description:
      "KP&A provided literary development and full cover/interior design for fitness and health titles published by Bronze Bow Publishing. These are typically 6\" × 9\" or 7\" × 10\" trade paperbacks with exercise illustrations, training programs, and instructional photography.",
    icon: "Dumbbell",
    accentColor: "#dc2626",
    styleId: "christian-living",
    trimSizeId: "6x9",
    paperTypeId: "coated-80",
    bindingTypeId: "perfect-bound",
    pageCountRange: [200, 320],
    features: [
      "6\" × 9\" or 7\" × 10\" format",
      "Exercise illustrations",
      "Training programs",
      "Instructional photography",
      "KP&A full literary development + design",
    ],
    kpaTitles: [
      {
        title: "Navy SEAL Breakthrough to Master Level Fitness",
        author: "Mark De Lisle",
        publisher: "Bronze Bow Publishing",
        year: 2002,
        isbn: "9781932458176",
        designCredit: "full",
      },
      {
        title: "Isometric Power Revolution",
        author: "John E. Peterson",
        publisher: "Bronze Bow Publishing",
        year: 2007,
        designCredit: "cover",
      },
    ],
    trimLabel: "6\" × 9\"",
    isBible: false,
  },

  // ── Illustrated Gift / Coffee Table ──────────────────────────────────────────
  {
    id: "kpa-illustrated-gift",
    label: "Illustrated Gift / Coffee Table Book",
    category: "Inspirational Gift Book",
    tagline: "Full-color illustrated gift book — full design by KP&A",
    description:
      "KP&A designed full-color illustrated gift and coffee table books, including The Heavens Proclaim His Glory (Thomas Nelson, 2010). These feature full-bleed photography, minimal text, large-format printing on coated stock, and premium binding.",
    icon: "Image",
    accentColor: "#7c3aed",
    styleId: "devotional",
    trimSizeId: "8.5x11",
    paperTypeId: "coated-80",
    bindingTypeId: "smyth-sewn-hardcover",
    pageCountRange: [128, 200],
    features: [
      "Large format (8.5\" × 11\" or similar)",
      "Full-bleed photography",
      "Minimal text overlay",
      "Coated stock printing",
      "Premium hardcover binding",
      "KP&A full design",
    ],
    kpaTitles: [
      {
        title: "The Heavens Proclaim His Glory",
        author: "Lisa Stilwell",
        publisher: "Thomas Nelson",
        year: 2010,
        isbn: "9781404189584",
        pages: 166,
        designCredit: "full",
      },
    ],
    trimLabel: "8.5\" × 11\"",
    isBible: false,
  },

  // ── Christian Fiction ─────────────────────────────────────────────────────────
  {
    id: "kpa-christian-fiction",
    label: "Christian Fiction",
    category: "Christian Fiction",
    tagline: "Christian fiction trade paperback — cover by KP&A",
    description:
      "KP&A designed covers for Christian fiction titles published by Bethany House and other publishers. These are standard 5.5\" × 8.5\" trade paperbacks with narrative typesetting and chapter-based structure.",
    icon: "BookText",
    accentColor: "#92400e",
    styleId: "literary-fiction",
    trimSizeId: "5.5x8.5",
    paperTypeId: "cream-offset-60",
    bindingTypeId: "perfect-bound",
    pageCountRange: [280, 400],
    features: [
      "5.5\" × 8.5\" trade paperback",
      "Narrative typesetting",
      "Chapter-based structure",
      "KP&A cover design",
    ],
    kpaTitles: [
      {
        title: "The Best Intentions (Najlepsze chęci)",
        author: "Various",
        publisher: "Bethany House Publishers",
        year: 2018,
        designCredit: "cover",
      },
    ],
    trimLabel: "5.5\" × 8.5\"",
    isBible: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getKPATemplatesByCategory(
  category: KPATemplateCategory
): KPATemplate[] {
  return KPA_TEMPLATES.filter((t) => t.category === category);
}

export function getKPATemplate(id: string): KPATemplate | undefined {
  return KPA_TEMPLATES.find((t) => t.id === id);
}

export const KPA_TEMPLATE_CATEGORIES: KPATemplateCategory[] = [
  "Inductive Study Bible",
  "Recovery Bible",
  "Gift & Devotional",
  "Inspirational Gift Book",
  "Women's Christian Living",
  "Men's Christian Living",
  "Prayer & Spiritual Life",
  "Christian Living",
  "Apologetics & Theology",
  "Fitness & Health",
  "Christian Fiction",
];

/** All unique KP&A-designed titles across all templates */
export const KPA_ALL_TITLES = KPA_TEMPLATES.flatMap((t) =>
  t.kpaTitles.map((book) => ({ ...book, templateId: t.id, templateLabel: t.label }))
);
