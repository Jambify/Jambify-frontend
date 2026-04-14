import React from 'react';
import type { Subject } from '../../Store/useSubjectStore';
import { cn } from '../../lib/utils';

interface SubjectCardProps {
  subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const isCritical = subject.accuracy < 50;

  return (
    <div className="bg-bgCard border border-borderMuted p-5 rounded-brand-xl hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-6">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
        >
          {subject.icon}
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-textDim font-bold">National Rank</p>
          <p className="text-lg font-display font-black text-textMain">#{subject.rank}</p>
        </div>
      </div>

      <h3 className="font-display text-lg font-bold text-textMain mb-1">{subject.name}</h3>
      
      <div className="flex items-end justify-between mb-2">
        <p className={cn(
          "text-3xl font-black tracking-tighter",
          isCritical ? "text-danger" : "text-brand-light"
        )}>
          {subject.accuracy}%
        </p>
        <p className="text-[11px] text-textDim mb-1">Accuracy</p>
      </div>

      {/* Accuracy Bar with Glow */}
      <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000"
          style={{ 
            width: `${subject.accuracy}%`, 
            backgroundColor: subject.color,
            boxShadow: `0 0 12px ${subject.color}80` 
          }}
        />
      </div>
    </div>
  );
};

export default SubjectCard;