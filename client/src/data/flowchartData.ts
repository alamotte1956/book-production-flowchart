/*
 * Book Production Flowchart Data
 * Design: "Easy Book Publishers" — Artisan Storybook Aesthetic
 * Each phase is a chapter, each step is a station with inputs
 */

export interface StepInput {
  name: string;
  description: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  inputs: StepInput[];
  icon: string; // Lucide icon name
  resourceSection: string; // anchor id on the /resources page
  estimatedDays: number; // industry-standard estimated duration in business days
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  color: string; // Tailwind-compatible color class
  bgColor: string;
  borderColor: string;
  accentColor: string;
  image?: string;
  steps: Step[];
}

export const phases: Phase[] = [
  {
    id: "concept",
    number: 1,
    title: "Concept & Manuscript",
    subtitle: "From spark of inspiration to completed draft",
    color: "text-[#5c3d2e]",
    bgColor: "bg-[#f3efe6]",
    borderColor: "border-[#c9a96e]",
    accentColor: "#c9a96e",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/phase-writing-eragubXYYMQLPBc4SUTHfM.webp",
    steps: [
      {
        id: "idea",
        title: "Idea Generation & Research",
        description: "The journey begins with a spark — an idea that demands to be written. The author researches the market, studies the genre, and identifies the audience who will one day hold this book.",
        inputs: [
          { name: "Market Research", description: "Analysis of current trends, bestseller lists, and genre demand" },
          { name: "Genre Analysis", description: "Study of conventions, reader expectations, and competitive titles" },
          { name: "Target Audience Profile", description: "Demographics, reading habits, and preferences of intended readers" },
          { name: "Author Expertise", description: "Subject matter knowledge, unique perspective, and platform" },
        ],
        icon: "Lightbulb",
        resourceSection: "writing",
        estimatedDays: 14,
      },
      {
        id: "writing",
        title: "Writing the Manuscript",
        description: "Words flow onto the page as the author transforms ideas into chapters. This is the longest and most solitary phase — the raw creation of the book's content.",
        inputs: [
          { name: "Detailed Outline", description: "Chapter-by-chapter structure with key plot points or arguments" },
          { name: "Research Materials", description: "Primary and secondary sources, interviews, and reference documents" },
          { name: "Style Guide", description: "Voice, tone, and stylistic conventions for the work" },
          { name: "Writing Tools", description: "Word processor, reference manager, and backup systems" },
        ],
        icon: "PenTool",
        resourceSection: "writing",
        estimatedDays: 180,
      },
      {
        id: "self-edit",
        title: "Author Self-Editing",
        description: "The author steps back, then returns with fresh eyes to revise, restructure, and polish their own work before anyone else sees it.",
        inputs: [
          { name: "Draft Manuscript", description: "The complete first draft requiring revision" },
          { name: "Beta Reader Feedback", description: "Early reader reactions, confusion points, and suggestions" },
          { name: "Craft Knowledge", description: "Understanding of pacing, dialogue, structure, and prose quality" },
        ],
        icon: "FileEdit",
        resourceSection: "editorial",
        estimatedDays: 30,
      },
    ],
  },
  {
    id: "acquisitions",
    number: 2,
    title: "Acquisitions & Contracts",
    subtitle: "Finding the right publishing home",
    color: "text-[#7a2e3a]",
    bgColor: "bg-[#fdf5f6]",
    borderColor: "border-[#7a2e3a]",
    accentColor: "#7a2e3a",
    steps: [
      {
        id: "proposal",
        title: "Book Proposal / Query",
        description: "The author crafts a compelling pitch — a query letter and proposal package that must capture the essence of the book in just a few pages.",
        inputs: [
          { name: "Query Letter", description: "One-page pitch with hook, synopsis, and author credentials" },
          { name: "Book Synopsis", description: "Complete plot summary or argument overview" },
          { name: "Sample Chapters", description: "Polished opening chapters demonstrating voice and quality" },
          { name: "Author Platform Info", description: "Social media following, speaking engagements, and credentials" },
        ],
        icon: "Send",
        resourceSection: "acquisitions",
        estimatedDays: 10,
      },
      {
        id: "review",
        title: "Agent Review & Publisher Submission",
        description: "Literary agents evaluate the proposal, then champion it to publishers. Editors at publishing houses read, discuss, and decide whether to acquire the title.",
        inputs: [
          { name: "Proposal Package", description: "Complete submission materials from the author" },
          { name: "Market Analysis", description: "Sales projections, comparable titles, and market positioning" },
          { name: "Comparable Titles", description: "Recent successful books in the same category for benchmarking" },
          { name: "Editorial Vision", description: "The editor's plan for developing and positioning the book" },
        ],
        icon: "Search",
        resourceSection: "acquisitions",
        estimatedDays: 90,
      },
      {
        id: "contract",
        title: "Contract Negotiation & Signing",
        description: "Terms are hammered out — advance, royalties, rights, and deadlines. The handshake that formally begins the publishing partnership.",
        inputs: [
          { name: "Rights Terms", description: "Territory, format, and subsidiary rights being licensed" },
          { name: "Advance Amount", description: "Upfront payment against future royalties" },
          { name: "Royalty Rates", description: "Percentage of sales revenue paid to the author" },
          { name: "Delivery Deadlines", description: "Manuscript due dates and publication timeline" },
        ],
        icon: "FileSignature",
        resourceSection: "acquisitions",
        estimatedDays: 21,
      },
    ],
  },
  {
    id: "editorial",
    number: 3,
    title: "Editorial Process",
    subtitle: "Shaping the manuscript into its finest form",
    color: "text-[#2d4a3e]",
    bgColor: "bg-[#f4f8f5]",
    borderColor: "border-[#2d4a3e]",
    accentColor: "#2d4a3e",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/phase-editing-KCiC8sqWjyAtGhBafvvoj4.webp",
    steps: [
      {
        id: "dev-edit",
        title: "Developmental Editing",
        description: "The big-picture edit. A developmental editor examines structure, pacing, character arcs, and argument flow — reshaping the book at its deepest level.",
        inputs: [
          { name: "Complete Manuscript", description: "The full text ready for structural evaluation" },
          { name: "Editorial Vision", description: "Publisher's goals for the book's direction and market fit" },
          { name: "Genre Conventions", description: "Reader expectations and structural norms for the category" },
          { name: "Market Positioning", description: "How the book should be differentiated from competitors" },
        ],
        icon: "Layers",
        resourceSection: "editorial",
        estimatedDays: 30,
      },
      {
        id: "line-edit",
        title: "Line Editing",
        description: "Sentence by sentence, the line editor refines prose — tightening language, enhancing rhythm, and ensuring the author's voice sings clearly throughout.",
        inputs: [
          { name: "Revised Manuscript", description: "Post-developmental edit version with structural changes applied" },
          { name: "Style Sheet", description: "Document tracking style decisions, spelling choices, and conventions" },
          { name: "Voice & Tone Guidelines", description: "Parameters for maintaining the author's unique voice" },
        ],
        icon: "AlignLeft",
        resourceSection: "editorial",
        estimatedDays: 21,
      },
      {
        id: "copyedit",
        title: "Copyediting",
        description: "The meticulous pass for grammar, punctuation, consistency, and fact-checking. Copyeditors are the guardians of accuracy and house style.",
        inputs: [
          { name: "Edited Manuscript", description: "Line-edited text ready for technical polish" },
          { name: "House Style Guide", description: "Publisher's rules for spelling, punctuation, and formatting" },
          { name: "Style Sheet", description: "Book-specific decisions on names, terms, and conventions" },
          { name: "Fact-Checking Resources", description: "Reference materials for verifying claims and details" },
        ],
        icon: "CheckSquare",
        resourceSection: "editorial",
        estimatedDays: 14,
      },
      {
        id: "author-review",
        title: "Author Review of Edits",
        description: "The manuscript returns to the author with tracked changes. They accept, reject, or negotiate each edit — the final say on their own words.",
        inputs: [
          { name: "Tracked-Changes Manuscript", description: "Document showing all editorial modifications" },
          { name: "Style Sheet", description: "Record of all style decisions made during editing" },
          { name: "Editor Notes", description: "Queries and suggestions requiring author decisions" },
        ],
        icon: "MessageSquare",
        resourceSection: "editorial",
        estimatedDays: 14,
      },
    ],
  },
  {
    id: "design",
    number: 4,
    title: "Design & Layout",
    subtitle: "Giving the book its visual identity",
    color: "text-[#6b4c8a]",
    bgColor: "bg-[#f8f5fc]",
    borderColor: "border-[#6b4c8a]",
    accentColor: "#6b4c8a",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/phase-design-6k4KQa6w8D6V9irHtVx3Yh.webp",
    steps: [
      {
        id: "text-design",
        title: "Interior Text Design",
        description: "The text designer crafts the reading experience — choosing fonts, margins, spacing, and decorative elements that make the interior both beautiful and readable.",
        inputs: [
          { name: "Final Manuscript", description: "Approved text content ready for design treatment" },
          { name: "Trim Size Specs", description: "Physical dimensions of the book (e.g., 6×9 inches)" },
          { name: "Genre Conventions", description: "Visual expectations for the book's category" },
          { name: "Font Selections", description: "Typeface options for body text, headings, and display" },
          { name: "Margin & Spacing Specs", description: "Gutter, margins, leading, and paragraph spacing" },
        ],
        icon: "Type",
        resourceSection: "design",
        estimatedDays: 10,
      },
      {
        id: "cover-design",
        title: "Cover & Jacket Design",
        description: "The book's face to the world. Jacket designers create the front cover, back cover, spine, and flaps — the single most important marketing asset.",
        inputs: [
          { name: "Book Synopsis", description: "Summary for back cover copy and design inspiration" },
          { name: "Genre Expectations", description: "Visual trends and conventions in the book's category" },
          { name: "Author Branding", description: "Existing author identity, previous covers, and preferences" },
          { name: "Marketing Input", description: "Positioning strategy and target audience visual preferences" },
          { name: "Cover Art / Photography", description: "Commissioned illustrations, stock images, or photo shoots" },
        ],
        icon: "Image",
        resourceSection: "design",
        estimatedDays: 21,
      },
      {
        id: "typesetting",
        title: "Typesetting & Composition",
        description: "The compositor takes the designed template and flows the text into it, creating the actual pages of the book — every line break, page break, and widow carefully managed.",
        inputs: [
          { name: "Final Edited Manuscript", description: "Approved text with all editorial changes incorporated" },
          { name: "Approved Text Design", description: "Interior design template with all specifications" },
          { name: "Design Specs", description: "Detailed parameters for headers, footers, folios, and ornaments" },
          { name: "Compositor Software", description: "InDesign, LaTeX, or other professional typesetting tools" },
        ],
        icon: "LayoutGrid",
        resourceSection: "design",
        estimatedDays: 14,
      },
    ],
  },
  {
    id: "proofing",
    number: 5,
    title: "Proofing & Quality Control",
    subtitle: "Catching every imperfection before ink meets paper",
    color: "text-[#8b5e3c]",
    bgColor: "bg-[#fdf8f3]",
    borderColor: "border-[#8b5e3c]",
    accentColor: "#8b5e3c",
    steps: [
      {
        id: "first-pass",
        title: "First Pass / Galleys",
        description: "The first typeset proof — called 'galleys' — is reviewed by multiple eyes: proofreader, author, editor, and designer each checking for different issues.",
        inputs: [
          { name: "Typeset PDF", description: "First complete layout showing the designed book" },
          { name: "Proofreader Review", description: "Professional proofreader's corrections and queries" },
          { name: "Author Review", description: "Author's final changes and approval of the layout" },
          { name: "Designer Review", description: "Text designer's check for aesthetic and layout issues" },
        ],
        icon: "Eye",
        resourceSection: "editorial",
        estimatedDays: 14,
      },
      {
        id: "second-pass",
        title: "Second Pass & Corrections",
        description: "All corrections from the first pass are collated and input. The revised proof is checked again — a cycle that may repeat until perfection is achieved.",
        inputs: [
          { name: "Corrected Proofs", description: "Updated layout with first-pass changes applied" },
          { name: "Collated Changes", description: "Master list of all corrections from all reviewers" },
          { name: "Proofreader Notes", description: "Second-round proofreading corrections" },
        ],
        icon: "RefreshCw",
        resourceSection: "editorial",
        estimatedDays: 7,
      },
      {
        id: "final-pass",
        title: "Final Pass (Blues)",
        description: "The last proof before printing — historically called 'blues' from the blue-ink proofs printers once provided. This is the final chance to catch any remaining errors.",
        inputs: [
          { name: "Near-Final Proofs", description: "The latest corrected version approaching print-readiness" },
          { name: "Stakeholder Approvals", description: "Sign-offs from editor, production editor, and managing editor" },
          { name: "Final Quality Checklist", description: "Comprehensive review of all elements before print" },
        ],
        icon: "ShieldCheck",
        resourceSection: "editorial",
        estimatedDays: 5,
      },
    ],
  },
  {
    id: "preproduction",
    number: 6,
    title: "Pre-Production",
    subtitle: "Preparing every file and specification for the press",
    color: "text-[#4a6741]",
    bgColor: "bg-[#f3f7f2]",
    borderColor: "border-[#4a6741]",
    accentColor: "#4a6741",
    steps: [
      {
        id: "preflight",
        title: "Pre-flighting",
        description: "All files are meticulously checked — fonts embedded, images at correct resolution, colors in CMYK, bleeds set properly. Nothing can go wrong at the printer.",
        inputs: [
          { name: "Final Text Files", description: "Print-ready PDF of the book interior" },
          { name: "Final Cover Files", description: "Print-ready cover/jacket artwork with bleeds and trim marks" },
          { name: "Print Specifications", description: "Paper weight, coating, binding method, and trim size" },
          { name: "Paper Stock Selection", description: "Specific paper grade, weight, and finish chosen for the interior" },
        ],
        icon: "ClipboardCheck",
        resourceSection: "preproduction",
        estimatedDays: 3,
      },
      {
        id: "indexing",
        title: "Indexing",
        description: "For non-fiction, a professional indexer creates the back-of-book index — a painstaking process that can only happen after final page numbers are set.",
        inputs: [
          { name: "Final Page Proofs", description: "Locked pages with definitive page numbers" },
          { name: "Subject Matter Expertise", description: "Deep knowledge of the book's content and terminology" },
          { name: "Index Style Guide", description: "Format, depth, and cross-referencing conventions" },
        ],
        icon: "BookOpen",
        resourceSection: "preproduction",
        estimatedDays: 14,
      },
      {
        id: "isbn",
        title: "ISBN & Metadata Registration",
        description: "The book receives its unique identifier and is registered in industry databases — making it discoverable and orderable by bookstores and libraries worldwide.",
        inputs: [
          { name: "ISBN Assignment", description: "Unique 13-digit International Standard Book Number" },
          { name: "Title Information", description: "Full title, subtitle, author name, and edition details" },
          { name: "Pricing & Format", description: "Retail price, format (hardcover/paperback), and page count" },
          { name: "Category Codes", description: "BISAC subject codes and Library of Congress classification" },
          { name: "Publication Date", description: "Official on-sale date for coordinating distribution" },
        ],
        icon: "Barcode",
        resourceSection: "preproduction",
        estimatedDays: 3,
      },
    ],
  },
  {
    id: "manufacturing",
    number: 7,
    title: "Production & Manufacturing",
    subtitle: "Ink meets paper — the book takes physical form",
    color: "text-[#5c3d2e]",
    bgColor: "bg-[#f3efe6]",
    borderColor: "border-[#c9a96e]",
    accentColor: "#c9a96e",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/phase-printing-YWFf979oKZdh4N5j7HGg4u.webp",
    steps: [
      {
        id: "paper",
        title: "Paper Procurement",
        description: "The right paper is ordered — weight, opacity, color, and texture all carefully specified. Paper stock must be reserved months in advance for the entire print run.",
        inputs: [
          { name: "Paper Stock Specs", description: "Weight (gsm), opacity, brightness, and surface finish" },
          { name: "Quantity Estimates", description: "Total sheets needed based on page count and print run" },
          { name: "Print Run Size", description: "Number of copies to be manufactured" },
        ],
        icon: "FileText",
        resourceSection: "production",
        estimatedDays: 5,
      },
      {
        id: "printing",
        title: "Printing the Text Block",
        description: "The printing press roars to life. Sheets are printed, dried, folded into signatures, and gathered in order — the book's pages taking shape for the first time.",
        inputs: [
          { name: "Print-Ready PDF", description: "Final approved interior file with all corrections" },
          { name: "Paper Stock", description: "Pre-ordered paper loaded into the press" },
          { name: "Ink Specifications", description: "Black ink density, any spot colors, and ink coverage" },
          { name: "Print Run Quantity", description: "Exact number of copies to produce" },
        ],
        icon: "Printer",
        resourceSection: "production",
        estimatedDays: 10,
      },
      {
        id: "cover-print",
        title: "Cover Printing",
        description: "The cover is printed separately on heavier stock, then finished with lamination, spot UV, embossing, or foil stamping to create the book's tactile first impression.",
        inputs: [
          { name: "Cover File", description: "Print-ready cover artwork with spine width calculated" },
          { name: "Cover Stock", description: "Heavier paper or board for the cover material" },
          { name: "Lamination / Coating Specs", description: "Matte, gloss, or soft-touch lamination choices" },
          { name: "Special Finishes", description: "Foil stamping, embossing, spot UV, or die-cut details" },
        ],
        icon: "Palette",
        resourceSection: "production",
        estimatedDays: 5,
      },
      {
        id: "binding",
        title: "Binding",
        description: "Text block meets cover. Pages are bound together using the chosen method — perfect binding for paperbacks, case binding for hardcovers, or saddle-stitching for thin volumes.",
        inputs: [
          { name: "Printed Text Block", description: "Gathered and collated signatures ready for binding" },
          { name: "Printed Cover", description: "Finished cover or case ready for attachment" },
          { name: "Binding Method", description: "Perfect bound, case bound, saddle-stitched, or spiral" },
        ],
        icon: "BookCopy",
        resourceSection: "production",
        estimatedDays: 5,
      },
      {
        id: "quality",
        title: "Quality Inspection",
        description: "Sample copies are pulled from the line and inspected against the original proofs — checking color accuracy, binding strength, trim precision, and overall finish.",
        inputs: [
          { name: "Sample Copies", description: "Random books pulled from the production run" },
          { name: "Quality Checklist", description: "Standards for color, registration, binding, and trim" },
          { name: "Color Proofs", description: "Original approved proofs for comparison" },
        ],
        icon: "Microscope",
        resourceSection: "production",
        estimatedDays: 3,
      },
    ],
  },
  {
    id: "distribution",
    number: 8,
    title: "Distribution & Marketing",
    subtitle: "Getting the book into readers' hands",
    color: "text-[#7a2e3a]",
    bgColor: "bg-[#fdf5f6]",
    borderColor: "border-[#7a2e3a]",
    accentColor: "#7a2e3a",
    steps: [
      {
        id: "warehouse",
        title: "Warehousing",
        description: "Finished books arrive at the warehouse six weeks before release. They are inventoried, stored, and prepared for the wave of orders that will come on publication day.",
        inputs: [
          { name: "Finished Books", description: "Bound and inspected copies from the manufacturer" },
          { name: "Inventory System", description: "Warehouse management software for tracking stock" },
          { name: "Storage Location", description: "Designated warehouse space with climate control" },
        ],
        icon: "Warehouse",
        resourceSection: "marketing",
        estimatedDays: 7,
      },
      {
        id: "distribute",
        title: "Distribution to Retailers",
        description: "Books ship to bookstores, online retailers, libraries, and wholesalers worldwide. The distribution network ensures the book is available wherever readers shop.",
        inputs: [
          { name: "Distribution Agreements", description: "Contracts with distributors and retail partners" },
          { name: "Order Quantities", description: "Initial orders from bookstores and online retailers" },
          { name: "Shipping Logistics", description: "Freight scheduling, routing, and delivery timelines" },
        ],
        icon: "Truck",
        resourceSection: "marketing",
        estimatedDays: 14,
      },
      {
        id: "marketing",
        title: "Marketing & Publicity Launch",
        description: "The publicity machine activates — review copies sent, press releases distributed, author events scheduled, and social media campaigns launched to build buzz.",
        inputs: [
          { name: "Marketing Plan", description: "Comprehensive strategy covering all promotional channels" },
          { name: "Press Releases", description: "Media announcements and review pitches" },
          { name: "Review Copies", description: "Advance copies sent to critics, bloggers, and influencers" },
          { name: "Social Media Strategy", description: "Content calendar, paid ads, and community engagement plan" },
          { name: "Author Events", description: "Book signings, readings, interviews, and festival appearances" },
        ],
        icon: "Megaphone",
        resourceSection: "marketing",
        estimatedDays: 60,
      },
      {
        id: "digital",
        title: "Ebook & Audio Production",
        description: "The archived digital files are transformed into ebook formats and audio editions — extending the book's reach to screens and earbuds everywhere.",
        inputs: [
          { name: "Archived Digital Files", description: "Final text and cover files from print production" },
          { name: "Ebook Formatting Specs", description: "EPUB/MOBI conversion requirements and metadata" },
          { name: "Audio Narration", description: "Voice actor selection, recording, and post-production" },
        ],
        icon: "Headphones",
        resourceSection: "production",
        estimatedDays: 30,
      },
    ],
  },
  {
    id: "post-publication",
    number: 9,
    title: "Post-Publication",
    subtitle: "The book's life continues after launch day",
    color: "text-[#2d4a3e]",
    bgColor: "bg-[#f4f8f5]",
    borderColor: "border-[#2d4a3e]",
    accentColor: "#2d4a3e",
    steps: [
      {
        id: "sales",
        title: "Sales Monitoring & Reprints",
        description: "Sales data flows in daily. When inventory runs low and demand remains strong, the decision is made to reprint — sometimes with corrections or a new cover.",
        inputs: [
          { name: "Sales Data", description: "Daily/weekly reports from retailers and distributors" },
          { name: "Inventory Levels", description: "Current warehouse stock and rate of depletion" },
          { name: "Reprint Decisions", description: "Print quantity, timing, and any corrections to incorporate" },
        ],
        icon: "TrendingUp",
        resourceSection: "postpublication",
        estimatedDays: 90,
      },
      {
        id: "rights",
        title: "Rights & Subsidiary Sales",
        description: "The book's life extends through translations, foreign editions, film/TV adaptations, and other subsidiary rights — each one a new journey beginning.",
        inputs: [
          { name: "Foreign Rights Inquiries", description: "Interest from international publishers for translation" },
          { name: "Translation Requests", description: "Language-specific publishing deals and translator selection" },
          { name: "Adaptation Offers", description: "Film, TV, audio drama, or other media adaptation proposals" },
        ],
        icon: "Globe",
        resourceSection: "postpublication",
        estimatedDays: 180,
      },
    ],
  },
];

/**
 * Bible-specific production phases.
 * These are shown in the Project Tracker only when the project genre is "Bible / Scripture".
 * They are stored separately so the genre filter can inject them into the phase list.
 */
export const biblePhases: Phase[] = [
  {
    id: "bible-text-prep",
    number: 10,
    title: "Bible Text Preparation",
    subtitle: "Versification, markup, and textual integrity",
    color: "text-[#2c1a00]",
    bgColor: "bg-[#fdf5ec]",
    borderColor: "border-[#c9a96e]",
    accentColor: "#c9a96e",
    steps: [
      {
        id: "bible-versification",
        title: "Versification & Text Verification",
        description: "Every verse is verified against the authoritative source text. Chapter and verse numbers are confirmed, variant readings are noted, and the digital text is validated against the printed critical edition.",
        inputs: [
          { name: "Source Text", description: "Authoritative digital text file (USFM, OSIS, or plain text)" },
          { name: "Critical Apparatus", description: "Manuscript variants and textual notes from the translation committee" },
          { name: "Versification Schema", description: "KJV, RSV, or custom versification map for the translation" },
          { name: "Spell-Check Dictionary", description: "Translation-specific proper nouns and archaic spellings" },
        ],
        icon: "BookCheck",
        resourceSection: "bible",
        estimatedDays: 14,
      },
      {
        id: "bible-red-letter",
        title: "Red-Letter Tagging",
        description: "Words spoken by Jesus Christ are identified and tagged in the source text. This requires careful theological review to determine scope — direct speech only, or also narrated speech and Old Testament quotations.",
        inputs: [
          { name: "Verified Text File", description: "Post-versification text ready for markup" },
          { name: "Red-Letter Scope Decision", description: "Publisher decision on which words qualify as red-letter" },
          { name: "Theological Review", description: "Scholar review of ambiguous passages and indirect speech" },
        ],
        icon: "Highlighter",
        resourceSection: "bible",
        estimatedDays: 7,
      },
      {
        id: "bible-poetry-markup",
        title: "Poetry & Stanza Formatting",
        description: "Poetic books (Psalms, Proverbs, Song of Solomon, Lamentations, and poetic passages throughout) are formatted in stanza layout with correct indentation, parallelism, and line breaks.",
        inputs: [
          { name: "Tagged Text File", description: "Text with verse and red-letter markup applied" },
          { name: "Poetry Identification List", description: "All poetic passages flagged for stanza formatting" },
          { name: "Indentation Guide", description: "Rules for primary and secondary line indentation" },
        ],
        icon: "AlignLeft",
        resourceSection: "bible",
        estimatedDays: 10,
      },
      {
        id: "bible-section-headings",
        title: "Section Headings & Pericopes",
        description: "Descriptive headings are placed at the beginning of each narrative unit (pericope). Headings are reviewed for theological neutrality, accuracy, and consistency with the translation's style.",
        inputs: [
          { name: "Formatted Text File", description: "Text with poetry markup applied" },
          { name: "Section Heading List", description: "Approved headings from the translation committee or editorial team" },
          { name: "Style Guide", description: "Rules for heading capitalization, length, and placement" },
        ],
        icon: "Heading",
        resourceSection: "bible",
        estimatedDays: 7,
      },
    ],
  },
  {
    id: "bible-reference-apparatus",
    number: 11,
    title: "Reference Apparatus",
    subtitle: "Cross-references, concordance, footnotes, and maps",
    color: "text-[#1a3a5c]",
    bgColor: "bg-[#f0f4f8]",
    borderColor: "border-[#1a3a5c]",
    accentColor: "#1a3a5c",
    steps: [
      {
        id: "bible-cross-refs",
        title: "Cross-Reference System",
        description: "Thousands of cross-reference links are verified, formatted, and positioned — either as footnotes at the bottom of each page or in a center column between the two text columns. Each reference is checked for accuracy.",
        inputs: [
          { name: "Cross-Reference Database", description: "Complete list of verse-to-verse references (e.g., Treasury of Scripture Knowledge)" },
          { name: "Layout Decision", description: "Footnote style vs. center-column style" },
          { name: "Abbreviation List", description: "Standard book abbreviations used in the reference system" },
        ],
        icon: "Link",
        resourceSection: "bible",
        estimatedDays: 21,
      },
      {
        id: "bible-footnotes",
        title: "Textual Footnotes & Variant Notes",
        description: "Manuscript variants, alternate translations, and explanatory notes are formatted as footnotes. Each note is keyed to its verse and reviewed for accuracy and brevity.",
        inputs: [
          { name: "Translation Notes", description: "Footnote content from the translation committee" },
          { name: "Variant Readings", description: "Significant manuscript variants to be noted" },
          { name: "Footnote Style Guide", description: "Format rules for footnote markers and content" },
        ],
        icon: "FileText",
        resourceSection: "bible",
        estimatedDays: 14,
      },
      {
        id: "bible-concordance",
        title: "Concordance Compilation",
        description: "An alphabetical index of significant words with their verse references is compiled, reviewed, and typeset. Strong's numbers may be included for study editions.",
        inputs: [
          { name: "Word Frequency Analysis", description: "Computer-generated word list from the full text" },
          { name: "Inclusion/Exclusion List", description: "Words to include or exclude from the concordance" },
          { name: "Strong's Numbers", description: "Hebrew/Greek lexicon numbers for study editions" },
        ],
        icon: "List",
        resourceSection: "bible",
        estimatedDays: 21,
      },
      {
        id: "bible-maps",
        title: "Maps, Charts & Illustrations",
        description: "Biblical maps, timelines, and charts are commissioned or licensed, sized to the trim, and positioned in the text or in a color insert. All place names are verified against the text.",
        inputs: [
          { name: "Map Files", description: "High-resolution map artwork (EPS or TIFF at 300 DPI minimum)" },
          { name: "Place Name Verification", description: "Confirmed spelling of all geographic names" },
          { name: "Color Profile", description: "CMYK color profile for press-ready output" },
        ],
        icon: "Map",
        resourceSection: "bible",
        estimatedDays: 14,
      },
      {
        id: "bible-book-intros",
        title: "Book Introductions & Study Notes",
        description: "Introductory essays for each book of the Bible are written, edited, and typeset. Study notes (for study editions) are positioned alongside the relevant verses.",
        inputs: [
          { name: "Introduction Manuscripts", description: "Authored introductory essays for each Bible book" },
          { name: "Study Note Content", description: "Verse-by-verse study notes from scholars" },
          { name: "Editorial Review", description: "Theological and stylistic review of all supplementary content" },
        ],
        icon: "BookOpen",
        resourceSection: "bible",
        estimatedDays: 30,
      },
    ],
  },
  {
    id: "bible-prepress",
    number: 12,
    title: "Bible Pre-Press Specifications",
    subtitle: "Paper, binding, finishing, and press-ready file preparation",
    color: "text-[#3d2b1f]",
    bgColor: "bg-[#f3efe6]",
    borderColor: "border-[#8b5e3c]",
    accentColor: "#8b5e3c",
    steps: [
      {
        id: "bible-paper-spec",
        title: "Paper Specification & Ordering",
        description: "Bible paper (India paper, thin offset) is specified by weight, opacity, and PPI. Orders are placed with the paper merchant well in advance of the press date, as Bible paper has long lead times.",
        inputs: [
          { name: "Paper Type", description: "Weight (24lb, 28lb, 40lb), opacity, and color (white or cream)" },
          { name: "Page Count", description: "Final page count for calculating paper quantity" },
          { name: "Press Sheet Size", description: "Signature size and imposition layout" },
          { name: "Lead Time", description: "Paper merchant delivery schedule (often 8–16 weeks for India paper)" },
        ],
        icon: "Layers",
        resourceSection: "bible",
        estimatedDays: 7,
      },
      {
        id: "bible-spine-calc",
        title: "Spine Width Calculation",
        description: "The spine width is calculated precisely using the final page count and paper PPI. Cover boards and binding material thickness are added. The cover file is adjusted to the exact spine width.",
        inputs: [
          { name: "Final Page Count", description: "Confirmed page count after all content is typeset" },
          { name: "Paper PPI", description: "Pages per inch for the specified paper stock" },
          { name: "Cover Board Thickness", description: "Thickness of binder's boards for hardcover editions" },
          { name: "Binding Material", description: "Leather, cloth, or paper cover material thickness" },
        ],
        icon: "Ruler",
        resourceSection: "bible",
        estimatedDays: 2,
      },
      {
        id: "bible-cover-design",
        title: "Cover & Case Design",
        description: "The cover is designed to the exact trim and spine dimensions. For leather editions, the case design includes the spine lettering, cover embossing, and ribbon marker attachment points.",
        inputs: [
          { name: "Spine Width", description: "Calculated spine width in inches and millimeters" },
          { name: "Cover Artwork", description: "Front cover design files at full bleed" },
          { name: "Spine Text", description: "Title, translation, and publisher name for spine" },
          { name: "Finishing Specs", description: "Foil stamping, embossing, gilding, and ribbon specs" },
        ],
        icon: "PenTool",
        resourceSection: "bible",
        estimatedDays: 14,
      },
      {
        id: "bible-preflight",
        title: "Pre-Flight & Press-Ready Output",
        description: "All files are pre-flighted for press: fonts embedded, images at 300 DPI, color mode CMYK, bleed and trim marks set. A final PDF/X-1a or PDF/X-4 file is generated for the printer.",
        inputs: [
          { name: "Interior PDF", description: "Typeset interior at correct trim size with all fonts embedded" },
          { name: "Cover PDF", description: "Cover file with correct spine width, bleed, and color profile" },
          { name: "Pre-Flight Report", description: "Acrobat or Pitstop pre-flight check results" },
          { name: "Printer Specifications", description: "Printer's file requirements and color profile" },
        ],
        icon: "CheckCircle",
        resourceSection: "bible",
        estimatedDays: 5,
      },
      {
        id: "bible-binding-spec",
        title: "Binding & Finishing Specification",
        description: "The complete binding specification is written for the bindery: Smyth-sewn or adhesive, signature size, headband color, ribbon color, gilding specification, and thumb-index die size.",
        inputs: [
          { name: "Binding Method", description: "Smyth-sewn, case-bound, limp leather, or perfect bound" },
          { name: "Headband Spec", description: "Color and style of headband and tailband" },
          { name: "Ribbon Spec", description: "Width, color, and number of ribbon markers" },
          { name: "Gilding Spec", description: "Gold, silver, or red gilding on page edges" },
          { name: "Thumb Index Die", description: "Die size and book list for thumb-index cutting" },
        ],
        icon: "Bookmark",
        resourceSection: "bible",
        estimatedDays: 3,
      },
    ],
  },
];

export const totalSteps = phases.reduce((acc, phase) => acc + phase.steps.length, 0);
export const totalBibleSteps = biblePhases.reduce((acc, phase) => acc + phase.steps.length, 0);

