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
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-4 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand/10 rounded-brand flex items-center justify-center text-lg shrink-0">
          📝
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Mock Exam #{attemptNumber}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            <span className="text-[11px] text-textDim">{new Date(attempt.date).toLocaleDateString()}</span>
            <span className="text-[11px] text-textDim">⏱ {timeStr}</span>
          </div>
          {/* Per-subject scores */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {attempt.results.subjectBreakdown.map((sb) => (
              <span key={sb.subject} className="text-[11px] text-textDim">
                {sb.subject}:{" "}
                <span className="text-textMuted">
                  {sb.correct}/{sb.total}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p
            className={cn(
              "font-display text-2xl font-bold tracking-tight",
              scoreColor,
            )}
          >
            {jambScore}
          </p>
          <p className="text-[11px] text-textDim">{pct}%</p>
        </div>
      </div>

      {/* <Score bar */}
      <div className="mt-3 h-1 bg-bgSurface rounded-full overflow-hidden">
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
