import React from 'react';
import { useQuizStore } from '../../Store/useQuizStore';
import { useTimer } from '../../hooks/useTimer';
import { cn } from '../../lib/utils';

// 30 minutes for the entire quiz (standard JAMB practice timing)
const TOTAL_SECONDS = 30 * 60; 

const TimerBar: React.FC = () => {
  const isFinished = useQuizStore((s) => s.isFinished);
  const finishQuiz = useQuizStore((s) => s.finishQuiz); // Ensure this action exists in your store

  const { timeLeft, formatted } = useTimer({
    initialSeconds: TOTAL_SECONDS,
    onExpire: () => {
      // Force finish the quiz when total time runs out
      finishQuiz();
    },
  });

  const pct = (timeLeft / TOTAL_SECONDS) * 100;
  
  // Adjusted warnings for a longer duration
  // Warn at 5 minutes, Danger at 1 minute
  const isWarn = timeLeft <= 5 * 60 && timeLeft > 60;
  const isDanger = timeLeft <= 60 && timeLeft > 0;

  const barColor = isDanger ? 'bg-danger' : isWarn ? 'bg-warn' : 'bg-brand';

  // If the quiz is already finished (user submitted manually), don't show the timer
  if (isFinished) return null;

  return (
    <div className="mb-4 relative">
      {/* ── Warning Reminder ── */}
      {isWarn && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce bg-warn/10 border border-warn/30 text-warn text-[10px] px-3 py-1 rounded-full whitespace-nowrap z-10 font-bold uppercase tracking-tighter">
          ⚠️ 5 Minutes Remaining!
        </div>
      )}
      
      {isDanger && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-pulse bg-danger/10 border border-danger/30 text-danger text-[10px] px-3 py-1 rounded-full whitespace-nowrap z-10 font-bold uppercase tracking-tighter">
          🚨 Final Minute - Submit Now!
        </div>
      )}

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-textDim uppercase tracking-wider font-medium">
          Total Exam Time
        </span>
        <span className={cn(
          'font-mono text-sm font-semibold tabular-nums transition-colors',
          isDanger ? 'text-danger' : isWarn ? 'text-warn' : 'text-textMain',
        )}>
          {formatted}
        </span>
      </div>

      <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-linear',
            barColor,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default TimerBar;