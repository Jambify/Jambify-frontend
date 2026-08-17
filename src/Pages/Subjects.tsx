import React, { useState, useEffect } from "react";
import PageHelmet from "../components/SEO/PageHelmet";
import AppLayout from "../components/Layout/AppLayout";
import { useSubjectStore } from "../Store/useSubjectStore";
import SubjectCard from "../components/Subjects/SubjectCard";
import PageLoader from "../components/ui/PageLoader";
import { usePerformanceStore } from "../Store/usePerformanceStore";
import { useUserStore } from "../Store/useUserStore";
import { SUBJECT_COMBO_MAP } from "../Store/useSubjectStore";
import { computeBestWorstSubjects } from "../lib/subjectInsights";
import { RefreshCw, AlertCircle } from "lucide-react";

type SortKey = "name" | "accuracy" | "progress";

const Subjects: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const {
    subjects,
    isLoading,
    loadSubjects,
    isInitialized,
    hasFetched,
    error,
  } = useSubjectStore();
  const {} = usePerformanceStore();
  const { subjectCombo, name } = useUserStore();
  const [sort, setSort] = useState<SortKey>("accuracy");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      loadSubjects();
    }
  }, [loadSubjects, isInitialized]);

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await loadSubjects(true);
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setTimeout(() => {
        setIsManualRefreshing(false);
      }, 600);
    }
  };

  // Check if we have any existing subject data
  const hasData = hasFetched && subjects.length > 0;

  // Filter stats based on user subject combo
  const userSubjects = Array.isArray(subjectCombo)
    ? subjectCombo
    : subjectCombo
      ? SUBJECT_COMBO_MAP[subjectCombo] || []
      : [];

  // Use shared subject insights utility logic
  const { best: bestSubject, worst: worstSubject } = computeBestWorstSubjects(
    subjects,
    userSubjects,
  );

  // Determine best and worst subject names for badges
  const bestSubjectName =
    bestSubject.type === "subject" ? bestSubject.subject : null;

  const worstSubjectName =
    worstSubject.type === "weak_topic" || worstSubject.type === "low_accuracy"
      ? worstSubject.subject
      : null;

  const sorted = [...subjects].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "accuracy") return a.accuracy - b.accuracy;
    if (sort === "progress") return b.completed - a.completed;
    return 0;
  });

  const overallAccuracy =
    subjects.length > 0
      ? Math.round(
          subjects.reduce((s, sub) => s + sub.accuracy, 0) / subjects.length,
        )
      : 0;

  // Show full-page loader only on initial load (no data yet)
  if (isLoading && !hasFetched) {
    return (
      <AppLayout
        currentPage="subjects"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <PageLoader message="Curating your subjects..." />
      </AppLayout>
    );
  }

  // Show full-page error only if error AND no data
  if (error && !hasData) {
    return (
      <AppLayout
        currentPage="subjects"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <div className="mx-auto flex max-w-350 flex-col items-center justify-center gap-6 px-2 py-20 lg:px-4">
          <div className="bg-danger/10 flex h-20 w-20 items-center justify-center rounded-3xl">
            <AlertCircle className="text-danger h-10 w-10" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="font-display text-textMain text-2xl font-bold">
              We couldn't load your subjects right now
            </h2>
            <p className="text-textDim mx-auto max-w-sm text-sm">
              Please check your internet connection and try again
            </p>
          </div>
          <button
            onClick={handleManualRefresh}
            className="bg-brand hover:bg-brand-light flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white transition-all active:scale-95"
          >
            <RefreshCw
              size={16}
              className={isManualRefreshing ? "animate-spin" : ""}
            />
            {isManualRefreshing ? "Loading..." : "Try Again"}
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      currentPage="subjects"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <PageHelmet
        title="Subjects | SCHOOLDRA"
        description="View and manage the subjects tailored to your JAMB prep, with accuracy stats and insights to guide your study."
        canonical="https://www.schooldra.com/subjects"
      />
      {/* Sleek background sync progress loader indicator line */}
      {isLoading && (
        <div className="bg-bgCard fixed top-0 left-0 z-50 h-0.5 w-full overflow-hidden">
          <div className="bg-brand h-full w-1/3 animate-[loading-bar_1.5s_ease-in-out_infinite]" />
        </div>
      )}
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      <div className="animate-fadeIn mx-auto max-w-350 space-y-6">
        {/* Warning Banner */}
        {error && hasData && (
          <div className="bg-warning/10 border-warning/30 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-warning h-5 w-5 shrink-0" />
              <div>
                <p className="text-textMain text-sm font-semibold">
                  Unable to refresh your latest subject data
                </p>
                <p className="text-textDim mt-0.5 text-xs">
                  Showing your most recent saved results
                </p>
              </div>
            </div>
            <button
              onClick={handleManualRefresh}
              className="bg-warning hover:bg-warning/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition-all active:scale-95 sm:w-auto"
            >
              <RefreshCw
                size={14}
                className={isManualRefreshing ? "animate-spin" : ""}
              />
              {isManualRefreshing ? "Retrying..." : "Retry"}
            </button>
          </div>
        )}

        {/* Header Section — title left, controls stack cleanly on the right on desktop */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-textMain text-2xl font-bold tracking-tight lg:text-3xl">
              {name ? `${name.split(" ")[0]}'s Subjects` : "Your Subjects"}
            </h1>
            <p className="text-textDim mt-1 text-sm">
              {subjects.length} subjects · overall accuracy:{" "}
              <span className="text-textMain font-medium">
                {overallAccuracy}%
              </span>
            </p>
          </div>

          {/* Controls — two clear rows instead of one crammed line */}
          <div className="flex flex-col gap-3">
            {/* Row 1: Refresh button + Sync status */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleManualRefresh}
                disabled={isManualRefreshing}
                className="text-textDim hover:text-brand bg-bgCard border-borderMuted hover:border-brand/30 group flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all active:scale-95 disabled:opacity-75"
              >
                <RefreshCw
                  size={16}
                  className={`transition-transform ${isManualRefreshing ? "animate-spin" : "group-hover:rotate-45"}`}
                />
                {isManualRefreshing ? "Refreshing..." : "Refresh Data"}
              </button>
              <div className="text-textDim bg-bgCard border-borderMuted flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm">
                <span
                  className={`h-2 w-2 rounded-full ${error ? "bg-warning" : "bg-success animate-pulse"}`}
                />
                {error
                  ? "Showing cached data"
                  : isLoading
                    ? "SYNCING..."
                    : "LIVE DATA SYNCED"}
              </div>
            </div>

            {/* Row 2: Sort controls */}
            <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
              <span className="text-textDim text-[11px] whitespace-nowrap">
                Sort:
              </span>
              {(
                [
                  ["accuracy", "Weakest first"],
                  ["progress", "Most done"],
                  ["name", "A–Z"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all ${
                    sort === key
                      ? "bg-brand border-brand text-white"
                      : "bg-bgSurface border-borderMuted text-textMuted hover:text-textMain hover:border-white/15"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-textMuted text-xs">
              Overall mastery across all subjects
            </span>
            <span className="text-brand-light font-mono text-sm font-semibold">
              {overallAccuracy}%
            </span>
          </div>
          <div className="bg-bgSurface h-2 overflow-hidden rounded-full">
            <div
              className="bg-brand h-full rounded-full transition-all duration-700"
              style={{ width: `${overallAccuracy}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {subjects.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <span className="text-sm">{s.icon}</span>
                <span
                  className="font-mono text-[11px] font-medium"
                  style={{ color: s.color }}
                >
                  {s.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Grid — 2 columns */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sorted.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              isExpanded={expandedId === subject.id}
              isBest={subject.name === bestSubjectName}
              isWorst={subject.name === worstSubjectName}
              onToggle={() =>
                setExpandedId((prev) =>
                  prev === subject.id ? null : subject.id,
                )
              }
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Subjects;
