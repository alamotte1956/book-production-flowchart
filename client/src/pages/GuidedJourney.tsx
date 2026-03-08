import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublishingWizard, { type WizardAnswers } from "@/components/PublishingWizard";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, FileText, Layers, Ruler, BookMarked, Zap, Calendar, Library,
  ArrowRight, Clock, Sparkles, ChevronRight,
  Printer, Globe, Users, GraduationCap, Baby, Heart, Feather,
} from "lucide-react";

type RoadmapStep = {
  title: string;
  description: string;
  icon: typeof BookOpen;
  toolPath?: string;
  toolLabel?: string;
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
      phase: "Manuscript",
    });
  }

  if (isFirstTime) {
    steps.push({
      title: "Explore the User Guide",
      description: "As a first-time publisher, start with our User Guide to understand the 30-step production workflow from manuscript to shelf.",
      icon: BookOpen,
      toolPath: "/guide",
      toolLabel: "Open User Guide",
      phase: "Getting Started",
    });
  }

  steps.push({
    title: "Create Your Book Project",
    description: `Set up a new project for "${answers.bookTitle}" and start tracking your production progress across all phases.`,
    icon: FileText,
    toolPath: "/dashboard",
    toolLabel: "Go to Dashboard",
    phase: "Setup",
  });

  if (isBible) {
    steps.push({
      title: "Configure Bible Edition Specs",
      description: "Use Bible Design Studio to configure your edition type, translation, trim size, paper stock, binding, and typesetting style.",
      icon: BookOpen,
      toolPath: "/bible-studio",
      toolLabel: "Open Bible Studio",
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
      phase: "Design",
    });

    steps.push({
      title: "Design Your Cover",
      description: "Generate full-wrap cover dimensions with bleed, safe zones, and a print-ready spec sheet for your cover designer.",
      icon: Layers,
      toolPath: "/cover-designer",
      toolLabel: "Open Cover Designer",
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
    toolPath: "/auto-produce",
    toolLabel: "Start Auto-Produce",
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
      phase: "Metadata",
    });
  } else {
    steps.push({
      title: "Set Up Book Metadata",
      description: "Configure your ISBN, BISAC codes, LCCN, and export ONIX 3.0 XML for distributors like IngramSpark and Amazon.",
      icon: BookMarked,
      toolPath: "/isbn-manager",
      toolLabel: "Open ISBN Manager",
      phase: "Metadata",
    });
  }

  if (isChildrens) {
    steps.push({
      title: "Coordinate Illustration & Layout",
      description: "Children's books need tight coordination between illustrations and text. Plan your page spreads and illustration briefs early.",
      icon: Layers,
      phase: "Design",
    });
  }

  steps.push({
    title: "Set Production Timeline",
    description: answers.timeline === "asap"
      ? "You're on a tight schedule. Set up your production timeline with aggressive but achievable milestones."
      : `You have ${answers.timeline === "1-3-months" ? "1–3 months" : answers.timeline === "3-6-months" ? "3–6 months" : "6+ months"}. Set phase deadlines to stay on track.`,
    icon: Calendar,
    toolPath: "/timeline",
    toolLabel: "Open Timeline",
    phase: "Planning",
  });

  steps.push({
    title: "Browse Publishing Resources",
    description: "Explore 43 curated tools across every production phase — from writing software to distribution platforms.",
    icon: Library,
    toolPath: "/resources",
    toolLabel: "Open Resources Hub",
    phase: "Resources",
  });

  steps.push({
    title: "Browse Book Templates",
    description: "Check out production templates from Easy Book Publishers to find the right starting point for your book type.",
    icon: Globe,
    toolPath: "/templates",
    toolLabel: "Browse Templates",
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

function Roadmap({ answers }: { answers: WizardAnswers }) {
  const [, navigate] = useLocation();
  const roadmap = generateRoadmap(answers);
  const [currentStep, setCurrentStep] = useState(0);
  const BookTypeIcon = getBookTypeIcon(answers.bookType);

  const step = roadmap[currentStep];
  const isLastStep = currentStep === roadmap.length - 1;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#fdf5e4] border border-[#e8c87a]/40 rounded-full px-4 py-1.5 mb-4">
              <Sparkles size={14} className="text-[#c9a96e]" />
              <span className="text-xs font-semibold text-[#8b6914]">Your Publishing Roadmap</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-[#2c1a00] leading-tight">
              {answers.bookTitle}
            </h1>
            <p className="text-[#7a6e60] mt-2 text-sm">
              Step {currentStep + 1} of {roadmap.length}
            </p>
          </div>

          <div className="mb-6">
            <div className="h-2 bg-[#e8dfd0] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#c9a96e] rounded-full"
                animate={{ width: `${((currentStep + 1) / roadmap.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex items-center justify-center gap-1 mt-3">
              {roadmap.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i < currentStep ? "w-2.5 h-2.5 bg-[#c9a96e]" :
                    i === currentStep ? "w-5 h-2.5 bg-[#c9a96e]" :
                    "w-2.5 h-2.5 bg-[#e8dfd0]"
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <Card className="border-[#e8dfd0] bg-white shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#fdf5e4] border border-[#e8c87a]/40 flex items-center justify-center mx-auto mb-5">
                      <step.icon size={28} className="text-[#c9a96e]" />
                    </div>

                    <Badge variant="outline" className="text-[10px] text-[#8b7b6b] border-[#e8dfd0] mb-3">{step.phase}</Badge>

                    <h2 className="font-serif text-2xl text-[#2c1a00] font-semibold mb-3">{step.title}</h2>
                    <p className="text-sm text-[#6b5f53] leading-relaxed max-w-md mx-auto mb-8">{step.description}</p>

                    {step.toolPath && (
                      <Button
                        className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold gap-2 mb-4 w-full max-w-xs mx-auto"
                        onClick={() => navigate(step.toolPath!)}
                      >
                        {step.toolLabel} <ArrowRight size={16} />
                      </Button>
                    )}

                    <div className="pt-4 border-t border-[#f0e8d8]">
                      {!isLastStep ? (
                        <Button
                          variant="ghost"
                          className="text-[#c9a96e] hover:text-[#8b6914] hover:bg-[#fdf5e4] gap-2 font-semibold"
                          onClick={() => setCurrentStep(s => s + 1)}
                        >
                          Next Step <ChevronRight size={16} />
                        </Button>
                      ) : (
                        <Button
                          className="bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold gap-2"
                          onClick={() => navigate("/dashboard")}
                        >
                          Go to Dashboard <ArrowRight size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6 px-2">
            <div className="flex items-center gap-2 text-xs text-[#8b7b6b]">
              <BookTypeIcon size={14} className="text-[#c9a96e]" />
              <span>{answers.bookType}</span>
              <span className="text-[#d4c8b4]">·</span>
              <Printer size={14} className="text-[#c9a96e]" />
              <span>{getFormatLabel(answers.format)}</span>
              <span className="text-[#d4c8b4]">·</span>
              <Clock size={14} className="text-[#c9a96e]" />
              <span>{getTimelineLabel(answers.timeline)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default function GuidedJourney() {
  const { isAuthenticated, loading: authLoading } = useAuth();
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
  }

  if (authLoading || existingAnswers.isLoading) {
    return (
      <div className="min-h-screen bg-[#f3efe6] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (completedAnswers) {
    return <Roadmap answers={completedAnswers} />;
  }

  if (hasExistingAnswers) {
    return <Roadmap answers={savedAnswers as WizardAnswers} />;
  }

  return (
    <PublishingWizard
      onComplete={handleComplete}
    />
  );
}
