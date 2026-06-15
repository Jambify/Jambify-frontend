// src/Pages/Subjects.tsx (Updated version)

import React, { useState, useEffect } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { useSubjectStore } from "../Store/useSubjectStore";
import SubjectCard from "../components/Subjects/SubjectCard";
import PageLoader from "../components/ui/PageLoader";
import { usePerformanceStore } from "../Store/usePerformanceStore";
import { useUserStore } from "../Store/useUserStore";
import { SUBJECT_COMBO_MAP } from "../Store/useSubjectStore";

type SortKey = "name" | "accuracy" | "progress";

// Type definitions for our structured best/worst subject objects (same as in Performance.tsx)
type BestSubjectResult =
  | { type: "subject"; subject: string; best_score: number }
  | { type: "no_data" }
  | { type: "no_subjects" };

type WorstSubjectResult =
  | {
      type: "weak_topic" | "low_accuracy" | "subject";
      subject: string;
      worst_score: number;
    }
  | { type: "all_good" }
  | { type: "no_data" }
  | { type: "no_subjects" };

const Subjects: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { subjects, isLoading, loadSubjects, isInitialized } =
    useSubjectStore();
  const {} = usePerformanceStore();
  const { subjectCombo } = useUserStore();
  const [sort, setSort] = useState<SortKey>("accuracy");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      loadSubjects();
    }
  }, [loadSubjects, isInitialized]);

  // Filter stats based on user subject combo (same as in Performance.tsx)
  const userSubjects = Array.isArray(subjectCombo)
    ? subjectCombo
    : subjectCombo
      ? SUBJECT_COMBO_MAP[subjectCombo] || []
      : [];

  // Best and Worst Subject logic with proper prioritization! (same as Performance.tsx)
  const bestSubject = ((): BestSubjectResult => {
    if (userSubjects.length === 0) {
      return { type: "no_subjects" };
    }

    // First priority: subjects with accuracy > 0
    const eligibleSubjects = subjects.filter((s) => s.accuracy > 0);
    if (eligibleSubjects.length > 0) {
      const sorted = [...eligibleSubjects].sort(
        (a, b) => b.accuracy - a.accuracy,
      );
      const sub = sorted[0];
      if (sub) {
        return { type: "subject", subject: sub.name, best_score: sub.accuracy };
      }
    }

    // If no performance data yet
    return { type: "no_data" };
  })();

  const worstSubject = ((): WorstSubjectResult => {
    if (userSubjects.length === 0) {
      return { type: "no_subjects" };
    }

    // 1. First priority: Any subject with a weak topic
    const subjectsWithWeakTopics = subjects.filter(
      (s) => s.weakTopics && s.weakTopics.length > 0,
    );
    if (subjectsWithWeakTopics.length > 0) {
      // Among these, pick the one with lowest accuracy
      const sorted = [...subjectsWithWeakTopics].sort(
        (a, b) => a.accuracy - b.accuracy,
      );
      const sub = sorted[0];
      if (sub) {
        return {
          type: "weak_topic",
          subject: sub.name,
          worst_score: sub.accuracy,
        };
      }
    }

    // 2. Second priority: Subjects with accuracy < 50% (and attempted)
    const lowAccuracySubjects = subjects.filter(
      (s) => s.accuracy > 0 && s.accuracy < 50,
    );
    if (lowAccuracySubjects.length > 0) {
      const sorted = [...lowAccuracySubjects].sort(
        (a, b) => a.accuracy - b.accuracy,
      );
      const sub = sorted[0];
      if (sub) {
        return {
          type: "low_accuracy",
          subject: sub.name,
          worst_score: sub.accuracy,
        };
      }
    }

    // 3. Third priority: Any attempted subject (accuracy > 0)
    const attemptedSubjects = subjects.filter((s) => s.accuracy > 0);
    if (attemptedSubjects.length > 0) {
      const sorted = [...attemptedSubjects].sort(
        (a, b) => a.accuracy - b.accuracy,
      );
      const sub = sorted[0];
      if (sub) {
        // Check if it's same as best subject
        if (
          bestSubject.type === "subject" &&
          sub.name === bestSubject.subject
        ) {
          // If only one subject, show "You're doing great!" instead
          if (attemptedSubjects.length === 1) {
            return { type: "all_good" };
          }
          // Otherwise pick next one
          const nextSub = sorted[1];
          if (nextSub) {
            return {
              type: "subject",
              subject: nextSub.name,
              worst_score: nextSub.accuracy,
            };
          }
        }

        return {
          type: "subject",
          subject: sub.name,
          worst_score: sub.accuracy,
        };
      }
    }

    // 4. If no attempted subjects yet
    return { type: "no_data" };
  })();

  // Determine best and worst subject names for badges
  const bestSubjectName =
    bestSubject.type === "subject" ? bestSubject.subject : null;
  const worstSubjectName =
    worstSubject.type === "weak_topic" ||
    worstSubject.type === "low_accuracy" ||
    worstSubject.type === "subject"
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
