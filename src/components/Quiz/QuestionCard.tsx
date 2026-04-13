import React from "react";
import { useQuizStore } from "../../Store/useQuizStore";
import OptionButton from "./OptionButton";
import ExplanationBox from "./Explanation";
import { useState } from "react";
import Button from "../ui/Button";

const SUBJ_STYLES: Record<string, { bg: string; text: string }> = {
  English: { bg: "bg-brand/10", text: "text-brand-light" },
  Mathematics: { bg: "bg-success/10", text: "text-success" },
  Physics: { bg: "bg-warn/10", text: "text-warn" },
  Chemistry: { bg: "bg-danger/10", text: "text-danger" },
  Biology: { bg: "bg-success/10", text: "text-success" },
};

const DIFF_STYLES: Record<string, string> = {
  Easy: "text-success",
  Medium: "text-warn",
  Hard: "text-danger",
};

const QuestionCard: React.FC = () => {
  const [showHint, setShowHint] = useState(false);
  const { questions, currentIndex, answers, hasAnswered, submitAnswer, next } =
    useQuizStore();

  const q = questions[currentIndex];
  const chosen = answers[currentIndex] ?? -1;
  const isLast = currentIndex === questions.length - 1;
  const subjStyle = SUBJ_STYLES[q?.subject] ?? SUBJ_STYLES.English;

  if (!q) return null;

  return (
    <div className="animate-fadeIn">
      {/* Card */}
      <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-5 sm:p-7 mb-4">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${subjStyle.bg} ${subjStyle.text}`}
          >
            {q.subject}
          </span>
          <span className="text-[11px] font-mono text-textDim">
            JAMB {q.year}
          </span>
          <span
            className={`text-[11px] ${DIFF_STYLES[q.difficulty] ?? "text-textDim"}`}
          >
            ● {q.difficulty}
          </span>
          <span className="text-[11px] text-textDim ml-auto hidden sm:inline">
            Topic: {q.topic}
          </span>
        </div>

        {/* Question text */}
        <p className="text-base sm:text-lg font-normal leading-relaxed text-textMain mb-6">
          {q.text}
        </p>
        {/*<{/* Options */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {q.options.map((opt, i) => (
            <OptionButton
              key={i}
              index={i}
              text={opt}
              chosen={chosen}
              correct={q.answer}
              answered={hasAnswered}
              onSelect={() => !hasAnswered && submitAnswer(currentIndex, i)}
            />
          ))}
        </div>
      </div>

      {/* Explanation */}
      <ExplanationBox visible={hasAnswered} text={q.explanation} />

      {/* Actions row */}
      <div className="flex items-center justify-between gap-3 mt-4">
        {/*   <{/* Hint button */}
        <div className="flex flex-col gap-3">
          {!hasAnswered && (
            <button
              className="flex w-fit items-center gap-1.5 text-xs text-brand-light border border-brand/25 hover:bg-brand/10 px-3 py-2 rounded-brand transition-all"
              onClick={() => setShowHint(!showHint)}
            >
              💡{" "}
              <span className="hidden sm:inline">
                {showHint ? "Hide hint" : "Show hint"}
              </span>
            </button>
          )}

          {/* Real Message / Inline Hint */}
          {showHint && !hasAnswered && (
            <div className="animate-fadeIn p-3 rounded-brand bg-brand-dim border border-brand/20 text-sm text-textMain leading-relaxed italic">
              <span className="font-bold text-brand-light mr-1">Hint:</span>
              {q.explanation.split(".")[0] + "."}
            </div>
          )}
        </div>

        {hasAnswered && (
          <Button
            variant="primary"
            size="md"
            className="ml-auto"
            onClick={next}
            iconRight={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            }
          >
            {isLast ? "See results" : "Next question"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
