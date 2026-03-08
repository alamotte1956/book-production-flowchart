import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Zap, Ruler, Layers, BookMarked, LayoutGrid, Library,
  ArrowRight, CheckCircle2, Star, FileText, Upload, Sparkles, Printer,
  Globe, Users, Search, ChevronRight, Menu, X,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";

const HERO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/hero-banner-cxQRR1jXLBmcXxFPJoqxWN.webp";

const features = [
  { icon: Upload, title: "Upload Your Manuscript", desc: "Drop in your DOCX, PDF, or any of 30+ formats. Our parser handles the rest." },
  { icon: Sparkles, title: "AI-Powered Typesetting", desc: "Professional book layout generated instantly — headers, footers, chapter openers, and more." },
  { icon: Printer, title: "Print-Ready Output", desc: "Download real Interior PDF, KDP-qualified PDF, EPUB, and InDesign IDML files." },
  { icon: Globe, title: "Publish Anywhere", desc: "Export files ready for Amazon KDP, IngramSpark, Barnes & Noble, or your own printer." },
];

const tools = [
  { icon: BookOpen, label: "Bible Design Studio", desc: "Configure any Bible edition — trim, paper, binding, and typesetting style.", path: "/bible-studio", badge: "Bible" },
  { icon: Zap, label: "AI Auto-Produce", desc: "Generate typeset PDF and EPUB previews instantly with AI-powered layout.", path: "/auto-produce/0", badge: "AI" },
  { icon: Ruler, label: "Spine Calculator", desc: "Calculate exact spine width from page count, paper type, and binding.", path: "/spine-calculator", badge: "Print" },
  { icon: Layers, label: "Cover Designer", desc: "Full-wrap cover dimensions, bleed, safe zones, and spec sheet export.", path: "/cover-designer", badge: "Design" },
  { icon: BookMarked, label: "ISBN & Metadata", desc: "Manage ISBN, BISAC codes, and export ONIX 3.0 XML for distributors.", path: "/isbn-manager", badge: "Metadata" },
  { icon: LayoutGrid, label: "40+ Templates", desc: "One-click presets for Bibles, devotionals, novels, children's books, and more.", path: "/templates", badge: "Templates" },
  { icon: Search, label: "ISBN Book Lookup", desc: "Look up any book by ISBN and get instant template recommendations.", path: "/isbn-lookup", badge: "Lookup" },
  { icon: Library, label: "Resources Hub", desc: "43 curated publishing tools — Scrivener, IngramSpark, NetGalley, and more.", path: "/resources", badge: "Reference" },
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
  { value: "40+", label: "Book Templates" },
  { value: "9", label: "Production Phases" },
  { value: "30", label: "Workflow Steps" },
];

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf6ef]">
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
            <a href="#tools" className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">Tools</a>
            <a href="#how-it-works" className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">How It Works</a>
            <a href="#output" className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">Output</a>
            <button onClick={() => navigate("/pricing")} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">Pricing</button>
            <button onClick={() => navigate("/affiliates")} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">Affiliates</button>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/pricing")} variant="outline" size="sm" className="border-[#c9a96e]/30 text-[#f5d98a] hover:bg-[#c9a96e]/10 hidden sm:flex">
              Pricing
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold hidden sm:flex" size="sm">
              Open Dashboard
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
              <a href="#tools" onClick={() => setMobileMenuOpen(false)} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">Tools</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">How It Works</a>
              <a href="#output" onClick={() => setMobileMenuOpen(false)} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">Output</a>
              <button onClick={() => { navigate("/pricing"); setMobileMenuOpen(false); }} className="text-left text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">Pricing</button>
              <button onClick={() => { navigate("/affiliates"); setMobileMenuOpen(false); }} className="text-left text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">Affiliates</button>
              <div className="flex gap-3 pt-2 border-t border-[#c9a96e]/10">
                <Button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold flex-1" size="sm">
                  Open Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1008] via-[#2a1a10] to-[#1a1008]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${HERO_URL})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
          <Badge className="bg-[#c9a96e]/15 text-[#f5d98a] border-[#c9a96e]/30 mb-6">All-in-One Self-Publishing Platform</Badge>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#f5d98a] mb-4 leading-tight tracking-tight">
            Easy Book Publishers
          </h1>
          <p className="font-serif text-2xl md:text-4xl lg:text-5xl text-[#f5efe0] mb-6 leading-tight">
            From Manuscript to <span className="text-[#f5d98a]">Masterpiece</span>
          </p>
          <p className="text-lg md:text-xl text-[#d4c8b4] max-w-2xl mx-auto mb-10">
            Design, typeset, and produce print-ready books with professional AI-powered tools.
            No software to download. Works on any device.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button onClick={() => navigate("/dashboard")} size="lg" className="bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold text-base px-8 py-6 rounded-xl shadow-xl shadow-[#c9a96e]/20">
              Start Publishing Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button onClick={() => navigate("/guided-journey")} variant="outline" size="lg" className="border-[#c9a96e]/30 text-[#f5d98a] hover:bg-[#c9a96e]/10 px-8 py-6 rounded-xl">
              Take the Publishing Wizard
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
      </section>

      <section id="tools" className="bg-[#1a1008] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="bg-[#c9a96e]/15 text-[#f5d98a] border-[#c9a96e]/30 mb-3">Professional Suite</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-[#f5efe0] mb-3">Publisher Tools Hub</h2>
            <p className="text-[#d4c8b4]/80 max-w-xl mx-auto">Everything you need to create, design, and publish your book — all in one platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {tools.map((tool) => (
              <Card
                key={tool.label}
                className="bg-[#2a1a10] border-[#c9a96e]/10 hover:border-[#c9a96e]/30 transition-all cursor-pointer group"
                onClick={() => navigate(tool.path)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#c9a96e]/10 flex items-center justify-center">
                      <tool.icon className="w-5 h-5 text-[#c9a96e]" />
                    </div>
                    <Badge variant="outline" className="text-[10px] border-[#c9a96e]/20 text-[#c9a96e]/90">{tool.badge}</Badge>
                  </div>
                  <h3 className="font-serif text-[#f5efe0] font-semibold mb-1 group-hover:text-[#f5d98a] transition-colors">{tool.label}</h3>
                  <p className="text-xs text-[#d4c8b4]/70 leading-relaxed">{tool.desc}</p>
                  <div className="mt-3 text-[#c9a96e] text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open <ChevronRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button onClick={() => navigate("/dashboard")} size="lg" className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold px-8">
              Open Full Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <section id="output" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-3">Real Output Files</Badge>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1a1008] mb-3">Production-Ready Exports</h2>
          <p className="text-[#5c4a2a]/85 max-w-xl mx-auto">Not mockups. Not previews. Real, downloadable production files ready for print and distribution.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {outputFormats.map((fmt) => (
            <Card key={fmt.name} className="bg-white border-[#c9a96e]/15 hover:shadow-md transition-shadow">
              <CardContent className="p-5 text-center">
                <FileText className="w-8 h-8 text-[#c9a96e] mx-auto mb-3" />
                <h3 className="font-serif text-sm font-bold text-[#1a1008] mb-1">{fmt.name}</h3>
                <p className="text-xs text-[#5c4a2a]/80 leading-relaxed">{fmt.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-[#faf6ef] to-[#f0e8d8] py-20">
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

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl text-[#1a1008] mb-3">Where Do You Want to Go?</h2>
          <p className="text-[#5c4a2a]/85 max-w-xl mx-auto">Choose your starting point</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Sparkles, title: "Dashboard", desc: "Access all tools, projects, and your publishing workflow.", path: "/dashboard", cta: "Open Dashboard" },
            { icon: BookOpen, title: "Publishing Wizard", desc: "New here? Take our guided quiz to get a personalized roadmap.", path: "/guided-journey", cta: "Start Wizard" },
            { icon: LayoutGrid, title: "Browse Templates", desc: "Explore 40+ book templates for every genre and format.", path: "/templates", cta: "View Templates" },
            { icon: FileText, title: "Pricing & Plans", desc: "Free Starter plan, Author Pro, and Publisher tiers.", path: "/pricing", cta: "See Plans" },
          ].map((item) => (
            <Card
              key={item.title}
              className="bg-white border-[#c9a96e]/15 hover:shadow-lg hover:border-[#c9a96e]/30 transition-all cursor-pointer group"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c9a96e]/15 to-[#c9a96e]/5 flex items-center justify-center mx-auto mb-4 group-hover:from-[#c9a96e]/25 group-hover:to-[#c9a96e]/10 transition-colors">
                  <item.icon className="w-6 h-6 text-[#c9a96e]" />
                </div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[#5c4a2a]/85 leading-relaxed mb-4">{item.desc}</p>
                <span className="text-sm text-[#c9a96e] font-semibold flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                  {item.cta} <ArrowRight className="w-4 h-4" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#1a1008] to-[#2a1a10] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-[#f5d98a] mb-4">Ready to Publish Your Book?</h2>
          <p className="text-[#d4c8b4]/90 mb-8 max-w-xl mx-auto">
            Join thousands of authors and publishers who use Easy Book Publishers to create professional, print-ready books. Free to start — no credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate("/dashboard")} size="lg" className="bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold text-base px-10 py-6 rounded-xl shadow-xl shadow-[#c9a96e]/25">
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button onClick={() => navigate("/guide")} variant="outline" size="lg" className="border-[#c9a96e]/30 text-[#f5d98a] hover:bg-[#c9a96e]/10 px-8 py-6 rounded-xl">
              Read the Guide
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm text-[#5c4a2a]/70">
          <button onClick={() => navigate("/guide")} className="hover:text-[#c9a96e] transition-colors">User Guide</button>
          <button onClick={() => navigate("/resources")} className="hover:text-[#c9a96e] transition-colors">Resources</button>
          <button onClick={() => navigate("/print-specs")} className="hover:text-[#c9a96e] transition-colors">Print Specs</button>
          <button onClick={() => navigate("/isbn-lookup")} className="hover:text-[#c9a96e] transition-colors">ISBN Lookup</button>
          <button onClick={() => navigate("/affiliates")} className="hover:text-[#c9a96e] transition-colors">Affiliate Program</button>
          <button onClick={() => navigate("/privacy-terms")} className="hover:text-[#c9a96e] transition-colors">Privacy & Terms</button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
