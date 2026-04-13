import React from 'react';
import { cn } from '../../lib/utils';

interface OptionButtonProps {
  index:    number;
  text:     string;
  chosen:   number;   // -1 if nothing chosen yet
  correct:  number;   // index of correct answer
  answered: boolean;
  onSelect: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

const OptionButton: React.FC<OptionButtonProps> = ({
  index, text, chosen, correct, answered, onSelect,
}) => {
  const isChosen  = chosen === index;
  const isCorrect = correct === index;

  /** Derive visual state */
  type State = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';
  const state: State = !answered
    ? isChosen ? 'selected' : 'idle'
    : isCorrect
      ? 'correct'
      : isChosen
        ? 'wrong'
        : 'dimmed';

  const OUTER = {
    idle:     'bg-bgSurface border-borderMuted hover:border-white/20 hover:bg-bgCard cursor-pointer active:scale-[0.99]',
    selected: 'bg-brand/10 border-brand cursor-pointer ring-1 ring-brand/30',
    correct:  'bg-success/10 border-success pointer-events-none',
    wrong:    'bg-danger/10 border-danger pointer-events-none',
    dimmed:   'bg-bgSurface border-borderMuted opacity-40 pointer-events-none',
  };

  const LETTER_BG = {
    idle:     'bg-bgCard border-borderMuted text-textMuted',
    selected: 'bg-brand border-brand text-white',
    correct:  'bg-success border-success text-white',
    wrong:    'bg-danger border-danger text-white',
    dimmed:   'bg-bgCard border-borderMuted text-textDim',
  };

  const ICON = {
    correct: '✓',
    wrong:   '✕',
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-start gap-3 p-3.5 sm:p-4 rounded-brand border text-left',
        'transition-all duration-150',
        OUTER[state],
      )}
    >
    {/* Letter badge */}
      <span className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold',
        'border flex-shrink-0 transition-all duration-150',
        LETTER_BG[state],
      )}>
        {state === 'correct' || state === 'wrong'
          ? ICON[state]
          : LETTERS[index]}
      </span>

      
      
      <span className="text-sm leading-relaxed pt-0.5 text-textMain">
        {text}
      </span>
    </button>
  );
};

export default OptionButton;