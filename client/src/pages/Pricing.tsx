import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, BookOpen, Zap, HelpCircle, Loader2, Rocket } from "lucide-react";
import { useLocation } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";
import CheckoutGate from "@/components/CheckoutGate";

type BillingCycle = "monthly" | "annual";

const PLAN_NAME_MAP: Record<string, string> = {
  "Author Pro": "author_pro",
  "KDP Ready": "kdp_ready",
};

const tiers = [
  {
    name: "KDP Ready",
    monthly: "$29.99",
    annual: "$19.99",
    period: { monthly: "/month", annual: "/mo (billed annually)" },
    description: "New author with a finished manuscript? Upload, pick a template, get KDP-ready files for your new book. Replaces Atticus at a fraction of the cost.",
    icon: Rocket,
    cta: "Get KDP Ready",
    ctaVariant: "default" as const,
    highlight: false,
    badge: "Self-Publishers",
    features: [
      { name: "1 book project", included: true },
      { name: "AI typesetting (PDF + EPUB)", included: true },
      { name: "Amazon KDP-ready PDF export", included: true },
      { name: "Review & approval workflow", included: true },
      { name: "40+ book templates", included: true },
      { name: "Spine calculator", included: true },
      { name: "Cover spec designer", included: true },
      { name: "ISBN & ONIX 3.0 metadata", included: true },
      { name: "ISBN barcode generator", included: true },
      { name: "Royalty calculator", included: true },
      { name: "30+ manuscript formats accepted", included: true },
      { name: "Works on any device (browser-based)", included: true },
      { name: "No per-sale commission (unlike D2D)", included: true },
      { name: "30-step production workflow", included: false },
      { name: "Unlimited book projects", included: false },
      { name: "InDesign IDML export", included: false },
      { name: "Marketing toolkit", included: false },
      { name: "Pre-launch page", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    name: "Author Pro",
    monthly: "$59.99",
    annual: "$39.99",
    period: { monthly: "/month", annual: "/mo (billed annually)" },
    description: "The complete new author toolkit. Everything in Atticus + Vellum combined — for less than either one alone. Publish your new book like a pro.",
    icon: Zap,
    cta: "Get Author Pro",
    ctaVariant: "default" as const,
    highlight: true,
    badge: "Most Popular",
    features: [
      { name: "Unlimited book projects", included: true },
      { name: "AI typesetting (PDF + EPUB)", included: true },
      { name: "Amazon KDP-ready PDF export", included: true },
      { name: "Review & approval workflow", included: true },
      { name: "InDesign IDML export (exclusive)", included: true },
      { name: "40+ book templates", included: true },
      { name: "30-step production workflow", included: true },
      { name: "Production timeline & milestones", included: true },
      { name: "Marketing toolkit & sell sheets", included: true },
      { name: "Pre-launch book page", included: true },
      { name: "Distribution channel guide", included: true },
      { name: "Royalty calculator", included: true },
      { name: "ISBN barcode generator", included: true },
      { name: "File versioning & comparison", included: true },
      { name: "Bible Design Studio", included: true },
      { name: "Spine calculator + cover designer", included: true },
      { name: "ISBN & ONIX 3.0 metadata", included: true },
      { name: "Print spec generator", included: true },
      { name: "30+ manuscript formats accepted", included: true },
      { name: "Works on any device (browser-based)", included: true },
      { name: "No per-sale commission", included: true },
      { name: "Priority support", included: false },
    ],
  },
];

const comparisonFeatures: Array<{ name: string; tooltip?: string; kdp: string | boolean; author: string | boolean }> = [
  { name: "Book Projects", kdp: "1", author: "Unlimited" },
  { name: "Production Workflow", kdp: false, author: "30 steps" },
  { name: "Cross-Platform Access", tooltip: "Works on any device with a browser — Windows, Mac, Linux, Chromebook, iPad", kdp: true, author: true },
  { name: "Manuscript Import", tooltip: "Accept 26 formats including DOCX, PDF, TXT, RTF, and more", kdp: true, author: true },
  { name: "Bible Design Studio", kdp: false, author: true },
  { name: "Spine Calculator", kdp: true, author: true },
  { name: "Cover Spec Designer", kdp: true, author: true },
  { name: "Print Spec Generator", kdp: false, author: true },
  { name: "ISBN & ONIX 3.0 Metadata", tooltip: "Full ISBN management and ONIX 3.0 XML export for retailers", kdp: true, author: true },
  { name: "Publishing Resources Hub", kdp: false, author: true },
  { name: "Guided Publishing Journey", kdp: true, author: true },
  { name: "AI Typesetting Engine", tooltip: "Automated book layout with professional styles — like Atticus + Vellum combined", kdp: true, author: true },
  { name: "PDF Export (Screen)", kdp: true, author: true },
  { name: "EPUB 3 Export", tooltip: "Standard EPUB 3 compatible with all major retailers", kdp: true, author: true },
  { name: "Amazon KDP-Ready PDF", tooltip: "Print-ready PDF with bleed, gutter, and trim marks per Amazon specs", kdp: true, author: true },
  { name: "InDesign IDML Export", tooltip: "Export to Adobe InDesign format for advanced customization — competitors don't offer this", kdp: false, author: true },
  { name: "40+ Book Templates", tooltip: "Professional templates with customizable styles and trim presets", kdp: true, author: true },
  { name: "Review & Approval Workflow", tooltip: "Preview PDFs inline, add comments, approve or request changes", kdp: true, author: true },
  { name: "ISBN Barcode Generator", tooltip: "Generate EAN-13 barcodes from ISBN-13 with optional price extension", kdp: true, author: true },
  { name: "Royalty Calculator", tooltip: "Compare royalties across KDP, IngramSpark, and direct sales channels", kdp: true, author: true },
  { name: "Marketing Toolkit", tooltip: "Sell sheets, social media graphics, and press kit builder", kdp: false, author: true },
  { name: "Pre-Launch Book Page", tooltip: "Public shareable page with email signup for launch notifications", kdp: false, author: true },
  { name: "Distribution Channel Guide", tooltip: "Comprehensive comparison of Amazon KDP, IngramSpark, B&N, Apple Books, and more", kdp: false, author: true },
  { name: "File Versioning", tooltip: "Track all production versions with side-by-side comparison", kdp: false, author: true },
  { name: "Production Timeline", tooltip: "Gantt chart and deadline tracking for all 30 steps", kdp: false, author: true },
];

const competitors = [
  { name: "Atticus", price: "$147 one-time", scope: "Writing + formatting only. No IDML, no ONIX, no workflow management, no marketing tools. Desktop app." },
  { name: "Vellum", price: "$249.99 one-time", scope: "Formatting only. Mac-only — no Windows, no Linux, no Chromebook. No IDML, no marketing, no distribution guide." },
  { name: "Draft2Digital", price: "Free + 10% of every sale", scope: "Basic formatting. Takes 10% of your royalties on every sale — forever. No typesetting control." },
  { name: "BookBaby", price: "$1,090–$2,890 per book", scope: "Full-service, per-book pricing. New cost every time you publish. No self-service tools." },
  { name: "Reedsy", price: "$0–$2,000+ per service", scope: "Marketplace model — hire freelancers per project. No integrated production platform." },
];

export default function Pricing() {
  const [, navigate] = useLocation();
  const [billing, setBilling] = useState<BillingCycle>("annual");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [pendingTier, setPendingTier] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation();
  const priceIdsQuery = trpc.stripe.getPriceIds.useQuery();

  const getPriceId = (tierName: string, cycle: BillingCycle): string | null => {
    const planKey = PLAN_NAME_MAP[tierName];
    if (!planKey || !priceIdsQuery.data) return null;
    return (priceIdsQuery.data as any)?.[planKey]?.[cycle] ?? null;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "cancelled") {
      toast("Checkout was cancelled. You can try again whenever you're ready.");
      window.history.replaceState({}, "", "/pricing");
    }
  }, []);

  const handleSelectPlan = (tierName: string) => {
    const priceId = getPriceId(tierName, billing);
    if (!priceId) {
      toast.error("Pricing information is loading. Please try again in a moment.");
      return;
    }

    setPendingTier(tierName);
    setGateOpen(true);
  };

  const handleConfirmedCheckout = async (checkoutToken: string) => {
    if (!pendingTier) return;
    const priceId = getPriceId(pendingTier, billing);
    if (!priceId) return;

    setGateOpen(false);
    setLoadingTier(pendingTier);
    try {
      const planName = (PLAN_NAME_MAP[pendingTier] ?? "author_pro") as "kdp_ready" | "author_pro";
      const result = await checkoutMutation.mutateAsync({
        priceId,
        billingCycle: billing,
        planName,
        checkoutToken,
      });
      setCheckoutUrl(result.url);
      setLoadingTier(null);
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Checkout failed. Please try again.");
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3efe6]">
      <nav className="sticky top-0 z-50 bg-[#1a1008]/90 backdrop-blur-sm border-b border-[#c9a96e]/15">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG"
              alt="Easy Book Publishers"
              className="h-10 w-auto object-contain"
            />
            <span className="font-serif text-[#f5d98a] text-lg md:text-xl tracking-wide hidden sm:block">Easy Book Publishers</span>
          </button>
          <Button onClick={() => navigate("/dashboard")} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold">
            Go to Dashboard
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-4">New Author Pricing</Badge>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1008] mb-4">
            Professional publishing tools, priced for new authors
          </h1>
          <p className="text-lg text-[#5c4a2a]/90 max-w-2xl mx-auto mb-8">
            New authors save thousands vs. Atticus ($147) + Vellum ($250) + Reedsy + IngramSpark. Publish your new book with marketing tools, royalty calculators, distribution guides, and more. No commissions, no per-book fees, works on any device.
          </p>

          <div className="inline-flex items-center bg-[#1a1008]/5 rounded-full p-1 gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === "monthly" ? "bg-white shadow text-[#1a1008]" : "text-[#5c4a2a]/80 hover:text-[#5c4a2a]"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === "annual" ? "bg-white shadow text-[#1a1008]" : "text-[#5c4a2a]/80 hover:text-[#5c4a2a]"}`}
            >
              Annual
              <span className="ml-1.5 text-xs text-green-700 font-bold">Save 33%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-24">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const price = tier[billing];
            const period = tier.period[billing];
            return (
              <Card
                key={tier.name}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  tier.highlight
                    ? "border-2 border-[#c9a96e] shadow-lg shadow-[#c9a96e]/10 scale-[1.02]"
                    : "border border-[#c9a96e]/20"
                }`}
              >
                {tier.badge && (
                  <div className={`absolute top-0 left-0 right-0 text-center text-sm font-semibold py-1.5 ${
                    tier.highlight
                      ? "bg-gradient-to-r from-[#c9a96e] to-[#d4b480] text-[#1a1008]"
                      : "bg-[#1a1008] text-[#c9a96e]"
                  }`}>
                    {tier.badge}
                  </div>
                )}
                <CardHeader className={tier.badge ? "pt-12" : ""}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${tier.highlight ? "bg-[#c9a96e]/15" : "bg-[#1a1008]/5"}`}>
                      <Icon size={22} className={tier.highlight ? "text-[#8b6914]" : "text-[#5c4a2a]"} />
                    </div>
                    <CardTitle className="font-serif text-xl text-[#1a1008]">{tier.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-bold text-[#1a1008]">{price}</span>
                    <span className="text-[#5c4a2a]/80 text-sm">{period}</span>
                  </div>
                  <p className="text-sm text-[#5c4a2a]/90 mt-2">{tier.description}</p>
                </CardHeader>
                <CardContent>
                    <Button
                      className={`w-full mb-6 ${
                        tier.highlight
                          ? "bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold"
                          : "border-[#c9a96e]/40 text-[#1a1008] hover:bg-[#c9a96e]/10"
                      }`}
                      variant={tier.ctaVariant}
                      onClick={() => handleSelectPlan(tier.name)}
                      disabled={loadingTier === tier.name}
                    >
                      {loadingTier === tier.name ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={16} />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          {tier.cta}
                          <ArrowRight className="ml-2" size={16} />
                        </>
                      )}
                    </Button>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-2.5 text-sm">
                        {feature.included ? (
                          <Check size={16} className="text-green-600 shrink-0" />
                        ) : (
                          <X size={16} className="text-[#5c4a2a]/45 shrink-0" />
                        )}
                        <span className={feature.included ? "text-[#1a1008]" : "text-[#5c4a2a]/60"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-20 bg-white rounded-2xl border border-[#c9a96e]/15 p-8">
          <h2 className="font-serif text-3xl text-[#1a1008] text-center mb-3">Why New Authors Choose Us</h2>
          <p className="text-center text-[#5c4a2a]/80 mb-8 max-w-xl mx-auto">
            Other platforms charge 2x–10x more for a fraction of what new authors get. We built something better for your new book.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            {competitors.map((c) => (
              <div key={c.name} className="border border-red-200/60 rounded-xl p-5 bg-red-50/30 relative">
                <div className="absolute top-3 right-3">
                  <X size={14} className="text-red-400" />
                </div>
                <p className="font-serif font-bold text-[#1a1008] text-lg">{c.name}</p>
                <p className="text-red-700 font-semibold text-sm mt-1">{c.price}</p>
                <p className="text-xs text-[#5c4a2a]/70 mt-2 leading-relaxed">{c.scope}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-gradient-to-r from-[#c9a96e]/10 to-[#d4b480]/10 rounded-xl p-6 border-2 border-[#c9a96e]/30 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#c9a96e] text-[#1a1008] text-xs font-bold px-4 py-1 rounded-full shadow">YOU SAVE 35–90%</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-2 max-w-md mx-auto">
              <div className="text-center">
                <p className="font-serif font-bold text-[#1a1008]">KDP Ready</p>
                <p className="text-[#8b6914] font-bold text-2xl">$19.99<span className="text-sm font-normal">/mo</span></p>
                <p className="text-xs text-[#5c4a2a]/70 mt-1">vs. Atticus at $147</p>
              </div>
              <div className="text-center border-l border-[#c9a96e]/20">
                <p className="font-serif font-bold text-[#1a1008]">Author Pro</p>
                <p className="text-[#8b6914] font-bold text-2xl">$39.99<span className="text-sm font-normal">/mo</span></p>
                <p className="text-xs text-[#5c4a2a]/70 mt-1">vs. Vellum at $249.99</p>
              </div>
            </div>
            <p className="text-sm text-[#5c4a2a]/90 mt-4 text-center">AI typesetting + KDP export + IDML + cover specs + ISBN manager + production workflow — all in one platform, on any device. No per-sale commission. Ever.</p>
          </div>
        </div>

        <TooltipProvider>
          <div className="mb-20">
            <h2 className="font-serif text-3xl text-[#1a1008] text-center mb-10">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#c9a96e]/20">
                    <th className="text-left py-4 px-4 font-serif text-lg text-[#1a1008]">Feature</th>
                    <th className="text-center py-4 px-4 font-serif text-lg text-[#1a1008]">KDP Ready</th>
                    <th className="text-center py-4 px-4 font-serif text-lg text-[#1a1008] bg-[#c9a96e]/5">Author Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, i) => (
                    <tr key={feature.name} className={`border-b border-[#c9a96e]/10 ${i % 2 === 0 ? "" : "bg-[#c9a96e]/[0.02]"}`}>
                      <td className="py-3 px-4 text-sm text-[#1a1008]">
                        <span className="inline-flex items-center gap-1.5">
                          {feature.name}
                          {feature.tooltip && (
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle size={13} className="text-[#5c4a2a]/50" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">{feature.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </span>
                      </td>
                      {(["kdp", "author"] as const).map((plan) => (
                        <td
                          key={plan}
                          className={`py-3 px-4 text-center text-sm ${plan === "author" ? "bg-[#c9a96e]/5" : ""}`}
                        >
                          {typeof feature[plan] === "boolean" ? (
                            feature[plan] ? (
                              <Check size={16} className="text-green-600 mx-auto" />
                            ) : (
                              <X size={16} className="text-[#5c4a2a]/45 mx-auto" />
                            )
                          ) : (
                            <span className="font-medium text-[#1a1008]">{feature[plan]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TooltipProvider>

        <div className="mb-20">
          <h2 className="font-serif text-3xl text-[#1a1008] text-center mb-10">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { q: "I'm a new author — is this right for me?", a: "Absolutely. Easy Book Publishers was built specifically for new authors. Our guided wizard walks you through every step, and our AI handles the professional typesetting. No publishing experience needed — just upload your manuscript and we'll produce your new book." },
              { q: "How does this compare to Atticus or Vellum?", a: "Atticus costs $147 one-time for writing + formatting. Vellum costs $249.99 and only works on Mac. Our Author Pro ($39.99/mo annual) does everything both tools do — plus IDML export, ISBN management, cover specs, marketing toolkit, royalty calculator, distribution guide, production timeline, and a 30-step workflow. New authors get more tools at a fraction of the price." },
              { q: "Why is this so much cheaper?", a: "We're a cloud platform — no desktop software to maintain per OS. That means lower costs for us and lower prices for new authors. We believe publishing tools shouldn't cost more than the books you're creating." },
              { q: "Do you take a percentage of my book sales?", a: "Never. Draft2Digital takes 10% of every sale — forever. Lulu takes 20% of profits. We charge a flat fee. New authors keep 100% of their book earnings, whether you sell 10 copies or 10,000." },
              { q: "What if I just want to publish one new book on KDP?", a: "The KDP Ready plan ($19.99/mo) is built exactly for new authors publishing their first book on Amazon. Upload your manuscript, pick a template, and download KDP-ready files. Cancel anytime." },
              { q: "Can I export files for Amazon KDP?", a: "Yes. All plans generate KDP-compliant PDFs with proper bleed, margins, and trim sizes that pass Amazon's automated file review. New authors get professional-quality output from day one." },
              { q: "What about InDesign IDML export?", a: "The Author Pro plan includes IDML export — something no other self-publishing platform offers. Hand off production-ready files to any InDesign professional without reformatting." },
              { q: "Is there a money-back guarantee?", a: "Yes. All plans come with a 30-day money-back guarantee. New authors can try everything risk-free — if it's not right for you, you get a full refund, no questions asked." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl border border-[#c9a96e]/15 p-6">
                <h3 className="font-serif font-bold text-[#1a1008] mb-2">{q}</h3>
                <p className="text-sm text-[#5c4a2a]/90 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-16 px-6 bg-gradient-to-r from-[#1a1008] to-[#2a1a10] rounded-2xl">
          <h2 className="font-serif text-3xl text-[#f5d98a] mb-4">New author? Publish your new book today.</h2>
          <p className="text-[#d4c8b4] mb-8 max-w-xl mx-auto">
            Join thousands of new authors using Easy Book Publishers to bring their new book to life — from manuscript to masterpiece.
          </p>
          <Button onClick={() => navigate("/dashboard")} size="lg" className="bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold text-base px-10 py-6 rounded-xl shadow-xl shadow-[#c9a96e]/25">
            Go to Dashboard
            <ArrowRight className="ml-2" size={18} />
          </Button>
        </div>
      </div>

      <SiteFooter />

      <CheckoutGate
        open={gateOpen}
        onClose={() => { setGateOpen(false); setPendingTier(null); }}
        onConfirmed={handleConfirmedCheckout}
        planName={pendingTier || ""}
      />

      {checkoutUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#f3efe6] rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center space-y-4 border border-[#c9a96e]/30">
            <h3 className="text-xl font-serif text-[#1a1008] font-bold">Ready for Checkout</h3>
            <p className="text-[#5c4a2a] text-sm">
              Click the button below to complete your purchase on Stripe's secure checkout page.
            </p>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold rounded-lg transition-colors"
            >
              Go to Secure Checkout →
            </a>
            <button
              onClick={() => setCheckoutUrl(null)}
              className="text-sm text-[#5c4a2a]/70 hover:text-[#5c4a2a] underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
