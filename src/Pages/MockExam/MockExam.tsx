// MockExam.tsx:150
//  GET https://questions.aloc.com.ng/api/v2/q/40?subject=physics&year=2025 406 (Not Acceptable)
// MockExam.tsx:180 ALOC Fetch Error for Physics: Error: API responded with status: 406
//     at fetchFromALOC (MockExam.tsx:160:19)
//     at async MockExam.tsx:192:25
//     at async Promise.all (index 3)
//     at async handleStart (MockExam.tsx:186:30)
// 2
// supabase.ts:17 🔵 Auth state changed: SIGNED_IN 652cfffd-f6f3-424d-a88d-cf2ce6fccc57
//
// src/Pages/MockExam/MockExam.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/Layout/AppLayout";
import { useMockStore } from "../../Store/useMockStore";
import { useUserStore } from "../../Store/UseUserStore";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import OptionButton from "../../components/Quiz/OptionButton";
import MockResultsScreen from "../../components/MockExam/MockResultScreen";
import QuestionPalette from "../../components/MockExam/QuestionPalette";
import SubjectSidebar from "../../components/MockExam/SubjectSidebar";
import Button from "../../components/ui/Button";
import { useExamTimer } from "../../hooks/useExamTimer";
import { cn } from "../../lib/utils/utils";

import { fetchQuestionsWithFallback } from "../../Services/questionService";
import LoadingScreen from "../../components/ui/LoadingScreen";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Flag,
  Trash2,
  Clock,
  AlertTriangle,
  X,
} from "lucide-react";

const MOCK_DURATION = 7200; // 2 hours in seconds

const AVAILABLE_SUBJECTS = [
  { id: "English", name: "English", required: 60 },
  { id: "Mathematics", name: "Mathematics", required: 40 },
  { id: "Physics", name: "Physics", required: 40 },
  { id: "Chemistry", name: "Chemistry", required: 40 },
  { id: "Biology", name: "Biology", required: 40 },
  { id: "Economics", name: "Economics", required: 40 },
  { id: "Government", name: "Government", required: 40 },
  { id: "Literature", name: "Literature", required: 40 },
  { id: "History", name: "History", required: 40 },
  { id: "Geography", name: "Geography", required: 40 },
  { id: "CRS", name: "CRS", required: 40 },
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
const MockExam: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const { addQuizResult } = usePerformanceStore();
  const {
    isStarted,
    isFinished,
    questions,
    currentIndex,
    answers,
    markedForReview,
    startExam,
    submitAnswer,
    markForReview,
    setCurrentIndex,
    nextQuestion,
    prevQuestion,
    finishExam,
    resetExam,
    clearResponse,
  } = useMockStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedCombination, setSelectedCombination] = useState<string[]>([
    "English",
    "",
    "",
    "",
  ]);
  const [jumpTo, setJumpTo] = useState("");
  const [activeSubject, setActiveSubject] = useState("English");

  // Timer logic
  const handleTimeUp = useCallback(() => {
    finishExam(MOCK_DURATION);
  }, [finishExam]);

  const { timeLeft, formattedTime, status } = useExamTimer({
    initialTime: MOCK_DURATION,
    onTimeUp: handleTimeUp,
    isActive: isStarted && !isFinished,
  });

  // Effect to update active subject when current index changes
  useEffect(() => {
    if (isStarted && questions[currentIndex]) {
      setActiveSubject(questions[currentIndex].subject);
    }
  }, [currentIndex, isStarted, questions]);

  // Use the persist check to prevent reset on refresh
  useEffect(() => {
    if (isStarted && !isFinished) {
      // The store is already persisted, we just need to make sure
      // the questions are there. If not, we might need to re-fetch
      // but usually the store will handle it.
    }
  }, [isStarted, isFinished]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted || isFinished) return;

      if (e.altKey && e.key === "n") {
        nextQuestion();
      } else if (e.altKey && e.key === "p") {
        prevQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStarted, isFinished, nextQuestion, prevQuestion]);

  if (isLoadingQuestions) {
    return (
      <LoadingScreen
        message="Preparing Mock Exam"
        submessage="Gathering questions for all selected subjects..."
        estimatedTime={4}
      />
    );
  }

  const handleStart = async () => {
    setIsLoadingQuestions(true);
    setErrorMessage(null);

    // Wait for loader to mount
    await new Promise((r) => setTimeout(r, 100));

    try {
      // ── CHECK NETWORK & CACHE ──────────────────────────────
      const isOnline = navigator.onLine;
      const offlineStore = (
        await import("../../Store/useOfflineStore")
      ).useOfflineStore.getState();

      const finalQuestionsList: any[] = [];

      for (const subjectId of selectedCombination) {
        const config = AVAILABLE_SUBJECTS.find((s) => s.id === subjectId);
        if (!config) continue;

        let fetched: any[] = [];

        // Try offline first if user is offline
        if (!isOnline) {
          console.log(`📴 Offline: Checking local cache for ${subjectId}...`);
          const packs = offlineStore.downloadedPacks.filter((p) =>
            p.startsWith(subjectId.toLowerCase().slice(0, 3)),
          );
          if (packs.length > 0) {
            const offlineQs = await offlineStore.getOfflineQuestions(packs[0]);
            if (offlineQs.length >= config.required) {
              fetched = offlineQs
                .sort(() => Math.random() - 0.5)
                .slice(0, config.required);
              console.log(
                `✅ Loaded ${fetched.length} questions from offline pack: ${packs[0]}`,
              );
            }
          }
        }

        // If still no questions (online or no offline cache)
        if (fetched.length === 0) {
          fetched = await fetchQuestionsWithFallback(
            subjectId,
            selectedYear,
            config.required,
          );
        }

        // Randomize options for each question to prevent memorization
        const randomized = fetched.map((q: any) => {
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

      startExam(finalQuestionsList, MOCK_DURATION);
      setActiveSubject(selectedCombination[0]);
    } catch (error: any) {
      console.error("Error starting exam:", error);
      setErrorMessage(
        error.message ||
          "Failed to load questions. Please check your connection.",
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleFinishExam = async () => {
    const timeTaken = MOCK_DURATION - timeLeft;
    finishExam(timeTaken);
    setShowConfirmSubmit(false);
    // Clear persistence on successful manual finish
    localStorage.removeItem("jambify-mock-exam");

    // Save result if logged in
    const { lastResult } = useMockStore.getState();
    if (isAuthenticated && lastResult) {
      // ── IMPROVED: Save individual session records for EACH subject ──
      // This ensures the dashboard accurately tracks progress for every subject taken
      try {
        await Promise.all(
          lastResult.subjectBreakdown.map((sb) => {
            const subjectQuestions = questions.filter(
              (q) => q.subject === sb.subject,
            );
            const subjectAnswers: Record<number, number> = {};

            // Map the global answer indices to relative indices for this subject session
            subjectQuestions.forEach((q, idx) => {
              const globalIdx = questions.indexOf(q);
              if (answers[globalIdx] !== undefined) {
                subjectAnswers[idx] = answers[globalIdx];
              }
            });

            return addQuizResult(
              "mock",
              sb.subject,
              subjectQuestions.map((q) => q.id),
              subjectAnswers,
              Math.floor(timeTaken / lastResult.subjectBreakdown.length), // distribute time
              sb.correct, // Pass calculated correct count
              sb.total, // Pass total questions
            );
          }),
        );

        // ── UPDATE OVERALL BEST SCORE ──────────────────────────────────
        // The total JAMB score is calculated from ALL subjects combined
        const { updateBestScore, syncProfile } = useUserStore.getState();
        if (lastResult.jambScore > 0) {
          console.log(`🏆 Submitting new JAMB score: ${lastResult.jambScore}`);
          await updateBestScore(lastResult.jambScore);
        }

        // Refresh user profile to update dashboard stats instantly
        await syncProfile(true);
        console.log("✅ [MockExam] All results saved and profile synced.");
      } catch (err) {
        console.error("❌ [MockExam] Failed to save all subject results:", err);
      }
    }
  };

  const updateSubject = (index: number, value: string) => {
    setErrorMessage(null);
    const newComb = [...selectedCombination];
    newComb[index] = value;
    setSelectedCombination(newComb);
  };

  const jumpToQuestion = (n: number) => {
    if (n >= 0 && n < questions.length) {
      setCurrentIndex(n);
      setIsSidebarOpen(false);
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(jumpTo) - 1;
    if (!isNaN(n)) {
      jumpToQuestion(n);
      setJumpTo("");
    }
  };

  // Setup Screen
  if (!isStarted && !isFinished) {
    return (
      <AppLayout
        currentPage="mock"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-black text-brand mb-2">
                JAMB Mock Exam
              </h2>
              <p className="text-textDim text-sm">
                Professional CBT simulation for JAMB 2026
              </p>
            </div>

            {/* Guest Prompt */}
            {!isAuthenticated && (
              <div className="bg-brand/10 border border-brand/20 rounded-brand-xl p-6 mb-8 text-center">
                <h4 className="font-bold text-brand mb-2">
                  Save your progress!
                </h4>
                <p className="text-sm text-textMain mb-4">
                  Create an account to track your performance over time and see
                  detailed analytics.
                </p>
                <Button variant="primary" size="md">
                  Sign Up Now
                </Button>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-brand flex items-center gap-3">
                <AlertTriangle size={18} />
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand mb-2 block">
                    Examination Year
                  </label>
                  <select
                    className="w-full bg-bgSurface border border-borderMuted p-3 rounded-brand text-sm focus:border-brand outline-none transition-colors"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {AVAILABLE_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand mb-2 block">
                    Subject Combination
                  </label>

                  {/* Subject 1: English (Locked) */}
                  <div className="bg-bgSurface/50 border border-borderMuted p-3 rounded-brand text-sm text-textDim flex items-center justify-between">
                    <span>English Language</span>
                    <span className="text-[10px] font-bold bg-brand/10 text-brand px-2 py-0.5 rounded">
                      Compulsory
                    </span>
                  </div>

                  {/* Subjects 2-4 */}
                  {[1, 2, 3].map((idx) => (
                    <select
                      key={idx}
                      className="w-full bg-bgSurface border border-borderMuted p-3 rounded-brand text-sm focus:border-brand outline-none transition-colors"
                      value={selectedCombination[idx]}
                      onChange={(e) => updateSubject(idx, e.target.value)}
                    >
                      <option value="">Select Subject {idx + 1}</option>
                      {AVAILABLE_SUBJECTS.filter((s) => s.id !== "English").map(
                        (sub) => (
                          <option
                            key={sub.id}
                            value={sub.id}
                            disabled={selectedCombination.includes(sub.id)}
                          >
                            {sub.name}
                          </option>
                        ),
                      )}
                    </select>
                  ))}
                </div>
              </div>

              <div className="bg-bgSurface/30 rounded-brand-xl p-6 border border-borderMuted">
                <h3 className="text-sm font-bold uppercase tracking-widest text-textDim mb-4">
                  Exam Structure
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle size={18} className="text-brand shrink-0" />
                    <span>English: 60 questions (Compulsory)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle size={18} className="text-brand shrink-0" />
                    <span>Other Subjects: 40 questions each</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle size={18} className="text-brand shrink-0" />
                    <span>Total Questions: 180</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle size={18} className="text-brand shrink-0" />
                    <span>Duration: 2 Hours (120 Minutes)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle size={18} className="text-brand shrink-0" />
                    <span>Real-time JAMB scoring (0-400)</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={
                selectedCombination.some((s) => s === "") || isLoadingQuestions
              }
              onClick={handleStart}
              className="py-4 text-lg font-bold relative overflow-hidden group"
            >
              {isLoadingQuestions ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Fetching Questions...</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">Start Mock Exam</span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </>
              )}
            </Button>

            {isLoadingQuestions && (
              <p className="text-[10px] text-center text-textDim mt-4 animate-pulse font-bold uppercase tracking-widest">
                Please wait while we prepare your exam...
              </p>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  // Result Screen
  if (isFinished) {
    return (
      <AppLayout
        currentPage="mock"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <MockResultsScreen
          onRetry={() => {
            resetExam();
            setErrorMessage(null);
            setActiveSubject("English");
          }}
          onHome={() => {
            resetExam();
            navigate("/");
          }}
        />
      </AppLayout>
    );
  }

  // Active Exam Screen
  const q = questions[currentIndex];
  const chosen = answers[currentIndex] ?? -1;
  const answeredCount = Object.keys(answers).length;
  const isMarked = markedForReview.includes(currentIndex);
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <AppLayout
      currentPage="mock"
      hideSidebar
      className="bg-bgMain"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="flex h-screen overflow-hidden bg-bgMain">
        {/* Desktop Sidebar (Internal to Mock Exam) */}
        <div className="hidden lg:flex flex-col w-72 bg-bgCard border-r border-borderMuted overflow-y-auto">
          <div className="p-5 border-b border-borderMuted bg-bgSurface/50">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-display font-black text-white text-sm shadow-brand/20 shadow-lg">
                J
              </div>
              <span className="font-display font-bold text-sm tracking-tight">
                JAMBIFY{" "}
                <span className="text-textDim font-medium text-[10px] uppercase ml-1">
                  Mock Engine
                </span>
              </span>
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand mb-4 flex items-center gap-2">
              <div className="w-1 h-3 bg-brand rounded-full"></div>
              Subjects
            </h3>
            <SubjectSidebar
              activeSubject={activeSubject}
              onSubjectChange={(sub) => {
                const idx = questions.findIndex(
                  (quest) => quest.subject === sub,
                );
                if (idx !== -1) setCurrentIndex(idx);
              }}
            />
          </div>
          <div className="p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand mb-4 flex items-center gap-2">
              <div className="w-1 h-3 bg-brand rounded-full"></div>
              Navigation
            </h3>
            <QuestionPalette onJumpToQuestion={jumpToQuestion} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bgMain">
          {/* Header */}
          <header className="z-30 bg-bgCard border-b border-borderMuted px-3 py-2 sm:px-6 sm:py-3 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => setShowConfirmExit(true)}
                className="p-1.5 sm:p-2 hover:bg-bgSurface rounded-full transition-all text-textDim hover:text-danger active:scale-90 shrink-0"
                title="Exit Exam"
              >
                <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
              <div className="h-6 w-px bg-borderMuted hidden sm:block"></div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-textMain truncate leading-tight">
                  {activeSubject}
                </h1>
                <p className="text-[9px] sm:text-[10px] text-textDim uppercase font-bold tracking-tighter truncate opacity-80">
                  Q
                  {questions
                    .filter((quest) => quest.subject === activeSubject)
                    .findIndex((quest) => quest.id === q.id) + 1}{" "}
                  /{" "}
                  {
                    questions.filter((quest) => quest.subject === activeSubject)
                      .length
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 ml-2">
              <div
                className={cn(
                  "flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full border font-mono font-black tabular-nums shadow-sm transition-colors",
                  status === "red"
                    ? "bg-danger/10 border-danger/30 text-danger animate-pulse"
                    : status === "orange"
                      ? "bg-warning/10 border-warning/30 text-warning"
                      : status === "yellow"
                        ? "bg-warning/10 border-warning/20 text-warning"
                        : "bg-success/10 border-success/20 text-success",
                )}
              >
                <Clock size={12} className="sm:w-4.5 sm:h-4.5" />
                <span className="text-[11px] sm:text-base">
                  {formattedTime}
                </span>
              </div>

              {/* Submit Button in Header - Always visible but responsive */}
              <Button
                variant="success"
                size="sm"
                onClick={() => setShowConfirmSubmit(true)}
                icon={<CheckCircle size={16} />}
                className="shadow-success/20 shadow-lg px-3 sm:px-6 font-bold"
              >
                <span className="hidden sm:inline">Submit Exam</span>
                <span className="sm:hidden text-[10px]">Submit</span>
              </Button>

              <button
                className="lg:hidden p-1.5 hover:bg-bgSurface rounded-full active:scale-90 text-textDim shrink-0"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </header>

          {/* Progress Indicator */}
          <div className="w-full h-1 bg-bgSurface shrink-0">
            <div
              className="h-full bg-brand transition-all duration-500 ease-out"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 scrollbar-thin scrollbar-thumb-borderMuted">
            <div className="max-w-3xl mx-auto w-full">
              <div className="bg-bgCard border border-borderMuted rounded-brand-2xl p-6 sm:p-10 shadow-xl mb-10 transition-all">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/10">
                      {q.subject}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-bgSurface text-textDim border border-borderMuted">
                      {q.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-textDim uppercase">
                      Jump to:
                    </span>
                    <form onSubmit={handleJumpSubmit}>
                      <input
                        type="number"
                        value={jumpTo}
                        onChange={(e) => setJumpTo(e.target.value)}
                        placeholder="#"
                        className="w-12 h-8 px-2 bg-bgSurface border border-borderMuted rounded-lg text-xs font-bold focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all text-center"
                      />
                    </form>
                  </div>
                </div>

                {/* English Instructions / Section */}
                {q.instruction && (
                  <div className="mb-6 p-4 bg-bgSurface/50 border-l-4 border-brand rounded-r-xl text-xs sm:text-sm text-textMain italic leading-relaxed whitespace-pre-line">
                    <div className="flex items-center gap-2 mb-2 not-italic">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                      <span className="font-black uppercase tracking-widest text-[10px] text-brand">
                        Instructions
                      </span>
                    </div>
                    {q.instruction.replace(/<[^>]*>/g, "")}{" "}
                    {/* Strip HTML tags if any */}
                  </div>
                )}

                <p className="text-xl sm:text-2xl text-textMain mb-10 leading-relaxed font-semibold tracking-tight">
                  {q.text}
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {q.options.map((opt, i) => (
                    <OptionButton
                      key={`${currentIndex}-${i}`}
                      index={i}
                      text={opt}
                      chosen={chosen}
                      correct={-1}
                      answered={false}
                      onSelect={() => submitAnswer(currentIndex, i)}
                    />
                  ))}
                </div>
              </div>

              {/* Action Bar - Cleaned up */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                  <button
                    onClick={() => markForReview(currentIndex)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 min-w-17.5 h-14 rounded-xl border transition-all active:scale-95 shadow-sm",
                      isMarked
                        ? "bg-orange-500 text-white border-orange-600"
                        : "bg-bgCard text-textDim border-borderMuted hover:border-orange-500/50 hover:text-orange-500",
                    )}
                  >
                    <Flag
                      size={18}
                      className={cn(!isMarked && "text-orange-500")}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Review
                    </span>
                  </button>

                  <button
                    onClick={() => clearResponse(currentIndex)}
                    className="flex flex-col items-center justify-center gap-1 min-w-17.5 h-14 rounded-xl bg-bgCard text-textDim border border-borderMuted transition-all active:scale-95 hover:border-danger/50 hover:text-danger shadow-sm"
                  >
                    <Trash2 size={18} className="text-danger" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Clear
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled={currentIndex === 0}
                    onClick={prevQuestion}
                    icon={<ChevronLeft size={20} />}
                    className="flex-1 sm:flex-none font-bold bg-bgCard shadow-sm h-14"
                  >
                    <span className="hidden sm:inline">Prev</span>
                  </Button>

                  {isLastQuestion ? (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => setShowConfirmSubmit(true)}
                      icon={<CheckCircle size={18} />}
                      className="flex-1 sm:flex-none font-black text-sm px-8 sm:px-12 shadow-success/30 shadow-lg h-14"
                    >
                      Submit Exam
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={nextQuestion}
                      iconRight={<ChevronRight size={20} />}
                      className="flex-1 sm:flex-none font-black text-sm px-8 sm:px-10 shadow-brand/30 shadow-lg h-14"
                    >
                      <span className="hidden sm:inline">Save & Next</span>
                      <span className="sm:hidden">Next</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar/Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative w-80 max-w-[80%] bg-bgCard h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-borderMuted flex items-center justify-between">
              <h2 className="font-bold">Exam Navigator</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-bgSurface rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand mb-4">
                  Subjects
                </h3>
                <SubjectSidebar
                  activeSubject={activeSubject}
                  onSubjectChange={(sub) => {
                    const idx = questions.findIndex(
                      (quest) => quest.subject === sub,
                    );
                    if (idx !== -1) jumpToQuestion(idx);
                  }}
                />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand mb-4">
                  Question Palette
                </h3>
                <QuestionPalette onJumpToQuestion={jumpToQuestion} />
              </div>
            </div>

            {/* Mobile Submit Button */}
            <div className="p-4 border-t border-borderMuted bg-bgSurface/30">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setIsSidebarOpen(false);
                  setShowConfirmSubmit(true);
                }}
                className="shadow-brand/20 shadow-lg font-bold"
              >
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      {showConfirmExit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Exit Exam?</h3>
            <p className="text-sm text-textMuted mb-8 text-center">
              Are you sure you want to exit? Your progress will not be saved and
              this attempt will be lost.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setShowConfirmExit(false)}
              >
                Continue Exam
              </Button>
              <Button
                variant="danger"
                size="lg"
                fullWidth
                onClick={() => {
                  resetExam();
                  navigate("/");
                }}
              >
                Exit Exam
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-200 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowConfirmSubmit(false)}
          />
          <div className="relative bg-bgDeep border border-borderMuted p-8 rounded-brand-xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-display font-bold mb-3">
              Ready to submit?
            </h3>
            <p className="text-textDim text-sm mb-8 leading-relaxed">
              You still have{" "}
              <span className="text-textMain font-bold">
                {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
              </span>{" "}
              remaining. Make sure you've reviewed all your answers.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowConfirmSubmit(false)}
                className="font-bold h-12"
              >
                Go Back
              </Button>
              <Button
                variant="success"
                fullWidth
                onClick={handleFinishExam}
                className="font-black h-12 shadow-success/20 shadow-lg"
              >
                Yes, Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default MockExam;
