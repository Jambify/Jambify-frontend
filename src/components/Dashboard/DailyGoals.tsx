import React from 'react';
import { useGoalStore } from '../../Store/useGoal';
import { cn } from '../../lib/utils';
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const ACTIVITY = [45, 72, 30, 88, 65, 20, 0]; // % heights — replace with real data

const DailyGoals: React.FC = () => {
  const { goals, toggleGoal } = useGoalStore();
  const doneCount = goals.filter(g => g.done).length;

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-tight">Daily Goals</h3>
        <span className="text-xs text-textDim">{doneCount}/{goals.length} done</span>
      </div>

      <div className="divide-y divide-borderMuted">
        {goals.map((goal) => (
          <div key={goal.id}
            className="flex items-center gap-3 py-2.5 cursor-pointer group"
            onClick={() => toggleGoal(goal.id)}
          >
            <div className={cn(
              'w-4.5 h-4.5 rounded-full shrink-0 flex items-center justify-center border transition-all',
              goal.done
                ? 'bg-success border-success'
                : 'border-borderMuted group-hover:border-white/30'
            )}>
              {goal.done && <span className="text-[10px] text-white font-bold">✓</span>}
            </div>
            <span className={cn('text-sm flex-1', goal.done && 'line-through text-textDim')}>
              {goal.label}
            </span>
            <span className="text-[11px] text-warn font-mono font-medium">+{goal.xp} XP</span>
          </div>
        ))}
      </div>

      {/* Weekly activity mini-chart */}
      <div className="mt-4 pt-4 border-t border-borderMuted">
        <p className="text-xs text-textDim mb-2">This week's activity</p>
        <div className="flex items-end gap-1.5 h-12">
          {ACTIVITY.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-sm"
                style={{
                  height: `${Math.max(4, h * 0.85)}%`,
                  background: h > 0 ? 'var(--color-brand)' : 'transparent',
                  opacity: h > 0 ? 0.35 + (h / 100) * 0.65 : 1,
                  border: h === 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
              />
              <span className="text-[9px] text-textDim">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyGoals;