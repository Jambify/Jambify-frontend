// src/components/Performance/WeeklyChart.tsx

import React from "react";
import { usePerformanceStore } from "../../Store/usePerformanceStore";

const WeeklyChart: React.FC = () => {
  const { weeklyActivity } = usePerformanceStore();
  const max = Math.max(...weeklyActivity.map((d) => d.questions), 1);
  const total = weeklyActivity.reduce((s, d) => s + d.questions, 0);

  if (weeklyActivity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-50 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-bgSurface flex items-center justify-center text-2xl grayscale opacity-50">
          📊
        </div>
        <p className="text-textDim text-sm font-medium">
          Complete some quizzes to see your activity
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-display font-black text-textMain tracking-tighter">
              {total}
            </span>
            <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/10 px-2 py-0.5 rounded">
              Total Qs
            </span>
          </div>
          <p className="text-xs text-textDim font-medium italic">
            Questions answered this week
          </p>
        </div>
        
        {/* Trend Indicator (placeholder) */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-success">
            <span className="text-xs font-black">+12%</span>
            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-[6px] border-b-success" />
          </div>
          <span className="text-[10px] text-textDim font-bold uppercase tracking-tighter">Vs last week</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex-1 flex items-end gap-3 sm:gap-4 min-h-45">
        {weeklyActivity.map((day) => {
          const heightPct =
            day.questions === 0 ? 8 : Math.round((day.questions / max) * 100);
          const isEmpty = day.questions === 0;
          return (
            <div
              key={day.day}
              className="flex-1 flex flex-col items-center gap-3 h-full justify-end group cursor-default"
            >
              {/* Tooltip-like value */}
              <div className="relative w-full flex justify-center">
                <span className="absolute -top-8 bg-brand text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg shadow-brand/20 z-10 pointer-events-none">
                  {day.questions} Qs
                </span>
              </div>
              
              <div
                className="w-full rounded-t-xl transition-all duration-1000 ease-out group-hover:brightness-125 group-hover:shadow-[0_0_20px_rgba(91,59,255,0.3)] relative overflow-hidden"
                style={{
                  height: `${heightPct}%`,
                  background: isEmpty
                    ? "rgba(255,255,255,0.03)"
                    : `linear-gradient(to top, rgba(91,59,255,0.4), rgba(123,95,255,0.9))`,
                  border: isEmpty ? "1px dashed rgba(255,255,255,0.1)" : "none",
                }}
              >
                {!isEmpty && (
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-size-[40px_40px] animate-[shimmer_4s_linear_infinite]" />
                )}
              </div>
              <span className="text-[11px] font-bold text-textDim group-hover:text-textMain transition-colors uppercase tracking-tighter">
                {day.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyChart;
