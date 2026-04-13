import React from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  emoji: string;
  label: string;
  value: string;
  change: string;
  up?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ emoji, label, value, change, up }) => (
  <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5 hover:border-white/10 transition-colors">
    <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-lg mb-3">
      {emoji}
    </div>
    <p className="text-[11px] text-textDim uppercase tracking-widest font-medium mb-1">
      {label}
    </p>
    <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
    <p className={cn('text-[11px] mt-1', up ? 'text-success' : 'text-textDim')}>
      {up && '↑ '}{change}
    </p>
  </div>
);

export default StatCard;