import React from "react";
import { useQuizStore } from "../../Store/useQuizStore";
import OptionButton from "./OptionButton";
import ExplanationBox from "./Explanation";
import { useState } from "react";
import Button from "../ui/Button";
import ReportQuestionButton from "../shared/ReportQuestionButton";
import { sanitizeQuestionText } from "../../lib/sanitize-html";
import { formatScienceText, SCIENCE_SUBJECTS } from "../../lib/utils/formatScienceText";

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

  // --- Format question text for science subjects ---
  let formattedText = q.text;
  if (SCIENCE_SUBJECTS.includes(q.subject)) {
    formattedText = formatScienceText(q.text);
  }

  return (
    <div className="animate-fadeIn">
      {/* Card */}
      <div className="bg-bgCard border-borderMuted rounded-brand-xl mb-4 border p-5 sm:p-7">
        {/* Meta row */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${subjStyle.bg} ${subjStyle.text}`}
          >
            {q.subject}
          </span>
          <span className="text-textDim font-mono text-[11px]">
            JAMB {q.year}
          </span>
          <span
            className={`text-[11px] ${DIFF_STYLES[q.difficulty] ?? "text-textDim"}`}
          >
            ● {q.difficulty}
          </span>
          <span className="text-textDim ml-auto hidden max-w-[30%] truncate text-[11px] sm:inline">
            Topic: {q.topic}
          </span>
          {/* Report button — anchored to the question itself, always visible without scrolling */}
          <ReportQuestionButton questionId={q.id} context="quiz" compact />
        </div>

        {/* Question text - with science formatting */}
        <p
          className="text-textMain mb-6 text-base leading-relaxed font-normal sm:text-lg"
          dangerouslySetInnerHTML={{
            __html: sanitizeQuestionText(formattedText, q.subject),
          }}
        />

        {/* Options */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {q.options.map((opt, i) => {
            // Also format options for science subjects
            let formattedOpt = opt;
            if (SCIENCE_SUBJECTS.includes(q.subject)) {
              formattedOpt = formatScienceText(opt);
            }
            return (
              <OptionButton
                key={i}
                index={i}
                text={formattedOpt}
                chosen={chosen}
                correct={q.answer}
                answered={hasAnswered}
                onSelect={() => !hasAnswered && submitAnswer(currentIndex, i)}
              />
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      <ExplanationBox visible={hasAnswered} text={q.explanation} />

      {/* Actions row */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {/* Hint button */}
        <div className="flex flex-col gap-3">
          {!hasAnswered && (
            <button
              className="text-brand-light border-brand/25 hover:bg-brand/10 rounded-brand flex w-fit items-center gap-1.5 border px-3 py-2 text-xs transition-all"
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
            <div className="animate-fadeIn rounded-brand bg-brand-dim border-brand/20 text-textMain border p-3 text-sm leading-relaxed italic">
              <span className="text-brand-light mr-1 font-bold">Hint:</span>
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