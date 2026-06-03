// src/components/MockExam/QuestionPalette.tsx

import React from "react";
import { useMockStore } from "../../Store/useMockStore";
import { cn } from "../../lib/utils/utils";

interface QuestionPaletteProps {
  onJumpToQuestion: (index: number) => void;
  className?: string;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  onJumpToQuestion,
  className,
}) => {
  const {
    questions,
    currentIndex,
    answers,
    visitedQuestions,
    markedForReview,
  } = useMockStore();

  const getStatusColor = (index: number) => {
    if (index === currentIndex)
      return "bg-brand text-white border-brand ring-2 ring-brand/20 ring-offset-2";

    if (markedForReview.includes(index))
      return "bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/20";
    if (answers[index] !== undefined)
      return "bg-success text-white border-success-dark shadow-sm shadow-success/20";
    if (visitedQuestions.includes(index))
      return "bg-blue-500 text-white border-blue-600 shadow-sm shadow-blue-500/20";

    return "bg-bgSurface text-textDim border-borderMuted hover:border-brand/50";
  };

  const subjects = Array.from(new Set(questions.map((q) => q.subject)));

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {subjects.map((subject) => {
        const subjectQuestions = questions
          .map((q, i) => ({ ...q, globalIndex: i }))
          .filter((q) => q.subject === subject);

        return (
          <div key={subject} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-brand/30 rounded-full"></div>
              <h4 className="text-[10px] font-black text-textDim uppercase tracking-widest">
                {subject}
              </h4>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5">
              {subjectQuestions.map((q) => (
                <button
                  key={q.globalIndex}
                  onClick={() => onJumpToQuestion(q.globalIndex)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-[10px] font-black transition-all border flex items-center justify-center active:scale-90",
                    getStatusColor(q.globalIndex),
                  )}
                >
                  {subjectQuestions.indexOf(q) + 1}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-2 p-4 bg-bgSurface/50 rounded-brand-xl border border-borderMuted grid grid-cols-2 gap-y-3 gap-x-2 text-[9px] font-black uppercase tracking-tighter text-textDim">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-bgSurface border border-borderMuted"></div>
          <span>Unvisited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500 border border-blue-600"></div>
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-success border border-success-dark"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-orange-500 border border-orange-600"></div>
          <span>Review</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
