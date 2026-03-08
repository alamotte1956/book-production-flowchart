import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, CheckCircle2, Star, FileText, Upload, Sparkles, Printer,
  Globe, Menu, X,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";

const HERO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/hero-banner-cxQRR1jXLBmcXxFPJoqxWN.webp";

const features = [
  { icon: Upload, title: "Upload Your Manuscript", desc: "Drop in your DOCX, PDF, or any of 30+ formats. Our parser handles the rest." },
  { icon: Sparkles, title: "AI-Powered Typesetting", desc: "Professional book layout generated instantly — headers, footers, chapter openers, and more." },
  { icon: Printer, title: "Print-Ready Output", desc: "Download real Interior PDF, KDP-qualified PDF, EPUB, and InDesign IDML files." },
  { icon: Globe, title: "Publish Anywhere", desc: "Export files ready for Amazon KDP, IngramSpark, Barnes & Noble, or your own printer." },
];

const outputFormats = [
  { name: "Interior PDF", desc: "Press-ready interior with professional typography" },
  { name: "KDP Print-Ready PDF", desc: "Amazon-compliant with bleed and gutter specs" },
  { name: "EPUB 3", desc: "Standards-compliant ebook with TOC and metadata" },
  { name: "InDesign IDML", desc: "Real Adobe InDesign Interchange format" },
  { name: "ONIX 3.0 XML", desc: "Industry-standard metadata for distributors" },
];

const testimonials = [
  { quote: "This platform saved me thousands in typesetting costs. The AI output is indistinguishable from professional work.", author: "Self-Published Author", stars: 5 },
  { quote: "The Bible Design Studio is unlike anything else on the market. Finally, a tool built for scripture publishers.", author: "Independent Publisher", stars: 5 },
  { quote: "From manuscript to print-ready PDF in under 10 minutes. The workflow tracking keeps me organized.", author: "Writing Coach", stars: 5 },
];

const stats = [
  { value: "30+", label: "Manuscript Formats" },
  { value: "29", label: "Book Templates" },
  { value: "9", label: "Production Phases" },
  { value: "30", label: "Workflow Steps" },
];

const wizardBenefits = [
  "Get a personalized publishing roadmap in 2 minutes",
  "Matched to the right tools, templates, and timeline",
  "Step-by-step guidance from manuscript to finished book",
  "Free to start — no credit card required",
];

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3efe6]">
      <nav className="sticky top-0 z-50 bg-[#1a1008]/95 backdrop-blur-sm border-b border-[#c9a96e]/15">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG"
              alt="Easy Book Publishers"
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <span className="font-serif text-[#f5d98a] text-lg tracking-wide">Easy Book Publishers</span>
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#c9a96e]/80 -mt-0.5">Manuscript to Masterpiece</p>
            </div>
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#how-it-works" className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">How It Works</a>
            <a href="#output" className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">Output</a>
            <button onClick={() => navigate("/pricing")} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">Pricing</button>
            <button onClick={() => navigate("/affiliates")} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">Affiliates</button>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/guided-journey")} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold hidden sm:flex" size="sm">
              Start the Wizard
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#c9a96e] p-1.5 rounded-lg hover:bg-[#c9a96e]/10 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#c9a96e]/10 bg-[#1a1008]/98">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">How It Works</a>
              <a href="#output" onClick={() => setMobileMenuOpen(false)} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">Output</a>
              <button onClick={() => { navigate("/pricing"); setMobileMenuOpen(false); }} className="text-left text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">Pricing</button>
              <button onClick={() => { navigate("/affiliates"); setMobileMenuOpen(false); }} className="text-left text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">Affiliates</button>
              <div className="flex gap-3 pt-2 border-t border-[#c9a96e]/10">
                <Button onClick={() => { navigate("/guided-journey"); setMobileMenuOpen(false); }} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold flex-1" size="sm">
                  Start the Wizard
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1008] via-[#2a1a10] to-[#1a1008]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${HERO_URL})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative max-w-7xl mx-auto px-6 pt-2 md:pt-3 pb-24 md:pb-32 text-center">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#f5d98a] mb-4 leading-tight tracking-tight">
            Easy Book Publishers
          </h1>
          <p className="font-serif text-2xl md:text-4xl lg:text-5xl text-[#ede7d8] mb-6 leading-tight">
            From Manuscript to <span className="text-[#f5d98a]">Masterpiece</span>
          </p>
          <p className="text-lg md:text-xl text-[#d4c8b4] max-w-2xl mx-auto mb-10">
            Design, typeset, and produce print-ready books with professional AI-powered tools.
            No software to download. Works on any device.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button onClick={() => navigate("/guided-journey")} size="lg" className="bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold text-base px-8 py-6 rounded-xl shadow-xl shadow-[#c9a96e]/20">
              Start the Publishing Wizard <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif text-3xl md:text-4xl text-[#f5d98a] font-bold">{s.value}</div>
                <div className="text-xs text-[#d4c8b4]/80 uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-3">How It Works</Badge>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1a1008] mb-3">Four Steps to a Finished Book</h2>
          <p className="text-[#5c4a2a]/85 max-w-xl mx-auto">From raw manuscript to professional, print-ready output in minutes — not months.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={f.title} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a96e]/20 to-[#c9a96e]/5 flex items-center justify-center mx-auto mb-4 border border-[#c9a96e]/15">
                <f.icon className="w-7 h-7 text-[#c9a96e]" />
              </div>
              <div className="text-xs font-bold text-[#c9a96e] uppercase tracking-wider mb-2">Step {i + 1}</div>
              <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-[#5c4a2a]/85 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button onClick={() => navigate("/guided-journey")} size="lg" className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold px-8">
            Start the Publishing Wizard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      <section id="output" className="bg-[#1a1008] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="bg-[#c9a96e]/15 text-[#f5d98a] border-[#c9a96e]/30 mb-3">Real Output Files</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-[#ede7d8] mb-3">Production-Ready Exports</h2>
            <p className="text-[#d4c8b4]/80 max-w-xl mx-auto">Not mockups. Not previews. Real, downloadable production files ready for print and distribution.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {outputFormats.map((fmt) => (
              <Card key={fmt.name} className="bg-[#2a1a10] border-[#c9a96e]/10">
                <CardContent className="p-5 text-center">
                  <FileText className="w-8 h-8 text-[#c9a96e] mx-auto mb-3" />
                  <h3 className="font-serif text-sm font-bold text-[#ede7d8] mb-1">{fmt.name}</h3>
                  <p className="text-xs text-[#d4c8b4]/70 leading-relaxed">{fmt.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-4">Your Starting Point</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1a1008] mb-4">The Publishing Wizard Guides You</h2>
            <p className="text-[#5c4a2a]/85 leading-relaxed mb-6">
              Answer a few quick questions about your book and experience level. The wizard builds a personalized roadmap with exactly the tools and steps you need — nothing extra, nothing missing.
            </p>
            <ul className="space-y-3 mb-8">
              {wizardBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#c9a96e] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#3a2a14]">{benefit}</span>
                </li>
              ))}
            </ul>
            <Button onClick={() => navigate("/guided-journey")} size="lg" className="bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold px-8 py-5 rounded-xl shadow-lg shadow-[#c9a96e]/20">
              Start the Publishing Wizard <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <div className="bg-gradient-to-br from-[#1a1008] to-[#2a1a10] rounded-2xl p-8 border border-[#c9a96e]/15">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-[#f5d98a] mx-auto mb-4" />
              <h3 className="font-serif text-xl text-[#f5d98a] mb-2">How the Wizard Works</h3>
              <div className="space-y-4 mt-6 text-left">
                {[
                  { step: "1", text: "Tell us about your book — type, format, and timeline" },
                  { step: "2", text: "Share your experience level so we can tailor guidance" },
                  { step: "3", text: "Get your personalized publishing roadmap instantly" },
                  { step: "4", text: "Follow the steps — each one links to the right tool" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#c9a96e]/20 flex items-center justify-center flex-shrink-0 border border-[#c9a96e]/30">
                      <span className="text-xs font-bold text-[#f5d98a]">{item.step}</span>
                    </div>
                    <p className="text-sm text-[#d4c8b4] pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#f3efe6] to-[#f0e8d8] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-3">What People Say</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1a1008]">Trusted by Authors & Publishers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white border-[#c9a96e]/15">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-[#c9a96e] text-[#c9a96e]" />
                    ))}
                  </div>
                  <p className="text-sm text-[#3a2a14] italic leading-relaxed mb-4">"{t.quote}"</p>
                  <p className="text-xs text-[#5c4a2a]/80 font-medium">— {t.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#1a1008] to-[#2a1a10] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-[#f5d98a] mb-4">Ready to Publish Your Book?</h2>
          <p className="text-[#d4c8b4]/90 mb-8 max-w-xl mx-auto">
            Join thousands of authors and publishers who use Easy Book Publishers to create professional, print-ready books. Free to start — no credit card required.
          </p>
          <Button onClick={() => navigate("/guided-journey")} size="lg" className="bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold text-base px-10 py-6 rounded-xl shadow-xl shadow-[#c9a96e]/25">
            Start the Publishing Wizard <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm text-[#5c4a2a]/70">
          <button onClick={() => navigate("/pricing")} className="hover:text-[#c9a96e] transition-colors">Pricing</button>
          <button onClick={() => navigate("/guide")} className="hover:text-[#c9a96e] transition-colors">User Guide</button>
          <button onClick={() => navigate("/resources")} className="hover:text-[#c9a96e] transition-colors">Resources</button>
          <button onClick={() => navigate("/affiliates")} className="hover:text-[#c9a96e] transition-colors">Affiliate Program</button>
          <button onClick={() => navigate("/privacy-terms")} className="hover:text-[#c9a96e] transition-colors">Privacy & Terms</button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
