/*
 * BookmarkSidebar Component
 * Design: A persistent sidebar resembling bookmarks/tabs sticking out
 * from the edge of a book. Shows all phases with active state tracking.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { phases } from "@/data/flowchartData";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export default function BookmarkSidebar() {
  const [activePhase, setActivePhase] = useState("concept");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) setIsCollapsed(true);
  }, [isMobile]);

  // Track which phase is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Get the one closest to the top
          const closest = visible.reduce((a, b) =>
            Math.abs(a.boundingClientRect.top) < Math.abs(b.boundingClientRect.top) ? a : b
          );
          const id = closest.target.id.replace("phase-", "");
          setActivePhase(id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    phases.forEach((phase) => {
      const el = document.getElementById(`phase-${phase.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToPhase = (phaseId: string) => {
    const el = document.getElementById(`phase-${phaseId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          <motion.nav
            key="expanded"
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            exit={{ x: -200 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-white/95 backdrop-blur-md border-r-2 border-t-2 border-b-2 rounded-r-xl shadow-xl py-3 px-2"
            style={{ borderColor: "#c9a96e" }}
          >
            {/* Collapse button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border-2 rounded-r-md flex items-center justify-center shadow-md hover:bg-[#faf6ef] transition-colors"
              style={{ borderColor: "#c9a96e", borderLeft: "none" }}
            >
              <ChevronLeft size={14} className="text-[#5c3d2e]" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 px-2 pb-2 mb-2 border-b" style={{ borderColor: "#e8dfd0" }}>
              <BookOpen size={16} className="text-[#c9a96e]" />
              <span className="font-serif text-xs font-semibold text-[#5c3d2e] tracking-wide uppercase">
                Chapters
              </span>
            </div>

            {/* Phase list */}
            <div className="space-y-0.5">
              {phases.map((phase) => {
                const isActive = activePhase === phase.id;
                return (
                  <button
                    key={phase.id}
                    onClick={() => scrollToPhase(phase.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-200 group ${
                      isActive ? "bg-[#faf6ef]" : "hover:bg-[#faf6ef]/50"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-sans transition-all duration-200 ${
                        isActive ? "text-white" : "text-[#8b7b6b]"
                      }`}
                      style={{
                        backgroundColor: isActive ? phase.accentColor : `${phase.accentColor}15`,
                      }}
                    >
                      {phase.number}
                    </span>
                    <span
                      className={`font-sans text-xs leading-tight transition-colors duration-200 ${
                        isActive ? "font-semibold text-[#3a2a1a]" : "text-[#7b6c5c] group-hover:text-[#5c3d2e]"
                      }`}
                    >
                      {phase.title}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: phase.accentColor }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.nav>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ x: -40 }}
            animate={{ x: 0 }}
            exit={{ x: -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => setIsCollapsed(false)}
            className="bg-white/95 backdrop-blur-md border-2 rounded-r-xl shadow-lg p-2.5 hover:bg-[#faf6ef] transition-colors"
            style={{ borderColor: "#c9a96e", borderLeft: "none" }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <BookOpen size={18} className="text-[#c9a96e]" />
              <ChevronRight size={14} className="text-[#5c3d2e]" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
