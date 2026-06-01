// src/components/MockExam/MockResultScreen.tsx

import React, { useState } from "react";
import { useMockStore } from "../../Store/useMockStore";
import { useUserStore } from "../../Store/UseUserStore";
import Button from "../ui/Button";
import { cn } from "../../lib/utils/utils";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface MockResultsScreenProps {
  onRetry: () => void;
  onHome: () => void;
}

const MockResultsScreen: React.FC<MockResultsScreenProps> = ({ onRetry, onHome }) => {
  const { lastResult, questions, answers } = useMockStore();
  const { user } = useUserStore();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  if (!lastResult) return null;

  const { jambScore, percentageScore, totalCorrect, totalQuestions, subjectBreakdown } = lastResult;

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Excellent': return 'text-success';
      case 'Good': return 'text-brand';
      case 'Average': return 'text-warning';
      case 'Poor': return 'text-danger';
      default: return 'text-textDim';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Score Overview */}
      <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-8 mb-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-textDim uppercase tracking-widest mb-2">Your JAMB Score</h2>
        <div className="text-7xl font-display font-black text-brand mb-4">
          {jambScore}
          <span className="text-2xl text-textDim font-normal ml-2">/ 400</span>
        </div>
        <div className="flex justify-center gap-8 text-sm">
          <div>
            <span className="text-textDim block uppercase text-[10px] font-bold">Accuracy</span>
            <span className="text-xl font-bold">{percentageScore}%</span>
          </div>
          <div>
            <span className="text-textDim block uppercase text-[10px] font-bold">Correct</span>
            <span className="text-xl font-bold">{totalCorrect} / {totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {subjectBreakdown.map((sb) => (
          <div key={sb.subject} className="bg-bgCard border border-borderMuted rounded-brand-lg p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{sb.subject}</h3>
                <span className={cn("text-xs font-bold uppercase", getPerformanceColor(sb.performance))}>
                  {sb.performance}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{sb.score}%</div>
                <div className="text-[10px] text-textDim uppercase font-bold">{sb.correct} / {sb.total}</div>
              </div>
            </div>
            <div className="h-2 bg-bgSurface rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", 
                  sb.score >= 75 ? "bg-success" : sb.score >= 60 ? "bg-brand" : sb.score >= 45 ? "bg-warning" : "bg-danger"
                )}
                style={{ width: `${sb.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Question Review */}
      <div className="space-y-4 mb-12">
        <h3 className="text-xl font-bold mb-4">Question Review</h3>
        {subjectBreakdown.map((sb) => (
          <div key={`review-${sb.subject}`} className="border border-borderMuted rounded-brand-lg overflow-hidden bg-bgCard">
            <button 
              onClick={() => setExpandedSubject(expandedSubject === sb.subject ? null : sb.subject)}
              className="w-full flex items-center justify-between p-4 hover:bg-bgSurface transition-colors"
            >
              <span className="font-bold">{sb.subject} Questions</span>
              {expandedSubject === sb.subject ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSubject === sb.subject && (
              <div className="p-4 space-y-6 border-t border-borderMuted bg-bgSurface/30">
                {questions
                  .map((q, i) => ({ ...q, globalIndex: i }))
                  .filter(q => q.subject === sb.subject)
                  .map((q, idx) => {
                    const userAnswer = answers[q.globalIndex];
                    const isCorrect = userAnswer === q.answer;
                    const isUnanswered = userAnswer === undefined;

                    return (
                      <div key={q.id} className="bg-bgCard border border-borderMuted rounded-brand-md p-4 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-bgSurface border border-borderMuted flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="text-sm font-medium leading-relaxed">{q.text}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-9">
                          {q.options.map((opt, optIdx) => (
                            <div 
                              key={optIdx}
                              className={cn(
                                "px-3 py-2 rounded border text-xs flex items-center justify-between",
                                optIdx === q.answer 
                                  ? "bg-success/10 border-success/30 text-success font-bold" 
                                  : optIdx === userAnswer 
                                    ? "bg-danger/10 border-danger/30 text-danger" 
                                    : "bg-bgSurface border-borderMuted text-textDim"
                              )}
                            >
                              <span>{opt}</span>
                              {optIdx === q.answer && <CheckCircle size={14} />}
                              {optIdx === userAnswer && optIdx !== q.answer && <XCircle size={14} />}
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 ml-9 pt-3 border-t border-borderMuted">
                          <div className="flex items-center gap-2 mb-2">
                            {isCorrect ? (
                              <span className="text-[10px] font-bold uppercase text-success flex items-center gap-1">
                                <CheckCircle size={12} /> Correct
                              </span>
                            ) : isUnanswered ? (
                              <span className="text-[10px] font-bold uppercase text-textDim flex items-center gap-1">
                                <AlertCircle size={12} /> Unanswered
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase text-danger flex items-center gap-1">
                                <XCircle size={12} /> Incorrect
                              </span>
                            )}
                          </div>
                          {q.explanation && (
                            <div className="bg-brand/5 p-3 rounded text-xs text-textMain border-l-2 border-brand">
                              <span className="font-bold block mb-1">Explanation:</span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Guest Prompt */}
      {!user && (
        <div className="bg-brand/10 border border-brand/20 rounded-brand-xl p-6 mb-8 text-center">
          <h4 className="font-bold text-brand mb-2">Save your progress!</h4>
          <p className="text-sm text-textMain mb-4">Create an account to track your performance over time and see detailed analytics.</p>
          <Button variant="primary" size="md">Sign Up Now</Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onClick={onRetry}
          className="order-1 sm:order-2"
        >
          Try Again
        </Button>
        <Button 
          variant="secondary" 
          size="lg" 
          fullWidth 
          onClick={onHome}
          className="order-2 sm:order-1"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default MockResultsScreen;
