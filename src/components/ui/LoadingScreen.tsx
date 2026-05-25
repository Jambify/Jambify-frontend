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
    <div className="min-h-screen bg-bgMain flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[120px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full animate-pulse"
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
        <div className="flex flex-col items-center mb-12">
          <motion.div
            className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center shadow-2xl shadow-brand/40 mb-6 relative overflow-hidden group"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-white text-4xl font-black tracking-tighter">
              J
            </span>
          </motion.div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-textMain">
            JAMB<span className="text-brand">IFY</span>
          </h1>
          <div className="h-1 w-12 bg-brand/30 rounded-full mt-2" />
        </div>

        {/* Loading Card */}
        <div className="bg-bgCard border border-borderMuted rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Shimmer line */}
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-brand to-transparent"
            animate={{ left: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />

          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-textMain mb-1 capitalize">
                {message}
              </h3>
              <p className="text-xs text-textDim font-medium tracking-wide uppercase">
                {submessage}
              </p>
            </div>

            {/* Progress Container */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-textDim uppercase tracking-widest">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-bgSurface rounded-full overflow-hidden border border-borderMuted p-0.5">
                <motion.div
                  className="h-full bg-brand rounded-full relative"
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
                className="bg-bgSurface/50 border border-borderMuted rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-bgCard rounded-xl flex items-center justify-center text-xl shadow-sm">
                  {LOADING_TIPS[tipIndex].icon}
                </div>
                <p className="text-xs text-textMuted leading-relaxed font-medium">
                  {LOADING_TIPS[tipIndex].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-[10px] text-textDim font-bold uppercase tracking-[0.2em] mt-8 opacity-50">
          Powered by JAMBIFY AI
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
