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
import { useUserStore } from "../../Store/useUserStore";
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

import { useOfflineStore } from "../../Store/useOfflineStore";

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
      const offlineStore = useOfflineStore.getState();

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

          if (fetched.length === 0) {
            throw new Error(
              `OFFLINE: No offline packs found for ${subjectId}. Please connect to the internet to load exam questions.`,
            );
          }
        }

        // If still no questions (online or no offline cache)
        if (fetched.length === 0) {
          try {
            fetched = await fetchQuestionsWithFallback(
              subjectId,
              selectedYear,
              config.required,
            );
          } catch (err) {
            throw new Error(
              `CONNECTION_ERROR: Failed to fetch questions for ${subjectId}. Please check your internet connection.`,
            );
          }
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
            const subjectAnswers: Record<string, number> = {};

            // Map the global answer indices to relative indices for this subject session
            subjectQuestions.forEach((q, idx) => {
              const globalIdx = questions.indexOf(q);
              if (answers[globalIdx] !== undefined) {
                subjectAnswers[idx.toString()] = answers[globalIdx];
              }
            });

            return addQuizResult(
              "mock",
              sb.subject,
              subjectQuestions.map((q) => q.id),
              subjectAnswers,
              Math.floor(timeTaken / lastResult.subjectBreakdown.length), // distribute time
              sb.correct, // Pass calculated correct count
              sb.total, // Pass total questions,
              lastResult.topicPerformance,
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
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="bg-bgCard border-borderMuted rounded-brand-xl border p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h2 className="font-display text-brand mb-2 text-3xl font-black">
                JAMB Mock Exam
              </h2>
              <p className="text-textDim text-sm">
                Professional CBT simulation for JAMB 2026
              </p>
            </div>

            {/* Guest Prompt */}
            {!isAuthenticated && (
              <div className="bg-brand/10 border-brand/20 rounded-brand-xl mb-8 border p-6 text-center">
                <h4 className="text-brand mb-2 font-bold">
                  Save your progress!
                </h4>
                <p className="text-textMain mb-4 text-sm">
                  Create an account to track your performance over time and see
                  detailed analytics.
                </p>
                <Button variant="primary" size="md">
                  Sign Up Now
                </Button>
              </div>
            )}

            {errorMessage && (
              <div className="bg-danger/10 border-danger/20 text-danger rounded-brand mb-6 flex items-center gap-3 border p-4 text-sm">
                <AlertTriangle size={18} />
                {errorMessage}
              </div>
            )}

            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <label className="text-brand mb-2 block text-[10px] font-bold tracking-widest uppercase">
                    Examination Year
                  </label>
                  <select
                    className="bg-bgSurface border-borderMuted rounded-brand focus:border-brand w-full border p-3 text-sm transition-colors outline-none"
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
                  <label className="text-brand mb-2 block text-[10px] font-bold tracking-widest uppercase">
                    Subject Combination
                  </label>

                  {/* Subject 1: English (Locked) */}
                  <div className="bg-bgSurface/50 border-borderMuted rounded-brand text-textDim flex items-center justify-between border p-3 text-sm">
                    <span>English Language</span>
                    <span className="bg-brand/10 text-brand rounded px-2 py-0.5 text-[10px] font-bold">
                      Compulsory
                    </span>
                  </div>

                  {/* Subjects 2-4 */}
                  {[1, 2, 3].map((idx) => (
                    <select
                      key={idx}
                      className="bg-bgSurface border-borderMuted rounded-brand focus:border-brand w-full border p-3 text-sm transition-colors outline-none"
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

              <div className="bg-bgSurface/30 rounded-brand-xl border-borderMuted border p-6">
                <h3 className="text-textDim mb-4 text-sm font-bold tracking-widest uppercase">
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
              className="group relative overflow-hidden py-4 text-lg font-bold"
            >
              {isLoadingQuestions ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span>Fetching Questions...</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">Start Mock Exam</span>
                  <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0"></div>
                </>
              )}
            </Button>

            {isLoadingQuestions && (
              <p className="text-textDim mt-4 animate-pulse text-center text-[10px] font-bold tracking-widest uppercase">
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
      <div className="bg-bgMain flex h-screen overflow-hidden">
        {/* Desktop Sidebar (Internal to Mock Exam) */}
        <div className="bg-bgCard border-borderMuted hidden w-72 flex-col overflow-y-auto border-r lg:flex">
          <div className="border-borderMuted bg-bgSurface/50 border-b p-5">
            <div className="mb-6 flex items-center gap-2">
              <div className="bg-brand font-display shadow-brand/20 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white shadow-lg">
                J
              </div>
              <span className="font-display text-sm font-bold tracking-tight">
                JAMBIFY{" "}
                <span className="text-textDim ml-1 text-[10px] font-medium uppercase">
                  Mock Engine
                </span>
              </span>
            </div>
            <h3 className="text-brand mb-4 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
              <div className="bg-brand h-3 w-1 rounded-full"></div>
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
            <h3 className="text-brand mb-4 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
              <div className="bg-brand h-3 w-1 rounded-full"></div>
              Navigation
            </h3>
            <QuestionPalette onJumpToQuestion={jumpToQuestion} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-bgMain flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-bgCard border-borderMuted z-30 flex shrink-0 items-center justify-between border-b px-3 py-2 shadow-sm sm:px-6 sm:py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowConfirmExit(true)}
                className="hover:bg-bgSurface text-textDim hover:text-danger shrink-0 rounded-full p-1.5 transition-all active:scale-90 sm:p-2"
                title="Exit Exam"
              >
                <ChevronLeft size={20} className="sm:h-6 sm:w-6" />
              </button>
              <div className="bg-borderMuted hidden h-6 w-px sm:block"></div>
              <div className="min-w-0">
                <h1 className="text-textMain truncate text-xs leading-tight font-bold sm:text-sm">
                  {activeSubject}
                </h1>
                <p className="text-textDim truncate text-[9px] font-bold tracking-tighter uppercase opacity-80 sm:text-[10px]">
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

            <div className="ml-2 flex shrink-0 items-center gap-1.5 sm:gap-4">
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2.5 py-1.5 font-mono font-black tabular-nums shadow-sm transition-colors sm:gap-2 sm:px-4 sm:py-2",
                  status === "red"
                    ? "bg-danger/10 border-danger/30 text-danger animate-pulse"
                    : status === "orange"
                      ? "bg-warning/10 border-warning/30 text-warning"
                      : status === "yellow"
                        ? "bg-warning/10 border-warning/20 text-warning"
                        : "bg-success/10 border-success/20 text-success",
                )}
              >
                <Clock size={12} className="sm:h-4.5 sm:w-4.5" />
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
                className="shadow-success/20 px-3 font-bold shadow-lg sm:px-6"
              >
                <span className="hidden sm:inline">Submit Exam</span>
                <span className="text-[10px] sm:hidden">Submit</span>
              </Button>

              <button
                className="hover:bg-bgSurface text-textDim shrink-0 rounded-full p-1.5 active:scale-90 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={20} className="sm:h-6 sm:w-6" />
              </button>
            </div>
          </header>

          {/* Progress Indicator */}
          <div className="bg-bgSurface h-1 w-full shrink-0">
            <div
              className="bg-brand h-full transition-all duration-500 ease-out"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Content */}
          <main className="scrollbar-thin scrollbar-thumb-borderMuted flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
            <div className="mx-auto w-full max-w-3xl">
              <div className="bg-bgCard border-borderMuted rounded-brand-2xl mb-10 border p-6 shadow-xl transition-all sm:p-10">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-brand/10 text-brand border-brand/10 rounded-full border px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                      {q.subject}
                    </span>
                    <span className="bg-bgSurface text-textDim border-borderMuted rounded-full border px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                      {q.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-textDim text-[10px] font-bold uppercase">
                      Jump to:
                    </span>
                    <form onSubmit={handleJumpSubmit}>
                      <input
                        type="number"
                        value={jumpTo}
                        onChange={(e) => setJumpTo(e.target.value)}
                        placeholder="#"
                        className="bg-bgSurface border-borderMuted focus:border-brand focus:ring-brand/20 h-8 w-12 rounded-lg border px-2 text-center text-xs font-bold transition-all focus:ring-2 focus:outline-none"
                      />
                    </form>
                  </div>
                </div>

                {/* English Instructions / Section */}
                {q.instruction && (
                  <div className="bg-bgSurface/50 border-brand text-textMain mb-6 rounded-r-xl border-l-4 p-4 text-xs leading-relaxed whitespace-pre-line italic sm:text-sm">
                    <div className="mb-2 flex items-center gap-2 not-italic">
                      <div className="bg-brand h-1.5 w-1.5 rounded-full"></div>
                      <span className="text-brand text-[10px] font-black tracking-widest uppercase">
                        Instructions
                      </span>
                    </div>
                    {q.instruction.replace(/<[^>]*>/g, "")}{" "}
                    {/* Strip HTML tags if any */}
                  </div>
                )}

                <p className="text-textMain mb-10 text-xl leading-relaxed font-semibold tracking-tight sm:text-2xl">
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
              <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
                <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:justify-start">
                  <button
                    onClick={() => markForReview(currentIndex)}
                    className={cn(
                      "flex h-14 min-w-17.5 flex-col items-center justify-center gap-1 rounded-xl border shadow-sm transition-all active:scale-95",
                      isMarked
                        ? "border-orange-600 bg-orange-500 text-white"
                        : "bg-bgCard text-textDim border-borderMuted hover:border-orange-500/50 hover:text-orange-500",
                    )}
                  >
                    <Flag
                      size={18}
                      className={cn(!isMarked && "text-orange-500")}
                    />
                    <span className="text-[10px] font-black tracking-widest uppercase">
                      Review
                    </span>
                  </button>

                  <button
                    onClick={() => clearResponse(currentIndex)}
                    className="bg-bgCard text-textDim border-borderMuted hover:border-danger/50 hover:text-danger flex h-14 min-w-17.5 flex-col items-center justify-center gap-1 rounded-xl border shadow-sm transition-all active:scale-95"
                  >
                    <Trash2 size={18} className="text-danger" />
                    <span className="text-[10px] font-black tracking-widest uppercase">
                      Clear
                    </span>
                  </button>
                </div>

                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled={currentIndex === 0}
                    onClick={prevQuestion}
                    icon={<ChevronLeft size={20} />}
                    className="bg-bgCard h-14 flex-1 font-bold shadow-sm sm:flex-none"
                  >
                    <span className="hidden sm:inline">Prev</span>
                  </Button>

                  {isLastQuestion ? (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => setShowConfirmSubmit(true)}
                      icon={<CheckCircle size={18} />}
                      className="shadow-success/30 h-14 flex-1 px-8 text-sm font-black shadow-lg sm:flex-none sm:px-12"
                    >
                      Submit Exam
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={nextQuestion}
                      iconRight={<ChevronRight size={20} />}
                      className="shadow-brand/30 h-14 flex-1 px-8 text-sm font-black shadow-lg sm:flex-none sm:px-10"
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
          <div className="bg-bgCard animate-in slide-in-from-right relative flex h-full w-80 max-w-[80%] flex-col duration-300">
            <div className="border-borderMuted flex items-center justify-between border-b p-4">
              <h2 className="font-bold">Exam Navigator</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="hover:bg-bgSurface rounded-full p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 space-y-8 overflow-y-auto p-4">
              <div>
                <h3 className="text-brand mb-4 text-[10px] font-bold tracking-widest uppercase">
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
                <h3 className="text-brand mb-4 text-[10px] font-bold tracking-widest uppercase">
                  Question Palette
                </h3>
                <QuestionPalette onJumpToQuestion={jumpToQuestion} />
              </div>
            </div>

            {/* Mobile Submit Button */}
            <div className="border-borderMuted bg-bgSurface/30 border-t p-4">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setIsSidebarOpen(false);
                  setShowConfirmSubmit(true);
                }}
                className="shadow-brand/20 font-bold shadow-lg"
              >
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      {showConfirmExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-bgCard border-borderMuted rounded-brand-xl animate-in zoom-in-95 w-full max-w-sm border p-8 shadow-2xl duration-200">
            <div className="bg-danger/10 text-danger mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <AlertTriangle size={32} />
            </div>
            <h3 className="mb-2 text-center text-xl font-bold">Exit Exam?</h3>
            <p className="text-textMuted mb-8 text-center text-sm">
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
          <div className="bg-bgDeep border-borderMuted rounded-brand-xl animate-in fade-in zoom-in-95 relative w-full max-w-md border p-8 shadow-2xl duration-200">
            <h3 className="font-display mb-3 text-xl font-bold">
              Ready to submit?
            </h3>
            <p className="text-textDim mb-8 text-sm leading-relaxed">
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
                className="h-12 font-bold"
              >
                Go Back
              </Button>
              <Button
                variant="success"
                fullWidth
                onClick={handleFinishExam}
                className="shadow-success/20 h-12 font-black shadow-lg"
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
