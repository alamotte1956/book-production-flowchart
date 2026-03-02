/**
 * WhatsNext — Guided "What's Next?" prompt panel
 *
 * Renders up to 3 contextual next-step cards based on the current project
 * state. Each card shows an icon, title, description, and a direct action
 * button. Designed to be embedded in the dashboard, project tracker, and
 * tool completion banners.
 */

import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Ruler,
  Layers,
  Hash,
  Zap,
  Calendar,
  CheckSquare,
  Download,
  RefreshCw,
  PlusCircle,
  Trophy,
  Library,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import type { NextPrompt, PromptIconKey } from "@shared/prompts";

// ── Icon map ────────────────────────────────────────────────────────────────
const ICON_MAP: Record<PromptIconKey, React.ReactNode> = {
  new_project: <PlusCircle className="w-5 h-5" />,
  bible_studio: <BookOpen className="w-5 h-5" />,
  spine_calc: <Ruler className="w-5 h-5" />,
  cover_designer: <Layers className="w-5 h-5" />,
  isbn: <Hash className="w-5 h-5" />,
  auto_produce: <Zap className="w-5 h-5" />,
  timeline: <Calendar className="w-5 h-5" />,
  resources: <Library className="w-5 h-5" />,
  checklist: <CheckSquare className="w-5 h-5" />,
  download: <Download className="w-5 h-5" />,
  retry: <RefreshCw className="w-5 h-5" />,
  complete: <Trophy className="w-5 h-5" />,
};

// ── Priority colour accents ──────────────────────────────────────────────────
const PRIORITY_STYLES: Record<NextPrompt["priority"], { border: string; iconBg: string; iconColor: string; badge: string }> = {
  high: {
    border: "border-amber-300/60",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  medium: {
    border: "border-[#c9a96e]/40",
    iconBg: "bg-[#f5ede0]",
    iconColor: "text-[#8b6a3e]",
    badge: "bg-[#f5ede0] text-[#8b6a3e]",
  },
  low: {
    border: "border-stone-200",
    iconBg: "bg-stone-100",
    iconColor: "text-stone-500",
    badge: "bg-stone-100 text-stone-500",
  },
};

// ── Single prompt card ───────────────────────────────────────────────────────
function PromptCard({ prompt, index }: { prompt: NextPrompt; index: number }) {
  const [, navigate] = useLocation();
  const styles = PRIORITY_STYLES[prompt.priority];

  return (
    <div
      className={`relative flex gap-4 p-4 rounded-xl border bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${styles.border}`}
    >
      {/* Step number */}
      <div className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-[#2c1810] text-white text-xs font-bold flex items-center justify-center shadow-sm">
        {index + 1}
      </div>

      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${styles.iconBg} ${styles.iconColor}`}>
        {ICON_MAP[prompt.icon]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-semibold text-[#2c1810] leading-snug">{prompt.title}</h4>
          <span className={`flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${styles.badge}`}>
            {prompt.priority}
          </span>
        </div>
        <p className="text-xs text-[#8b7b6b] leading-relaxed mb-3">{prompt.description}</p>
        <Button
          size="sm"
          className="h-7 text-xs bg-[#2c1810] hover:bg-[#3d2415] text-white gap-1.5"
          onClick={() => navigate(prompt.actionRoute)}
        >
          {prompt.actionLabel}
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

// ── Main WhatsNext panel ─────────────────────────────────────────────────────
interface WhatsNextProps {
  prompts: NextPrompt[];
  title?: string;
  compact?: boolean;
  className?: string;
}

export default function WhatsNext({
  prompts,
  title = "What's Next?",
  compact = false,
  className = "",
}: WhatsNextProps) {
  if (prompts.length === 0) return null;

  if (compact) {
    // Compact single-card banner for tool pages
    const primary = prompts[0];
    const styles = PRIORITY_STYLES[primary.priority];
    const [, navigate] = useLocation();
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border ${styles.border} bg-white/80 ${className}`}
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${styles.iconBg} ${styles.iconColor}`}>
          {ICON_MAP[primary.icon]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#2c1810]">{primary.title}</p>
          <p className="text-[11px] text-[#8b7b6b] truncate">{primary.description}</p>
        </div>
        <Button
          size="sm"
          className="flex-shrink-0 h-7 text-xs bg-[#2c1810] hover:bg-[#3d2415] text-white gap-1"
          onClick={() => navigate(primary.actionRoute)}
        >
          {primary.actionLabel}
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-[#c9a96e]/30 bg-gradient-to-br from-[#faf6ef] to-[#f5ede0] p-5 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#2c1810] flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-amber-300" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#2c1810]">{title}</h3>
          <p className="text-[11px] text-[#8b7b6b]">
            {prompts.length === 1
              ? "Your next recommended action"
              : `${prompts.length} recommended actions, in priority order`}
          </p>
        </div>
      </div>

      {/* Prompt cards */}
      <div className="flex flex-col gap-4 mt-2">
        {prompts.map((prompt, i) => (
          <PromptCard key={prompt.id} prompt={prompt} index={i} />
        ))}
      </div>
    </div>
  );
}
