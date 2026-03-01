/*
 * Book Production Flowchart Data
 * Design: "The Bookmaker's Journey" — Artisan Storybook Aesthetic
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
    bgColor: "bg-[#faf6ef]",
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
      },
    ],
  },
  {
    id: "manufacturing",
    number: 7,
    title: "Production & Manufacturing",
    subtitle: "Ink meets paper — the book takes physical form",
    color: "text-[#5c3d2e]",
    bgColor: "bg-[#faf6ef]",
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
      },
    ],
  },
];

export const totalSteps = phases.reduce((acc, phase) => acc + phase.steps.length, 0);
