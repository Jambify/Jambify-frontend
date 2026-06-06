// src/components/MockExam/SubjectSidebar.tsx

import React from "react";
import { useMockStore } from "../../Store/useMockStore";
import { cn } from "../../lib/utils/utils";
import { CheckCircle } from "lucide-react";

interface SubjectSidebarProps {
  activeSubject: string;
  onSubjectChange: (subject: string) => void;
  className?: string;
}

const SubjectSidebar: React.FC<SubjectSidebarProps> = ({
  activeSubject,
  onSubjectChange,
  className,
}) => {
  const { questions, answers } = useMockStore();

  const subjects = Array.from(new Set(questions.map((q) => q.subject)));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {subjects.map((subject) => {
        const isActive = activeSubject === subject;
        const subjectQuestions = questions.filter((q) => q.subject === subject);
        const answeredInSubject = subjectQuestions.filter((q) => {
          const globalIdx = questions.indexOf(q);
          return answers[globalIdx] !== undefined;
        }).length;

        const progress = (answeredInSubject / subjectQuestions.length) * 100;

        return (
          <button
            key={subject}
            onClick={() => onSubjectChange(subject)}
            className={cn(
              "group relative flex flex-col items-start overflow-hidden rounded-xl border px-4 py-3 text-left transition-all active:scale-95",
              isActive
                ? "bg-brand border-brand shadow-brand/20 font-bold text-white shadow-lg"
                : "bg-bgCard text-textMain border-borderMuted hover:border-brand/40 hover:bg-bgSurface",
            )}
          >
            {/* Progress Bar Background */}
            {!isActive && (
              <div
                className="bg-brand/20 absolute bottom-0 left-0 h-0.5 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            )}

            <div className="mb-1 flex w-full items-center justify-between">
              <span className="text-xs font-black tracking-tight uppercase">
                {subject}
              </span>
              {progress === 100 && !isActive && (
                <CheckCircle size={12} className="text-success" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[9px] font-bold tracking-widest uppercase",
                  isActive ? "text-white/70" : "text-textDim",
                )}
              >
                {answeredInSubject} / {subjectQuestions.length} Answered
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SubjectSidebar;
