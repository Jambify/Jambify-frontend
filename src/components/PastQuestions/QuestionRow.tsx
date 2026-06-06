import React from "react";
import { cn } from "../../lib/utils/utils";
import type { Question } from "../../Types";

interface QuestionRowProps {
  question: Question;
  isExpanded: boolean;
  onToggle: () => void;
}

const SUBJ_COLORS: Record<string, string> = {
  English: "#7B5FFF",
  Mathematics: "#00C896",
  Physics: "#FFB020",
  Chemistry: "#FF4D6D",
  Biology: "#00C896",
  Economics: "#FFB020",
};

const DIFF_CLS: Record<string, string> = {
  Easy: "text-success bg-success/10 border-success/20",
  Medium: "text-warn bg-warn/10 border-warn/20",
  Hard: "text-danger bg-danger/10 border-danger/20",
};

const LETTERS = ["A", "B", "C", "D"];

const QuestionRow: React.FC<QuestionRowProps> = ({
  question: q,
  isExpanded,
  onToggle,
}) => {
  const subjColor = SUBJ_COLORS[q.subject] ?? "#7B5FFF";

  return (
    <div
      className={cn(
        "bg-bgCard rounded-brand-lg overflow-hidden border transition-all duration-200",
        isExpanded
          ? "border-white/12"
          : "border-borderMuted hover:border-white/10",
      )}
    >
      {/* <── Row header — always visible ── */}
      <button
        className="flex w-full items-start gap-3 p-4 text-left"
        onClick={onToggle}
      >
        {/* <Subject colour strip */}
        <div
          className="mt-0.5 w-1 shrink-0 self-stretch rounded-full"
          style={{ background: subjColor }}
        />

        <div className="min-w-0 flex-1">
          {/* <Meta row */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border px-2 py-0.5 text-[11px] font-medium"
              style={{
                color: subjColor,
                background: subjColor + "18",
                borderColor: subjColor + "40",
              }}
            >
              {q.subject}
            </span>
            <span className="text-textDim font-mono text-[11px]">{q.year}</span>
            <span
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] font-medium",
                DIFF_CLS[q.difficulty],
              )}
            >
              {q.difficulty}
            </span>
            <span className="text-textDim hidden text-[11px] sm:inline">
              {q.topic}
            </span>
          </div>

          {/* <Question text preview */}
          <p
            className={cn(
              "text-textMain text-sm leading-relaxed",
              !isExpanded && "line-clamp-2",
            )}
          >
            {q.text}
          </p>
        </div>

        {/* <Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            "text-textDim mt-1 shrink-0 transition-transform duration-200",
            isExpanded && "rotate-180",
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* <── Expanded — options + answer + explanation ── */}
      {isExpanded && (
        <div className="border-borderMuted animate-slideDown border-t px-4 pt-4 pb-4">
          {/* <Options */}
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options.map((opt, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-brand flex items-start gap-2.5 border px-3 py-2.5 text-sm transition-all",
                  i === q.answer
                    ? "bg-success/10 border-success text-textMain"
                    : "bg-bgSurface border-borderMuted text-textMuted",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    i === q.answer
                      ? "bg-success text-white"
                      : "bg-bgCard border-borderMuted text-textDim border",
                  )}
                >
                  {i === q.answer ? "✓" : LETTERS[i]}
                </span>
                <span className="leading-relaxed">{opt}</span>
              </div>
            ))}
          </div>

          {/* <Explanation */}
          <div className="bg-brand/5 border-l-brand border-brand/15 rounded-r-brand border border-l-[3px] px-4 py-3">
            <p className="text-brand-light mb-1.5 text-[11px] font-semibold tracking-widest uppercase">
              Explanation
            </p>
            <p className="text-textMuted text-sm leading-relaxed">
              {q.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionRow;
