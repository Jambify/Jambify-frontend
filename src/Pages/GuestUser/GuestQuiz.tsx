import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchQuestionsWithFallback } from "../../Services/questionService";
import LoadingScreen from "../../components/ui/LoadingScreen";
import type { Question } from "../../Types";
import { cn } from "../../lib/utils/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  LogIn,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GuestLayout from "../../components/Layout/GuestLayout";

import { useOfflineStore } from "../../Store/useOfflineStore";

type Screen = "subject" | "quiz" | "results";

const QUIZ_SUBJECTS = [
  { name: "English", icon: "📖", color: "from-blue-500 to-indigo-600" },
  { name: "Mathematics", icon: "🔢", color: "from-emerald-500 to-teal-600" },
  { name: "Physics", icon: "⚡", color: "from-amber-400 to-orange-600" },
  { name: "Chemistry", icon: "⚗️", color: "from-rose-500 to-pink-600" },
  { name: "Biology", icon: "🧬", color: "from-green-500 to-emerald-700" },
  { name: "Economics", icon: "📊", color: "from-orange-400 to-amber-600" },
  { name: "Government", icon: "🏛️", color: "from-purple-500 to-indigo-700" },
  { name: "Literature", icon: "📚", color: "from-pink-500 to-rose-700" },
  { name: "History", icon: "📜", color: "from-amber-700 to-orange-900" },
  { name: "Geography", icon: "🌍", color: "from-blue-400 to-cyan-600" },
  { name: "CRS", icon: "✝️", color: "from-indigo-400 to-blue-600" },
];

const GuestQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("subject");
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplain, setShowExplain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartQuiz = async (selectedSubject: string) => {
    setSubject(selectedSubject);
    setIsLoading(true);

    try {
      // Small delay for smooth transition to loader
      await new Promise((r) => setTimeout(r, 200));

      const isOnline = navigator.onLine;
      const offlineStore = useOfflineStore.getState();

      let qs: Question[] = [];

      // Try offline first if user is offline
      if (!isOnline && selectedSubject !== "") {
        console.log(
          `📴 Guest Offline: Checking local cache for ${selectedSubject}...`,
        );
        const packs = offlineStore.downloadedPacks.filter((p) =>
          p.startsWith(selectedSubject.toLowerCase().slice(0, 3)),
        );
        if (packs.length > 0) {
          const offlineQs = await offlineStore.getOfflineQuestions(packs[0]);
          if (offlineQs.length > 0) {
            qs = offlineQs.sort(() => Math.random() - 0.5).slice(0, 10);
            console.log(
              `✅ Loaded ${qs.length} guest questions from offline pack: ${packs[0]}`,
            );
          }
        }
      }

      if (qs.length === 0) {
        qs = await fetchQuestionsWithFallback(
          selectedSubject === "" ? "Biology" : selectedSubject, // Default to Biology if random mix (for simplicity in guest mode)
          "Random",
          10,
          "All",
        );
      }

      setQuestions(qs);
      setScreen("quiz");
      setCurrent(0);
      setAnswers({});
    } catch (error) {
      console.error("Failed to load guest quiz questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        message="Preparing your quiz"
        submessage={
          subject === ""
            ? "Creating a random mix for you..."
            : `Fetching ${subject} questions...`
        }
        estimatedTime={2}
      />
    );
  }

  const q = questions[current];
  const chosen = answers[current] ?? -1;
  const answered = chosen !== -1;
  const isCorrect = chosen === q?.answer;
  const score = Object.entries(answers).filter(
    ([i, a]) => a === questions[Number(i)]?.answer,
  ).length;

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setAnswers((prev) => ({ ...prev, [current]: idx }));
    setShowExplain(true);
  };

  const handleNext = () => {
    setShowExplain(false);
    if (current + 1 >= questions.length) {
      setScreen("results");
    } else {
      setCurrent((c) => c + 1);
    }
  };

  // ── Subject picker ────────────────────────────────────────────────────
  if (screen === "subject") {
    return (
      <GuestLayout className="flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-2xl"
        >
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => navigate("/guest")}
              className="text-textDim hover:text-brand group flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </button>
            <div className="bg-brand/10 border-brand/20 flex items-center gap-2 rounded-full border px-3 py-1">
              <div className="bg-brand h-1.5 w-1.5 animate-pulse rounded-full" />
              <span className="text-brand text-[10px] font-bold tracking-tighter uppercase">
                Guest Mode
              </span>
            </div>
          </div>

          <div className="mb-10 text-center">
            <div className="bg-brand/10 border-brand/20 shadow-brand/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl shadow-xl">
              ⚡
            </div>
            <h2 className="font-display text-textMain mb-2 text-3xl font-black tracking-tight">
              Quick Practice
            </h2>
            <p className="text-textDim mx-auto max-w-xs text-sm leading-relaxed">
              Sharpen your skills with 10 random questions. No pressure, just
              learning.
            </p>
          </div>

          <div className="bg-bgCard border-borderMuted rounded-3xl border p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="text-textDim mb-6 flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
              <BookOpen size={14} className="text-brand" />
              Select a Subject
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => handleStartQuiz("")}
                className="group bg-brand shadow-brand/20 relative overflow-hidden rounded-2xl p-5 font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] sm:col-span-2"
              >
                <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <span className="text-2xl">🎲</span>
                  <div className="text-left">
                    <p className="mb-1 text-sm leading-none font-black">
                      Random Mix
                    </p>
                    <p className="text-[10px] font-medium tracking-tight opacity-80">
                      Questions from across all subjects
                    </p>
                  </div>
                </div>
              </button>

              {QUIZ_SUBJECTS.map((s, idx) => (
                <motion.button
                  key={s.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleStartQuiz(s.name)}
                  className="bg-bgSurface/50 border-borderMuted hover:border-brand/40 hover:bg-bgCard group flex items-center gap-4 rounded-2xl border p-4 text-sm font-bold transition-all active:scale-[0.98]"
                >
                  <div className="bg-bgDeep flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-inner transition-transform group-hover:scale-110">
                    {s.icon}
                  </div>
                  <span className="text-textMain group-hover:text-brand transition-colors">
                    {s.name}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="bg-brand/5 border-brand/20 rounded-2xl border border-dashed p-4 text-center">
              <p className="text-textMuted text-[10px] font-medium italic">
                Questions are pulled from our live JAMB database
              </p>
            </div>
          </div>
        </motion.div>
      </GuestLayout>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────
  if (screen === "results") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <GuestLayout className="flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md text-center"
        >
          <div className="mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 text-7xl drop-shadow-2xl"
            >
              {pct >= 70 ? "🏆" : pct >= 50 ? "👍" : "📚"}
            </motion.div>

            <h2 className="font-display mb-2 text-4xl font-black tracking-tight">
              {score}/{questions.length}{" "}
              <span className="text-brand">Correct</span>
            </h2>

            <div className="bg-bgCard border-borderMuted mb-6 inline-block rounded-full border px-4 py-1.5 shadow-sm">
              <span className="text-textDim text-sm font-bold tracking-widest uppercase">
                {pct}% Accuracy
              </span>
            </div>

            <p className="text-textMuted px-4 text-base leading-relaxed">
              {pct >= 80
                ? "Incredible! You're clearly at the top of your game."
                : pct >= 60
                  ? "Great effort! You have a solid foundation."
                  : "Keep practicing! Every mistake is a learning opportunity."}
            </p>
          </div>

          <div className="bg-bgCard border-borderMuted group relative mb-8 overflow-hidden rounded-3xl border p-8 shadow-2xl">
            <div className="bg-brand/20 group-hover:bg-brand/5 absolute top-0 left-0 h-1 w-full transition-all duration-500 group-hover:h-full" />

            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-brand/10 flex h-10 w-10 items-center justify-center rounded-xl">
                  <Sparkles className="text-brand h-5 w-5" />
                </div>
                <p className="text-textMain text-left text-sm leading-tight font-bold">
                  Unlock the full potential of JAMBIFY
                </p>
              </div>

              <p className="text-textDim mb-6 text-left text-xs leading-relaxed">
                Create a free account to save your scores, track progress across
                subjects, and unlock 4,000+ real JAMB questions.
              </p>

              <button
                onClick={() => navigate("/signup")}
                className="bg-brand hover:bg-brand-light shadow-brand/20 mb-4 w-full rounded-2xl py-4 text-sm font-black text-white shadow-xl transition-all active:scale-[0.98]"
              >
                Create Free Account
              </button>

              <div className="text-textMuted flex items-center justify-center gap-4 text-[10px] font-bold tracking-widest uppercase">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={10} className="text-success" /> Save Scores
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={10} className="text-success" /> Track
                  Progress
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                setCurrent(0);
                setAnswers({});
                setScreen("subject");
              }}
              className="bg-bgSurface border-borderMuted hover:border-brand/40 flex-1 rounded-2xl border py-4 text-xs font-black tracking-widest uppercase transition-all active:scale-[0.98]"
            >
              Try Another Subject
            </button>
            <button
              onClick={() => navigate("/guest")}
              className="bg-bgSurface border-borderMuted hover:border-brand/40 flex-1 rounded-2xl border py-4 text-xs font-black tracking-widest uppercase transition-all active:scale-[0.98]"
            >
              Exit to Home
            </button>
          </div>
        </motion.div>
      </GuestLayout>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────
  if (!q && screen === "quiz") {
    return (
      <GuestLayout className="flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-brand/10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Sparkles className="text-brand h-8 w-8" />
        </div>
        <h2 className="font-display mb-2 text-2xl font-black">
          Session Expired
        </h2>
        <p className="text-textDim mb-8 max-w-xs text-sm">
          Your practice session was reset because of a page refresh.
        </p>
        <button
          onClick={() => setScreen("subject")}
          className="bg-brand shadow-brand/20 rounded-2xl px-8 py-4 text-sm font-black tracking-widest text-white uppercase shadow-xl transition-all active:scale-[0.98]"
        >
          Start New Session
        </button>
      </GuestLayout>
    );
  }

  if (!q) return null; // Fallback for safety

  return (
    <GuestLayout className="flex flex-col p-4">
      {/* <Top bar */}
      <div className="relative z-10 mx-auto mb-6 flex w-full max-w-2xl items-center justify-between pt-2">
        <button
          onClick={() => setScreen("subject")}
          className="text-textDim hover:text-textMain group flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />{" "}
          Quit
        </button>

        <div className="flex flex-col items-center">
          <div className="text-brand mb-1 text-[10px] font-black tracking-[0.2em] uppercase">
            JAMBIFY
          </div>
          <div className="text-textMain bg-bgCard border-borderMuted rounded-full border px-3 py-1 font-mono text-xs font-bold shadow-sm">
            {current + 1} <span className="text-textDim mx-1">/</span>{" "}
            {questions.length}
          </div>
        </div>

        <button
          onClick={() => navigate("/signin")}
          className="text-brand-light hover:text-brand flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <LogIn className="h-3.5 w-3.5" />{" "}
          <span className="hidden sm:inline">Sign In</span>
        </button>
      </div>

      {/* <Progress bar */}
      <div className="relative z-10 mx-auto mb-8 w-full max-w-2xl">
        <div className="bg-bgSurface border-borderMuted/30 h-1.5 overflow-hidden rounded-full border shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%`,
            }}
            className="bg-brand h-full rounded-full shadow-[0_0_10px_rgba(123,95,255,0.5)]"
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
        </div>
      </div>

      {/* <Question */}
      <div className="relative z-10 mx-auto w-full max-w-2xl flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <div className="bg-bgCard border-borderMuted group relative mb-6 overflow-hidden rounded-3xl border p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">
              <div className="bg-brand/20 group-hover:bg-brand absolute top-0 left-0 h-full w-1 transition-colors" />

              <div className="mb-4 flex items-center gap-2">
                <span className="bg-brand/10 text-brand border-brand/20 rounded-md border px-2.5 py-1 text-[10px] font-black tracking-widest uppercase">
                  {q.subject}
                </span>
                <span className="bg-bgSurface text-textDim border-borderMuted rounded-md border px-2.5 py-1 text-[10px] font-black tracking-widest uppercase">
                  {q.year}
                </span>
              </div>

              <p className="text-textMain text-lg leading-relaxed font-medium tracking-tight sm:text-xl">
                {q.text}
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-3">
              {q.options.map((opt, i) => {
                const isChosen = chosen === i;
                const isRight = i === q.answer;
                const showRight = answered && isRight;
                const showWrong = answered && isChosen && !isRight;

                return (
                  <motion.button
                    key={i}
                    whileHover={!answered ? { x: 4 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    className={cn(
                      "group flex w-full items-center justify-between gap-4 rounded-2xl border-2 p-5 text-left text-sm font-bold transition-all sm:text-base",
                      showRight
                        ? "border-success bg-success/10 text-success shadow-success/5 shadow-lg"
                        : showWrong
                          ? "border-danger bg-danger/10 text-danger shadow-danger/5 shadow-lg"
                          : isChosen
                            ? "border-brand bg-brand/10 text-textMain"
                            : "border-borderMuted bg-bgCard hover:border-brand/40 text-textMain shadow-sm",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs transition-colors",
                          showRight
                            ? "bg-success text-white"
                            : showWrong
                              ? "bg-danger text-white"
                              : isChosen
                                ? "bg-brand text-white"
                                : "bg-bgDeep text-textDim group-hover:bg-brand/10 group-hover:text-brand",
                        )}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </div>
                    {showRight && (
                      <CheckCircle className="animate-in zoom-in h-5 w-5 shrink-0 duration-300" />
                    )}
                    {showWrong && (
                      <XCircle className="animate-in zoom-in h-5 w-5 shrink-0 duration-300" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* <Explanation */}
            <AnimatePresence>
              {showExplain && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      "rounded-3xl border-2 p-6 shadow-xl",
                      isCorrect
                        ? "bg-success/5 border-success/20 text-success shadow-success/5"
                        : "bg-danger/5 border-danger/20 text-danger shadow-danger/5",
                    )}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle size={18} />
                      ) : (
                        <XCircle size={18} />
                      )}
                      <p className="text-xs font-black tracking-widest uppercase">
                        {isCorrect
                          ? "Brilliant! That's Correct"
                          : "Not quite, but keep going!"}
                      </p>
                    </div>
                    <div className="mb-4 h-px w-full bg-current opacity-10" />
                    <p className="text-textMain text-sm leading-relaxed font-medium">
                      {q.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {answered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="bg-brand hover:bg-brand-light shadow-brand/20 mt-8 mb-12 flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-sm font-black tracking-widest text-white uppercase shadow-2xl transition-all active:scale-[0.98]"
              >
                <span>
                  {current + 1 >= questions.length
                    ? "Finish & See Results"
                    : "Continue to Next Question"}
                </span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </GuestLayout>
  );
};

export default GuestQuiz;
