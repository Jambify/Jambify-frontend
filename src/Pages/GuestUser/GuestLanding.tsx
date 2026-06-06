import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Trophy, ArrowRight, LogIn, Zap } from "lucide-react";
import GuestLayout from "../../components/Layout/GuestLayout";

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
    <GuestLayout className="flex flex-col items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        {/* <Logo */}
        <div className="mb-10 text-center">
          <div className="bg-brand shadow-brand/40 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg">
            <span className="text-2xl font-black text-white">J</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            JAMB<span className="text-brand">IFY</span>
          </h1>
          <p className="text-textDim mt-2 text-sm">
            Try a free practice session — no account needed
          </p>
        </div>

        {/* <Action cards */}
        <div className="mb-8 space-y-4">
          {/* <Quick Quiz card */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/guest/quiz")}
            className="bg-brand hover:bg-brand-light rounded-brand-xl shadow-brand/20 group w-full p-5 text-left text-white shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-brand-light/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-bold">Quick Quiz</p>
                  <p className="text-sm text-white/70">
                    10 questions · any subject · 5 mins
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 opacity-70 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>

          {/* <Mock Exam card */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/guest/mock")}
            className="bg-bgCard border-borderMuted hover:border-brand/40 rounded-brand-xl group w-full border p-5 text-left transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-brand/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Trophy className="text-brand h-6 w-6" />
                </div>
                <div>
                  <div className="align-items-center flex justify-items-center">
                    <div className="mb-2 text-2xl">📝</div>

                    <p className="text-textMain text-lg font-bold">Mock Exam</p>
                  </div>
                  <p className="text-textDim mt-1 text-xs">
                    2 hours · 180 questions · JAMB scoring
                  </p>
                </div>
              </div>
              <ArrowRight className="text-textDim group-hover:text-brand h-5 w-5 transition-all group-hover:translate-x-1" />
            </div>
          </motion.button>

          {/* <Past Questions card */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/guest/past-questions")}
            className="bg-bgCard border-borderMuted hover:border-brand/40 rounded-brand-xl group w-full border p-5 text-left transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-brand/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <BookOpen className="text-brand h-6 w-6" />
                </div>
                <div>
                  <p className="text-textMain text-lg font-bold">
                    Past Questions
                  </p>
                  <p className="text-textDim text-sm">
                    Browse JAMB questions by year & subject
                  </p>
                </div>
              </div>
              <ArrowRight className="text-textDim group-hover:text-brand h-5 w-5 transition-all group-hover:translate-x-1" />
            </div>
          </motion.button>
        </div>

        {/* <Save progress CTA */}
        <div className="bg-brand/5 border-brand/20 rounded-brand-xl border p-5 text-center">
          <p className="text-textDim mb-3 text-sm">
            Want to save your scores, track progress, and access all features?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="bg-brand rounded-brand hover:bg-brand-light flex-1 py-3 text-sm font-bold text-white transition-all active:scale-[0.98]"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate("/signin")}
              className="border-borderMuted rounded-brand text-textDim hover:text-textMain hover:border-brand/40 flex items-center gap-2 border px-4 py-3 text-sm transition-all"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

export default GuestLanding;
