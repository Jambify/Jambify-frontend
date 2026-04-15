import React from 'react';
import { cn } from '../../lib/utils';

interface StepIndicatorProps {
  current: number;
  total:   number;
}

const STEP_LABELS = ['Your name', 'University', 'Subjects', 'Target'];

const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total }) => (
  <div className="mb-6">
    {/* <Step dots + connecting lines */}
    <div className="flex items-center gap-0 mb-3">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum   = i + 1;
        const isDone    = stepNum < current;
        const isCurrent = stepNum === current;

        return (
          <React.Fragment key={i}>
            {/* <Dot */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 border',
              isDone
                ? 'bg-success border-success text-white'
                : isCurrent
                  ? 'bg-brand border-brand text-white shadow-brand'
                  : 'bg-bgSurface border-borderMuted text-textDim',
            )}>
              {isDone ? '✓' : stepNum}
            </div>

            {/* <Connecting line — not after last step */}
            {i < total - 1 && (
              <div className={cn(
                'flex-1 h-0.5 transition-all duration-500',
                stepNum < current ? 'bg-success' : 'bg-borderMuted',
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>

    {/* Step labels */}
    <div className="flex items-center">
      {STEP_LABELS.map((label, i) => {
        const stepNum   = i + 1;
        const isCurrent = stepNum === current;
        const isDone    = stepNum < current;
        return (
          <div
            key={label}
            className={cn(
              'flex-1 text-center text-[10px] transition-colors',
              isCurrent ? 'text-textMain font-medium'
              : isDone   ? 'text-success'
              : 'text-textDim',
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