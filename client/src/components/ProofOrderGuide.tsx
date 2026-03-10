import {
  Package, ExternalLink, CheckCircle2, AlertTriangle,
  Printer, ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PROOF_SERVICES = [
  {
    name: "Amazon KDP",
    cost: "Free (author copies at print cost)",
    shipping: "Standard shipping rates apply",
    turnaround: "3–5 business days production + shipping",
    url: "https://kdp.amazon.com/en_US/help/topic/G201834230",
    linkLabel: "KDP Author Copies Guide",
    pros: ["No setup fee", "Order at print cost", "Same quality as retail copies"],
    cons: ["Must have a published KDP title", "Limited to KDP-compatible trim sizes"],
  },
  {
    name: "IngramSpark",
    cost: "Print cost per copy (varies by specs)",
    shipping: "Shipping calculated at checkout",
    turnaround: "5–7 business days production + shipping",
    url: "https://www.ingramspark.com/",
    linkLabel: "IngramSpark Dashboard",
    pros: ["Wide trim size selection", "High-quality offset printing", "Global distribution network"],
    cons: ["Title setup fee may apply", "Slightly higher per-unit cost than KDP"],
  },
  {
    name: "Barnes & Noble Press",
    cost: "Print cost per copy",
    shipping: "Standard shipping rates",
    turnaround: "5–10 business days",
    url: "https://press.barnesandnoble.com/",
    linkLabel: "B&N Press Dashboard",
    pros: ["No setup fees", "Good quality paperback and hardcover", "Retail distribution on BN.com"],
    cons: ["Fewer trim size options than IngramSpark", "US-focused"],
  },
  {
    name: "BookBaby",
    cost: "Varies by quantity and specs",
    shipping: "Calculated at checkout",
    turnaround: "10–15 business days",
    url: "https://www.bookbaby.com/book-printing",
    linkLabel: "BookBaby Printing",
    pros: ["Full-service printing", "Small quantity runs available", "Quality control included"],
    cons: ["Higher per-unit cost for single copies", "Longer turnaround"],
  },
  {
    name: "48 Hour Books",
    cost: "Starting ~$5–15 per copy (varies by specs)",
    shipping: "Expedited options available",
    turnaround: "2 business days production",
    url: "https://www.48hrbooks.com/",
    linkLabel: "48 Hour Books",
    pros: ["Fastest turnaround in industry", "Low minimums", "Good for rush proofs"],
    cons: ["Premium pricing for speed", "Limited binding options"],
  },
];

const PROOF_CHECKLIST = [
  {
    category: "Margins & Layout",
    items: [
      "Inner (gutter) margins are wide enough — text doesn't disappear into the spine",
      "Outer, top, and bottom margins are consistent throughout",
      "Page numbers are correctly positioned and visible",
      "Chapter openings start on the correct page (recto/verso)",
      "Headers and footers are properly aligned",
    ],
  },
  {
    category: "Bleed & Trim",
    items: [
      "No text or important elements are cut off at the edges",
      "Images that should bleed extend fully to the trim edge",
      "White borders are even on all sides (no shifting)",
    ],
  },
  {
    category: "Typography & Text",
    items: [
      "Font is readable at the printed size",
      "No orphaned or widowed lines at page breaks",
      "Hyphenation looks natural — no excessive breaks",
      "Special characters and diacritics render correctly",
      "Table of contents page numbers match actual pages",
    ],
  },
  {
    category: "Color & Images",
    items: [
      "Cover colors match your expectations (screen vs. print can differ)",
      "Interior images are sharp and not pixelated",
      "Black & white images have good contrast",
      "Color images (if applicable) are accurate",
    ],
  },
  {
    category: "Binding & Physical Quality",
    items: [
      "Spine text is centered and readable",
      "Cover is properly aligned front-to-back",
      "Pages are securely bound — no loose pages",
      "Paper weight and finish feel appropriate",
      "Overall book feels professional and polished",
    ],
  },
];

export default function ProofOrderGuide() {
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showChecklist, setShowChecklist] = useState(false);

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const totalItems = PROOF_CHECKLIST.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = checkedItems.size;

  return (
    <Card className="border border-[#d4b896]/60 bg-gradient-to-br from-white to-[#fdf9f3] shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#c9a96e]/15 ring-2 ring-[#c9a96e]/30 flex items-center justify-center flex-shrink-0">
            <Package className="w-4.5 h-4.5 text-[#8b5e3c]" />
          </div>
          <div>
            <CardTitle className="text-base font-serif text-[#2c1a00]">
              Order a Proof Copy
            </CardTitle>
            <p className="text-xs text-[#7a6e60] mt-0.5">
              Before your final print run, order a single proof to verify quality
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Always order a physical proof before bulk printing.</p>
              <p className="text-xs text-amber-700 mt-1">
                Screen previews can't catch issues with margins, color accuracy, and binding quality.
                A single proof copy costs very little and can save you from an expensive reprint.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#3d2b1f] mb-3 flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#8b5e3c]" />
            Where to Order Your Proof
          </h4>
          <div className="space-y-2">
            {PROOF_SERVICES.map((service) => {
              const isExpanded = expandedService === service.name;
              return (
                <div
                  key={service.name}
                  className="rounded-lg border border-[#e8dfd0]/80 bg-white overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedService(isExpanded ? null : service.name)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-[#fdf9f3] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-semibold text-[#2c1a00]">{service.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[#d4b896] text-[#8b5e3c] bg-[#fdf9f3]">
                        {service.turnaround}
                      </Badge>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#a09080] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#a09080] flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-[#e8dfd0]/60">
                      <div className="grid grid-cols-2 gap-3 pt-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#a09080] font-medium">Cost</p>
                          <p className="text-xs text-[#3d2b1f] mt-0.5">{service.cost}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[#a09080] font-medium">Shipping</p>
                          <p className="text-xs text-[#3d2b1f] mt-0.5">{service.shipping}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-green-700 font-medium mb-1">Pros</p>
                          <ul className="space-y-1">
                            {service.pros.map((pro) => (
                              <li key={pro} className="flex items-start gap-1.5 text-xs text-[#3d2b1f]">
                                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-amber-700 font-medium mb-1">Cons</p>
                          <ul className="space-y-1">
                            {service.cons.map((con) => (
                              <li key={con} className="flex items-start gap-1.5 text-xs text-[#3d2b1f]">
                                <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8b5e3c] hover:text-[#6b4528] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {service.linkLabel}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowChecklist(!showChecklist)}
            className="w-full flex items-center justify-between text-left"
          >
            <h4 className="text-sm font-semibold text-[#3d2b1f] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8b5e3c]" />
              Physical Proof Checklist
              {checkedCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                  {checkedCount}/{totalItems}
                </Badge>
              )}
            </h4>
            {showChecklist ? (
              <ChevronUp className="w-4 h-4 text-[#a09080]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#a09080]" />
            )}
          </button>
          {showChecklist && (
            <div className="mt-3 space-y-4">
              <p className="text-xs text-[#7a6e60]">
                When your proof arrives, go through each item below. Check off items as you verify them.
              </p>
              {PROOF_CHECKLIST.map((category) => (
                <div key={category.category}>
                  <p className="text-xs font-semibold text-[#5c3d2e] uppercase tracking-wider mb-2">
                    {category.category}
                  </p>
                  <ul className="space-y-1.5">
                    {category.items.map((item) => {
                      const isChecked = checkedItems.has(item);
                      return (
                        <li key={item}>
                          <label className="flex items-start gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCheck(item)}
                              className="mt-0.5 rounded border-[#d4b896] text-[#8b5e3c] focus:ring-[#c9a96e] flex-shrink-0"
                            />
                            <span className={`text-xs transition-colors ${
                              isChecked ? "text-[#a09080] line-through" : "text-[#3d2b1f] group-hover:text-[#5c3d2e]"
                            }`}>
                              {item}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {checkedCount === totalItems && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 font-medium">
                    All checks passed! Your proof looks great — you're ready for your full print run.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[#e8dfd0]/80 bg-[#f5ede4] p-3">
          <p className="text-xs text-[#7a6e60] leading-relaxed">
            <strong className="text-[#5c3d2e]">Pro Tip:</strong>{" "}
            Order proofs from the same printer you plan to use for your final run.
            Different printers use different paper stocks, inks, and calibration — what looks perfect
            from one printer may look slightly different from another.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
