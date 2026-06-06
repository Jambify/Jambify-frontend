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
    <div className="animate-fadeIn mx-auto max-w-xl">
      {/* <Score hero */}
      <div className="bg-bgCard border-borderMuted rounded-brand-xl relative mb-5 overflow-hidden border p-8 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(91,59,255,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="mb-3 text-5xl">{emoji}</div>
        <div className="font-display text-brand-light mb-1 text-7xl leading-none font-black tracking-tighter">
          {correct}
          <span className="text-textDim text-3xl font-normal">/{total}</span>
        </div>
        <div className={cn("font-display mt-2 text-xl font-semibold", color)}>
          {label}
        </div>
        <div className="text-textDim mt-1 text-sm">{pct}% accuracy</div>
      </div>

      {/* <Stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "Correct", value: correct, color: "text-success" },
          { label: "Incorrect", value: total - correct, color: "text-danger" },
          { label: "Accuracy", value: `${pct}%`, color: "text-brand-light" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-bgCard border-borderMuted rounded-brand-lg border p-4 text-center"
          >
            <div
              className={cn(
                "font-display text-2xl font-bold tracking-tight",
                color,
              )}
            >
              {value}
            </div>
            <div className="text-textDim mt-0.5 text-[11px] tracking-wider uppercase">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* <Per-question review */}
      <div className="bg-bgCard border-borderMuted rounded-brand-lg mb-5 overflow-hidden border">
        <div className="border-borderMuted border-b px-4 py-3">
          <p className="text-sm font-semibold">Question review</p>
        </div>
        {questions.map((q, i) => {
          const wasCorrect = answers[i] === q.answer;
          const skipped = answers[i] === -1 || answers[i] === undefined;
          return (
            <div
              key={q.id}
              className="border-borderMuted flex items-start gap-3 border-b px-4 py-3 last:border-b-0"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  wasCorrect
                    ? "bg-success/15 text-success"
                    : skipped
                      ? "bg-bgSurface text-textDim"
                      : "bg-danger/15 text-danger",
                )}
              >
                {wasCorrect ? "✓" : skipped ? "–" : "✕"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-textMain line-clamp-2 text-xs">{q.text}</p>
                {!wasCorrect && !skipped && (
                  <p className="text-success mt-0.5 text-[11px]">
                    Correct: {q.options[q.answer]}
                  </p>
                )}
              </div>
              <span className="text-textDim shrink-0 text-[10px]">
                {q.subject}
              </span>
            </div>
          );
        })}
      </div>

      {/* <CTAs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
