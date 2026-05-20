// src/Pages/Guest/GuestMockExam.tsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SAMPLE_QUESTIONS } from "../../Data/Question";
import { cn } from "../../lib/utils/utils";

const MOCK_DURATION = 7200; // 2 hours in seconds

const AVAILABLE_SUBJECTS = [
  { id: "English", name: "English", questions: 60 },
  { id: "Mathematics", name: "Mathematics", questions: 40 },
  { id: "Physics", name: "Physics", questions: 40 },
  { id: "Chemistry", name: "Chemistry", questions: 40 },
  { id: "Biology", name: "Biology", questions: 40 },
  { id: "Economics", name: "Economics", questions: 40 },
  { id: "Government", name: "Government", questions: 40 },
  { id: "Literature", name: "Literature", questions: 40 },
  { id: "History", name: "History", questions: 40 },
  { id: "Geography", name: "Geography", questions: 40 },
  { id: "CRS", name: "CRS", questions: 40 },
];

const AVAILABLE_YEARS = Array.from({ length: 11 }, (_, i) =>
  (2016 + i).toString(),
);

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

interface Question {
  id: string;
  text: string;
  options: string[];
  answer: number;
  subject: string;
  year: number;
  explanation: string;
}

// Simple option button without answer feedback
const SimpleOptionButton: React.FC<{
  index: number;
  text: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ index, text, isSelected, onSelect }) => {
  const letter = String.fromCharCode(65 + index);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 rounded-brand-xl border-2 transition-all",
        isSelected
          ? "border-brand bg-brand/10 text-textMain"
          : "border-borderMuted bg-bgCard hover:border-brand/40 text-textMain",
      )}
    >
      <span className="font-mono opacity-50 mr-2">{letter}.</span>
      {text}
    </button>
  );
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

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const filtered = SAMPLE_QUESTIONS.filter(
      (q) =>
        selectedCombination.includes(q.subject) &&
        String(q.year) === selectedYear,
    );

    if (filtered.length === 0) {
      setError(
        `Questions for ${selectedYear} are currently being uploaded. Try another year.`,
      );
      setIsLoading(false);
      return;
    }

    const finalOrderedQuestions = selectedCombination.flatMap((sub) => {
      const subjectQuestions = filtered.filter((q) => q.subject === sub);
      return shuffleArray(subjectQuestions).map((q) => {
        const correctOptionText = q.options[q.answer];
        const shuffledOptions = shuffleArray(q.options);
        const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);
        return { ...q, options: shuffledOptions, answer: newCorrectIndex };
      });
    });

    setQuestions(finalOrderedQuestions);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(MOCK_DURATION);
    setIsStarted(true);
    setActiveSubject(selectedCombination[0]);
    setIsLoading(false);
  };

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
      <div className="min-h-screen bg-bgMain text-textMain flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {/* Score Animation */}
          <div className="text-7xl mb-4">
            {pct >= 70 ? "🏆" : pct >= 50 ? "👍" : "📚"}
          </div>

          {/* Main Score */}
          <h2 className="text-4xl font-bold mb-2">{jambScore}/400</h2>
          <p className="text-textDim text-lg mb-1">
            {score}/{questions.length} Correct
          </p>
          <p className="text-textMuted text-sm mb-6">
            {pct >= 70
              ? "Excellent! You're well prepared for JAMB."
              : pct >= 50
                ? "Good effort! Keep practising to improve."
                : "Keep studying — with practice you'll get there!"}
          </p>

          {/* Subject Breakdown - Clean & Simple */}
          <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-5 mb-6 text-left">
            <h3 className="text-sm font-bold text-brand mb-3 flex items-center gap-2">
              <span>📊</span> Subject Performance
            </h3>
            <div className="space-y-3">
              {Object.entries(subjectScores).map(([subject, data]) => {
                const subjectPct = Math.round(
                  (data.correct / data.total) * 100,
                );
                return (
                  <div key={subject}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-textDim">{subject}</span>
                      <span className="text-textMain">
                        {data.correct}/{data.total} ({subjectPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          subjectPct >= 70
                            ? "bg-success"
                            : subjectPct >= 50
                              ? "bg-brand"
                              : "bg-danger",
                        )}
                        style={{ width: `${subjectPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Call to Action - Sign up to see answers */}
          <div className="bg-linear-to-r from-brand/10 to-brand/5 border border-brand/20 rounded-brand-xl p-5 mb-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="text-md font-bold text-white mb-2">
                Want to review your answers?
              </h3>
              <p className="text-xs text-textDim mb-4">
                See which questions you got wrong, learn from your mistakes, and
                track your progress over time.
              </p>
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
                className="w-full bg-brand text-white py-3 rounded-brand font-bold text-sm hover:bg-brand-light transition-all active:scale-[0.98]"
              >
                Create Free Account to Unlock Full Review
              </button>
              <p className="text-[10px] text-textMuted mt-3">
                ✓ Detailed answer explanations ✓ Track improvement ✓ Unlimited
                practice
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Complete reset
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
                // Reset the selected subjects to default (keep selections)
                setSelectedCombination(["English", "", "", ""]);
                setSelectedYear("2025");
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
      <div className="min-h-screen bg-bgMain text-textMain flex flex-col p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <button
            onClick={() => navigate("/guest")}
            className="flex items-center gap-2 text-sm text-textDim hover:text-textMain transition-colors"
          >
            ← Exit
          </button>

          <div className="flex items-center gap-3">
            <div
              className={cn(
                "font-mono text-lg font-bold tabular-nums px-3 py-1.5 rounded-brand border",
                timeLeft <= 120
                  ? "text-danger border-danger/30 bg-danger/10"
                  : "text-textMain border-borderMuted bg-bgSurface",
              )}
            >
              ⏱ {formatTime(timeLeft)}
            </div>
            <span className="text-xs text-textDim">
              {answeredCount} / {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
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
              placeholder="Jump to..."
              className="w-24 px-2.5 py-1.5 bg-bgSurface border border-borderMuted rounded-brand text-xs focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <button
              onClick={() => setShowConfirmExit(true)}
              className="px-4 py-2 bg-danger text-white text-sm rounded-brand font-medium hover:bg-danger/80 transition-all"
            >
              Finish
            </button>
          </div>
        </div>

        {/* Subject tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {examSubjects.map((sub) => (
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
                "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                activeSubject === sub
                  ? "bg-brand text-white border-brand"
                  : "bg-bgSurface text-textDim border-borderMuted hover:border-brand/50",
              )}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Question navigator */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-1.5 pb-2 min-w-max">
            {subjectQuestions.map((quest, i) => {
              const globalIdx = questions.findIndex((g) => g.id === quest.id);
              const isAnswered = answers[globalIdx] !== undefined;
              return (
                <button
                  key={quest.id}
                  onClick={() => nextQuestion(globalIdx)}
                  className={cn(
                    "w-8 h-8 rounded-md text-xs font-mono transition-all shrink-0 border",
                    globalIdx === currentIndex
                      ? "bg-brand text-white border-brand shadow-lg scale-110 z-10"
                      : isAnswered
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-bgSurface text-textDim border-borderMuted",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question card - NO INSTANT FEEDBACK! */}
        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded bg-brand/10 text-brand">
              {q.subject} ({q.year})
            </span>
            <span className="text-[10px] font-mono text-textDim">
              Q{subjectQuestions.findIndex((sq) => sq.id === q.id) + 1} of{" "}
              {subjectQuestions.length}
            </span>
          </div>

          <p className="text-base sm:text-lg text-textMain mb-6 sm:mb-8 leading-relaxed">
            {q.text}
          </p>

          {/* Options - NO color feedback for correct/wrong! */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => (
              <SimpleOptionButton
                key={i}
                index={i}
                text={opt}
                isSelected={chosen === i}
                onSelect={() => submitAnswer(currentIndex, i)}
              />
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className={cn(
              "px-6 py-3 rounded-brand font-medium transition-all",
              currentIndex === 0
                ? "bg-bgSurface text-textDim cursor-not-allowed"
                : "bg-bgSurface border border-borderMuted text-textMain hover:border-brand/40",
            )}
          >
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
            className="px-6 py-3 bg-brand text-white rounded-brand font-medium hover:bg-brand-light transition-all active:scale-[0.98]"
          >
            {currentIndex === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>

        {/* Confirm exit modal */}
        {showConfirmExit && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-2">Submit Mock Exam?</h3>
              <p className="text-sm text-textMuted mb-6">
                You've answered {answeredCount} out of {questions.length}{" "}
                questions.
                {answeredCount < questions.length &&
                  " You have unanswered questions."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmExit(false)}
                  className="flex-1 py-2.5 border border-borderMuted rounded-brand text-sm font-medium hover:border-brand/40 transition-all"
                >
                  Review
                </button>
                <button
                  onClick={handleFinishExam}
                  className="flex-1 py-2.5 bg-brand text-white rounded-brand text-sm font-medium hover:bg-brand-light transition-all"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Setup Screen ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bgMain text-textMain flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Setup Card */}
        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-8 text-center shadow-sm">
          <button
            onClick={() => navigate("/guest")}
            className="flex items-center gap-2 text-sm text-textDim hover:text-textMain mb-6 transition-colors"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold mb-2">CBT Mock Exam</h2>
          <p className="text-textDim text-sm mb-8">
            Select your year and 4 subjects to begin.
          </p>

          {error && (
            <div className="mb-6 p-3 bg-danger/10 border border-danger/20 text-danger text-xs rounded-brand">
              ⚠️ {error}
            </div>
          )}

          <div className="flex flex-col text-left mb-6">
            <label className="text-[10px] font-bold uppercase text-brand mb-1">
              Examination Year
            </label>
            <select
              className="bg-bgSurface border border-borderMuted p-3 rounded-brand text-sm text-textMain focus:border-brand outline-none"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setError(null);
              }}
            >
              {AVAILABLE_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-brand mb-1">
                Subject 1
              </label>
              <div className="bg-bgSurface border border-borderMuted p-3 rounded-brand text-sm text-textMain">
                English (Compulsory)
              </div>
            </div>
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex flex-col">
                <label className="text-[10px] font-bold uppercase text-textDim mb-1">
                  Subject {idx + 1}
                </label>
                <select
                  className="bg-bgSurface border border-borderMuted p-3 rounded-brand text-sm text-textMain focus:border-brand outline-none"
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
                        {sub.name} ({sub.questions} questions)
                      </option>
                    ),
                  )}
                </select>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            disabled={selectedCombination.some((s) => s === "") || isLoading}
            className={cn(
              "w-full py-4 rounded-brand-xl font-bold transition-all",
              selectedCombination.some((s) => s === "") || isLoading
                ? "bg-brand/50 cursor-not-allowed"
                : "bg-brand hover:bg-brand-light active:scale-[0.98]",
            )}
          >
            {isLoading ? "Loading Questions..." : "Start Mock Exam"}
          </button>
        </div>

        {/* Guidelines Card */}
        <div className="space-y-8 py-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand mb-4">
              Exam Guidelines
            </h3>
            <ul className="space-y-3 text-sm text-textMain">
              <li className="flex gap-3">
                <span>•</span> English: <strong>60 questions</strong>
              </li>
              <li className="flex gap-3">
                <span>•</span> Each other subject: <strong>40 questions</strong>
              </li>
              <li className="flex gap-3">
                <span>•</span> Total: <strong>180 questions</strong>
              </li>
              <li className="flex gap-3">
                <span>•</span> Time: <strong>2 hours (120 minutes)</strong>
              </li>
              <li className="flex gap-3">
                <span>•</span> Score: <strong>(Correct/Total) × 400</strong>
              </li>
              <li className="flex gap-3 text-success">
                <span>✓</span> Answers shown ONLY after submission
              </li>
            </ul>
          </div>

          <div className="bg-brand/5 border border-brand/20 rounded-brand-xl p-4">
            <p className="text-xs text-textDim">
              🎯 <span className="font-bold text-brand">Guest Mode:</span> Your
              progress won't be saved. Create a free account to track your
              performance and access more questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestMockExam;
