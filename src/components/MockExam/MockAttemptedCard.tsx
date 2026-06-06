import React from "react";
import type { MockAttempt } from "../../Store/useMockStore";
import { cn } from "../../lib/utils/utils";

interface MockAttemptCardProps {
  attempt: MockAttempt;
  attemptNumber: number;
}

const MockAttemptCard: React.FC<MockAttemptCardProps> = ({
  attempt,
  attemptNumber,
}) => {
  const pct = attempt.results.percentageScore;
  const jambScore = attempt.results.jambScore;
  const timeTaken = attempt.timeTaken;
  const h = Math.floor(timeTaken / 3600);
  const m = Math.floor((timeTaken % 3600) / 60);
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

  const scoreColor =
    pct >= 70 ? "text-success" : pct >= 50 ? "text-warn" : "text-danger";

  return (
    <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-4 transition-colors hover:border-white/10">
      <div className="flex items-center gap-3">
        <div className="bg-brand/10 rounded-brand flex h-10 w-10 shrink-0 items-center justify-center text-lg">
          📝
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Mock Exam #{attemptNumber}</p>
          <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
            <span className="text-textDim text-[11px]">
              {new Date(attempt.date).toLocaleDateString()}
            </span>
            <span className="text-textDim text-[11px]">⏱ {timeStr}</span>
          </div>
          {/* Per-subject scores */}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            {attempt.results.subjectBreakdown.map((sb) => (
              <span key={sb.subject} className="text-textDim text-[11px]">
                {sb.subject}:{" "}
                <span className="text-textMuted">
                  {sb.correct}/{sb.total}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={cn(
              "font-display text-2xl font-bold tracking-tight",
              scoreColor,
            )}
          >
            {jambScore}
          </p>
          <p className="text-textDim text-[11px]">{pct}%</p>
        </div>
      </div>

      {/* <Score bar */}
      <div className="bg-bgSurface mt-3 h-1 overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            pct >= 70 ? "bg-success" : pct >= 50 ? "bg-warn" : "bg-danger",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default MockAttemptCard;
