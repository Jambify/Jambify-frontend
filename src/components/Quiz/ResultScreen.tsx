import React, { useEffect, useRef } from "react";
import { useQuizStore } from "../../Store/useQuizStore";
import { useQuizSession } from "../../hooks/useQuizSession";
import Button from "../ui/Button";
import { cn } from "../../lib/utils/utils";

interface ResultsScreenProps {
  onRetry: () => void;
  onHome: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ onRetry, onHome }) => {
  const { questions, answers } = useQuizStore();
  const { commitSession } = useQuizSession();

  // ✅ Fire once on mount — commit results to all stores
  const committed = useRef(false);
  useEffect(() => {
    if (!committed.current) {
      commitSession();
      committed.current = true;
    }
  }, []);

  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  const { emoji, label, color } =
    pct >= 80
      ? { emoji: "🏆", label: "Excellent!", color: "text-success" }
      : pct >= 60
        ? { emoji: "🎯", label: "Good work!", color: "text-warn" }
        : pct >= 40
          ? { emoji: "📚", label: "Keep practising", color: "text-brand-light" }
          : { emoji: "💪", label: "Don't give up!", color: "text-danger" };

  return (
    <div className="max-w-xl mx-auto animate-fadeIn">
      {/* <Score hero */}
      <div className="relative bg-bgCard border border-borderMuted rounded-brand-xl p-8 text-center mb-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(91,59,255,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="text-5xl mb-3">{emoji}</div>
        <div className="font-display text-7xl font-black tracking-tighter text-brand-light leading-none mb-1">
          {correct}
          <span className="text-3xl text-textDim font-normal">/{total}</span>
        </div>
        <div className={cn("font-display text-xl font-semibold mt-2", color)}>
          {label}
        </div>
        <div className="text-sm text-textDim mt-1">{pct}% accuracy</div>
      </div>

      {/* <Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Correct", value: correct, color: "text-success" },
          { label: "Incorrect", value: total - correct, color: "text-danger" },
          { label: "Accuracy", value: `${pct}%`, color: "text-brand-light" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-bgCard border border-borderMuted rounded-brand-lg p-4 text-center"
          >
            <div
              className={cn(
                "font-display text-2xl font-bold tracking-tight",
                color,
              )}
            >
              {value}
            </div>
            <div className="text-[11px] text-textDim uppercase tracking-wider mt-0.5">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* <Per-question review */}
      <div className="bg-bgCard border border-borderMuted rounded-brand-lg overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-borderMuted">
          <p className="text-sm font-semibold">Question review</p>
        </div>
        {questions.map((q, i) => {
          const wasCorrect = answers[i] === q.answer;
          const skipped = answers[i] === -1 || answers[i] === undefined;
          return (
            <div
              key={q.id}
              className="flex items-start gap-3 px-4 py-3 border-b border-borderMuted last:border-b-0"
            >
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                  wasCorrect
                    ? "bg-success/15 text-success"
                    : skipped
                      ? "bg-bgSurface text-textDim"
                      : "bg-danger/15 text-danger",
                )}
              >
                {wasCorrect ? "✓" : skipped ? "–" : "✕"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-textMain line-clamp-2">{q.text}</p>
                {!wasCorrect && !skipped && (
                  <p className="text-[11px] text-success mt-0.5">
                    Correct: {q.options[q.answer]}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-textDim shrink-0">
                {q.subject}
              </span>
            </div>
          );
        })}
      </div>

      {/* <CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button variant="primary" fullWidth onClick={onRetry}>
          🔄 Try again
        </Button>
        <Button variant="secondary" fullWidth onClick={onHome}>
          ← Dashboard
        </Button>
        <Button variant="secondary" fullWidth onClick={onHome}>
          📊 Performance
        </Button>
      </div>
    </div>
  );
};

export default ResultsScreen;
