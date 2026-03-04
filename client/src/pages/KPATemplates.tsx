/**
 * Koechel Peterson & Associates Book Templates
 *
 * A catalog of all books designed by KP&A, organized by category.
 * Each card shows the actual KP&A-designed titles and lets users
 * launch the CDP Production Wizard with the matching template pre-filled.
 */

import { useState } from "react";
import { Link } from "wouter";
import {
  BookOpen,
  Heart,
  Crown,
  Gift,
  Users,
  User,
  Search,
  GraduationCap,
  Dumbbell,
  Image,
  BookText,
  BookHeart,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Badge,
  Sparkles,
} from "lucide-react";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  KPA_TEMPLATES,
  KPA_TEMPLATE_CATEGORIES,
  type KPATemplate,
  type KPATemplateCategory,
} from "@shared/kpaTemplates";
import CDPProductionWizard from "@/components/CDPProductionWizard";
import { getCDPTemplate } from "@shared/cdpTemplates";

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Heart,
  Crown,
  Gift,
  Users,
  User,
  Search,
  GraduationCap,
  Dumbbell,
  Image,
  BookText,
  BookHeart,
};

function TemplateIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] ?? BookOpen;
  return <Icon className={className} />;
}

// ─── Design credit badge ──────────────────────────────────────────────────────

function DesignCreditBadge({
  credit,
}: {
  credit: "cover" | "cover+interior" | "full";
}) {
  const labels = {
    cover: "Cover Design",
    "cover+interior": "Cover + Interior",
    full: "Full Design",
  };
  const colors = {
    cover: "bg-blue-100 text-blue-800 border-blue-200",
    "cover+interior": "bg-purple-100 text-purple-800 border-purple-200",
    full: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${colors[credit]}`}
    >
      {labels[credit]}
    </span>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function KPATemplateCard({
  template,
  onOpenWizard,
}: {
  template: KPATemplate;
  onOpenWizard: (templateId: string) => void;
}) {
  const [titlesOpen, setTitlesOpen] = useState(false);

  return (
    <Card className="flex flex-col border border-border/60 hover:border-border transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: template.accentColor + "20" }}
          >
            <TemplateIcon
              name={template.icon}
              className="w-5 h-5"
              // @ts-ignore - style prop on wrapper div
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            {template.isBible && (
              <UIBadge variant="secondary" className="text-[10px] px-1.5 py-0">
                Bible
              </UIBadge>
            )}
            <UIBadge
              variant="outline"
              className="text-[10px] px-1.5 py-0"
              style={{ borderColor: template.accentColor, color: template.accentColor }}
            >
              {template.category}
            </UIBadge>
          </div>
        </div>
        <CardTitle className="text-base mt-2">{template.label}</CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          {template.tagline}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
        {/* Specs row */}
        <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
          <span className="bg-muted px-2 py-0.5 rounded">{template.trimLabel}</span>
          <span className="bg-muted px-2 py-0.5 rounded">
            {template.pageCountRange[0]}–{template.pageCountRange[1]} pp
          </span>
          <span className="bg-muted px-2 py-0.5 rounded capitalize">
            {template.bindingTypeId.replace(/-/g, " ")}
          </span>
        </div>

        {/* Features */}
        <ul className="space-y-1">
          {template.features.slice(0, 4).map((f) => (
            <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <span
                className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: template.accentColor }}
              />
              {f}
            </li>
          ))}
        </ul>

        {/* KP&A titles collapsible */}
        <Collapsible open={titlesOpen} onOpenChange={setTitlesOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">
              {titlesOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              {template.kpaTitles.length} KP&A title
              {template.kpaTitles.length !== 1 ? "s" : ""}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-2 border-l-2 pl-3" style={{ borderColor: template.accentColor + "40" }}>
              {template.kpaTitles.map((book) => (
                <div key={book.title} className="text-xs">
                  <div className="font-medium text-foreground leading-tight">
                    {book.title}
                  </div>
                  <div className="text-muted-foreground mt-0.5">
                    {book.author} · {book.publisher} · {book.year}
                    {book.pages ? ` · ${book.pages} pp` : ""}
                    {book.isbn ? ` · ISBN: ${book.isbn}` : ""}
                  </div>
                  <div className="mt-0.5">
                    <DesignCreditBadge credit={book.designCredit} />
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <Button
            size="sm"
            className="flex-1 text-xs h-8"
            style={{ backgroundColor: template.accentColor }}
            onClick={() => onOpenWizard(template.id)}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Use This Template
          </Button>
          {template.kpaTitles[0]?.isbn && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 px-2"
              asChild
            >
              <Link href={`/isbn-lookup?isbn=${template.kpaTitles[0].isbn}`}>
                <Search className="w-3 h-3" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────

function CategorySection({
  category,
  templates,
  onOpenWizard,
}: {
  category: KPATemplateCategory;
  templates: KPATemplate[];
  onOpenWizard: (templateId: string) => void;
}) {
  if (templates.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span
          className="w-1 h-5 rounded-full"
          style={{ backgroundColor: templates[0].accentColor }}
        />
        {category}
        <span className="text-sm font-normal text-muted-foreground">
          ({templates.length} template{templates.length !== 1 ? "s" : ""})
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <KPATemplateCard key={t.id} template={t} onOpenWizard={onOpenWizard} />
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KPATemplates() {
  const [activeCategory, setActiveCategory] = useState<KPATemplateCategory | "All">("All");
  const [wizardTemplateId, setWizardTemplateId] = useState<string | null>(null);

  const filteredTemplates =
    activeCategory === "All"
      ? KPA_TEMPLATES
      : KPA_TEMPLATES.filter((t) => t.category === activeCategory);

  // Group by category
  const byCategory = KPA_TEMPLATE_CATEGORIES.map((cat) => ({
    category: cat,
    templates: filteredTemplates.filter((t) => t.category === cat),
  })).filter((g) => g.templates.length > 0);

  const totalTitles = KPA_TEMPLATES.reduce((sum, t) => sum + t.kpaTitles.length, 0);

  // Map KPA template to CDP template for wizard
  const wizardCDPTemplate = wizardTemplateId
    ? (() => {
        const kpa = KPA_TEMPLATES.find((t) => t.id === wizardTemplateId);
        if (!kpa) return null;
        // Try to find a matching CDP template by styleId
        const cdp = getCDPTemplate(
          kpa.isBible ? "study-bible" : kpa.styleId.includes("devotional") ? "daily-devotional" : "christian-living"
        );
        return cdp ?? null;
      })()
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">Koechel Peterson &amp; Associates</h1>
                <UIBadge variant="secondary">Design Firm</UIBadge>
              </div>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Minneapolis-based book design firm (est. 1974) credited with "changing the look
                of Christian publishing." KP&A provided cover design, interior layout, and
                typesetting for Harvest House, Tyndale, Bethany House, Multnomah, Thomas Nelson,
                Precept Ministries, and Bronze Bow Publishing. David Koechel received the ECPA
                Jordan Lifetime Achievement Award in 2011.
              </p>
            </div>
            <div className="flex gap-4 text-center flex-shrink-0">
              <div>
                <div className="text-2xl font-bold text-primary">{KPA_TEMPLATES.length}</div>
                <div className="text-xs text-muted-foreground">Templates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{totalTitles}</div>
                <div className="text-xs text-muted-foreground">KP&A Titles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">8+</div>
                <div className="text-xs text-muted-foreground">Publishers</div>
              </div>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mt-5">
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === "All"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All ({KPA_TEMPLATES.length})
            </button>
            {KPA_TEMPLATE_CATEGORIES.map((cat) => {
              const count = KPA_TEMPLATES.filter((t) => t.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
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
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {byCategory.map(({ category, templates }) => (
          <CategorySection
            key={category}
            category={category}
            templates={templates}
            onOpenWizard={setWizardTemplateId}
          />
        ))}

        {/* Footer note */}
        <div className="border rounded-lg p-4 bg-muted/30 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">About Koechel Peterson &amp; Associates</p>
          <p>
            KP&A operated from Minneapolis, Minnesota for over 30 years. Their work spanned
            cover design, interior typesetting, and full book production for the largest
            Christian publishers in North America. The firm also operated Bronze Bow Publishing
            and Shiloh Road Publishing as imprints, and Lance Wubbels served as VP of Literary
            Development. The templates above reproduce the production specs of actual KP&A-designed
            titles so you can recreate books in the same style.
          </p>
          <div className="mt-3 flex gap-3">
            <Link href="/isbn-lookup">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <Search className="w-3 h-3" />
                ISBN Lookup
              </Button>
            </Link>
            <Link href="/cdp-templates">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <BookOpen className="w-3 h-3" />
                CDP Templates
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* CDP Production Wizard */}
      {wizardTemplateId && wizardCDPTemplate && (
        <CDPProductionWizard
          template={wizardCDPTemplate}
          onClose={() => setWizardTemplateId(null)}
        />
      )}
    </div>
  );
}
