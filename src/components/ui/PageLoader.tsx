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
    <div className="animate-fadeIn flex min-h-100 w-full flex-col items-center justify-center px-6">
      {/* Unique Central Animation: The "Scanning Book" */}
      <div className="relative mb-8">
        {/* Glowing Background */}
        <div className="bg-brand/20 absolute inset-0 scale-150 animate-pulse rounded-full blur-3xl" />

        <div className="bg-bgCard border-borderMuted relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border p-8 shadow-2xl">
          {/* Animated "Book" Pages */}
          <motion.div
            className="flex items-end gap-1.5"
            initial="initial"
            animate="animate"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="bg-brand w-2 rounded-full"
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
            className="via-brand absolute top-0 left-0 h-1.5 w-full bg-linear-to-r from-transparent to-transparent opacity-60"
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
            className="bg-brand-light absolute h-1 w-1 rounded-full"
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
      <div className="max-w-xs space-y-4 text-center">
        <div className="space-y-1">
          <h3 className="font-display text-textMain text-xl font-bold tracking-tight">
            {message}
          </h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-brand-light h-5 text-sm font-medium"
            >
              {STUDY_TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="text-textDim flex items-center justify-center gap-2 text-xs">
          <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
          Optimizing your study path
        </p>
      </div>

      {/* Professional Skeleton Pulse Placeholder */}
      <div className="mt-16 w-full max-w-sm space-y-5 opacity-20">
        <div className="bg-bgSurface skeleton-shimmer h-2 w-full rounded-full" />
        <div className="bg-bgSurface skeleton-shimmer mx-auto h-2 w-2/3 rounded-full" />
        <div className="grid grid-cols-2 gap-4 pt-6">
          <div className="bg-bgSurface skeleton-shimmer h-16 rounded-2xl" />
          <div className="bg-bgSurface skeleton-shimmer h-16 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
