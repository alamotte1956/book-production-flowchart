import { BookOpen, Layers, Ruler, Library, Search, FileText, LayoutGrid, HelpCircle, CreditCard, Compass } from "lucide-react";

const ALL_TOOLS = [
  { key: "bible-studio", label: "Bible Design Studio", desc: "Configure Bible editions — trim, paper, binding, and typesetting", href: "/bible-studio", icon: BookOpen },
  { key: "auto-produce", label: "AI Auto-Produce", desc: "Generate typeset PDF, EPUB, and IDML with one click", href: "/auto-produce/0", icon: Layers },
  { key: "spine-calculator", label: "Spine Calculator", desc: "Calculate exact spine width for any trim size and page count", href: "/spine-calculator", icon: Ruler },
  { key: "cover-designer", label: "Cover Designer", desc: "Full-wrap cover dimensions, bleed, and safe zones", href: "/cover-designer", icon: Library },
  { key: "isbn-manager", label: "ISBN & Metadata", desc: "Manage ISBNs, BISAC codes, and ONIX 3.0 XML export", href: "/isbn-manager", icon: Search },
  { key: "isbn-lookup", label: "ISBN Book Lookup", desc: "Look up any book by ISBN for specs and metadata", href: "/isbn-lookup", icon: Search },
  { key: "templates", label: "Book Templates", desc: "40+ professional templates with style and trim presets", href: "/templates", icon: LayoutGrid },
  { key: "print-specs", label: "Print Specifications", desc: "Generate printer-ready spec sheets for any format", href: "/print-specs", icon: FileText },
  { key: "timeline", label: "Production Timeline", desc: "Gantt chart and deadline tracking for your project", href: "/timeline/0", icon: Layers },
  { key: "resources", label: "Publishing Resources", desc: "Guides, checklists, and references for self-publishing", href: "/resources", icon: HelpCircle },
  { key: "guide", label: "User Guide", desc: "Step-by-step guide to using every tool on the platform", href: "/guide", icon: HelpCircle },
  { key: "pricing", label: "Pricing & Plans", desc: "Compare plans — Starter (free), Author Pro, Publisher", href: "/pricing", icon: CreditCard },
  { key: "guided-journey", label: "Publishing Wizard", desc: "Answer 8 questions to get a personalized publishing roadmap", href: "/guided-journey", icon: Compass },
];

interface RelatedToolsProps {
  currentPage: string;
  maxItems?: number;
}

export default function RelatedTools({ currentPage, maxItems = 6 }: RelatedToolsProps) {
  const tools = ALL_TOOLS.filter((t) => t.key !== currentPage).slice(0, maxItems);

  return (
    <section className="mt-12 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1 bg-[#e8dfd0]" />
        <h3 className="font-serif text-lg text-[#2c1a00] whitespace-nowrap px-3">Related Tools</h3>
        <div className="h-px flex-1 bg-[#e8dfd0]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((tool) => (
          <a
            key={tool.key}
            href={tool.href}
            className="flex items-start gap-3 p-3 rounded-lg border border-[#e8dfd0] bg-white/60 hover:bg-[#f5efe0] hover:border-[#c9a96e]/40 transition-all group"
          >
            <tool.icon className="w-5 h-5 mt-0.5 text-[#c9a96e] flex-shrink-0 group-hover:text-[#8b6914] transition-colors" />
            <div>
              <span className="text-sm font-semibold text-[#2c1a00] group-hover:text-[#5c3d2e] transition-colors">{tool.label}</span>
              <p className="text-xs text-[#8b7b6b] mt-0.5 leading-relaxed">{tool.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
