/**
 * Home Page — Easy Book Publishers
 * Authenticated: Publisher Command Center dashboard
 * Unauthenticated: Artisan storybook landing page
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { usePlan, type PlanFeature } from "@/hooks/usePlan";
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
  BookOpen, Plus, Trash2, ArrowRight, Loader2, Lock,
  Upload, CheckCircle2, SkipForward, Clock, Sparkles, Copy,
  Layers, BookMarked, Ruler, Zap, BarChart3, Library,
  ChevronRight, ChevronDown, Calendar, Star, TrendingUp, FileText, HelpCircle, LogOut, User, Menu, X, LayoutGrid, Search, Send,
  Compass, PenTool, Palette, Printer, Quote, Package, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { phases } from "@/data/flowchartData";
import WhatsNext from "@/components/WhatsNext";
import { getNextPrompts } from "@shared/prompts";
import type { WizardAnswers } from "@/components/PublishingWizard";
import SiteFooter from "@/components/SiteFooter";

function getWizardFormatLabel(format: string) {
  switch (format) {
    case "print": return "Print Book";
    case "ebook": return "eBook Only";
    case "both": return "Print + eBook";
    default: return format;
  }
}

function getWizardTimelineLabel(timeline: string) {
  switch (timeline) {
    case "asap": return "ASAP";
    case "1-3-months": return "1–3 Months";
    case "3-6-months": return "3–6 Months";
    case "6-plus-months": return "6+ Months";
    default: return timeline;
  }
}

function getWizardExperienceLabel(exp: string) {
  switch (exp) {
    case "first-time": return "First-time Publisher";
    case "some-experience": return "Some Experience";
    case "experienced": return "Experienced Publisher";
    default: return exp;
  }
}



const totalSteps = phases.reduce((acc, p) => acc + p.steps.length, 0);
const totalInputs = phases.reduce((acc, p) => acc + p.steps.reduce((a, s) => a + s.inputs.length, 0), 0);

const GENRES = [
  "Literary Fiction", "Commercial Fiction", "Mystery / Thriller", "Science Fiction",
  "Fantasy", "Romance", "Historical Fiction", "Horror", "Young Adult", "Middle Grade",
  "Children's", "Narrative Nonfiction", "Memoir / Autobiography", "Self-Help / Personal Development",
  "Business / Finance", "Academic / Textbook", "Poetry", "Graphic Novel",
  "Short Story Collection", "Bible / Scripture",
  "Christian Living", "Devotional", "Children's Christian", "Prayer", "Pastoral",
  "Biography", "Academic / Theological", "Music / Audio",
  "Other",
];

const features = [
  { icon: Upload, title: "Create & Upload Your Manuscript", desc: "Start your self-publishing journey by attaching manuscripts, contracts, cover art, and proofs at every production step." },
  { icon: CheckCircle2, title: "Design Your Book Online", desc: "Use our online publishing tools to design layouts, configure typesetting, and track every phase of your book's design." },
  { icon: SkipForward, title: "Flexible Publishing Workflow", desc: "Not every self-publishing project needs the same steps. Skip what doesn't apply and focus on what matters for your book." },
  { icon: Clock, title: "Publishing Deadlines & Milestones", desc: "Set target dates per phase and stay on schedule from manuscript creation through final publishing and distribution." },
];

const PAGE_TITLE = "Publisher Dashboard — Easy Book Publishers";
const PAGE_DESCRIPTION = "Your publishing command center. Access all tools, manage book projects, and track your 30-step production workflow.";
const PAGE_KEYWORDS = "self-publishing, online publishing, book design, publishing platform, Bible publishing, easy book publishers";

function setMetaTag(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
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
    gatedFeature: null as string | null,
  },
  {
    id: "auto-produce",
    path: null,
    icon: Zap,
    label: "Auto-Produce",
    desc: "Generate typeset PDF and EPUB previews instantly with AI-powered layout engine.",
    badge: "AI",
    badgeColor: "bg-purple-100 text-purple-800",
    dark: false,
    gatedFeature: "ai_typesetting" as string | null,
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
    gatedFeature: null,
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
    gatedFeature: null,
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
    gatedFeature: null,
  },
  {
    id: "timeline",
    path: null,
    icon: Calendar,
    label: "Production Timeline",
    desc: "Gantt-style timeline with per-step due dates and deadline tracking.",
    badge: "Planning",
    badgeColor: "bg-sky-100 text-sky-800",
    dark: false,
    gatedFeature: "timeline",
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
    gatedFeature: null,
  },
  {
    id: "templates",
    path: "/templates",
    icon: LayoutGrid,
    label: "Book Templates",
    desc: "One-click presets for every book type — Bibles, devotionals, children's books, theological works, and KP&A design templates.",
    badge: "Templates",
    badgeColor: "bg-amber-100 text-amber-800",
    dark: false,
    gatedFeature: "templates",
  },
  {
    id: "isbn-lookup",
    path: "/isbn-lookup",
    icon: Search,
    label: "ISBN Book Lookup",
    desc: "Enter any ISBN to retrieve a book's production specs and get an instant template recommendation for recreating it.",
    badge: "Lookup",
    badgeColor: "bg-indigo-100 text-indigo-800",
    dark: false,
    gatedFeature: null,
  },
  {
    id: "new-project",
    path: null,
    icon: Plus,
    label: "New Book Project",
    desc: "Start a new project and track all 30 production steps from manuscript to shelf.",
    badge: "Start",
    badgeColor: "bg-emerald-100 text-emerald-800",
    dark: false,
    cta: true,
    gatedFeature: null,
  },
];

export default function Home() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { isStarter, projectLimit, canAccess } = usePlan();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLE;
    setMetaTag("description", PAGE_DESCRIPTION);
    setMetaTag("keywords", PAGE_KEYWORDS);
    setMetaTag("robots", "index, follow");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const plan = params.get("plan");
    if (checkout === "success") {
      toast.success(`Welcome to ${plan ? plan.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()) : "your new plan"}! Your premium features are now unlocked.`);
      window.history.replaceState({}, "", "/dashboard");
    } else if (checkout === "cancelled") {
      toast("Checkout was cancelled. You can upgrade anytime from the Pricing page.");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [bibleEditionType, setBibleEditionType] = useState("");
  const [bibleTranslation, setBibleTranslation] = useState("");
  const [notes, setNotes] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const contactMutation = trpc.contact.send.useMutation({
    onSuccess: () => {
      setContactSent(true);
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    },
  });

  const isBible = genre === "Bible / Scripture";

  const projectsQuery = trpc.project.list.useQuery(undefined, { enabled: isAuthenticated });
  const createMutation = trpc.project.create.useMutation({
    onSuccess: (project) => {
      setOpen(false);
      setTitle(""); setAuthor(""); setGenre(""); setBibleEditionType(""); setBibleTranslation(""); setNotes("");
      navigate(`/project/${project.id}`);
    },
    onError: (err) => {
      if (err.data?.code === "FORBIDDEN") {
        setOpen(false);
        navigate("/pricing");
      }
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

  const activityQuery = trpc.activity.recent.useQuery(undefined, { enabled: isAuthenticated });
  const statsQuery = trpc.dashboard.stats.useQuery(undefined, { enabled: isAuthenticated });
  const wizardAnswersQuery = trpc.wizard.getAnswers.useQuery(undefined, { enabled: isAuthenticated });
  const hasWizardSession = !!wizardAnswersQuery.data?.answers && !!(wizardAnswersQuery.data.answers as Record<string, unknown>).bookType;

  // ─── Guided prompts context (must be before any early returns to satisfy React hooks rules) ───
  const projectList0 = projectsQuery.data ?? [];
  const firstProjectForPrompts = projectList0[0];
  const promptContextQuery = trpc.prompts.getContext.useQuery(
    { projectId: firstProjectForPrompts?.id ?? 0 },
    { enabled: isAuthenticated && !!firstProjectForPrompts }
  );


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
  const firstProject = firstProjectForPrompts;

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
    <div className="min-h-screen bg-gradient-to-b from-[#faf6ef] to-[#f0e8d8]">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-[#1a1008] border-l border-[#c9a96e]/15 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c9a96e]/10">
          <div className="flex items-center gap-2.5">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG"
              alt="Easy Book Publishers"
              className="h-10 w-auto object-contain"
            />
            <span className="font-serif text-[#f5d98a] text-sm tracking-wide">Menu</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#c9a96e]/60 hover:text-[#c9a96e] hover:bg-[#c9a96e]/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-[#c9a96e]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a96e]/30 to-[#c9a96e]/10 flex items-center justify-center shrink-0 border border-[#c9a96e]/20">
              <span className="text-sm font-bold text-[#f5d98a]">
                {(user?.name || user?.email || "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#f5efe0] font-semibold truncate">{user?.name || "Account"}</p>
              <p className="text-xs text-[#c9a96e]/40 truncate">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 flex flex-col gap-1">
          {[
            { label: "Templates", path: "/templates", icon: LayoutGrid, badge: "All" },
            { label: "Bible Design Studio", path: "/bible-studio", icon: BookOpen, badge: "Bible" },
            { label: "Spine Calculator", path: "/spine-calculator", icon: Ruler, badge: "Print" },
            { label: "Cover Designer", path: "/cover-designer", icon: Layers, badge: "Design" },
            { label: "ISBN & Metadata", path: "/isbn-manager", icon: BookMarked, badge: "Meta" },
            { label: "Resources Hub", path: "/resources", icon: Library, badge: "Ref" },
            { label: "User Guide", path: "/guide", icon: HelpCircle, badge: null },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg text-[#c9a96e]/70 hover:text-[#f5efe0] hover:bg-[#c9a96e]/10 transition-all group"
            >
              <item.icon size={16} className="shrink-0 text-[#c9a96e]/50 group-hover:text-[#c9a96e]" />
              <span className="text-sm font-serif flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#c9a96e]/10 text-[#c9a96e]/60 font-medium">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-[#c9a96e]/10">
          <button
            onClick={() => { logout(); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-900/15 transition-all"
          >
            <LogOut size={16} className="shrink-0" />
            <span className="text-sm font-serif">Sign Out</span>
          </button>
        </div>
      </div>

      <header className="bg-gradient-to-r from-[#1a1008] via-[#1e1108] to-[#1a1008] text-[#f5efe0] border-b border-[#c9a96e]/15 shadow-lg shadow-[#1a1008]/20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG"
                alt="Easy Book Publishers"
                className="h-11 w-auto object-contain"
              />
              <div>
                <h1 className="font-serif text-xl leading-tight text-[#f5d98a] tracking-wide" style={{ textShadow: "0 0 30px rgba(245,217,138,0.3)" }}>Publisher Command Center</h1>
                <p className="text-[10px] text-[#c9a96e]/50 uppercase tracking-[0.2em] hidden sm:block font-serif">Easy Book Publishers</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-0.5">
            {[
              { label: "Templates", path: "/templates", icon: LayoutGrid },
              { label: "Bible Studio", path: "/bible-studio", icon: BookOpen },
              { label: "Spine Calc", path: "/spine-calculator", icon: Ruler },
              { label: "Cover Designer", path: "/cover-designer", icon: Layers },
              { label: "ISBN", path: "/isbn-manager", icon: BookMarked },
              { label: "Resources", path: "/resources", icon: Library },
              { label: "Guide", path: "/guide", icon: HelpCircle },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-1.5 text-xs font-serif text-[#c9a96e]/60 hover:text-[#f5d98a] hover:bg-[#c9a96e]/10 px-3 py-2 rounded-lg transition-all"
              >
                <item.icon size={13} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a96e]/25 to-[#c9a96e]/10 hover:from-[#c9a96e]/35 hover:to-[#c9a96e]/20 flex items-center justify-center transition-all outline-none border border-[#c9a96e]/20" aria-label="Account menu">
                  <span className="text-sm font-bold text-[#f5d98a]">
                    {(user?.name || user?.email || "?")[0].toUpperCase()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#2a1a0a] border-[#c9a96e]/20 text-[#f5efe0] shadow-xl">
                <DropdownMenuLabel className="text-[#c9a96e]/70 text-xs font-serif">
                  <div className="flex items-center gap-2">
                    <User size={13} />
                    <span className="truncate">{user?.name || user?.email || "Account"}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#c9a96e]/15" />
                <DropdownMenuItem
                  className="text-xs font-serif text-[#f5efe0] hover:bg-[#c9a96e]/10 focus:bg-[#c9a96e]/10 cursor-pointer"
                  onClick={() => navigate("/guide")}
                >
                  <HelpCircle size={13} className="mr-2 text-[#c9a96e]/60" />
                  User Guide
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#c9a96e]/15" />
                <DropdownMenuItem
                  className="text-xs font-serif text-red-400 hover:bg-red-900/20 focus:bg-red-900/20 cursor-pointer"
                  onClick={() => logout()}
                >
                  <LogOut size={13} className="mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-[#c9a96e]/70 hover:text-[#c9a96e] hover:bg-[#c9a96e]/10 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-[#2a1a0a] via-[#33200e] to-[#2a1a0a] border-b border-[#c9a96e]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6 overflow-x-auto">
          {[
            { label: "Total Projects", value: statsQuery.data?.totalProjects ?? projectList.length, icon: FileText, color: "text-[#f5d98a]" },
            { label: "Steps Completed", value: statsQuery.data?.stepsCompleted ?? 0, icon: CheckCircle2, color: "text-[#c9a96e]" },
            { label: "Files Produced", value: statsQuery.data?.filesProduced ?? 0, icon: Upload, color: "text-[#d4b896]" },
            { label: "Production Jobs", value: statsQuery.data?.productionJobsRun ?? 0, icon: Zap, color: "text-[#c9a96e]/80" },
          ].map((stat, idx) => (
            <div key={stat.label} className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[#c9a96e]/10 flex items-center justify-center">
                <stat.icon size={16} className={stat.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-[#f5efe0] leading-none font-serif">{stat.value}</p>
                <p className="text-[10px] text-[#c9a96e]/50 uppercase tracking-wider font-serif">{stat.label}</p>
              </div>
              {idx < 3 && <div className="hidden sm:block h-8 w-px bg-[#c9a96e]/10 ml-3" />}
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {!hasWizardSession && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#c9a96e]/25 bg-gradient-to-r from-[#fdf5e4] via-[#faf0d8] to-[#fdf5e4] p-6 md:p-8 shadow-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#c9a96e]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#c9a96e]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative flex flex-col md:flex-row items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#b8944f] flex items-center justify-center shadow-md shadow-[#c9a96e]/20 shrink-0">
                  <Compass size={26} className="text-[#2a1a0a]" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-serif text-xl md:text-2xl text-[#2c1a00] leading-tight">Start Your Publishing Journey</h3>
                  <p className="text-sm text-[#6b5f53] mt-1.5 max-w-lg leading-relaxed">
                    Take our quick Publishing Wizard to get a personalized roadmap — we'll guide you through every step from manuscript to finished book.
                  </p>
                </div>
                <Button
                  className="bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#d4b480] hover:to-[#c9a96e] text-[#2a1a0a] font-semibold gap-2 shadow-md shadow-[#c9a96e]/15 px-6 py-3 shrink-0"
                  onClick={() => navigate("/guided-journey")}
                >
                  <Sparkles size={16} />
                  Take the Wizard
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </motion.section>
        )}

        {hasWizardSession && (() => {
          const wa = wizardAnswersQuery.data?.answers as Partial<WizardAnswers> | undefined;
          if (!wa) return null;
          return (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <div className="relative overflow-hidden rounded-2xl border border-[#c9a96e]/25 bg-gradient-to-r from-[#fdf5e4] via-[#faf0d8] to-[#fdf5e4] p-6 md:p-8 shadow-sm">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#c9a96e]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#c9a96e]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#b8944f] flex items-center justify-center shadow-md shadow-[#c9a96e]/20 shrink-0">
                      <Compass size={22} className="text-[#2a1a0a]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-lg md:text-xl text-[#2c1a00] leading-tight">Your Publishing Roadmap</h3>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">Completed</Badge>
                      </div>
                      <p className="text-sm text-[#6b5f53]">
                        Personalized plan for <span className="font-semibold text-[#3a2a1a]">{wa.bookTitle}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#d4c8b4] text-[#5c3d2e] gap-1.5 text-xs"
                        onClick={() => navigate("/guided-journey")}
                      >
                        <RotateCcw size={12} /> Retake Quiz
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#d4b480] hover:to-[#c9a96e] text-[#2a1a0a] font-semibold gap-1.5 text-xs"
                        onClick={() => navigate("/guided-journey")}
                      >
                        View Full Roadmap <ArrowRight size={12} />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white/70 rounded-lg border border-[#e8dfd0] p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <BookOpen size={12} className="text-[#c9a96e]" />
                        <span className="text-[10px] uppercase tracking-wider text-[#a89880] font-semibold">Book Type</span>
                      </div>
                      <p className="text-sm font-medium text-[#3a2a1a] font-serif">{wa.bookType}</p>
                    </div>
                    <div className="bg-white/70 rounded-lg border border-[#e8dfd0] p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Layers size={12} className="text-[#c9a96e]" />
                        <span className="text-[10px] uppercase tracking-wider text-[#a89880] font-semibold">Format</span>
                      </div>
                      <p className="text-sm font-medium text-[#3a2a1a] font-serif">{getWizardFormatLabel(wa.format || "")}</p>
                    </div>
                    <div className="bg-white/70 rounded-lg border border-[#e8dfd0] p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={12} className="text-[#c9a96e]" />
                        <span className="text-[10px] uppercase tracking-wider text-[#a89880] font-semibold">Timeline</span>
                      </div>
                      <p className="text-sm font-medium text-[#3a2a1a] font-serif">{getWizardTimelineLabel(wa.timeline || "")}</p>
                    </div>
                    <div className="bg-white/70 rounded-lg border border-[#e8dfd0] p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Star size={12} className="text-[#c9a96e]" />
                        <span className="text-[10px] uppercase tracking-wider text-[#a89880] font-semibold">Experience</span>
                      </div>
                      <p className="text-sm font-medium text-[#3a2a1a] font-serif">{getWizardExperienceLabel(wa.experience || "")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          );
        })()}

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-px w-8 bg-[#c9a96e]/40" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">Professional Suite</span>
              </div>
              <h2 className="font-serif text-2xl text-[#2c1a00]">Publisher Tools Hub</h2>
              <p className="text-sm text-[#8b7b6b] mt-1">Everything you need to create, design, and publish your book</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {TOOLS.map((tool, i) => {
              const isToolLocked = tool.gatedFeature !== null && !canAccess(tool.gatedFeature as PlanFeature);
              return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  className={`rounded-xl p-5 border cursor-pointer group transition-all h-full relative ${
                    tool.dark
                      ? "bg-gradient-to-br from-[#2c1a00] to-[#1a1008] border-[#4a3828] hover:border-[#c9a96e]/50 shadow-md"
                      : tool.cta
                      ? "bg-gradient-to-br from-[#c9a96e] to-[#b8944f] border-[#c9a96e] hover:from-[#d4b480] hover:to-[#c9a96e] shadow-md shadow-[#c9a96e]/20"
                      : "bg-white/90 backdrop-blur-sm border-[#e8dfd0] hover:shadow-lg hover:border-[#c9a96e]/40 hover:-translate-y-0.5"
                  }`}
                  onClick={() => {
                    if (isToolLocked) { navigate("/pricing"); return; }
                    if (tool.path) navigate(tool.path);
                    else if (tool.id === "new-project" || tool.id === "auto-produce") setOpen(true);
                    else if (tool.id === "timeline" && projectList.length > 0) navigate(`/timeline/${projectList[0].id}`);
                    else if (tool.id === "timeline") setOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tool.dark ? "bg-[#c9a96e]/15 border border-[#c9a96e]/20" : tool.cta ? "bg-[#2a1a0a]/10" : "bg-gradient-to-br from-[#f5ede0] to-[#e8dfd0]"
                    }`}>
                      {isToolLocked ? (
                        <Lock size={18} className="text-[#c9a96e]/60" />
                      ) : (
                        <tool.icon size={18} className={tool.dark ? "text-[#f5d98a]" : tool.cta ? "text-[#2a1a0a]" : "text-[#8b5e3c]"} />
                      )}
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      isToolLocked ? "bg-[#c9a96e]/15 text-[#c9a96e]" : tool.cta ? "bg-[#2a1a0a]/10 text-[#2a1a0a]" : tool.badgeColor
                    }`}>
                      {isToolLocked ? "Pro" : tool.badge}
                    </span>
                  </div>
                  <h3 className={`font-serif text-sm font-semibold leading-tight mb-1.5 ${
                    tool.dark ? "text-[#f5efe0] group-hover:text-[#f5d98a]" : tool.cta ? "text-[#2a1a0a]" : "text-[#3a2a1a] group-hover:text-[#5c3d2e]"
                  } transition-colors`}>
                    {tool.label}
                  </h3>
                  <p className={`text-[11px] leading-relaxed ${
                    tool.dark ? "text-[#a08060]" : tool.cta ? "text-[#2a1a0a]/70" : "text-[#8b7b6b]"
                  }`}>
                    {tool.desc}
                  </p>
                  <div className={`flex items-center gap-1 mt-3 text-[11px] font-semibold ${
                    isToolLocked ? "text-[#c9a96e]/60" : tool.dark ? "text-[#c9a96e]" : tool.cta ? "text-[#2a1a0a]" : "text-[#c9a96e]"
                  }`}>
                    {isToolLocked ? "Upgrade" : "Open"} <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
            })}
          </div>
        </section>

        {whatsNextPrompts.length > 0 && (
          <section className="mb-12">
            <WhatsNext
              prompts={whatsNextPrompts}
              title={firstProject ? `What's Next for "${firstProject.title}"?` : "What's Next?"}
            />
          </section>
        )}

        {activityQuery.data && activityQuery.data.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-8 bg-[#c9a96e]/40" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">Activity</span>
            </div>
            <h2 className="font-serif text-2xl text-[#2c1a00] mb-1">Recent Activity</h2>
            <p className="text-sm text-[#8b7b6b] mb-5">Your latest publishing actions across all projects</p>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#e8dfd0] shadow-sm overflow-hidden">
              {activityQuery.data.map((item, idx) => (
                <div
                  key={`${item.type}-${item.projectId}-${idx}`}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[#faf6ef]/60 transition-colors cursor-pointer ${
                    idx < activityQuery.data!.length - 1 ? "border-b border-[#f0e8d8]" : ""
                  }`}
                  onClick={() => navigate(`/project/${item.projectId}`)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.type === "step_completion" ? "bg-emerald-50 border border-emerald-200" :
                    item.type === "file_upload" ? "bg-blue-50 border border-blue-200" :
                    "bg-purple-50 border border-purple-200"
                  }`}>
                    {item.type === "step_completion" ? <CheckCircle2 size={14} className="text-emerald-600" /> :
                     item.type === "file_upload" ? <Upload size={14} className="text-blue-600" /> :
                     <Zap size={14} className="text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#3a2a1a] truncate">{item.detail}</p>
                    <p className="text-[11px] text-[#a89880] truncate">{item.projectTitle}</p>
                  </div>
                  <span className="text-[11px] text-[#a89880] shrink-0 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" "}
                    {new Date(item.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {isStarter && (
          <section className="mb-8">
            <div className="rounded-2xl border border-[#c9a96e]/25 bg-gradient-to-r from-[#c9a96e]/5 via-white to-[#c9a96e]/5 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a96e]/20 to-[#c9a96e]/5 flex items-center justify-center shrink-0">
                  <Sparkles size={22} className="text-[#c9a96e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg text-[#2c1a00] mb-1">Unlock Pro Publishing Tools</h3>
                  <p className="text-sm text-[#8b7b6b] mb-3">
                    Upgrade to Author Pro for AI-powered typesetting, KDP-ready exports, production timelines, 42 book templates, and unlimited projects.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["AI Typesetting", "KDP Export", "Timeline", "Templates", "Unlimited Projects"].map(f => (
                      <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-[#c9a96e]/10 text-[#8b5e3c] font-medium border border-[#c9a96e]/15">{f}</span>
                    ))}
                  </div>
                  <Button
                    onClick={() => navigate("/pricing")}
                    size="sm"
                    className="bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#d4b480] hover:to-[#c9a96e] text-[#1a1008] font-semibold gap-2 shadow-sm"
                  >
                    View Plans & Pricing <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-px w-8 bg-[#c9a96e]/40" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">Library</span>
              </div>
              <h2 className="font-serif text-2xl text-[#2c1a00]">Your Book Projects</h2>
              <p className="text-sm text-[#8b7b6b] mt-1">
                {projectList.length} project{projectList.length !== 1 ? "s" : ""} · {phases.length} phases · {totalSteps} steps each
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              {isStarter && projectList.length >= projectLimit ? (
                <Button
                  onClick={() => navigate("/pricing")}
                  className="bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#d4b480] hover:to-[#c9a96e] text-[#2a1a0a] font-semibold gap-2 shadow-md shadow-[#c9a96e]/15 px-5 py-2.5"
                >
                  <Lock size={16} /> Upgrade for More Projects
                </Button>
              ) : (
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#d4b480] hover:to-[#c9a96e] text-[#2a1a0a] font-semibold gap-2 shadow-md shadow-[#c9a96e]/15 px-5 py-2.5">
                  <Plus size={16} /> New Project
                </Button>
              </DialogTrigger>
              )}
              <DialogContent className="bg-gradient-to-b from-[#faf6ef] to-[#f5ede0] border-[#c9a96e]/20 shadow-2xl max-w-lg">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-px w-8 bg-[#c9a96e]/40" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">New Project</span>
                  </div>
                  <DialogTitle className="font-serif text-2xl text-[#3a2a1a]">Start a New Book Project</DialogTitle>
                  <p className="text-sm text-[#8b7b6b] mt-1">Fill in your book details to begin tracking production across all {totalSteps} steps.</p>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createMutation.mutate({ title, author, genre, bibleEditionType: bibleEditionType || undefined, bibleTranslation: bibleTranslation || undefined, notes });
                  }}
                  className="space-y-5 mt-5"
                >
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Book Title *</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., The Great American Novel" className="mt-1.5 border-[#c9a96e]/30 bg-white/80 focus:border-[#c9a96e] focus:ring-[#c9a96e]/20" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#5c3d2e] font-semibold text-sm">Author</Label>
                      <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" className="mt-1.5 border-[#c9a96e]/30 bg-white/80 focus:border-[#c9a96e]" />
                    </div>
                    <div>
                      <Label className="text-[#5c3d2e] font-semibold text-sm">Genre</Label>
                      <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger className="mt-1.5 border-[#c9a96e]/30 bg-white/80 text-[#3a2a1a]">
                          <SelectValue placeholder="Select genre…" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRES.map(g => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {isBible && (
                    <div className="rounded-xl border border-[#c9a96e]/30 bg-gradient-to-br from-[#fdf5e4] to-[#faf0d8] p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-[#c9a96e]" />
                        <p className="text-xs font-semibold text-[#8b5e3c] uppercase tracking-wider">Bible Edition Details</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#5c3d2e] font-semibold text-sm">Edition Type</Label>
                          <Select value={bibleEditionType} onValueChange={setBibleEditionType}>
                            <SelectTrigger className="mt-1.5 border-[#c9a96e]/30 bg-white/80 text-[#3a2a1a]">
                              <SelectValue placeholder="Select edition…" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Standard Text Bible","Red-Letter Edition","Study Bible","Journaling Bible","Devotional Bible","Large Print Bible","Compact / Pew Bible","Children's Bible","Youth Bible","Reference Bible","Parallel Bible","Interlinear Bible","Illustrated Bible","Audio Bible (Print Companion)","Braille Bible","Pulpit / Lectern Bible","Wedding Bible","Military Bible","Outreach / Evangelism Bible","Chronological Bible","Topical Bible","Custom / Specialty Edition"].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[#5c3d2e] font-semibold text-sm">Translation</Label>
                          <Select value={bibleTranslation} onValueChange={setBibleTranslation}>
                            <SelectTrigger className="mt-1.5 border-[#c9a96e]/30 bg-white/80 text-[#3a2a1a]">
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
                    <Label className="text-[#5c3d2e] font-semibold text-sm">Notes</Label>
                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about this project..." className="mt-1.5 border-[#c9a96e]/30 bg-white/80 focus:border-[#c9a96e]" rows={3} />
                  </div>
                  <Button type="submit" disabled={!title || createMutation.isPending} className="w-full bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#d4b480] hover:to-[#c9a96e] text-[#2a1a0a] font-semibold py-3 shadow-md shadow-[#c9a96e]/15 text-base">
                    {createMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Plus size={16} className="mr-2" />}
                    Create Project
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {projectList.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 bg-gradient-to-br from-white/90 to-[#faf6ef]/90 backdrop-blur-sm rounded-2xl border border-[#c9a96e]/20 shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f5ede0] to-[#e8dfd0] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <BookOpen size={32} className="text-[#c9a96e]" />
              </div>
              <p className="font-serif text-2xl text-[#3a2a1a]">No projects yet</p>
              <p className="text-sm text-[#8b7b6b] mt-2 max-w-sm mx-auto leading-relaxed">Create your first book project to start tracking production across all {totalSteps} steps.</p>
              <Button className="mt-8 bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#d4b480] hover:to-[#c9a96e] text-[#2a1a0a] font-semibold shadow-md shadow-[#c9a96e]/15 px-6 py-3" onClick={() => setOpen(true)}>
                <Plus size={18} className="mr-2" /> Create Your First Project
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projectList.map((project, i) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card
                    className="bg-white/90 backdrop-blur-sm border-[#e8dfd0] hover:shadow-xl hover:border-[#c9a96e]/40 hover:-translate-y-0.5 transition-all cursor-pointer group"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg text-[#3a2a1a] truncate group-hover:text-[#5c3d2e] transition-colors leading-tight font-semibold">{project.title}</h3>
                          {project.author && <p className="text-xs text-[#8b7b6b] mt-1 italic">by {project.author}</p>}
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <Button
                            variant="ghost" size="icon"
                            className="w-7 h-7 text-[#a89880] hover:text-[#c9a96e] hover:bg-[#f5ede0]"
                            title="Duplicate project"
                            onClick={(e) => { e.stopPropagation(); duplicateMutation.mutate({ projectId: project.id }); }}
                          >
                            <Copy size={14} />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="w-7 h-7 text-[#a89880] hover:text-red-600 hover:bg-red-50"
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

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {project.genre && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f5ede0] text-[#8b7b6b] font-medium border border-[#e8dfd0]">
                            {project.genre}
                          </span>
                        )}
                        {project.bibleEditionType && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                            {project.bibleEditionType}
                          </span>
                        )}
                        {project.bibleTranslation && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                            {project.bibleTranslation}
                          </span>
                        )}
                      </div>

                      <div className="mt-5">
                        <div className="flex items-center justify-between text-[10px] text-[#a89880] mb-1.5 font-medium">
                          <span>Production Progress</span>
                          <span>—</span>
                        </div>
                        <Progress value={0} className="h-2 bg-[#f0e8d8] rounded-full" />
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#f0e8d8] flex items-center justify-between">
                        <span className="text-[11px] text-[#a89880]">
                          Created {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            className="text-[11px] text-[#a89880] hover:text-[#5c3d2e] transition-colors font-medium"
                            onClick={(e) => { e.stopPropagation(); navigate(`/timeline/${project.id}`); }}
                          >
                            Timeline
                          </button>
                          <span className="flex items-center gap-0.5 text-[11px] text-[#c9a96e] font-semibold group-hover:translate-x-0.5 transition-transform">
                            Open <ArrowRight size={11} />
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

        <section id="contact-section" className="mb-12">
          <div className="rounded-xl border border-[#e8dfd0] bg-white/90 backdrop-blur-sm p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-px w-8 bg-[#c9a96e]/40" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">Support</span>
                  <div className="h-px w-8 bg-[#c9a96e]/40" />
                </div>
                <h2 className="font-serif text-2xl text-[#2c1a00]">Get in Touch</h2>
                <p className="text-sm text-[#8b7b6b] mt-1">Questions about your project? Need help with a tool? We're here to help.</p>
              </div>

              {contactSent ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-serif text-lg text-[#2c1a00] mb-1">Message Sent</h3>
                  <p className="text-sm text-[#8b7b6b]">We'll get back to you as soon as possible.</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-[#e8dfd0] text-[#8b7b6b] hover:bg-[#f5ede0]"
                    onClick={() => setContactSent(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#5c3d2e] text-xs font-medium mb-1.5 block">Name</Label>
                      <Input
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Your name"
                        className="border-[#e8dfd0] bg-[#faf6ef]/50 focus:border-[#c9a96e] focus:ring-[#c9a96e]/20"
                      />
                    </div>
                    <div>
                      <Label className="text-[#5c3d2e] text-xs font-medium mb-1.5 block">Email</Label>
                      <Input
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@example.com"
                        type="email"
                        className="border-[#e8dfd0] bg-[#faf6ef]/50 focus:border-[#c9a96e] focus:ring-[#c9a96e]/20"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] text-xs font-medium mb-1.5 block">Subject</Label>
                    <Input
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="How can we help?"
                      className="border-[#e8dfd0] bg-[#faf6ef]/50 focus:border-[#c9a96e] focus:ring-[#c9a96e]/20"
                    />
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] text-xs font-medium mb-1.5 block">Message</Label>
                    <Textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Tell us about your question or project..."
                      rows={4}
                      className="border-[#e8dfd0] bg-[#faf6ef]/50 focus:border-[#c9a96e] focus:ring-[#c9a96e]/20 resize-none"
                    />
                  </div>
                  <Button
                    onClick={() => contactMutation.mutate({ name: contactName, email: contactEmail, subject: contactSubject, message: contactMessage })}
                    disabled={!contactName || !contactEmail || !contactMessage || contactMutation.isPending}
                    className="bg-gradient-to-r from-[#5c3d2e] to-[#3a2a1a] hover:from-[#6b4a3a] hover:to-[#4a3828] text-[#f5efe0] w-full sm:w-auto sm:self-end"
                  >
                    {contactMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" /> Send Message</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
