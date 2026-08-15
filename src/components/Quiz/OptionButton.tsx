import React from "react";
import { cn } from "../../lib/utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import { renderQuestionText } from "../../lib/utils/renderQuestionText";

interface OptionButtonProps {
  index: number;
  text: string;
  subject?: string;
  chosen: number; // -1 if nothing chosen yet
  correct: number; // index of correct answer
  answered: boolean;
  onSelect: () => void;
}

const LETTERS = ["A", "B", "C", "D"];

const OptionButton: React.FC<OptionButtonProps> = ({
  index,
  text,
  subject,
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
    selected:
      "bg-brand/10 border-brand cursor-pointer ring-4 ring-brand/5 shadow-brand/10 shadow-xl",
    correct:
      "bg-success/10 border-success pointer-events-none shadow-success/10 shadow-xl",
    wrong:
      "bg-danger/10 border-danger pointer-events-none shadow-danger/10 shadow-xl",
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
        "group flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left lg:p-5",
        "transition-all duration-200",
        OUTER[state],
      )}
    >
      {/* Letter badge */}
      <span
        className={cn(
          "font-display flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black lg:h-12 lg:w-12 lg:text-base",
          "shrink-0 border-2 transition-all duration-200",
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
        <span
          className={cn(
            "text-sm font-bold transition-colors lg:text-base",
            state === "selected"
              ? "text-brand"
              : state === "correct"
                ? "text-success"
                : state === "wrong"
                  ? "text-danger"
                  : "text-textMain",
          )}
        >
          {renderQuestionText(text, subject)}
        </span>
      </div>

      {!answered && (
        <span className="text-textDim hidden text-[10px] font-black tracking-tighter uppercase opacity-0 transition-opacity group-hover:opacity-100 lg:block">
          Key {LETTERS[index]}
        </span>
      )}
    </motion.button>
  );
};

export default OptionButton;
