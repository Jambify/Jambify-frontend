import React from 'react';
import { useQuizStore } from '../../Store/useQuizStore';
import { useTimer } from '../../hooks/useTimer';
import { cn } from '../../lib/utils';

const TOTAL_SECONDS = 1 * 60; // 1 minute

const TimerBar: React.FC = () => {
  // Zustand slices
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const hasAnswered  = useQuizStore((s) => s.hasAnswered);
  const submitAnswer = useQuizStore((s) => s.submitAnswer);
  const isStarted    = useQuizStore((s) => s.isStarted);

  // 🔥 UI Warning State
  const [showWarning, setShowWarning] = React.useState(false);

  // Global timer
  const { timeLeft, formatted } = useTimer({
    initialSeconds: TOTAL_SECONDS,
    isRunning: isStarted,
    onExpire: () => {
      if (!hasAnswered) {
        submitAnswer(currentIndex, -1);
      }
    },
  });

  const pct = (timeLeft / TOTAL_SECONDS) * 100;

  // Time thresholds
  const isWarn   = timeLeft <= 5 * 60; // last 5 mins
  const isDanger = timeLeft <= 60;     // last 1 min

  // 🔥 Trigger warning UI (ONLY ONCE)
  React.useEffect(() => {
    if (timeLeft === 60) {
      setShowWarning(true);

      // auto hide after 4s
      setTimeout(() => setShowWarning(false), 4000);
    }
  }, [timeLeft]);

  const barColor =
    isDanger ? 'bg-danger' :
    isWarn   ? 'bg-warn'   :
               'bg-brand';

  return (
    <div className="mb-4 relative">
      
      {/* 🔥 Warning Toast */}
      {showWarning && (
        <div className="absolute -top-12 right-0 bg-danger text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-top fade-in duration-300">
          ⏳ 1 minute left! Hurry up
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-textDim uppercase tracking-wider">
          Time remaining
        </span>

        <span
          className={cn(
            'font-mono text-sm font-semibold tabular-nums transition-colors',
            isDanger
              ? 'text-danger'
              : isWarn
              ? 'text-warn'
              : 'text-textMain',
          )}
        >
          {formatted}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-linear',
            barColor,
            isDanger && 'animate-pulse'
          )}
          style={{
            width: `${pct}%`,
          }}
        />
      </div>
    </div>
  );
};

export default TimerBar;