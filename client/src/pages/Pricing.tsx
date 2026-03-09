import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, BookOpen, Zap, Crown, HelpCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";
import CheckoutGate from "@/components/CheckoutGate";

type BillingCycle = "monthly" | "annual" | "lifetime";

const PRICE_IDS: Record<string, Record<BillingCycle, string>> = {
  "Author Pro": {
    monthly: "price_1T8YrzA6rewT2BRR3203CbI4",
    annual: "price_1T8Ys0A6rewT2BRRpzIWjqWZ",
    lifetime: "price_1T8Ys0A6rewT2BRRue9XxUEl",
  },
  "Publisher": {
    monthly: "price_1T8Ys0A6rewT2BRRqxBSf5go",
    annual: "price_1T8Ys0A6rewT2BRRMctmRIJw",
    lifetime: "price_1T8Ys1A6rewT2BRRg8rdFtLC",
  },
};

const tiers = [
  {
    name: "Starter",
    monthly: "$0",
    annual: "$0",
    lifetime: "$0",
    period: { monthly: "free forever", annual: "free forever", lifetime: "free forever" },
    description: "Everything you need to plan your book. Start publishing with zero risk.",
    icon: BookOpen,
    cta: "Start Free",
    ctaVariant: "outline" as const,
    highlight: false,
    badge: null,
    features: [
      { name: "1 book project", included: true },
      { name: "30-step production workflow", included: true },
      { name: "Bible Design Studio", included: true },
      { name: "Spine calculator", included: true },
      { name: "Cover spec designer", included: true },
      { name: "Print spec generator", included: true },
      { name: "ISBN & ONIX 3.0 metadata", included: true },
      { name: "Publishing resources hub", included: true },
      { name: "30+ manuscript formats accepted", included: true },
      { name: "Cross-platform (any browser)", included: true },
      { name: "AI typesetting (PDF + EPUB)", included: false },
      { name: "Amazon KDP-ready PDF export", included: false },
      { name: "InDesign IDML export", included: false },
      { name: "40+ book templates", included: false },
      { name: "Production timeline", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    name: "Author Pro",
    monthly: "$12.99",
    annual: "$8.99",
    lifetime: "$132",
    period: { monthly: "/month", annual: "/mo (billed annually)", lifetime: "one-time" },
    description: "Full publishing toolkit with AI-powered typesetting. Like Atticus + Vellum, but online — and cheaper.",
    icon: Zap,
    cta: "Start 14-Day Free Trial",
    ctaVariant: "default" as const,
    highlight: true,
    badge: "Most Popular",
    features: [
      { name: "Unlimited book projects", included: true },
      { name: "30-step production workflow", included: true },
      { name: "Bible Design Studio", included: true },
      { name: "Spine calculator", included: true },
      { name: "Cover spec designer", included: true },
      { name: "Print spec generator", included: true },
      { name: "ISBN & ONIX 3.0 metadata", included: true },
      { name: "Publishing resources hub", included: true },
      { name: "30+ manuscript formats accepted", included: true },
      { name: "Cross-platform (any browser)", included: true },
      { name: "AI typesetting (PDF + EPUB)", included: true },
      { name: "Amazon KDP-ready PDF export", included: true },
      { name: "InDesign IDML export", included: true },
      { name: "40+ book templates", included: true },
      { name: "Production timeline", included: true },
      { name: "Priority support", included: false },
    ],
  },
  {
    name: "Publisher",
    monthly: "$34.99",
    annual: "$24.99",
    lifetime: "$349",
    period: { monthly: "/month", annual: "/mo (billed annually)", lifetime: "one-time" },
    description: "For publishing houses, imprints, and prolific authors managing multiple titles.",
    icon: Crown,
    cta: "Start 14-Day Free Trial",
    ctaVariant: "outline" as const,
    highlight: false,
    badge: "Best for Teams",
    features: [
      { name: "Unlimited book projects", included: true },
      { name: "30-step production workflow", included: true },
      { name: "Bible Design Studio", included: true },
      { name: "Spine calculator", included: true },
      { name: "Cover spec designer", included: true },
      { name: "Print spec generator", included: true },
      { name: "ISBN & ONIX 3.0 metadata", included: true },
      { name: "Publishing resources hub", included: true },
      { name: "30+ manuscript formats accepted", included: true },
      { name: "Cross-platform (any browser)", included: true },
      { name: "AI typesetting (PDF + EPUB)", included: true },
      { name: "Amazon KDP-ready PDF export", included: true },
      { name: "InDesign IDML export", included: true },
      { name: "40+ book templates", included: true },
      { name: "Production timeline", included: true },
      { name: "Priority support", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Custom branding on exports", included: true },
    ],
  },
];

const comparisonFeatures: Array<{ name: string; tooltip?: string; starter: string | boolean; author: string | boolean; publisher: string | boolean }> = [
  { name: "Book Projects", starter: "1", author: "Unlimited", publisher: "Unlimited" },
  { name: "Production Workflow", starter: "30 steps", author: "30 steps", publisher: "30 steps" },
  { name: "Cross-Platform Access", tooltip: "Works on any device with a browser — Windows, Mac, Linux, Chromebook, iPad", starter: true, author: true, publisher: true },
  { name: "Manuscript Import", tooltip: "Accept 30+ formats including DOCX, PDF, TXT, RTF, and more", starter: true, author: true, publisher: true },
  { name: "Bible Design Studio", starter: true, author: true, publisher: true },
  { name: "Spine Calculator", starter: true, author: true, publisher: true },
  { name: "Cover Spec Designer", starter: true, author: true, publisher: true },
  { name: "Print Spec Generator", starter: true, author: true, publisher: true },
  { name: "ISBN & ONIX 3.0 Metadata", tooltip: "Full ISBN management and ONIX 3.0 XML export for retailers", starter: true, author: true, publisher: true },
  { name: "Publishing Resources Hub", starter: true, author: true, publisher: true },
  { name: "Guided Publishing Journey", starter: true, author: true, publisher: true },
  { name: "AI Typesetting Engine", tooltip: "Automated book layout with professional styles — like Atticus + Vellum combined", starter: false, author: true, publisher: true },
  { name: "PDF Export (Screen)", starter: false, author: true, publisher: true },
  { name: "EPUB 3 Export", tooltip: "Standard EPUB 3 compatible with all major retailers", starter: false, author: true, publisher: true },
  { name: "Amazon KDP-Ready PDF", tooltip: "Print-ready PDF with bleed, gutter, and trim marks per Amazon specs", starter: false, author: true, publisher: true },
  { name: "InDesign IDML Export", tooltip: "Export to Adobe InDesign format for advanced customization — competitors don't offer this", starter: false, author: true, publisher: true },
  { name: "40+ Book Templates", tooltip: "Professional templates with customizable styles and trim presets", starter: false, author: true, publisher: true },
  { name: "Production Timeline", tooltip: "Gantt chart and deadline tracking for all 30 steps", starter: false, author: true, publisher: true },
  { name: "Priority Support", starter: false, author: false, publisher: true },
  { name: "Dedicated Account Manager", starter: false, author: false, publisher: true },
  { name: "Custom Branding on Exports", starter: false, author: false, publisher: true },
];

const competitors = [
  { name: "Atticus", price: "$147 one-time", scope: "Writing + formatting only, no IDML/ONIX" },
  { name: "Vellum", price: "$250 one-time", scope: "Formatting only, Mac only, no IDML/ONIX" },
  { name: "Reedsy Studio", price: "$5–$8/mo", scope: "Basic formatting, limited templates" },
  { name: "BookBaby", price: "$1,090–$2,890/book", scope: "Full-service, per-book pricing" },
];

export default function Pricing() {
  const [, navigate] = useLocation();
  const [billing, setBilling] = useState<BillingCycle>("lifetime");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [pendingTier, setPendingTier] = useState<string | null>(null);
  const { user } = useAuth();
  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "cancelled") {
      toast("Checkout was cancelled. You can try again whenever you're ready.");
      window.history.replaceState({}, "", "/pricing");
    }
  }, []);

  const handleSelectPlan = (tierName: string) => {
    if (tierName === "Starter") {
      navigate("/dashboard");
      return;
    }

    const priceId = PRICE_IDS[tierName]?.[billing];
    if (!priceId) return;

    setPendingTier(tierName);
    setGateOpen(true);
  };

  const handleConfirmedCheckout = async (checkoutToken: string) => {
    if (!pendingTier) return;
    const priceId = PRICE_IDS[pendingTier]?.[billing];
    if (!priceId) return;

    setGateOpen(false);
    setLoadingTier(pendingTier);
    try {
      const planName = pendingTier === "Author Pro" ? "author_pro" as const : "publisher" as const;
      const result = await checkoutMutation.mutateAsync({
        priceId,
        billingCycle: billing,
        planName,
        checkoutToken,
      });
      window.location.href = result.url;
    } catch (err) {
      console.error("Checkout error:", err);
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
          <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-4">Pricing</Badge>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1008] mb-4">
            Professional publishing tools, fairly priced
          </h1>
          <p className="text-lg text-[#5c4a2a]/90 max-w-2xl mx-auto mb-8">
            One platform replaces Atticus + Vellum + IngramSpark. Start free, upgrade when you're ready to publish.
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
            <button
              onClick={() => setBilling("lifetime")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === "lifetime" ? "bg-white shadow text-[#1a1008]" : "text-[#5c4a2a]/80 hover:text-[#5c4a2a]"}`}
            >
              Lifetime
              <span className="ml-1.5 text-xs text-green-700 font-bold">Best Value</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
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
          <h2 className="font-serif text-3xl text-[#1a1008] text-center mb-3">How We Compare</h2>
          <p className="text-center text-[#5c4a2a]/80 mb-8 max-w-xl mx-auto">
            Other platforms charge hundreds of dollars for a fraction of what you get with Easy Book Publishers.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            {competitors.map((c) => (
              <div key={c.name} className="border border-[#e8dfd0] rounded-xl p-5 bg-[#f3efe6]/50">
                <p className="font-serif font-bold text-[#1a1008] text-lg">{c.name}</p>
                <p className="text-[#8b6914] font-semibold text-sm mt-1">{c.price}</p>
                <p className="text-xs text-[#5c4a2a]/70 mt-2">{c.scope}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6 bg-gradient-to-r from-[#c9a96e]/10 to-[#d4b480]/10 rounded-xl p-5 border border-[#c9a96e]/20">
            <p className="font-serif text-lg text-[#1a1008] font-bold">Easy Book Publishers — Author Pro</p>
            <p className="text-[#8b6914] font-bold text-xl mt-1">$132 lifetime <span className="text-sm font-normal text-[#5c4a2a]/80">or $8.99/mo annually</span></p>
            <p className="text-sm text-[#5c4a2a]/90 mt-2">Writing workflow + AI typesetting + cover specs + ISBN manager + KDP export + IDML + production timeline — all in one platform, on any device.</p>
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
                    <th className="text-center py-4 px-4 font-serif text-lg text-[#1a1008]">Starter</th>
                    <th className="text-center py-4 px-4 font-serif text-lg text-[#1a1008] bg-[#c9a96e]/5">Author Pro</th>
                    <th className="text-center py-4 px-4 font-serif text-lg text-[#1a1008]">Publisher</th>
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
                      {(["starter", "author", "publisher"] as const).map((plan) => (
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
              { q: "Can I really start for free?", a: "Yes. The Starter plan is completely free with no credit card required. You get one full project with our 30-step workflow, spine calculator, cover designer, and more." },
              { q: "What does the lifetime plan include?", a: "Pay once, use forever. You get all features of your chosen tier with lifetime updates — no recurring payments. Similar to how Atticus charges $147, but you get a complete publishing platform." },
              { q: "How does this compare to Atticus or Vellum?", a: "Atticus ($147) and Vellum ($250-$500) are formatting-only tools. Easy Book Publishers includes AI typesetting plus project management, cover specs, ISBN management, KDP export, and a full 30-step production workflow — all in your browser on any device." },
              { q: "Do you take a cut of my book sales?", a: "Never. Unlike Lulu (20% of profits) or Draft2Digital (10% of royalties), we charge a flat fee. Your book earnings are 100% yours." },
              { q: "Can I export for Amazon KDP?", a: "Yes. Author Pro and Publisher plans generate KDP-ready PDFs with proper bleed, margins, and trim sizes that pass Amazon's file review." },
              { q: "Is there a money-back guarantee?", a: "Yes. All paid plans come with a 30-day money-back guarantee. Try it risk-free." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl border border-[#c9a96e]/15 p-6">
                <h3 className="font-serif font-bold text-[#1a1008] mb-2">{q}</h3>
                <p className="text-sm text-[#5c4a2a]/90 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-16 px-6 bg-gradient-to-r from-[#1a1008] to-[#2a1a10] rounded-2xl">
          <h2 className="font-serif text-3xl text-[#f5d98a] mb-4">Ready to publish your book?</h2>
          <p className="text-[#d4c8b4] mb-8 max-w-xl mx-auto">
            Join authors and publishers using Easy Book Publishers to bring their books to life — from first idea to finished volume.
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
    </div>
  );
}
