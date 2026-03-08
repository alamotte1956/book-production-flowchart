import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowRight, BookOpen, Zap, Building2 } from "lucide-react";
import { getSignUpUrl } from "@/const";
import { useLocation } from "wouter";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic project tracking and publishing tools.",
    icon: BookOpen,
    cta: "Create Free Account",
    ctaVariant: "outline" as const,
    highlight: false,
    features: [
      { name: "1 book project", included: true },
      { name: "30-step production workflow", included: true },
      { name: "Spine calculator", included: true },
      { name: "Cover designer", included: true },
      { name: "ISBN & metadata manager", included: true },
      { name: "Resources hub access", included: true },
      { name: "AI typesetting", included: false },
      { name: "EPUB + PDF export", included: false },
      { name: "Production timeline", included: false },
      { name: "Priority support", included: false },
      { name: "Team collaboration", included: false },
      { name: "API access", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Unlimited projects with AI-powered typesetting and full export capabilities.",
    icon: Zap,
    cta: "Start Pro Trial",
    ctaVariant: "default" as const,
    highlight: true,
    features: [
      { name: "Unlimited book projects", included: true },
      { name: "30-step production workflow", included: true },
      { name: "Spine calculator", included: true },
      { name: "Cover designer", included: true },
      { name: "ISBN & metadata manager", included: true },
      { name: "Resources hub access", included: true },
      { name: "AI typesetting", included: true },
      { name: "EPUB + PDF export", included: true },
      { name: "Production timeline", included: true },
      { name: "Priority support", included: false },
      { name: "Team collaboration", included: false },
      { name: "API access", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Team features, API access, and dedicated support for publishers at scale.",
    icon: Building2,
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    highlight: false,
    features: [
      { name: "Unlimited book projects", included: true },
      { name: "30-step production workflow", included: true },
      { name: "Spine calculator", included: true },
      { name: "Cover designer", included: true },
      { name: "ISBN & metadata manager", included: true },
      { name: "Resources hub access", included: true },
      { name: "AI typesetting", included: true },
      { name: "EPUB + PDF export", included: true },
      { name: "Production timeline", included: true },
      { name: "Priority support", included: true },
      { name: "Team collaboration", included: true },
      { name: "API access", included: true },
    ],
  },
];

const comparisonFeatures = [
  { name: "Book Projects", free: "1", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "Production Workflow", free: "30 steps", pro: "30 steps", enterprise: "30 steps" },
  { name: "Spine Calculator", free: true, pro: true, enterprise: true },
  { name: "Cover Designer", free: true, pro: true, enterprise: true },
  { name: "ISBN & Metadata", free: true, pro: true, enterprise: true },
  { name: "Resources Hub", free: true, pro: true, enterprise: true },
  { name: "Bible Design Studio", free: true, pro: true, enterprise: true },
  { name: "AI Typesetting", free: false, pro: true, enterprise: true },
  { name: "EPUB Export", free: false, pro: true, enterprise: true },
  { name: "PDF Export", free: false, pro: true, enterprise: true },
  { name: "Production Timeline", free: false, pro: true, enterprise: true },
  { name: "CDP & KP&A Templates", free: false, pro: true, enterprise: true },
  { name: "Priority Support", free: false, pro: false, enterprise: true },
  { name: "Team Collaboration", free: false, pro: false, enterprise: true },
  { name: "API Access", free: false, pro: false, enterprise: true },
  { name: "Custom Integrations", free: false, pro: false, enterprise: true },
];

export default function Pricing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#faf6ef]">
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
          <a href={getSignUpUrl()}>
            <Button className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold">
              Get Started
            </Button>
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-4">Pricing</Badge>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1008] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-[#5c4a2a]/70 max-w-2xl mx-auto">
            Start free and scale as you grow. Every plan includes our core publishing tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card
                key={tier.name}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  tier.highlight
                    ? "border-2 border-[#c9a96e] shadow-lg shadow-[#c9a96e]/10 scale-[1.02]"
                    : "border border-[#c9a96e]/20"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#c9a96e] to-[#d4b480] text-[#1a1008] text-center text-sm font-semibold py-1.5">
                    Most Popular
                  </div>
                )}
                <CardHeader className={tier.highlight ? "pt-12" : ""}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${tier.highlight ? "bg-[#c9a96e]/15" : "bg-[#1a1008]/5"}`}>
                      <Icon size={22} className={tier.highlight ? "text-[#8b6914]" : "text-[#5c4a2a]"} />
                    </div>
                    <CardTitle className="font-serif text-xl text-[#1a1008]">{tier.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-bold text-[#1a1008]">{tier.price}</span>
                    <span className="text-[#5c4a2a]/60 text-sm">{tier.period}</span>
                  </div>
                  <p className="text-sm text-[#5c4a2a]/70 mt-2">{tier.description}</p>
                </CardHeader>
                <CardContent>
                  <a href={tier.name === "Enterprise" ? "/#contact-section" : getSignUpUrl()}>
                    <Button
                      className={`w-full mb-6 ${
                        tier.highlight
                          ? "bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold"
                          : "border-[#c9a96e]/40 text-[#1a1008] hover:bg-[#c9a96e]/10"
                      }`}
                      variant={tier.ctaVariant}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </a>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-2.5 text-sm">
                        {feature.included ? (
                          <Check size={16} className="text-green-600 shrink-0" />
                        ) : (
                          <X size={16} className="text-[#5c4a2a]/25 shrink-0" />
                        )}
                        <span className={feature.included ? "text-[#1a1008]" : "text-[#5c4a2a]/40"}>
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

        <div className="mb-20">
          <h2 className="font-serif text-3xl text-[#1a1008] text-center mb-10">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[#c9a96e]/20">
                  <th className="text-left py-4 px-4 font-serif text-lg text-[#1a1008]">Feature</th>
                  <th className="text-center py-4 px-4 font-serif text-lg text-[#1a1008]">Free</th>
                  <th className="text-center py-4 px-4 font-serif text-lg text-[#1a1008] bg-[#c9a96e]/5">Pro</th>
                  <th className="text-center py-4 px-4 font-serif text-lg text-[#1a1008]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, i) => (
                  <tr key={feature.name} className={`border-b border-[#c9a96e]/10 ${i % 2 === 0 ? "" : "bg-[#c9a96e]/[0.02]"}`}>
                    <td className="py-3 px-4 text-sm text-[#1a1008]">{feature.name}</td>
                    {(["free", "pro", "enterprise"] as const).map((plan) => (
                      <td
                        key={plan}
                        className={`py-3 px-4 text-center text-sm ${plan === "pro" ? "bg-[#c9a96e]/5" : ""}`}
                      >
                        {typeof feature[plan] === "boolean" ? (
                          feature[plan] ? (
                            <Check size={16} className="text-green-600 mx-auto" />
                          ) : (
                            <X size={16} className="text-[#5c4a2a]/25 mx-auto" />
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

        <div className="text-center py-16 px-6 bg-gradient-to-r from-[#1a1008] to-[#2a1a10] rounded-2xl">
          <h2 className="font-serif text-3xl text-[#f5d98a] mb-4">Ready to publish your book?</h2>
          <p className="text-[#d4c8b4]/80 mb-8 max-w-xl mx-auto">
            Join thousands of authors and publishers using Easy Book Publishers to bring their books to life.
          </p>
          <a href={getSignUpUrl()}>
            <Button size="lg" className="bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold text-base px-10 py-6 rounded-xl shadow-xl shadow-[#c9a96e]/25">
              Get Started Free
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
