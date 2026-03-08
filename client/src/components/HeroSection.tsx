/*
 * HeroSection Component
 * Design: Full-width artisan workshop banner with warm overlay,
 * decorative typography, and scroll-down indicator.
 */

import { motion } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";
import { totalSteps, phases } from "@/data/flowchartData";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/hero-banner-4ATUWJrGbMM2NwNBnWom3f.webp";

export default function HeroSection() {
  const scrollToContent = () => {
    const el = document.getElementById("phase-concept");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Publishing workshop"
          className="w-full h-full object-cover"
        />
        {/* Warm overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1008]/70 via-[#2a1a0a]/60 to-[#1a1008]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Decorative top ornament */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="h-px w-16 bg-[#c9a96e]/60" />
          <BookOpen className="text-[#c9a96e]" size={24} />
          <div className="h-px w-16 bg-[#c9a96e]/60" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold text-[#faf6ef] leading-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Create Design
          <br />
          <span className="text-[#c9a96e]">Publish LLC</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="font-sans text-lg md:text-xl text-[#e8dfd0] max-w-2xl mx-auto mb-6 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          An interactive guide to every step in the production of a book — from the first spark of an idea to a finished volume in a reader's hands.
        </motion.p>

        {/* Stats */}
        <motion.div
          className="flex items-center justify-center gap-8 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-bold text-[#c9a96e]">{phases.length}</div>
            <div className="font-sans text-sm text-[#c9a96e]/80 uppercase tracking-wider mt-1">Phases</div>
          </div>
          <div className="w-px h-10 bg-[#c9a96e]/30" />
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-bold text-[#c9a96e]">{totalSteps}</div>
            <div className="font-sans text-sm text-[#c9a96e]/80 uppercase tracking-wider mt-1">Steps</div>
          </div>
          <div className="w-px h-10 bg-[#c9a96e]/30" />
          <div className="text-center">
            <div className="font-serif text-3xl md:text-4xl font-bold text-[#c9a96e]">100+</div>
            <div className="font-sans text-sm text-[#c9a96e]/80 uppercase tracking-wider mt-1">Inputs</div>
          </div>
        </motion.div>

        {/* Decorative bottom ornament */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="h-px w-10 bg-[#c9a96e]/40" />
          <div className="w-2 h-2 rotate-45 bg-[#c9a96e]/50" />
          <div className="h-px w-10 bg-[#c9a96e]/40" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToContent}
          className="inline-flex flex-col items-center gap-1 text-[#c9a96e]/70 hover:text-[#c9a96e] transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <span className="font-sans text-sm uppercase tracking-widest">Begin the Journey</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.button>
      </div>
    </header>
  );
}
