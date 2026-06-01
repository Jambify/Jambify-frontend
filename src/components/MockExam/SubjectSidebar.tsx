// src/components/MockExam/SubjectSidebar.tsx

import React from 'react';
import { useMockStore } from '../../Store/useMockStore';
import { cn } from '../../lib/utils/utils';

interface SubjectSidebarProps {
  activeSubject: string;
  onSubjectChange: (subject: string) => void;
  className?: string;
}

const SubjectSidebar: React.FC<SubjectSidebarProps> = ({ 
  activeSubject, 
  onSubjectChange,
  className 
}) => {
  const { questions } = useMockStore();
  
  const subjects = Array.from(new Set(questions.map(q => q.subject)));

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {subjects.map((subject) => {
        const isActive = activeSubject === subject;
        const subjectQuestions = questions.filter(q => q.subject === subject);
        
        return (
          <button
            key={subject}
            onClick={() => onSubjectChange(subject)}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left border group active:scale-95",
              isActive 
                ? "bg-brand text-white border-brand shadow-lg shadow-brand/20 font-bold" 
                : "bg-bgCard text-textMain border-borderMuted hover:border-brand/40 hover:bg-bgSurface"
            )}
          >
            <div className="flex flex-col">
              <span className="text-xs tracking-tight">{subject}</span>
              <span className={cn(
                "text-[9px] uppercase font-black tracking-widest mt-0.5",
                isActive ? "text-white/70" : "text-textDim"
              )}>
                {subjectQuestions.length} Qs
              </span>
            </div>
            {isActive && (
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SubjectSidebar;
