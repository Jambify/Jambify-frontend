import React from 'react';
import { useNavigate }  from 'react-router-dom';
import { motion }       from 'framer-motion';
import { BookOpen, Trophy, ArrowRight, LogIn, Zap } from 'lucide-react';

/**
 * GuestLanding.tsx
 * ─────────────────
 * No auth required. Accessible at /guest.
 * Lets anonymous users try the quiz and mock exam
 * without signing up. Shows a soft CTA to create
 * an account to save their progress.
 */

const GuestLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bgMain text-textMain flex flex-col items-center justify-center p-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* <Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-125 h-125 bg-brand/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* <Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/40">
            <span className="text-white text-2xl font-black">J</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            JAMB<span className="text-brand">IFY</span>
          </h1>
          <p className="text-textDim text-sm mt-2">Try a free practice session — no account needed</p>
        </div>

        {/* <Action cards */}
        <div className="space-y-4 mb-8">

          {/* <Quick Quiz card */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/guest/quiz')}
            className="w-full bg-brand hover:bg-brand-light text-white rounded-brand-xl p-5 text-left transition-all shadow-lg shadow-brand/20 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-light/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Quick Quiz</p>
                  <p className="text-white/70 text-sm">10 questions · any subject · 5 mins</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          {/* <Mock Exam card */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/guest/mock')}
            className="w-full bg-bgCard border border-borderMuted hover:border-brand/40 rounded-brand-xl p-5 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <div className="flex align-items-center justify-items-center">
                    <div className="text-2xl mb-2">📝</div>
                   
                  <p className="font-bold text-lg text-textMain">Mock Exam</p>  
                  </div>
                <p className="text-xs text-textDim mt-1">2 hours · 180 questions · JAMB scoring</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-textDim group-hover:text-brand group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>

          {/* <Past Questions card */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/guest/past-questions')}
            className="w-full bg-bgCard border border-borderMuted hover:border-brand/40 rounded-brand-xl p-5 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <p className="font-bold text-lg text-textMain">Past Questions</p>
                  <p className="text-textDim text-sm">Browse JAMB questions by year & subject</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-textDim group-hover:text-brand group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        </div>

        {/* <Save progress CTA */}
        <div className="bg-brand/5 border border-brand/20 rounded-brand-xl p-5 text-center">
          <p className="text-sm text-textDim mb-3">
            Want to save your scores, track progress, and access all features?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/signup')}
              className="flex-1 bg-brand text-white py-3 rounded-brand font-bold text-sm hover:bg-brand-light transition-all active:scale-[0.98]"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="flex items-center gap-2 px-4 py-3 border border-borderMuted rounded-brand text-sm text-textDim hover:text-textMain hover:border-brand/40 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuestLanding;