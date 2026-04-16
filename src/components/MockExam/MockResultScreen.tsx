import React, { useEffect, useRef } from 'react';
import { useMockStore }        from '../../Store/useMockStore';
import { useUserStore }        from '../../Store/UseUserStore';
import { usePerformanceStore } from '../../Store/usePerformanceStore';
import Button                  from '../ui/Button';
import { cn }                  from '../../lib/utils';
import ExamPaywall             from './ExamPaywall';

interface MockResultsProps {
  onRetry: () => void;
  onHome:  () => void;
}

const SUBJECT_COLORS: Record<string, string> = {
  English:     '#7B5FFF',
  Mathematics: '#00C896',
  Physics:     '#FFB020',
  Chemistry:   '#FF4D6D',
  Biology:     '#00C896',
};

const MockResultsScreen: React.FC<MockResultsProps> = ({ onRetry, onHome }) => {
  const { questions, answers, timeLeft } = useMockStore();
  const { incrementQuestions, updateAccuracy, isPro } = useUserStore();
  const { addActivity, addMockScore }          = usePerformanceStore();

  const total     = questions.length;
  const correct   = questions.filter((q, i) => answers[i] === q.answer).length;
  const pct       = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeTaken = 7200 - timeLeft;
  const h = Math.floor(timeTaken / 3600);
  const m = Math.floor((timeTaken % 3600) / 60);

  // ✅ Commit mock results to stores — fire once on mount
  const committed = useRef(false);
  useEffect(() => {
    if (committed.current || total === 0) return;
    committed.current = true;

    incrementQuestions(total);
    updateAccuracy(pct);
    addMockScore(correct);

    const today = new Date()
      .toLocaleDateString('en-GB', { weekday: 'short' })
      .slice(0, 3);
    addActivity(today, total);
  }, []);

  /* Per-subject breakdown */
  const subjectMap: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q, i) => {
    if (!subjectMap[q.subject]) subjectMap[q.subject] = { correct: 0, total: 0 };
    subjectMap[q.subject].total++;
    if (answers[i] === q.answer) subjectMap[q.subject].correct++;
  });

  const { emoji, label, color } = pct >= 80
    ? { emoji: '🏆', label: 'Outstanding!',  color: 'text-success'     }
    : pct >= 65
      ? { emoji: '🎯', label: 'Great effort!', color: 'text-warn'        }
      : pct >= 50
        ? { emoji: '📚', label: 'Keep pushing!', color: 'text-brand-light' }
        : { emoji: '💪', label: "Don't stop!",   color: 'text-danger'      };

  // Show paywall for non-Pro users
  if (!isPro) {
    return (
      <ExamPaywall 
        onUpgrade={() => {}}
        onBack={onHome}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">

      {/* <Score hero */}
      <div className="relative bg-bgCard border border-borderMuted rounded-brand-xl p-8 text-center mb-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 0%, rgba(91,59,255,0.08) 0%, transparent 65%)' }} />
        <div className="text-5xl mb-3">{emoji}</div>
        <div className="font-display text-7xl font-black tracking-tighter text-brand-light leading-none mb-1">
          {correct}<span className="text-3xl text-textDim font-normal">/{total}</span>
        </div>
        <div className={cn('font-display text-xl font-semibold mt-2', color)}>{label}</div>
        <div className="flex justify-center gap-4 mt-3 text-sm text-textDim">
          <span>{pct}% accuracy</span><span>·</span>
          <span>⏱ {h}h {m}m used</span>
        </div>
      </div>

      {/* <Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Correct', value: correct,        color: 'text-success'     },
          { label: 'Wrong',   value: total - correct, color: 'text-danger'      },
          { label: 'Score %', value: `${pct}%`,      color: 'text-brand-light' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-bgCard border border-borderMuted rounded-brand-lg p-4 text-center">
            <div className={cn('font-display text-2xl font-bold', color)}>{value}</div>
            <div className="text-[11px] text-textDim uppercase tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* <Subject breakdown */}
      <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5 mb-5">
        <h3 className="font-display text-sm font-semibold tracking-tight mb-4">Subject breakdown</h3>
        <div className="flex flex-col gap-3">
          {Object.entries(subjectMap).map(([subj, data]) => {
            const subjPct = Math.round((data.correct / data.total) * 100);
            const clr     = SUBJECT_COLORS[subj] ?? '#7B5FFF';
            return (
              <div key={subj}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{subj}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-textDim">{data.correct}/{data.total}</span>
                    <span className="font-mono text-xs font-semibold" style={{ color: clr }}>{subjPct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${subjPct}%`, background: clr }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* <CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button variant="primary"   fullWidth onClick={onRetry}>🔄 Try again</Button>
        <Button variant="secondary" fullWidth onClick={onHome}>← Dashboard</Button>
        <Button variant="secondary" fullWidth onClick={onHome}>📊 Performance</Button>
      </div>
    </div>
  );
};

export default MockResultsScreen;