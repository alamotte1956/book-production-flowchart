import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeGate } from "@/components/UpgradeGate";
import EBPProductionWizard from "@/components/EBPProductionWizard";
import RelatedTools from "@/components/RelatedTools";
import SiteFooter from "@/components/SiteFooter";
import {
  ArrowLeft, BookOpen, Heart, BookMarked, PenLine, ZoomIn, Package, Star, Users,
  Columns, Languages, Gift, LayoutGrid, Cross, ClipboardList, Sun, Sparkles, Image,
  HandMetal, NotebookPen, Church, Mic, User, Globe, GraduationCap, Library, Music, Music2,
  ChevronRight, Check, Filter, Search, ArrowRight, Ruler, Layers, HelpCircle,
  Crown, Dumbbell, BookText, BookHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  EBP_TEMPLATES,
  EBP_TEMPLATE_CATEGORIES,
  type EBPTemplate,
  type EBPTemplateCategory,
} from "@shared/ebpTemplates";
type UnifiedTemplate =
  | { source: "book"; data: EBPTemplate };

const ALL_CATEGORIES = [
  ...EBP_TEMPLATE_CATEGORIES,
] as string[];

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BookOpen, Heart, BookMarked, PenLine, ZoomIn, Package, Star, Users,
  Columns, Languages, Gift, LayoutGrid, Cross, ClipboardList, Sun, Sparkles, Image,
  HandMetal, NotebookPen, Church, Mic, User, Globe, GraduationCap, Library, Music, Music2,
  Crown, Dumbbell, BookText, BookHeart,
};

function TemplateIcon({ name, size = 20, className, color }: { name: string; size?: number; className?: string; color?: string }) {
  const Comp = ICON_MAP[name] ?? BookOpen;
  return (
    <span style={{ color, display: "contents" }}>
      <Comp size={size} className={className} />
    </span>
  );
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "Bible Editions":              { bg: "bg-amber-50",   text: "text-amber-800",  border: "border-amber-200",  dot: "bg-amber-500" },
  "Christian Living":            { bg: "bg-purple-50",  text: "text-purple-800", border: "border-purple-200", dot: "bg-purple-500" },
  "Devotionals & Inspiration":  { bg: "bg-rose-50",    text: "text-rose-800",   border: "border-rose-200",   dot: "bg-rose-500" },
  "Children's Christian":        { bg: "bg-sky-50",     text: "text-sky-800",    border: "border-sky-200",    dot: "bg-sky-500" },
  "Prayer & Spiritual Practice": { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200", dot: "bg-indigo-500" },
  "Pastoral & Ministry":        { bg: "bg-blue-50",    text: "text-blue-800",   border: "border-blue-200",   dot: "bg-blue-500" },
  "Christian Biography":         { bg: "bg-orange-50",  text: "text-orange-800", border: "border-orange-200", dot: "bg-orange-500" },
  "Academic & Theological":     { bg: "bg-teal-50",    text: "text-teal-800",   border: "border-teal-200",   dot: "bg-teal-500" },
  "Music & Audio":               { bg: "bg-violet-50",  text: "text-violet-800", border: "border-violet-200", dot: "bg-violet-500" },
  "Inductive Study Bible":      { bg: "bg-amber-50",   text: "text-amber-800",  border: "border-amber-200",  dot: "bg-amber-500" },
  "Recovery Bible":              { bg: "bg-emerald-50", text: "text-emerald-800",border: "border-emerald-200",dot: "bg-emerald-500" },
  "Gift & Devotional":          { bg: "bg-rose-50",    text: "text-rose-800",   border: "border-rose-200",   dot: "bg-rose-500" },
  "Inspirational Gift Book":    { bg: "bg-pink-50",    text: "text-pink-800",   border: "border-pink-200",   dot: "bg-pink-500" },
  "Women's Christian Living":   { bg: "bg-fuchsia-50", text: "text-fuchsia-800",border: "border-fuchsia-200",dot: "bg-fuchsia-500" },
  "Men's Christian Living":     { bg: "bg-slate-50",   text: "text-slate-800",  border: "border-slate-200",  dot: "bg-slate-500" },
  "Prayer & Spiritual Life":    { bg: "bg-indigo-50",  text: "text-indigo-800", border: "border-indigo-200", dot: "bg-indigo-500" },
  "Children's Gift Book":       { bg: "bg-sky-50",     text: "text-sky-800",    border: "border-sky-200",    dot: "bg-sky-500" },
  "Fitness & Health":            { bg: "bg-lime-50",    text: "text-lime-800",   border: "border-lime-200",   dot: "bg-lime-500" },
  "Christian Fiction":           { bg: "bg-cyan-50",    text: "text-cyan-800",   border: "border-cyan-200",   dot: "bg-cyan-500" },
  "Apologetics & Theology":     { bg: "bg-teal-50",    text: "text-teal-800",   border: "border-teal-200",   dot: "bg-teal-500" },
};

const DEFAULT_COLOR = { bg: "bg-gray-50", text: "text-gray-800", border: "border-gray-200", dot: "bg-gray-500" };

function getColors(category: string) {
  return CATEGORY_COLORS[category] ?? DEFAULT_COLOR;
}


function BookTemplateCard({ template, onOpenWizard }: { template: EBPTemplate; onOpenWizard: (t: EBPTemplate) => void }) {
  const [, navigate] = useLocation();

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
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: template.accentColor + "18" }}>
            <TemplateIcon name={template.icon} size={18} color={template.accentColor} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-semibold text-[#3a2a1a] text-sm leading-snug">{template.label}</h3>
              {template.isBible && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#c9a96e]/15 text-[#8b6914] font-medium shrink-0">Bible</span>
              )}
            </div>
            <p className="text-xs text-[#7a6e60] mt-0.5 leading-relaxed">{template.tagline}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4 flex flex-col flex-1 gap-3">
        <p className="text-xs text-[#5c3d2e] leading-relaxed line-clamp-3">{template.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-[11px] text-[#7a6e60]"><span className="font-medium text-[#5c3d2e]">Trim:</span> {template.trimLabel}</span>
          <span className="text-[11px] text-[#7a6e60]"><span className="font-medium text-[#5c3d2e]">Pages:</span> {template.pageCountRange[0]}–{template.pageCountRange[1]}</span>
        </div>
        <ul className="flex flex-col gap-1">
          {template.features.slice(0, 4).map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-[11px] text-[#5c3d2e]">
              <Check size={11} className="shrink-0 text-[#4a6741]" />
              {f}
            </li>
          ))}
          {template.features.length > 4 && (
            <li className="text-[11px] text-[#8b7b6b] pl-4">+{template.features.length - 4} more</li>
          )}
        </ul>
        {template.exampleTitles.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-[#8b7b6b] uppercase tracking-wide mb-1">Similar Published Titles</p>
            <p className="text-[11px] text-[#7a6e60] italic leading-relaxed">
              {template.exampleTitles.slice(0, 2).join(" · ")}
            </p>
          </div>
        )}
        <div className="mt-auto pt-2">
          <Button size="sm" className="w-full text-xs font-medium" style={{ backgroundColor: template.accentColor, color: "#fff" }} onClick={handleUseTemplate}>
            Use This Template
            <ArrowRight size={13} className="ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CategorySection({
  category,
  templates,
  onOpenBookWizard,
}: {
  category: string;
  templates: UnifiedTemplate[];
  onOpenBookWizard: (t: EBPTemplate) => void;
}) {
  const colors = getColors(category);
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
        {templates.map((ut) => (
          <BookTemplateCard key={ut.data.id} template={ut.data} onOpenWizard={onOpenBookWizard} />
        ))}
      </div>
    </section>
  );
}

function TemplatesGate() {
  const { canAccess } = usePlan();
  if (!canAccess("templates")) {
    return <UpgradeGate feature="templates"><span /></UpgradeGate>;
  }
  return <TemplatesInner />;
}

export default TemplatesGate;

function TemplatesInner() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [wizardTemplate, setWizardTemplate] = useState<EBPTemplate | null>(null);

  const allUnified: UnifiedTemplate[] = useMemo(() => [
    ...EBP_TEMPLATES.map((t) => ({ source: "book" as const, data: t })),
  ], []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allUnified.filter((ut) => {
      const cat = ut.data.category;
      if (activeCategory !== "All" && cat !== activeCategory) return false;

      if (!q) return true;
      const t = ut.data;
      return (
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.features.some((f) => f.toLowerCase().includes(q)) ||
        (ut.data as EBPTemplate).exampleTitles?.some((e) => e.toLowerCase().includes(q))
      );
    });
  }, [allUnified, search, activeCategory]);

  const visibleCategories = useMemo(() => {
    const cats = new Set(filtered.map((ut) => ut.data.category));
    return ALL_CATEGORIES.filter((c) => cats.has(c));
  }, [filtered]);

  const groupedByCategory = visibleCategories.map((cat) => ({
    category: cat,
    templates: filtered.filter((ut) => ut.data.category === cat),
  }));

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ut of allUnified) {
      counts[ut.data.category] = (counts[ut.data.category] || 0) + 1;
    }
    return counts;
  }, [allUnified]);

  const totalCount = allUnified.length;

  return (
    <div className="min-h-screen bg-[#f3efe6]">
      <header className="bg-[#1e1108] text-[#ede7d8] border-b border-[#c9a96e]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-[#c9a96e]/80 hover:text-[#c9a96e] text-xs transition-colors">
              <ArrowLeft size={14} />
              Dashboard
            </button>
            <span className="text-[#c9a96e]/20">/</span>
            <span className="text-[#ede7d8] text-sm font-medium">Templates</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Bible Studio", path: "/bible-studio", icon: BookOpen },
              { label: "Spine Calc", path: "/spine-calculator", icon: Ruler },
              { label: "Cover Designer", path: "/cover-designer", icon: Layers },
              { label: "Resources", path: "/resources", icon: Library },
              { label: "Guide", path: "/guide", icon: HelpCircle },
            ].map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)} className="flex items-center gap-1.5 text-xs text-[#c9a96e]/80 hover:text-[#c9a96e] hover:bg-[#c9a96e]/10 px-3 py-1.5 rounded-md transition-all">
                <item.icon size={13} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="bg-gradient-to-b from-[#1e1108] to-[#2a1a0a] text-[#ede7d8] px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG" alt="Easy Book Publishers" className="h-8 w-auto object-contain opacity-80" />
                <span className="text-[#c9a96e]/75 text-xs uppercase tracking-widest">Template Library</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-[#f5d98a] mb-3">Book Templates</h1>
              <p className="text-[#c9a96e]/90 text-sm max-w-2xl leading-relaxed">
                One-click presets for every book type — from Study Bibles and Devotional Bibles to Christian Living books,
                children's titles, theological commentaries, and hymnals. Select a template to pre-fill all formatting settings.
              </p>
            </div>
            <div className="flex gap-6 text-center flex-shrink-0">
              <div>
                <div className="font-serif text-2xl font-bold text-[#f5d98a]">{EBP_TEMPLATES.length}</div>
                <div className="text-xs text-[#c9a96e]/75">Templates</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-bold text-[#f5d98a]">{ALL_CATEGORIES.length}</div>
                <div className="text-xs text-[#c9a96e]/75">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-[#f3efe6]/95 backdrop-blur border-b border-[#e8dfd0] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7b6b]" />
              <Input placeholder="Search templates…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs border-[#e8dfd0] bg-white" />
            </div>

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
              All ({totalCount})
            </button>
            {ALL_CATEGORIES.filter((cat) => (categoryCounts[cat] || 0) > 0).map((cat) => {
              const colors = getColors(cat);
              const count = categoryCounts[cat] || 0;
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

      <main className="max-w-7xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={40} className="mx-auto text-[#d0c8bc] mb-4" />
            <p className="text-[#7a6e60] text-sm">No templates match your search.</p>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="mt-3 text-xs text-[#c9a96e] hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          groupedByCategory.map(({ category, templates }) => (
            <CategorySection key={category} category={category} templates={templates} onOpenBookWizard={setWizardTemplate} />
          ))
        )}

        <Separator className="my-10 bg-[#e8dfd0]" />
        <section className="bg-white rounded-xl border border-[#e8dfd0] p-6 md:p-8">
          <h2 className="font-serif text-lg font-bold text-[#3a2a1a] mb-4">How to Use Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Choose a Template", desc: "Browse the catalog above and click \"Use This Template\" on the book type that matches your project.", color: "bg-[#c9a96e]/15 text-[#8b6914]" },
              { step: "2", title: "Configure in Bible Studio or Auto-Produce", desc: "Bible edition templates open directly in Bible Design Studio with all settings pre-filled. Other templates guide you to Auto-Produce with the correct style selected.", color: "bg-[#7c5cbf]/10 text-[#7c5cbf]" },
              { step: "3", title: "Generate Your Press-Ready Files", desc: "Review the live preview, adjust any settings, then generate your typeset PDF and EPUB files ready for print-on-demand or offset printing.", color: "bg-[#4a6741]/10 text-[#4a6741]" },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${item.color}`}>{item.step}</div>
                <div>
                  <h3 className="font-serif font-semibold text-[#3a2a1a] text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[#7a6e60] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 pt-6 border-t border-[#e8dfd0]">
          <p className="text-xs text-[#8b7b6b] uppercase tracking-wide font-medium mb-3">Related Self-Publishing Tools</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Bible Design Studio", path: "/bible-studio" },
              { label: "Auto-Produce", path: "/auto-produce/0" },
              { label: "ISBN Lookup", path: "/isbn-lookup" },
              { label: "Spine Calculator", path: "/spine-calculator" },
              { label: "Cover Designer", path: "/cover-designer" },
              { label: "Resources Hub", path: "/resources" },
            ].map((link) => (
              <button key={link.path} onClick={() => navigate(link.path)} className="text-xs text-[#c9a96e] hover:text-[#a07840] hover:underline flex items-center gap-1">
                {link.label}
                <ChevronRight size={11} />
              </button>
            ))}
          </div>
        </div>
      </main>

      {wizardTemplate && (
        <EBPProductionWizard template={wizardTemplate} onClose={() => setWizardTemplate(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedTools currentPage="templates" />
      </div>
      <SiteFooter />
    </div>
  );
}
