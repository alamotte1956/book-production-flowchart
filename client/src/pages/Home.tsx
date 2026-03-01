/*
 * Home Page — The Bookmaker's Journey
 * Design: Artisan storybook aesthetic with warm parchment tones,
 * flowing thread connections, and progressive reveal animations.
 * Navigation links use black text per user preference.
 */

import { phases } from "@/data/flowchartData";
import HeroSection from "@/components/HeroSection";
import PhaseSection from "@/components/PhaseSection";
import BookmarkSidebar from "@/components/BookmarkSidebar";
import ProgressBar from "@/components/ProgressBar";
import { motion } from "framer-motion";
import { BookOpen, Heart } from "lucide-react";

export default function Home() {
  let stepOffset = 0;

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      <ProgressBar />
      <BookmarkSidebar />

      {/* Hero */}
      <HeroSection />

      {/* Decorative transition from hero to content */}
      <div className="relative h-16 bg-gradient-to-b from-[#1a1008]/20 to-transparent" />

      {/* Introduction text */}
      <motion.div
        className="max-w-3xl mx-auto text-center px-6 py-12 md:py-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <p className="font-serif text-xl md:text-2xl text-[#5c3d2e] leading-relaxed italic">
          "Every book is a journey — not just for the reader, but for the dozens of skilled hands that guide it from a blank page to a bound volume."
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-[#c9a96e]" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a96e]" />
          <div className="h-px w-12 bg-[#c9a96e]" />
        </div>
        <p className="mt-6 font-sans text-sm md:text-base text-[#8b7b6b] max-w-xl mx-auto leading-relaxed">
          Click on any step below to reveal the detailed inputs required at that stage. Use the chapter bookmarks on the left to navigate between phases.
        </p>
      </motion.div>

      {/* Phase sections */}
      <main>
        {phases.map((phase, idx) => {
          const currentOffset = stepOffset;
          stepOffset += phase.steps.length;

          return (
            <div key={phase.id}>
              {/* Phase divider */}
              {idx > 0 && (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="h-px w-20 md:w-32 bg-gradient-to-r from-transparent to-[#c9a96e]/40" />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#c9a96e]/50">
                      <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor" />
                    </svg>
                    <div className="h-px w-20 md:w-32 bg-gradient-to-l from-transparent to-[#c9a96e]/40" />
                  </motion.div>
                </div>
              )}

              <PhaseSection
                phase={phase}
                globalStepOffset={currentOffset}
                isFirst={idx === 0}
              />
            </div>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="relative mt-16 py-16 bg-[#2a1a0a] text-[#c9a96e]/70">
        <div className="max-w-3xl mx-auto text-center px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#c9a96e]/30" />
            <BookOpen size={20} className="text-[#c9a96e]/50" />
            <div className="h-px w-12 bg-[#c9a96e]/30" />
          </div>
          <p className="font-serif text-lg md:text-xl text-[#c9a96e]/60 italic mb-4">
            "A book is a dream that you hold in your hand."
          </p>
          <p className="font-sans text-xs text-[#c9a96e]/40 mb-6">— Neil Gaiman</p>
          <p className="font-sans text-xs text-[#c9a96e]/30 flex items-center justify-center gap-1">
            Crafted with <Heart size={12} className="text-[#7a2e3a]/60" /> for the love of books
          </p>
        </div>
      </footer>
    </div>
  );
}
