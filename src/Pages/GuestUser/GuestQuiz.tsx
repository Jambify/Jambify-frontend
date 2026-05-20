import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SAMPLE_QUESTIONS } from "../../Data/Question";
import { cn } from "../../lib/utils/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  LogIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Screen = "subject" | "quiz" | "results";

const SUBJECTS = [
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Literature in English",
  "History",
  "Geography",
  "Government",
  "Economics",
  "CRS",
];

const GuestQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("subject");
  const [subject, setSubject] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplain, setShowExplain] = useState(false);

  const questions = useMemo(() => {
    const pool = SAMPLE_QUESTIONS.filter(
      (q) => !subject || q.subject === subject,
    );
    // Shuffle and take 10
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
  }, [subject]);

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
      <div className="min-h-screen bg-bgMain text-textMain flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate("/guest")}
            className="flex items-center gap-2 text-sm text-textDim hover:text-textMain mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-2xl font-bold mb-2">Pick a Subject</h2>
          <p className="text-textDim text-sm mb-6">
            10 random questions · no time limit
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => {
                setSubject("");
                setScreen("quiz");
              }}
              className="col-span-2 py-4 bg-brand text-white rounded-brand-xl font-bold hover:bg-brand-light transition-all active:scale-[0.98]"
            >
              🎲 Random Mix
            </button>
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSubject(s);
                  setScreen("quiz");
                }}
                className="py-3 bg-bgCard border border-borderMuted rounded-brand-xl text-sm font-medium hover:border-brand/40 hover:bg-bgCard transition-all active:scale-[0.98]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────
  if (screen === "results") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-bgMain text-textMain flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">
            {pct >= 70 ? "🏆" : pct >= 50 ? "👍" : "📚"}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {score}/{questions.length} Correct
          </h2>
          <p className="text-textDim mb-8">
            {pct >= 70
              ? "Excellent! You're well prepared."
              : pct >= 50
                ? "Good effort! Keep practising."
                : "Keep studying — you'll improve!"}
          </p>

          <div className="bg-brand/5 border border-brand/20 rounded-brand-xl p-5 mb-6 text-left">
            <p className="text-sm text-textDim mb-3">
              📊 Create a free account to save your score, track progress, and
              unlock 4,000+ questions.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="w-full bg-brand text-white py-3 rounded-brand font-bold text-sm hover:bg-brand-light transition-all active:scale-[0.98]"
            >
              Save My Progress — It's Free
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrent(0);
                setAnswers({});
                setScreen("subject");
              }}
              className="flex-1 py-3 border border-borderMuted rounded-brand text-sm font-medium hover:border-brand/40 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/guest")}
              className="flex-1 py-3 border border-borderMuted rounded-brand text-sm font-medium hover:border-brand/40 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────
  if (!q) return null;

  return (
    <div
      className="min-h-screen bg-bgMain text-textMain flex flex-col p-4"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* <Top bar */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <button
          onClick={() => setScreen("subject")}
          className="flex items-center gap-2 text-sm text-textDim hover:text-textMain transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quit
        </button>
        <div className="text-xs font-mono text-textDim">
          {current + 1} / {questions.length}
        </div>
        <button
          onClick={() => navigate("/signin")}
          className="flex items-center gap-1.5 text-xs text-brand-light"
        >
          <LogIn className="w-3.5 h-3.5" /> Sign In
        </button>
      </div>

      {/* <Progress bar */}
      <div className="h-1 bg-bgSurface rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-300"
          style={{
            width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* <Question */}
      <div className="flex-1 max-w-2xl mx-auto w-full">
        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-5 mb-5">
          <span className="text-[10px] font-bold uppercase text-brand tracking-widest">
            {q.subject} · {q.year}
          </span>
          <p className="text-base font-medium mt-2 leading-relaxed">{q.text}</p>
        </div>

        <div className="space-y-3 mb-5">
          {q.options.map((opt, i) => {
            const isChosen = chosen === i;
            const isRight = i === q.answer;
            const showRight = answered && isRight;
            const showWrong = answered && isChosen && !isRight;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                className={cn(
                  "w-full text-left p-4 rounded-brand-xl border-2 text-sm font-medium transition-all flex items-center justify-between gap-3",
                  showRight
                    ? "border-success bg-success/10 text-success"
                    : showWrong
                      ? "border-danger bg-danger/10 text-danger"
                      : isChosen
                        ? "border-brand bg-brand/10 text-textMain"
                        : "border-borderMuted bg-bgCard hover:border-brand/40 text-textMain",
                )}
              >
                <span>
                  <span className="font-mono opacity-50 mr-2">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </span>
                {showRight && <CheckCircle className="w-4 h-4 shrink-0" />}
                {showWrong && <XCircle className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* <Explanation */}
        <AnimatePresence>
          {showExplain && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "p-4 rounded-brand-xl border text-sm mb-5",
                isCorrect
                  ? "bg-success/5 border-success/20 text-success"
                  : "bg-danger/5 border-danger/20 text-danger",
              )}
            >
              <p className="font-bold mb-1">
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
              </p>
              <p className="text-textMuted text-xs leading-relaxed">
                {q.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {answered && (
          <button
            onClick={handleNext}
            className="w-full bg-brand text-white py-4 rounded-brand-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-light transition-all active:scale-[0.98]"
          >
            {current + 1 >= questions.length ? "See Results" : "Next Question"}
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default GuestQuiz;
