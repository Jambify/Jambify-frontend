// src/components/Performance/MockScores.tsx

import React from "react";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { useNavigate } from "react-router-dom";

const TARGET = 280;
const MAX = 400;

const MockScores: React.FC = () => {
  const navigate = useNavigate();
  const { mockScores, isLoading } = usePerformanceStore();

  // Get only the last 10 mock scores to prevent overflow
  const recentScores = mockScores.slice(-10);
  const latest = recentScores[recentScores.length - 1] ?? 0;
  const prev = recentScores[recentScores.length - 2] ?? latest;
  const change = latest - prev;
  const gap = TARGET - latest;
  const progressPercent = Math.min(Math.round((latest / TARGET) * 100), 100);

  if (isLoading) {
    return (
      <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
        <div className="flex items-center justify-center h-32">
          <div className="text-textDim text-sm">Loading mock scores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold tracking-tight">
          Mock exam scores
        </h3>
        <button
          onClick={() => navigate("/mock-exams")}
          className="text-xs text-brand-light hover:underline"
        >
          Take mock →
        </button>
      </div>

      {mockScores.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-textDim text-sm">No mock exams taken yet</p>
          <button
            onClick={() => navigate("/mock-exams")}
            className="mt-4 text-xs text-brand-light hover:underline"
          >
            Take your first mock exam →
          </button>
        </div>
      ) : (
        <>
          {/* Latest score hero */}
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

          {/* Progress toward target */}
          <div>
            <div className="flex justify-between text-[11px] text-textDim mb-1.5">
              <span>Progress to target ({TARGET})</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-bgSurface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Score trend bars - limited to last 10 for better UI */}
          {recentScores.length > 0 && (
            <div>
              <p className="text-[11px] text-textDim mb-2">Score trend</p>
              <div className="flex items-end gap-2 h-16 overflow-x-auto pb-2">
                {recentScores.map((score, i) => {
                  const maxScore = Math.max(...recentScores, TARGET);
                  const minScore = Math.min(...recentScores, 200);
                  const heightPercent = ((score - minScore) / (maxScore - minScore)) * 100;
                  // const isTarget = false;
                  
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 min-w-8">
                      <span className="font-mono text-[9px] text-brand-light">
                        {score}
                      </span>
                      <div
                        className="w-full rounded-t-[3px] bg-brand transition-all duration-700"
                        style={{
                          height: `${Math.max(heightPercent, 4)}%`,
                          opacity: 0.4 + (i / (recentScores.length - 1)) * 0.6,
                          minHeight: "4px",
                        }}
                      />
                      <span className="text-[9px] text-textDim">M{i + 1}</span>
                    </div>
                  );
                })}
                {/* Target column */}
                <div className="flex flex-col items-center gap-1 min-w-8">
                  <span className="font-mono text-[9px] text-success">{TARGET}</span>
                  <div
                    className="w-full rounded-t-[3px] border-2 border-dashed border-success/40"
                    style={{ minHeight: "30px", height: "100%" }}
                  />
                  <span className="text-[9px] text-success">Target</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MockScores;
