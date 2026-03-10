import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { BookOpen, Search, ChevronDown, ChevronRight, FileText, Scissors, Paintbrush, Printer, BarChart3, Package, Type, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";

const EBP_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG";

interface Term {
  term: string;
  definition: string;
}

interface Category {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  terms: Term[];
}

const glossaryData: Category[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    description: "Basic terms every first-time author should know.",
    terms: [
      { term: "Manuscript", definition: "Your written book content before it has been formatted or designed. Usually a Word document (.docx) or plain text file that you upload to our platform." },
      { term: "Self-Publishing", definition: "Publishing your own book without a traditional publishing house. You keep creative control and a larger share of the profits, but you handle (or hire help for) editing, design, and distribution." },
      { term: "Traditional Publishing", definition: "Working with an established publishing company that handles editing, design, printing, and distribution. Authors typically receive an advance payment and ongoing royalties, but give up some creative control." },
      { term: "KDP (Kindle Direct Publishing)", definition: "Amazon's free self-publishing platform. You upload your book files and Amazon prints and ships copies when customers order them. It is the most popular self-publishing platform worldwide." },
      { term: "IngramSpark", definition: "A print-on-demand and distribution service that makes your book available to bookstores, libraries, and online retailers worldwide. Often used alongside or instead of Amazon KDP." },
      { term: "Print-on-Demand (POD)", definition: "A printing method where books are only printed when a customer orders one. There is no need to buy hundreds of copies upfront. KDP and IngramSpark both use this model." },
      { term: "Royalties", definition: "The money you earn each time a copy of your book is sold. For self-published books, royalties are typically 35% to 70% of the sale price, depending on the platform and pricing." },
      { term: "Imprint", definition: "A publishing brand name you create for yourself. Instead of listing yourself as the publisher, you can use a professional-sounding name like 'Sunrise Press.' It is optional but common." },
    ],
  },
  {
    id: "book-structure",
    title: "Parts of a Book",
    icon: Layout,
    description: "The sections and pages that make up a printed book.",
    terms: [
      { term: "Front Matter", definition: "The pages at the beginning of a book before the main content starts. Includes the title page, copyright page, dedication, table of contents, and sometimes a foreword or preface." },
      { term: "Back Matter", definition: "The pages at the end of a book after the main content. Includes the index, glossary, bibliography, author biography, and sometimes an appendix." },
      { term: "Title Page", definition: "The page near the front of the book that displays the full title, subtitle, and author name. It is usually the first right-hand page." },
      { term: "Half-Title Page", definition: "A page that appears before the title page and shows only the book title (no author name or subtitle). It is a traditional design element." },
      { term: "Copyright Page", definition: "The page (usually on the back of the title page) that lists copyright information, the ISBN, publisher name, printing edition, and legal notices." },
      { term: "Colophon", definition: "A short note, often at the very end of a book, that describes the fonts, paper, and printing methods used. It is optional and mainly found in high-quality editions." },
      { term: "Table of Contents (TOC)", definition: "A list of chapters or sections at the beginning of the book with their page numbers, helping readers find specific parts quickly." },
      { term: "Index", definition: "An alphabetical list at the back of a non-fiction book that tells readers which pages mention specific topics, names, or terms." },
      { term: "Foreword", definition: "A short introduction written by someone other than the author, typically an expert or well-known figure, that endorses or introduces the book." },
      { term: "Preface", definition: "A section written by the author explaining why they wrote the book, how to use it, or giving background context. Appears before the main content." },
      { term: "Epilogue", definition: "A final section after the main story that wraps up loose ends or shows what happens after the main events." },
      { term: "Appendix", definition: "Extra reference material at the back of the book, such as charts, data tables, or supplementary information that supports the main text." },
      { term: "Chapter Opener", definition: "The first page of each chapter, usually with special formatting such as a decorative heading, drop cap (large first letter), or extra white space at the top." },
      { term: "Endnotes", definition: "Notes collected at the end of a chapter or the end of the book that provide sources, references, or additional explanations for specific points in the text." },
      { term: "Footnotes", definition: "Short notes at the bottom of a page that explain or cite something mentioned in the text above. Similar to endnotes but placed on the same page." },
    ],
  },
  {
    id: "design-layout",
    title: "Design & Layout",
    icon: Paintbrush,
    description: "How your book looks on the page — fonts, spacing, and visual style.",
    terms: [
      { term: "Typesetting", definition: "The process of arranging your text into professionally formatted pages with the right fonts, margins, spacing, headers, and page numbers. This is what turns a manuscript into a real book layout." },
      { term: "Trim Size", definition: "The final width and height of your printed book (for example, 6 inches wide by 9 inches tall). Common sizes include 5.5\" x 8.5\", 6\" x 9\", and 8.5\" x 11\". Your trim size affects margins, page count, and spine width." },
      { term: "Margins", definition: "The blank space around the edges of each page. Proper margins keep text from getting too close to the edge of the paper or the spine." },
      { term: "Gutter", definition: "The inner margin of a page, closest to the spine (the binding edge). The gutter needs to be wider than the outer margin so text does not disappear into the fold of the book." },
      { term: "Bleed", definition: "When an image or color extends all the way to the very edge of a page, it 'bleeds' off the edge. To achieve this, the image must extend slightly beyond the trim line (usually 0.125 inches) so there is no white border after cutting." },
      { term: "Safe Zone", definition: "The area inside the bleed and trim lines where important content (text, logos) should be placed. Anything outside the safe zone risks being cut off during printing." },
      { term: "Running Header / Running Footer", definition: "Text that repeats at the top or bottom of every page (or every other page), such as the book title, chapter name, or author name." },
      { term: "Folio", definition: "Simply the page number printed on the page. Folios are usually placed in the header or footer area." },
      { term: "Drop Cap", definition: "A large decorative first letter at the beginning of a chapter or section. It is a classic design touch that draws the reader's eye." },
      { term: "Widow", definition: "A single line of a paragraph left alone at the top of a new page. Widows look awkward and are usually fixed during typesetting by adjusting spacing." },
      { term: "Orphan", definition: "A single line of a paragraph left alone at the bottom of a page. Like widows, orphans are considered a layout problem and are corrected during typesetting." },
      { term: "Recto", definition: "A right-hand page in a book (odd-numbered pages). Chapters traditionally start on a recto page." },
      { term: "Verso", definition: "A left-hand page in a book (even-numbered pages). The copyright page is usually printed on the verso of the title page." },
      { term: "Leading (Line Spacing)", definition: "The vertical space between lines of text. More leading makes text easier to read; less leading fits more text per page. Pronounced 'ledding,' it comes from the strips of lead once placed between lines of metal type." },
      { term: "Kerning", definition: "The spacing between individual letters. Good kerning ensures letters are evenly spaced and the text looks clean and professional." },
      { term: "Section Break", definition: "A visual break within a chapter, usually shown as extra white space or a small decorative symbol (like three asterisks). Used to indicate a change of scene, time, or perspective." },
      { term: "Em Dash", definition: "A long dash (\u2014) used to set off a phrase or add emphasis in a sentence. It is the width of the letter 'M.' Different from a hyphen (-) or en dash (\u2013)." },
      { term: "En Dash", definition: "A medium-length dash (\u2013) mainly used for number ranges (pages 10\u201315) or to connect related items (New York\u2013London flight). It is the width of the letter 'N.'" },
      { term: "Curly Quotes (Smart Quotes)", definition: "Quotation marks that curve inward (\u201clike this\u201d) rather than straight marks (\"like this\"). Professional books always use curly quotes." },
    ],
  },
  {
    id: "fonts-typography",
    title: "Fonts & Typography",
    icon: Type,
    description: "Understanding the typefaces used in your book.",
    terms: [
      { term: "Serif Font", definition: "A font with small decorative strokes (called serifs) at the ends of letters. Examples: Times New Roman, Garamond, Georgia. Serif fonts are the standard choice for book body text because they are easy to read in print." },
      { term: "Sans-Serif Font", definition: "A font without the small decorative strokes. Examples: Arial, Helvetica, Open Sans. Sans-serif fonts are clean and modern, often used for headings, captions, or children's books." },
      { term: "Typeface vs. Font", definition: "A typeface is a family of related designs (like Garamond). A font is a specific style within that family (like Garamond Bold Italic, 12pt). In everyday use, the two words are used interchangeably." },
      { term: "Point Size", definition: "The standard way to measure font size. Most books use 10 to 12 point text for the body. Chapter headings are usually larger (14 to 24 point)." },
      { term: "DPI (Dots Per Inch)", definition: "A measure of image resolution for printing. Print-ready book files should use 300 DPI for sharp, clear images. Images at 72 DPI (typical for websites) will look blurry when printed." },
    ],
  },
  {
    id: "file-formats",
    title: "File Formats",
    icon: FileText,
    description: "The different file types you will encounter when producing your book.",
    terms: [
      { term: "PDF (Portable Document Format)", definition: "A file format that preserves the exact layout of your pages. We generate print-ready PDFs that you upload to KDP or IngramSpark for printing." },
      { term: "Interior PDF", definition: "The PDF file containing all the inside pages of your book (everything except the cover). This is what the printer uses to produce the book's content." },
      { term: "KDP Print-Ready PDF", definition: "An interior PDF that meets Amazon KDP's specific requirements for margins, bleed, page size, fonts, and image resolution. Our platform generates these automatically." },
      { term: "EPUB", definition: "The standard e-book format. EPUB files can be read on most e-readers and apps including Apple Books, Kobo, Google Play Books, and (with conversion) Kindle. The text reflows to fit the reader's screen size." },
      { term: "IDML (InDesign Markup Language)", definition: "A file format used by Adobe InDesign, professional design software. If you or a designer want to make advanced layout changes, you can export your book as an IDML file and open it in InDesign." },
      { term: "ONIX 3.0 XML", definition: "A standard format for sharing book information (title, author, price, description, ISBN) with bookstores, distributors, and online retailers. It helps get your book listed correctly across sales channels." },
      { term: "DOCX", definition: "The standard Microsoft Word file format. This is the most common format for uploading your manuscript to our platform." },
      { term: "USFM", definition: "Unified Standard Format Markers, a plain-text markup format used specifically for Bible texts. Our Bible Design Studio can import USFM files to produce professionally typeset Bibles." },
    ],
  },
  {
    id: "printing",
    title: "Printing & Binding",
    icon: Printer,
    description: "How your book gets physically produced.",
    terms: [
      { term: "Perfect Binding", definition: "The most common book binding method. Pages are glued together at the spine with a flat edge. This is what most paperback books use." },
      { term: "Case Binding (Hardcover)", definition: "Pages are sewn together and attached to rigid cardboard covers wrapped in cloth or printed material. This creates a durable hardcover book." },
      { term: "Saddle Stitch", definition: "Pages are folded and stapled through the spine. Best for thin booklets and magazines (usually under 64 pages). Not suitable for thick books." },
      { term: "Smyth Sewn", definition: "Groups of pages (called signatures) are sewn together with thread before being glued into the cover. This is the strongest binding and allows the book to lay flat when open." },
      { term: "Spine", definition: "The narrow edge of the book where all the pages are bound together. The spine width depends on your page count and paper thickness." },
      { term: "Spine Width / Spine Calculation", definition: "The thickness of your book's spine, calculated from the number of pages and the type of paper used. Our Spine Calculator tool does this math for you." },
      { term: "Signature (Printing)", definition: "A large sheet of paper printed with multiple pages that is then folded and trimmed. Books are often printed in signatures of 16 or 32 pages." },
      { term: "PPI (Pages Per Inch)", definition: "A measure of paper thickness. Thicker paper has a lower PPI (fewer pages fit in one inch). Common values: white paper is about 434 PPI, cream/natural paper is about 382 PPI." },
      { term: "Paper Stock", definition: "The type of paper your book is printed on. Common options include white uncoated (bright, good for images), cream/natural uncoated (warm tone, easier on the eyes for long reading), and coated gloss (shiny, best for photo books)." },
      { term: "CMYK", definition: "The four ink colors used in full-color printing: Cyan (blue), Magenta (pink), Yellow, and Key (black). All printed images and colors are created by mixing these four inks." },
      { term: "RGB", definition: "Red, Green, Blue — the color system used by screens (computers, phones, tablets). Images in RGB may look different when printed because printers use CMYK. Always convert images to CMYK for print files." },
      { term: "Matte Finish", definition: "A non-shiny coating on the book cover that gives it a smooth, elegant look. Matte covers show fewer fingerprints and glare." },
      { term: "Glossy Finish", definition: "A shiny coating on the book cover that makes colors look more vibrant and eye-catching. Glossy covers tend to show fingerprints more easily." },
      { term: "Laminate / Lamination", definition: "A thin protective coating applied to the book cover for durability. Covers are laminated in either matte or glossy finish." },
      { term: "Barcode", definition: "The scannable black-and-white lines printed on the back cover of a book. The barcode encodes the book's ISBN so stores can scan and sell it." },
    ],
  },
  {
    id: "editing",
    title: "Editing & Review",
    icon: Scissors,
    description: "The different stages of editing your book before it goes to print.",
    terms: [
      { term: "Developmental Editing", definition: "Big-picture editing that looks at the overall structure, pacing, character development (for fiction), argument flow (for non-fiction), and organization of your book. This is usually the first round of editing." },
      { term: "Line Editing", definition: "Editing that focuses on the quality of writing at the sentence level — improving word choice, sentence flow, tone, and clarity. It does not focus on grammar rules." },
      { term: "Copyediting", definition: "Editing that fixes grammar, spelling, punctuation, and consistency (like making sure character names are spelled the same way throughout). This happens after developmental and line editing." },
      { term: "Proofreading", definition: "The final check before printing. A proofreader reads the fully formatted pages to catch any remaining typos, formatting errors, or layout issues that were missed in earlier rounds." },
      { term: "Beta Reader", definition: "A volunteer reader who reads your manuscript before publication and gives you honest feedback about the story, pacing, and readability. Beta readers are not professional editors." },
      { term: "ARC (Advance Reader Copy)", definition: "A pre-publication copy of your book sent to reviewers, bloggers, or media before the official release date. ARCs help generate early reviews and buzz for your book launch." },
      { term: "Galleys / Galley Proof", definition: "A near-final version of your book used for review before printing. You (and sometimes reviewers) check the galley proof to catch any last errors. This is sometimes called a 'first pass' or 'proof copy.'" },
      { term: "Style Sheet", definition: "A document that records all the style choices made during editing — how names are spelled, capitalization rules, number formatting, hyphenation preferences, etc. It keeps everything consistent." },
    ],
  },
  {
    id: "isbn-metadata",
    title: "ISBN & Metadata",
    icon: BarChart3,
    description: "Identifying your book and getting it listed for sale.",
    terms: [
      { term: "ISBN (International Standard Book Number)", definition: "A unique 13-digit number assigned to your book that identifies it worldwide. Each format (paperback, hardcover, e-book) needs its own ISBN. In the US, ISBNs are purchased from Bowker (myidentifiers.com). Amazon KDP offers a free ISBN, but it can only be used on Amazon." },
      { term: "ISBN-10", definition: "The older 10-digit version of the ISBN. It is still used in some systems but has been replaced by ISBN-13 for all new publications." },
      { term: "ISBN-13", definition: "The current standard: a 13-digit number starting with 978 or 979. This is the ISBN format used for all new books." },
      { term: "BISAC Code", definition: "A category code that tells bookstores and online retailers where to shelve or list your book (for example, Fiction > Mystery, or Self-Help > Personal Growth). You typically choose 1 to 3 BISAC codes." },
      { term: "LCCN (Library of Congress Control Number)", definition: "A number assigned by the Library of Congress that helps libraries catalog your book. It is free to obtain and can increase your book's visibility in library systems." },
      { term: "Metadata", definition: "All the information about your book — title, author, description, price, ISBN, category, keywords, page count, trim size, and more. Good metadata helps readers find your book when searching online." },
      { term: "Bowker", definition: "The only official source for purchasing ISBNs in the United States. Their website is myidentifiers.com. A single ISBN costs $125, but buying in bulk (10 for $295) is much more cost-effective." },
    ],
  },
  {
    id: "distribution",
    title: "Distribution & Sales",
    icon: Package,
    description: "Getting your book into the hands of readers.",
    terms: [
      { term: "Distribution", definition: "The process of getting your book into stores, both online and physical. Distributors like Ingram connect your book to thousands of retailers and libraries worldwide." },
      { term: "List Price / Retail Price", definition: "The price printed on your book or listed in online stores. This is what customers pay. Your royalty is calculated as a percentage of this price minus printing costs." },
      { term: "Wholesale Discount", definition: "The percentage off the list price that you offer to bookstores and distributors. Bookstores typically require a 40% to 55% discount to stock your book on their shelves." },
      { term: "Returnability", definition: "Whether bookstores can return unsold copies for a refund. Making your book returnable increases the chance that physical bookstores will order it, but you assume the risk of returned copies." },
      { term: "Print Run", definition: "The number of copies printed at one time. Print-on-demand means a 'print run' of one copy at a time. Traditional (offset) printing does large print runs (500 or more) for a lower per-unit cost." },
      { term: "Offset Printing", definition: "Traditional large-scale printing that produces many copies at once. The per-book cost is lower than print-on-demand, but you must order a minimum quantity (usually 500 or more) upfront." },
      { term: "Bulk Discount", definition: "A reduced price when buying many copies of your own book at once, often for events, giveaways, or resale. Most print-on-demand services and printers offer bulk pricing." },
      { term: "Pre-Order", definition: "Listing your book for sale before it is officially published. Customers can buy it early, and all sales count toward your launch-day numbers, which can boost your book's ranking." },
    ],
  },
];

export default function Glossary() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(["getting-started"]));

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenCategories(new Set(glossaryData.map((c) => c.id)));
  const collapseAll = () => setOpenCategories(new Set());

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return glossaryData;
    const q = searchQuery.toLowerCase();
    return glossaryData
      .map((cat) => ({
        ...cat,
        terms: cat.terms.filter(
          (t) =>
            t.term.toLowerCase().includes(q) ||
            t.definition.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.terms.length > 0);
  }, [searchQuery]);

  const totalTerms = glossaryData.reduce((sum, c) => sum + c.terms.length, 0);

  return (
    <div className="min-h-screen bg-[#f3efe6]">
      <nav className="sticky top-0 z-50 bg-[#1a1008]/90 backdrop-blur-sm border-b border-[#c9a96e]/15">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <img src={EBP_LOGO} alt="Easy Book Publishers" className="h-10 w-auto object-contain" />
            <span className="font-serif text-[#f5d98a] text-lg md:text-xl tracking-wide hidden sm:block">Easy Book Publishers</span>
          </button>
          <Button onClick={() => navigate("/dashboard")} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold">
            Go to Dashboard
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-[#c9a96e]" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1008] mb-3">
            Publishing Glossary
          </h1>
          <p className="text-[#5c4a2a]/80 max-w-2xl mx-auto">
            New to self-publishing? This glossary explains {totalTerms} publishing terms in plain, everyday language so you always know exactly what something means.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b6914]" />
            <input
              type="text"
              placeholder="Search for a term (e.g., bleed, ISBN, trim size)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) expandAll();
              }}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#c9a96e]/30 bg-white text-[#1a1008] text-sm placeholder:text-[#b0a090] focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40"
            />
          </div>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={expandAll} className="text-xs text-[#8b6914] hover:text-[#c9a96e] font-medium transition-colors">
              Expand All
            </button>
            <span className="text-[#c9a96e]/40">|</span>
            <button onClick={collapseAll} className="text-xs text-[#8b6914] hover:text-[#c9a96e] font-medium transition-colors">
              Collapse All
            </button>
          </div>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#5c4a2a]/60 text-sm">No terms match your search. Try a different word.</p>
          </div>
        )}

        <div className="space-y-4">
          {filteredData.map((category) => {
            const isOpen = openCategories.has(category.id);
            const Icon = category.icon;
            return (
              <div key={category.id} className="border border-[#e8ddd0] rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#f3efe6] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#c9a96e]/15 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[#c9a96e]" />
                    </div>
                    <div>
                      <span className="font-serif text-lg text-[#2c1a00] font-medium">{category.title}</span>
                      <span className="ml-2 text-xs text-[#b0a090]">({category.terms.length} terms)</span>
                    </div>
                  </div>
                  {isOpen ? <ChevronDown size={18} className="text-[#c9a96e]" /> : <ChevronRight size={18} className="text-[#7a6e60]" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-[#e8ddd0]">
                    <p className="text-xs text-[#8b6914] mb-4">{category.description}</p>
                    <dl className="space-y-4">
                      {category.terms.map((t) => (
                        <div key={t.term} className="group">
                          <dt className="font-semibold text-[#2c1a00] text-sm">{t.term}</dt>
                          <dd className="text-[#5c4a2a] text-sm leading-relaxed mt-0.5">{t.definition}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-[#c9a96e]/10 border border-[#c9a96e]/20 rounded-xl p-6 text-center">
          <p className="text-[#5c4a2a] text-sm mb-3">
            Still have questions? Our User Guide walks you through every tool step by step.
          </p>
          <Button onClick={() => navigate("/guide")} variant="outline" className="border-[#c9a96e] text-[#8b6914] hover:bg-[#c9a96e]/10">
            Open User Guide
          </Button>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
