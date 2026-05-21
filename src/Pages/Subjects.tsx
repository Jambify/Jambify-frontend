// src/Pages/Subjects.tsx (Updated version)

import React, { useState, useEffect } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useSubjectStore } from '../Store/useSubjectStore';
import SubjectCard from '../components/Subjects/SubjectCard';

type SortKey = 'name' | 'accuracy' | 'progress';

const Subjects: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { subjects, isLoading, loadSubjects } = useSubjectStore();
  const [sort, setSort] = useState<SortKey>('accuracy');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const sorted = [...subjects].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'accuracy') return a.accuracy - b.accuracy;
    if (sort === 'progress') return b.completed - a.completed;
    return 0;
  });

  const overallAccuracy = subjects.length > 0
    ? Math.round(subjects.reduce((s, sub) => s + sub.accuracy, 0) / subjects.length)
    : 0;

  if (isLoading) {
    return (
      <AppLayout currentPage="subjects" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        <div className="flex items-center justify-center h-64">
          <div className="text-textMain text-center">
            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading subjects...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="subjects" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Subjects</h2>
          <p className="text-sm text-textMuted mt-1">
            {subjects.length} subjects · overall accuracy 
            <span className="text-textMain font-medium">{overallAccuracy}%</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-textDim">Sort:</span>
          {([
            ['accuracy', 'Weakest first'],
            ['progress', 'Most done'],
            ['name', 'A–Z'],
          ] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                sort === key
                  ? 'bg-brand border-brand text-white'
                  : 'bg-bgSurface border-borderMuted text-textMuted hover:text-textMain hover:border-white/15'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-textMuted">Overall mastery across all subjects</span>
          <span className="font-mono text-sm font-semibold text-brand-light">{overallAccuracy}%</span>
        </div>
        <div className="h-2 bg-bgSurface rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-brand transition-all duration-700"
            style={{ width: `${overallAccuracy}%` }}
          />
        </div>
        <div className="flex gap-3 mt-3 flex-wrap">
          {subjects.map(s => (
            <div key={s.id} className="flex items-center gap-1.5">
              <span className="text-sm">{s.icon}</span>
              <span
                className="text-[11px] font-mono font-medium"
                style={{ color: s.color }}
              >
                {s.accuracy}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sorted.map(subject => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            isExpanded={expandedId === subject.id}
            onToggle={() => setExpandedId(prev => prev === subject.id ? null : subject.id)}
          />
        ))}
      </div>
    </AppLayout>
  );
};

export default Subjects;