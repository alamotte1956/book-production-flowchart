/**
 * Book Templates
 * A visual catalog of every book type Easy Book Publishers has historically produced.
 * Each card shows the book type, key specs, and a "Use This Template" button that
 * navigates to the appropriate tool with settings pre-filled.
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import CDPProductionWizard from "@/components/CDPProductionWizard";
import {
  ArrowLeft, BookOpen, Heart, BookMarked, PenLine, ZoomIn, Package, Star, Users,
  Columns, Languages, Gift, LayoutGrid, Cross, ClipboardList, Sun, Sparkles, Image,
  HandMetal, NotebookPen, Church, Mic, User, Globe, GraduationCap, Library, Music, Music2,
  ChevronRight, Check, Filter, Search, ArrowRight, Ruler, Layers, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CDP_TEMPLATES,
  CDP_TEMPLATE_CATEGORIES,
  getCDPTemplatesByCategory,
  type CDPTemplate,
  type CDPTemplateCategory,
} from "@shared/cdpTemplates";

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BookOpen, Heart, BookMarked, PenLine, ZoomIn, Package, Star, Users,
  Columns, Languages, Gift, LayoutGrid, Cross, ClipboardList, Sun, Sparkles, Image,
  HandMetal, NotebookPen, Church, Mic, User, Globe, GraduationCap, Library, Music, Music2,
};

function TemplateIcon({ name, size = 20, className, color }: { name: string; size?: number; className?: string; color?: string }) {
  const Comp = ICON_MAP[name] ?? BookOpen;
  return (
    <span style={{ color, display: "contents" }}>
      <Comp size={size} className={className} />
    </span>
  );
}

// ─── Category color map ───────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<CDPTemplateCategory, { bg: string; text: string; border: string; dot: string }> = {
  "Bible Editions":            { bg: "bg-amber-50",   text: "text-amber-800",  border: "border-amber-200",  dot: "bg-amber-500" },
  "Christian Living":          { bg: "bg-purple-50",  text: "text-purple-800", border: "border-purple-200", dot: "bg-purple-500" },
  "Devotionals & Inspiration": { bg: "bg-rose-50",    text: "text-rose-800",   border: "border-rose-200",   dot: "bg-rose-500" },
  "Children's Christian":      { bg: "bg-sky-50",     text: "text-sky-800",    border: "border-sky-200",    dot: "bg-sky-500" },
  "Prayer & Spiritual Practice": { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200", dot: "bg-indigo-500" },
  "Pastoral & Ministry":       { bg: "bg-blue-50",    text: "text-blue-800",   border: "border-blue-200",   dot: "bg-blue-500" },
  "Christian Biography":       { bg: "bg-orange-50",  text: "text-orange-800", border: "border-orange-200", dot: "bg-orange-500" },
  "Academic & Theological":    { bg: "bg-teal-50",    text: "text-teal-800",   border: "border-teal-200",   dot: "bg-teal-500" },
  "Music & Audio":             { bg: "bg-violet-50",  text: "text-violet-800", border: "border-violet-200", dot: "bg-violet-500" },
};

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ template, onOpenWizard }: { template: CDPTemplate; onOpenWizard: (t: CDPTemplate) => void }) {
  const [, navigate] = useLocation();
  const colors = CATEGORY_COLORS[template.category];

  function handleUseTemplate() {
    if (template.isBible) {
      navigate(`/bible-studio?template=${template.id}&edition=${template.bibleEditionTypeId ?? ""}&style=${template.styleId}&trim=${template.trimSizeId}&paper=${template.paperTypeId}&binding=${template.bindingTypeId}`);
    } else {
      navigate(`/auto-produce/0?style=${encodeURIComponent(template.styleId)}&trim=${encodeURIComponent(template.trimSizeId)}&template=${encodeURIComponent(template.label)}`);
    }
  }

  return (
    <Card className="flex flex-col border border-[#e8dfd0] bg-white hover:border-[#c9a96e]/50 hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="h-1 w-full" style={{ backgroundColor: template.accentColor }} />

      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: template.accentColor + "18" }}
          >
            <TemplateIcon name={template.icon} size={18} color={template.accentColor} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-semibold text-[#3a2a1a] text-sm leading-snug">{template.label}</h3>
              {template.isBible && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#c9a96e]/15 text-[#8b6914] font-medium shrink-0">Bible</span>
              )}
            </div>
            <p className="text-xs text-[#8b7b6b] mt-0.5 leading-relaxed">{template.tagline}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-4 flex flex-col flex-1 gap-3">
        <p className="text-xs text-[#5c3d2e] leading-relaxed line-clamp-3">{template.description}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-[11px] text-[#8b7b6b]"><span className="font-medium text-[#5c3d2e]">Trim:</span> {template.trimLabel}</span>
          <span className="text-[11px] text-[#8b7b6b]"><span className="font-medium text-[#5c3d2e]">Pages:</span> {template.pageCountRange[0]}–{template.pageCountRange[1]}</span>
        </div>

        <ul className="flex flex-col gap-1">
          {template.features.slice(0, 4).map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-[11px] text-[#5c3d2e]">
              <Check size={11} className="shrink-0 text-[#4a6741]" />
              {f}
            </li>
          ))}
          {template.features.length > 4 && (
            <li className="text-[11px] text-[#a89880] pl-4">+{template.features.length - 4} more features</li>
          )}
        </ul>

        {template.exampleTitles.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-[#a89880] uppercase tracking-wide mb-1">Similar Published Titles</p>
            <p className="text-[11px] text-[#8b7b6b] italic leading-relaxed">
              {template.exampleTitles.slice(0, 2).join(" · ")}
            </p>
          </div>
        )}

        <div className="mt-auto pt-2">
          <Button
            size="sm"
            className="w-full text-xs font-medium"
            style={{ backgroundColor: template.accentColor, color: "#fff" }}
            onClick={handleUseTemplate}
          >
            Use This Template
            <ArrowRight size={13} className="ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────

function CategorySection({ category, templates, onOpenWizard }: { category: CDPTemplateCategory; templates: CDPTemplate[]; onOpenWizard: (t: CDPTemplate) => void }) {
  const colors = CATEGORY_COLORS[category];
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
        <h2 className="font-serif text-lg font-bold text-[#3a2a1a]">{category}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}>
          {templates.length} template{templates.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} onOpenWizard={onOpenWizard} />
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CDPTemplates() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CDPTemplateCategory | "All">("All");
  const [wizardTemplate, setWizardTemplate] = useState<CDPTemplate | null>(null);

  const filtered = CDP_TEMPLATES.filter((t) => {
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      t.label.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tagline.toLowerCase().includes(q) ||
      t.features.some((f) => f.toLowerCase().includes(q)) ||
      t.exampleTitles.some((e) => e.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const groupedByCategory = CDP_TEMPLATE_CATEGORIES.map((cat) => ({
    category: cat,
    templates: filtered.filter((t) => t.category === cat),
  })).filter((g) => g.templates.length > 0);

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <header className="bg-[#1e1108] text-[#f5efe0] border-b border-[#c9a96e]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-[#c9a96e]/60 hover:text-[#c9a96e] text-xs transition-colors"
            >
              <ArrowLeft size={14} />
              Dashboard
            </button>
            <span className="text-[#c9a96e]/20">/</span>
            <span className="text-[#f5efe0] text-sm font-medium">Book Templates</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Bible Studio", path: "/bible-studio", icon: BookOpen },
              { label: "Spine Calc", path: "/spine-calculator", icon: Ruler },
              { label: "Cover Designer", path: "/cover-designer", icon: Layers },
              { label: "Resources", path: "/resources", icon: Library },
              { label: "Guide", path: "/guide", icon: HelpCircle },
            ].map((item) => (
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
        </div>
      </header>

      {/* Page hero */}
      <div className="bg-gradient-to-b from-[#1e1108] to-[#2a1a0a] text-[#f5efe0] px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG"
              alt="Easy Book Publishers"
              className="h-8 w-auto object-contain opacity-80"
            />
            <span className="text-[#c9a96e]/50 text-xs uppercase tracking-widest">Publishing Catalog</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#f5d98a] mb-3">Book Templates</h1>
          <p className="text-[#c9a96e]/70 text-sm max-w-2xl leading-relaxed">
            One-click presets for every book type Easy Book Publishers has historically produced —
            from Study Bibles and Devotional Bibles to Christian Living books, children's titles,
            theological commentaries, and hymnals. Select a template to pre-fill all formatting settings.
          </p>
          <div className="flex flex-wrap gap-3 mt-5 text-xs text-[#c9a96e]/50">
            <span className="flex items-center gap-1.5"><BookOpen size={12} />{CDP_TEMPLATES.filter(t => t.isBible).length} Bible Edition Templates</span>
            <span className="text-[#c9a96e]/20">·</span>
            <span className="flex items-center gap-1.5"><BookMarked size={12} />{CDP_TEMPLATES.filter(t => !t.isBible).length} Christian Literature Templates</span>
            <span className="text-[#c9a96e]/20">·</span>
            <span className="flex items-center gap-1.5"><Filter size={12} />{CDP_TEMPLATE_CATEGORIES.length} Categories</span>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-[#faf6ef]/95 backdrop-blur border-b border-[#e8dfd0] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89880]" />
            <Input
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs border-[#e8dfd0] bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveCategory("All")}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                activeCategory === "All"
                  ? "bg-[#1e1108] text-[#f5d98a] border-[#1e1108]"
                  : "bg-white text-[#5c3d2e] border-[#e8dfd0] hover:border-[#c9a96e]/50"
              }`}
            >
              All ({CDP_TEMPLATES.length})
            </button>
            {CDP_TEMPLATE_CATEGORIES.map((cat) => {
              const colors = CATEGORY_COLORS[cat];
              const count = CDP_TEMPLATES.filter(t => t.category === cat).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    isActive
                      ? `${colors.bg} ${colors.text} ${colors.border}`
                      : "bg-white text-[#5c3d2e] border-[#e8dfd0] hover:border-[#c9a96e]/50"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={40} className="mx-auto text-[#d0c8bc] mb-4" />
            <p className="text-[#8b7b6b] text-sm">No templates match your search.</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-3 text-xs text-[#c9a96e] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          groupedByCategory.map(({ category, templates }) => (
            <CategorySection key={category} category={category} templates={templates} onOpenWizard={setWizardTemplate} />
          ))
        )}

        {/* How to use section */}
        <Separator className="my-10 bg-[#e8dfd0]" />
        <section className="bg-white rounded-xl border border-[#e8dfd0] p-6 md:p-8">
          <h2 className="font-serif text-lg font-bold text-[#3a2a1a] mb-4">How to Use Book Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Choose a Template",
                desc: "Browse the catalog above and click \"Use This Template\" on the book type that matches your project.",
                color: "bg-[#c9a96e]/15 text-[#8b6914]",
              },
              {
                step: "2",
                title: "Configure in Bible Studio or Auto-Produce",
                desc: "Bible edition templates open directly in Bible Design Studio with all settings pre-filled. Christian literature templates guide you to Auto-Produce with the correct style selected.",
                color: "bg-[#7c5cbf]/10 text-[#7c5cbf]",
              },
              {
                step: "3",
                title: "Generate Your Press-Ready Files",
                desc: "Review the live preview, adjust any settings, then generate your typeset PDF and EPUB files ready for print-on-demand or offset printing.",
                color: "bg-[#4a6741]/10 text-[#4a6741]",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${item.color}`}>
                  {item.step}
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-[#3a2a1a] text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[#8b7b6b] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related tools backlinks */}
        <div className="mt-8 pt-6 border-t border-[#e8dfd0]">
          <p className="text-xs text-[#a89880] uppercase tracking-wide font-medium mb-3">Related Self-Publishing Tools</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Bible Design Studio", path: "/bible-studio" },
              { label: "Auto-Produce", path: "/" },
              { label: "ISBN Lookup", path: "/isbn-lookup" },
              { label: "Spine Calculator", path: "/spine-calculator" },
              { label: "Cover Designer", path: "/cover-designer" },
              { label: "Resources Hub", path: "/resources" },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="text-xs text-[#c9a96e] hover:text-[#a07840] hover:underline flex items-center gap-1"
              >
                {link.label}
                <ChevronRight size={11} />
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* CDP Production Wizard modal */}
      {wizardTemplate && (
        <CDPProductionWizard
          template={wizardTemplate}
          onClose={() => setWizardTemplate(null)}
        />
      )}
    </div>
  );
}
