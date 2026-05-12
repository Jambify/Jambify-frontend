// components/ui/LoadingScreen.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  estimatedTime?: number; // seconds
}

const LOADING_TIPS = [
  { icon: '🎯', text: 'AI is personalizing your questions' },
  { icon: '📚', text: 'Loading the latest JAMB syllabus' },
  { icon: '⚡', text: 'Preparing your study plan' },
  { icon: '🏆', text: 'Setting up your leaderboard' },
  { icon: '🧠', text: 'Calibrating difficulty levels' },
  { icon: '📊', text: 'Analyzing past performance data' },
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Setting up your account', 
  submessage = 'This will just take a moment',
  estimatedTime = 3 
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate tips every 2 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2500);
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
    <div className="min-h-screen bg-linear-to-br from-[#0F1115] to-[#1A1D23] flex flex-col items-center justify-center p-4">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-brand/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{ 
              y: [null, -100, -200],
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      {/* Main loading card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1A1D23]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/30">
            <span className="text-white text-2xl font-black">J</span>
          </div>
          <span className="font-display font-bold text-2xl text-white">
            JAMB<span className="text-brand">IFY</span>
          </span>
        </div>

        {/* Animated loader */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <motion.div
            className="absolute inset-0 border-4 border-brand rounded-full"
            style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-brand rounded-full"
            />
          </div>
        </div>

        {/* Message */}
        <h3 className="text-xl font-bold text-white text-center mb-2">
          {message}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >...</motion.span>
        </h3>
        <p className="text-white/40 text-sm text-center mb-6">{submessage}</p>

        {/* Progress bar */}
        <div className="w-full bg-white/5 rounded-full h-1 mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-linear-to-r from-brand to-brand-light rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Rotating tips */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/5 rounded-lg p-3 text-center"
          >
            <span className="text-2xl mr-2">{LOADING_TIPS[tipIndex].icon}</span>
            <span className="text-white/60 text-sm">{LOADING_TIPS[tipIndex].text}</span>
          </motion.div>
        </AnimatePresence>

        {/* Estimated time */}
        <p className="text-white/20 text-xs text-center mt-4">
          Estimated time: {estimatedTime} seconds
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;