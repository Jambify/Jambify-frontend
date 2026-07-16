import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Trophy, ArrowRight, LogIn, Zap } from "lucide-react";
import ThemeToggle from "../../components/ui/ThemeToggle";
import schooldraLogo from "../../assets/schooldraLogo.png";
import PageHelmet from "../../components/SEO/PageHelmet";
// import { cn } from "../../lib/utils/utils";

/**
 * GuestLanding.tsx
 * ─────────────────
 * No auth required. Accessible at /guest.
 * Lets anonymous users try the quiz and mock exam
 * without signing up. Shows a soft CTA to create
 * an account to save their progress.
 */

const FEATURES = [
  {
    icon: Zap,
    label: "Quick quizzes",
    desc: "10-question bursts on any subject",
  },
  {
    icon: Trophy,
    label: "Full mock exams",
    desc: "180 questions · real JAMB scoring",
  },
  {
    icon: BookOpen,
    label: "Past questions",
    desc: "Browse JAMB questions by year & subject",
  },
  {
    icon: ArrowRight,
    label: "No sign-up needed",
    desc: "Start practicing in seconds",
  },
];

const GuestLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageHelmet
        title="Practice JAMB for Free | SCHOOLDRA"
        description="Start practicing JAMB UTME immediately with free quizzes, mock exams, and past questions — no account required."
        canonical="https://www.schooldra.com/guest"
      />
      <div
        className="bg-bgMain text-textMain relative flex min-h-screen overflow-hidden transition-colors duration-150 ease-in-out"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Left Brand Panel */}
        <div className="border-borderMuted bg-bgSurface relative hidden overflow-hidden border-r transition-all duration-150 ease-in-out lg:flex lg:w-[40%] xl:w-[35%]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,var(--color-brand-dim),transparent_60%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.25] dark:opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--color-textMuted) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-12">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <img src={schooldraLogo} alt="Schooldra" className="h-8 w-8" />
              <span className="font-display text-lg font-bold tracking-tight">
                Schooldra
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="my-auto max-w-lg py-8"
            >
              <h2 className="font-display text-textMain mb-4 text-3xl leading-tight font-bold tracking-tight xl:text-4xl">
                Practice JAMB for Free
              </h2>
              <p className="text-textMuted text-sm leading-relaxed xl:text-base">
                Start practicing immediately without creating an account.
              </p>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid gap-3"
            >
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <li
                  key={label}
                  className="border-borderMuted bg-bgCard/50 flex items-start gap-3 rounded-xl border p-3 shadow-sm backdrop-blur-sm"
                >
                  <div className="bg-brand/10 text-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-textMain text-xs font-bold">{label}</p>
                    <p className="text-textDim text-[11px]">{desc}</p>
                  </div>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="relative flex min-h-screen flex-1 flex-col transition-colors duration-150 ease-in-out">
          <div className="bg-brand/10 pointer-events-none absolute top-0 right-1/4 h-125 w-125 rounded-full opacity-40 blur-[120px] dark:opacity-60" />
          <div className="bg-brand/5 pointer-events-none absolute bottom-0 left-1/4 h-125 w-125 rounded-full opacity-40 blur-[120px] dark:opacity-60" />

          <div className="absolute top-4 right-4 z-20 lg:top-8 lg:right-8">
            <ThemeToggle />
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-16 lg:py-12 xl:px-24">
            <div className="lg:max-w-110ad mx-auto w-full max-w-md lg:mx-0">
              {/* Mobile Logo */}
              <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
                <img src={schooldraLogo} alt="Schooldra" className="h-8 w-8" />
                <span className="font-display text-lg font-bold tracking-tight">
                  Schooldra
                </span>
              </div>

              {/* Action Cards */}
              <div className="mb-8 space-y-4">
                {/* Quick Quiz Card */}
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

                {/* Mock Exam Card */}
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

                          <p className="text-textMain text-lg font-bold">
                            Mock Exam
                          </p>
                        </div>
                        <p className="text-textDim mt-1 text-xs">
                          2 hours · 180 questions · JAMB scoring
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="text-textDim group-hover:text-brand h-5 w-5 transition-all group-hover:translate-x-1" />
                  </div>
                </motion.button>

                {/* Past Questions Card */}
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

              {/* Save progress CTA */}
              <div className="bg-brand/5 border-brand/20 rounded-brand-xl border p-5 text-center">
                <p className="text-textDim mb-3 text-sm">
                  Want to save your scores, track progress, and access all
                  features?
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
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestLanding;
