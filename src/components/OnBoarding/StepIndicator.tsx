import React from 'react';
import { cn } from '../../lib/utils';

interface StepIndicatorProps {
  current: number;
  total:   number;
}

// Updated labels - removed "Your name" since it's now 3 steps
const STEP_LABELS = ['University', 'Subjects', 'Target'];

const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total }) => (
  <div className="mb-6">
    {/* Step dots + connecting lines */}
    <div className="flex items-center gap-0 mb-3">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum   = i + 1;
        const isDone    = stepNum < current;
        const isCurrent = stepNum === current;

        return (
          <React.Fragment key={i}>
            {/* Dot */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 border',
              isDone
                ? 'bg-green-500 border-green-500 text-white'
                : isCurrent
                  ? 'bg-brand border-brand text-white shadow-lg shadow-brand/30'
                  : 'bg-white/10 border-white/20 text-textDim',
            )}>
              {isDone ? '✓' : stepNum}
            </div>

            {/* Connecting line — not after last step */}
            {i < total - 1 && (
              <div className={cn(
                'flex-1 h-0.5 transition-all duration-500',
                stepNum < current ? 'bg-green-500' : 'bg-white/10',
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
              'flex-1 text-center text-[10px] font-medium uppercase tracking-wider transition-colors',
              isCurrent ? 'text-brand'
              : isDone   ? 'text-green-500'
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