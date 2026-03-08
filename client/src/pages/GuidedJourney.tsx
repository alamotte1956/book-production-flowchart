import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublishingWizard, { type WizardAnswers } from "@/components/PublishingWizard";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, FileText, Layers, Ruler, BookMarked, Zap, Calendar, Library,
  ArrowRight, CheckCircle2, Clock, Sparkles, ChevronRight, RotateCcw,
  Printer, Globe, Tag, Users, GraduationCap, Baby, Heart, Feather,
} from "lucide-react";
import { phases } from "@/data/flowchartData";

type RoadmapStep = {
  title: string;
  description: string;
  icon: typeof BookOpen;
  toolPath?: string;
  toolLabel?: string;
  priority: "essential" | "recommended" | "optional";
  phase: string;
};

function generateRoadmap(answers: WizardAnswers): RoadmapStep[] {
  const steps: RoadmapStep[] = [];
  const isBible = answers.bookType === "Bible / Scripture";
  const isChildrens = answers.bookType === "Children's Book";
  const needsPrint = answers.format === "print" || answers.format === "both";
  const needsEbook = answers.format === "ebook" || answers.format === "both";
  const needsIsbn = answers.hasIsbn !== "have-isbn";
  const isFirstTime = answers.experience === "first-time";
  const manuscriptNotReady = answers.manuscriptStatus !== "ready";

  if (manuscriptNotReady) {
    steps.push({
      title: "Complete Your Manuscript",
      description: answers.manuscriptStatus === "not-started"
        ? "Start writing your manuscript. Use our project tracker to organize your ideas and set writing milestones."
        : "Finish your manuscript draft and do a round of self-editing before moving into production.",
      icon: Feather,
      priority: "essential",
      phase: "Concept & Manuscript",
    });
  }

  if (isFirstTime) {
    steps.push({
      title: "Explore the User Guide",
      description: "As a first-time publisher, start with our User Guide to understand the 30-step production workflow from manuscript to shelf.",
      icon: BookOpen,
      toolPath: "/guide",
      toolLabel: "Open User Guide",
      priority: "essential",
      phase: "Getting Started",
    });
  }

  steps.push({
    title: "Create Your Book Project",
    description: `Set up a new project for "${answers.bookTitle}" and start tracking your production progress across all phases.`,
    icon: FileText,
    toolPath: "/",
    toolLabel: "Go to Dashboard",
    priority: "essential",
    phase: "Setup",
  });

  if (isBible) {
    steps.push({
      title: "Configure Bible Edition Specs",
      description: "Use Bible Design Studio to configure your edition type, translation, trim size, paper stock, binding, and typesetting style.",
      icon: BookOpen,
      toolPath: "/bible-studio",
      toolLabel: "Open Bible Studio",
      priority: "essential",
      phase: "Design",
    });
  }

  if (needsPrint) {
    steps.push({
      title: "Calculate Spine Width",
      description: "Determine your exact spine width based on page count, paper type, and binding method — essential for cover design.",
      icon: Ruler,
      toolPath: "/spine-calculator",
      toolLabel: "Open Spine Calculator",
      priority: needsPrint ? "essential" : "optional",
      phase: "Design",
    });

    steps.push({
      title: "Design Your Cover",
      description: "Generate full-wrap cover dimensions with bleed, safe zones, and a print-ready spec sheet for your cover designer.",
      icon: Layers,
      toolPath: "/cover-designer",
      toolLabel: "Open Cover Designer",
      priority: "essential",
      phase: "Design",
    });
  }

  steps.push({
    title: "Typeset Your Interior",
    description: needsEbook && needsPrint
      ? "Use Auto-Produce to generate both a typeset PDF for print and an EPUB for digital distribution."
      : needsEbook
      ? "Use Auto-Produce to generate a professionally formatted EPUB for digital distribution."
      : "Use Auto-Produce to generate a professionally typeset PDF ready for print production.",
    icon: Zap,
    toolLabel: "Auto-Produce (from project)",
    priority: "essential",
    phase: "Production",
  });

  if (needsIsbn) {
    steps.push({
      title: answers.hasIsbn === "what-is-isbn" ? "Learn About ISBNs & Get One" : "Purchase Your ISBN",
      description: answers.hasIsbn === "what-is-isbn"
        ? "An ISBN is a 13-digit code required by most retailers. Use our ISBN tools to understand what you need and manage your metadata."
        : "Purchase an ISBN from Bowker (myidentifiers.com) and use our ISBN Manager to set up your metadata and ONIX 3.0 export.",
      icon: BookMarked,
      toolPath: "/isbn-manager",
      toolLabel: "Open ISBN Manager",
      priority: "essential",
      phase: "Metadata",
    });
  } else {
    steps.push({
      title: "Set Up Book Metadata",
      description: "Configure your ISBN, BISAC codes, LCCN, and export ONIX 3.0 XML for distributors like IngramSpark and Amazon.",
      icon: BookMarked,
      toolPath: "/isbn-manager",
      toolLabel: "Open ISBN Manager",
      priority: "recommended",
      phase: "Metadata",
    });
  }

  if (isChildrens) {
    steps.push({
      title: "Coordinate Illustration & Layout",
      description: "Children's books need tight coordination between illustrations and text. Plan your page spreads and illustration briefs early.",
      icon: Layers,
      priority: "recommended",
      phase: "Design",
    });
  }

  steps.push({
    title: "Set Production Timeline",
    description: answers.timeline === "asap"
      ? "You're on a tight schedule. Set up your production timeline with aggressive but achievable milestones."
      : `You have ${answers.timeline === "1-3-months" ? "1–3 months" : answers.timeline === "3-6-months" ? "3–6 months" : "6+ months"}. Set phase deadlines to stay on track.`,
    icon: Calendar,
    toolLabel: "Timeline (from project)",
    priority: "recommended",
    phase: "Planning",
  });

  steps.push({
    title: "Browse Publishing Resources",
    description: "Explore 43 curated tools across every production phase — from writing software to distribution platforms.",
    icon: Library,
    toolPath: "/resources",
    toolLabel: "Open Resources Hub",
    priority: "recommended",
    phase: "Resources",
  });

  steps.push({
    title: "Browse Book Templates",
    description: "Check out production templates from Easy Book Publishers and KP&A to find the right starting point for your book type.",
    icon: Globe,
    toolPath: "/templates",
    toolLabel: "Browse Templates",
    priority: "optional",
    phase: "Templates",
  });

  return steps;
}

function getBookTypeIcon(type: string) {
  switch (type) {
    case "Bible / Scripture": return BookOpen;
    case "Novel / Fiction": return Feather;
    case "Non-Fiction": return FileText;
    case "Children's Book": return Baby;
    case "Poetry / Anthology": return Sparkles;
    case "Memoir / Biography": return Heart;
    case "Textbook / Academic": return GraduationCap;
    default: return Globe;
  }
}

function getFormatLabel(format: string) {
  switch (format) {
    case "print": return "Print Book";
    case "ebook": return "eBook Only";
    case "both": return "Print + eBook";
    default: return format;
  }
}

function getTimelineLabel(timeline: string) {
  switch (timeline) {
    case "asap": return "ASAP";
    case "1-3-months": return "1–3 Months";
    case "3-6-months": return "3–6 Months";
    case "6-plus-months": return "6+ Months";
    default: return timeline;
  }
}

function getPriorityBadge(priority: "essential" | "recommended" | "optional") {
  switch (priority) {
    case "essential":
      return <Badge className="bg-[#c9a96e]/15 text-[#8b6914] border-[#c9a96e]/30 text-[10px] font-semibold">Essential</Badge>;
    case "recommended":
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold">Recommended</Badge>;
    case "optional":
      return <Badge className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-semibold">Optional</Badge>;
  }
}

function Roadmap({ answers, onReset }: { answers: WizardAnswers; onReset: () => void }) {
  const [, navigate] = useLocation();
  const roadmap = generateRoadmap(answers);
  const BookTypeIcon = getBookTypeIcon(answers.bookType);

  const essentialCount = roadmap.filter(s => s.priority === "essential").length;
  const totalPhases = new Set(roadmap.map(s => s.phase)).size;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#fdf5e4] border border-[#e8c87a]/40 rounded-full px-4 py-1.5 mb-4">
              <Sparkles size={14} className="text-[#c9a96e]" />
              <span className="text-xs font-semibold text-[#8b6914]">Your Personalized Roadmap</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#2c1a00] leading-tight">
              Publishing Roadmap for<br />
              <span className="text-[#c9a96e]">{answers.bookTitle}</span>
            </h1>
            <p className="text-[#8b7b6b] mt-3 text-sm max-w-lg mx-auto">
              Based on your answers, here's your personalized step-by-step publishing plan with {essentialCount} essential steps across {totalPhases} phases.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-1.5 bg-white rounded-lg border border-[#e8dfd0] px-3 py-1.5">
              <BookTypeIcon size={14} className="text-[#c9a96e]" />
              <span className="text-xs font-medium text-[#5c3d2e]">{answers.bookType}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white rounded-lg border border-[#e8dfd0] px-3 py-1.5">
              <Printer size={14} className="text-[#c9a96e]" />
              <span className="text-xs font-medium text-[#5c3d2e]">{getFormatLabel(answers.format)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white rounded-lg border border-[#e8dfd0] px-3 py-1.5">
              <Clock size={14} className="text-[#c9a96e]" />
              <span className="text-xs font-medium text-[#5c3d2e]">{getTimelineLabel(answers.timeline)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white rounded-lg border border-[#e8dfd0] px-3 py-1.5">
              <Users size={14} className="text-[#c9a96e]" />
              <span className="text-xs font-medium text-[#5c3d2e]">{answers.authorName}</span>
            </div>
          </div>

          <div className="space-y-3">
            {roadmap.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <Card className="border-[#e8dfd0] hover:border-[#c9a96e]/40 transition-all hover:shadow-sm bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#fdf5e4] border border-[#e8c87a]/40 flex items-center justify-center text-xs font-bold text-[#c9a96e]">
                          {i + 1}
                        </div>
                        {i < roadmap.length - 1 && (
                          <div className="w-px h-4 bg-[#e8dfd0]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <step.icon size={16} className="text-[#c9a96e] shrink-0" />
                          <h3 className="font-serif text-base font-semibold text-[#2c1a00] leading-tight">{step.title}</h3>
                          {getPriorityBadge(step.priority)}
                          <Badge variant="outline" className="text-[10px] text-[#a89880] border-[#e8dfd0]">{step.phase}</Badge>
                        </div>
                        <p className="text-sm text-[#6b5f53] mt-1.5 leading-relaxed">{step.description}</p>
                        {step.toolPath && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-7 text-xs text-[#c9a96e] hover:text-[#8b6914] hover:bg-[#fdf5e4] gap-1 px-2"
                            onClick={() => navigate(step.toolPath!)}
                          >
                            {step.toolLabel} <ChevronRight size={12} />
                          </Button>
                        )}
                        {!step.toolPath && step.toolLabel && (
                          <span className="inline-flex items-center gap-1 mt-2 text-xs text-[#a89880]">
                            <ArrowRight size={10} /> {step.toolLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold gap-2"
              onClick={() => navigate("/")}
            >
              Go to Dashboard <ArrowRight size={16} />
            </Button>
            <Button
              variant="outline"
              className="border-[#d4c8b4] text-[#5c3d2e] gap-2"
              onClick={onReset}
            >
              <RotateCcw size={14} /> Retake Wizard
            </Button>
          </div>

          <p className="text-center text-xs text-[#a89880] mt-6">
            This roadmap is saved to your account. You can retake the wizard anytime to update your plan.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default function GuidedJourney() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [forceWizard, setForceWizard] = useState(false);
  const [completedAnswers, setCompletedAnswers] = useState<WizardAnswers | null>(null);

  const saveMutation = trpc.wizard.saveAnswers.useMutation();
  const existingAnswers = trpc.wizard.getAnswers.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const savedAnswers = existingAnswers.data?.answers as Partial<WizardAnswers> | undefined;
  const hasExistingAnswers = !!savedAnswers?.bookType;

  function handleComplete(answers: WizardAnswers) {
    saveMutation.mutate({ answers: answers as unknown as Record<string, unknown> });
    setCompletedAnswers(answers);
    setForceWizard(false);
  }

  if (authLoading || existingAnswers.isLoading) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full" />
      </div>
    );
  }


  if (completedAnswers && !forceWizard) {
    return (
      <Roadmap
        answers={completedAnswers}
        onReset={() => {
          setCompletedAnswers(null);
          setForceWizard(true);
        }}
      />
    );
  }

  if (hasExistingAnswers && !forceWizard && !completedAnswers) {
    return (
      <Roadmap
        answers={savedAnswers as WizardAnswers}
        onReset={() => {
          setForceWizard(true);
        }}
      />
    );
  }

  return (
    <PublishingWizard
      onComplete={handleComplete}
      onSkip={() => navigate("/")}
      initialAnswers={forceWizard && hasExistingAnswers ? savedAnswers : undefined}
    />
  );
}
