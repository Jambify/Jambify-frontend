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
    <div className={cn("flex flex-col gap-3", className)}>
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
              "group relative flex flex-col items-start overflow-hidden rounded-[22px] border px-4 py-4 text-left transition-all",
              isActive
                ? "bg-brand border-brand text-white shadow-brand/20 shadow-lg"
                : "bg-bgCard text-textMain border-borderMuted hover:border-brand/30 hover:bg-bgSurface/80",
            )}
          >
            {!isActive && (
              <div
                className="absolute bottom-0 left-0 h-1.5 bg-brand/30 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            )}

            <div className="mb-2 flex w-full items-center justify-between gap-3">
              <span className="text-sm font-bold tracking-tight uppercase">
                {subject}
              </span>
              {progress === 100 && !isActive && (
                <CheckCircle size={14} className="text-success" />
              )}
            </div>

            <span
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em]",
                isActive ? "bg-white/10 text-white" : "bg-bgSurface text-textDim",
              )}
            >
              {answeredInSubject} / {subjectQuestions.length} Answered
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SubjectSidebar;
