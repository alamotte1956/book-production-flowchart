/*
 * PhaseSection Component
 * Design: Each phase is a "chapter" in the publishing journey.
 * Features decorative chapter headers with drop-cap numbers,
 * and a winding path of step cards.
 */

import { motion } from "framer-motion";
import type { Phase } from "@/data/flowchartData";
import StepCard from "./StepCard";

interface PhaseSectionProps {
  phase: Phase;
  globalStepOffset: number;
  isFirst: boolean;
}

export default function PhaseSection({ phase, globalStepOffset, isFirst }: PhaseSectionProps) {
  return (
    <section
      id={`phase-${phase.id}`}
      className="relative py-12 md:py-20"
    >
      {/* Phase chapter header */}
      <motion.div
        className="text-center mb-12 md:mb-16 px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        {/* Decorative rule */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-12 md:w-20" style={{ backgroundColor: phase.accentColor }} />
          <div
            className="w-2 h-2 rotate-45"
            style={{ backgroundColor: phase.accentColor }}
          />
          <div className="h-px w-12 md:w-20" style={{ backgroundColor: phase.accentColor }} />
        </div>

        {/* Chapter number */}
        <motion.div
          className="font-serif text-6xl md:text-8xl font-bold leading-none mb-3"
          style={{ color: `${phase.accentColor}30` }}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {phase.number}
        </motion.div>

        {/* Phase title */}
        <h2
          className="font-serif text-2xl md:text-4xl font-bold mb-2"
          style={{ color: phase.accentColor }}
        >
          {phase.title}
        </h2>
        <p className="text-sm md:text-base text-[#7a6e60] max-w-md mx-auto italic">
          {phase.subtitle}
        </p>

        {/* Phase image */}
        {phase.image && (
          <motion.div
            className="mt-8 max-w-sm mx-auto rounded-lg overflow-hidden shadow-lg border-2"
            style={{ borderColor: `${phase.accentColor}30` }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img
              src={phase.image}
              alt={phase.title}
              className="w-full h-48 md:h-56 object-cover"
              loading="lazy"
            />
          </motion.div>
        )}

        {/* Bottom rule */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="h-px w-8 md:w-16" style={{ backgroundColor: `${phase.accentColor}40` }} />
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: phase.accentColor }}
          />
          <div className="h-px w-8 md:w-16" style={{ backgroundColor: `${phase.accentColor}40` }} />
        </div>
      </motion.div>

      {/* Winding path of steps */}
      <div className="relative max-w-5xl mx-auto px-4">
        {/* Vertical connecting line */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 hidden md:block"
          style={{
            background: `linear-gradient(to bottom, transparent, ${phase.accentColor}30 5%, ${phase.accentColor}30 95%, transparent)`,
          }}
        />

        {/* Steps */}
        <div className="space-y-8 md:space-y-12">
          {phase.steps.map((step, idx) => (
            <StepCard
              key={step.id}
              step={step}
              stepNumber={globalStepOffset + idx + 1}
              isLeft={idx % 2 === 0}
              accentColor={phase.accentColor}
              phaseColor={phase.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
