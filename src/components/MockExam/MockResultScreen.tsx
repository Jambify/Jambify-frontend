import React, { useState } from "react";
import { useMockStore } from "../../Store/useMockStore";
import Button from "../ui/Button";
import { cn } from "../../lib/utils";

interface MockResultsProps {
  onRetry: () => void;
  onHome: () => void;
}

const SUBJECT_COLORS: Record<string, string> = {
  English: "#7B5FFF",
  Mathematics: "#00C896",
  Physics: "#FFB020",
  Chemistry: "#FF4D6D",
  Biology: "#00C896",
  Economics: "#FFB020",
  Geography: "#7B5FFF",
  "Christian Religious Studies (CRS)": "#FF4D6D",
  "Literature in English": "#7B5FFF",
  History: "#00C896",
  Government: "#FFB020",
};

const MockResultsScreen: React.FC<MockResultsProps> = ({ onRetry, onHome }) => {
  const { questions, answers, timeLeft } = useMockStore();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const total = questions.length;
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeTaken = 7200 - timeLeft;
  const h = Math.floor(timeTaken / 3600);
  const m = Math.floor((timeTaken % 3600) / 60);

  const subjectMap: Record<string, { correct: number; total: number; failedIndices: number[] }> = {};
  
  questions.forEach((q, i) => {
    if (!subjectMap[q.subject])
      subjectMap[q.subject] = { correct: 0, total: 0, failedIndices: [] };
    
    subjectMap[q.subject].total++;
    if (answers[i] === q.answer) {
      subjectMap[q.subject].correct++;
    } else {
      subjectMap[q.subject].failedIndices.push(i);
    }
  });

  const { emoji, label, colorClass } =
    pct >= 80
      ? { emoji: "🏆", label: "Outstanding!", colorClass: "text-success" }
      : pct >= 65
        ? { emoji: "🎯", label: "Great effort!", colorClass: "text-warn" }
        : pct >= 50
          ? { emoji: "📚", label: "Keep pushing!", colorClass: "text-brand-light" }
          : { emoji: "💪", label: "Don't stop!", colorClass: "text-danger" };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn pb-10">
      {/* Score hero */}
      <div className="relative bg-bgCard border border-borderMuted rounded-brand-xl p-8 text-center mb-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 0%, rgba(91,59,255,0.08) 0%, transparent 65%)" }}
        />
        <div className="text-5xl mb-3">{emoji}</div>
        <div className="font-display text-7xl font-black tracking-tighter text-brand-light leading-none mb-1">
          {correct}
          <span className="text-3xl text-textDim font-normal">/{total}</span>
        </div>
        <div className={cn("font-display text-xl font-semibold mt-2", colorClass)}>
          {label}
        </div>
        <div className="flex justify-center gap-4 mt-3 text-sm text-textDim">
          <span>{pct}% accuracy</span>
          <span>·</span>
          <span>⏱ {h}h {m}m used</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Correct", value: correct, color: "text-success" },
          { label: "Wrong", value: total - correct, color: "text-danger" },
          { label: "Score %", value: `${pct}%`, color: "text-brand-light" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-bgCard border border-borderMuted rounded-brand-lg p-4 text-center">
            <div className={cn("font-display text-2xl font-bold", color)}>{value}</div>
            <div className="text-[11px] text-textDim uppercase tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Per-subject breakdown */}
      <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5 mb-5">
        <h3 className="font-display text-sm font-semibold tracking-tight mb-4">Subject Review</h3>
        <div className="flex flex-col gap-4">
          {Object.entries(subjectMap).map(([subj, data]) => {
            const subjPct = Math.round((data.correct / data.total) * 100);
            const subjColor = SUBJECT_COLORS[subj] || "#7B5FFF";
            const isExpanded = expandedSubject === subj;

            return (
              <div key={subj} className="border-b border-borderMuted/50 last:border-0 pb-3">
                <button 
                  onClick={() => setExpandedSubject(isExpanded ? null : subj)}
                  className="w-full flex flex-col group text-left"
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="text-sm font-medium flex items-center gap-2">
                      {subj}
                      {data.failedIndices.length > 0 && (
                        <span className="text-[9px] bg-danger/10 text-danger px-1.5 py-0.5 rounded-full font-bold">
                          {data.failedIndices.length} ERRORS
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-xs font-bold" style={{ color: subjColor }}>
                      {subjPct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-bgSurface rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${subjPct}%`, background: subjColor }}
                    />
                  </div>
                  <span className="text-[10px] text-textDim uppercase tracking-widest font-bold">
                    {isExpanded ? "Close Review ▲" : "View Corrections ▼"}
                  </span>
                </button>

                {/* SCROLLABLE CORRECTIONS AREA */}
                {isExpanded && data.failedIndices.length > 0 && (
                  <div className="mt-4 space-y-3 max-h-100 overflow-y-auto pr-2 custom-scrollbar animate-fadeIn">
                    {data.failedIndices.map((idx) => {
                      const question = questions[idx];
                      const userAns = answers[idx];
                      return (
                        <div key={idx} className="bg-bgSurface border border-borderMuted p-4 rounded-brand">
                          <p className="text-xs text-textMain mb-3 font-medium leading-relaxed">
                            <span className="text-textDim mr-1">Q{idx + 1}.</span> {question.text}
                          </p>
                          <div className="space-y-2">
                            <div className="text-[11px] flex items-start gap-2 text-danger">
                              <span className="font-bold shrink-0">✕</span>
                              <span>You: {userAns === -1 ? "No Answer" : question.options[userAns]}</span>
                            </div>
                            <div className="text-[11px] flex items-start gap-2 text-success">
                              <span className="font-bold shrink-0">✓</span>
                              <span>Correct: {question.options[question.answer]}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
        <Button variant="primary" fullWidth onClick={onRetry}>🔄 Try again</Button>
        <Button variant="secondary" fullWidth onClick={onHome}>← Dashboard</Button>
        <Button variant="secondary" fullWidth onClick={onHome}>📊 Performance</Button>
      </div>
    </div>
  );
};

export default MockResultsScreen;