import React from "react";
import { cn } from "../../lib/utils/utils";
import { motion, AnimatePresence } from "framer-motion";

interface OptionButtonProps {
  index: number;
  text: string;
  chosen: number; // -1 if nothing chosen yet
  correct: number; // index of correct answer
  answered: boolean;
  onSelect: () => void;
}

const LETTERS = ["A", "B", "C", "D"];

const OptionButton: React.FC<OptionButtonProps> = ({
  index,
  text,
  chosen,
  correct,
  answered,
  onSelect,
}) => {
  const isChosen = chosen === index;
  const isCorrect = correct === index;

  /** Derive visual state */
  type State = "idle" | "selected" | "correct" | "wrong" | "dimmed";
  const state: State = !answered
    ? isChosen
      ? "selected"
      : "idle"
    : isCorrect
      ? "correct"
      : isChosen
        ? "wrong"
        : "dimmed";

  const OUTER = {
    idle: "bg-bgSurface border-borderMuted hover:border-brand/40 hover:bg-bgCard hover:shadow-lg cursor-pointer active:scale-[0.98]",
    selected: "bg-brand/10 border-brand cursor-pointer ring-4 ring-brand/5 shadow-brand/10 shadow-xl",
    correct: "bg-success/10 border-success pointer-events-none shadow-success/10 shadow-xl",
    wrong: "bg-danger/10 border-danger pointer-events-none shadow-danger/10 shadow-xl",
    dimmed: "bg-bgSurface border-borderMuted opacity-40 pointer-events-none",
  };

  const LETTER_BG = {
    idle: "bg-bgCard border-borderMuted text-textDim group-hover:border-brand/50 group-hover:text-brand",
    selected: "bg-brand border-brand text-white",
    correct: "bg-success border-success text-white",
    wrong: "bg-danger border-danger text-white",
    dimmed: "bg-bgCard border-borderMuted text-textDim",
  };

  const ICON = {
    correct: "✓",
    wrong: "✕",
  };

  return (
    <motion.button
      whileHover={!answered ? { x: 4 } : {}}
      onClick={onSelect}
      className={cn(
        "group w-full flex items-center gap-4 p-4 lg:p-5 rounded-2xl border-2 text-left",
        "transition-all duration-200",
        OUTER[state],
      )}
    >
      {/* Letter badge */}
      <span
        className={cn(
          "w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-sm lg:text-base font-display font-black",
          "border-2 shrink-0 transition-all duration-200",
          LETTER_BG[state],
        )}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={state}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            {state === "correct" || state === "wrong"
              ? ICON[state]
              : LETTERS[index]}
          </motion.span>
        </AnimatePresence>
      </span>

      <div className="flex-1">
        <span className={cn(
          "text-sm lg:text-base font-bold transition-colors",
          state === "selected" ? "text-brand" : state === "correct" ? "text-success" : state === "wrong" ? "text-danger" : "text-textMain"
        )}>
          {text}
        </span>
      </div>

      {!answered && (
        <span className="hidden lg:block text-[10px] font-black text-textDim opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
          Key {LETTERS[index]}
        </span>
      )}
    </motion.button>
  );
};

export default OptionButton;
