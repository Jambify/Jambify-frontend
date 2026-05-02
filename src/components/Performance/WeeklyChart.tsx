// src/components/Performance/WeeklyChart.tsx

import React from "react";
import { usePerformanceStore } from "../../Store/usePerformanceStore";

const WeeklyChart: React.FC = () => {
  const { weeklyActivity } = usePerformanceStore();
  const max = Math.max(...weeklyActivity.map((d) => d.questions), 1);
  const total = weeklyActivity.reduce((s, d) => s + d.questions, 0);

  if (weeklyActivity.length === 0) {
    return (
      <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
        <div className="flex items-center justify-center h-32">
          <p className="text-textDim text-sm">Complete some quizzes to see your activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-sm font-semibold tracking-tight">
            Weekly activity
          </h3>
          <p className="text-[11px] text-textDim mt-0.5">
            {total} questions this week
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold text-brand-light">
            {total}
          </p>
          <p className="text-[11px] text-textDim">total Qs</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2 sm:gap-3 h-28">
        {weeklyActivity.map((day) => {
          const heightPct =
            day.questions === 0 ? 4 : Math.round((day.questions / max) * 100);
          const isEmpty = day.questions === 0;
          return (
            <div
              key={day.day}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
            >
              <span className="text-[10px] text-textDim opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                {day.questions}
              </span>
              <div
                className="w-full rounded-t-sm transition-all duration-700"
                style={{
                  height: `${heightPct}%`,
                  background: isEmpty
                    ? "rgba(255,255,255,0.05)"
                    : `rgba(91,59,255,${0.35 + (day.questions / max) * 0.65})`,
                  border: isEmpty ? "1px solid rgba(255,255,255,0.07)" : "none",
                }}
              />
              <span className="text-[10px] text-textDim">{day.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyChart;