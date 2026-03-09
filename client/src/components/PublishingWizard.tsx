import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Zap, FileText, Users, Clock, Tag, Printer,
  ChevronRight, Check, BookMarked, Feather,
  GraduationCap, Heart, Baby, Globe, Sparkles, Briefcase, Rocket,
} from "lucide-react";

export type WizardAnswers = {
  pathway: string;
  bookType: string;
  bookTitle: string;
  authorName: string;
  experience: string;
  manuscriptStatus: string;
  format: string;
  hasIsbn: string;
  audience: string;
  timeline: string;
};

type Props = {
  onComplete: (answers: WizardAnswers) => void;
  initialAnswers?: Partial<WizardAnswers>;
};

type Option = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
};

const BOOK_TYPES: Option[] = [
  { id: "Bible / Scripture", label: "Bible / Scripture", description: "A Bible edition, devotional Bible, or scripture-based publication", icon: BookOpen, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "Novel / Fiction", label: "Novel / Fiction", description: "A story-driven book — literary fiction, genre fiction, short stories", icon: Feather, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { id: "Non-Fiction", label: "Non-Fiction", description: "How-to guides, self-help, business, history, biography", icon: FileText, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "Children's Book", label: "Children's Book", description: "Picture books, early readers, middle-grade fiction", icon: Baby, color: "text-pink-600 bg-pink-50 border-pink-200" },
  { id: "Poetry / Anthology", label: "Poetry / Anthology", description: "A collection of poems, essays, or curated works", icon: Sparkles, color: "text-rose-600 bg-rose-50 border-rose-200" },
  { id: "Memoir / Biography", label: "Memoir / Biography", description: "A personal story, autobiography, or life history", icon: Heart, color: "text-orange-600 bg-orange-50 border-orange-200" },
  { id: "Textbook / Academic", label: "Textbook / Academic", description: "Educational materials, academic papers, course books", icon: GraduationCap, color: "text-green-600 bg-green-50 border-green-200" },
  { id: "Other", label: "Other", description: "Cookbooks, travel guides, art books, or something unique", icon: Globe, color: "text-slate-600 bg-slate-50 border-slate-200" },
];

const EXPERIENCE_OPTIONS: Option[] = [
  { id: "first-time", label: "First-Time Publisher", description: "I've never published a book before — I need guidance on every step", icon: Sparkles, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "some-experience", label: "Some Experience", description: "I've published before but want help managing this project professionally", icon: BookMarked, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "professional", label: "Publishing Professional", description: "I work in publishing and want a production management platform", icon: GraduationCap, color: "text-purple-600 bg-purple-50 border-purple-200" },
];

const MANUSCRIPT_OPTIONS: Option[] = [
  { id: "ready", label: "Manuscript is Ready", description: "My text is complete and edited — I'm ready to move into production", icon: Check, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "in-progress", label: "Still Writing", description: "I'm working on the manuscript and want to plan production in parallel", icon: Feather, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "not-started", label: "Haven't Started Yet", description: "I have an idea but haven't written anything — I want to plan ahead", icon: Sparkles, color: "text-amber-600 bg-amber-50 border-amber-200" },
];

const FORMAT_OPTIONS: Option[] = [
  { id: "print", label: "Print Book", description: "A physical book — paperback, hardcover, or specialty binding", icon: BookOpen, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "ebook", label: "eBook Only", description: "A digital edition for Kindle, Apple Books, or PDF distribution", icon: Zap, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "both", label: "Print + eBook", description: "Both formats — maximize your reach across all channels", icon: Globe, color: "text-purple-600 bg-purple-50 border-purple-200" },
];

const ISBN_OPTIONS: Option[] = [
  { id: "have-isbn", label: "I Already Have an ISBN", description: "I've purchased an ISBN and I'm ready to assign it to this book", icon: Tag, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "need-isbn", label: "I Need to Get an ISBN", description: "I know what an ISBN is but haven't purchased one yet", icon: BookMarked, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "what-is-isbn", label: "What's an ISBN?", description: "I'm not sure — explain it to me and help me decide what I need", icon: Sparkles, color: "text-amber-600 bg-amber-50 border-amber-200" },
];

const AUDIENCE_OPTIONS: Option[] = [
  { id: "general", label: "General Readers", description: "Adults reading for pleasure, information, or personal growth", icon: Users, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "children", label: "Children & Young Adults", description: "Readers aged 0–18, including picture book audiences", icon: Baby, color: "text-pink-600 bg-pink-50 border-pink-200" },
  { id: "academic", label: "Academic / Professional", description: "Students, researchers, educators, or industry professionals", icon: GraduationCap, color: "text-green-600 bg-green-50 border-green-200" },
  { id: "religious", label: "Religious / Faith Community", description: "Church congregations, Bible study groups, ministry audiences", icon: BookOpen, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "other", label: "Niche / Specialty", description: "A specific community — hobbyists, collectors, local history readers", icon: Globe, color: "text-slate-600 bg-slate-50 border-slate-200" },
];

const TIMELINE_OPTIONS: Option[] = [
  { id: "asap", label: "As Soon as Possible", description: "I want to publish within the next 4–6 weeks", icon: Zap, color: "text-red-600 bg-red-50 border-red-200" },
  { id: "1-3-months", label: "1–3 Months", description: "I have a few months to work through the production process carefully", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "3-6-months", label: "3–6 Months", description: "I want to take my time and do this right", icon: Feather, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "6-plus-months", label: "6+ Months", description: "This is a long-term project — I'm planning well in advance", icon: BookOpen, color: "text-purple-600 bg-purple-50 border-purple-200" },
];

const PATHWAY_OPTIONS: Option[] = [
  { id: "professional", label: "Publishing Professional", description: "I need the full production workflow — editorial, design, typesetting, proofing, distribution, and project management tools", icon: Briefcase, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { id: "kdp-self-publish", label: "Self-Publish on Amazon KDP", description: "I have a finished manuscript and just need it formatted into a KDP-ready PDF and EPUB so I can publish on Amazon", icon: Rocket, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

type StepDef = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
};

const ALL_STEPS: StepDef[] = [
  { id: "pathway", title: "How can we help you?", subtitle: "Choose the path that best describes what you need. We'll tailor everything to fit.", icon: Sparkles },
  { id: "book-type", title: "What do you want to publish?", subtitle: "Choose the type of book you're creating. This helps us tailor every step of your journey.", icon: BookOpen },
  { id: "book-details", title: "Tell us about your book", subtitle: "A working title and your name — you can always change these later.", icon: Feather },
  { id: "experience", title: "What's your publishing experience?", subtitle: "This helps us calibrate how much guidance to give you at each step.", icon: GraduationCap },
  { id: "manuscript", title: "Where is your manuscript right now?", subtitle: "Knowing your manuscript status helps us show you the right first steps.", icon: FileText },
  { id: "format", title: "What format do you want to publish in?", subtitle: "Your format choice affects design, pricing, distribution, and the tools you'll use.", icon: Printer },
  { id: "isbn", title: "Do you have an ISBN?", subtitle: "An ISBN is a unique identifier required by most retailers and libraries.", icon: Tag },
  { id: "audience", title: "Who is your target audience?", subtitle: "Your audience shapes everything from trim size to marketing strategy.", icon: Users },
  { id: "timeline", title: "What's your publishing timeline?", subtitle: "We'll build your production schedule around your target launch date.", icon: Clock },
];

function getStepsForPathway(pathway: string): StepDef[] {
  if (pathway === "kdp-self-publish") {
    return ALL_STEPS.filter(s =>
      ["pathway", "book-type", "book-details", "format", "isbn", "timeline"].includes(s.id)
    );
  }
  return ALL_STEPS;
}

function OptionGrid({ options, selected, onSelect }: { options: Option[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={`text-left rounded-xl border-2 p-4 transition-all group ${
            selected === opt.id
              ? "border-[#c9a96e] bg-[#fdf5e4] shadow-md"
              : "border-[#e8dfd0] bg-white hover:border-[#c9a96e]/50 hover:shadow-sm"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${opt.color}`}>
              <opt.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-[#3a2a1a] leading-tight">{opt.label}</p>
                {selected === opt.id && (
                  <div className="w-5 h-5 rounded-full bg-[#c9a96e] flex items-center justify-center shrink-0 ml-2">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </div>
              <p className="text-xs text-[#7a6e60] mt-0.5 leading-relaxed">{opt.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function PublishingWizard({ onComplete, initialAnswers }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({
    pathway: initialAnswers?.pathway ?? "",
    bookType: initialAnswers?.bookType ?? "",
    bookTitle: initialAnswers?.bookTitle ?? "",
    authorName: initialAnswers?.authorName ?? "",
    experience: initialAnswers?.experience ?? "",
    manuscriptStatus: initialAnswers?.manuscriptStatus ?? "",
    format: initialAnswers?.format ?? "",
    hasIsbn: initialAnswers?.hasIsbn ?? "",
    audience: initialAnswers?.audience ?? "",
    timeline: initialAnswers?.timeline ?? "",
  });

  const steps = getStepsForPathway(answers.pathway);
  const totalSteps = steps.length;
  const currentStep = steps[step];
  const progress = ((step + 1) / totalSteps) * 100;

  function canAdvanceForStep(stepId: string) {
    switch (stepId) {
      case "pathway": return !!answers.pathway;
      case "book-type": return !!answers.bookType;
      case "book-details": return !!answers.bookTitle.trim() && !!answers.authorName.trim();
      case "experience": return !!answers.experience;
      case "manuscript": return !!answers.manuscriptStatus;
      case "format": return !!answers.format;
      case "isbn": return !!answers.hasIsbn;
      case "audience": return !!answers.audience;
      case "timeline": return !!answers.timeline;
      default: return false;
    }
  }

  function canAdvance() {
    return currentStep ? canAdvanceForStep(currentStep.id) : false;
  }

  function goNext() {
    if (!canAdvance()) return;
    if (currentStep.id === "pathway") {
      if (answers.pathway === "kdp-self-publish") {
        setAnswers(a => ({
          ...a,
          experience: "first-time",
          manuscriptStatus: "ready",
          audience: "general",
        }));
      }
      setStep(1);
      return;
    }
    if (step === totalSteps - 1) {
      onComplete(answers);
      return;
    }
    setStep(s => s + 1);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3efe6] via-[#f5ede0] to-[#f3efe6] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG"
              alt="Easy Book Publishers"
              className="w-7 h-7 rounded-md object-cover"
            />
            <span className="font-serif text-lg text-[#5c3d2e]">Easy Book Publishers</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#2c1a00] leading-tight">
            Let's Publish Your Book
          </h1>
          <p className="text-[#7a6e60] mt-2 text-sm">
            Answer a few quick questions and we'll build your personalized publishing roadmap.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-[#8b7b6b] mb-2">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-[#e8dfd0] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#c9a96e] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`rounded-full transition-all duration-300 ${
                  i < step ? "w-2 h-2 bg-[#c9a96e]" :
                  i === step ? "w-4 h-2 bg-[#c9a96e]" :
                  "w-2 h-2 bg-[#e8dfd0]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8dfd0] shadow-lg overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#fdf5e4] border border-[#e8c87a]/40 flex items-center justify-center shrink-0">
                  <currentStep.icon size={20} className="text-[#c9a96e]" />
                </div>
                <div>
                  <h2 className="font-serif text-xl text-[#2c1a00] leading-tight">{currentStep.title}</h2>
                  <p className="text-xs text-[#7a6e60] mt-0.5">{currentStep.subtitle}</p>
                </div>
              </div>

              {currentStep.id === "pathway" && (
                <OptionGrid options={PATHWAY_OPTIONS} selected={answers.pathway} onSelect={v => setAnswers(a => ({ ...a, pathway: v }))} />
              )}

              {currentStep.id === "book-type" && (
                <OptionGrid options={BOOK_TYPES} selected={answers.bookType} onSelect={v => setAnswers(a => ({ ...a, bookType: v }))} />
              )}

              {currentStep.id === "book-details" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#5c3d2e] mb-1.5">Working Title</label>
                    <Input
                      value={answers.bookTitle}
                      onChange={e => setAnswers(a => ({ ...a, bookTitle: e.target.value }))}
                      placeholder="e.g., The Grace Study Bible, My First Novel…"
                      className="border-[#d4c8b4] text-[#3a2a1a] placeholder:text-[#c0b09a]"
                      autoFocus
                    />
                    <p className="text-xs text-[#8b7b6b] mt-1">This is just a working title — you can change it anytime.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5c3d2e] mb-1.5">Author Name</label>
                    <Input
                      value={answers.authorName}
                      onChange={e => setAnswers(a => ({ ...a, authorName: e.target.value }))}
                      placeholder="e.g., Jane Smith, First Baptist Church…"
                      className="border-[#d4c8b4] text-[#3a2a1a] placeholder:text-[#c0b09a]"
                    />
                    <p className="text-xs text-[#8b7b6b] mt-1">Can be a person, organization, or ministry name.</p>
                  </div>
                </div>
              )}

              {currentStep.id === "experience" && (
                <OptionGrid options={EXPERIENCE_OPTIONS} selected={answers.experience} onSelect={v => setAnswers(a => ({ ...a, experience: v }))} />
              )}

              {currentStep.id === "manuscript" && (
                <OptionGrid options={MANUSCRIPT_OPTIONS} selected={answers.manuscriptStatus} onSelect={v => setAnswers(a => ({ ...a, manuscriptStatus: v }))} />
              )}

              {currentStep.id === "format" && (
                <OptionGrid options={FORMAT_OPTIONS} selected={answers.format} onSelect={v => setAnswers(a => ({ ...a, format: v }))} />
              )}

              {currentStep.id === "isbn" && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#fdf5e4] border border-[#e8c87a]/40 p-4 text-sm text-[#5c3d2e]">
                    <p className="font-semibold mb-1">What is an ISBN?</p>
                    <p className="text-xs text-[#7a6e60] leading-relaxed">
                      An <strong>International Standard Book Number (ISBN)</strong> is a 13-digit code that uniquely identifies your book. 
                      Most bookstores, libraries, and online retailers (Amazon, Barnes & Noble, IngramSpark) require one. 
                      In the US, ISBNs are purchased from <strong>Bowker (myidentifiers.com)</strong>. A single ISBN costs $125; a block of 10 costs $295.
                    </p>
                  </div>
                  <OptionGrid options={ISBN_OPTIONS} selected={answers.hasIsbn} onSelect={v => setAnswers(a => ({ ...a, hasIsbn: v }))} />
                </div>
              )}

              {currentStep.id === "audience" && (
                <OptionGrid options={AUDIENCE_OPTIONS} selected={answers.audience} onSelect={v => setAnswers(a => ({ ...a, audience: v }))} />
              )}

              {currentStep.id === "timeline" && (
                <OptionGrid options={TIMELINE_OPTIONS} selected={answers.timeline} onSelect={v => setAnswers(a => ({ ...a, timeline: v }))} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="px-6 md:px-8 pb-6 flex items-center justify-end border-t border-[#f0e8d8] pt-5">
            <Button
              onClick={goNext}
              disabled={!canAdvance()}
              className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#2a1a0a] font-semibold gap-1.5 disabled:opacity-40"
            >
              {step === totalSteps - 1 ? (
                <>Build My Roadmap <Sparkles size={16} /></>
              ) : (
                <>Continue <ChevronRight size={16} /></>
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-[#8b7b6b] mt-4">
          Your answers are saved to your account and used only to personalize your publishing roadmap.
        </p>
      </div>
    </div>
  );
}
