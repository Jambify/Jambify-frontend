import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { useQuizStore } from "../Store/useQuizStore";
import { SAMPLE_QUESTIONS } from "../Data/Question";
import QuestionCard from "../components/Quiz/QuestionCard";
import TimerBar from "../components/Quiz/TimeBar";
import ResultsScreen from "../components/Quiz/ResultScreen";
import Button from "../components/ui/Button";

/** Subject filter options shown on the quiz start screen */
const SUBJECTS = [
  "All",
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
  "Christian Religious Studies (CRS)",
];

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAllSubjects, setShowAllSubjects] = React.useState(false);
  const [showExitModal, setShowExitModal] = React.useState(false); // Added State
  const visibleSubjects = showAllSubjects ? SUBJECTS : SUBJECTS.slice(0, 4);
  const {
    questions,
    currentIndex,
    isFinished,
    isStarted,
    selectedSubject,
    setSelectedSubject,
    loadQuestions,
    reset,
  } = useQuizStore();

  /** Clean up when leaving the page */
  useEffect(
    () => () => {
      reset();
    },
    [],
  );

  const handleStart = () => {
    setShowExitModal(false); // Ensure modal is closed on start
    const filtered =
      selectedSubject === "All"
        ? SAMPLE_QUESTIONS
        : SAMPLE_QUESTIONS.filter((q) => q.subject === selectedSubject);
    loadQuestions(filtered.slice(0, 10));
  };

  /* ── Results ───────────────────────────────────────── */
  if (isFinished) {
    return (
      <AppLayout currentPage="quiz"  isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        <ResultsScreen onRetry={handleStart} onHome={() => navigate("/")} />
      </AppLayout>
    );
  }

  /* ── Active quiz ───────────────────────────────────── */
  if (isStarted && questions.length > 0) {
    return (
      <AppLayout currentPage="quiz" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        {/* <Progress header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowExitModal(true)} // Trigger Modal
            className="flex items-center gap-1.5 text-xs text-textMuted hover:text-textMain transition-colors shrink-0"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="hidden sm:inline">Exit</span>
          </button>

          {/* <Dot progress — mobile friendly */}
          <div className="flex items-center gap-1 flex-1 justify-center">
            {questions.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentIndex ? "20px" : "6px",
                  height: "6px",
                  background:
                    i < currentIndex
                      ? "var(--color-success, #00C896)"
                      : i === currentIndex
                        ? "#7B5FFF"
                        : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>

          <span className="text-xs font-mono text-textDim shrink-0">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <TimerBar />
        <QuestionCard />

        {/* ── Exit Modal Overlay ── */}
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-bgCard border border-white/10 p-6 rounded-brand-xl max-w-sm w-full shadow-2xl animate-slideDown">
              <h3 className="font-display text-xl font-bold text-textMain mb-2">Quit Quiz?</h3>
              <p className="text-textMuted text-sm mb-6">
                Your progress will be lost. Are you sure you want to exit the current session?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-3 rounded-brand font-medium bg-white/5 hover:bg-white/10 text-textMain transition-colors"
                >
                  Stay
                </button>
                <button 
                  onClick={reset}
                  className="flex-1 py-3 rounded-brand font-medium bg-danger text-white hover:bg-danger/80 transition-colors"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    );
  }

  /* ── Start screen ──────────────────────────────────── */
  return (
    <AppLayout currentPage="quiz" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
      <div className="max-w-2xl mx-auto">
        {/* <Hero */}
        <div className="text-center mb-10 pt-4">
          <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            📝
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Practice Quiz
          </h2>
          <p className="text-sm text-textMuted max-w-sm mx-auto">
            10 adaptive questions · 90 seconds each · Instant explanations
          </p>
        </div>

        {/* <{/* Subject filter */}
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-widest text-textDim font-medium mb-3">
            Choose subject
          </p>

          {/* 📱 Mobile Dropdown */}
          <div className="sm:hidden">
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-bgSurface text-sm text-textMain border border-borderMuted focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Custom dropdown icon */}
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-textDim">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 💻 Desktop Pills */}
          <div className="hidden sm:flex flex-wrap gap-2 items-center">
            {visibleSubjects.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium relative overflow-hidden transition-all duration-300 ease-out
      ${
        selectedSubject === s
          ? "bg-brand text-warning shadow-lg shadow-brand/30 scale-105"
          : "bg-bgSurface text-textMuted hover:bg-white/5 hover:text-textMain hover:scale-[1.03]"
      }
      focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2 focus:ring-offset-bgCard
    `}
              >
                {s}
              </button>
            ))}

            {/* Show More / Less Button */}
            {SUBJECTS.length > 4 && (
              <button
                onClick={() => setShowAllSubjects((prev) => !prev)}
                className="px-3 py-2 text-xs font-medium rounded-full cursor-pointer
  bg-bgSurface border border-borderMuted
  text-textDim hover:text-textMain hover:border-white/20
  hover:bg-white/5 transition-all duration-200
  active:scale-95"
              >
                {showAllSubjects ? "Show less" : `+${SUBJECTS.length - 4} more`}
              </button>
            )}
          </div>
        </div>

        {/* <Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            {
              icon: "⚡",
              label: "Quick Fire",
              desc: "10 Qs · 60s each",
              active: true,
            },
            {
              icon: "🎯",
              label: "Standard",
              desc: "20 Qs · 90s each",
              active: false,
            },
            {
              icon: "🏆",
              label: "Mock Exam",
              desc: "180 Qs · 2 hours",
              active: false,
            },
          ].map((mode) => (
            <div
              key={mode.label}
              className={`p-4 rounded-brand-lg border cursor-pointer transition-all ${
                mode.active
                  ? "bg-brand/10 border-brand/40 ring-1 ring-brand/20"
                  : "bg-bgSurface border-borderMuted hover:border-white/15 opacity-60"
              }`}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <p className="font-display font-semibold text-sm tracking-tight">
                {mode.label}
              </p>
              <p className="text-[11px] text-textDim mt-0.5">{mode.desc}</p>
              {!mode.active && (
                <p className="text-[10px] text-brand-light mt-1.5">
                  Coming soon
                </p>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleStart}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          }
        >
          <p className="text-black">Start Quiz</p>
        </Button>
      </div>
    </AppLayout>
  );
};

export default Quiz;