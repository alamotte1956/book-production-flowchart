import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign, Users, BarChart3, Clock, Share2, TrendingUp,
  CheckCircle2, Loader2, ArrowRight, Gift, Globe, MousePointerClick,
  CalendarDays, Shield, Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";

const highlights = [
  { icon: DollarSign, title: "20% Commission", description: "Earn 20% on every sale you refer — one of the highest rates in the publishing tools industry" },
  { icon: Clock, title: "90-Day Cookie", description: "Your referrals are tracked for 90 days, so you earn even if they don't buy right away" },
  { icon: CalendarDays, title: "Monthly Payouts", description: "Get paid every month via PayPal once you hit the $50 minimum threshold" },
  { icon: BarChart3, title: "Real-Time Dashboard", description: "Track clicks, conversions, and earnings with a live affiliate dashboard" },
  { icon: Gift, title: "Recurring Commissions", description: "Earn commission on every plan purchase — monthly and annual subscriptions" },
  { icon: Shield, title: "Trusted Platform", description: "Join a growing community of publishers and content creators who trust our tools" },
];

const steps = [
  { number: "1", title: "Apply & Get Approved", description: "Fill out the application below. Most affiliates are approved within 24 hours.", icon: Users },
  { number: "2", title: "Share Your Unique Link", description: "Get your personalized referral link and share it on your blog, YouTube, podcast, or social media.", icon: Share2 },
  { number: "3", title: "Earn Commissions", description: "When someone purchases through your link, you earn 20% of the sale. Track everything in your dashboard.", icon: TrendingUp },
];

const competitorComparison = [
  { competitor: "Atticus", rate: "15–70%", cookie: "30 days", payout: "Monthly", notes: "Tiered rates, higher for top affiliates" },
  { competitor: "Scrivener", rate: "20%", cookie: "120 days", payout: "Monthly", notes: "Via eSellerate / Paddle" },
  { competitor: "Publisher Rocket", rate: "$60/sale", cookie: "60 days", payout: "Monthly", notes: "Flat rate per sale" },
  { competitor: "Creative Market", rate: "20–30%", cookie: "30 days", payout: "Monthly", notes: "Marketplace model" },
  { competitor: "Easy Book Publishers", rate: "20%", cookie: "90 days", payout: "Monthly", notes: "All plans, real-time dashboard", highlight: true },
];

const faqs = [
  { q: "Who can become an affiliate?", a: "Anyone with an audience interested in self-publishing, book design, or writing tools. This includes bloggers, YouTubers, podcasters, writing coaches, book designers, and publishing consultants." },
  { q: "How much can I earn?", a: "You earn 20% on every sale. For annual Author Pro plans, that's $95.98/year per referral. Monthly subscriptions earn recurring commissions too." },
  { q: "When do I get paid?", a: "Payouts are processed monthly via PayPal once your balance reaches the $50 minimum threshold. Commissions are approved after a 30-day hold period to account for refunds." },
  { q: "How long does the cookie last?", a: "Our tracking cookie lasts 90 days. If someone clicks your link and purchases within 90 days, you get credit for the sale — even if they visit the site multiple times." },
  { q: "What marketing materials do you provide?", a: "We provide ready-to-use banner ads, text links, social media copy, and email templates. All available in your affiliate dashboard once approved." },
  { q: "Can I promote on social media?", a: "Absolutely. You can share your referral link on any platform — blog posts, YouTube descriptions, Twitter/X, Instagram, TikTok, Facebook groups, email newsletters, and more." },
  { q: "Are there any restrictions?", a: "You cannot use paid ads that bid on our brand name, send unsolicited spam, or misrepresent the product. Standard affiliate program terms apply." },
  { q: "Do I need to be a customer to be an affiliate?", a: "No, but we recommend trying the platform so you can speak authentically about it. Your audience trusts genuine recommendations." },
];

export default function AffiliateProgram() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [promotionMethod, setPromotionMethod] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const applyMutation = trpc.affiliate.submitApplication.useMutation();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      await applyMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        website: website.trim() || undefined,
        paypalEmail: paypalEmail.trim() || undefined,
        promotionMethod: promotionMethod.trim() || undefined,
      });
      setSubmitted(true);
      toast.success("Application submitted! We'll review it and get back to you within 24 hours.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application. Please try again.");
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
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/pricing")} variant="outline" className="border-[#c9a96e]/30 text-[#f5d98a] hover:bg-[#c9a96e]/10">
              Pricing
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold">
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center py-20">
          <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-4">Affiliate Program</Badge>
          <h1 className="font-serif text-4xl md:text-6xl text-[#1a1008] mb-4 leading-tight">
            Earn <span className="text-[#8b6914]">20% Commission</span><br />on Every Referral
          </h1>
          <p className="text-lg text-[#5c4a2a]/90 max-w-2xl mx-auto mb-8">
            Join the Easy Book Publishers affiliate program and earn money by sharing the tools
            you love with fellow authors and publishers. No cap on earnings.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#apply" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold px-8 py-3 rounded-xl shadow-lg transition-all">
              Apply Now <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#how-it-works" className="inline-flex items-center gap-2 bg-white border border-[#c9a96e]/30 text-[#3a2a14] font-semibold px-8 py-3 rounded-xl hover:bg-[#c9a96e]/5 transition-all">
              Learn More
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {highlights.map((item) => (
            <Card key={item.title} className="bg-white border-[#c9a96e]/15 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <item.icon className="w-8 h-8 text-[#c9a96e] mb-3" />
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[#5c4a2a]/90 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div id="how-it-works" className="mb-20">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-[#1a1008] mb-3">How It Works</h2>
            <p className="text-[#5c4a2a]/90">Three simple steps to start earning</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c9a96e] to-[#8b6914] flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-xs font-bold text-[#c9a96e] uppercase tracking-wider mb-1">Step {step.number}</div>
                <h3 className="font-serif text-xl text-[#1a1008] mb-2">{step.title}</h3>
                <p className="text-sm text-[#5c4a2a]/90 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-[#1a1008] mb-3">Earnings Potential</h2>
            <p className="text-[#5c4a2a]/90">Here's what you could earn at 20% commission</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
            <Card className="bg-white border-[#c9a96e]/15">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-[#c9a96e] mx-auto mb-3" />
                <div className="font-serif text-3xl text-[#1a1008] font-bold">$6.00</div>
                <div className="text-sm text-[#5c4a2a]/90 mt-1">per KDP Ready monthly</div>
                <div className="text-xs text-[#8b6914] mt-2">Plan: $29.99/mo</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-[#c9a96e]/15 ring-2 ring-[#c9a96e]/30">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-[#c9a96e] mx-auto mb-3" />
                <div className="font-serif text-3xl text-[#1a1008] font-bold">$12.00</div>
                <div className="text-sm text-[#5c4a2a]/90 mt-1">per Author Pro monthly</div>
                <div className="text-xs text-[#8b6914] mt-2">Plan: $59.99/mo</div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 bg-[#c9a96e]/10 border border-[#c9a96e]/20 rounded-xl p-4 text-center">
            <p className="text-sm text-[#5c4a2a]">
              <strong>Example:</strong> Refer 20 Author Pro subscribers = <strong>$120/month</strong> in recurring passive income
            </p>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-[#1a1008] mb-3">How We Compare</h2>
            <p className="text-[#5c4a2a]/90">Our program stacks up against the best in the industry</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl border border-[#c9a96e]/15 overflow-hidden">
              <thead>
                <tr className="bg-[#1a1008] text-[#f5d98a]">
                  <th className="px-4 py-3 text-left font-serif text-sm">Program</th>
                  <th className="px-4 py-3 text-left font-serif text-sm">Commission</th>
                  <th className="px-4 py-3 text-left font-serif text-sm">Cookie</th>
                  <th className="px-4 py-3 text-left font-serif text-sm">Payout</th>
                  <th className="px-4 py-3 text-left font-serif text-sm hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {competitorComparison.map((row) => (
                  <tr key={row.competitor} className={`border-t border-[#c9a96e]/10 ${row.highlight ? "bg-[#c9a96e]/5 font-semibold" : ""}`}>
                    <td className="px-4 py-3 text-sm text-[#1a1008]">
                      {row.highlight && <span className="text-[#8b6914]">★ </span>}
                      {row.competitor}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1a1008]">{row.rate}</td>
                    <td className="px-4 py-3 text-sm text-[#5c4a2a]">{row.cookie}</td>
                    <td className="px-4 py-3 text-sm text-[#5c4a2a]">{row.payout}</td>
                    <td className="px-4 py-3 text-sm text-[#5c4a2a]/90 hidden md:table-cell">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-[#1a1008] mb-3">What You Get</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {[
                "Unique referral link with 90-day tracking cookie",
                "Real-time dashboard with clicks, conversions, and earnings",
                "Ready-to-use banner ads in multiple sizes",
                "Pre-written social media copy and email templates",
                "Monthly PayPal payouts (no minimum for first 3 months)",
                "Dedicated affiliate support",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-[#3a2a14]">{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                "Promotional text links with custom UTM parameters",
                "Product screenshots and feature comparison graphics",
                "Access to upcoming promotions and discount codes",
                "Performance bonuses for top affiliates",
                "Early access to new features for review",
                "Co-marketing opportunities for high performers",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-[#3a2a14]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="apply" className="mb-20">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl text-[#1a1008] mb-3">Apply to Join</h2>
              <p className="text-[#5c4a2a]/90">Most applications are reviewed within 24 hours</p>
            </div>

            {submitted ? (
              <Card className="bg-white border-[#c9a96e]/15">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="font-serif text-2xl text-[#1a1008] mb-2">Application Submitted!</h3>
                  <p className="text-[#5c4a2a]/90 mb-4">
                    We'll review your application and send you an email within 24 hours with your affiliate link and dashboard access.
                  </p>
                  <Button onClick={() => navigate("/dashboard")} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold">
                    Return to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border-[#c9a96e]/15">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleApply} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="aff-name" className="text-[#3a2a14]">Full Name *</Label>
                        <Input id="aff-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="bg-[#f3efe6] border-[#c9a96e]/30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aff-email" className="text-[#3a2a14]">Email Address *</Label>
                        <Input id="aff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="bg-[#f3efe6] border-[#c9a96e]/30" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="aff-website" className="text-[#3a2a14]">Website / Blog URL</Label>
                        <Input id="aff-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourblog.com" className="bg-[#f3efe6] border-[#c9a96e]/30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aff-paypal" className="text-[#3a2a14]">PayPal Email (for payouts)</Label>
                        <Input id="aff-paypal" type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="paypal@example.com" className="bg-[#f3efe6] border-[#c9a96e]/30" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aff-promo" className="text-[#3a2a14]">How do you plan to promote Easy Book Publishers?</Label>
                      <Textarea id="aff-promo" value={promotionMethod} onChange={(e) => setPromotionMethod(e.target.value)} placeholder="Blog reviews, YouTube tutorials, social media posts, email newsletter..." rows={3} className="bg-[#f3efe6] border-[#c9a96e]/30 resize-none" />
                    </div>
                    <Button type="submit" disabled={applyMutation.isPending || !name.trim() || !email.trim()} className="w-full bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold py-3 rounded-xl shadow-lg">
                      {applyMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                      ) : (
                        <><Gift className="w-4 h-4 mr-2" /> Submit Application</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-[#1a1008] mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl border border-[#c9a96e]/15 p-5">
                <h3 className="font-serif font-bold text-[#1a1008] mb-2">{q}</h3>
                <p className="text-sm text-[#5c4a2a]/90 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-16 px-6 bg-gradient-to-r from-[#1a1008] to-[#2a1a10] rounded-2xl mb-10">
          <h2 className="font-serif text-3xl text-[#f5d98a] mb-4">Ready to start earning?</h2>
          <p className="text-[#d4c8b4] mb-8 max-w-xl mx-auto">
            Join our affiliate program today and turn your audience into a revenue stream. No upfront costs, no commitments.
          </p>
          <a href="#apply" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold text-base px-10 py-4 rounded-xl shadow-xl shadow-[#c9a96e]/25 transition-all">
            Apply Now <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
