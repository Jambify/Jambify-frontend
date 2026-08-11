// src/utils/renderQuestionText.tsx
import React from "react";
import { formatScienceText, SCIENCE_SUBJECTS } from "./formatScienceText";

/**
 * Parses [bracketed] text and renders it with a real underline instead of
 * literal square brackets. Everything else passes through unchanged.
 *
 * If `subject` is Chemistry, Physics, or Mathematics, chemistry/math
 * notation (subscripts, superscripts, reaction arrows) is converted to
 * real Unicode characters first — see formatScienceText.ts for scope
 * and known limitations.
 *
 * Usage: <p>{renderQuestionText(question.text, question.subject)}</p>
 */
export function renderQuestionText(text: string, subject?: string): React.ReactNode[] {
  const prepared =
    subject && SCIENCE_SUBJECTS.includes(subject) ? formatScienceText(text) : text;

  const parts = prepared.split(/(\[[^\[\]]+\])/g);

  return parts.map((part, i) => {
    const match = part.match(/^\[([^\[\]]+)\]$/);
    if (match) {
      return (
        <span key={i} className="underline decoration-2 underline-offset-2">
          {match[1]}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}