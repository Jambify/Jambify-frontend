// src/Pages/Guest/GuestMockExam.tsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchQuestionsWithFallback } from "../../Services/questionService";
import LoadingScreen from "../../components/ui/LoadingScreen";
import type { Question } from "../../Types";
import { cn } from "../../lib/utils/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Timer,
  BookOpen,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Target,
  Zap,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_DURATION = 7200; // 2 hours in seconds

const AVAILABLE_SUBJECTS = [
  { id: "English", name: "English", questions: 60, icon: "📖" },
  { id: "Mathematics", name: "Mathematics", questions: 40, icon: "🔢" },
  { id: "Physics", name: "Physics", questions: 40, icon: "⚡" },
  { id: "Chemistry", name: "Chemistry", questions: 40, icon: "⚗️" },
  { id: "Biology", name: "Biology", questions: 40, icon: "🧬" },
  { id: "Economics", name: "Economics", questions: 40, icon: "📊" },
  { id: "Government", name: "Government", questions: 40, icon: "🏛️" },
  { id: "Literature", name: "Literature", questions: 40, icon: "📚" },
  { id: "History", name: "History", questions: 40, icon: "📜" },
  { id: "Geography", name: "Geography", questions: 40, icon: "🌍" },
  { id: "CRS", name: "CRS", questions: 40, icon: "✝️" },
];

const AVAILABLE_YEARS = [
  "Random",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const GuestMockExam: React.FC = () => {
  const navigate = useNavigate();

  // Exam state
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(MOCK_DURATION);

  // Setup state
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedCombination, setSelectedCombination] = useState<string[]>([
    "English",
    "",
    "",
    "",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [activeSubject, setActiveSubject] = useState("English");
  const [jumpTo, setJumpTo] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer logic
  useEffect(() => {
    if (!isStarted || isFinished) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStarted, isFinished]);

  // Update active subject
  useEffect(() => {
    if (isStarted && questions[currentIndex]) {
      setActiveSubject(questions[currentIndex].subject);
    }
  }, [currentIndex, isStarted, questions]);

  const handleFinishExam = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsFinished(true);
  };

  const handleStart = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Small delay for loader
      await new Promise((r) => setTimeout(r, 100));

      const finalQuestionsList: Question[] = [];

      for (const subjectId of selectedCombination) {
        if (!subjectId) continue;

        const config = AVAILABLE_SUBJECTS.find((s) => s.id === subjectId);
        const requiredCount = config ? config.questions : 40;

        const fetched = await fetchQuestionsWithFallback(
          subjectId,
          selectedYear,
          requiredCount,
          "All",
        );

        // Randomize options for each question to prevent memorization
        const randomized = fetched.map((q) => {
          const correctOptionText = q.options[q.answer];
          const shuffledOptions = shuffleArray(q.options);
          const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);
          return { ...q, options: shuffledOptions, answer: newCorrectIndex };
        });

        finalQuestionsList.push(...randomized);
      }

      if (finalQuestionsList.length === 0) {
        throw new Error("No questions found for the selected subjects.");
      }

      setQuestions(finalQuestionsList);
      setAnswers({});
      setCurrentIndex(0);
      setTimeLeft(MOCK_DURATION);
      setIsStarted(true);
      setActiveSubject(selectedCombination[0]);
    } catch (error: any) {
      console.error("Guest Mock Exam Error:", error);
      setError(
        error.message ||
          "Failed to load questions. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        message="Preparing Mock Exam"
        submessage="Gathering questions for all selected subjects..."
        estimatedTime={4}
      />
    );
  }

  const updateSubject = (index: number, value: string) => {
    setError(null);
    const newComb = [...selectedCombination];
    newComb[index] = value;
    setSelectedCombination(newComb);
  };

  const submitAnswer = (idx: number, optionIndex: number) => {
    if (answers[idx] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [idx]: optionIndex }));
  };

  const nextQuestion = (index?: number) => {
    if (index !== undefined) {
      setCurrentIndex(index);
    } else if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const answeredCount = Object.keys(answers).length;
  const score = Object.entries(answers).filter(
    ([i, a]) => a === questions[Number(i)]?.answer,
  ).length;
  const jambScore = Math.round((score / questions.length) * 400);

  // ── Results Screen ──────────────────────────────────────────────
  // ── Results Screen ──────────────────────────────────────────────
  if (isFinished) {
    const pct = Math.round((score / questions.length) * 100);

    // Group scores by subject
    const subjectScores: Record<string, { correct: number; total: number }> =
      {};
    questions.forEach((q, idx) => {
      if (!subjectScores[q.subject]) {
        subjectScores[q.subject] = { correct: 0, total: 0 };
      }
      subjectScores[q.subject].total++;
      if (answers[idx] === q.answer) {
        subjectScores[q.subject].correct++;
      }
    });

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
          className="w-full max-w-2xl text-center relative z-10"
        >
          {/* Score Animation */}
          <div className="mb-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-7xl mb-6 drop-shadow-2xl"
            >
              {pct >= 70 ? "🏆" : pct >= 50 ? "👍" : "📚"}
            </motion.div>

            <h2 className="text-6xl font-display font-black mb-2 tracking-tighter text-textMain">
              {jambScore}
              <span className="text-brand text-3xl">/400</span>
            </h2>

            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="px-4 py-1 bg-bgCard border border-borderMuted rounded-full">
                <span className="text-xs font-bold text-textDim uppercase tracking-widest">
                  {score} / {questions.length} Correct
                </span>
              </div>
              <div className="px-4 py-1 bg-bgCard border border-borderMuted rounded-full">
                <span className="text-xs font-bold text-textDim uppercase tracking-widest">
                  {pct}% Accuracy
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Subject Breakdown */}
            <div className="bg-bgCard border border-borderMuted rounded-3xl p-8 text-left shadow-2xl backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand/20 group-hover:bg-brand transition-colors" />

              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand mb-6 flex items-center gap-2">
                <Target size={14} />
                Subject Performance
              </h3>

              <div className="space-y-6">
                {Object.entries(subjectScores).map(([subject, data]) => {
                  const subjectPct = Math.round(
                    (data.correct / data.total) * 100,
                  );
                  const subjectInfo = AVAILABLE_SUBJECTS.find(
                    (s) => s.name === subject,
                  );

                  return (
                    <div key={subject} className="group/item">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg opacity-80">
                            {subjectInfo?.icon || "📖"}
                          </span>
                          <span className="text-sm font-bold text-textMain">
                            {subject}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-black text-textDim">
                          {data.correct}/{data.total}
                        </span>
                      </div>
                      <div className="h-2 bg-bgSurface rounded-full overflow-hidden border border-borderMuted/30">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subjectPct}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            subjectPct >= 75
                              ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                              : subjectPct >= 45
                                ? "bg-brand shadow-[0_0_8px_rgba(123,95,255,0.4)]"
                                : "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.4)]",
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-bgCard border border-borderMuted rounded-3xl p-8 text-left shadow-2xl backdrop-blur-sm relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand/20 group-hover:h-full group-hover:bg-brand/5 transition-all duration-500" />

              <div className="relative z-10 flex-1">
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-brand" />
                </div>

                <h3 className="text-xl font-display font-black text-textMain mb-3 leading-tight">
                  Unlock Detailed Answer Review
                </h3>

                <p className="text-xs text-textDim leading-relaxed mb-8">
                  You answered{" "}
                  <span className="text-textMain font-bold">{score}</span>{" "}
                  questions correctly. Want to see which ones you missed and
                  read professional explanations for each?
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    "View detailed answer keys",
                    "Read expert explanations",
                    "Track progress over time",
                  ].map((text, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[10px] font-bold text-textMain uppercase tracking-widest"
                    >
                      <CheckCircle size={12} className="text-success" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  navigate("/signup", {
                    state: {
                      fromMockExam: true,
                      score: jambScore,
                      subjectScores,
                    },
                  })
                }
                className="w-full bg-brand text-white py-4 rounded-2xl font-black text-sm hover:bg-brand-light transition-all active:scale-[0.98] shadow-xl shadow-brand/20 relative z-10"
              >
                Get Full Access — It's Free
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <button
              onClick={() => {
                setIsStarted(false);
                setIsFinished(false);
                setQuestions([]);
                setAnswers({});
                setCurrentIndex(0);
                setTimeLeft(MOCK_DURATION);
                setError(null);
                setShowConfirmExit(false);
                setActiveSubject(selectedCombination[0]);
                setJumpTo("");
                setSelectedCombination(["English", "", "", ""]);
                setSelectedYear("2025");
              }}
              className="flex-1 py-4 bg-bgSurface border border-borderMuted rounded-2xl text-xs font-black uppercase tracking-widest hover:border-brand/40 transition-all active:scale-[0.98]"
            >
              Restart Simulation
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

  // ── Exam Active Screen (No instant feedback!) ───────────────────
  if (isStarted && questions[currentIndex]) {
    const q = questions[currentIndex];
    const chosen = answers[currentIndex] ?? -1;
    const examSubjects = Array.from(
      new Set(questions.map((quest) => quest.subject)),
    );
    const subjectQuestions = questions.filter(
      (quest) => quest.subject === activeSubject,
    );

    return (
      <div className="min-h-screen bg-bgMain text-textMain flex flex-col p-4 sm:p-6 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-brand/5 blur-[100px] rounded-full" />
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 mb-8 relative z-10 max-w-7xl mx-auto w-full bg-bgCard/50 backdrop-blur-md border border-borderMuted p-3 sm:p-4 rounded-3xl shadow-xl shadow-black/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfirmExit(true)}
              className="p-2.5 bg-bgSurface border border-borderMuted rounded-2xl text-textDim hover:text-danger hover:border-danger/40 transition-all group"
              title="Exit Exam"
            >
              <LogOut
                size={18}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </button>
            <div className="h-8 w-px bg-borderMuted/30 hidden sm:block" />
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand leading-none mb-1">
                CBT Simulation
              </span>
              <span className="text-xs font-bold text-textMain leading-none">
                {selectedYear} Mock
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all shadow-inner",
                timeLeft <= 300
                  ? "bg-danger/10 border-danger/30 text-danger animate-pulse"
                  : "bg-bgSurface border-borderMuted text-textMain",
              )}
            >
              <Timer
                size={18}
                className={cn(timeLeft <= 300 && "animate-spin-slow")}
              />
              <span className="font-mono text-xl font-black tabular-nums tracking-tighter">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-textDim leading-none mb-1">
                Progress
              </span>
              <span className="text-xs font-bold text-textMain leading-none">
                {answeredCount} / {questions.length}
              </span>
            </div>
            <button
              onClick={() => setShowConfirmExit(true)}
              className="px-6 py-2.5 bg-brand text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-brand-light transition-all active:scale-[0.98] shadow-lg shadow-brand/20"
            >
              Finish
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full relative z-10 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-y-auto pr-1">
            {/* Subject Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
              {examSubjects.map((sub) => {
                const subInfo = AVAILABLE_SUBJECTS.find((s) => s.name === sub);
                return (
                  <button
                    key={sub}
                    onClick={() => {
                      setActiveSubject(sub);
                      const firstIdx = questions.findIndex(
                        (quest) => quest.subject === sub,
                      );
                      if (firstIdx !== -1) nextQuestion(firstIdx);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border shadow-sm",
                      activeSubject === sub
                        ? "bg-brand text-white border-brand shadow-brand/20"
                        : "bg-bgCard text-textDim border-borderMuted hover:border-brand/40",
                    )}
                  >
                    <span>{subInfo?.icon}</span>
                    {sub}
                  </button>
                );
              })}
            </div>

            {/* Question Card */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-bgCard border border-borderMuted rounded-4xl p-6 sm:p-10 mb-6 shadow-2xl shadow-black/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand/20 group-hover:bg-brand transition-colors" />

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest rounded-xl border border-brand/20">
                    Question{" "}
                    {subjectQuestions.findIndex((sq) => sq.id === q.id) + 1}
                  </span>
                  <span className="px-3 py-1.5 bg-bgSurface text-textDim text-[10px] font-black uppercase tracking-widest rounded-xl border border-borderMuted">
                    {q.subject}
                  </span>
                </div>
                <div className="text-[10px] font-mono font-bold text-textMuted uppercase tracking-widest">
                  Global ID: #{q.id.slice(0, 8)}
                </div>
              </div>

              <p className="text-xl sm:text-2xl font-medium leading-relaxed text-textMain tracking-tight mb-12">
                {q.text}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => submitAnswer(currentIndex, i)}
                    className={cn(
                      "w-full text-left p-5 rounded-2xl border-2 text-sm sm:text-base font-bold transition-all flex items-center gap-4 group",
                      chosen === i
                        ? "border-brand bg-brand/10 text-textMain shadow-lg shadow-brand/5"
                        : "border-borderMuted bg-bgSurface/50 hover:border-brand/40 text-textMain shadow-sm",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm transition-colors shrink-0",
                        chosen === i
                          ? "bg-brand text-white"
                          : "bg-bgDeep text-textDim group-hover:bg-brand/10 group-hover:text-brand",
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="flex-1 leading-tight">{opt}</span>
                    {chosen === i && (
                      <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-brand" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-4 mt-auto py-6">
              <button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                  currentIndex === 0
                    ? "bg-bgSurface text-textMuted border border-borderMuted cursor-not-allowed opacity-50"
                    : "bg-bgCard border border-borderMuted text-textMain hover:border-brand/40 shadow-lg active:scale-95",
                )}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <button
                onClick={() => {
                  if (currentIndex === questions.length - 1) {
                    setShowConfirmExit(true);
                  } else {
                    nextQuestion(currentIndex + 1);
                  }
                }}
                className="flex items-center gap-2 px-10 py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-light transition-all active:scale-[0.98] shadow-2xl shadow-brand/20"
              >
                {currentIndex === questions.length - 1
                  ? "Finish Exam"
                  : "Next Question"}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Sidebar Navigator */}
          <div className="hidden lg:flex flex-col w-80 bg-bgCard border border-borderMuted rounded-4xl p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-textDim">
                Question Grid
              </h4>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={jumpTo}
                  onChange={(e) => setJumpTo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const n = parseInt(jumpTo) - 1;
                      if (n >= 0 && n < questions.length) nextQuestion(n);
                      setJumpTo("");
                    }
                  }}
                  placeholder="#"
                  className="w-12 bg-bgSurface border border-borderMuted rounded-xl px-2 py-1 text-center text-xs font-bold focus:border-brand outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-5 gap-2 pb-4">
                {questions.map((_, i) => {
                  const isAnswered = answers[i] !== undefined;
                  const isActive = i === currentIndex;

                  return (
                    <button
                      key={i}
                      onClick={() => nextQuestion(i)}
                      className={cn(
                        "aspect-square rounded-xl text-xs font-mono font-bold transition-all border flex items-center justify-center",
                        isActive
                          ? "bg-brand text-white border-brand shadow-lg shadow-brand/20 scale-110 z-10"
                          : isAnswered
                            ? "bg-success/10 text-success border-success/30 hover:border-success"
                            : "bg-bgSurface text-textDim border-borderMuted hover:border-brand/40",
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-borderMuted/30 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-textDim">Answered</span>
                <span className="text-success">{answeredCount} questions</span>
              </div>
              <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden border border-borderMuted/30">
                <div
                  className="h-full bg-success rounded-full transition-all duration-500"
                  style={{
                    width: `${(answeredCount / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Confirm exit modal */}
        <AnimatePresence>
          {showConfirmExit && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-bgCard border border-borderMuted rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-brand" />

                <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <CheckCircle size={32} className="text-brand" />
                </div>

                <h3 className="text-2xl font-display font-black text-center mb-3 tracking-tight">
                  Submit Exam?
                </h3>

                <p className="text-center text-textDim text-sm font-medium mb-8 leading-relaxed">
                  You've answered{" "}
                  <span className="text-textMain font-bold">
                    {answeredCount}
                  </span>{" "}
                  out of{" "}
                  <span className="text-textMain font-bold">
                    {questions.length}
                  </span>{" "}
                  questions.
                  {answeredCount < questions.length ? (
                    <span className="text-danger block mt-2 font-bold">
                      ⚠️ You have {questions.length - answeredCount} unanswered
                      questions!
                    </span>
                  ) : (
                    <span className="text-success block mt-2 font-bold">
                      ✨ Great job completing all questions!
                    </span>
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowConfirmExit(false)}
                    className="flex-1 py-4 border border-borderMuted rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-bgSurface transition-all"
                  >
                    Keep Reviewing
                  </button>
                  <button
                    onClick={handleFinishExam}
                    className="flex-1 py-4 bg-brand text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-light transition-all shadow-xl shadow-brand/20"
                  >
                    Submit Now
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Setup Screen ────────────────────────────────────────────────
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
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative z-10"
      >
        {/* Setup Card */}
        <div className="bg-bgCard border border-borderMuted rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/20 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/guest")}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-textDim hover:text-brand transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span className="text-[10px] font-bold text-brand uppercase tracking-tighter">
                Guest Mock
              </span>
            </div>
          </div>

          <div className="mb-10 text-left">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-brand/5">
                🎓
              </div>
              <div>
                <h2 className="text-3xl font-display font-black text-textMain tracking-tight">
                  CBT Simulator
                </h2>
                <p className="text-textDim text-sm font-medium">
                  Standard JAMB 4-Subject Combination
                </p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-danger/10 border border-danger/20 text-danger text-xs font-bold rounded-2xl flex items-center gap-3 mb-6"
              >
                <Info size={16} />
                {error}
              </motion.div>
            )}
          </div>

          <div className="space-y-6 flex-1">
            <div className="flex flex-col text-left">
              <label className="text-[10px] font-black uppercase text-brand tracking-[0.15em] mb-2 px-1">
                Examination Year
              </label>
              <div className="relative group">
                <select
                  className="w-full bg-bgSurface/50 border border-borderMuted p-4 rounded-2xl text-sm font-bold text-textMain focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-all appearance-none cursor-pointer"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setError(null);
                  }}
                >
                  {AVAILABLE_YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year} Exam
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textDim group-hover:text-brand transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase text-brand tracking-[0.15em] mb-2 px-1">
                  Subject 1 (Fixed)
                </label>
                <div className="bg-brand/5 border border-brand/20 p-4 rounded-2xl text-sm font-bold text-brand flex items-center gap-3">
                  <span className="text-lg">📖</span>
                  English Language
                </div>
              </div>

              {[1, 2, 3].map((idx) => (
                <div key={idx} className="flex flex-col">
                  <label className="text-[10px] font-black uppercase text-textDim tracking-[0.15em] mb-2 px-1">
                    Subject {idx + 1}
                  </label>
                  <div className="relative group">
                    <select
                      className="w-full bg-bgSurface/50 border border-borderMuted p-4 rounded-2xl text-sm font-bold text-textMain focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-all appearance-none cursor-pointer"
                      value={selectedCombination[idx]}
                      onChange={(e) => updateSubject(idx, e.target.value)}
                    >
                      <option value="">Select subject</option>
                      {AVAILABLE_SUBJECTS.filter((s) => s.id !== "English").map(
                        (sub) => (
                          <option
                            key={sub.id}
                            value={sub.id}
                            disabled={selectedCombination.includes(sub.id)}
                          >
                            {sub.icon} {sub.name}
                          </option>
                        ),
                      )}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-textDim group-hover:text-brand transition-colors">
                      <ArrowRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={selectedCombination.some((s) => s === "") || isLoading}
            className={cn(
              "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all mt-10 flex items-center justify-center gap-3",
              selectedCombination.some((s) => s === "") || isLoading
                ? "bg-bgSurface text-textMuted border border-borderMuted cursor-not-allowed"
                : "bg-brand text-white hover:bg-brand-light active:scale-[0.98] shadow-xl shadow-brand/20",
            )}
          >
            {isLoading ? "Preparing Exam..." : "Start Simulation"}
            <Zap className={cn("w-4 h-4", !isLoading && "fill-current")} />
          </button>
        </div>

        {/* Guidelines Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-bgCard border border-borderMuted rounded-3xl p-8 sm:p-10 shadow-xl flex-1 backdrop-blur-sm border-l-4 border-l-brand">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand mb-8 flex items-center gap-3">
              <Info className="w-4 h-4" />
              Exam Guidelines
            </h3>

            <div className="space-y-6">
              {[
                {
                  label: "English",
                  value: "60 Questions",
                  icon: <BookOpen className="w-4 h-4" />,
                },
                {
                  label: "Other Subjects",
                  value: "40 Questions Each",
                  icon: <Target className="w-4 h-4" />,
                },
                {
                  label: "Total Questions",
                  value: "180 Items",
                  icon: <Layers className="w-4 h-4" />,
                },
                {
                  label: "Duration",
                  value: "120 Minutes",
                  icon: <Timer className="w-4 h-4" />,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-bgSurface flex items-center justify-center text-textDim group-hover:text-brand transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-sm font-bold text-textMain">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-black text-brand">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-success/5 border border-success/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-xs font-black uppercase tracking-widest text-success">
                  CBT Mode Active
                </span>
              </div>
              <p className="text-[11px] text-textDim leading-relaxed font-medium italic">
                Answers are hidden until you submit. The timer will
                automatically end your session if time runs out.
              </p>
            </div>
          </div>

          <div className="bg-linear-to-br from-brand/20 to-brand/5 border border-brand/20 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-brand/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10">
              <p className="text-sm text-textMain font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                Want to save your progress?
              </p>
              <p className="text-xs text-textDim leading-relaxed mb-4">
                Guest sessions are temporary. Create a free account to track
                your mock scores and see detailed performance analytics.
              </p>
              <button
                onClick={() => navigate("/signup")}
                className="text-xs font-black text-brand uppercase tracking-widest hover:underline flex items-center gap-2"
              >
                Join JAMBIFY Now <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GuestMockExam;
