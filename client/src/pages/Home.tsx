/**
 * Home Page — The Bookmaker's Journey
 * Authenticated: Publisher Command Center dashboard
 * Unauthenticated: Artisan storybook landing page
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Plus, Trash2, ArrowRight, Loader2,
  Upload, CheckCircle2, SkipForward, Clock, Sparkles, Copy,
  Layers, BookMarked, Ruler, Zap, BarChart3, Library,
  ChevronRight, Calendar, Star, TrendingUp, FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { phases } from "@/data/flowchartData";
import WhatsNext from "@/components/WhatsNext";
import { getNextPrompts } from "@shared/prompts";

const HERO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/hero-banner-cxQRR1jXLBmcXxFPJoqxWN.webp";

const totalSteps = phases.reduce((acc, p) => acc + p.steps.length, 0);
const totalInputs = phases.reduce((acc, p) => acc + p.steps.reduce((a, s) => a + s.inputs.length, 0), 0);

const GENRES = [
  "Literary Fiction", "Commercial Fiction", "Mystery / Thriller", "Science Fiction",
  "Fantasy", "Romance", "Historical Fiction", "Horror", "Young Adult", "Middle Grade",
  "Children's", "Narrative Nonfiction", "Memoir / Autobiography", "Self-Help / Personal Development",
  "Business / Finance", "Academic / Textbook", "Poetry", "Graphic Novel",
  "Short Story Collection", "Bible / Scripture", "Other",
];

const features = [
  { icon: Upload, title: "Upload Real Documents", desc: "Attach manuscripts, contracts, cover art, and proofs at every step." },
  { icon: CheckCircle2, title: "Track Progress", desc: "Mark steps complete or skip optional ones. See per-phase and overall progress." },
  { icon: SkipForward, title: "Skip What You Don't Need", desc: "Not every book needs indexing or audio. Skip steps that don't apply." },
  { icon: Clock, title: "Set Due Dates", desc: "Add target dates per phase and get alerts when deadlines approach." },
];

const PAGE_TITLE = "Book Production Tracker — The Bookmaker's Journey";
const PAGE_DESCRIPTION = "Track every step of your book's production — from manuscript to published title — with file uploads, due dates, AI typesetting, and a Gantt timeline.";
const PAGE_KEYWORDS = "book production tracker, publishing workflow, manuscript to print, Bible design studio, AI typesetting, book project management";

function setMetaTag(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const SITE_URL = "https://booksrus.manus.space";

const jsonLdSoftwareApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "The Bookmaker's Journey",
  "url": SITE_URL,
  "description": PAGE_DESCRIPTION,
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "featureList": [
    "30-step book production workflow",
    "File uploads per step",
    "Gantt timeline with per-step due dates",
    "AI-powered typesetting and PDF/EPUB generation",
    "Cover Designer with full-wrap spec generation",
    "ISBN & ONIX 3.0 metadata manager",
    "Resources & Success Hub with 43 curated publishing tools",
  ],
  "screenshot": HERO_URL,
  "creator": { "@type": "Organization", "name": "Create Design Publish LLC", "url": SITE_URL },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "The Bookmaker's Journey",
  "url": SITE_URL,
  "description": PAGE_DESCRIPTION,
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_URL}/resources?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Create Design Publish LLC",
  "url": SITE_URL,
  "logo": `${SITE_URL}/favicon.ico`,
  "sameAs": [SITE_URL],
  "description": "Create Design Publish LLC builds tools for independent authors and small publishers to manage every step of the book production process.",
};

function injectJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

// ─── Tool Hub definition ──────────────────────────────────────────────────────
const TOOLS = [
  {
    id: "bible-studio",
    path: "/bible-studio",
    icon: BookOpen,
    label: "Bible Design Studio",
    desc: "Configure any Bible edition — trim, paper, binding, typesetting style, and special features.",
    badge: "Bible",
    badgeColor: "bg-amber-100 text-amber-800",
    dark: true,
  },
  {
    id: "auto-produce",
    path: null, // opens new project dialog
    icon: Zap,
    label: "Auto-Produce",
    desc: "Generate typeset PDF and EPUB previews instantly with AI-powered layout engine.",
    badge: "AI",
    badgeColor: "bg-purple-100 text-purple-800",
    dark: false,
  },
  {
    id: "spine-calculator",
    path: "/spine-calculator",
    icon: Ruler,
    label: "Spine Calculator",
    desc: "Calculate exact spine width from page count, paper type, and binding method.",
    badge: "Print",
    badgeColor: "bg-blue-100 text-blue-800",
    dark: false,
  },
  {
    id: "cover-designer",
    path: "/cover-designer",
    icon: Layers,
    label: "Cover Designer",
    desc: "Full-wrap cover dimensions, bleed, safe zones, and print-ready spec sheet export.",
    badge: "Design",
    badgeColor: "bg-rose-100 text-rose-800",
    dark: false,
  },
  {
    id: "isbn-manager",
    path: "/isbn-manager",
    icon: BookMarked,
    label: "ISBN & Metadata",
    desc: "Manage ISBN, LCCN, BISAC codes, and export ONIX 3.0 XML for distributors.",
    badge: "Metadata",
    badgeColor: "bg-green-100 text-green-800",
    dark: false,
  },
  {
    id: "timeline",
    path: null, // needs project id
    icon: Calendar,
    label: "Production Timeline",
    desc: "Gantt-style timeline with per-step due dates and deadline tracking.",
    badge: "Planning",
    badgeColor: "bg-sky-100 text-sky-800",
    dark: false,
  },
  {
    id: "resources",
    path: "/resources",
    icon: Library,
    label: "Resources Hub",
    desc: "43 curated tools across every production phase — Scrivener, IngramSpark, NetGalley, and more.",
    badge: "Reference",
    badgeColor: "bg-orange-100 text-orange-800",
    dark: false,
  },
  {
    id: "new-project",
    path: null, // opens new project dialog
    icon: Plus,
    label: "New Book Project",
    desc: "Start a new project and track all 30 production steps from manuscript to shelf.",
    badge: "Start",
    badgeColor: "bg-emerald-100 text-emerald-800",
    dark: false,
    cta: true,
  },
];

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLE;
    setMetaTag("description", PAGE_DESCRIPTION);
    setMetaTag("keywords", PAGE_KEYWORDS);
    injectJsonLd("jsonld-software-app", jsonLdSoftwareApp);
    injectJsonLd("jsonld-website", jsonLdWebSite);
    injectJsonLd("jsonld-organization", jsonLdOrganization);
    return () => {
      ["jsonld-software-app", "jsonld-website", "jsonld-organization"].forEach(id => {
        document.getElementById(id)?.remove();
      });
    };
  }, []);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [bibleEditionType, setBibleEditionType] = useState("");
  const [bibleTranslation, setBibleTranslation] = useState("");
  const [notes, setNotes] = useState("");

  const isBible = genre === "Bible / Scripture";

  const projectsQuery = trpc.project.list.useQuery(undefined, { enabled: isAuthenticated });
  const createMutation = trpc.project.create.useMutation({
    onSuccess: (project) => {
      setOpen(false);
      setTitle(""); setAuthor(""); setGenre(""); setBibleEditionType(""); setBibleTranslation(""); setNotes("");
      navigate(`/project/${project.id}`);
    },
  });
  const utils = trpc.useUtils();
  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => { utils.project.list.invalidate(); },
  });
  const duplicateMutation = trpc.project.duplicate.useMutation({
    onSuccess: (newProject) => {
      utils.project.list.invalidate();
      navigate(`/project/${newProject.id}`);
    },
  });

  // ─── Unauthenticated landing ─────────────────────────────────────────────────
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf6ef]">
        {/* Hero */}
        <div className="relative h-[75vh] min-h-[550px] flex items-center justify-center overflow-hidden">
          <img src={HERO_URL} alt="Bookmaker's workshop" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1008]/70 via-[#1a1008]/40 to-[#1a1008]/80" />
          <div className="relative z-10 text-center px-6 max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-16 bg-[#c9a96e]/60" />
                <BookOpen size={28} className="text-[#c9a96e]" />
                <div className="h-px w-16 bg-[#c9a96e]/60" />
              </div>
              <h1 className="font-serif text-5xl md:text-7xl text-[#f5efe0] leading-tight tracking-tight">
                The Bookmaker's<br />Journey
              </h1>
              <p className="mt-6 font-sans text-lg md:text-xl text-[#d4c8b4] max-w-xl mx-auto leading-relaxed">
                A creator, designer, and publisher's dream platform. Track every step of your book's production — from first idea to finished volume.
              </p>
              <div className="mt-8 flex items-center justify-center gap-8 text-[#c9a96e]/80 font-serif text-lg">
                <span><strong className="text-3xl text-[#f5efe0]">{phases.length}</strong> Phases</span>
                <span className="text-[#c9a96e]/30">|</span>
                <span><strong className="text-3xl text-[#f5efe0]">{totalSteps}</strong> Steps</span>
                <span className="text-[#c9a96e]/30">|</span>
                <span><strong className="text-3xl text-[#f5efe0]">8</strong> Pro Tools</span>
              </div>
              <div className="mt-10">
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold text-base px-10 py-6 rounded-lg shadow-lg shadow-[#c9a96e]/20">
                    Start Your Project
                    <ArrowRight className="ml-2" size={18} />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl text-[#3a2a1a]">A Real Project Tracker</h2>
            <p className="mt-3 text-[#8b7b6b] max-w-lg mx-auto">Not just a flowchart — a working tool where you attach your actual manuscripts, contracts, and proofs at every stage.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <div className="bg-white rounded-xl p-6 border border-[#e8dfd0] hover:shadow-md transition-shadow h-full">
                  <div className="w-10 h-10 rounded-lg bg-[#f0e8d8] flex items-center justify-center mb-4">
                    <f.icon size={20} className="text-[#c9a96e]" />
                  </div>
                  <h3 className="font-serif text-lg text-[#3a2a1a] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#8b7b6b] leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tool showcase */}
        <div className="bg-[#2a1a0a] py-20">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
              <h2 className="font-serif text-3xl md:text-4xl text-[#f5efe0]">8 Professional Publishing Tools</h2>
              <p className="mt-3 text-[#c9a96e]/60 max-w-lg mx-auto">Everything a creator, designer, and publisher needs — all in one place.</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, label: "Bible Design Studio", desc: "Edition & typesetting configurator" },
                { icon: Zap, label: "Auto-Produce", desc: "AI-powered PDF & EPUB generation" },
                { icon: Ruler, label: "Spine Calculator", desc: "Exact spine width from page count" },
                { icon: Layers, label: "Cover Designer", desc: "Full-wrap cover spec generator" },
                { icon: BookMarked, label: "ISBN & Metadata", desc: "ONIX 3.0 export for distributors" },
                { icon: Calendar, label: "Production Timeline", desc: "Gantt chart with due dates" },
                { icon: Library, label: "Resources Hub", desc: "43 curated publishing tools" },
                { icon: BarChart3, label: "Progress Tracking", desc: "30-step production workflow" },
              ].map((tool, i) => (
                <motion.div key={tool.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4 }}>
                  <div className="bg-[#3a2a1a] rounded-xl p-4 border border-[#c9a96e]/10 hover:border-[#c9a96e]/30 transition-colors h-full">
                    <tool.icon size={20} className="text-[#c9a96e] mb-2" />
                    <h3 className="font-serif text-sm text-[#f5efe0] leading-tight">{tool.label}</h3>
                    <p className="text-xs text-[#c9a96e]/40 mt-1 leading-relaxed">{tool.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Phase overview */}
        <div className="max-w-5xl mx-auto px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl text-[#3a2a1a]">Every Phase of Book Production</h2>
            <p className="mt-3 text-[#8b7b6b] max-w-lg mx-auto">From the spark of an idea to a finished book in readers' hands — we've mapped every step.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {phases.map((phase, i) => (
              <motion.div key={phase.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.5 }}>
                <div className="bg-white rounded-xl p-5 border border-[#e8dfd0] hover:shadow-md transition-shadow h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: phase.accentColor }}>
                      {phase.number}
                    </span>
                    <h3 className="font-serif text-base text-[#3a2a1a]">{phase.title}</h3>
                  </div>
                  <p className="text-sm text-[#8b7b6b]">{phase.subtitle}</p>
                  <p className="text-xs text-[#a89880] mt-3">{phase.steps.length} steps · {phase.steps.reduce((a, s) => a + s.inputs.length, 0)} inputs</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Resources teaser */}
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-white rounded-2xl border border-[#e8dfd0] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-[#c9a96e]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#a89880]">Resources & Success Hub</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-[#3a2a1a] mb-3">The Best Tools for Every Stage</h2>
              <p className="text-[#8b7b6b] leading-relaxed mb-4">We've curated the most efficient and widely trusted platforms across every phase — from Scrivener for writing to IngramSpark for distribution.</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {["Scrivener", "Reedsy", "QueryTracker", "KDP", "IngramSpark", "BookBub", "NetGalley", "Goodreads"].map(t => (
                  <span key={t} className="px-2 py-1 rounded-full bg-[#f0e8d8] text-[#8b7b6b]">{t}</span>
                ))}
                <span className="px-2 py-1 rounded-full bg-[#f0e8d8] text-[#c9a96e]">+35 more</span>
              </div>
            </div>
            <div className="shrink-0">
              <a href="/resources">
                <Button size="lg" variant="outline" className="border-[#c9a96e] text-[#5c3d2e] hover:bg-[#f0e8d8] font-semibold px-8">
                  Browse Resources <ArrowRight className="ml-2" size={16} />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <div className="py-20 text-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Sparkles size={32} className="mx-auto text-[#c9a96e] mb-4" />
            <h2 className="font-serif text-3xl text-[#3a2a1a] mb-3">Ready to Begin?</h2>
            <p className="text-[#8b7b6b] max-w-md mx-auto mb-8">Create your first project and start tracking your book from manuscript to shelf.</p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold text-base px-10 py-6 rounded-lg">
                Get Started Free <ArrowRight className="ml-2" size={18} />
              </Button>
            </a>
          </motion.div>
        </div>

        <footer className="py-12 bg-[#2a1a0a] text-center border-t border-[#c9a96e]/10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#c9a96e]/20" />
            <BookOpen size={16} className="text-[#c9a96e]/40" />
            <div className="h-px w-12 bg-[#c9a96e]/20" />
          </div>
          <p className="font-serif text-lg text-[#c9a96e]/50 italic">"A book is a dream that you hold in your hand."</p>
          <p className="text-xs text-[#c9a96e]/25 mt-2">— Neil Gaiman</p>
        </footer>
      </div>
    );
  }

  // Loading
  if (authLoading || projectsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#c9a96e]" size={32} />
      </div>
    );
  }

  const projectList = projectsQuery.data ?? [];

  // ─── Compute "What's Next?" prompts ──────────────────────────────────────────
  // Use the first project for context; if no projects, show the create-project prompt
  const firstProject = projectList[0];
  const promptContextQuery = trpc.prompts.getContext.useQuery(
    { projectId: firstProject?.id ?? 0 },
    { enabled: isAuthenticated && !!firstProject }
  );

  const whatsNextPrompts = getNextPrompts(
    (promptContextQuery.data
      ? { ...promptContextQuery.data, overallPhase: promptContextQuery.data.overallPhase as "setup" | "design" | "production" | "distribution" | "complete" }
      : {
          hasProjects: projectList.length > 0,
          hasBibleSpecs: false,
          hasSpineCalc: false,
          hasCoverSpec: false,
          hasIsbn: false,
          hasManuscript: false,
          hasCompletedJob: false,
          hasFailedJob: false,
          completedStepCount: 0,
          totalStepCount: 0,
          hasTimeline: false,
          overallPhase: "setup" as const,
        }
    )
  );

  // ─── Authenticated Publisher Command Center ──────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Command Center Header */}
      <header className="bg-[#1e1108] text-[#f5efe0] border-b border-[#c9a96e]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#c9a96e]/20 flex items-center justify-center">
                <BookOpen size={18} className="text-[#c9a96e]" />
              </div>
              <div>
                <h1 className="font-serif text-lg leading-tight text-[#f5efe0]">The Bookmaker's Journey</h1>
                <p className="text-[10px] text-[#c9a96e]/50 uppercase tracking-widest">Publisher Command Center</p>
              </div>
            </div>
          </div>

          {/* Quick nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Bible Studio", path: "/bible-studio", icon: BookOpen },
              { label: "Spine Calc", path: "/spine-calculator", icon: Ruler },
              { label: "Cover Designer", path: "/cover-designer", icon: Layers },
              { label: "ISBN", path: "/isbn-manager", icon: BookMarked },
              { label: "Resources", path: "/resources", icon: Library },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-1.5 text-xs text-[#c9a96e]/60 hover:text-[#c9a96e] hover:bg-[#c9a96e]/10 px-3 py-1.5 rounded-md transition-all"
              >
                <item.icon size={13} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-[#f5efe0] font-medium">{user?.name || user?.email}</p>
              <p className="text-[10px] text-[#c9a96e]/40">Publisher</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#c9a96e]/20 flex items-center justify-center">
              <span className="text-sm font-bold text-[#c9a96e]">
                {(user?.name || user?.email || "?")[0].toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-[#2a1a0a] border-b border-[#c9a96e]/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8 overflow-x-auto">
          {[
            { label: "Active Projects", value: projectList.length, icon: FileText, color: "text-[#c9a96e]" },
            { label: "Production Phases", value: phases.length, icon: BarChart3, color: "text-blue-400" },
            { label: "Steps per Project", value: totalSteps, icon: CheckCircle2, color: "text-green-400" },
            { label: "Tracked Inputs", value: totalInputs, icon: TrendingUp, color: "text-purple-400" },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2.5 shrink-0">
              <stat.icon size={16} className={stat.color} />
              <div>
                <p className="text-lg font-bold text-white leading-none">{stat.value}</p>
                <p className="text-[10px] text-[#c9a96e]/40 uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Tools Hub */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-xl text-[#2c1a00]">Publisher Tools Hub</h2>
              <p className="text-xs text-[#8b7b6b] mt-0.5">Professional tools for every stage of book production</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
            {TOOLS.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  className={`rounded-xl p-4 border cursor-pointer group transition-all h-full ${
                    tool.dark
                      ? "bg-[#2c1a00] border-[#4a3828] hover:border-[#c9a96e]/50"
                      : tool.cta
                      ? "bg-[#c9a96e] border-[#c9a96e] hover:bg-[#b8944f] hover:border-[#b8944f]"
                      : "bg-white border-[#e8dfd0] hover:shadow-md hover:border-[#c9a96e]/40"
                  }`}
                  onClick={() => {
                    if (tool.path) navigate(tool.path);
                    else if (tool.id === "new-project" || tool.id === "auto-produce") setOpen(true);
                    else if (tool.id === "timeline" && projectList.length > 0) navigate(`/timeline/${projectList[0].id}`);
                    else if (tool.id === "timeline") setOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      tool.dark ? "bg-[#c9a96e]/20" : tool.cta ? "bg-[#2a1a0a]/10" : "bg-[#f0e8d8]"
                    }`}>
                      <tool.icon size={18} className={tool.dark ? "text-[#c9a96e]" : tool.cta ? "text-[#2a1a0a]" : "text-[#8b5e3c]"} />
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                      tool.cta ? "bg-[#2a1a0a]/10 text-[#2a1a0a]" : tool.badgeColor
                    }`}>
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className={`font-serif text-sm font-semibold leading-tight mb-1 ${
                    tool.dark ? "text-[#f5efe0] group-hover:text-[#c9a96e]" : tool.cta ? "text-[#2a1a0a]" : "text-[#3a2a1a] group-hover:text-[#5c3d2e]"
                  } transition-colors`}>
                    {tool.label}
                  </h3>
                  <p className={`text-[11px] leading-relaxed ${
                    tool.dark ? "text-[#a08060]" : tool.cta ? "text-[#2a1a0a]/70" : "text-[#8b7b6b]"
                  }`}>
                    {tool.desc}
                  </p>
                  <div className={`flex items-center gap-1 mt-2 text-[10px] font-medium ${
                    tool.dark ? "text-[#c9a96e]" : tool.cta ? "text-[#2a1a0a]" : "text-[#c9a96e]"
                  }`}>
                    Open <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* What's Next panel */}
        {whatsNextPrompts.length > 0 && (
          <section className="mb-10">
            <WhatsNext
              prompts={whatsNextPrompts}
              title={firstProject ? `What's Next for "${firstProject.title}"?` : "What's Next?"}
            />
          </section>
        )}

        {/* Projects section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-xl text-[#2c1a00]">Your Book Projects</h2>
              <p className="text-xs text-[#8b7b6b] mt-0.5">
                {projectList.length} project{projectList.length !== 1 ? "s" : ""} · {phases.length} phases · {totalSteps} steps each
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold gap-1.5">
                  <Plus size={16} /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#faf6ef] border-[#e8dfd0]">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-[#3a2a1a]">Start a New Book Project</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createMutation.mutate({ title, author, genre, bibleEditionType: bibleEditionType || undefined, bibleTranslation: bibleTranslation || undefined, notes });
                  }}
                  className="space-y-4 mt-4"
                >
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold">Book Title *</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., The Great American Novel" className="mt-1 border-[#d4c8b4]" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#5c3d2e] font-semibold">Author</Label>
                      <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" className="mt-1 border-[#d4c8b4]" />
                    </div>
                    <div>
                      <Label className="text-[#5c3d2e] font-semibold">Genre</Label>
                      <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                          <SelectValue placeholder="Select genre…" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRES.map(g => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {isBible && (
                    <div className="rounded-lg border border-[#c9a96e]/40 bg-[#fdf5e4] p-4 space-y-4">
                      <p className="text-xs font-semibold text-[#8b5e3c] uppercase tracking-wider">Bible Edition Details</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#5c3d2e] font-semibold">Edition Type</Label>
                          <Select value={bibleEditionType} onValueChange={setBibleEditionType}>
                            <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                              <SelectValue placeholder="Select edition…" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Standard Text Bible","Red-Letter Edition","Study Bible","Journaling Bible","Devotional Bible","Large Print Bible","Compact / Pew Bible","Children's Bible","Youth Bible","Reference Bible","Parallel Bible","Interlinear Bible","Illustrated Bible","Audio Bible (Print Companion)","Braille Bible","Pulpit / Lectern Bible","Wedding Bible","Military Bible","Outreach / Evangelism Bible","Chronological Bible","Topical Bible","Custom / Specialty Edition"].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[#5c3d2e] font-semibold">Translation</Label>
                          <Select value={bibleTranslation} onValueChange={setBibleTranslation}>
                            <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                              <SelectValue placeholder="Select translation…" />
                            </SelectTrigger>
                            <SelectContent>
                              {["KJV","NKJV","NIV","ESV","NASB","NLT","CSB","RSV","NRSV","ASV","MSG","AMP","HCSB","NET","WEB","YLT","DRB","GNT","CEV","ISV","VOICE","TLB","NCV","ERV","CJB","Custom / Original Translation"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold">Notes</Label>
                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about this project..." className="mt-1 border-[#d4c8b4]" rows={3} />
                  </div>
                  <Button type="submit" disabled={!title || createMutation.isPending} className="w-full bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold">
                    {createMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                    Create Project
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {projectList.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white rounded-2xl border border-[#e8dfd0]">
              <div className="w-20 h-20 rounded-full bg-[#f0e8d8] flex items-center justify-center mx-auto mb-6">
                <BookOpen size={32} className="text-[#c9a96e]" />
              </div>
              <p className="font-serif text-2xl text-[#5c3d2e]">No projects yet</p>
              <p className="text-sm text-[#8b7b6b] mt-2 max-w-sm mx-auto">Create your first book project to start tracking production across all {totalSteps} steps.</p>
              <Button className="mt-6 bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold" onClick={() => setOpen(true)}>
                <Plus size={18} className="mr-2" /> Create Your First Project
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projectList.map((project, i) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card
                    className="bg-white border-[#e8dfd0] hover:shadow-lg hover:border-[#c9a96e]/40 transition-all cursor-pointer group"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <CardContent className="p-5">
                      {/* Title row */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg text-[#3a2a1a] truncate group-hover:text-[#5c3d2e] transition-colors leading-tight">{project.title}</h3>
                          {project.author && <p className="text-xs text-[#8b7b6b] mt-0.5">by {project.author}</p>}
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <Button
                            variant="ghost" size="icon"
                            className="w-7 h-7 text-[#a89880] hover:text-[#c9a96e]"
                            title="Duplicate project"
                            onClick={(e) => { e.stopPropagation(); duplicateMutation.mutate({ projectId: project.id }); }}
                          >
                            <Copy size={14} />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="w-7 h-7 text-[#a89880] hover:text-red-600"
                            title="Delete project"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this project and all its files?")) {
                                deleteMutation.mutate({ projectId: project.id });
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {project.genre && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0e8d8] text-[#8b7b6b]">
                            {project.genre}
                          </span>
                        )}
                        {project.bibleEditionType && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            {project.bibleEditionType}
                          </span>
                        )}
                        {project.bibleTranslation && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            {project.bibleTranslation}
                          </span>
                        )}
                      </div>

                      {/* Progress placeholder */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[10px] text-[#a89880] mb-1">
                          <span>Production Progress</span>
                          <span>—</span>
                        </div>
                        <Progress value={0} className="h-1.5 bg-[#f0e8d8]" />
                      </div>

                      {/* Footer */}
                      <div className="mt-3 pt-3 border-t border-[#f0e8d8] flex items-center justify-between">
                        <span className="text-[10px] text-[#a89880]">
                          Created {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-[10px] text-[#a89880] hover:text-[#5c3d2e] transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate(`/timeline/${project.id}`); }}
                          >
                            Timeline
                          </button>
                          <span className="flex items-center gap-0.5 text-[10px] text-[#c9a96e] font-medium group-hover:translate-x-0.5 transition-transform">
                            Open <ArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
