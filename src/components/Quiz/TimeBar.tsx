import React from 'react';
import { useQuizStore } from '../../Store/useQuizStore';
import { useTimer } from '../../hooks/useTimer';
import { cn } from '../../lib/utils';

const TOTAL_SECONDS = 90;

const TimerBar: React.FC = () => {
const currentIndex = useQuizStore(s => s.currentIndex);
const hasAnswered  = useQuizStore(s => s.hasAnswered);
const submitAnswer = useQuizStore(s => s.submitAnswer);
const questions    = useQuizStore(s => s.questions);
  if (currentIndex >= questions.length) return null;
  onExpire: () => {
  const currentQuestion = questions[currentIndex];
  if (currentQuestion && !hasAnswered) {
    submitAnswer(currentIndex, -1);
  }
}
  const { timeLeft, formatted, reset } = useTimer({
    initialSeconds: TOTAL_SECONDS,
    onExpire: () => {
      // Auto-submit with wrong answer (-1) on time expiry
      if (!hasAnswered) submitAnswer(currentIndex, -1);
    },
  });

  /** Reset timer whenever the question changes */
  React.useEffect(() => { reset(); }, [currentIndex]);

  const pct     = (timeLeft / TOTAL_SECONDS) * 100;
  const isWarn  = timeLeft <= 20;
  const isDanger = timeLeft <= 10;

  const barColor = isDanger
    ? 'bg-danger'
    : isWarn
      ? 'bg-warn'
      : 'bg-brand';

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-textDim uppercase tracking-wider">Time remaining</span>
        <span className={cn(
          'font-mono text-sm font-semibold tabular-nums transition-colors',
          isDanger ? 'text-danger' : isWarn ? 'text-warn' : 'text-textMain',
        )}>
          {hasAnswered ? '—' : formatted}
        </span>
      </div>

      <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-linear', barColor)}
          style={{ width: hasAnswered ? '100%' : `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default TimerBar;