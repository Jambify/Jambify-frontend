// src/Pages/Subjects.tsx (Updated version)

import React, { useState, useEffect } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { useSubjectStore } from "../Store/useSubjectStore";
import SubjectCard from "../components/Subjects/SubjectCard";
import PageLoader from "../components/ui/PageLoader";
import { usePerformanceStore } from "../Store/usePerformanceStore";

type SortKey = "name" | "accuracy" | "progress";

const Subjects: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { subjects, isLoading, loadSubjects, isInitialized } =
    useSubjectStore();
  const { topicStats, subjectPerformance } = usePerformanceStore();
  const [sort, setSort] = useState<SortKey>("accuracy");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      loadSubjects();
    }
  }, [loadSubjects, isInitialized]);

  // Check if user has any performance data
  const hasAnyPerformanceData =
    (usePerformanceStore.getState().totalQuestions || 0) > 0 ||
    topicStats.length > 0 ||
    subjectPerformance.some((sp) => sp.best_score > 0 || sp.worst_score > 0);

  // Determine best and worst subjects for badges (only if user has data)
  const bestSubjectName = hasAnyPerformanceData
    ? (() => {
        // Only consider subjects with accuracy > 0
        const eligible = subjects.filter((s) => s.accuracy > 0);
        if (eligible.length === 0) return null;
        // Sort subjects by current accuracy descending
        const sorted = [...eligible].sort((a, b) => b.accuracy - a.accuracy);
        return sorted[0]?.name || null;
      })()
    : null;

  const worstSubjectName = hasAnyPerformanceData
    ? (() => {
        // Only consider subjects with accuracy > 0
        const eligible = subjects.filter((s) => s.accuracy > 0);
        if (eligible.length === 0) return null;
        // Sort subjects by current accuracy ascending
        const sorted = [...eligible].sort((a, b) => a.accuracy - b.accuracy);
        const worst = sorted[0]?.name || null;
        // Don't show worst if it's the same as best
        if (worst === bestSubjectName) return null;
        return worst;
      })()
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

  if (isLoading) {
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

  return (
    <AppLayout
      currentPage="subjects"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Subjects
          </h2>
          <p className="text-textMuted mt-1 text-sm">
            {subjects.length} subjects · overall accuracy:  
            <span className="text-textMain font-medium">
              {overallAccuracy}%
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-textDim text-[11px]">Sort:</span>
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
              className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${
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

      <div className="bg-bgCard border-borderMuted rounded-brand-lg mb-6 border p-4">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sorted.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            isExpanded={expandedId === subject.id}
            isBest={subject.name === bestSubjectName}
            isWorst={subject.name === worstSubjectName}
            onToggle={() =>
              setExpandedId((prev) => (prev === subject.id ? null : subject.id))
            }
          />
        ))}
      </div>
    </AppLayout>
  );
};

export default Subjects;
