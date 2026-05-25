import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageLoaderProps {
  message?: string;
}

const STUDY_TIPS = [
  "Personalizing your study roadmap...",
  "Analyzing weak topics for improvement...",
  "Gathering the latest JAMB resources...",
  "Calibrating difficulty levels...",
  "Syncing your progress with Supabase...",
];

/**
 * PageLoader
 * ──────────
 * A professional, student-focused loading state.
 * Uses a unique "scanning book" animation and rotating study tips.
 */
const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Analyzing data...",
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-100 w-full animate-fadeIn px-6">
      {/* Unique Central Animation: The "Scanning Book" */}
      <div className="relative mb-8">
        {/* Glowing Background */}
        <div className="absolute inset-0 bg-brand/20 blur-3xl rounded-full scale-150 animate-pulse" />

        <div className="relative bg-bgCard border border-borderMuted rounded-3xl p-8 shadow-2xl flex items-center justify-center overflow-hidden w-28 h-28">
          {/* Animated "Book" Pages */}
          <motion.div
            className="flex gap-1.5 items-end"
            initial="initial"
            animate="animate"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-2 bg-brand rounded-full"
                variants={{
                  initial: { height: 12 },
                  animate: {
                    height: [12, 40, 12],
                    transition: {
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    },
                  },
                }}
              />
            ))}
          </motion.div>

          {/* Scanning Beam */}
          <motion.div
            className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-transparent via-brand to-transparent opacity-60"
            animate={{
              top: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-brand-light rounded-full"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: [0, i % 2 === 0 ? 50 : -50],
              y: [0, -60],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
            style={{
              left: "50%",
              top: "50%",
            }}
          />
        ))}
      </div>

      {/* Professional Message */}
      <div className="text-center space-y-4 max-w-xs">
        <div className="space-y-1">
          <h3 className="text-xl font-display font-bold text-textMain tracking-tight">
            {message}
          </h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-brand-light font-medium h-5"
            >
              {STUDY_TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="text-xs text-textDim flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          Optimizing your study path
        </p>
      </div>

      {/* Professional Skeleton Pulse Placeholder */}
      <div className="mt-16 w-full max-w-sm space-y-5 opacity-20">
        <div className="h-2 bg-bgSurface rounded-full w-full animate-pulse" />
        <div className="h-2 bg-bgSurface rounded-full w-2/3 mx-auto animate-pulse" />
        <div className="grid grid-cols-2 gap-4 pt-6">
          <div className="h-16 bg-bgSurface rounded-2xl animate-pulse" />
          <div className="h-16 bg-bgSurface rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
