import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../Store/UseUserStore';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { CheckCircle, Sparkles, Trophy, Target } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { name, subjectCombo, targetScore, university } = useUserStore();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    // Auto-navigate to dashboard after 8 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const getSubjectLabel = (combo: string) => {
    const labels: Record<string, string> = {
      'medicine': 'Medicine & Pharmacy',
      'engineering': 'Engineering & Tech', 
      'social-sci': 'Social Sciences',
      'law': 'Law & Arts'
    };
    return labels[combo] || combo;
  };

  const handleGetStarted = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex flex-col items-center justify-center p-4 pb-[env(safe-area-inset-bottom)]">
      {/* Animated background elements */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth - window.innerWidth / 2,
                y: -50,
                rotate: Math.random() * 360
              }}
              animate={{ 
                y: window.innerHeight + 50,
                rotate: Math.random() * 720
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 5
              }}
              className="absolute w-2 h-2 bg-linear-to-r from-brand to-brand-light rounded-full opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center font-display font-black text-white text-xl shadow-[0_0_20px_rgba(var(--brand-rgb),0.5)]">
          J
        </div>
        <span className="font-display font-bold text-2xl tracking-tight text-white">
          JAMB<span className="text-brand">IFY</span>
        </span>
      </div>

      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1A1D23] border border-white/5 rounded-4xl p-8 text-center shadow-2xl backdrop-blur-md"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-linear-to-r from-success to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          {/* Welcome Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-display font-bold text-white mb-2"
          >
            Welcome to JAMBIFY, {name}! 
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 mb-8"
          >
            You're all set to ace your JAMB exams! 
          </motion.p>

          {/* Achievement Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-8"
          >
            <div className="bg-[#2A2D35] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-brand-light" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Target University</p>
                  <p className="text-xs text-white/60">{university || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2D35] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-brand-light" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Subject Track</p>
                  <p className="text-xs text-white/60">{getSubjectLabel(subjectCombo)}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2D35] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-brand-light" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Target Score</p>
                  <p className="text-xs text-white/60">{targetScore || 'Not set'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              onClick={handleGetStarted}
              className="w-full bg-brand hover:bg-brand/90 text-white py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-brand/20"
            >
              Start Your Journey
            </Button>
            
            <p className="text-xs text-white/40">
              Redirecting automatically in 8 seconds...
            </p>
          </motion.div>

          {/* Progress indicator */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 8, ease: "linear" }}
            className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden"
          >
            <div className="h-full bg-linear-to-r from-brand to-brand-light rounded-full" />
          </motion.div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-white/60">
            <span className="font-semibold text-brand-light">Pro Tip:</span> Start with a quiz to assess your current level!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
