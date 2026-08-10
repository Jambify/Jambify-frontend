// src/utils/renderQuestionText.tsx
import React from "react";

/**
 * Parses [bracketed] text and renders it with a real underline instead of
 * literal square brackets. Everything else passes through unchanged.
 *
 * Usage: <p>{renderQuestionText(question.text)}</p>
 */
export function renderQuestionText(text: string): React.ReactNode[] {
  const parts = text.split(/(\[[^\[\]]+\])/g);

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