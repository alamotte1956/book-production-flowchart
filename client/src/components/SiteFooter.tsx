import { BookOpen, Layers, Ruler, Library, Search, FileText, LayoutGrid, HelpCircle, CreditCard, Compass, Shield, Users, BookMarked, Megaphone, Globe, Calculator } from "lucide-react";

const footerSections = [
  {
    title: "Publishing Tools",
    links: [
      { label: "Bible Design Studio", href: "/bible-studio", icon: BookOpen },
      { label: "AI Auto-Produce", href: "/auto-produce/0", icon: Layers },
      { label: "Spine Calculator", href: "/spine-calculator", icon: Ruler },
      { label: "Cover Designer", href: "/cover-designer", icon: Library },
      { label: "Print Specifications", href: "/print-specs", icon: FileText },
      { label: "Marketing Toolkit", href: "/marketing-toolkit", icon: Megaphone },
    ],
  },
  {
    title: "Metadata & Research",
    links: [
      { label: "ISBN Manager", href: "/isbn-manager", icon: Search },
      { label: "ISBN Book Lookup", href: "/isbn-lookup", icon: Search },
      { label: "Royalty Calculator", href: "/royalty-calculator", icon: Calculator },
      { label: "Book Templates", href: "/templates", icon: LayoutGrid },
      { label: "Production Timeline", href: "/timeline/0", icon: Layers },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Distribution Guide", href: "/distribution-guide", icon: Globe },
      { label: "Publishing Resources", href: "/resources", icon: Library },
      { label: "User Guide", href: "/guide", icon: HelpCircle },
      { label: "Publishing Glossary", href: "/glossary", icon: BookMarked },
      { label: "Publishing Wizard", href: "/guided-journey", icon: Compass },
      { label: "Pricing & Plans", href: "/pricing", icon: CreditCard },
      { label: "Privacy & Terms", href: "/privacy-terms", icon: Shield },
      { label: "Affiliate Program", href: "/affiliates", icon: Users },
    ],
  },
];

const exportFormats = [
  "Interior PDF",
  "KDP Print-Ready PDF",
  "EPUB 3",
  "InDesign IDML",
  "ONIX 3.0 XML",
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#2c1a00] text-[#d4c4a8] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <a href="/" className="flex items-center gap-3 mb-4 group">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
                alt="Easy Book Publishers"
                className="w-8 h-8 opacity-80"
              />
              <div>
                <h3 className="font-serif text-lg text-[#ede7d8] leading-tight group-hover:text-[#f5d98a] transition-colors">Easy Book Publishers</h3>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#c9a96e]">Manuscript to Masterpiece</p>
              </div>
            </a>
            <p className="text-sm text-[#c4b8a0] leading-relaxed mb-4">
              The all-in-one self-publishing platform. Design, typeset, and produce print-ready books with professional tools — no software to download, works on any device.
            </p>
            <div className="space-y-1">
              <p className="text-xs text-[#b0a090] font-medium uppercase tracking-wider">Export Formats</p>
              <div className="flex flex-wrap gap-1.5">
                {exportFormats.map((fmt) => (
                  <span key={fmt} className="text-[10px] px-2 py-0.5 rounded-full bg-[#3a2a14] text-[#c9a96e] border border-[#5c3d2e]/30">
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-serif text-sm text-[#ede7d8] font-semibold mb-3 uppercase tracking-wider">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-[#c4b8a0] hover:text-[#ede7d8] transition-colors flex items-center gap-2 group"
                    >
                      <link.icon className="w-3.5 h-3.5 text-[#c9a96e]/75 group-hover:text-[#c9a96e] transition-colors" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#5c3d2e]/30 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center gap-4 text-xs text-[#b0a090]">
              <a href="/pricing" className="hover:text-[#c9a96e] transition-colors">Pricing</a>
              <span className="text-[#5c3d2e]">|</span>
              <a href="/guide" className="hover:text-[#c9a96e] transition-colors">User Guide</a>
              <span className="text-[#5c3d2e]">|</span>
              <a href="/resources" className="hover:text-[#c9a96e] transition-colors">Resources</a>
              <span className="text-[#5c3d2e]">|</span>
              <a href="/guided-journey" className="hover:text-[#c9a96e] transition-colors">Publishing Wizard</a>
              <span className="text-[#5c3d2e]">|</span>
              <a href="/glossary" className="hover:text-[#c9a96e] transition-colors">Glossary</a>
              <span className="text-[#5c3d2e]">|</span>
              <a href="/templates" className="hover:text-[#c9a96e] transition-colors">Templates</a>
              <span className="text-[#5c3d2e]">|</span>
              <a href="/privacy-terms" className="hover:text-[#c9a96e] transition-colors">Privacy & Terms</a>
              <span className="text-[#5c3d2e]">|</span>
              <a href="/affiliates" className="hover:text-[#c9a96e] transition-colors">Affiliates</a>
            </div>
            <p className="text-xs text-[#b0a090]">
              &copy; {new Date().getFullYear()} Easy Book Publishers. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
