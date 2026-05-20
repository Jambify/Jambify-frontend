import React, { useMemo } from "react";
import { useGoalStore } from "../../Store/useGoal";
import { useUserStore } from "../../Store/UseUserStore";
import { cn } from "../../lib/utils/utils";
import { Flame, CheckCircle2, Circle, Zap } from "lucide-react";

const DAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

// Returns 0-indexed day of week where 0 = Monday
function getTodayIndex(): number {
  const d = new Date().getDay(); // 0=Sun … 6=Sat
  return d === 0 ? 6 : d - 1;
}

function getMotivationalMessage(pct: number, streak: number): string {
  if (pct === 0)   return "Start today — every expert was once a beginner.";
  if (pct < 40)    return "Good start! Keep the momentum going.";
  if (pct < 80)    return streak > 3 ? "You're on fire 🔥 Almost there!" : "More than halfway — finish strong!";
  if (pct < 100)   return "So close! One last push to complete your goal.";
  return streak > 7 ? "Goal crushed! You're unstoppable 🚀" : "Daily goal complete! Great work today.";
}

const DAILY_QUESTION_GOAL = 10;

const DailyGoals: React.FC = () => {
  const { goals, toggleGoal } = useGoalStore();
  const { questionsCompleted, streak } = useUserStore();

  const doneCount = goals.filter((g) => g.done).length;
  const totalXp   = goals.reduce((sum, g) => sum + (g.done ? g.xp : 0), 0);

  // Simulate today's questions from questionsCompleted
  // In a real app this would be today's session count from a daily activity store
  const todayQuestions = Math.min(questionsCompleted % DAILY_QUESTION_GOAL || (questionsCompleted > 0 ? DAILY_QUESTION_GOAL : 0), DAILY_QUESTION_GOAL);
  const questionPct    = Math.round((todayQuestions / DAILY_QUESTION_GOAL) * 100);
  const goalComplete   = todayQuestions >= DAILY_QUESTION_GOAL;

  // Build 7-day streak bars: today = getTodayIndex(), past days filled based on streak
  const todayIdx = getTodayIndex();
  const streakBars = useMemo(() => {
    return DAYS_SHORT.map((label, i) => {
      const daysAgo = (todayIdx - i + 7) % 7;
      const isToday = i === todayIdx;
      const active  = daysAgo < streak || (isToday && goalComplete);
      return { label, isToday, active };
    });
  }, [todayIdx, streak, goalComplete]);

  const motivationMsg = getMotivationalMessage(questionPct, streak);

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-tight">
          Daily Goals
        </h3>
        <span className="text-xs text-textDim">
          {doneCount}/{goals.length} done
          {totalXp > 0 && (
            <span className="ml-1.5 text-warn font-semibold">+{totalXp} XP</span>
          )}
        </span>
      </div>

      {/* Daily question progress */}
      <div className="mb-4 p-3 bg-bgSurface border border-borderMuted rounded-brand">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-textMain flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand" />
            Daily question goal
          </span>
          <span className={cn(
            "text-xs font-mono font-semibold",
            goalComplete ? "text-success" : "text-textMuted"
          )}>
            {todayQuestions}/{DAILY_QUESTION_GOAL}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-bgCard rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              goalComplete ? "bg-success" : "bg-brand"
            )}
            style={{ width: `${questionPct}%` }}
          />
        </div>
        <p className="text-[11px] text-textDim mt-1.5 leading-snug">{motivationMsg}</p>
        {!goalComplete && (
          <p className="text-[10px] text-brand-light mt-1 font-medium">
            🎁 Complete daily goal for bonus XP
          </p>
        )}
      </div>

      {/* Goal checklist */}
      <div className="divide-y divide-borderMuted">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-center gap-3 py-2.5 cursor-pointer group select-none"
            onClick={() => toggleGoal(goal.id)}
          >
            {/* Checkbox */}
            <div className="shrink-0">
              {goal.done ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-success" />
              ) : (
                <Circle className="w-4.5 h-4.5 text-borderMuted group-hover:text-textDim transition-colors" />
              )}
            </div>

            {/* Label */}
            <span
              className={cn(
                "text-sm flex-1 leading-snug transition-colors",
                goal.done ? "line-through text-textDim" : "text-textMain"
              )}
            >
              {goal.label}
            </span>

            {/* XP badge */}
            <span className={cn(
              "text-[11px] font-mono font-semibold shrink-0 transition-colors",
              goal.done ? "text-success" : "text-warn"
            )}>
              +{goal.xp} XP
            </span>
          </div>
        ))}
      </div>

      {/* 7-day streak visualisation */}
      <div className="mt-4 pt-4 border-t border-borderMuted">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-textDim flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            {streak > 0 ? `${streak}-day streak` : "This week's activity"}
          </p>
          {streak >= 7 && (
            <span className="text-[10px] text-orange-400 font-semibold">🔥 On fire!</span>
          )}
        </div>

        <div className="flex items-end gap-1.5 h-10">
          {streakBars.map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-full rounded-sm transition-all duration-500",
                  bar.isToday && !bar.active && "border border-dashed border-borderMuted",
                )}
                style={{
                  height: bar.active ? "100%" : bar.isToday ? "30%" : "20%",
                  background: bar.active
                    ? bar.isToday
                      ? "var(--color-brand)"
                      : "rgba(91,59,255,0.45)"
                    : "transparent",
                  minHeight: "4px",
                }}
              />
              <span className={cn(
                "text-[9px]",
                bar.isToday ? "text-brand-light font-semibold" : "text-textDim"
              )}>
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyGoals;
