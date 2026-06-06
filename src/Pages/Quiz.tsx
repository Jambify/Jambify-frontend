import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { useQuizStore } from "../Store/useQuizStore";
import QuestionCard from "../components/Quiz/QuestionCard";
import TimerBar from "../components/Quiz/TimeBar";
import ResultsScreen from "../components/Quiz/ResultScreen";
import Button from "../components/ui/Button";
import {
  fetchTopicsBySubject,
  fetchQuestionsByTopic,
  fetchQuestionsWithFallback,
} from "../Services/questionService";
import LoadingScreen from "../components/ui/LoadingScreen";
import {
  Loader2,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { useOfflineStore } from "../Store/useOfflineStore";

/** Subject filter options shown on the quiz start screen with icons and colors */
const QUIZ_SUBJECTS = [
  { name: "English", icon: "📖", color: "from-blue-500 to-indigo-600" },
  { name: "Mathematics", icon: "🔢", color: "from-emerald-500 to-teal-600" },
  { name: "Physics", icon: "⚡", color: "from-amber-400 to-orange-600" },
  { name: "Chemistry", icon: "⚗️", color: "from-rose-500 to-pink-600" },
  { name: "Biology", icon: "🧬", color: "from-green-500 to-emerald-700" },
  { name: "Economics", icon: "📊", color: "from-orange-400 to-amber-600" },
  { name: "Government", icon: "🏛️", color: "from-purple-500 to-indigo-700" },
  {
    name: "Literature in English",
    icon: "📚",
    color: "from-pink-500 to-rose-700",
  },
  { name: "History", icon: "📜", color: "from-amber-700 to-orange-900" },
  { name: "Geography", icon: "🌍", color: "from-blue-400 to-cyan-600" },
  { name: "CRS", icon: "✝️", color: "from-indigo-400 to-blue-600" },
];

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const visibleSubjects = showAllSubjects
    ? QUIZ_SUBJECTS
    : QUIZ_SUBJECTS.slice(0, 6);
  const {
    questions,
    currentIndex,
    isStarted,
    selectedSubject,
    setSelectedSubject,
    selectedTopic,
    setSelectedTopic,
    selectedDifficulty,
    setSelectedDifficulty,
    loadQuestions,
    reset,
  } = useQuizStore();

  const isFinished = useQuizStore((s) => s.isFinished);

  // Sync results state with store
  useEffect(() => {
    if (isFinished) {
      setShowResults(true);
    }
  }, [isFinished]);

  /** Fetch topics when subject changes */
  useEffect(() => {
    if (selectedSubject && selectedSubject !== "All") {
      setIsLoadingTopics(true);
      fetchTopicsBySubject(selectedSubject)
        .then((topics) => {
          setAvailableTopics(topics);
          setSelectedTopic("All");
        })
        .finally(() => setIsLoadingTopics(false));
    } else {
      setAvailableTopics([]);
      setSelectedTopic("All");
    }
  }, [selectedSubject, setSelectedTopic]);

  /** Clean up when leaving the page */
  useEffect(
    () => () => {
      reset();
    },
    [],
  );

  if (isLoadingQuestions) {
    return (
      <LoadingScreen
        message="Preparing your quiz"
        submessage={`Fetching ${selectedSubject} questions for your practice session...`}
        estimatedTime={2}
      />
    );
  }

  const handleStart = async () => {
    if (selectedSubject === "All") return;

    setShowExitModal(false);
    setLoadError(null);
    setIsLoadingQuestions(true);

    // Wait a tiny bit for the loader to mount smoothly
    await new Promise((r) => setTimeout(r, 100));

    try {
      // ── CHECK NETWORK & CACHE ──────────────────────────────
      const isOnline = navigator.onLine;
      const offlineStore = useOfflineStore.getState();

      let qs: any[] = [];

      // Try offline first if user is offline
      if (!isOnline) {
        console.log("📴 User is offline. Checking local cache...");
        // Look for any pack that might contain this subject
        const packs = offlineStore.downloadedPacks.filter((p) =>
          p.startsWith(selectedSubject.toLowerCase().slice(0, 3)),
        );
        if (packs.length > 0) {
          const offlineQs = await offlineStore.getOfflineQuestions(packs[0]);
          if (offlineQs.length > 0) {
            qs = offlineQs.sort(() => Math.random() - 0.5).slice(0, 20);
            console.log("✅ Loaded questions from offline pack:", packs[0]);
          }
        }

        if (qs.length === 0) {
          throw new Error(
            "OFFLINE: You need an internet connection to load new questions, and no offline packs were found for this subject.",
          );
        }
      }

      // If still no questions (online or no offline cache)
      if (qs.length === 0) {
        try {
          if (selectedTopic === "All") {
            // Get questions for the whole subject (Random years fallback)
            qs = await fetchQuestionsWithFallback(
              selectedSubject,
              "Random",
              20,
              selectedDifficulty,
            );
          } else {
            // Get questions for the specific topic
            qs = await fetchQuestionsByTopic(
              selectedSubject,
              selectedTopic,
              20,
              selectedDifficulty,
            );
          }
        } catch (err) {
          throw new Error(
            "CONNECTION_ERROR: Failed to fetch questions. Please check your internet connection and try again.",
          );
        }
      }

      if (qs.length === 0) {
        // Fallback to general questions if topic returns nothing
        qs = await fetchQuestionsWithFallback(
          selectedSubject,
          "Random",
          20,
          selectedDifficulty,
        );
      }

      if (qs.length === 0) {
        throw new Error(
          "NO_QUESTIONS: Could not find any questions for this selection. Try a different subject or year.",
        );
      }

      loadQuestions(qs);
    } catch (error: any) {
      console.error("Failed to load quiz questions:", error);
      setLoadError(error.message);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  /* ── Results ───────────────────────────────────────── */
  if (showResults) {
    return (
      <AppLayout
        currentPage="quiz"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <ResultsScreen onRetry={handleStart} onHome={() => navigate("/")} />
      </AppLayout>
    );
  }

  /* ── Active quiz ───────────────────────────────────── */
  if (isStarted && questions.length > 0) {
    return (
      <AppLayout
        currentPage="quiz"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        {/* <Progress header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setShowExitModal(true)} // Trigger Modal
            className="text-textMuted hover:text-textMain touch-target no-double-tap flex shrink-0 items-center gap-1.5 text-xs transition-colors active:scale-95"
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
          <div className="flex flex-1 items-center justify-center gap-1">
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
                        : "var(--borderMuted)",
                }}
              />
            ))}
          </div>

          <span className="text-textDim shrink-0 font-mono text-xs">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <TimerBar />
        <QuestionCard />

        {/* ── Exit Modal Overlay ── */}
        {showExitModal && (
          <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 p-4 backdrop-blur-sm">
            <div className="bg-bgCard border-borderMuted rounded-brand-xl animate-slideDown w-full max-w-sm border p-6 shadow-2xl">
              <h3 className="font-display text-textMain mb-2 text-xl font-bold">
                Quit Quiz?
              </h3>
              <p className="text-textMuted mb-6 text-sm">
                Your progress will be lost. Are you sure you want to exit the
                current session?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="rounded-brand bg-bgSurface hover:bg-bgDeep text-textMain touch-target no-double-tap flex-1 py-3 font-medium transition-colors active:scale-95"
                >
                  Stay
                </button>
                <button
                  onClick={reset}
                  className="rounded-brand bg-danger hover:bg-danger/80 touch-target no-double-tap flex-1 py-3 font-medium text-white transition-colors active:scale-95"
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
    <AppLayout
      currentPage="quiz"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="mx-auto max-w-2xl">
        {/* Error Message */}
        {loadError && (
          <div className="bg-danger/10 border-danger/20 animate-in fade-in slide-in-from-top-4 mb-6 rounded-2xl border p-4 duration-300">
            <div className="flex items-start gap-3">
              <div className="bg-danger/20 text-danger flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <AlertTriangle size={16} />
              </div>
              <div className="flex-1">
                <p className="text-danger text-sm font-bold">
                  Failed to start quiz
                </p>
                <p className="text-danger/80 mt-1 text-xs leading-relaxed">
                  {loadError}
                </p>
                <button
                  onClick={() => setLoadError(null)}
                  className="text-danger mt-3 text-[10px] font-black tracking-widest uppercase hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* <Hero */}
        <div className="mb-10 pt-4 text-center">
          <div className="bg-brand/10 border-brand/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl">
            📝
          </div>
          <h2 className="font-display mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Practice Quiz
          </h2>
          <p className="text-textMuted mx-auto max-w-sm text-sm">
            20 adaptive questions · 60 seconds each · Instant explanations
          </p>
        </div>

        {/* Subject filter */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-textDim flex items-center gap-2 text-[11px] font-black tracking-widest uppercase">
              <BookOpen size={14} className="text-brand" />
              1. Select Subject
            </p>
            <button
              onClick={() => setShowAllSubjects(!showAllSubjects)}
              className="text-brand hover:text-brand-light text-[10px] font-black tracking-widest uppercase transition-colors"
            >
              {showAllSubjects ? "Show Less" : "Show All"}
            </button>
          </div>

          {/* 📱 Mobile Scrollable List */}
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-2 sm:hidden">
            {QUIZ_SUBJECTS.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSubject(s.name)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-5 py-3 text-xs font-bold transition-all active:scale-95 ${
                  selectedSubject === s.name
                    ? "bg-brand border-brand shadow-brand/20 text-white shadow-lg"
                    : "bg-bgCard text-textMain border-borderMuted hover:border-brand/30 dark:hover:border-brand/40 hover:shadow-sm"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          {/* 💻 Desktop Grid */}
          <div className="hidden grid-cols-3 gap-3 sm:grid">
            {visibleSubjects.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSubject(s.name)}
                className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border p-4 transition-all active:scale-95 ${
                  selectedSubject === s.name
                    ? "bg-brand border-brand shadow-brand/20 -translate-y-1 shadow-xl"
                    : "bg-bgCard border-borderMuted hover:border-brand/30 dark:hover:border-brand/40 hover:shadow-sm dark:hover:bg-bgSurface"
                }`}
              >
                {/* Background Gradient on Select */}
                {selectedSubject === s.name && (
                  <div
                    className={`absolute inset-0 bg-linear-to-br opacity-20 ${s.color}`}
                  />
                )}

                <span
                  className={`mb-2 text-3xl transition-transform duration-300 group-hover:scale-110 ${selectedSubject === s.name ? "scale-110" : ""}`}
                >
                  {s.icon}
                </span>
                <span
                  className={`text-xs font-bold tracking-tight transition-colors ${selectedSubject === s.name ? "text-white" : "text-textMain"}`}
                >
                  {s.name}
                </span>

                {selectedSubject === s.name && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Topic filter - Only if subject is selected */}
        {selectedSubject !== "All" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 mb-10 duration-500">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-textDim flex items-center gap-2 text-[11px] font-black tracking-widest uppercase">
                <Layers size={14} className="text-brand" />
                2. Choose Topic
              </p>
              {availableTopics.length > 0 && (
                <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-[10px] font-bold">
                  {availableTopics.length} Topics Found
                </span>
              )}
            </div>

            {isLoadingTopics ? (
              <div className="bg-bgSurface/30 border-borderMuted flex flex-col items-center justify-center rounded-2xl border border-dashed p-12">
                <Loader2 className="text-brand mb-2 h-6 w-6 animate-spin" />
                <p className="text-textDim text-[10px] tracking-tighter uppercase">
                  Fetching Topics...
                </p>
              </div>
            ) : availableTopics.length > 0 ? (
              <div className="custom-scrollbar grid max-h-75 grid-cols-1 gap-2 overflow-y-auto pr-2 sm:grid-cols-2">
                <button
                  onClick={() => setSelectedTopic("All")}
                  className={`relative overflow-hidden rounded-xl border px-4 py-4 text-left text-xs font-bold transition-all ${
                    selectedTopic === "All"
                      ? "bg-brand/10 border-brand text-brand ring-brand/30 ring-1"
                      : "bg-bgSurface text-textDim border-borderMuted hover:border-brand/30 hover:bg-bgCard"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg ${selectedTopic === "All" ? "bg-brand text-white" : "bg-bgDeep text-textDim"}`}
                    >
                      🎯
                    </div>
                    <div>
                      <p
                        className={
                          selectedTopic === "All"
                            ? "text-brand"
                            : "text-textMain"
                        }
                      >
                        General (Mix)
                      </p>
                      <p className="text-[10px] font-medium opacity-60">
                        All available topics
                      </p>
                    </div>
                  </div>
                  {selectedTopic === "All" && (
                    <div className="bg-brand absolute top-1/2 right-3 h-1.5 w-1.5 -translate-y-1/2 animate-pulse rounded-full" />
                  )}
                </button>

                {availableTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`relative overflow-hidden rounded-xl border px-4 py-4 text-left text-xs font-bold transition-all ${
                      selectedTopic === topic
                        ? "bg-brand/10 border-brand text-brand ring-brand/30 ring-1"
                        : "bg-bgSurface text-textDim border-borderMuted hover:border-brand/30 hover:bg-bgCard"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg ${selectedTopic === topic ? "bg-brand text-white" : "bg-bgDeep text-textDim"}`}
                      >
                        <Sparkles size={14} />
                      </div>
                      <div>
                        <p
                          className={`line-clamp-1 ${selectedTopic === topic ? "text-brand" : "text-textMain"}`}
                        >
                          {topic}
                        </p>
                        <p className="text-[10px] font-medium opacity-60">
                          Specific practice
                        </p>
                      </div>
                    </div>
                    {selectedTopic === topic && (
                      <div className="bg-brand absolute top-1/2 right-3 h-1.5 w-1.5 -translate-y-1/2 animate-pulse rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-bgSurface/30 border-borderMuted rounded-2xl border border-dashed p-8 text-center">
                <div className="bg-bgDeep mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                  <Layers size={20} className="text-textDim" />
                </div>
                <p className="text-textMain mb-1 text-sm font-bold">
                  No Topics Found
                </p>
                <p className="text-textDim text-xs">
                  We're still updating the database for {selectedSubject}. You
                  can play in "General" mode!
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. Select Difficulty */}
        {selectedSubject !== "All" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 mb-10 duration-700">
            <p className="text-textDim mb-4 flex items-center gap-2 text-[11px] font-black tracking-widest uppercase">
              <Sparkles size={14} className="text-brand" />
              3. Select Difficulty
            </p>
            <div className="grid grid-cols-4 gap-2">
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d as any)}
                  className={`rounded-xl border py-3 text-[11px] font-bold transition-all active:scale-95 ${
                    selectedDifficulty === d
                      ? d === "Easy"
                        ? "bg-success/10 border-success text-success"
                        : d === "Medium"
                          ? "bg-warn/10 border-warn text-warn"
                          : d === "Hard"
                            ? "bg-danger/10 border-danger text-danger"
                            : "bg-brand/10 border-brand text-brand"
                      : "bg-bgCard border-borderMuted text-textDim hover:border-brand/20 dark:hover:border-white/20"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* <Mode cards */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              className={`rounded-brand-lg cursor-pointer border p-4 transition-all ${
                mode.active
                  ? "bg-brand/10 border-brand/40 ring-brand/20 ring-1"
                  : "bg-bgSurface border-borderMuted opacity-70 hover:border-brand/20 dark:hover:border-white/15"
              }`}
            >
              <div className="mb-2 text-2xl">{mode.icon}</div>
              <p className="font-display text-sm font-semibold tracking-tight">
                {mode.label}
              </p>
              <p className="text-textDim mt-0.5 text-[11px]">{mode.desc}</p>
              {!mode.active && (
                <p className="text-brand-light mt-1.5 text-[10px]">
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
          disabled={isLoadingQuestions}
          className="shadow-brand/20 group relative overflow-hidden py-5 text-lg font-black shadow-xl"
        >
          {isLoadingQuestions ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          ) : (
            <>
              <span className="relative z-10">Start Practice Quiz</span>
              <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0"></div>
            </>
          )}
        </Button>
      </div>
    </AppLayout>
  );
};

export default Quiz;
