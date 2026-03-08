/**
 * User Guide Page — Easy Book Publishers
 * Full instruction book rendered as a navigable web page.
 */
import { useCallback, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, ChevronRight, ChevronDown, ArrowLeft, BookMarked, Layers, Ruler, Zap, BarChart3, Library, FileText, HelpCircle, Download, Barcode, Calendar, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EBP_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG";

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

function SectionCard({ section, isOpen, onToggle }: { section: Section; isOpen: boolean; onToggle: () => void }) {
  const Icon = section.icon;
  return (
    <div className="border border-[#e8ddd0] rounded-xl overflow-hidden bg-white shadow-sm guide-section-card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#faf6ef] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#c9a96e]/15 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-[#c9a96e]" />
          </div>
          <span className="font-serif text-lg text-[#2c1a00] font-medium">{section.title}</span>
        </div>
        {isOpen ? <ChevronDown size={18} className="text-[#c9a96e]" /> : <ChevronRight size={18} className="text-[#8b7b6b]" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-[#e8ddd0] prose prose-stone max-w-none text-[#3a2a1a]">
          {section.content}
        </div>
      )}
    </div>
  );
}

function InfoTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full text-sm border-collapse mt-3 mb-4">
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={i} className={i % 2 === 0 ? "bg-[#faf6ef]" : "bg-white"}>
            <td className="px-4 py-2 font-semibold text-[#5c3d2e] w-1/3 border border-[#e8ddd0]">{label}</td>
            <td className="px-4 py-2 text-[#3a2a1a] border border-[#e8ddd0]">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{num}</div>
      <div>
        <p className="font-semibold text-[#2c1a00]">{title}</p>
        <p className="text-sm text-[#5c3d2e] mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

const sections: Section[] = [
  {
    id: "overview",
    title: "Chapter 1 — Overview & Getting Started",
    icon: BookOpen,
    content: (
      <div>
        <p className="mb-4">Easy Book Publishers is a complete book production management platform built for independent authors, Bible publishers, designers, and small publishing houses. It guides you from the first spark of an idea through every professional production stage to a finished, print-ready volume.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">What the Platform Provides</h4>
        <InfoTable rows={[
          ["Production Tracker", "9 phases, 30 steps, 110 tracked inputs per project"],
          ["Bible Design Studio", "Full specification wizard for any Bible edition"],
          ["Auto-Produce", "AI-powered PDF and EPUB generation from your manuscript"],
          ["Spine Calculator", "Exact spine width from page count, paper type, and binding"],
          ["Cover Designer", "Full-wrap cover dimensions with bleed and safe zone specs"],
          ["ISBN & Metadata", "ISBN-13 validation, BISAC codes, and ONIX 3.0 export"],
          ["Production Timeline", "Gantt-style deadline tracking per phase"],
          ["Resources Hub", "43 curated tools across every production stage"],
        ]} />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">First Steps</h4>
        <Step num={1} title="Open the Dashboard" desc="Visit the app to land directly on the Publisher Command Center dashboard." />
        <Step num={2} title="Create a Project" desc="Click 'New Book Project' on the dashboard. Enter your book title, genre, and a brief description." />
        <Step num={3} title="Follow the What's Next Panel" desc="The dashboard shows your top 3 recommended next actions in priority order. Work through them in sequence." />
        <Step num={4} title="Use the Publisher Tools Hub" desc="Access any specialist tool (Bible Studio, Spine Calculator, Cover Designer, etc.) from the 8-card grid on the dashboard." />
      </div>
    ),
  },
  {
    id: "projects",
    title: "Chapter 2 — Managing Book Projects",
    icon: FileText,
    content: (
      <div>
        <p className="mb-4">Each book project tracks all 30 production steps across 9 phases. You can upload real documents, set due dates, mark steps complete, and skip steps that don't apply to your book type.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">Creating a Project</h4>
        <Step num={1} title="Click 'New Book Project'" desc="Found in the Publisher Tools Hub grid on the dashboard (gold card, top right)." />
        <Step num={2} title="Enter Book Details" desc="Title, genre (choose from 21 options including Bible/Scripture), and an optional description." />
        <Step num={3} title="Open the Project" desc="Click your project card to open the full 30-step production tracker." />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Working Through Steps</h4>
        <InfoTable rows={[
          ["Mark Complete", "Click the checkbox on any step to mark it done. Progress updates instantly."],
          ["Skip a Step", "Click 'Skip' on steps that don't apply (e.g., indexing for a novel)."],
          ["Upload Documents", "Attach your manuscript, contracts, cover art, or proofs directly to any step."],
          ["Set Due Dates", "Add a target date to any step for deadline tracking."],
          ["Add Notes", "Write production notes on any step for your team or future reference."],
        ]} />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">The 9 Production Phases</h4>
        <InfoTable rows={[
          ["Phase 1", "Concept & Development — idea, market research, proposal"],
          ["Phase 2", "Manuscript Preparation — writing, editing, proofreading"],
          ["Phase 3", "Design & Layout — cover design, interior layout, typesetting"],
          ["Phase 4", "Pre-Press — final proofs, ISBN, CIP data, legal review"],
          ["Phase 5", "Printing & Binding — printer selection, press approval, print run"],
          ["Phase 6", "Digital Production — EPUB, PDF, accessibility, DRM"],
          ["Phase 7", "Distribution Setup — distributor agreements, metadata, catalog"],
          ["Phase 8", "Marketing & Launch — ARC copies, reviews, launch campaign"],
          ["Phase 9", "Post-Publication — sales tracking, reprint planning, awards"],
        ]} />
      </div>
    ),
  },
  {
    id: "bible-studio",
    title: "Chapter 3 — Bible Design Studio",
    icon: BookMarked,
    content: (
      <div>
        <p className="mb-4">The Bible Design Studio is a 9-step specification wizard that defines every production parameter of a Bible edition. It does not supply scripture text — you must provide your own licensed or public-domain manuscript. The studio generates a complete, print-ready spec sheet you can send directly to your typesetter and printer.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">The 9 Configuration Steps</h4>
        <Step num={1} title="Select Edition Type" desc="Choose from Standard Bible, Reference Bible, Study Bible, Journaling Bible, Children's Bible, Large Print, Compact, Pew/Lectern, Devotional, or Custom." />
        <Step num={2} title="Select Translation" desc="Choose from 28 translations grouped as Public Domain (16), Licensed (12), or Custom. Public domain translations (KJV, ASV, WEB, BSB, etc.) can be used without a license fee." />
        <Step num={3} title="Select Trim Size" desc="Choose from 12 standard Bible trim sizes from Compact (4.25×6.75) to Pew (6×9). Custom dimensions are supported." />
        <Step num={4} title="Select Typesetting Style" desc="Choose from Single Column, Double Column, Double Column with Center Reference, Paragraph Format, or Poetry Format." />
        <Step num={5} title="Select Typefaces" desc="Choose independent typefaces for body text (Serif), chapter headings (Italic), and verse numbers (Sans-Serif Bold). Live preview shows each font rendered in real-time." />
        <Step num={6} title="Select Paper Grade" desc="Choose from Opaque White, Cream, Bible Thin (30gsm), Bible Ultra-Thin (28gsm), or Recycled. Each grade shows weight, opacity, and recommended use." />
        <Step num={7} title="Select Binding Method" desc="Choose from Perfect Bound, Smyth Sewn, Case Bound, Spiral, Coptic, or French Link. Each method shows durability rating and typical use." />
        <Step num={8} title="Select Special Features" desc="Add red-letter text, cross-references, concordance, maps, ribbon markers, thumb indexing, gilded edges, or a presentation page." />
        <Step num={9} title="AI Writing Assistant" desc="Generate back-cover blurbs, author bios, catalog descriptions, press releases, and marketing emails using AI. Select tone (Professional, Inspirational, Academic, or Conversational)." />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Exporting the Spec Sheet</h4>
        <p className="text-sm text-[#5c3d2e]">Click 'Export Spec Sheet' at the top of the page. A print-ready HTML page opens in a new tab — use your browser's Print function (Ctrl+P / Cmd+P) and select 'Save as PDF' to generate the final document.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Public Domain Translations Available</h4>
        <InfoTable rows={[
          ["KJV", "King James Version (1769) — Public Domain in USA; Crown copyright in UK"],
          ["KJV + Apocrypha", "KJV with all 15 Apocryphal/Deuterocanonical books"],
          ["ASV", "American Standard Version (1901)"],
          ["WEB", "World English Bible — explicitly public domain"],
          ["BSB", "Berean Standard Bible (2020) — explicitly public domain"],
          ["OEB", "Open English Bible — CC0 (public domain equivalent)"],
          ["DRA", "Douay-Rheims American Edition (1899)"],
          ["GNV", "Geneva Bible (1599)"],
          ["YLT", "Young's Literal Translation"],
          ["DARBY", "Darby Translation"],
        ]} />
      </div>
    ),
  },
  {
    id: "auto-produce",
    title: "Chapter 4 — Auto-Produce (AI Typesetting)",
    icon: Zap,
    content: (
      <div>
        <p className="mb-4">Auto-Produce uses an AI-powered layout engine to generate a typeset PDF and EPUB from your manuscript file. It applies professional Bible typesetting rules automatically — chapter headings, verse numbers, paragraph breaks, and running headers.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">How to Run Auto-Produce</h4>
        <Step num={1} title="Select a Project" desc="Choose which book project this production run belongs to." />
        <Step num={2} title="Upload Your Manuscript" desc="Upload a .txt, .docx, or USFM file. Maximum file size: 50MB. For Bible manuscripts, USFM format gives the most accurate verse and chapter structure." />
        <Step num={3} title="Configure Settings" desc="Select trim size, typesetting style, font size, and line spacing. These settings are pre-filled if you have already configured the Bible Design Studio for this project." />
        <Step num={4} title="Click 'Start Production'" desc="The engine processes your manuscript. A progress indicator shows the current stage (parsing → layout → PDF render → EPUB build)." />
        <Step num={5} title="Download Outputs" desc="When complete, download the PDF and EPUB files directly from the job status card." />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Understanding Job Status</h4>
        <InfoTable rows={[
          ["Queued", "Job is waiting to start. Usually begins within seconds."],
          ["Processing", "Manuscript is being parsed and laid out. Takes 30 seconds to 5 minutes depending on file size."],
          ["Complete", "PDF and EPUB are ready to download."],
          ["Failed", "An error occurred. See the inline error panel for details and a Retry button."],
        ]} />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">When a Job Fails</h4>
        <p className="text-sm text-[#5c3d2e] mb-2">The error panel shows the full error message, a Retry button (up to 3 attempts), and a Technical Details section with diagnostic information. Common causes:</p>
        <InfoTable rows={[
          ["Unsupported format", "Convert your file to plain .txt or .docx before retrying."],
          ["Empty parse (0 words)", "The file may be password-protected or in an unsupported encoding. Re-save as plain text."],
          ["Timeout", "File may be too large. Split into smaller sections and run separately."],
          ["Max retries reached", "Start a new job with a corrected file — the original job cannot be retried further."],
        ]} />
      </div>
    ),
  },
  {
    id: "spine-calculator",
    title: "Chapter 5 — Spine Calculator",
    icon: Ruler,
    content: (
      <div>
        <p className="mb-4">The Spine Calculator computes the exact spine width for your book cover based on page count, paper type, and binding method. This measurement is critical for cover designers — an incorrect spine width will cause the cover to be rejected by the printer.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">How to Calculate Spine Width</h4>
        <Step num={1} title="Enter Page Count" desc="Enter the total number of pages in your final interior (including front matter and back matter). Must be an even number." />
        <Step num={2} title="Select Paper Type" desc="Choose the paper stock your printer will use. Each paper type has a different pages-per-inch (PPI) value." />
        <Step num={3} title="Select Binding Method" desc="Perfect Bound, Case Bound, Smyth Sewn, or Spiral. Each adds a different amount to the spine width calculation." />
        <Step num={4} title="Read the Result" desc="The spine width is displayed in both inches and millimeters. Use the mm value when setting up your cover template in InDesign or Affinity Publisher." />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Paper Type PPI Reference</h4>
        <InfoTable rows={[
          ["50lb Uncoated (Cream)", "440 PPI — standard novel paper"],
          ["60lb Uncoated (White)", "400 PPI — standard trade paper"],
          ["70lb Uncoated", "360 PPI — heavier uncoated"],
          ["80lb Coated (Gloss)", "330 PPI — photo books, art books"],
          ["Bible Thin (30gsm)", "800 PPI — ultra-thin Bible paper"],
          ["Bible Standard (40gsm)", "600 PPI — standard Bible paper"],
        ]} />
      </div>
    ),
  },
  {
    id: "cover-designer",
    title: "Chapter 6 — Cover Designer",
    icon: Layers,
    content: (
      <div>
        <p className="mb-4">The Cover Designer calculates the exact full-wrap cover dimensions for your book, including bleed areas and safe zones. It generates a live SVG diagram and an exportable spec sheet to send to your cover designer.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">How to Use the Cover Designer</h4>
        <Step num={1} title="Enter Trim Size" desc="Enter your book's finished trim width and height in inches (e.g., 6 × 9)." />
        <Step num={2} title="Enter Spine Width" desc="Use the value from the Spine Calculator. Enter in inches." />
        <Step num={3} title="Set Bleed" desc="Standard bleed is 0.125 inches (⅛ inch) on all sides. Increase to 0.25 inches for full-bleed image covers." />
        <Step num={4} title="Read the Diagram" desc="The live SVG shows the full wrap layout: back cover + spine + front cover, with bleed and safe zone boundaries marked." />
        <Step num={5} title="Export Spec Sheet" desc="Click 'Export Spec Sheet' to generate a print-ready document with all dimensions in inches and millimeters." />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Key Measurements Explained</h4>
        <InfoTable rows={[
          ["Trim Size", "The finished size of the book after trimming. This is what the reader holds."],
          ["Bleed", "Extra image area beyond the trim edge. Prevents white borders after cutting. Standard: 0.125 in."],
          ["Safe Zone", "Area inside the trim where all text and important images must stay. Standard: 0.25 in from trim edge."],
          ["Full Wrap Width", "(Front width + Spine width + Back width) + (2 × Bleed)"],
          ["Full Wrap Height", "Trim height + (2 × Bleed)"],
        ]} />
      </div>
    ),
  },
  {
    id: "isbn-manager",
    title: "Chapter 7 — ISBN & Metadata Manager",
    icon: BookMarked,
    content: (
      <div>
        <p className="mb-4">The ISBN & Metadata Manager stores your book's bibliographic data and generates an ONIX 3.0 XML file for submission to distributors, retailers, and library systems.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">Fields You Can Manage</h4>
        <InfoTable rows={[
          ["ISBN-13", "13-digit International Standard Book Number. Auto-calculates the check digit and derives ISBN-10."],
          ["LCCN", "Library of Congress Control Number. Assigned by the Library of Congress before publication."],
          ["BISAC Code", "Book Industry Subject and Category code. Used by retailers and distributors to classify your book."],
          ["Title / Subtitle", "Full title and subtitle as they appear on the cover and in catalogs."],
          ["Author(s)", "Primary author and any co-authors, editors, or illustrators."],
          ["Publisher", "Publishing company name and imprint."],
          ["Publication Date", "On-sale date in YYYY-MM-DD format."],
          ["Edition", "First edition, revised edition, etc."],
          ["Description", "Short catalog description (200–400 words recommended)."],
          ["Language", "ISO 639-1 language code (e.g., 'en' for English)."],
        ]} />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Exporting ONIX 3.0 XML</h4>
        <p className="text-sm text-[#5c3d2e]">Click 'Export ONIX 3.0 XML' to download a standards-compliant ONIX file. Submit this file to Ingram, Baker & Taylor, Amazon Advantage, or your distributor's metadata portal. Most distributors accept ONIX 3.0 directly.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">How to Get an ISBN</h4>
        <p className="text-sm text-[#5c3d2e]">In the United States, ISBNs are purchased from Bowker (myidentifiers.com). A single ISBN costs $125; a block of 10 costs $295. Each format (hardcover, paperback, EPUB, PDF) requires its own ISBN.</p>
      </div>
    ),
  },
  {
    id: "timeline",
    title: "Chapter 8 — Production Timeline",
    icon: BarChart3,
    content: (
      <div>
        <p className="mb-4">The Production Timeline provides a Gantt-style view of your book's production schedule. Set due dates for each phase and track which milestones are on time, approaching, or overdue.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">Setting Up Your Timeline</h4>
        <Step num={1} title="Open the Timeline" desc="Click 'Production Timeline' in the Publisher Tools Hub or the nav bar." />
        <Step num={2} title="Select a Project" desc="Choose the book project you want to schedule." />
        <Step num={3} title="Set Phase Dates" desc="Enter a start and end date for each of the 9 production phases. The Gantt chart updates in real time." />
        <Step num={4} title="Monitor Progress" desc="Phases are color-coded: green (on track), amber (within 7 days of deadline), red (overdue)." />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Typical Production Timelines</h4>
        <InfoTable rows={[
          ["Trade Paperback (novel)", "6–12 months from final manuscript to on-sale date"],
          ["Bible Edition", "12–24 months from manuscript to finished copies"],
          ["Children's Picture Book", "9–18 months (illustration time is the longest phase)"],
          ["Academic Textbook", "12–18 months (peer review and indexing add time)"],
          ["Self-Published eBook Only", "4–8 weeks from final manuscript to live on Amazon"],
        ]} />
      </div>
    ),
  },
  {
    id: "resources",
    title: "Chapter 9 — Resources Hub",
    icon: Library,
    content: (
      <div>
        <p className="mb-4">The Resources Hub provides 43 curated tools and services organized by production phase. Every tool listed is used by professional publishers and is either free or has a free tier.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">Resource Categories</h4>
        <InfoTable rows={[
          ["Writing & Editing", "Scrivener, Hemingway Editor, ProWritingAid, Grammarly"],
          ["Typesetting & Layout", "Adobe InDesign, Affinity Publisher, Vellum, Atticus"],
          ["Cover Design", "Canva Pro, Adobe Photoshop, GIMP, BookBrush"],
          ["ISBN & Distribution", "Bowker, IngramSpark, KDP, Draft2Digital, Smashwords"],
          ["Marketing & Reviews", "NetGalley, BookFunnel, Mailchimp, BookSirens"],
          ["Printing", "IngramSpark, KDP Print, 48HrBooks, Thomson-Shore"],
          ["Bible Typesetting", "Paratext, Logos Bible Software, BibleWorks"],
          ["Legal & Copyright", "US Copyright Office, Creative Commons, Bowker"],
        ]} />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">How to Use the Resources Hub</h4>
        <p className="text-sm text-[#5c3d2e]">Click 'Resources Hub' in the Publisher Tools Hub or nav bar. Resources are organized by production phase — scroll to the phase you are currently working on to see the most relevant tools. Each resource card shows a description, pricing tier, and a direct link to the tool's website.</p>
      </div>
    ),
  },
  {
    id: "wizard",
    title: "Chapter 10 — Publishing Wizard (Guided Onboarding)",
    icon: HelpCircle,
    content: (
      <div>
        <p className="mb-4">The Publishing Wizard is a step-by-step interview that asks what you want to publish and builds a personalized production roadmap for your specific book type. It is the recommended starting point for first-time users.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">How to Start the Wizard</h4>
        <Step num={1} title="Click 'Start Publishing Wizard'" desc="Found on the dashboard below the Publisher Tools Hub, or via the 'Guide' menu in the nav bar." />
        <Step num={2} title="Answer the Questions" desc="The wizard asks about your book type, target audience, publishing goal (self-publish, traditional, hybrid), timeline, and budget." />
        <Step num={3} title="Receive Your Roadmap" desc="Based on your answers, the wizard generates a personalized step-by-step production plan with the tools and resources most relevant to your project." />
        <Step num={4} title="Create Your Project" desc="Click 'Start This Project' at the end of the wizard to create a new project pre-configured with your answers." />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Book Types Supported</h4>
        <InfoTable rows={[
          ["Bible / Scripture", "Full Bible, New Testament only, Psalms & Proverbs, devotional Bible"],
          ["Fiction", "Novel, novella, short story collection, graphic novel"],
          ["Nonfiction", "Memoir, self-help, business, academic, textbook, reference"],
          ["Children's", "Picture book, early reader, middle grade, young adult"],
          ["Poetry", "Single author collection, anthology"],
          ["Other", "Custom roadmap based on your description"],
        ]} />
      </div>
    ),
  },
  {
    id: "print-specs",
    title: "Chapter 11 — Print Specs Generator",
    icon: FileText,
    content: (
      <div>
        <p className="mb-4">The Print Specs Generator builds a complete, press-ready file specification sheet for your printer. It covers every detail your print vendor needs — trim size, bleed, color mode, resolution, PDF standard, and a preflight checklist — so your files are accepted on the first submission.</p>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">How to Generate Print Specs</h4>
        <Step num={1} title="Select Trim Size" desc="Choose from standard sizes (5×8, 5.5×8.5, 6×9, 7×10, 8.5×11) or enter custom dimensions." />
        <Step num={2} title="Select Interior Color" desc="Black & White, Full Color, or Spot Color (Pantone). This determines the color profile and ink specifications." />
        <Step num={3} title="Enter Bleed Settings" desc="Standard bleed is 0.125 in (3mm). Full-bleed photo books may use 0.25 in (6mm). Enter values for top, bottom, inside, and outside." />
        <Step num={4} title="Set Resolution & Color Mode" desc="Interior: 300 DPI minimum, CMYK for color, Grayscale for B&W. Cover: 300 DPI, CMYK always." />
        <Step num={5} title="Generate Spec Sheet" desc="Click 'Generate Specs' to produce a downloadable specification document with all settings." />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Key Print Specifications</h4>
        <InfoTable rows={[
          ["PDF Standard", "PDF/X-1a (most compatible) or PDF/X-4 (supports transparency and ICC profiles)"],
          ["Color Mode", "CMYK for print. Never submit RGB files — colors will shift during conversion."],
          ["Resolution", "300 DPI minimum for all images. 600 DPI recommended for line art and text."],
          ["Fonts", "All fonts must be embedded or converted to outlines. No linked or substituted fonts."],
          ["Bleed", "0.125 in standard. Extend all background images and colors to the bleed edge."],
          ["Safe Zone", "Keep all text and critical content at least 0.25 in inside the trim edge."],
          ["Spine Text", "Only use spine text if the spine is 0.5 in or wider (approximately 100+ pages)."],
        ]} />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Preflight Checklist</h4>
        <InfoTable rows={[
          ["Fonts embedded", "Verify all fonts are embedded (not linked) in the PDF."],
          ["Images 300 DPI+", "No image in the document should be below 300 DPI at print size."],
          ["CMYK color mode", "All colors are in CMYK. No RGB or spot colors (unless specified)."],
          ["Bleed extends", "Background images and colors extend to the bleed edge on all sides."],
          ["No white hairlines", "Check for thin white lines at page edges caused by misaligned objects."],
          ["Page count even", "Total page count must be divisible by 2 (or by 16 for signature printing)."],
        ]} />
      </div>
    ),
  },
  {
    id: "faq",
    title: "Chapter 12 — Frequently Asked Questions",
    icon: HelpCircle,
    content: (
      <div>
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2">General</h4>
        <InfoTable rows={[
          ["Is the platform free to use?", "Yes. All tools on the platform are free. You only pay for printing, ISBNs, and distribution services from third-party vendors."],
          ["Do I need an account?", "No. The app is ready to use immediately — just open it and start creating projects."],
          ["Can I use this for non-Bible books?", "Absolutely. The platform supports any book type — fiction, nonfiction, children's, poetry, academic, and more. Bible Studio is one specialized tool among many."],
          ["Is my data saved?", "Yes. All project data, step progress, and uploaded files are saved to your account and persist across sessions."],
        ]} />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Auto-Produce</h4>
        <InfoTable rows={[
          ["What file formats can I upload?", "Plain text (.txt), Microsoft Word (.docx), and USFM files are supported. Maximum file size is 50MB."],
          ["How long does production take?", "Most jobs complete in 30 seconds to 5 minutes depending on file size and complexity."],
          ["Can I re-run a job with different settings?", "Yes. Start a new production run with updated settings. Previous runs are preserved in your job history."],
          ["What if my job fails?", "The error panel shows the cause and a Retry button. You can retry up to 3 times before starting a new job."],
        ]} />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">ISBN & Metadata</h4>
        <InfoTable rows={[
          ["Where do I buy an ISBN?", "In the US, purchase from Bowker (myidentifiers.com). Single ISBN: $125. Block of 10: $295."],
          ["Do I need separate ISBNs for each format?", "Yes. Hardcover, paperback, EPUB, and PDF each require their own ISBN."],
          ["What is ONIX 3.0?", "ONIX is the industry-standard XML format for sharing book metadata with distributors, retailers, and libraries."],
        ]} />
        <h4 className="font-serif text-base font-semibold text-[#2c1a00] mb-2 mt-4">Cover Design & Print</h4>
        <InfoTable rows={[
          ["What bleed should I use?", "Standard bleed is 0.125 inches (3mm) on all sides. Use 0.25 inches for full-bleed image covers."],
          ["How do I calculate spine width?", "Use the Spine Calculator tool. Enter your page count, paper type, and binding method to get the exact spine width."],
          ["What PDF standard should I use?", "PDF/X-1a is the safest choice for maximum printer compatibility. PDF/X-4 supports transparency if needed."],
          ["What resolution do I need?", "300 DPI minimum for all images. 600 DPI recommended for line art and fine text."],
        ]} />
      </div>
    ),
  },
  {
    id: "glossary",
    title: "Chapter 13 — Publishing Glossary",
    icon: BookOpen,
    content: (
      <div>
        <p className="mb-4">Key terms used throughout the platform and in professional book publishing.</p>
        <InfoTable rows={[
          ["Bleed", "Image or color that extends beyond the trim edge to prevent white borders after cutting."],
          ["BISAC", "Book Industry Subject and Category — a standardized classification code used by retailers."],
          ["CIP Data", "Cataloging-in-Publication data assigned by the Library of Congress for library cataloging."],
          ["Colophon", "A page at the end of a book listing production details: typeface, paper, printer."],
          ["Compositor", "A typesetter who arranges text and images into pages for printing."],
          ["DRM", "Digital Rights Management — technology that restricts copying of digital files."],
          ["EPUB", "Electronic Publication — the standard open format for ebooks."],
          ["Folio", "A page number. In book design, 'running folio' means page numbers in the header or footer."],
          ["Galley", "An early proof of typeset pages, before final page layout is confirmed."],
          ["Gutter", "The inner margin of a page, nearest the spine. Must be wider than the outer margin."],
          ["ISBN", "International Standard Book Number — a unique 13-digit identifier for each book edition."],
          ["LCCN", "Library of Congress Control Number — assigned before publication for library cataloging."],
          ["ONIX", "Online Information eXchange — the industry standard XML format for book metadata."],
          ["PDF/X", "A subset of PDF designed for reliable prepress data exchange with printers."],
          ["PPI", "Pages Per Inch — used to calculate spine width from page count and paper thickness."],
          ["Recto", "A right-hand page (odd-numbered). Chapter openings traditionally start on recto pages."],
          ["Running Head", "A header repeated on every page, typically showing book title or chapter title."],
          ["Safe Zone", "The area inside the trim edge where all text and important images must be placed."],
          ["USFM", "Unified Standard Format Markers — the professional standard for Bible manuscript files."],
          ["Verso", "A left-hand page (even-numbered)."],
        ]} />
      </div>
    ),
  },
];

export default function UserGuide() {
  const [, navigate] = useLocation();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["overview"]));
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const scrollToSection = useCallback((id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    requestAnimationFrame(() => {
      sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const expandAll = () => setOpenSections(new Set(sections.map(s => s.id)));
  const collapseAll = () => setOpenSections(new Set());

  const handleDownloadPdf = useCallback(() => {
    setOpenSections(new Set(sections.map(s => s.id)));

    document.getElementById("guide-print-styles")?.remove();

    const style = document.createElement("style");
    style.id = "guide-print-styles";
    style.textContent = `
      @media print {
        @page { size: letter; margin: 0.6in; }
        body { background: #fff !important; }
        header, nav, .no-print, [data-sidebar], [data-radix-popper-content-wrapper] { display: none !important; }
        .guide-print-hide { display: none !important; }
        .guide-hero-print { padding: 24px 0 !important; background: #fff !important; color: #2a1a0a !important; }
        .guide-hero-print h1 { color: #2a1a0a !important; text-shadow: none !important; font-size: 28px !important; }
        .guide-hero-print p { color: #5c3d2e !important; text-shadow: none !important; }
        .guide-hero-print strong { color: #2a1a0a !important; }
        .guide-section-card { break-inside: avoid-page; page-break-inside: avoid; }
        .guide-footer-print { background: #fff !important; border: 1px solid #e8dfd0 !important; color: #3a2a1a !important; }
        .guide-footer-print p:first-child { color: #8b5e3c !important; }
        .guide-footer-print p:nth-child(2) { color: #8b7b6b !important; }
      }
    `;
    document.head.appendChild(style);

    const origTitle = document.title;
    document.title = "Easy Book Publishers - Self-Publishing Platform Guide";

    const cleanup = () => {
      style.remove();
      document.title = origTitle;
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => window.print(), 600);
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <header className="bg-[#1e1108] text-[#f5efe0] border-b border-[#c9a96e]/10 sticky top-0 z-10 guide-print-hide">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-[#c9a96e]/60 hover:text-[#c9a96e] transition-colors text-sm"
            >
              <ArrowLeft size={15} />
              Dashboard
            </button>
            <span className="text-[#c9a96e]/20">|</span>
            <div className="flex items-center gap-2">
              <img src={EBP_LOGO} alt="Easy Book Publishers" className="w-6 h-6 rounded object-cover" />
              <span className="font-serif text-base text-[#f5efe0]">User Guide</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 text-xs text-[#c9a96e]/60 hover:text-[#c9a96e] transition-colors px-3 py-1.5 rounded-md hover:bg-[#c9a96e]/10"
            >
              <Download size={13} />
              Download PDF
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-[#2a1a0a] text-[#f5efe0] py-14 px-6 guide-hero-print">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-12 bg-[#c9a96e]/40" />
            <img src={EBP_LOGO} alt="Easy Book Publishers" className="w-12 h-12 rounded-xl object-cover" />
            <div className="h-px w-12 bg-[#c9a96e]/40" />
          </div>
          <h1
            className="font-serif text-6xl md:text-7xl leading-tight tracking-wide"
            style={{
              color: "#ffffff",
              textShadow: "0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(201,169,110,0.4), 0 2px 4px rgba(0,0,0,0.5)",
              letterSpacing: "0.04em",
            }}
          >
            Easy Book Publishers
          </h1>
          <p
            className="mt-4 font-serif text-3xl tracking-widest"
            style={{ color: "#f5d98a", textShadow: "0 0 20px rgba(245,217,138,0.5)" }}
          >
            Self-Publishing Platform Guide
          </p>
          <p className="mt-4 text-[#d4c8b4] max-w-xl mx-auto text-sm leading-relaxed">
            Everything you need to create, design, and publish your book — from first idea to finished, print-ready volume using our online publishing platform.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-[#c9a96e]/70 text-sm">
            <span><strong className="text-[#f5efe0]">13</strong> Chapters</span>
            <span className="text-[#c9a96e]/30">|</span>
            <span><strong className="text-[#f5efe0]">9</strong> Production Phases</span>
            <span className="text-[#c9a96e]/30">|</span>
            <span><strong className="text-[#f5efe0]">8</strong> Professional Tools</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between guide-print-hide">
        <p className="text-sm text-[#8b7b6b]">Click any chapter to expand it. All chapters can be open simultaneously.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll} className="text-xs border-[#c9a96e]/30 text-[#5c3d2e] hover:bg-[#faf6ef]">
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs border-[#c9a96e]/30 text-[#5c3d2e] hover:bg-[#faf6ef]">
            Collapse All
          </Button>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto px-6 pb-4 guide-print-hide">
        <div className="border border-[#e8ddd0] rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center gap-3 border-b border-[#e8ddd0] bg-[#faf6ef]/50">
            <div className="w-9 h-9 rounded-lg bg-[#c9a96e]/15 flex items-center justify-center flex-shrink-0">
              <List size={18} className="text-[#c9a96e]" />
            </div>
            <span className="font-serif text-lg text-[#2c1a00] font-medium">Table of Contents</span>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-1">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-[#faf6ef] transition-colors group"
                >
                  <span className="w-6 h-6 rounded-full bg-[#c9a96e]/10 flex items-center justify-center text-xs font-semibold text-[#c9a96e] flex-shrink-0">{index + 1}</span>
                  <Icon size={14} className="text-[#8b7b6b] group-hover:text-[#c9a96e] transition-colors flex-shrink-0" />
                  <span className="text-sm text-[#3a2a1a] group-hover:text-[#2c1a00] transition-colors">{section.title.replace(/^Chapter \d+ — /, "")}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 pb-16 space-y-3">
        {sections.map(section => (
          <div key={section.id} ref={el => { sectionRefs.current[section.id] = el; }} id={`section-${section.id}`}>
            <SectionCard
              section={section}
              isOpen={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          </div>
        ))}

        {/* Related Tools — internal backlinks */}
        <div className="mt-8 p-6 bg-[#faf6ef] rounded-xl border border-[#e8dfd0] guide-print-hide">
          <h2 className="font-serif text-xl text-[#3a2a1a] text-center mb-1">Self-Publishing Tools</h2>
          <p className="text-xs text-[#8b7b6b] text-center mb-5">Jump directly to any tool in the platform.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { href: "/bible-studio", icon: <BookMarked size={16} />, label: "Bible Design Studio" },
              { href: "/spine-calculator", icon: <Ruler size={16} />, label: "Spine Calculator" },
              { href: "/cover-designer", icon: <Layers size={16} />, label: "Cover Designer" },
              { href: "/isbn-manager", icon: <Barcode size={16} />, label: "ISBN & Metadata" },
              { href: "/timeline", icon: <Calendar size={16} />, label: "Production Timeline" },
              { href: "/auto-produce", icon: <Zap size={16} />, label: "Auto-Produce" },
            ].map(({ href, icon, label }) => (
              <Link key={href} href={href}
                className="group flex items-center gap-2 bg-white rounded-lg border border-[#e8dfd0] px-3 py-2.5 hover:border-[#c9a96e]/60 hover:shadow-sm transition-all duration-200">
                <span className="text-[#c9a96e] shrink-0">{icon}</span>
                <span className="text-sm text-[#3a2a1a] group-hover:text-[#5c3d2e] transition-colors font-medium">{label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/resources" className="text-xs text-[#c9a96e] hover:underline">Browse all self-publishing resources →</Link>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 p-6 bg-[#2a1a0a] rounded-xl text-center guide-footer-print">
          <p className="text-[#c9a96e] font-serif text-lg mb-1">Easy Book Publishers</p>
          <p className="text-[#8b7b6b] text-sm">A creator, designer, and publisher's dream platform.</p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Badge className="bg-[#c9a96e]/20 text-[#c9a96e] border-[#c9a96e]/30 text-xs">9 Phases</Badge>
            <Badge className="bg-[#c9a96e]/20 text-[#c9a96e] border-[#c9a96e]/30 text-xs">30 Steps</Badge>
            <Badge className="bg-[#c9a96e]/20 text-[#c9a96e] border-[#c9a96e]/30 text-xs">110 Tracked Inputs</Badge>
            <Badge className="bg-[#c9a96e]/20 text-[#c9a96e] border-[#c9a96e]/30 text-xs">8 Pro Tools</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
