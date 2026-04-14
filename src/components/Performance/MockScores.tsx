import React from "react";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { useNavigate } from "react-router-dom";

const TARGET = 280;
const MAX = 400;

const MockScores: React.FC = () => {
  const navigate = useNavigate();
  const { mockScores } = usePerformanceStore();

  const latest = mockScores[mockScores.length - 1] ?? 0;
  const prev = mockScores[mockScores.length - 2] ?? latest;
  const change = latest - prev;
  const gap = TARGET - latest;

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5 flex flex-col gap-5">
      {/* <Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold tracking-tight">
          Mock exam scores
        </h3>
        <button
          onClick={() => navigate("/mock")}
          className="text-xs text-brand-light hover:underline"
        >
          Take mock →
        </button>
      </div>

      {/* <Latest score hero */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] text-textDim uppercase tracking-widest mb-1">
            Latest score
          </p>
          <p className="font-display text-5xl font-black tracking-tighter text-brand-light leading-none">
            {latest}
          </p>
          <p className="text-[11px] text-textDim mt-1">out of {MAX}</p>
        </div>
        <div className="text-right">
          <p
            className={`font-display text-xl font-bold ${change >= 0 ? "text-success" : "text-danger"}`}
          >
            {change >= 0 ? "+" : ""}
            {change}
          </p>
          <p className="text-[11px] text-textDim">vs last mock</p>
          {gap > 0 && (
            <p className="text-[11px] text-warn mt-1">{gap} pts to target</p>
          )}
          {gap <= 0 && (
            <p className="text-[11px] text-success mt-1">Target reached! 🎉</p>
          )}
        </div>
      </div>

      {/* <Progress toward target */}
      <div>
        <div className="flex justify-between text-[11px] text-textDim mb-1.5">
          <span>Progress to target ({TARGET})</span>
          <span>{Math.round((latest / TARGET) * 100)}%</span>
        </div>
        <div className="h-2 bg-bgSurface rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-brand transition-all duration-700"
            style={{ width: `${Math.min((latest / TARGET) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* <Score trend bars */}
      <div>
        <p className="text-[11px] text-textDim mb-2">Score trend</p>
        <div className="flex items-end gap-3 h-16">
          {mockScores.map((score, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="font-mono text-[10px] text-brand-light">
                {score}
              </span>
              <div
                className="w-full rounded-t-[3px] bg-brand transition-all duration-700"
                style={{
                  height: `${Math.round(((score - 220) / (Math.max(...mockScores) - 220)) * 100)}%`,
                  opacity: 0.4 + (i / (mockScores.length - 1)) * 0.6,
                }}
              />
              <span className="text-[10px] text-textDim">Mock {i + 1}</span>
            </div>
          ))}
          {/* <Target column */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="font-mono text-[10px] text-success">{TARGET}</span>
            <div
              className="w-full rounded-t-[3px] border-2 border-dashed border-success/40"
              style={{ height: "100%" }}
            />
            <span className="text-[10px] text-success">Target</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockScores;
