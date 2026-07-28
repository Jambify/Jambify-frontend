// src/components/Performance/MockScores.tsx

import React from "react";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { useNavigate } from "react-router";

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
      <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-5">
        <div className="flex h-32 items-center justify-center">
          <div className="text-textDim text-sm">Loading mock scores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bgCard border-borderMuted rounded-brand-lg flex flex-col gap-5 border p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold tracking-tight">
          Mock exam scores
        </h3>
        <button
          onClick={() => navigate("/mock-exams")}
          className="text-brand-light text-xs hover:underline"
        >
          Take mock →
        </button>
      </div>

      {mockScores.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-textDim text-sm">No mock exams taken yet</p>
          <button
            onClick={() => navigate("/mock-exams")}
            className="text-brand-light mt-4 text-xs hover:underline"
          >
            Take your first mock exam →
          </button>
        </div>
      ) : (
        <>
          {/* Latest score hero */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-textDim mb-1 text-[11px] tracking-widest uppercase">
                Latest score
              </p>
              <p className="font-display text-brand-light text-5xl leading-none font-black tracking-tighter">
                {latest}
              </p>
              <p className="text-textDim mt-1 text-[11px]">out of {MAX}</p>
            </div>
            <div className="text-right">
              <p
                className={`font-display text-xl font-bold ${change >= 0 ? "text-success" : "text-danger"}`}
              >
                {change >= 0 ? "+" : ""}
                {change}
              </p>
              <p className="text-textDim text-[11px]">vs last mock</p>
              {gap > 0 && (
                <p className="text-warn mt-1 text-[11px]">
                  {gap} pts to target
                </p>
              )}
              {gap <= 0 && (
                <p className="text-success mt-1 text-[11px]">
                  Target reached! 🎉
                </p>
              )}
            </div>
          </div>

          {/* Progress toward target */}
          <div>
            <div className="text-textDim mb-1.5 flex justify-between text-[11px]">
              <span>Progress to target ({TARGET})</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="bg-bgSurface h-2 overflow-hidden rounded-full">
              <div
                className="bg-brand h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Score trend bars - limited to last 10 for better UI */}
          {recentScores.length > 0 && (
            <div>
              <p className="text-textDim mb-2 text-[11px]">Score trend</p>
              <div className="flex h-16 items-end gap-2 overflow-x-auto pb-2">
                {recentScores.map((score, i) => {
                  const maxScore = Math.max(...recentScores, TARGET);
                  const minScore = Math.min(...recentScores, 200);
                  const heightPercent =
                    ((score - minScore) / (maxScore - minScore)) * 100;
                  // const isTarget = false;

                  return (
                    <div
                      key={i}
                      className="flex min-w-8 flex-col items-center gap-1"
                    >
                      <span className="text-brand-light font-mono text-[9px]">
                        {score}
                      </span>
                      <div
                        className="bg-brand w-full rounded-t-[3px] transition-all duration-700"
                        style={{
                          height: `${Math.max(heightPercent, 4)}%`,
                          opacity: 0.4 + (i / (recentScores.length - 1)) * 0.6,
                          minHeight: "4px",
                        }}
                      />
                      <span className="text-textDim text-[9px]">M{i + 1}</span>
                    </div>
                  );
                })}
                {/* Target column */}
                <div className="flex min-w-8 flex-col items-center gap-1">
                  <span className="text-success font-mono text-[9px]">
                    {TARGET}
                  </span>
                  <div
                    className="border-success/40 w-full rounded-t-[3px] border-2 border-dashed"
                    style={{ minHeight: "30px", height: "100%" }}
                  />
                  <span className="text-success text-[9px]">Target</span>
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
