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
  Crown, Dumbbell, BookText, BookHeart, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  EBP_TEMPLATES,
  EBP_TEMPLATE_CATEGORIES,
  getEBPTemplate,
  type EBPTemplate,
  type EBPTemplateCategory,
} from "@shared/ebpTemplates";
import {
  KPA_TEMPLATES,
  KPA_TEMPLATE_CATEGORIES,
  type KPATemplate,
  type KPATemplateCategory,
} from "@shared/kpaTemplates";

type SourceFilter = "all" | "book" | "kpa";

type UnifiedTemplate =
  | { source: "book"; data: EBPTemplate }
  | { source: "kpa"; data: KPATemplate };

const ALL_CATEGORIES = [
  ...EBP_TEMPLATE_CATEGORIES,
  ...KPA_TEMPLATE_CATEGORIES.filter(
    (c) => !EBP_TEMPLATE_CATEGORIES.includes(c as any)
  ),
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

function DesignCreditBadge({ credit }: { credit: "cover" | "cover+interior" | "full" }) {
  const labels = { cover: "Cover Design", "cover+interior": "Cover + Interior", full: "Full Design" };
  const colors = {
    cover: "bg-[#2980b9]/10 text-[#2980b9] border-[#2980b9]/20",
    "cover+interior": "bg-[#7c5cbf]/10 text-[#7c5cbf] border-[#7c5cbf]/20",
    full: "bg-[#4a6741]/10 text-[#4a6741] border-[#4a6741]/20",
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${colors[credit]}`}>
      {labels[credit]}
    </span>
  );
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

function KPATemplateCard({ template, onOpenWizard }: { template: KPATemplate; onOpenWizard: (templateId: string) => void }) {
  const [titlesOpen, setTitlesOpen] = useState(false);

  return (
    <Card className="flex flex-col border border-[#e8dfd0] bg-white hover:border-[#c9a96e]/50 transition-all hover:shadow-md overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: template.accentColor }} />
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: template.accentColor + "20" }}>
            <TemplateIcon name={template.icon} size={18} color={template.accentColor} />
          </div>
          <div className="flex flex-col items-end gap-1">
            {template.isBible && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-[#c9a96e]/15 text-[#8b6914] border-0">Bible</Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-[#7c3aed]/5 text-[#7c3aed] border-[#7c3aed]/30">KP&A</Badge>
          </div>
        </div>
        <CardTitle className="font-serif text-sm mt-2 text-[#3a2a1a]">{template.label}</CardTitle>
        <CardDescription className="text-xs leading-relaxed text-[#7a6e60]">{template.tagline}</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap gap-1.5 text-[11px] text-[#7a6e60]">
          <span className="bg-[#faf6ef] px-2 py-0.5 rounded">{template.trimLabel}</span>
          <span className="bg-[#faf6ef] px-2 py-0.5 rounded">{template.pageCountRange[0]}–{template.pageCountRange[1]} pp</span>
          <span className="bg-[#faf6ef] px-2 py-0.5 rounded capitalize">{template.bindingTypeId.replace(/-/g, " ")}</span>
        </div>
        <ul className="space-y-1">
          {template.features.slice(0, 4).map((f) => (
            <li key={f} className="flex items-start gap-1.5 text-xs text-[#5c3d2e]">
              <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: template.accentColor }} />
              {f}
            </li>
          ))}
        </ul>
        <Collapsible open={titlesOpen} onOpenChange={setTitlesOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-1 text-xs text-[#8b7b6b] hover:text-[#5c3d2e] transition-colors mt-1">
              {titlesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {template.kpaTitles.length} KP&A title{template.kpaTitles.length !== 1 ? "s" : ""}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-2 border-l-2 pl-3" style={{ borderColor: template.accentColor + "40" }}>
              {template.kpaTitles.map((book) => (
                <div key={book.title} className="text-xs">
                  <div className="font-medium text-[#3a2a1a] leading-tight">{book.title}</div>
                  <div className="text-[#7a6e60] mt-0.5">
                    {book.author} · {book.publisher} · {book.year}
                    {book.pages ? ` · ${book.pages} pp` : ""}
                  </div>
                  <div className="mt-0.5"><DesignCreditBadge credit={book.designCredit} /></div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
        <div className="mt-auto pt-2">
          <Button size="sm" className="w-full text-xs h-8 text-white" style={{ backgroundColor: template.accentColor }} onClick={() => onOpenWizard(template.id)}>
            <Sparkles className="w-3 h-3 mr-1" />
            Use This Template
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
  onOpenKPAWizard,
}: {
  category: string;
  templates: UnifiedTemplate[];
  onOpenBookWizard: (t: EBPTemplate) => void;
  onOpenKPAWizard: (templateId: string) => void;
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
        {templates.map((ut) =>
          ut.source === "book" ? (
            <BookTemplateCard key={ut.data.id} template={ut.data} onOpenWizard={onOpenBookWizard} />
          ) : (
            <KPATemplateCard key={ut.data.id} template={ut.data} onOpenWizard={onOpenKPAWizard} />
          )
        )}
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
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [wizardTemplate, setWizardTemplate] = useState<EBPTemplate | null>(null);

  const allUnified: UnifiedTemplate[] = useMemo(() => [
    ...EBP_TEMPLATES.map((t) => ({ source: "book" as const, data: t })),
    ...KPA_TEMPLATES.map((t) => ({ source: "kpa" as const, data: t })),
  ], []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allUnified.filter((ut) => {
      if (sourceFilter === "book" && ut.source !== "book") return false;
      if (sourceFilter === "kpa" && ut.source !== "kpa") return false;

      const cat = ut.data.category;
      if (activeCategory !== "All" && cat !== activeCategory) return false;

      if (!q) return true;
      const t = ut.data;
      return (
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.features.some((f) => f.toLowerCase().includes(q)) ||
        (ut.source === "book" && (ut.data as EBPTemplate).exampleTitles?.some((e) => e.toLowerCase().includes(q))) ||
        (ut.source === "kpa" && (ut.data as KPATemplate).kpaTitles?.some((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)))
      );
    });
  }, [allUnified, search, activeCategory, sourceFilter]);

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
    const sourceFiltered = allUnified.filter((ut) => {
      if (sourceFilter === "book" && ut.source !== "book") return false;
      if (sourceFilter === "kpa" && ut.source !== "kpa") return false;
      return true;
    });
    for (const ut of sourceFiltered) {
      counts[ut.data.category] = (counts[ut.data.category] || 0) + 1;
    }
    return counts;
  }, [allUnified, sourceFilter]);

  const totalCount = sourceFilter === "all" ? allUnified.length : sourceFilter === "book" ? EBP_TEMPLATES.length : KPA_TEMPLATES.length;
  const totalKPATitles = KPA_TEMPLATES.reduce((sum, t) => sum + t.kpaTitles.length, 0);

  const handleOpenKPAWizard = (templateId: string) => {
    const kpa = KPA_TEMPLATES.find((t) => t.id === templateId);
    if (!kpa) return;
    const ebp = getEBPTemplate(
      kpa.isBible ? "study-bible" : kpa.styleId.includes("devotional") ? "daily-devotional" : "christian-living"
    );
    if (ebp) setWizardTemplate(ebp);
  };

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      <header className="bg-[#1e1108] text-[#f5efe0] border-b border-[#c9a96e]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-[#c9a96e]/80 hover:text-[#c9a96e] text-xs transition-colors">
              <ArrowLeft size={14} />
              Dashboard
            </button>
            <span className="text-[#c9a96e]/20">/</span>
            <span className="text-[#f5efe0] text-sm font-medium">Templates</span>
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

      <div className="bg-gradient-to-b from-[#1e1108] to-[#2a1a0a] text-[#f5efe0] px-6 py-10">
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
                children's titles, theological commentaries, and hymnals. Includes both Easy Book Publishers originals
                and Koechel Peterson & Associates (KP&A) design templates. Select a template to pre-fill all formatting settings.
              </p>
            </div>
            <div className="flex gap-6 text-center flex-shrink-0">
              <div>
                <div className="font-serif text-2xl font-bold text-[#f5d98a]">{EBP_TEMPLATES.length + KPA_TEMPLATES.length}</div>
                <div className="text-xs text-[#c9a96e]/75">Templates</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-bold text-[#f5d98a]">{ALL_CATEGORIES.length}</div>
                <div className="text-xs text-[#c9a96e]/75">Categories</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-bold text-[#f5d98a]">{totalKPATitles}</div>
                <div className="text-xs text-[#c9a96e]/75">KP&A Titles</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-[#faf6ef]/95 backdrop-blur border-b border-[#e8dfd0] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7b6b]" />
              <Input placeholder="Search templates…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs border-[#e8dfd0] bg-white" />
            </div>

            <div className="flex items-center bg-[#1e1108]/5 rounded-full p-0.5 gap-0.5">
              {([
                { key: "all" as const, label: "All", count: EBP_TEMPLATES.length + KPA_TEMPLATES.length },
                { key: "book" as const, label: "Book Templates", count: EBP_TEMPLATES.length },
                { key: "kpa" as const, label: "KP&A", count: KPA_TEMPLATES.length },
              ]).map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setSourceFilter(s.key); setActiveCategory("All"); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    sourceFilter === s.key
                      ? "bg-[#1e1108] text-[#f5d98a] shadow-sm"
                      : "text-[#5c3d2e]/70 hover:text-[#5c3d2e]"
                  }`}
                >
                  {s.label} ({s.count})
                </button>
              ))}
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
            <button onClick={() => { setSearch(""); setActiveCategory("All"); setSourceFilter("all"); }} className="mt-3 text-xs text-[#c9a96e] hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          groupedByCategory.map(({ category, templates }) => (
            <CategorySection key={category} category={category} templates={templates} onOpenBookWizard={setWizardTemplate} onOpenKPAWizard={handleOpenKPAWizard} />
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
