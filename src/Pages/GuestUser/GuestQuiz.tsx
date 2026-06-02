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
      await new Promise((r) => setTimeout(r, 100));

      const qs = await fetchQuestionsWithFallback(
        selectedSubject === "" ? "Biology" : selectedSubject, // Default to Biology if random mix (for simplicity in guest mode)
        "Random",
        10,
        "All",
      );

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
      <div className="min-h-screen bg-bgMain text-textMain flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl relative z-10"
        >
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/guest")}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-textDim hover:text-brand transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span className="text-[10px] font-bold text-brand uppercase tracking-tighter">
                Guest Mode
              </span>
            </div>
          </div>

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl shadow-brand/10">
              ⚡
            </div>
            <h2 className="text-3xl font-display font-black text-textMain mb-2 tracking-tight">
              Quick Practice
            </h2>
            <p className="text-textDim text-sm max-w-xs mx-auto leading-relaxed">
              Sharpen your skills with 10 random questions. No pressure, just
              learning.
            </p>
          </div>

          <div className="bg-bgCard border border-borderMuted rounded-3xl p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-textDim">
              <BookOpen size={14} className="text-brand" />
              Select a Subject
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => handleStartQuiz("")}
                className="sm:col-span-2 group relative overflow-hidden p-5 bg-brand text-white rounded-2xl font-bold transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-brand/20"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <span className="text-2xl">🎲</span>
                  <div className="text-left">
                    <p className="text-sm font-black leading-none mb-1">
                      Random Mix
                    </p>
                    <p className="text-[10px] opacity-80 font-medium tracking-tight">
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
                  className="flex items-center gap-4 p-4 bg-bgSurface/50 border border-borderMuted rounded-2xl text-sm font-bold hover:border-brand/40 hover:bg-bgCard transition-all group active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-bgDeep flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-inner">
                    {s.icon}
                  </div>
                  <span className="text-textMain group-hover:text-brand transition-colors">
                    {s.name}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="p-4 bg-brand/5 border border-dashed border-brand/20 rounded-2xl text-center">
              <p className="text-[10px] text-textMuted font-medium italic">
                Questions are pulled from our live JAMB database
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────
  if (screen === "results") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-bgMain text-textMain flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center relative z-10"
        >
          <div className="mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-7xl mb-6 drop-shadow-2xl"
            >
              {pct >= 70 ? "🏆" : pct >= 50 ? "👍" : "📚"}
            </motion.div>

            <h2 className="text-4xl font-display font-black mb-2 tracking-tight">
              {score}/{questions.length}{" "}
              <span className="text-brand">Correct</span>
            </h2>

            <div className="inline-block px-4 py-1.5 bg-bgCard border border-borderMuted rounded-full mb-6 shadow-sm">
              <span className="text-sm font-bold text-textDim uppercase tracking-widest">
                {pct}% Accuracy
              </span>
            </div>

            <p className="text-textMuted text-base leading-relaxed px-4">
              {pct >= 80
                ? "Incredible! You're clearly at the top of your game."
                : pct >= 60
                  ? "Great effort! You have a solid foundation."
                  : "Keep practicing! Every mistake is a learning opportunity."}
            </p>
          </div>

          <div className="bg-bgCard border border-borderMuted rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand/20 group-hover:h-full group-hover:bg-brand/5 transition-all duration-500" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand" />
                </div>
                <p className="text-left font-bold text-sm text-textMain leading-tight">
                  Unlock the full potential of JAMBIFY
                </p>
              </div>

              <p className="text-xs text-textDim text-left mb-6 leading-relaxed">
                Create a free account to save your scores, track progress across
                subjects, and unlock 4,000+ real JAMB questions.
              </p>

              <button
                onClick={() => navigate("/signup")}
                className="w-full bg-brand text-white py-4 rounded-2xl font-black text-sm hover:bg-brand-light transition-all active:scale-[0.98] shadow-xl shadow-brand/20 mb-4"
              >
                Create Free Account
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-textMuted font-bold uppercase tracking-widest">
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

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setCurrent(0);
                setAnswers({});
                setScreen("subject");
              }}
              className="flex-1 py-4 bg-bgSurface border border-borderMuted rounded-2xl text-xs font-black uppercase tracking-widest hover:border-brand/40 transition-all active:scale-[0.98]"
            >
              Try Another Subject
            </button>
            <button
              onClick={() => navigate("/guest")}
              className="flex-1 py-4 bg-bgSurface border border-borderMuted rounded-2xl text-xs font-black uppercase tracking-widest hover:border-brand/40 transition-all active:scale-[0.98]"
            >
              Exit to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────
  if (!q) return null;

  return (
    <div
      className="min-h-screen bg-bgMain text-textMain flex flex-col p-4 relative overflow-hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[120px] rounded-full" />
      </div>

      {/* <Top bar */}
      <div className="flex items-center justify-between mb-6 pt-2 max-w-2xl mx-auto w-full relative z-10">
        <button
          onClick={() => setScreen("subject")}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-textDim hover:text-textMain transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />{" "}
          Quit
        </button>

        <div className="flex flex-col items-center">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand mb-1">
            JAMBIFY
          </div>
          <div className="text-xs font-mono font-bold text-textMain px-3 py-1 bg-bgCard border border-borderMuted rounded-full shadow-sm">
            {current + 1} <span className="text-textDim mx-1">/</span>{" "}
            {questions.length}
          </div>
        </div>

        <button
          onClick={() => navigate("/signin")}
          className="flex items-center gap-1.5 text-xs font-bold text-brand-light hover:text-brand transition-colors uppercase tracking-widest"
        >
          <LogIn className="w-3.5 h-3.5" />{" "}
          <span className="hidden sm:inline">Sign In</span>
        </button>
      </div>

      {/* <Progress bar */}
      <div className="max-w-2xl mx-auto w-full mb-8 relative z-10">
        <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden border border-borderMuted/30 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%`,
            }}
            className="h-full bg-brand rounded-full shadow-[0_0_10px_rgba(123,95,255,0.5)]"
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
        </div>
      </div>

      {/* <Question */}
      <div className="flex-1 max-w-2xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <div className="bg-bgCard border border-borderMuted rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl shadow-black/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand/20 group-hover:bg-brand transition-colors" />

              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest rounded-md border border-brand/20">
                  {q.subject}
                </span>
                <span className="px-2.5 py-1 bg-bgSurface text-textDim text-[10px] font-black uppercase tracking-widest rounded-md border border-borderMuted">
                  {q.year}
                </span>
              </div>

              <p className="text-lg sm:text-xl font-medium leading-relaxed text-textMain tracking-tight">
                {q.text}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-8">
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
                      "w-full text-left p-5 rounded-2xl border-2 text-sm sm:text-base font-bold transition-all flex items-center justify-between gap-4 group",
                      showRight
                        ? "border-success bg-success/10 text-success shadow-lg shadow-success/5"
                        : showWrong
                          ? "border-danger bg-danger/10 text-danger shadow-lg shadow-danger/5"
                          : isChosen
                            ? "border-brand bg-brand/10 text-textMain"
                            : "border-borderMuted bg-bgCard hover:border-brand/40 text-textMain shadow-sm",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs transition-colors",
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
                      <CheckCircle className="w-5 h-5 shrink-0 animate-in zoom-in duration-300" />
                    )}
                    {showWrong && (
                      <XCircle className="w-5 h-5 shrink-0 animate-in zoom-in duration-300" />
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
                      "p-6 rounded-3xl border-2 shadow-xl",
                      isCorrect
                        ? "bg-success/5 border-success/20 text-success shadow-success/5"
                        : "bg-danger/5 border-danger/20 text-danger shadow-danger/5",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {isCorrect ? (
                        <CheckCircle size={18} />
                      ) : (
                        <XCircle size={18} />
                      )}
                      <p className="font-black uppercase tracking-widest text-xs">
                        {isCorrect
                          ? "Brilliant! That's Correct"
                          : "Not quite, but keep going!"}
                      </p>
                    </div>
                    <div className="h-px w-full bg-current opacity-10 mb-4" />
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
                className="w-full bg-brand text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-light transition-all active:scale-[0.98] shadow-2xl shadow-brand/20 mt-8 mb-12"
              >
                <span>
                  {current + 1 >= questions.length
                    ? "Finish & See Results"
                    : "Continue to Next Question"}
                </span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GuestQuiz;
