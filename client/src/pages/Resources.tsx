/**
 * Resources & Success Hub
 * Curated links organized by book production phase, plus industry stats.
 */

import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ExternalLink, TrendingUp, BookOpen, Users, DollarSign, Star, BookMarked, Ruler, Layers, Barcode, Calendar, Zap, Handshake, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import RelatedTools from "@/components/RelatedTools";
import SiteFooter from "@/components/SiteFooter";

// ─── Types ──────────────────────────────────────────────────────

type Resource = {
  name: string;
  url: string;
  description: string;
  free: boolean;
  tags: string[];
};

type ResourceCategory = {
  id: string;
  phase: string;
  phaseNumber: number;
  accentColor: string;
  icon: string;
  resources: Resource[];
};

// ─── Resource Data ───────────────────────────────────────────────

const categories: ResourceCategory[] = [
  {
    id: "writing",
    phase: "Concept & Writing",
    phaseNumber: 1,
    accentColor: "#7c5cbf",
    icon: "✍️",
    resources: [
      {
        name: "Scrivener",
        url: "https://www.literatureandlatte.com/scrivener/overview",
        description: "The industry-standard manuscript writing and organization tool. Supports long-form projects with corkboard, outlining, and compile-to-format features.",
        free: false,
        tags: ["Writing", "Organization", "Desktop"],
      },
      {
        name: "Reedsy Book Editor",
        url: "https://reedsy.com/write-a-book",
        description: "Free browser-based writing tool that exports to professionally formatted EPUB and PDF. No software install needed.",
        free: true,
        tags: ["Writing", "Formatting", "Browser"],
      },
      {
        name: "Atticus",
        url: "https://www.atticus.io",
        description: "All-in-one writing and book formatting tool. Write, format, and export print-ready files in one place. Strong Scrivener alternative.",
        free: false,
        tags: ["Writing", "Formatting", "Desktop"],
      },
      {
        name: "One Stop for Writers",
        url: "https://onestopforwriters.com",
        description: "Comprehensive story-building toolkit with character arc templates, setting thesaurus, emotional wound database, and scene maps.",
        free: false,
        tags: ["Story Development", "Research", "Browser"],
      },
      {
        name: "Writer's Digest",
        url: "https://www.writersdigest.com",
        description: "The go-to resource for craft improvement — articles, courses, contests, and the annual 101 Best Websites for Writers list.",
        free: true,
        tags: ["Craft", "Community", "Education"],
      },
    ],
  },
  {
    id: "acquisitions",
    phase: "Acquisitions & Querying",
    phaseNumber: 2,
    accentColor: "#c9a96e",
    icon: "📬",
    resources: [
      {
        name: "QueryTracker",
        url: "https://querytracker.net",
        description: "Free database of literary agents with submission stats, response times, and community-reported query outcomes. The most-used querying tool.",
        free: true,
        tags: ["Literary Agents", "Querying", "Database"],
      },
      {
        name: "Publishers Marketplace",
        url: "https://publishersmarketplace.com",
        description: "The professional hub of the publishing industry. Track deals, find agents and editors, and access Publishers Lunch newsletter.",
        free: false,
        tags: ["Industry", "Agents", "Deals"],
      },
      {
        name: "Manuscript Wish List (MSWL)",
        url: "https://www.manuscriptwishlist.com",
        description: "Agents and editors post exactly what they're looking for. Search by genre, theme, or trope to find the perfect match for your manuscript.",
        free: true,
        tags: ["Agents", "Querying", "Matching"],
      },
      {
        name: "QueryShark",
        url: "http://queryshark.blogspot.com",
        description: "Literary agent Janet Reid critiques real query letters. Invaluable for learning what works and what doesn't in a query.",
        free: true,
        tags: ["Query Letters", "Craft", "Education"],
      },
      {
        name: "Duotrope",
        url: "https://duotrope.com",
        description: "Submission tracker and market database for short fiction, poetry, and novels. Tracks response times and acceptance rates.",
        free: false,
        tags: ["Submissions", "Markets", "Tracking"],
      },
      {
        name: "Jane Friedman's Blog",
        url: "https://www.janefriedman.com",
        description: "One of the most trusted voices in publishing. In-depth guides on querying, contracts, and the publishing landscape.",
        free: true,
        tags: ["Education", "Industry", "Contracts"],
      },
    ],
  },
  {
    id: "editorial",
    phase: "Editorial & Editing",
    phaseNumber: 3,
    accentColor: "#4a6741",
    icon: "📝",
    resources: [
      {
        name: "Reedsy",
        url: "https://reedsy.com",
        description: "Marketplace to find vetted developmental editors, copy editors, proofreaders, and book designers. Transparent pricing and reviews.",
        free: true,
        tags: ["Editors", "Marketplace", "Professionals"],
      },
      {
        name: "ProWritingAid",
        url: "https://prowritingaid.com",
        description: "Deep grammar, style, and readability analysis tool. Goes far beyond Grammarly — checks pacing, overused words, and sentence variety.",
        free: false,
        tags: ["Editing", "Grammar", "Style"],
      },
      {
        name: "Grammarly",
        url: "https://www.grammarly.com",
        description: "Real-time grammar and spelling checker. Best for quick copy-editing passes and catching surface-level errors.",
        free: true,
        tags: ["Grammar", "Spelling", "Browser"],
      },
      {
        name: "The Editorial Freelancers Association",
        url: "https://www.the-efa.org",
        description: "Professional directory of freelance editors with rate guidelines and a job board. Use to find qualified editors outside Reedsy.",
        free: true,
        tags: ["Editors", "Directory", "Professional"],
      },
      {
        name: "Hemingway Editor",
        url: "https://hemingwayapp.com",
        description: "Highlights dense, hard-to-read sentences and passive voice. Excellent for tightening prose and improving readability scores.",
        free: true,
        tags: ["Editing", "Readability", "Browser"],
      },
    ],
  },
  {
    id: "design",
    phase: "Design & Layout",
    phaseNumber: 4,
    accentColor: "#c0392b",
    icon: "🎨",
    resources: [
      {
        name: "99designs",
        url: "https://99designs.com/book-covers",
        description: "Run a design contest or hire a book cover designer directly. Access to thousands of professional designers worldwide.",
        free: false,
        tags: ["Cover Design", "Marketplace", "Professionals"],
      },
      {
        name: "The Book Cover Designer",
        url: "https://thebookcoverdesigner.com",
        description: "Pre-made and custom book cover designs by professional designers. Popular with indie authors for genre-specific covers.",
        free: false,
        tags: ["Cover Design", "Pre-made", "Templates"],
      },
      {
        name: "Canva",
        url: "https://www.canva.com",
        description: "Accessible design tool with book cover templates. Best for social media graphics and promotional materials rather than print-ready files.",
        free: true,
        tags: ["Design", "Templates", "Browser"],
      },
      {
        name: "Adobe InDesign",
        url: "https://www.adobe.com/products/indesign.html",
        description: "The industry standard for professional interior book layout and typesetting. Required for complex layouts with images and tables.",
        free: false,
        tags: ["Interior Layout", "Typesetting", "Professional"],
      },
      {
        name: "Vellum",
        url: "https://vellum.pub",
        description: "Mac-only tool for creating beautifully formatted ebooks and print books. Extremely popular with indie romance and fiction authors.",
        free: false,
        tags: ["Formatting", "Ebook", "Print", "Mac"],
      },
      {
        name: "Creative Market",
        url: "https://creativemarket.com",
        description: "Marketplace for fonts, graphics, and design assets. Find unique typefaces and decorative elements for interior design.",
        free: false,
        tags: ["Fonts", "Graphics", "Assets"],
      },
    ],
  },
  {
    id: "preproduction",
    phase: "Pre-Production & Registration",
    phaseNumber: 5,
    accentColor: "#2980b9",
    icon: "🔢",
    resources: [
      {
        name: "Bowker (ISBN Registration)",
        url: "https://www.myidentifiers.com",
        description: "The official U.S. ISBN agency. Purchase ISBNs for your book. A single ISBN costs $125; a block of 10 costs $295.",
        free: false,
        tags: ["ISBN", "Registration", "Official"],
      },
      {
        name: "U.S. Copyright Office",
        url: "https://www.copyright.gov/registration/",
        description: "Official copyright registration for your book. Provides legal protection and is required to sue for statutory damages.",
        free: false,
        tags: ["Copyright", "Legal", "Registration"],
      },
      {
        name: "Library of Congress (PCN)",
        url: "https://www.loc.gov/publish/pcn/",
        description: "Apply for a Preassigned Control Number (PCN/LCCN) so libraries can catalog your book. Free for qualifying publishers.",
        free: true,
        tags: ["Library", "Cataloging", "Registration"],
      },
      {
        name: "Publishers Marketplace",
        url: "https://publishersmarketplace.com",
        description: "Register your book deal, find co-agents for foreign rights, and track subsidiary rights sales.",
        free: false,
        tags: ["Rights", "Industry", "Deals"],
      },
    ],
  },
  {
    id: "production",
    phase: "Production & Manufacturing",
    phaseNumber: 6,
    accentColor: "#e67e22",
    icon: "🏭",
    resources: [
      {
        name: "Amazon KDP",
        url: "https://kdp.amazon.com",
        description: "Amazon's self-publishing platform for print-on-demand paperbacks, hardcovers, and Kindle ebooks. Largest retail reach. 70% royalty on ebooks.",
        free: true,
        tags: ["Print-on-Demand", "Ebook", "Distribution"],
      },
      {
        name: "IngramSpark",
        url: "https://www.ingramspark.com",
        description: "Professional-grade print-on-demand and ebook distribution to 40,000+ retailers and libraries worldwide. Best for bookstore distribution.",
        free: false,
        tags: ["Print-on-Demand", "Distribution", "Bookstores"],
      },
      {
        name: "Draft2Digital",
        url: "https://www.draft2digital.com",
        description: "Free ebook and print distribution aggregator. Distributes to Apple Books, Kobo, Barnes & Noble, and more. No upfront fees.",
        free: true,
        tags: ["Ebook", "Distribution", "Aggregator"],
      },
      {
        name: "BookBaby",
        url: "https://www.bookbaby.com",
        description: "Full-service self-publishing company offering editing, design, printing, and global distribution. Higher cost but more hand-holding.",
        free: false,
        tags: ["Full-Service", "Print", "Distribution"],
      },
      {
        name: "ACX (Audiobook Creation Exchange)",
        url: "https://www.acx.com",
        description: "Amazon's platform to produce and distribute audiobooks through Audible, Amazon, and iTunes. Connect with narrators or narrate yourself.",
        free: true,
        tags: ["Audiobook", "Narration", "Distribution"],
      },
    ],
  },
  {
    id: "marketing",
    phase: "Distribution & Marketing",
    phaseNumber: 7,
    accentColor: "#16a085",
    icon: "📣",
    resources: [
      {
        name: "BookBub",
        url: "https://www.bookbub.com/partners",
        description: "The most powerful book promotion platform. A Featured Deal can sell thousands of copies in a day. Highly competitive but transformative.",
        free: false,
        tags: ["Promotions", "Email", "Advertising"],
      },
      {
        name: "NetGalley",
        url: "https://www.netgalley.com",
        description: "Send advance reader copies (ARCs) to reviewers, librarians, booksellers, and educators. Essential for building pre-launch buzz.",
        free: false,
        tags: ["ARCs", "Reviews", "Pre-Launch"],
      },
      {
        name: "Goodreads",
        url: "https://www.goodreads.com",
        description: "The world's largest book community. Create an author profile, run giveaways, and engage with readers. Critical for discoverability.",
        free: true,
        tags: ["Community", "Reviews", "Discoverability"],
      },
      {
        name: "BookFunnel",
        url: "https://bookfunnel.com",
        description: "Deliver reader magnets and ARCs to your email list. Runs group promotions to grow your newsletter. Essential for list-building.",
        free: false,
        tags: ["Email List", "ARCs", "Reader Magnets"],
      },
      {
        name: "Substack",
        url: "https://substack.com",
        description: "Build a direct author newsletter with paid subscription options. Growing platform for author-reader relationships and serialized content.",
        free: true,
        tags: ["Newsletter", "Author Platform", "Community"],
      },
      {
        name: "Publisher Rocket",
        url: "https://publisherrocket.com",
        description: "Research Amazon keywords, categories, and competitor data to optimize your book's discoverability on Amazon and other retailers.",
        free: false,
        tags: ["Keywords", "Amazon", "Research"],
      },
      {
        name: "Poets & Writers",
        url: "https://www.pw.org",
        description: "Grants database, literary events calendar, and MFA program listings. Best resource for literary fiction and poetry authors.",
        free: true,
        tags: ["Grants", "Literary", "Community"],
      },
    ],
  },
  {
    id: "postpublication",
    phase: "Post-Publication",
    phaseNumber: 8,
    accentColor: "#8e44ad",
    icon: "🌟",
    resources: [
      {
        name: "Alliance of Independent Authors (ALLi)",
        url: "https://www.allianceindependentauthors.org",
        description: "The leading professional association for indie authors. Watchdog reports on publishing services, member discounts, and advocacy.",
        free: false,
        tags: ["Association", "Indie", "Professional"],
      },
      {
        name: "Kindlepreneur",
        url: "https://kindlepreneur.com",
        description: "Dave Chesson's resource hub for self-publishing strategy, keyword research, and book marketing. Highly practical and data-driven.",
        free: true,
        tags: ["Strategy", "Marketing", "Education"],
      },
      {
        name: "The Creative Penn",
        url: "https://www.thecreativepenn.com",
        description: "Joanna Penn's comprehensive resource for indie authors — podcast, blog, and courses covering all aspects of the author business.",
        free: true,
        tags: ["Business", "Strategy", "Podcast"],
      },
      {
        name: "Reedsy Learning",
        url: "https://reedsy.com/learning",
        description: "Free 10-day email courses on writing, editing, publishing, and marketing. Taught by industry professionals.",
        free: true,
        tags: ["Education", "Courses", "Free"],
      },
    ],
  },
];

// ─── Industry Stats ──────────────────────────────────────────────

const stats = [
  {
    icon: DollarSign,
    value: "$32.5B",
    label: "U.S. publishing industry revenue in 2024",
    source: "Association of American Publishers",
    color: "#4a6741",
  },
  {
    icon: TrendingUp,
    value: "+264%",
    label: "Growth in self-publishing over the last five years",
    source: "Self-Publishing Statistics 2025",
    color: "#c9a96e",
  },
  {
    icon: BookOpen,
    value: "2.6M+",
    label: "Self-published titles released annually",
    source: "Automateed Research, 2025",
    color: "#7c5cbf",
  },
  {
    icon: Users,
    value: "70%",
    label: "Royalty rate for Kindle ebooks priced $2.99–$9.99",
    source: "Amazon KDP",
    color: "#2980b9",
  },
  {
    icon: Star,
    value: "4.4%",
    label: "Growth in trade publishing revenue in 2024",
    source: "AAP StatShot Annual Report",
    color: "#c0392b",
  },
  {
    icon: TrendingUp,
    value: "$170B",
    label: "Projected global book market revenue by 2027",
    source: "Global Book Sales Forecast",
    color: "#16a085",
  },
];

// ─── Publisher Partners ──────────────────────────────────────

const publisherPartners = [
  {
    name: "Harvest House Publishers",
    url: "https://www.harvesthousepublishers.com",
    description: "One of the largest independent Christian publishers in the U.S., Harvest House specializes in books that help people grow spiritually, including Bible studies, devotionals, fiction, and family resources.",
    specialties: ["Devotionals", "Bible Studies", "Christian Fiction", "Family"],
  },
  {
    name: "Tyndale House Publishers",
    url: "https://www.tyndale.com",
    description: "A leading publisher of Christian literature including the bestselling New Living Translation Bible. Tyndale publishes fiction, nonfiction, children's books, and digital media with a focus on practical Christian living.",
    specialties: ["Bibles", "Nonfiction", "Fiction", "Children's"],
  },
  {
    name: "Zondervan",
    url: "https://www.zondervan.com",
    description: "A world leader in Christian communications and a division of HarperCollins. Publisher of the New International Version (NIV) Bible, along with a broad range of inspirational, academic, and children's titles.",
    specialties: ["Bibles", "Academic", "Inspirational", "Children's"],
  },
  {
    name: "BronzeBow Publishing",
    url: "https://www.bronzebowpublishing.com",
    description: "A faith-based publishing company dedicated to producing high-quality Christian books, curriculum, and media. BronzeBow partners with authors to bring impactful stories and teachings to a wide audience.",
    specialties: ["Christian Living", "Curriculum", "Ministry", "Media"],
  },
];

const categoryFilters = [
  { id: "all", label: "All" },
  { id: "writing", label: "Writing" },
  { id: "acquisitions", label: "Acquisitions" },
  { id: "editorial", label: "Editorial" },
  { id: "design", label: "Design" },
  { id: "preproduction", label: "Pre-Production" },
  { id: "production", label: "Production" },
  { id: "marketing", label: "Marketing" },
  { id: "postpublication", label: "Post-Publication" },
] as const;

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-[#c9a96e]/30 text-inherit rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

// ─── Component ───────────────────────────────────────────────────

export default function Resources() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return categories
      .filter((cat) => activeCategory === "all" || cat.id === activeCategory)
      .map((cat) => {
        if (!q) return cat;
        const filtered = cat.resources.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.tags.some((t) => t.toLowerCase().includes(q)),
        );
        return { ...cat, resources: filtered };
      })
      .filter((cat) => cat.resources.length > 0);
  }, [searchQuery, activeCategory]);

  const hasActiveFilters = searchQuery.trim() !== "" || activeCategory !== "all";

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#2a1a0a] text-[#f5efe0] shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost" size="icon"
            className="text-[#c9a96e] hover:bg-[#c9a96e]/10"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="font-serif text-xl">Self-Publishing &amp; Online Publishing Resources</h1>
            <p className="text-xs text-[#c9a96e]/70">The most trusted tools and platforms to create, design, and publish your book at every stage</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#c9a96e]/50">
            <span className="px-2 py-1 rounded-full bg-[#c9a96e]/10">
              {categories.reduce((acc, c) => acc + c.resources.length, 0)} curated resources
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">

        {/* Search & Filter */}
        <section className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89880]" />
            <Input
              type="text"
              placeholder="Search resources by name, description, or tag…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 bg-white border-[#e8dfd0] text-[#3a2a1a] placeholder:text-[#a89880] focus-visible:ring-[#c9a96e]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a89880] hover:text-[#3a2a1a] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveCategory(filter.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === filter.id
                    ? "bg-[#2a1a0a] text-[#f5efe0] shadow-sm"
                    : "bg-white border border-[#e8dfd0] text-[#5c3d2e] hover:border-[#c9a96e]/50 hover:bg-[#c9a96e]/5"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-3 text-sm text-[#8b7b6b]">
              <span>
                {filteredCategories.reduce((acc, c) => acc + c.resources.length, 0)} resource{filteredCategories.reduce((acc, c) => acc + c.resources.length, 0) !== 1 ? "s" : ""} found
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="text-[#c9a96e] hover:text-[#3a2a1a] underline underline-offset-2 transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Industry Stats */}
        <section>
          <h2 className="font-serif text-2xl text-[#3a2a1a] mb-2">The Self-Publishing Landscape</h2>
          <p className="text-sm text-[#8b7b6b] mb-6 max-w-2xl">
            Understanding the online publishing market helps you set realistic goals and make informed decisions about your self-publishing path.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-[#e8dfd0] p-5 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon size={16} style={{ color: stat.color }} />
                    </div>
                    <span className="font-serif text-2xl font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm text-[#3a2a1a] leading-snug">{stat.label}</p>
                  <p className="text-[11px] text-[#a89880]">— {stat.source}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Publisher Partners */}
        <section id="publisher-partners" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#7c5cbf]/15 shrink-0">
              <Handshake size={20} className="text-[#7c5cbf]" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#3a2a1a]">Publisher Partners</h2>
            </div>
          </div>
          <p className="text-sm text-[#8b7b6b] mb-6 max-w-2xl">
            Easy Book Publishers works with these trusted publishing partners to bring faith-based content to readers worldwide.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publisherPartners.map((partner) => (
              <a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl border border-[#e8dfd0] p-5 hover:border-[#7c5cbf]/40 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-base text-[#3a2a1a] group-hover:text-[#5c3d2e] transition-colors">
                    {partner.name}
                  </h3>
                  <ExternalLink size={14} className="text-[#a89880] group-hover:text-[#7c5cbf] shrink-0 mt-0.5 transition-colors" />
                </div>
                <p className="text-sm text-[#5c3d2e] leading-relaxed">{partner.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {partner.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#7c5cbf]/10 text-[#7c5cbf]"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Resource Categories */}
        {filteredCategories.length === 0 && hasActiveFilters && (
          <div className="text-center py-16">
            <Search size={40} className="mx-auto text-[#e8dfd0] mb-4" />
            <p className="font-serif text-lg text-[#3a2a1a]">No resources found</p>
            <p className="text-sm text-[#8b7b6b] mt-1">Try adjusting your search or category filter.</p>
          </div>
        )}
        {filteredCategories.map((category) => (
          <section key={category.id} id={`resources-${category.id}`} className="scroll-mt-20">
            {/* Phase header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: category.accentColor }}
              >
                {category.phaseNumber}
              </div>
              <div>
                <h2 className="font-serif text-xl text-[#3a2a1a]">
                  {category.icon} {category.phase}
                </h2>
                <p className="text-xs text-[#a89880]">{category.resources.length} resources</p>
              </div>
            </div>

            {/* Resource cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2" style={{ borderColor: `${category.accentColor}30` }}>
              {category.resources.map((resource) => (
                <a
                  key={resource.name}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-xl border border-[#e8dfd0] p-5 hover:border-[#c9a96e]/50 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-base text-[#3a2a1a] group-hover:text-[#5c3d2e] transition-colors">
                        <HighlightText text={resource.name} query={searchQuery} />
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0 ${resource.free ? "border-[#4a6741]/40 text-[#4a6741]" : "border-[#c9a96e]/40 text-[#8b7b6b]"}`}
                      >
                        {resource.free ? "Free" : "Paid"}
                      </Badge>
                    </div>
                    <ExternalLink size={14} className="text-[#a89880] group-hover:text-[#c9a96e] shrink-0 mt-0.5 transition-colors" />
                  </div>
                  <p className="text-sm text-[#5c3d2e] leading-relaxed">
                    <HighlightText text={resource.description} query={searchQuery} />
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0e8d8] text-[#8b7b6b]"
                      >
                        <HighlightText text={tag} query={searchQuery} />
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* Related Tools — internal backlinks */}
        <div className="py-10 border-t border-[#e8dfd0]">
          <h2 className="font-serif text-2xl text-[#3a2a1a] text-center mb-2">Self-Publishing Tools</h2>
          <p className="text-sm text-[#8b7b6b] text-center mb-8">Use these free online publishing tools alongside the resources above.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { href: "/bible-studio", icon: <BookMarked size={18} />, label: "Bible Design Studio", desc: "Configure trim, paper & binding" },
              { href: "/spine-calculator", icon: <Ruler size={18} />, label: "Spine Calculator", desc: "Calculate exact spine width" },
              { href: "/cover-designer", icon: <Layers size={18} />, label: "Cover Designer", desc: "Full-wrap cover dimensions" },
              { href: "/isbn-manager", icon: <Barcode size={18} />, label: "ISBN & Metadata", desc: "Manage ISBN & ONIX 3.0 XML" },
              { href: "/timeline", icon: <Calendar size={18} />, label: "Production Timeline", desc: "Gantt-style deadline tracker" },
              { href: "/auto-produce", icon: <Zap size={18} />, label: "Auto-Produce", desc: "AI-powered layout engine" },
            ].map(({ href, icon, label, desc }) => (
              <Link key={href} href={href}
                className="group flex items-start gap-3 bg-white rounded-xl border border-[#e8dfd0] p-4 hover:border-[#c9a96e]/60 hover:shadow-md transition-all duration-200">
                <span className="mt-0.5 text-[#c9a96e] shrink-0">{icon}</span>
                <span>
                  <span className="block font-semibold text-sm text-[#3a2a1a] group-hover:text-[#5c3d2e] transition-colors">{label}</span>
                  <span className="block text-xs text-[#8b7b6b] mt-0.5">{desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center py-8 border-t border-[#e8dfd0]">
          <p className="font-serif text-lg text-[#c9a96e]/60 italic">
            "The right tool at the right stage makes all the difference."
          </p>
          <p className="text-xs text-[#a89880] mt-2">
            Resources are curated based on industry adoption, community trust, and practical value. Inclusion does not constitute endorsement.
          </p>
        </div>

        <RelatedTools currentPage="resources" />
      </div>
      <SiteFooter />
    </div>
  );
}
