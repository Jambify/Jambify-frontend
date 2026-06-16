import React from "react";
import { cn } from "../../lib/utils/utils";

interface StepIndicatorProps {
  current: number;
  total: number;
}

// Updated labels - removed "Your name" since it's now 3 steps
const STEP_LABELS = ["University", "Subjects", "Target"];

const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total }) => (
  <div className="mb-6">
    {/* Step dots + connecting lines */}
    <div className="mb-3 flex items-center gap-0">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isCurrent = stepNum === current;

        return (
          <React.Fragment key={i}>
            {/* Dot */}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300",
                isDone
                  ? "border-success bg-success text-white"
                  : isCurrent
                    ? "bg-brand border-brand shadow-brand/30 text-white shadow-lg"
                    : "bg-bgSurface border-borderMuted text-textDim",
              )}
            >
              {isDone ? "✓" : stepNum}
            </div>

            {/* Connecting line — not after last step */}
            {i < total - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 transition-all duration-500",
                  stepNum < current ? "bg-success" : "bg-borderMuted",
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>

    {/* Step labels */}
    <div className="flex items-center">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isCurrent = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div
            key={label}
            className={cn(
              "flex-1 text-center text-[10px] font-medium tracking-wider uppercase transition-colors",
              isCurrent
                ? "text-brand"
                : isDone
                  ? "text-success"
                  : "text-textDim",
            )}
          >
            {label}
          </div>
        );
      })}
    </div>
  </div>
);

export default StepIndicator;
