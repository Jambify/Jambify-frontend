import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { useUserStore } from "../../Store/useUserStore";
import {
  useSubjectStore,
  SUBJECT_COMBO_MAP,
} from "../../Store/useSubjectStore";
import {
  BookOpen,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  BarChart3,
  Landmark,
  Church,
  Moon,
  Briefcase,
} from "lucide-react";

const getSubjectIcon = (subject: string) => {
  const icons: Record<string, React.ElementType> = {
    English: BookOpen,
    Mathematics: Calculator,
    Physics: Zap,
    Chemistry: FlaskConical,
    Biology: Dna,
    Economics: BarChart3,
    Government: Landmark,
    "Literature in English": BookOpen,
    CRS: Church,
    IRS: Moon,
    Commerce: Briefcase,
  };
  const Icon = icons[subject] || BookOpen;
  return <Icon size={20} />;
};

const LOADING_MESSAGES = [
  "Fetching your subject progress...",
  "Still loading... Checking performance history.",
  "Almost there! Wrapping up your statistics.",
];

const SubjectProgress: React.FC = () => {
  const navigate = useNavigate();
  const {
    topicStats,
    isLoading,
    mockHistory,
    hasFetched,
    loadPerformanceData,
  } = usePerformanceStore();
  const { subjectCombo } = useUserStore();
  const { subjects } = useSubjectStore();

  const [loadingStep, setLoadingStep] = useState(0);
  const [isTimeoutError, setIsTimeoutError] = useState(false);

  const isWaiting = isLoading || !hasFetched;

  useEffect(() => {
    let messageTimer: ReturnType<typeof setInterval>;
    let errorTimer: ReturnType<typeof setTimeout>;

    if (isWaiting) {
      setIsTimeoutError(false);
      setLoadingStep(0);

      messageTimer = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < LOADING_MESSAGES.length - 1) return prev + 1;
          clearInterval(messageTimer);
          return prev;
        });
      }, 4000);

      errorTimer = setTimeout(() => {
        setIsTimeoutError(true);
        clearInterval(messageTimer);
      }, 15000);
    }

    return () => {
      clearInterval(messageTimer);
      clearTimeout(errorTimer);
    };
  }, [isWaiting]);

  const handleRetry = () => {
    setIsTimeoutError(false);
    setLoadingStep(0);
    loadPerformanceData(true);
  };

  const userSubjects = Array.isArray(subjectCombo)
    ? subjectCombo
    : subjectCombo
      ? SUBJECT_COMBO_MAP[subjectCombo] || [subjectCombo]
      : [];

  const comboWeakestTopics = topicStats.filter(
    (t) =>
      userSubjects.some((s) => s.toLowerCase() === t.subject.toLowerCase()) &&
      t.accuracy < 50,
  );

  const hasActivity = mockHistory.length > 0 || topicStats.length > 0;

  // ── 1. Timeout error (shown after 15s of waiting) ─────────────────────────
  if (isWaiting && isTimeoutError) {
    return (
      <div className="bg-bgCard border-borderMuted rounded-brand-xl flex h-full flex-col items-center justify-center border p-6 text-center">
        <div className="bg-danger/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <AlertTriangle className="text-danger h-6 w-6" />
        </div>
        <h3 className="font-display text-textMain mb-2 font-bold">
          Slow Network Detected
        </h3>
        <p className="text-textDim mb-6 max-w-60 text-sm">
          Your connection seems weak. Taking longer than usual to load your
          progress.
        </p>
        <button
          onClick={handleRetry}
          className="bg-brand hover:bg-brand-light flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold text-white transition-all active:scale-95"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  // ── 2. Loading spinner (while fetch is in progress OR not yet completed) ───
  if (isWaiting) {
    return (
      <div className="bg-bgCard border-borderMuted rounded-brand-xl flex h-full flex-col items-center justify-center border p-6 text-center">
        <div className="border-brand mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-textDim max-w-60 text-sm transition-all duration-300">
          {LOADING_MESSAGES[loadingStep]}
        </p>
      </div>
    );
  }

  // ── 3. No activity (only shown after fetch confirmed complete) ─────────────
  if (!hasActivity) {
    return (
      <div className="bg-bgCard border-borderMuted rounded-brand-xl flex h-full flex-col items-center justify-center border p-6 text-center">
        <div className="bg-brand/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <BookOpen className="text-brand h-6 w-6" />
        </div>
        <h3 className="font-display text-textMain mb-2 font-bold">
          No Exam Taken Yet
        </h3>
        <p className="text-textDim mb-6 max-w-60 text-sm">
          Take your first mock exam to unlock your personalized progress
          tracking.
        </p>
        <button
          onClick={() => navigate("/mock-exams")}
          className="bg-brand hover:bg-brand-light rounded-full px-6 py-2 text-sm font-bold text-white transition-all active:scale-95"
        >
          Take Mock Exam
        </button>
      </div>
    );
  }

  // ── 4. All topics mastered ─────────────────────────────────────────────────
  if (comboWeakestTopics.length === 0) {
    return (
      <div className="bg-bgCard border-borderMuted rounded-brand-xl flex h-full flex-col items-center justify-center border p-6 text-center">
        <div className="bg-success/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <CheckCircle className="text-success h-6 w-6" />
        </div>
        <h3 className="font-display text-textMain mb-2 font-bold">
          All Topics Mastered!
        </h3>
        <p className="text-textDim mb-6 max-w-60 text-sm">
          You've reached over 50% accuracy in all your topics. Ready for the
          exam!
        </p>
        <button
          onClick={() => navigate("/mock-exams")}
          className="bg-success hover:bg-success-light rounded-full px-6 py-2 text-sm font-bold text-white transition-all active:scale-95"
        >
          Final Mock Exam
        </button>
      </div>
    );
  }

  // ── 5. Weakest topics list ─────────────────────────────────────────────────
  return (
    <div className="bg-bgCard border-borderMuted rounded-brand-xl flex h-full flex-col border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-display text-textMain font-bold">
            Weakest Topics
          </h3>
          <p className="text-textDim text-[11px] font-medium">
            One critical area from each of your subjects
          </p>
        </div>
        <button
          onClick={() => navigate("/performance")}
          className="text-brand hover:text-brand-light group flex items-center gap-1 text-xs font-bold"
        >
          View all{" "}
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <div className="custom-scrollbar space-y-3 overflow-y-auto pr-1">
        {comboWeakestTopics.map((item, index) => {
          const subjectData = subjects.find((s) => s.name === item.subject);
          const progressColor =
            item.accuracy < 30 ? "var(--color-danger)" : "var(--color-warn)";

          return (
            <div
              key={`${item.subject}-${item.name}-${index}`}
              className="group cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() =>
                navigate(
                  `/quiz?subject=${encodeURIComponent(item.subject)}&topic=${encodeURIComponent(item.name)}`,
                )
              }
            >
              <div className="bg-bgSurface border-borderMuted hover:border-brand/30 rounded-brand-lg flex items-center gap-3 border p-4 transition-all">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                  style={{
                    background: `color-mix(in srgb, ${subjectData?.color || "var(--color-brand)"} 20%, transparent)`,
                  }}
                >
                  {getSubjectIcon(item.subject)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-textMain group-hover:text-brand truncate text-sm font-bold transition-colors">
                    {item.name}
                  </p>
                  <p className="text-textDim text-[11px] font-medium">
                    {item.subject}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-textMain text-xs font-bold">
                      {Math.round(item.accuracy)}%
                    </span>
                    {item.accuracy < 30 ? (
                      <AlertTriangle size={12} className="text-danger" />
                    ) : (
                      <Sparkles size={12} className="text-warn" />
                    )}
                  </div>
                  <div className="bg-bgTrack h-1.5 w-20 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.accuracy}%`,
                        background: progressColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectProgress;
