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
import {
  BookOpen, Plus, Trash2, ArrowRight, Loader2,
  Upload, CheckCircle2, SkipForward, Clock, Sparkles, Copy,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { phases } from "@/data/flowchartData";

const HERO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/hero-banner-cxQRR1jXLBmcXxFPJoqxWN.webp";

const totalSteps = phases.reduce((acc, p) => acc + p.steps.length, 0);
const totalInputs = phases.reduce((acc, p) => acc + p.steps.reduce((a, s) => a + s.inputs.length, 0), 0);

const features = [
  { icon: Upload, title: "Upload Real Documents", desc: "Attach manuscripts, contracts, cover art, and proofs at every step." },
  { icon: CheckCircle2, title: "Track Progress", desc: "Mark steps complete or skip optional ones. See per-phase and overall progress." },
  { icon: SkipForward, title: "Skip What You Don't Need", desc: "Not every book needs indexing or audio. Skip steps that don't apply." },
  { icon: Clock, title: "Set Due Dates", desc: "Add target dates per phase and get alerts when deadlines approach." },
];

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [notes, setNotes] = useState("");

  const projectsQuery = trpc.project.list.useQuery(undefined, { enabled: isAuthenticated });
  const createMutation = trpc.project.create.useMutation({
    onSuccess: (project) => {
      setOpen(false);
      setTitle(""); setAuthor(""); setGenre(""); setNotes("");
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

  // Not logged in — show landing
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf6ef]">
        {/* Hero */}
        <div className="relative h-[75vh] min-h-[550px] flex items-center justify-center overflow-hidden">
          <img src={HERO_URL} alt="Bookmaker's workshop" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1008]/70 via-[#1a1008]/40 to-[#1a1008]/80" />
          <div className="relative z-10 text-center px-6 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-16 bg-[#c9a96e]/60" />
                <BookOpen size={28} className="text-[#c9a96e]" />
                <div className="h-px w-16 bg-[#c9a96e]/60" />
              </div>
              <h1 className="font-serif text-5xl md:text-7xl text-[#f5efe0] leading-tight tracking-tight">
                The Bookmaker's<br />Journey
              </h1>
              <p className="mt-6 font-sans text-lg md:text-xl text-[#d4c8b4] max-w-xl mx-auto leading-relaxed">
                Track every step of your book's production — from first idea to finished volume. Upload real documents, set deadlines, and never lose sight of where you are.
              </p>
              <div className="mt-8 flex items-center justify-center gap-8 text-[#c9a96e]/80 font-serif text-lg">
                <span><strong className="text-3xl text-[#f5efe0]">{phases.length}</strong> Phases</span>
                <span className="text-[#c9a96e]/30">|</span>
                <span><strong className="text-3xl text-[#f5efe0]">{totalSteps}</strong> Steps</span>
                <span className="text-[#c9a96e]/30">|</span>
                <span><strong className="text-3xl text-[#f5efe0]">{totalInputs}</strong> Inputs</span>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-[#3a2a1a]">A Real Project Tracker</h2>
            <p className="mt-3 text-[#8b7b6b] max-w-lg mx-auto">Not just a flowchart — a working tool where you attach your actual manuscripts, contracts, and proofs at every stage.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
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

        {/* Phase overview */}
        <div className="bg-[#2a1a0a] py-20">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <h2 className="font-serif text-3xl md:text-4xl text-[#f5efe0]">Every Phase of Book Production</h2>
              <p className="mt-3 text-[#c9a96e]/60 max-w-lg mx-auto">From the spark of an idea to a finished book in readers' hands — we've mapped every step.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {phases.map((phase, i) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <div className="bg-[#3a2a1a] rounded-xl p-5 border border-[#c9a96e]/10 hover:border-[#c9a96e]/30 transition-colors h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ backgroundColor: phase.accentColor }}
                      >
                        {phase.number}
                      </span>
                      <h3 className="font-serif text-lg text-[#f5efe0]">{phase.title}</h3>
                    </div>
                    <p className="text-sm text-[#c9a96e]/50">{phase.subtitle}</p>
                    <p className="text-xs text-[#c9a96e]/30 mt-3">{phase.steps.length} steps · {phase.steps.reduce((a, s) => a + s.inputs.length, 0)} inputs</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-20 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles size={32} className="mx-auto text-[#c9a96e] mb-4" />
            <h2 className="font-serif text-3xl text-[#3a2a1a] mb-3">Ready to Begin?</h2>
            <p className="text-[#8b7b6b] max-w-md mx-auto mb-8">Create your first project and start tracking your book from manuscript to shelf.</p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold text-base px-10 py-6 rounded-lg">
                Get Started Free
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Footer */}
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

  // Logged in — project dashboard
  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <header className="bg-[#2a1a0a] text-[#f5efe0]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className="text-[#c9a96e]" />
            <h1 className="font-serif text-2xl">The Bookmaker's Journey</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#c9a96e]/70">{user?.name || user?.email}</span>
          </div>
        </div>
      </header>

      {/* Projects */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl text-[#3a2a1a]">Your Book Projects</h2>
            <p className="text-sm text-[#8b7b6b] mt-1">{projectList.length} project{projectList.length !== 1 ? "s" : ""} · {phases.length} phases · {totalSteps} steps per project</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold">
                <Plus size={18} className="mr-2" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#faf6ef] border-[#e8dfd0]">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-[#3a2a1a]">Start a New Book Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ title, author, genre, notes }); }} className="space-y-4 mt-4">
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
                    <Input value={genre} onChange={e => setGenre(e.target.value)} placeholder="e.g., Literary Fiction" className="mt-1 border-[#d4c8b4]" />
                  </div>
                </div>
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
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectList.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="bg-white border-[#e8dfd0] hover:shadow-lg hover:border-[#c9a96e]/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-xl text-[#3a2a1a] truncate group-hover:text-[#5c3d2e] transition-colors">{project.title}</h3>
                        {project.author && <p className="text-sm text-[#8b7b6b] mt-1">by {project.author}</p>}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost" size="icon"
                          className="text-[#a89880] hover:text-[#c9a96e]"
                          title="Duplicate project"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateMutation.mutate({ projectId: project.id });
                          }}
                        >
                          <Copy size={16} />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="text-[#a89880] hover:text-red-600"
                          title="Delete project"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this project and all its files?")) {
                              deleteMutation.mutate({ projectId: project.id });
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    {project.genre && (
                      <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full bg-[#f0e8d8] text-[#8b7b6b]">
                        {project.genre}
                      </span>
                    )}
                    <div className="mt-4 pt-4 border-t border-[#e8dfd0]">
                      <div className="flex items-center justify-between text-xs text-[#a89880]">
                        <span>Created {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        <span className="flex items-center gap-1 text-[#c9a96e] font-medium group-hover:translate-x-1 transition-transform">
                          Open <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
