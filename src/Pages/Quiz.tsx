import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { useQuizStore } from "../Store/useQuizStore";
import QuestionCard from "../components/Quiz/QuestionCard";
import TimerBar from "../components/Quiz/TimeBar";
import ResultsScreen from "../components/Quiz/ResultScreen";
import Button from "../components/ui/Button";
import {
  fetchQuestionsByTopic,
  fetchQuestionsWithFallback,
} from "../Services/questionService";
import LoadingScreen from "../components/ui/LoadingScreen";
import NetworkErrorAlert from "../components/ui/NetworkErrorAlert";
import {
  Loader2,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useOfflineStore } from "../Store/useOfflineStore";
import type { Question } from "../Types";

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
  { name: "IRS", icon: "🌙", color: "from-emerald-600 to-green-700" },
  { name: "Commerce", icon: "💼", color: "from-amber-500 to-orange-600" },
];

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedMode, setSelectedMode] = useState<
    "quick" | "standard" | "marathon"
  >("standard");

  const topicsRef = React.useRef<HTMLDivElement>(null);

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
    isFinished,
    setSubjectAndTopic,
  } = useQuizStore();

  // NOTE: We no longer reset on mount, so we can resume the quiz if the user refreshes!

  // ── Handle Incoming Navigation Parameters ───────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get("subject");
    const topicParam = params.get("topic");

    if (subjectParam) {
      const decodedSubject = decodeURIComponent(subjectParam);
      const decodedTopic = topicParam ? decodeURIComponent(topicParam) : "All";

      // First reset any existing quiz state to clear the timer
      reset();

      // Then set the new subject and topic
      setSubjectAndTopic(decodedSubject, decodedTopic);
    }
  }, [location.search, setSubjectAndTopic, reset]);

  // Use a stable reference to the master subjects with their topics
  const subjectsMaster = useMemo(
    () => [
      {
        name: "English",
        topics: [
          "Comprehension",
          "Lexis and Structure",
          "Oral English",
          "Sentence Interpretation",
          "Figures of Speech",
        ],
      },
      {
        name: "Mathematics",
        topics: [
          "Number Bases",
          "Fractions, Decimals and Percentages",
          "Indices, Logarithms and Surds",
          "Sets",
          "Polynomials",
          "Variation",
          "Inequalities",
          "Progressions",
          "Binary Operations",
          "Matrices and Determinants",
          "Euclidean Geometry",
          "Mensuration",
          "Loci",
          "Coordinate Geometry",
          "Trigonometry",
          "Differentiation",
          "Integration",
          "Statistics",
          "Probability",
        ],
      },
      {
        name: "Physics",
        topics: [
          "Mechanics",
          "Thermal Physics",
          "Optics",
          "Electricity and Magnetism",
          "Waves",
          "Modern Physics",
        ],
      },
      {
        name: "Chemistry",
        topics: [
          "Rates of Chemical Reactions",
          "Industrial Chemistry",
          "Organic Chemistry",
          "Gases & Gas Laws",
          "Chemical Bonding",
          "Thermodynamics",
          "Inorganic Chemistry",
          "Redox Reactions",
          "States of Matter & Matter Properties",
          "Atomic Structure",
          "Acids, Bases, & Salts",
          "Electrolysis",
          "Water Chemistry",
          "Environmental Chemistry",
        ],
      },
      {
        name: "Biology",
        topics: [
          "Adaptation",
          "Cell Biology",
          "Genetics",
          "Ecology",
          "Evolution",
          "Circulatory System",
          "Plant Biology",
          "Public Health",
        ],
      },
      {
        name: "Economics",
        topics: [
          "Introduction to Economics (Scarcity & Choice)",
          "Demand and Supply (Elasticity & Equilibrium)",
          "Production Theory (PPF & Factors)",
          "Macroeconomics (National Income & Growth)",
          "Public Finance, Money & Banking",
          "Market Structures (Competition & Monopoly)",
          "International Trade & Organizations",
          "Agricultural Economics",
          "Statistics (Central Tendency & Variance)",
        ],
      },
      { name: "Government", topics: [] },
      { name: "Literature in English", topics: [] },
      { name: "History", topics: [] },
      { name: "Geography", topics: [] },
      { name: "CRS", topics: [] },
      { name: "IRS", topics: [] },
      { name: "Commerce", topics: [] },
    ],
    [],
  );

  const currentSubjectData = useMemo(() => {
    return subjectsMaster.find((s) => s.name === selectedSubject);
  }, [selectedSubject, subjectsMaster]);

  const availableTopics = useMemo(() => {
    if (currentSubjectData?.topics && currentSubjectData.topics.length > 0) {
      return currentSubjectData.topics.filter((t) => t !== "All");
    }
    return [];
  }, [currentSubjectData]);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Reorder Subjects based on selection ───────────────────
  const sortedQuizSubjects = useMemo(() => {
    if (!selectedSubject || selectedSubject === "All") return QUIZ_SUBJECTS;

    // Find the selected subject
    const selected = QUIZ_SUBJECTS.find((s) => s.name === selectedSubject);
    if (!selected) return QUIZ_SUBJECTS;

    // Filter out the selected one and put it at the start
    const remaining = QUIZ_SUBJECTS.filter((s) => s.name !== selectedSubject);
    return [selected, ...remaining];
  }, [selectedSubject]);

  const visibleSubjects = showAllSubjects
    ? sortedQuizSubjects
    : sortedQuizSubjects.slice(0, 6);

  // Sync results state with store
  useEffect(() => {
    if (isFinished) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [isFinished]);

  // Handle persistence reset on unmount if quiz is not active
  useEffect(() => {
    return () => {
      // If we are leaving the page and the quiz is finished, we should reset
      // so the next visit starts fresh.
      // But we don't reset if the user is in the middle of a quiz.
      const state = useQuizStore.getState();
      if (state.isFinished) {
        state.reset();
      }
    };
  }, []);

  /** Reset topic when subject changes, UNLESS coming from a URL param */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.get("topic")) {
      setSelectedTopic("All");
    }

    // Auto-scroll to topics if a subject is selected
    if (selectedSubject && selectedSubject !== "All") {
      setTimeout(() => {
        topicsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [selectedSubject, setSelectedTopic, location.search]);

  /** Clean up when leaving the page */
  useEffect(
    () => () => {
      // Removed reset() from here to allow session persistence on refresh.
      // Resetting is now handled by the user explicitly finishing or exiting the quiz.
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

    // For marathon mode: use all topics, all difficulty, 15 min duration, large question count
    const isMarathon = selectedMode === "marathon";
    const adjustedTopic = isMarathon ? "All" : selectedTopic;
    const adjustedDifficulty = isMarathon ? "All" : selectedDifficulty;
    const targetCount = isMarathon ? 100 : selectedMode === "quick" ? 10 : 20;

    // Wait a tiny bit for the loader to mount smoothly
    await new Promise((r) => setTimeout(r, 100));

    try {
      // ── CHECK NETWORK & CACHE ──────────────────────────────
      const isOnline = navigator.onLine;
      const offlineStore = useOfflineStore.getState();

      let qs: Question[] = [];

      // Try offline first if user is offline
      if (!isOnline) {
        console.log("📴 User is offline. Checking local cache...");
        const packs = offlineStore.downloadedPacks.filter((p) =>
          p.startsWith(selectedSubject.toLowerCase().slice(0, 3)),
        );
        if (packs.length > 0) {
          const offlineQs = await offlineStore.getOfflineQuestions(packs[0]);
          if (offlineQs.length > 0) {
            qs = offlineQs
              .sort(() => Math.random() - 0.5)
              .slice(0, targetCount);
            console.log("✅ Loaded questions from offline pack:", packs[0]);
          }
        }

        if (qs.length === 0) {
          throw new Error(
            "OFFLINE: You need an internet connection to load new questions, and no offline packs were found for this subject.",
          );
        }
      }

      // ── ONLINE FETCHING WITH ROBUST FALLBACK ──────────────────
      if (qs.length === 0) {
        try {
          if (adjustedTopic === "All") {
            // Get questions for the whole subject
            qs = await fetchQuestionsWithFallback(
              selectedSubject,
              "Random",
              targetCount,
              adjustedDifficulty,
            );
          } else {
            // 1. Try fetching from specific topic first
            qs = await fetchQuestionsByTopic(
              selectedSubject,
              adjustedTopic,
              targetCount,
              adjustedDifficulty,
            );

            // 2. Fallback: If not enough questions in topic, fill from general subject
            if (qs.length < targetCount) {
              console.log(
                `⚠️ Only found ${qs.length} questions for topic "${adjustedTopic}". Filling remaining ${targetCount - qs.length} from subject.`,
              );

              const remainingCount = targetCount - qs.length;
              const fallbackQs = await fetchQuestionsWithFallback(
                selectedSubject,
                "Random",
                remainingCount * 2, // Fetch more to ensure diversity
                adjustedDifficulty,
              );

              // Filter out duplicates
              const existingIds = new Set(qs.map((q) => q.id));
              const uniqueFallback = fallbackQs.filter(
                (q) => !existingIds.has(q.id),
              );

              qs = [...qs, ...uniqueFallback].slice(0, targetCount);
            }
          }
        } catch (err) {
          console.error("Fetch error:", err);
          throw new Error(
            "CONNECTION_ERROR: Failed to fetch questions. Please check your internet connection and try again.",
          );
        }
      }

      // Final check: if still empty or not enough, try one last broad sweep
      if (qs.length < targetCount) {
        const lastResort = await fetchQuestionsWithFallback(
          selectedSubject,
          "Random",
          targetCount * 2,
          "All", // Drop difficulty constraint for last resort
        );

        const existingIds = new Set(qs.map((q) => q.id));
        const uniqueLastResort = lastResort.filter(
          (q) => !existingIds.has(q.id),
        );
        qs = [...qs, ...uniqueLastResort].slice(0, targetCount);
      }

      if (qs.length === 0) {
        throw new Error(
          "NO_QUESTIONS: Could not find any questions for this selection. Try a different subject or year.",
        );
      }

      // Ensure we have EXACTLY targetCount if possible
      if (qs.length > targetCount) {
        qs = qs.slice(0, targetCount);
      }

      const duration = isMarathon
        ? 15 * 60
        : selectedMode === "quick"
          ? 10 * 60
          : 30 * 60;
      loadQuestions(qs, duration);
    } catch (error) {
      console.error("Failed to load quiz questions:", error);
      setLoadError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  /* ── Results ───────────────────────────────────────── */
  if (showResults || isFinished) {
    return (
      <AppLayout
        currentPage="quiz"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <ResultsScreen
          onRetry={() => {
            reset();
            handleStart();
          }}
          onHome={() => {
            reset();
            navigate("/");
          }}
        />
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
            className="bg-bgCard border-borderMuted text-textMain hover:border-danger/30 hover:text-danger touch-target no-double-tap flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>Exit Quiz</span>
          </button>

          {/* Progress indicator — use text for many questions, dots otherwise */}
          <div className="flex flex-1 items-center justify-center gap-1">
            {questions.length <= 30 ? (
              questions.map((_, i) => (
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
              ))
            ) : (
              // For many questions, use a simple percentage or step indicator
              <div className="flex items-center gap-2 text-textDim text-xs font-medium">
                <span>
                  {Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
            )}
          </div>

          <span className="text-textDim shrink-0 font-mono text-xs">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <TimerBar />
        <QuestionCard />

        {/* ── Exit Modal Overlay ── */}
        {showExitModal && (
          <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm dark:bg-black/80">
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
        {/* Network Error Alert */}
        {(loadError?.includes("CONNECTION_ERROR") ||
          loadError?.includes("OFFLINE")) && (
          <NetworkErrorAlert
            message={loadError}
            onRetry={() => {
              setLoadError(null);
              handleStart();
            }}
            onDismiss={() => setLoadError(null)}
          />
        )}

        {/* Error Message */}
        {loadError &&
          !loadError.includes("CONNECTION_ERROR") &&
          !loadError.includes("OFFLINE") && (
            <div className="animate-in fade-in slide-in-from-top-4 bg-danger/15 border-danger/30 text-danger dark:bg-danger/10 mb-6 rounded-2xl border p-5 shadow-sm duration-300">
              <div className="flex items-start gap-3">
                <div className="bg-danger/20 text-danger flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-danger text-sm font-black tracking-tight">
                    System Alert
                  </p>
                  <p className="text-danger/90 mt-1 text-xs leading-relaxed font-medium">
                    {loadError}
                  </p>
                  <button
                    onClick={() => setLoadError(null)}
                    className="bg-danger/10 hover:bg-danger/20 text-danger mt-3 rounded-lg px-3 py-1.5 text-[10px] font-black tracking-widest uppercase transition-colors"
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
            {selectedMode === "quick" &&
              "10 adaptive questions · 60 seconds each · Instant explanations"}
            {selectedMode === "standard" &&
              "20 adaptive questions · 90 seconds each · Instant explanations"}
            {selectedMode === "marathon" &&
              "Unlimited adaptive questions · 15 minutes total · Instant explanations"}
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
            {sortedQuizSubjects.map((s) => (
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
                    : "bg-bgCard border-borderMuted hover:border-brand/30 dark:hover:border-brand/40 dark:hover:bg-bgSurface hover:shadow-sm"
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

        {/* Topic filter - Only if subject is selected and not marathon mode */}
        {selectedSubject !== "All" && selectedMode !== "marathon" && (
          <div
            ref={topicsRef}
            className="animate-in fade-in slide-in-from-bottom-4 mb-10 duration-500"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-textDim flex items-center gap-2 text-[11px] font-black tracking-widest uppercase">
                <Layers size={14} className="text-brand" />
                2. Choose Topic
              </p>
              <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-[10px] font-bold">
                {availableTopics.length + 1} Topics Found
              </span>
            </div>

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
                        selectedTopic === "All" ? "text-brand" : "text-textMain"
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
          </div>
        )}

        {/* 3. Select Difficulty */}
        {selectedSubject !== "All" && selectedMode !== "marathon" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 mb-10 duration-700">
            <p className="text-textDim mb-4 flex items-center gap-2 text-[11px] font-black tracking-widest uppercase">
              <Sparkles size={14} className="text-brand" />
              3. Select Difficulty
            </p>
            <div className="grid grid-cols-4 gap-2">
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() =>
                    setSelectedDifficulty(
                      d as "All" | "Easy" | "Medium" | "Hard",
                    )
                  }
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
              id: "quick",
              icon: "⚡",
              label: "Quick Fire",
              desc: "10 Qs · 60s each",
            },
            {
              id: "standard",
              icon: "🎯",
              label: "Standard",
              desc: "20 Qs · 90s each",
            },
            {
              id: "marathon",
              icon: "🏃",
              label: "Marathon Quiz",
              desc: "15 mins · Unlimited Qs",
            },
          ].map((mode) => (
            <div
              key={mode.id}
              onClick={() =>
                setSelectedMode(mode.id as "quick" | "standard" | "marathon")
              }
              className={`rounded-brand-lg cursor-pointer border p-4 transition-all ${
                selectedMode === mode.id
                  ? "bg-brand/10 border-brand shadow-brand/10 ring-brand/20 ring-1"
                  : "bg-bgSurface border-borderMuted hover:border-brand/20 dark:hover:border-white/15"
              }`}
            >
              <div className="mb-2 text-2xl">{mode.icon}</div>
              <p className="font-display text-sm font-semibold tracking-tight">
                {mode.label}
              </p>
              <p className="text-textDim mt-0.5 text-[11px]">{mode.desc}</p>
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
