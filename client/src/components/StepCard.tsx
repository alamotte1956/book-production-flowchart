/*
 * StepCard Component
 * Design: Artisan storybook aesthetic — warm parchment cards with
 * decorative borders, expanding to reveal input details.
 * Alternates left/right in the winding path layout.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Step } from "@/data/flowchartData";
import * as Icons from "lucide-react";
import { ChevronDown, ArrowRight } from "lucide-react";

interface StepCardProps {
  step: Step;
  stepNumber: number;
  isLeft: boolean;
  accentColor: string;
  phaseColor: string;
}

function getIcon(iconName: string) {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent || Icons.Circle;
}

export default function StepCard({ step, stepNumber, isLeft, accentColor, phaseColor }: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = getIcon(step.icon);

  return (
    <div className={`flex items-start gap-4 md:gap-8 w-full ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
      {/* Card */}
      <motion.div
        className="flex-1 max-w-xl"
        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left group"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div
            className="relative rounded-lg border-2 p-5 md:p-6 transition-shadow duration-300 bg-white/80 backdrop-blur-sm"
            style={{
              borderColor: isExpanded ? accentColor : "#e8dfd0",
              boxShadow: isExpanded
                ? `0 8px 32px ${accentColor}20, 0 2px 8px rgba(0,0,0,0.06)`
                : "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* Decorative corner marks */}
            <div
              className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg"
              style={{ borderColor: accentColor }}
            />
            <div
              className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg"
              style={{ borderColor: accentColor }}
            />
            <div
              className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg"
              style={{ borderColor: accentColor }}
            />
            <div
              className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-lg"
              style={{ borderColor: accentColor }}
            />

            {/* Header */}
            <div className="flex items-start gap-4">
              <div
                className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
              >
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-sm font-semibold tracking-wider uppercase font-sans"
                    style={{ color: accentColor }}
                  >
                    Step {stepNumber}
                  </span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-semibold text-[#3a2a1a] leading-tight">
                  {step.title}
                </h3>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="shrink-0 mt-1"
              >
                <ChevronDown size={20} style={{ color: accentColor }} />
              </motion.div>
            </div>

            {/* Description */}
            <p className="mt-3 text-[#6b5c4c] font-sans text-sm md:text-base leading-relaxed">
              {step.description}
            </p>

            {/* Input count badge */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full font-sans"
                style={{
                  backgroundColor: `${accentColor}12`,
                  color: accentColor,
                }}
              >
                <ArrowRight size={12} />
                {step.inputs.length} input{step.inputs.length !== 1 ? "s" : ""}
              </span>
              {!isExpanded && (
                <span className="text-sm text-[#9b8b7b] font-sans">Click to expand</span>
              )}
            </div>
          </div>
        </motion.button>

        {/* Expanded inputs */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1 px-1">
                <div className="space-y-2.5">
                  {step.inputs.map((input, idx) => (
                    <motion.div
                      key={input.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.3 }}
                      className="flex items-start gap-3 p-3.5 rounded-lg border bg-white/60"
                      style={{ borderColor: `${accentColor}25` }}
                    >
                      <div
                        className="shrink-0 mt-0.5 w-6 h-6 rounded flex items-center justify-center text-xs font-bold font-sans"
                        style={{
                          backgroundColor: `${accentColor}15`,
                          color: accentColor,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-sans font-semibold text-sm text-[#3a2a1a]">
                          {input.name}
                        </p>
                        <p className="font-sans text-sm text-[#6b5c4c] mt-0.5 leading-relaxed">
                          {input.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Center connector dot */}
      <div className="shrink-0 flex flex-col items-center">
        <motion.div
          className="w-4 h-4 rounded-full border-2 bg-white z-10"
          style={{ borderColor: accentColor }}
          whileInView={{ scale: [0, 1.2, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      {/* Spacer for opposite side */}
      <div className="flex-1 max-w-xl hidden md:block" />
    </div>
  );
}
