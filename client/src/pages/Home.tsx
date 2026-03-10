import { useAuth } from "@/_core/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
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
  CheckCircle2, Clock, Sparkles, Copy,
  Layers, Star,
  Send,
  Compass, Printer,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { phases } from "@/data/flowchartData";
import type { WizardAnswers } from "@/components/PublishingWizard";
import DashboardLayout from "@/components/DashboardLayout";

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

const PAGE_TITLE = "Publisher Dashboard — Easy Book Publishers";
const PAGE_DESCRIPTION = "Your publishing command center. Manage book projects and track your 30-step production workflow.";

function setMetaTag(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isStarter, projectLimit } = usePlan();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLE;
    setMetaTag("description", PAGE_DESCRIPTION);
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

  const wizardAnswersQuery = trpc.wizard.getAnswers.useQuery(undefined, { enabled: isAuthenticated });
  const hasWizardSession = !!wizardAnswersQuery.data?.answers && !!(wizardAnswersQuery.data.answers as Record<string, unknown>).bookType;

  if (authLoading || projectsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#f3efe6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#c9a96e]" size={32} />
      </div>
    );
  }

  const projectList = projectsQuery.data ?? [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">

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
                  Start the Publishing Wizard
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
                        <span className="text-[10px] uppercase tracking-wider text-[#8b7b6b] font-semibold">Book Type</span>
                      </div>
                      <p className="text-sm font-medium text-[#3a2a1a] font-serif">{wa.bookType}</p>
                    </div>
                    <div className="bg-white/70 rounded-lg border border-[#e8dfd0] p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Layers size={12} className="text-[#c9a96e]" />
                        <span className="text-[10px] uppercase tracking-wider text-[#8b7b6b] font-semibold">Format</span>
                      </div>
                      <p className="text-sm font-medium text-[#3a2a1a] font-serif">{getWizardFormatLabel(wa.format || "")}</p>
                    </div>
                    <div className="bg-white/70 rounded-lg border border-[#e8dfd0] p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={12} className="text-[#c9a96e]" />
                        <span className="text-[10px] uppercase tracking-wider text-[#8b7b6b] font-semibold">Timeline</span>
                      </div>
                      <p className="text-sm font-medium text-[#3a2a1a] font-serif">{getWizardTimelineLabel(wa.timeline || "")}</p>
                    </div>
                    <div className="bg-white/70 rounded-lg border border-[#e8dfd0] p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Star size={12} className="text-[#c9a96e]" />
                        <span className="text-[10px] uppercase tracking-wider text-[#8b7b6b] font-semibold">Experience</span>
                      </div>
                      <p className="text-sm font-medium text-[#3a2a1a] font-serif">{getWizardExperienceLabel(wa.experience || "")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          );
        })()}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl text-[#2c1a00]">Your Book Projects</h2>
              <p className="text-sm text-[#7a6e60] mt-1">
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
              <DialogContent className="bg-gradient-to-b from-[#f3efe6] to-[#f5ede0] border-[#c9a96e]/20 shadow-2xl max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-[#3a2a1a]">Start a New Book Project</DialogTitle>
                  <p className="text-sm text-[#7a6e60] mt-1">Fill in your book details to begin tracking production across all {totalSteps} steps.</p>
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
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white/90 to-[#f3efe6]/90 backdrop-blur-sm rounded-2xl border border-[#c9a96e]/20 shadow-sm overflow-hidden">
              <div className="text-center pt-16 pb-10 px-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f5ede0] to-[#e8dfd0] flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <BookOpen size={32} className="text-[#c9a96e]" />
                </div>
                <p className="font-serif text-2xl text-[#3a2a1a] mb-2">Welcome to Your Publishing Studio</p>
                <p className="text-sm text-[#7a6e60] max-w-md mx-auto leading-relaxed mb-8">You're one step away from creating a professional, print-ready book. Start your first project and our {totalSteps}-step workflow will guide you through every stage.</p>
                <Button className="bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#d4b480] hover:to-[#c9a96e] text-[#2a1a0a] font-semibold shadow-md shadow-[#c9a96e]/15 px-8 py-3 text-base" onClick={() => setOpen(true)}>
                  <Plus size={18} className="mr-2" /> Create Your First Book
                </Button>
              </div>
              <div className="bg-[#1a1008]/[0.03] border-t border-[#c9a96e]/10 px-6 py-8">
                <p className="text-xs uppercase tracking-wider text-[#c9a96e] font-semibold text-center mb-5">Here's what happens next</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="text-center px-4">
                    <div className="w-8 h-8 rounded-full bg-[#c9a96e]/15 flex items-center justify-center mx-auto mb-2 border border-[#c9a96e]/20">
                      <span className="text-xs font-bold text-[#c9a96e]">1</span>
                    </div>
                    <p className="text-sm font-serif font-semibold text-[#3a2a1a] mb-1">Name Your Book</p>
                    <p className="text-xs text-[#7a6e60] leading-relaxed">Enter your title and author name to create a project</p>
                  </div>
                  <div className="text-center px-4">
                    <div className="w-8 h-8 rounded-full bg-[#c9a96e]/15 flex items-center justify-center mx-auto mb-2 border border-[#c9a96e]/20">
                      <span className="text-xs font-bold text-[#c9a96e]">2</span>
                    </div>
                    <p className="text-sm font-serif font-semibold text-[#3a2a1a] mb-1">Upload & Format</p>
                    <p className="text-xs text-[#7a6e60] leading-relaxed">Upload your manuscript and our AI typesets it instantly</p>
                  </div>
                  <div className="text-center px-4">
                    <div className="w-8 h-8 rounded-full bg-[#c9a96e]/15 flex items-center justify-center mx-auto mb-2 border border-[#c9a96e]/20">
                      <span className="text-xs font-bold text-[#c9a96e]">3</span>
                    </div>
                    <p className="text-sm font-serif font-semibold text-[#3a2a1a] mb-1">Download & Publish</p>
                    <p className="text-xs text-[#7a6e60] leading-relaxed">Get print-ready PDF, EPUB, and more — publish anywhere</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                          {project.author && <p className="text-xs text-[#7a6e60] mt-1 italic">by {project.author}</p>}
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          <Button
                            variant="ghost" size="icon"
                            className="w-7 h-7 text-[#8b7b6b] hover:text-[#c9a96e] hover:bg-[#f5ede0]"
                            title="Duplicate project"
                            onClick={(e) => { e.stopPropagation(); duplicateMutation.mutate({ projectId: project.id }); }}
                          >
                            <Copy size={14} />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="w-7 h-7 text-[#8b7b6b] hover:text-red-600 hover:bg-red-50"
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
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f5ede0] text-[#7a6e60] font-medium border border-[#e8dfd0]">
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
                        <div className="flex items-center justify-between text-[10px] text-[#8b7b6b] mb-1.5 font-medium">
                          <span>Production Progress</span>
                          <span>—</span>
                        </div>
                        <Progress value={0} className="h-2 bg-[#f0e8d8] rounded-full" />
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#f0e8d8] flex items-center justify-between">
                        <span className="text-[11px] text-[#8b7b6b]">
                          Created {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="flex items-center gap-0.5 text-[11px] text-[#c9a96e] font-semibold group-hover:translate-x-0.5 transition-transform">
                          Open <ArrowRight size={11} />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section id="contact-section" className="mb-8">
          <div className="rounded-xl border border-[#e8dfd0] bg-white/90 backdrop-blur-sm p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="font-serif text-2xl text-[#2c1a00]">Get in Touch</h2>
                <p className="text-sm text-[#7a6e60] mt-1">Questions about your project? Need help? We're here to help.</p>
              </div>

              {contactSent ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-serif text-lg text-[#2c1a00] mb-1">Message Sent</h3>
                  <p className="text-sm text-[#7a6e60]">We'll get back to you as soon as possible.</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-[#e8dfd0] text-[#7a6e60] hover:bg-[#f5ede0]"
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
                        className="border-[#e8dfd0] bg-[#f3efe6]/50 focus:border-[#c9a96e] focus:ring-[#c9a96e]/20"
                      />
                    </div>
                    <div>
                      <Label className="text-[#5c3d2e] text-xs font-medium mb-1.5 block">Email</Label>
                      <Input
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@example.com"
                        type="email"
                        className="border-[#e8dfd0] bg-[#f3efe6]/50 focus:border-[#c9a96e] focus:ring-[#c9a96e]/20"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] text-xs font-medium mb-1.5 block">Subject</Label>
                    <Input
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="How can we help?"
                      className="border-[#e8dfd0] bg-[#f3efe6]/50 focus:border-[#c9a96e] focus:ring-[#c9a96e]/20"
                    />
                  </div>
                  <div>
                    <Label className="text-[#5c3d2e] text-xs font-medium mb-1.5 block">Message</Label>
                    <Textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Tell us about your question or project..."
                      rows={4}
                      className="border-[#e8dfd0] bg-[#f3efe6]/50 focus:border-[#c9a96e] focus:ring-[#c9a96e]/20 resize-none"
                    />
                  </div>
                  <Button
                    onClick={() => contactMutation.mutate({ name: contactName, email: contactEmail, subject: contactSubject, message: contactMessage })}
                    disabled={!contactName || !contactEmail || !contactMessage || contactMutation.isPending}
                    className="bg-gradient-to-r from-[#5c3d2e] to-[#3a2a1a] hover:from-[#6b4a3a] hover:to-[#4a3828] text-[#ede7d8] w-full sm:w-auto sm:self-end"
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

      </div>
    </DashboardLayout>
  );
}
