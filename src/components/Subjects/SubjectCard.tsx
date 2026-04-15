import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Subject } from '../../Store/useSubjectStore';
import TopicList from './SubjectTopic';
import { cn } from '../../lib/utils';

interface SubjectCardProps {
  subject:    Subject;
  isExpanded: boolean;
  onToggle:   () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, isExpanded, onToggle }) => {
  const navigate    = useNavigate();
  const progressPct = Math.round((subject.completed / subject.total) * 100);

  const statusLabel = subject.accuracy < 55
    ? { text: 'Needs work', cls: 'bg-danger/10 text-danger border-danger/20'  }
    : subject.accuracy < 75
      ? { text: 'In progress', cls: 'bg-warn/10 text-warn border-warn/20'       }
      : { text: 'On track',   cls: 'bg-success/10 text-success border-success/20' };

  return (
    <div className={cn(
      'bg-bgCard border rounded-brand-lg overflow-hidden transition-all duration-200',
      isExpanded ? 'border-white/15' : 'border-borderMuted hover:border-white/10',
    )}>

      {/* <── Card top — always visible ── */}
      <div
        className="p-5 cursor-pointer"
        onClick={onToggle}
      >
        {/* <Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-brand flex items-center justify-center text-xl shrink-0"
              style={{ background: `${subject.color}18` }}
            >
              {subject.icon}
            </div>
            <div>
              <h3 className="font-display font-semibold text-base tracking-tight">
                {subject.name}
              </h3>
              <p className="text-[11px] text-textDim mt-0.5">
                Rank #{subject.rank} nationally
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-[10px] font-medium px-2 py-0.5 rounded border',
              statusLabel.cls,
            )}>
              {statusLabel.text}
            </span>
            {/* <Chevron */}
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              className={cn(
                'text-textDim transition-transform duration-200 shrink-0',
                isExpanded && 'rotate-180',
              )}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        {/* <Big accuracy number */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <p
              className="font-display text-4xl font-black tracking-tighter leading-none"
              style={{ color: subject.color }}
            >
              {subject.accuracy}%
            </p>
            <p className="text-[11px] text-textDim mt-1">accuracy</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-medium text-textMain">
              {subject.completed}<span className="text-textDim">/{subject.total}</span>
            </p>
            <p className="text-[11px] text-textDim mt-0.5">questions done</p>
          </div>
        </div>

        {/* <Accuracy bar */}
        <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${subject.accuracy}%`, background: subject.color }}
          />
        </div>

        {/* <Progress bar */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-textDim">{progressPct}% of questions attempted</span>
        </div>
      </div>

      {/* <── Expanded section — topics + action buttons ── */}
      {isExpanded && (
        <div className="border-t border-borderMuted animate-slideDown">

          {/* <Weak topics */}
          {subject.weakTopics.length > 0 && (
            <div className="px-5 pt-4 pb-2">
              <p className="text-[11px] text-textDim uppercase tracking-widest font-medium mb-2">
                Weak topics
              </p>
              <TopicList topics={subject.weakTopics} color={subject.color} />
            </div>
          )}
{/* 
          <Action buttons */}
          <div className="flex gap-2 px-5 py-4">
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/quiz'); }}
              className="flex-1 py-2 rounded-brand text-xs font-medium text-white transition-all active:scale-[0.98]"
              style={{ background: subject.color }}
            >
              Practise this subject
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/performance'); }}
              className="px-4 py-2 rounded-brand text-xs font-medium bg-bgSurface border border-borderMuted text-textMuted hover:text-textMain hover:border-white/15 transition-all"
            >
              View stats
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectCard;