import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { phases } from "@/data/flowchartData";

const HERO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/hero-banner-cxQRR1jXLBmcXxFPJoqxWN.webp";

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

  const totalSteps = phases.reduce((acc, p) => acc + p.steps.length, 0);

  // Not logged in — show landing
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf6ef]">
        {/* Hero */}
        <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <img src={HERO_URL} alt="Bookmaker's workshop" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1008]/60 via-[#1a1008]/40 to-[#1a1008]/70" />
          <div className="relative z-10 text-center px-6 max-w-3xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 bg-[#c9a96e]/60" />
              <BookOpen size={24} className="text-[#c9a96e]" />
              <div className="h-px w-12 bg-[#c9a96e]/60" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl text-[#f5efe0] leading-tight tracking-tight">
              The Bookmaker's<br />Journey
            </h1>
            <p className="mt-6 font-sans text-lg text-[#d4c8b4] max-w-xl mx-auto leading-relaxed">
              Track every step of your book's production — from first idea to finished volume. Upload manuscripts, contracts, cover art, and more at each stage.
            </p>
            <div className="mt-8 flex items-center justify-center gap-8 text-[#c9a96e]/80 font-serif text-lg">
              <span><strong className="text-2xl text-[#f5efe0]">{phases.length}</strong> Phases</span>
              <span><strong className="text-2xl text-[#f5efe0]">{totalSteps}</strong> Steps</span>
            </div>
            <div className="mt-10">
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold text-base px-8 py-6 rounded-lg">
                  Sign In to Start Your Project
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Process overview */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl text-[#5c3d2e] text-center mb-12">Every Phase of Book Production</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {phases.map((phase) => (
              <div key={phase.id} className="bg-white rounded-xl p-6 shadow-sm border border-[#e8dfd0]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: phase.accentColor }}>
                    {phase.number}
                  </span>
                  <h3 className="font-serif text-lg text-[#3a2a1a]">{phase.title}</h3>
                </div>
                <p className="text-sm text-[#8b7b6b]">{phase.subtitle}</p>
                <p className="text-xs text-[#a89880] mt-2">{phase.steps.length} steps</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 bg-[#2a1a0a] text-center">
          <p className="font-serif text-lg text-[#c9a96e]/60 italic">"A book is a dream that you hold in your hand."</p>
          <p className="text-xs text-[#c9a96e]/30 mt-2">— Neil Gaiman</p>
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
          <h2 className="font-serif text-3xl text-[#5c3d2e]">Your Book Projects</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold">
                <Plus size={18} className="mr-2" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#faf6ef] border-[#e8dfd0]">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-[#5c3d2e]">Start a New Book Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ title, author, genre, notes }); }} className="space-y-4 mt-4">
                <div>
                  <Label className="text-[#5c3d2e] font-semibold">Book Title *</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., The Great American Novel" className="mt-1 border-[#d4c8b4]" required />
                </div>
                <div>
                  <Label className="text-[#5c3d2e] font-semibold">Author</Label>
                  <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" className="mt-1 border-[#d4c8b4]" />
                </div>
                <div>
                  <Label className="text-[#5c3d2e] font-semibold">Genre</Label>
                  <Input value={genre} onChange={e => setGenre(e.target.value)} placeholder="e.g., Literary Fiction, Memoir, Sci-Fi" className="mt-1 border-[#d4c8b4]" />
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
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto text-[#c9a96e]/40 mb-4" />
            <p className="font-serif text-xl text-[#8b7b6b]">No projects yet</p>
            <p className="text-sm text-[#a89880] mt-2">Create your first book project to start tracking production.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectList.map((project) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-white border-[#e8dfd0] hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(`/project/${project.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-xl text-[#3a2a1a] truncate">{project.title}</h3>
                        {project.author && <p className="text-sm text-[#8b7b6b] mt-1">by {project.author}</p>}
                        {project.genre && (
                          <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-[#f0e8d8] text-[#8b7b6b]">
                            {project.genre}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#a89880] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <div className="mt-4 flex items-center gap-2 text-[#c9a96e]">
                      <ArrowRight size={14} />
                      <span className="text-xs font-medium">Open tracker</span>
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
