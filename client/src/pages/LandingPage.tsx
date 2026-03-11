import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, CheckCircle2, Star, FileText, Upload, Sparkles, Printer,
  Globe, Menu, X, Shield, Clock, DollarSign, BookOpen, PenTool,
  Layers, Award, HeartHandshake, Zap, BarChart3, Users,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";

const HERO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/hero-banner-cxQRR1jXLBmcXxFPJoqxWN.webp";

const features = [
  { icon: BookOpen, title: "Choose a Template or Start Fresh", desc: "Browse 44 professional book templates — or go direct. Pick a trim size and typesetting style, then preview a sample page before committing." },
  { icon: Upload, title: "Upload Your Manuscript", desc: "Drop in your DOCX, PDF, or any of 26 accepted formats. Our parser extracts your text, detects chapters, and preserves your structure automatically." },
  { icon: Sparkles, title: "AI Typesets Your Book", desc: "Our typesetting engine applies professional layout in minutes — drop caps, running headers, smart typography, orphan/widow control, and chapter openers." },
  { icon: Printer, title: "Review, Approve & Download", desc: "Preview your typeset book, then download print-ready Interior PDF, KDP PDF with bleed, EPUB 3, and InDesign IDML — ready for Amazon, IngramSpark, or any retailer." },
];

const outputFormats = [
  { name: "Interior PDF", desc: "Press-ready interior with professional typography, drop caps, and running headers", badge: "Print" },
  { name: "KDP Print-Ready PDF", desc: "Amazon-compliant with exact bleed, gutter, and margin specs for your page count", badge: "Amazon" },
  { name: "EPUB 3", desc: "Standards-compliant ebook with reflowable text, TOC, and full metadata", badge: "Digital" },
  { name: "InDesign IDML", desc: "Real Adobe InDesign Interchange format for advanced layout customization", badge: "Pro" },
  { name: "ONIX 3.0 XML", desc: "Industry-standard metadata for distributors, retailers, and library systems", badge: "Data" },
];

const testimonials = [
  { quote: "As a new author, I had no idea what I was doing. Easy Book Publishers walked me through every step. My new book looks like it came from a major publishing house.", author: "Maria S.", role: "New Author, First Book", stars: 5 },
  { quote: "This platform saved me thousands in typesetting costs. The AI output is indistinguishable from work I've paid designers $3,000 for.", author: "James R.", role: "Self-Published Author, 4 books", stars: 5 },
  { quote: "The Bible Design Studio is unlike anything else on the market. Finally, a tool built for scripture publishers that understands verse structure.", author: "David L.", role: "Independent Publisher", stars: 5 },
  { quote: "I was a brand new author with a finished manuscript and no clue what came next. This platform made publishing my new book incredibly simple.", author: "Sarah K.", role: "New Author & Writing Coach", stars: 5 },
  { quote: "The AI writing assistant wrote a foreword and glossary that I barely had to edit. Perfect for new authors who don't know where to start with front matter.", author: "Michael T.", role: "New Non-Fiction Author", stars: 5 },
  { quote: "I compared this to Atticus and Vellum. Easier to use, better output, and a fraction of the price. Every new author should start here.", author: "Priya N.", role: "Self-Publisher, 7 titles", stars: 5 },
];

const stats = [
  { value: "26", label: "Manuscript Formats" },
  { value: "44", label: "Book Templates" },
  { value: "9", label: "Production Phases" },
  { value: "30", label: "Workflow Steps" },
];

const whyAuthorsChooseUs = [
  { icon: Clock, title: "Publish Your New Book in Minutes", desc: "Go from manuscript to print-ready files the same day. No waiting for designers or typesetters." },
  { icon: DollarSign, title: "New Authors Save Thousands", desc: "Professional typesetting typically costs $1,500-$5,000. Get the same quality from just $19.99/mo." },
  { icon: Shield, title: "You Keep 100%", desc: "Zero commission on your book sales. Zero royalty share. Your earnings are yours, always." },
  { icon: BookOpen, title: "Every Format, One Upload", desc: "Get print PDF, KDP-ready PDF, EPUB, and InDesign IDML — all from a single manuscript upload." },
  { icon: PenTool, title: "AI Writing Assistant", desc: "Generate your foreword, introduction, copyright page, back-cover blurb, and glossary with one click. Perfect for new authors." },
  { icon: Layers, title: "30-Step Guided Workflow", desc: "New to publishing? Follow a professional workflow from concept to published book. Never miss a step." },
];

const newAuthorFeatures = [
  { title: "Built for New Authors", desc: "Never published before? Our Publishing Wizard asks about your book and builds a personalized roadmap. Every step is explained in plain language — no experience needed." },
  { title: "Professional Results, Automatically", desc: "World-class typesetting with smart typography, drop caps, proper margins, and industry-standard formatting — automatically applied to your new book." },
  { title: "AI Writes Your Front & Back Matter", desc: "Generate a polished foreword, introduction, copyright page, author bio, glossary, and back-cover blurb. New authors save weeks of work." },
  { title: "One Platform, Everything You Need", desc: "Manuscript formatting, cover specs, spine calculator, ISBN management, and export to every major retailer — everything a new author needs in one place." },
];

const comparisonPoints = [
  { feature: "Price", us: "From $19.99/mo", others: "$147-$250+ one-time" },
  { feature: "Works on", us: "Any device, any browser", others: "Mac only (Vellum) or desktop app" },
  { feature: "AI Writing Assistant", us: "Foreword, intro, glossary, blurbs, bios", others: "Not included" },
  { feature: "InDesign IDML Export", us: "Included", others: "Not available" },
  { feature: "Production Workflow", us: "30-step guided tracker", others: "Formatting only" },
  { feature: "KDP-Ready PDF", us: "Auto-calculated bleed & gutter", others: "Basic export" },
];

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

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
            <a href="#new-authors" className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">New Authors</a>
            <button onClick={() => navigate("/pricing")} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">Pricing</button>
            <button onClick={() => navigate("/affiliates")} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors">Affiliates</button>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button onClick={() => navigate("/dashboard")} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors text-sm hidden md:block">
                  Dashboard
                </button>
                <Button onClick={logout} variant="outline" className="border-[#c9a96e]/40 text-[#f5d98a] hover:bg-[#c9a96e]/10 font-semibold hidden sm:flex" size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/login")} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors text-sm hidden md:block">
                  Sign In
                </button>
                <Button onClick={() => navigate("/pricing")} variant="outline" className="border-[#c9a96e]/40 text-[#f5d98a] hover:bg-[#c9a96e]/10 font-semibold hidden sm:flex" size="sm">
                  Sign Up
                </Button>
              </>
            )}
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
              <a href="#new-authors" onClick={() => setMobileMenuOpen(false)} className="text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">New Authors</a>
              <button onClick={() => { navigate("/pricing"); setMobileMenuOpen(false); }} className="text-left text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">Pricing</button>
              <button onClick={() => { navigate("/affiliates"); setMobileMenuOpen(false); }} className="text-left text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">Affiliates</button>
              {isAuthenticated ? (
                <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="text-left text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">Dashboard</button>
              ) : (
                <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="text-left text-[#d4c8b4] hover:text-[#f5d98a] transition-colors py-2 text-sm">Sign In</button>
              )}
              <div className="flex gap-3 pt-2 border-t border-[#c9a96e]/10">
                {isAuthenticated ? (
                  <Button onClick={() => { logout(); setMobileMenuOpen(false); }} variant="outline" className="border-[#c9a96e]/40 text-[#f5d98a] hover:bg-[#c9a96e]/10 font-semibold flex-1" size="sm">
                    Sign Out
                  </Button>
                ) : (
                  <Button onClick={() => { navigate("/pricing"); setMobileMenuOpen(false); }} variant="outline" className="border-[#c9a96e]/40 text-[#f5d98a] hover:bg-[#c9a96e]/10 font-semibold flex-1" size="sm">
                    Sign Up
                  </Button>
                )}
                <Button onClick={() => { navigate("/guided-journey"); setMobileMenuOpen(false); }} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold flex-1" size="sm">
                  Start the Wizard
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1008] via-[#2a1a10] to-[#1a1008]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${HERO_URL})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative max-w-7xl mx-auto px-6 pt-2 md:pt-3 pb-24 md:pb-32 text-center">
          <div className="inline-flex items-center gap-2 bg-[#c9a96e]/10 border border-[#c9a96e]/25 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-[#f5d98a]" />
            <span className="text-xs text-[#f5d98a] font-medium tracking-wide">The #1 Publishing Platform for New Authors</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#f5d98a] mb-4 leading-tight tracking-tight">
            Easy Book Publishers
          </h1>
          <p className="font-serif text-2xl md:text-4xl lg:text-5xl text-[#ede7d8] mb-6 leading-tight">
            New Author? New Book? <span className="text-[#f5d98a]">Start Here.</span>
          </p>
          <p className="text-lg md:text-xl text-[#d4c8b4] max-w-2xl mx-auto mb-4">
            The professional publishing platform built for new authors.
            Upload your manuscript, publish your new book in minutes.
          </p>
          <p className="text-sm text-[#d4c8b4]/70 max-w-lg mx-auto mb-10">
            No design skills needed. No software to install. Built for new authors with zero publishing experience.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button onClick={() => navigate("/guided-journey")} size="lg" className="bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold text-base px-8 py-6 rounded-xl shadow-xl shadow-[#c9a96e]/20">
              Start Your Book <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <p className="text-xs text-[#d4c8b4]/60 mb-12">30-day money-back guarantee. Ready in under 15 minutes.</p>
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

      {/* ── Trust Bar ── */}
      <section className="bg-[#ece5d8] border-y border-[#c9a96e]/15 py-5">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center items-center gap-x-10 gap-y-3 text-sm text-[#5c4a2a]/80">
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-[#c9a96e]" /> 30-Day Money-Back Guarantee</div>
          <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#c9a96e]" /> Zero Commission on Sales</div>
          <div className="flex items-center gap-2"><Award className="w-4 h-4 text-[#c9a96e]" /> Professional Typesetting Quality</div>
          <div className="flex items-center gap-2"><HeartHandshake className="w-4 h-4 text-[#c9a96e]" /> Built for New Authors</div>
        </div>
      </section>

      {/* ── Why Authors Choose Us ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-3">Why New Authors Choose Us</Badge>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1a1008] mb-3">Everything a New Author Needs to Publish Like a Pro</h2>
          <p className="text-[#5c4a2a]/85 max-w-2xl mx-auto">Other platforms give you a formatting tool. We give new authors a complete publishing partner — from your first word to your first sale.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyAuthorsChooseUs.map((item) => (
            <Card key={item.title} className="bg-white border-[#c9a96e]/10 hover:border-[#c9a96e]/30 transition-colors group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a96e]/15 to-[#c9a96e]/5 flex items-center justify-center mb-4 border border-[#c9a96e]/15 group-hover:from-[#c9a96e]/25 group-hover:to-[#c9a96e]/10 transition-colors">
                  <item.icon className="w-6 h-6 text-[#c9a96e]" />
                </div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[#5c4a2a]/85 leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-gradient-to-b from-[#f0e8d8] to-[#f3efe6] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-3">How It Works</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1a1008] mb-3">From Manuscript to Masterpiece in Four Steps</h2>
            <p className="text-[#5c4a2a]/85 max-w-xl mx-auto">Pick a template, upload your manuscript, let AI typeset it, then review and download production-ready files.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={f.title} className="text-center relative">
                {i < features.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#c9a96e]/30 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a96e]/20 to-[#c9a96e]/5 flex items-center justify-center mx-auto mb-4 border border-[#c9a96e]/15 relative">
                  <f.icon className="w-7 h-7 text-[#c9a96e]" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#c9a96e] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#1a1008]">{i + 1}</span>
                  </div>
                </div>
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
        </div>
      </section>

      {/* ── Output Formats ── */}
      <section id="output" className="bg-[#1a1008] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="bg-[#c9a96e]/15 text-[#f5d98a] border-[#c9a96e]/30 mb-3">Your New Book Files</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-[#ede7d8] mb-3">Production-Ready Exports for Your New Book</h2>
            <p className="text-[#d4c8b4]/80 max-w-xl mx-auto">Not mockups. Real, downloadable production files ready for print and distribution worldwide — professional quality from day one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {outputFormats.map((fmt) => (
              <Card key={fmt.name} className="bg-[#2a1a10] border-[#c9a96e]/10 hover:border-[#c9a96e]/25 transition-colors">
                <CardContent className="p-5 text-center">
                  <div className="flex justify-between items-start mb-3">
                    <FileText className="w-8 h-8 text-[#c9a96e]" />
                    <span className="text-[10px] uppercase tracking-wider bg-[#c9a96e]/15 text-[#f5d98a] px-2 py-0.5 rounded-full font-medium">{fmt.badge}</span>
                  </div>
                  <h3 className="font-serif text-sm font-bold text-[#ede7d8] mb-1 text-left">{fmt.name}</h3>
                  <p className="text-xs text-[#d4c8b4]/70 leading-relaxed text-left">{fmt.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built for New Authors ── */}
      <section id="new-authors" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-4">For New Authors</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1a1008] mb-4">
              New Author? Your New Book Starts Here.
            </h2>
            <p className="text-[#5c4a2a]/85 leading-relaxed mb-8 text-lg">
              We built Easy Book Publishers specifically for new authors publishing their first book. Every feature is designed so new authors can focus on what matters most — your story — while we handle the professional production.
            </p>
            <div className="space-y-6">
              {newAuthorFeatures.map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#c9a96e]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-[#c9a96e]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-[#1a1008] mb-1">{f.title}</h4>
                    <p className="text-sm text-[#5c4a2a]/80 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1a1008] to-[#2a1a10] rounded-2xl p-8 border border-[#c9a96e]/15">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-[#f5d98a] mx-auto mb-4" />
              <h3 className="font-serif text-xl text-[#f5d98a] mb-2">Your Publishing Roadmap</h3>
              <p className="text-sm text-[#d4c8b4]/70">Answer 4 questions. Get your personalized plan.</p>
            </div>
            <div className="space-y-4 text-left">
              {[
                { step: "1", text: "Tell us about your book — type, format, and timeline" },
                { step: "2", text: "Share your experience level so we tailor the guidance" },
                { step: "3", text: "Get your personalized roadmap with the exact steps to follow" },
                { step: "4", text: "Follow each step — every one links to the right tool" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#c9a96e]/20 flex items-center justify-center flex-shrink-0 border border-[#c9a96e]/30">
                    <span className="text-xs font-bold text-[#f5d98a]">{item.step}</span>
                  </div>
                  <p className="text-sm text-[#d4c8b4] pt-1">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button onClick={() => navigate("/guided-journey")} size="lg" className="bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold px-8 py-5 rounded-xl shadow-lg shadow-[#c9a96e]/20 w-full">
                Start Your Publishing Journey <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-xs text-[#d4c8b4]/50 mt-3">Get started in about 2 minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How We Compare ── */}
      <section className="bg-gradient-to-b from-[#f0e8d8] to-[#f3efe6] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-3">The Smart Choice for New Authors</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1a1008] mb-3">Why New Authors Choose Us Over the Competition</h2>
            <p className="text-[#5c4a2a]/85 max-w-xl mx-auto">See why new authors are choosing Easy Book Publishers over Atticus ($147) and Vellum ($250) for their new book.</p>
          </div>
          <Card className="bg-white border-[#c9a96e]/15 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#c9a96e]/15">
                    <th className="text-left p-4 font-serif text-[#5c4a2a]/70 font-medium">Feature</th>
                    <th className="text-center p-4 font-serif font-semibold text-[#1a1008] bg-[#c9a96e]/5">Easy Book Publishers</th>
                    <th className="text-center p-4 font-serif text-[#5c4a2a]/70 font-medium">Others</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonPoints.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-[#faf7f0]" : ""}>
                      <td className="p-4 text-[#3a2a14] font-medium">{row.feature}</td>
                      <td className="p-4 text-center text-[#1a1008] font-semibold bg-[#c9a96e]/5">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          {row.us}
                        </span>
                      </td>
                      <td className="p-4 text-center text-[#5c4a2a]/70">{row.others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="bg-[#1a1008] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="bg-[#c9a96e]/15 text-[#f5d98a] border-[#c9a96e]/30 mb-3">Complete New Author Toolkit</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-[#ede7d8] mb-3">Everything a New Author Needs in One Place</h2>
            <p className="text-[#d4c8b4]/80 max-w-2xl mx-auto">Stop juggling multiple tools. Easy Book Publishers gives new authors the only platform they need — from manuscript to published new book.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Sparkles, label: "AI Typesetting Engine", sub: "Professional layout in minutes" },
              { icon: PenTool, label: "AI Writing Assistant", sub: "Foreword, intro, blurb, glossary" },
              { icon: BarChart3, label: "30-Step Production Tracker", sub: "Never miss a publishing step" },
              { icon: BookOpen, label: "44 Book Templates", sub: "Industry-standard designs" },
              { icon: FileText, label: "5 Export Formats", sub: "PDF, EPUB, IDML, ONIX, KDP" },
              { icon: Globe, label: "Publish Everywhere", sub: "KDP, IngramSpark, B&N, Apple" },
              { icon: Layers, label: "Spine Calculator", sub: "Exact spine width for your cover" },
              { icon: Shield, label: "ISBN Manager", sub: "Organize and assign ISBNs" },
              { icon: Users, label: "Affiliate Program", sub: "Earn 20% referring authors" },
            ].map((tool) => (
              <div key={tool.label} className="flex items-center gap-4 bg-[#2a1a10] rounded-xl p-4 border border-[#c9a96e]/10">
                <div className="w-10 h-10 rounded-lg bg-[#c9a96e]/10 flex items-center justify-center flex-shrink-0">
                  <tool.icon className="w-5 h-5 text-[#c9a96e]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#ede7d8]">{tool.label}</h4>
                  <p className="text-xs text-[#d4c8b4]/60">{tool.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30 mb-3">New Author Stories</Badge>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1a1008] mb-3">New Authors Love Easy Book Publishers</h2>
            <p className="text-[#5c4a2a]/85 max-w-xl mx-auto">From brand-new authors publishing their first book to experienced writers launching their latest title — hear why they choose us.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white border-[#c9a96e]/15 hover:shadow-lg hover:shadow-[#c9a96e]/5 transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-[#c9a96e] text-[#c9a96e]" />
                    ))}
                  </div>
                  <p className="text-sm text-[#3a2a14] italic leading-relaxed mb-4">"{t.quote}"</p>
                  <div>
                    <p className="text-sm text-[#1a1008] font-semibold">{t.author}</p>
                    <p className="text-xs text-[#5c4a2a]/70">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-r from-[#1a1008] to-[#2a1a10] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-[#f5d98a] mb-4">Ready to Publish Your New Book?</h2>
          <p className="text-lg text-[#d4c8b4]/90 mb-3 max-w-xl mx-auto">
            Join thousands of new authors who use Easy Book Publishers to turn their manuscript into a professional, print-ready new book.
          </p>
          <p className="text-sm text-[#d4c8b4]/60 mb-10 max-w-md mx-auto">
            Plans from $19.99/mo. 30-day money-back guarantee. Built for new authors — your book, your earnings, zero commission.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => navigate("/guided-journey")} size="lg" className="bg-gradient-to-r from-[#d4b480] to-[#c9a96e] hover:from-[#e0c490] hover:to-[#d4b480] text-[#1a1008] font-bold text-base px-10 py-6 rounded-xl shadow-xl shadow-[#c9a96e]/25">
              Start Your Book <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button onClick={() => navigate("/pricing")} variant="outline" size="lg" className="border-[#c9a96e]/40 text-[#f5d98a] hover:bg-[#c9a96e]/10 font-semibold px-8 py-6 rounded-xl">
              View Pricing
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-[#d4c8b4]/60">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> 30-Day Guarantee</div>
            <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> 0% Commission</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Ready in Minutes</div>
          </div>
        </div>
      </section>

      {/* ── Footer Links ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm text-[#5c4a2a]/70">
          <button onClick={() => navigate("/pricing")} className="hover:text-[#c9a96e] transition-colors">Pricing</button>
          <button onClick={() => navigate("/guide")} className="hover:text-[#c9a96e] transition-colors">User Guide</button>
          <button onClick={() => navigate("/resources")} className="hover:text-[#c9a96e] transition-colors">Resources</button>
          <button onClick={() => navigate("/glossary")} className="hover:text-[#c9a96e] transition-colors">Publishing Glossary</button>
          <button onClick={() => navigate("/affiliates")} className="hover:text-[#c9a96e] transition-colors">Affiliate Program</button>
          <button onClick={() => navigate("/privacy-terms")} className="hover:text-[#c9a96e] transition-colors">Privacy & Terms</button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
