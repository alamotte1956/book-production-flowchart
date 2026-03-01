/*
 * ProgressBar Component
 * Design: A thin progress bar at the top of the viewport showing
 * how far through the journey the reader has scrolled.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-[#e8dfd0]/50">
      <motion.div
        className="h-full bg-gradient-to-r from-[#c9a96e] via-[#7a2e3a] to-[#2d4a3e]"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}
