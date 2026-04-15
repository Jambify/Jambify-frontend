import React from 'react';
import { cn } from '../../lib/utils';
import type { Question } from '../../Types';

interface QuestionRowProps {
  question:   Question;
  isExpanded: boolean;
  onToggle:   () => void;
}

const SUBJ_COLORS: Record<string, string> = {
  English:     '#7B5FFF', Mathematics: '#00C896',
  Physics:     '#FFB020', Chemistry:   '#FF4D6D',
  Biology:     '#00C896', Economics:   '#FFB020',
};

const DIFF_CLS: Record<string, string> = {
  Easy:   'text-success bg-success/10 border-success/20',
  Medium: 'text-warn bg-warn/10 border-warn/20',
  Hard:   'text-danger bg-danger/10 border-danger/20',
};

const LETTERS = ['A', 'B', 'C', 'D'];

const QuestionRow: React.FC<QuestionRowProps> = ({ question: q, isExpanded, onToggle }) => {
  const subjColor = SUBJ_COLORS[q.subject] ?? '#7B5FFF';

  return (
    <div className={cn(
      'bg-bgCard border rounded-brand-lg overflow-hidden transition-all duration-200',
      isExpanded ? 'border-white/12' : 'border-borderMuted hover:border-white/10',
    )}>

      {/* <── Row header — always visible ── */}
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={onToggle}
      >
        {/* <Subject colour strip */}
        <div
          className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
          style={{ background: subjColor }}
        />

        <div className="flex-1 min-w-0">
          {/* <Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full border"
              style={{ color: subjColor, background: subjColor + '18', borderColor: subjColor + '40' }}
            >
              {q.subject}
            </span>
            <span className="text-[11px] font-mono text-textDim">{q.year}</span>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border', DIFF_CLS[q.difficulty])}>
              {q.difficulty}
            </span>
            <span className="text-[11px] text-textDim hidden sm:inline">{q.topic}</span>
          </div>

          {/* <Question text preview */}
          <p className={cn('text-sm text-textMain leading-relaxed', !isExpanded && 'line-clamp-2')}>
            {q.text}
          </p>
        </div>

        {/* <Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          className={cn('text-textDim shrink-0 mt-1 transition-transform duration-200', isExpanded && 'rotate-180')}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* <── Expanded — options + answer + explanation ── */}
      {isExpanded && (
        <div className="border-t border-borderMuted px-4 pb-4 pt-4 animate-slideDown">

          {/* <Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {q.options.map((opt, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-2.5 px-3 py-2.5 rounded-brand border text-sm transition-all',
                  i === q.answer
                    ? 'bg-success/10 border-success text-textMain'
                    : 'bg-bgSurface border-borderMuted text-textMuted',
                )}
              >
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                  i === q.answer
                    ? 'bg-success text-white'
                    : 'bg-bgCard border border-borderMuted text-textDim',
                )}>
                  {i === q.answer ? '✓' : LETTERS[i]}
                </span>
                <span className="leading-relaxed">{opt}</span>
              </div>
            ))}
          </div>

          {/* <Explanation */}
          <div className="bg-brand/5 border-l-[3px] border-l-brand border border-brand/15 rounded-r-brand px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-light mb-1.5">
              Explanation
            </p>
            <p className="text-sm text-textMuted leading-relaxed">{q.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionRow;