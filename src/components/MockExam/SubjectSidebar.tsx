// src/components/MockExam/SubjectSidebar.tsx

import React from 'react';
import { useMockStore } from '../../Store/useMockStore';
import { cn } from '../../lib/utils/utils';
import { CheckCircle } from 'lucide-react';

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
  const { questions, answers } = useMockStore();
  
  const subjects = Array.from(new Set(questions.map(q => q.subject)));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {subjects.map((subject) => {
        const isActive = activeSubject === subject;
        const subjectQuestions = questions.filter(q => q.subject === subject);
        const answeredInSubject = subjectQuestions.filter(q => {
          const globalIdx = questions.indexOf(q);
          return answers[globalIdx] !== undefined;
        }).length;
        
        const progress = (answeredInSubject / subjectQuestions.length) * 100;

        return (
          <button
            key={subject}
            onClick={() => onSubjectChange(subject)}
            className={cn(
              "relative flex flex-col items-start px-4 py-3 rounded-xl transition-all text-left border group active:scale-95 overflow-hidden",
              isActive 
                ? "bg-brand text-white border-brand shadow-lg shadow-brand/20 font-bold" 
                : "bg-bgCard text-textMain border-borderMuted hover:border-brand/40 hover:bg-bgSurface"
            )}
          >
            {/* Progress Bar Background */}
            {!isActive && (
              <div 
                className="absolute bottom-0 left-0 h-0.5 bg-brand/20 transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            )}
            
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs tracking-tight font-black uppercase">{subject}</span>
              {progress === 100 && !isActive && (
                <CheckCircle size={12} className="text-success" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-widest",
                isActive ? "text-white/70" : "text-textDim"
              )}>
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
