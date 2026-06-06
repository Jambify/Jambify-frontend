// components/ui/LoadingScreen.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  estimatedTime?: number; // seconds
}

const LOADING_TIPS = [
  { icon: "🎯", text: "AI is personalizing your questions" },
  { icon: "📚", text: "Loading the latest JAMB syllabus" },
  { icon: "⚡", text: "Preparing your study plan" },
  { icon: "🏆", text: "Setting up your leaderboard" },
  { icon: "🧠", text: "Calibrating difficulty levels" },
  { icon: "📊", text: "Analyzing past performance data" },
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Setting up your account",
  submessage = "Preparing your personalized study experience",
  estimatedTime = 3,
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate tips every 3 seconds for better readability
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3000);
    return () => clearInterval(tipInterval);
  }, []);

  // Animate progress bar
  useEffect(() => {
    const startTime = Date.now();
    const duration = estimatedTime * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [estimatedTime]);

  return (
    <div className="bg-bgMain relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-brand/5 absolute top-[-10%] left-[-10%] h-[40%] w-[40%] animate-pulse rounded-full blur-[120px]" />
        <div
          className="bg-brand/10 absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] animate-pulse rounded-full blur-[120px]"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo Animation */}
        <div className="mb-12 flex flex-col items-center">
          <motion.div
            className="bg-brand shadow-brand/40 group relative mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl shadow-2xl"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="text-4xl font-black tracking-tighter text-white">
              J
            </span>
          </motion.div>

          <h1 className="font-display text-textMain text-3xl font-bold tracking-tight">
            JAMB<span className="text-brand">IFY</span>
          </h1>
          <div className="bg-brand/30 mt-2 h-1 w-12 rounded-full" />
        </div>

        {/* Loading Card */}
        <div className="bg-bgCard border-borderMuted relative overflow-hidden rounded-3xl border p-8 shadow-2xl backdrop-blur-md">
          {/* Shimmer line */}
          <motion.div
            className="via-brand absolute top-0 left-0 h-0.5 w-full bg-linear-to-r from-transparent to-transparent"
            animate={{ left: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />

          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-textMain mb-1 text-lg font-bold capitalize">
                {message}
              </h3>
              <p className="text-textDim text-xs font-medium tracking-wide uppercase">
                {submessage}
              </p>
            </div>

            {/* Progress Container */}
            <div className="space-y-2">
              <div className="text-textDim flex justify-between text-[10px] font-bold tracking-widest uppercase">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="bg-bgSurface border-borderMuted h-2 overflow-hidden rounded-full border p-0.5">
                <motion.div
                  className="bg-brand relative h-full rounded-full"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent" />
                </motion.div>
              </div>
            </div>

            {/* Tip Section */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tipIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-bgSurface/50 border-borderMuted flex items-center gap-4 rounded-2xl border p-4"
              >
                <div className="bg-bgCard flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-sm">
                  {LOADING_TIPS[tipIndex].icon}
                </div>
                <p className="text-textMuted text-xs leading-relaxed font-medium">
                  {LOADING_TIPS[tipIndex].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="text-textDim mt-8 text-center text-[10px] font-bold tracking-[0.2em] uppercase opacity-50">
          Powered by JAMBIFY AI
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
