import React from 'react';
import { cn } from '../../lib/utils';

interface ExplanationBoxProps {
  visible: boolean;
  text:    string;
}

const ExplanationBox: React.FC<ExplanationBoxProps> = ({ visible, text }) => {
  if (!visible) return null;

  return (
    <div className={cn(
      'border-l-[3px] border-brand rounded-r-brand-lg',
      'bg-brand/5 border border-brand/20 border-l-brand px-4 py-3.5',
      'animate-slideDown',
    )}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">💡</span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-light">
          Explanation
        </span>
      </div>
      <p className="text-sm text-textMuted leading-relaxed">{text}</p>
    </div>
  );
};

export default ExplanationBox;