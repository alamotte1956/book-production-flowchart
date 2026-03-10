import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ExternalLink,
  Check,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  BookOpen,
  DollarSign,
  Globe,
  FileText,
  Layers,
  CheckCircle2,
  Circle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SiteFooter from "@/components/SiteFooter";

type Channel = {
  id: string;
  name: string;
  logo: string;
  url: string;
  description: string;
  formats: string[];
  ebookRoyalty: string;
  printRoyalty: string;
  setupFee: string;
  perTitleFee: string;
  distributionReach: string;
  paymentThreshold: string;
  paymentFrequency: string;
  pros: string[];
  cons: string[];
  requirements: string[];
  checklist: { label: string; link?: string }[];
  bestFor: string;
  accentColor: string;
};

const channels: Channel[] = [
  {
    id: "kdp",
    name: "Amazon KDP",
    logo: "📦",
    url: "https://kdp.amazon.com",
    description:
      "Amazon's self-publishing platform offers the largest retail reach for both ebooks and print-on-demand paperbacks and hardcovers. With up to 70% ebook royalties and free setup, KDP is the most popular choice for indie authors worldwide.",
    formats: ["Kindle eBook", "Paperback", "Hardcover"],
    ebookRoyalty: "35% or 70%",
    printRoyalty: "60% minus printing costs",
    setupFee: "Free",
    perTitleFee: "Free",
    distributionReach: "Amazon stores worldwide (13 marketplaces)",
    paymentThreshold: "$100 (check) / $10 (direct deposit)",
    paymentFrequency: "Monthly (60 days after month end)",
    pros: [
      "Largest single retailer for books globally",
      "Free to set up and publish — no upfront costs",
      "Print-on-demand means zero inventory risk",
      "70% ebook royalty for books priced $2.99–$9.99",
      "Kindle Unlimited enrollment can boost visibility",
      "Built-in advertising platform (Amazon Ads)",
      "Hardcover option available",
    ],
    cons: [
      "70% royalty requires exclusivity for ebooks (KDP Select)",
      "Limited distribution outside Amazon ecosystem",
      "Frequent algorithm changes affect discoverability",
      "Print quality can be inconsistent across facilities",
      "No direct bookstore or library distribution",
      "Customer service can be impersonal",
    ],
    requirements: [
      "Amazon account with tax information on file",
      "Interior PDF (print) or EPUB/KPF/DOCX (ebook)",
      "Cover PDF meeting KDP specifications (print)",
      "Cover image 2560×1600px minimum (ebook)",
      "ISBN optional for ebook, free ASIN assigned",
      "ISBN required for print (free KDP ISBN or your own)",
    ],
    checklist: [
      { label: "Create or sign in to KDP account", link: "https://kdp.amazon.com" },
      { label: "Complete tax interview (W-9 or W-8BEN)" },
      { label: "Set up payment/bank information" },
      { label: "Prepare interior file (PDF for print, EPUB/DOCX for ebook)" },
      { label: "Design cover using KDP Cover Calculator", link: "https://kdp.amazon.com/en_US/cover-calculator" },
      { label: "Create new title and enter metadata" },
      { label: "Upload interior and cover files" },
      { label: "Use KDP Previewer to check formatting", link: "https://kdp.amazon.com/en_US/help/topic/G202131170" },
      { label: "Set pricing and royalty option" },
      { label: "Publish and wait for review (24–72 hours)" },
    ],
    bestFor: "Authors seeking maximum retail visibility on Amazon",
    accentColor: "#FF9900",
  },
  {
    id: "ingramspark",
    name: "IngramSpark",
    logo: "⚡",
    url: "https://www.ingramspark.com",
    description:
      "IngramSpark is the professional-grade distribution platform powered by Ingram, the world's largest book distributor. It provides access to 40,000+ retailers and libraries worldwide, making it essential for authors who want bookstore presence.",
    formats: ["Paperback", "Hardcover", "eBook"],
    ebookRoyalty: "Varies by retailer (typically 45–70%)",
    printRoyalty: "List price minus print cost minus retailer discount",
    setupFee: "Free (with periodic promotions)",
    perTitleFee: "$49 per title (often waived with promotions)",
    distributionReach: "40,000+ retailers, libraries, and schools worldwide",
    paymentThreshold: "$25",
    paymentFrequency: "Monthly (90 days after month end)",
    pros: [
      "Widest distribution network in the industry (40,000+ partners)",
      "Books available for bookstore and library ordering",
      "Professional-quality print with multiple paper and binding options",
      "Ingram catalog listing gives credibility with retailers",
      "Global distribution to 80+ countries",
      "Returnability option for bookstore stocking",
      "Hardcover with dust jacket option",
    ],
    cons: [
      "Per-title setup fee ($49, sometimes waived)",
      "Revision fees apply for content changes",
      "More complex pricing structure",
      "Longer payment cycle (90 days)",
      "Steeper learning curve than KDP",
      "Retailer discounts reduce margins",
    ],
    requirements: [
      "IngramSpark account with tax documentation",
      "Your own ISBN (not provided by IngramSpark)",
      "Print-ready PDF with embedded fonts",
      "Cover PDF per IngramSpark template specifications",
      "Barcode with ISBN on back cover",
      "EPUB file for ebook distribution",
    ],
    checklist: [
      { label: "Create IngramSpark account", link: "https://www.ingramspark.com" },
      { label: "Purchase your own ISBN from Bowker", link: "https://www.myidentifiers.com" },
      { label: "Complete tax and payment setup" },
      { label: "Download cover template for your trim size", link: "https://www.ingramspark.com/cover-template-generator" },
      { label: "Prepare print-ready interior PDF (with bleeds if needed)" },
      { label: "Design cover using IngramSpark template" },
      { label: "Create new title and enter complete metadata" },
      { label: "Upload interior and cover files" },
      { label: "Set wholesale discount (typically 55% for bookstore orders)" },
      { label: "Choose returnability setting" },
      { label: "Set pricing for each market" },
      { label: "Submit for review (5–7 business days)" },
      { label: "Order a proof copy before approving" },
    ],
    bestFor: "Authors who want bookstore and library distribution",
    accentColor: "#E85D2F",
  },
  {
    id: "bnpress",
    name: "Barnes & Noble Press",
    logo: "📚",
    url: "https://press.barnesandnoble.com",
    description:
      "Barnes & Noble Press (formerly Nook Press) is the self-publishing arm of the largest U.S. brick-and-mortar bookstore chain. It offers both ebook and print-on-demand publishing with potential for in-store placement.",
    formats: ["NOOK eBook", "Paperback", "Hardcover"],
    ebookRoyalty: "65% ($2.99+) or 40% (under $2.99)",
    printRoyalty: "55% minus manufacturing cost",
    setupFee: "Free",
    perTitleFee: "Free",
    distributionReach: "BarnesAndNoble.com and NOOK devices",
    paymentThreshold: "$10",
    paymentFrequency: "Monthly (60 days after month end)",
    pros: [
      "Free to publish with no hidden fees",
      "Largest U.S. bookstore chain — both online and physical stores",
      "Potential for in-store placement and promotions",
      "65% ebook royalty without exclusivity requirements",
      "Clean, straightforward publishing interface",
      "NOOK device and app ecosystem",
      "Growing print-on-demand program",
    ],
    cons: [
      "Much smaller market share than Amazon",
      "Limited international distribution",
      "Fewer marketing tools than KDP",
      "Print program is newer with fewer options",
      "No Kindle Unlimited equivalent for visibility",
      "Smaller ebook reader base",
    ],
    requirements: [
      "Barnes & Noble Press account",
      "Tax information (SSN or EIN for U.S. authors)",
      "EPUB file for ebooks",
      "Print-ready interior PDF",
      "Cover image (ebook) or PDF (print)",
      "ISBN (free B&N ISBN or your own)",
    ],
    checklist: [
      { label: "Create B&N Press account", link: "https://press.barnesandnoble.com" },
      { label: "Complete tax information and payment setup" },
      { label: "Prepare EPUB file for ebook publication" },
      { label: "Prepare interior PDF for print edition" },
      { label: "Create cover meeting B&N specifications" },
      { label: "Enter book details, categories, and description" },
      { label: "Set pricing (consider matching Amazon price)" },
      { label: "Preview your book using the online previewer" },
      { label: "Publish and await approval (48–72 hours)" },
    ],
    bestFor: "Authors targeting the B&N ecosystem and potential in-store presence",
    accentColor: "#2A5B3C",
  },
  {
    id: "applebooks",
    name: "Apple Books",
    logo: "🍎",
    url: "https://authors.apple.com",
    description:
      "Apple Books gives access to millions of Apple device users across iPhone, iPad, and Mac. With a 70% royalty rate and no exclusivity requirements, it's a premium channel for reaching tech-savvy readers.",
    formats: ["eBook (EPUB)"],
    ebookRoyalty: "70%",
    printRoyalty: "N/A (ebook only)",
    setupFee: "Free",
    perTitleFee: "Free",
    distributionReach: "51 countries via Apple Books store",
    paymentThreshold: "$10",
    paymentFrequency: "Monthly (45 days after month end)",
    pros: [
      "70% royalty with no exclusivity requirement",
      "Access to premium Apple device users (high purchase rate)",
      "Beautiful reading experience on Apple devices",
      "Pre-order capabilities up to 365 days in advance",
      "Free promotional tools (Apple Books for Authors)",
      "Global reach across 51 countries",
      "No per-title fees",
    ],
    cons: [
      "Requires a Mac to use Apple Books for Authors directly",
      "Ebook only — no print option",
      "Smaller market share than Kindle",
      "iTunes Connect interface can be complex",
      "Limited to Apple ecosystem readers",
      "Less discovery tools than Amazon",
    ],
    requirements: [
      "Apple ID and iTunes Connect account",
      "Mac computer (or use an aggregator like Draft2Digital)",
      "Valid EPUB 3.0 file",
      "Cover image (minimum 1400px on shortest side)",
      "ISBN recommended but not required",
      "Tax documentation (W-9 or W-8BEN)",
    ],
    checklist: [
      { label: "Create Apple Books for Authors account (requires Mac)", link: "https://authors.apple.com" },
      { label: "Or use Draft2Digital as an aggregator (no Mac needed)", link: "https://www.draft2digital.com" },
      { label: "Complete tax and banking information" },
      { label: "Prepare EPUB 3.0 file" },
      { label: "Create high-resolution cover image" },
      { label: "Upload book and enter metadata" },
      { label: "Set pricing for each territory" },
      { label: "Set up pre-order if desired (up to 1 year in advance)" },
      { label: "Submit for review (24–48 hours)" },
    ],
    bestFor: "Authors who want to reach Apple device users with no exclusivity",
    accentColor: "#555555",
  },
  {
    id: "draft2digital",
    name: "Draft2Digital",
    logo: "✨",
    url: "https://www.draft2digital.com",
    description:
      "Draft2Digital is a powerful book aggregator that distributes your ebook and print book to dozens of retailers and libraries from a single dashboard. Their author-friendly tools and universal book links make multi-platform publishing effortless.",
    formats: ["eBook (EPUB)", "Paperback"],
    ebookRoyalty: "Retailer royalty minus 10% D2D commission",
    printRoyalty: "List price minus print cost minus retailer discount minus D2D fee",
    setupFee: "Free",
    perTitleFee: "Free",
    distributionReach: "Major retailers (Apple, B&N, Kobo, etc.) + libraries + 100+ partners",
    paymentThreshold: "$10",
    paymentFrequency: "Monthly (on the 15th for previous period)",
    pros: [
      "Distribute to multiple retailers from one dashboard",
      "No upfront fees or exclusivity requirements",
      "Free formatting and conversion tools",
      "Universal Book Links for marketing",
      "Library distribution included (OverDrive, Bibliotheca, etc.)",
      "Excellent author-friendly support and interface",
      "Print-on-demand via D2D Print (expanding network)",
      "Automated end matter and mailing list signup",
    ],
    cons: [
      "10% commission on top of retailer cuts",
      "Less control over individual retailer settings",
      "Slightly delayed reporting compared to direct uploads",
      "Print program still growing (fewer options than IngramSpark)",
      "Amazon distribution available but direct KDP is recommended",
      "No advertising platform",
    ],
    requirements: [
      "Draft2Digital account",
      "DOCX, EPUB, or use D2D's free formatting tools",
      "Cover image (minimum 1600×2400px recommended)",
      "ISBN (free D2D ISBN or your own)",
      "Tax documentation",
    ],
    checklist: [
      { label: "Create Draft2Digital account", link: "https://www.draft2digital.com" },
      { label: "Complete tax interview and payment setup" },
      { label: "Upload manuscript (DOCX or EPUB)" },
      { label: "Use D2D's free layout and formatting tools if needed" },
      { label: "Upload cover image" },
      { label: "Enter book metadata, description, and categories" },
      { label: "Select distribution channels (retailers and libraries)" },
      { label: "Set pricing for each channel" },
      { label: "Assign ISBN (use free D2D ISBN or your own)" },
      { label: "Review and publish" },
      { label: "Set up Universal Book Link for marketing", link: "https://books2read.com" },
    ],
    bestFor: "Authors who want wide distribution without managing multiple accounts",
    accentColor: "#4A90D9",
  },
  {
    id: "googleplay",
    name: "Google Play Books",
    logo: "📖",
    url: "https://play.google.com/books/publish",
    description:
      "Google Play Books Partner Center lets you sell ebooks directly through the Google Play Store, reaching Android users worldwide. With a 70% royalty rate and Google's massive search visibility, it's a valuable addition to any distribution strategy.",
    formats: ["eBook (EPUB or PDF)"],
    ebookRoyalty: "70%",
    printRoyalty: "N/A (ebook only)",
    setupFee: "Free",
    perTitleFee: "Free",
    distributionReach: "75+ countries via Google Play Store",
    paymentThreshold: "$1",
    paymentFrequency: "Monthly",
    pros: [
      "70% royalty rate with no exclusivity",
      "Massive global reach via Google Play (75+ countries)",
      "Books appear in Google Search results",
      "Very low payment threshold ($1)",
      "Accepts both EPUB and PDF formats",
      "Google's algorithm can drive organic discovery",
      "Family Library sharing increases exposure",
    ],
    cons: [
      "Partner Center can be invite-only at times",
      "Ebook only — no print option",
      "Smaller dedicated ebook market than Kindle",
      "Interface is less polished than competitors",
      "Limited promotional tools",
      "Reporting and analytics are basic",
    ],
    requirements: [
      "Google Play Books Partner Center account",
      "Google Payments merchant account",
      "EPUB or PDF file",
      "Cover image (minimum 2000px on longest side recommended)",
      "ISBN recommended",
      "Tax documentation",
    ],
    checklist: [
      { label: "Apply for Google Play Books Partner Center", link: "https://play.google.com/books/publish" },
      { label: "Set up Google Payments merchant account" },
      { label: "Complete tax and banking information" },
      { label: "Prepare EPUB or PDF file" },
      { label: "Create high-quality cover image" },
      { label: "Add new book and enter metadata" },
      { label: "Upload content and cover files" },
      { label: "Set pricing and territory availability" },
      { label: "Configure DRM preferences" },
      { label: "Publish and await processing (24–48 hours)" },
    ],
    bestFor: "Authors targeting Android users and leveraging Google Search visibility",
    accentColor: "#34A853",
  },
];

type FilterKey = "all" | "ebook" | "print" | "free" | "wide";

const filterOptions: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Channels" },
  { key: "ebook", label: "eBook" },
  { key: "print", label: "Print" },
  { key: "free", label: "Free Setup" },
  { key: "wide", label: "Wide Distribution" },
];

export default function DistributionGuide() {
  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const filteredChannels = useMemo(() => {
    if (activeFilter === "all") return channels;
    return channels.filter((ch) => {
      switch (activeFilter) {
        case "ebook":
          return ch.formats.some((f) => f.toLowerCase().includes("ebook") || f.toLowerCase().includes("kindle") || f.toLowerCase().includes("nook") || f.toLowerCase().includes("epub"));
        case "print":
          return ch.formats.some((f) => f.toLowerCase().includes("paperback") || f.toLowerCase().includes("hardcover"));
        case "free":
          return ch.setupFee === "Free" && ch.perTitleFee === "Free";
        case "wide":
          return ch.id !== "kdp" && ch.id !== "bnpress";
        default:
          return true;
      }
    });
  }, [activeFilter]);

  const toggleChecklist = (channelId: string, index: number) => {
    const key = `${channelId}-${index}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#f3efe6]">
      <header className="sticky top-0 z-50 bg-[#2a1a0a] text-[#ede7d8] shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#c9a96e] hover:bg-[#c9a96e]/10"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="font-serif text-xl">Distribution Channel Guide</h1>
            <p className="text-xs text-[#c9a96e]/90">
              Compare platforms, royalties, and requirements for every major publishing channel
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#c9a96e]/75">
            <span className="px-2 py-1 rounded-full bg-[#c9a96e]/10">
              {channels.length} channels
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        <section className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveFilter(opt.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === opt.key
                  ? "bg-[#2a1a0a] text-[#f5d98a] shadow-md"
                  : "bg-white text-[#5a4a3a] border border-[#e8dfd0] hover:border-[#c9a96e] hover:text-[#3a2a1a]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </section>

        <section className="overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full bg-white rounded-xl shadow-sm border border-[#e8dfd0] overflow-hidden">
              <thead>
                <tr className="bg-[#2a1a0a] text-[#ede7d8]">
                  <th className="text-left px-4 py-3 font-serif text-sm">Channel</th>
                  <th className="text-left px-4 py-3 font-serif text-sm">Formats</th>
                  <th className="text-left px-4 py-3 font-serif text-sm">eBook Royalty</th>
                  <th className="text-left px-4 py-3 font-serif text-sm">Print Royalty</th>
                  <th className="text-left px-4 py-3 font-serif text-sm">Setup Fee</th>
                  <th className="text-left px-4 py-3 font-serif text-sm">Best For</th>
                </tr>
              </thead>
              <tbody>
                {filteredChannels.map((ch, i) => (
                  <tr
                    key={ch.id}
                    className={`border-t border-[#e8dfd0] hover:bg-[#f9f5ed] cursor-pointer transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-[#faf8f3]"
                    }`}
                    onClick={() => {
                      const el = document.getElementById(`channel-${ch.id}`);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ch.logo}</span>
                        <span className="font-medium text-[#3a2a1a] text-sm">{ch.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {ch.formats.map((f) => (
                          <Badge
                            key={f}
                            variant="outline"
                            className="text-[10px] border-[#e8dfd0] text-[#6b5b4b]"
                          >
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#3a2a1a]">{ch.ebookRoyalty}</td>
                    <td className="px-4 py-3 text-sm text-[#3a2a1a]">{ch.printRoyalty}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${
                          ch.setupFee === "Free" ? "text-green-700" : "text-[#c0392b]"
                        }`}
                      >
                        {ch.setupFee}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6b5b4b] max-w-[200px]">{ch.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-8">
          {filteredChannels.map((ch) => {
            const isExpanded = expandedChannel === ch.id;
            return (
              <div
                key={ch.id}
                id={`channel-${ch.id}`}
                className="bg-white rounded-xl shadow-sm border border-[#e8dfd0] overflow-hidden scroll-mt-24"
              >
                <button
                  onClick={() => setExpandedChannel(isExpanded ? null : ch.id)}
                  className="w-full text-left px-6 py-5 flex items-center gap-4 hover:bg-[#f9f5ed] transition-colors"
                >
                  <span className="text-3xl">{ch.logo}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="font-serif text-xl text-[#3a2a1a]">{ch.name}</h2>
                      <a
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#c9a96e] hover:text-[#b8943d] transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <p className="text-sm text-[#6b5b4b] mt-1 line-clamp-2">{ch.description}</p>
                  </div>
                  <div
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: ch.accentColor + "15" }}
                  >
                    {isExpanded ? (
                      <ChevronUp size={18} style={{ color: ch.accentColor }} />
                    ) : (
                      <ChevronDown size={18} style={{ color: ch.accentColor }} />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 space-y-6 border-t border-[#e8dfd0]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                      <div className="p-4 rounded-lg bg-[#f9f5ed] border border-[#e8dfd0]">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign size={16} className="text-[#c9a96e]" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#8b7b6b]">
                            Royalties
                          </span>
                        </div>
                        <p className="text-sm text-[#3a2a1a]">
                          <strong>eBook:</strong> {ch.ebookRoyalty}
                        </p>
                        <p className="text-sm text-[#3a2a1a]">
                          <strong>Print:</strong> {ch.printRoyalty}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#f9f5ed] border border-[#e8dfd0]">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={16} className="text-[#c9a96e]" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#8b7b6b]">
                            Fees
                          </span>
                        </div>
                        <p className="text-sm text-[#3a2a1a]">
                          <strong>Setup:</strong> {ch.setupFee}
                        </p>
                        <p className="text-sm text-[#3a2a1a]">
                          <strong>Per Title:</strong> {ch.perTitleFee}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#f9f5ed] border border-[#e8dfd0]">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe size={16} className="text-[#c9a96e]" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#8b7b6b]">
                            Distribution
                          </span>
                        </div>
                        <p className="text-sm text-[#3a2a1a]">{ch.distributionReach}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-[#f9f5ed] border border-[#e8dfd0]">
                        <div className="flex items-center gap-2 mb-2">
                          <Layers size={16} className="text-[#c9a96e]" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#8b7b6b]">
                            Payment
                          </span>
                        </div>
                        <p className="text-sm text-[#3a2a1a]">
                          <strong>Threshold:</strong> {ch.paymentThreshold}
                        </p>
                        <p className="text-sm text-[#3a2a1a]">
                          <strong>Frequency:</strong> {ch.paymentFrequency}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-serif text-sm font-semibold text-[#3a2a1a] mb-3 flex items-center gap-2">
                          <Check size={16} className="text-green-600" />
                          Pros
                        </h3>
                        <ul className="space-y-2">
                          {ch.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#4a6741]">
                              <Check size={14} className="shrink-0 mt-0.5 text-green-500" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-semibold text-[#3a2a1a] mb-3 flex items-center gap-2">
                          <X size={16} className="text-red-500" />
                          Cons
                        </h3>
                        <ul className="space-y-2">
                          {ch.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#8b4513]">
                              <X size={14} className="shrink-0 mt-0.5 text-red-400" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif text-sm font-semibold text-[#3a2a1a] mb-3 flex items-center gap-2">
                        <FileText size={16} className="text-[#c9a96e]" />
                        Requirements
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {ch.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#5a4a3a]">
                            <Star size={12} className="shrink-0 mt-1 text-[#c9a96e]" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#f9f5ed] rounded-lg p-5 border border-[#e8dfd0]">
                      <h3 className="font-serif text-sm font-semibold text-[#3a2a1a] mb-4 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[#c9a96e]" />
                        Setup Checklist
                      </h3>
                      <ul className="space-y-3">
                        {ch.checklist.map((item, i) => {
                          const key = `${ch.id}-${i}`;
                          const checked = checkedItems[key] || false;
                          return (
                            <li key={i} className="flex items-start gap-3">
                              <button
                                onClick={() => toggleChecklist(ch.id, i)}
                                className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  checked
                                    ? "bg-[#4a6741] border-[#4a6741] text-white"
                                    : "border-[#c9a96e] hover:border-[#b8943d]"
                                }`}
                              >
                                {checked && <Check size={12} />}
                              </button>
                              <span
                                className={`text-sm ${
                                  checked ? "line-through text-[#8b7b6b]" : "text-[#3a2a1a]"
                                }`}
                              >
                                {item.label}
                                {item.link && (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 ml-2 text-[#c9a96e] hover:text-[#b8943d] transition-colors"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-4 pt-3 border-t border-[#e8dfd0]">
                        <p className="text-xs text-[#8b7b6b]">
                          {ch.checklist.filter((_, i) => checkedItems[`${ch.id}-${i}`]).length} of{" "}
                          {ch.checklist.length} steps completed
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-[#e8dfd0] p-6">
          <h2 className="font-serif text-lg text-[#3a2a1a] mb-4">Recommended Strategy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-[#f9f5ed] border border-[#e8dfd0]">
              <h3 className="font-serif text-sm font-semibold text-[#3a2a1a] mb-2">
                🎯 Maximum Reach
              </h3>
              <p className="text-sm text-[#5a4a3a]">
                Publish print via <strong>KDP + IngramSpark</strong> and distribute ebooks through{" "}
                <strong>Draft2Digital</strong> (which covers Apple, B&N, Kobo, Google Play, and
                more). This gives you the widest possible reach with minimal account management.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#f9f5ed] border border-[#e8dfd0]">
              <h3 className="font-serif text-sm font-semibold text-[#3a2a1a] mb-2">
                💰 Maximum Royalty
              </h3>
              <p className="text-sm text-[#5a4a3a]">
                Go direct on every platform: <strong>KDP</strong> for Amazon,{" "}
                <strong>Apple Books</strong> direct, <strong>B&N Press</strong> direct, and{" "}
                <strong>Google Play</strong> direct. Skip aggregators to keep the full royalty — but
                manage more accounts.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#f9f5ed] border border-[#e8dfd0]">
              <h3 className="font-serif text-sm font-semibold text-[#3a2a1a] mb-2">
                🚀 Quick Start
              </h3>
              <p className="text-sm text-[#5a4a3a]">
                Start with <strong>Amazon KDP</strong> for both ebook and print. It's free, fast,
                and gives you immediate access to the world's largest book retailer. Expand to other
                channels after you've validated your book.
              </p>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
