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
import {
  Loader2,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

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
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const visibleSubjects = showAllSubjects
    ? QUIZ_SUBJECTS
    : QUIZ_SUBJECTS.slice(0, 6);
  const {
    questions,
    currentIndex,
    isFinished,
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

  const handleStart = async () => {
    if (selectedSubject === "All") return;

    setShowExitModal(false);
    setIsLoadingQuestions(true);

    try {
      let qs: any[] = [];
      if (selectedTopic === "All") {
        // Get questions for the whole subject (Random years fallback)
        qs = await fetchQuestionsWithFallback(
          selectedSubject,
          "Random",
          10,
          selectedDifficulty,
        );
      } else {
        // Get questions for the specific topic
        qs = await fetchQuestionsByTopic(
          selectedSubject,
          selectedTopic,
          10,
          selectedDifficulty,
        );
      }

      if (qs.length === 0) {
        // Fallback to general questions if topic returns nothing
        qs = await fetchQuestionsWithFallback(
          selectedSubject,
          "Random",
          10,
          selectedDifficulty,
        );
      }

      loadQuestions(qs);
    } catch (error) {
      console.error("Failed to load quiz questions:", error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  /* ── Results ───────────────────────────────────────── */
  if (isFinished) {
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
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowExitModal(true)} // Trigger Modal
            className="flex items-center gap-1.5 text-xs text-textMuted hover:text-textMain transition-colors shrink-0 touch-target no-double-tap active:scale-95"
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
                        : "var(--borderMuted)",
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
            <div className="bg-bgCard border border-borderMuted p-6 rounded-brand-xl max-w-sm w-full shadow-2xl animate-slideDown">
              <h3 className="font-display text-xl font-bold text-textMain mb-2">
                Quit Quiz?
              </h3>
              <p className="text-textMuted text-sm mb-6">
                Your progress will be lost. Are you sure you want to exit the
                current session?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-3 rounded-brand font-medium bg-bgSurface hover:bg-bgDeep text-textMain transition-colors touch-target no-double-tap active:scale-95"
                >
                  Stay
                </button>
                <button
                  onClick={reset}
                  className="flex-1 py-3 rounded-brand font-medium bg-danger text-white hover:bg-danger/80 transition-colors touch-target no-double-tap active:scale-95"
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

        {/* Subject filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] uppercase tracking-widest text-textDim font-black flex items-center gap-2">
              <BookOpen size={14} className="text-brand" />
              1. Select Subject
            </p>
            <button
              onClick={() => setShowAllSubjects(!showAllSubjects)}
              className="text-[10px] font-black uppercase tracking-widest text-brand hover:text-brand-light transition-colors"
            >
              {showAllSubjects ? "Show Less" : "Show All"}
            </button>
          </div>

          {/* 📱 Mobile Scrollable List */}
          <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {QUIZ_SUBJECTS.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSubject(s.name)}
                className={`flex-shrink-0 px-5 py-3 rounded-xl border transition-all active:scale-95 text-xs font-bold flex items-center gap-2 ${
                  selectedSubject === s.name
                    ? "bg-brand text-white border-brand shadow-lg shadow-brand/20"
                    : "bg-bgCard text-textMain border-borderMuted hover:border-brand/40"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          {/* 💻 Desktop Grid */}
          <div className="hidden sm:grid grid-cols-3 gap-3">
            {visibleSubjects.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSubject(s.name)}
                className={`group relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 ${
                  selectedSubject === s.name
                    ? "bg-brand border-brand shadow-xl shadow-brand/20 -translate-y-1"
                    : "bg-bgCard border-borderMuted hover:border-brand/40 hover:bg-bgSurface"
                }`}
              >
                {/* Background Gradient on Select */}
                {selectedSubject === s.name && (
                  <div
                    className={`absolute inset-0 opacity-20 bg-gradient-to-br ${s.color}`}
                  />
                )}

                <span
                  className={`text-3xl mb-2 transition-transform duration-300 group-hover:scale-110 ${selectedSubject === s.name ? "scale-110" : ""}`}
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
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] uppercase tracking-widest text-textDim font-black flex items-center gap-2">
                <Layers size={14} className="text-brand" />
                2. Choose Topic
              </p>
              {availableTopics.length > 0 && (
                <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-bold">
                  {availableTopics.length} Topics Found
                </span>
              )}
            </div>

            {isLoadingTopics ? (
              <div className="flex flex-col items-center justify-center p-12 bg-bgSurface/30 rounded-2xl border border-dashed border-borderMuted">
                <Loader2 className="w-6 h-6 text-brand animate-spin mb-2" />
                <p className="text-[10px] text-textDim uppercase tracking-tighter">
                  Fetching Topics...
                </p>
              </div>
            ) : availableTopics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={() => setSelectedTopic("All")}
                  className={`relative overflow-hidden px-4 py-4 rounded-xl border text-xs font-bold text-left transition-all ${
                    selectedTopic === "All"
                      ? "bg-brand/10 border-brand text-brand ring-1 ring-brand/30"
                      : "bg-bgSurface text-textDim border-borderMuted hover:border-brand/30 hover:bg-bgCard"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${selectedTopic === "All" ? "bg-brand text-white" : "bg-bgDeep text-textDim"}`}
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
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  )}
                </button>

                {availableTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`relative overflow-hidden px-4 py-4 rounded-xl border text-xs font-bold text-left transition-all ${
                      selectedTopic === topic
                        ? "bg-brand/10 border-brand text-brand ring-1 ring-brand/30"
                        : "bg-bgSurface text-textDim border-borderMuted hover:border-brand/30 hover:bg-bgCard"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${selectedTopic === topic ? "bg-brand text-white" : "bg-bgDeep text-textDim"}`}
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
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-bgSurface/30 rounded-2xl border border-dashed border-borderMuted">
                <div className="w-12 h-12 bg-bgDeep rounded-full flex items-center justify-center mx-auto mb-3">
                  <Layers size={20} className="text-textDim" />
                </div>
                <p className="text-sm text-textMain font-bold mb-1">
                  No Topics Found
                </p>
                <p className="text-xs text-textDim">
                  We're still updating the database for {selectedSubject}. You
                  can play in "General" mode!
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. Select Difficulty */}
        {selectedSubject !== "All" && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-[11px] uppercase tracking-widest text-textDim font-black mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-brand" />
              3. Select Difficulty
            </p>
            <div className="grid grid-cols-4 gap-2">
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d as any)}
                  className={`py-3 rounded-xl border text-[11px] font-bold transition-all active:scale-95 ${
                    selectedDifficulty === d
                      ? d === "Easy"
                        ? "bg-success/10 border-success text-success"
                        : d === "Medium"
                          ? "bg-warn/10 border-warn text-warn"
                          : d === "Hard"
                            ? "bg-danger/10 border-danger text-danger"
                            : "bg-brand/10 border-brand text-brand"
                      : "bg-bgCard border-borderMuted text-textDim hover:border-white/20"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

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
          disabled={isLoadingQuestions}
          className="py-5 text-lg font-black shadow-xl shadow-brand/20 group relative overflow-hidden"
        >
          {isLoadingQuestions ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            <>
              <span className="relative z-10">Start Practice Quiz</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </>
          )}
        </Button>
      </div>
    </AppLayout>
  );
};

export default Quiz;
