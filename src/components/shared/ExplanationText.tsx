// src/components/shared/ExplanationText.tsx
//
// Renders explanation text that may contain LaTeX delimited by $$...$$
// (display math) or $...$ (inline math), mixed with plain text. Falls
// back to plain text for explanations with no LaTeX at all — cheap
// early exit so the ~600+ explanations WITHOUT LaTeX pay zero cost.
//
// KaTeX CSS is loaded via src/lib/katex-styles.ts (pulled in here and
// in renderQuestionText.tsx) so landing/auth routes skip that CSS on FCP.
//
import "../../lib/katex-styles";

import React from "react";
import katex from "katex";

function renderMathToHtml(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      strict: "ignore",
      trust: false,
      displayMode,
    });
  } catch {
    return latex; // fall back to raw text if KaTeX itself throws
  }
}

export function ExplanationText({ text }: { text: string | null | undefined }) {
  if (!text) return null;

  // No "$" at all means no LaTeX in this explanation — skip everything else.
  if (!text.includes("$")) {
    return <>{text}</>;
  }

  // Split on $$...$$ (display) and $...$ (inline), keeping surrounding
  // plain text intact. $$...$$ must be checked before $...$, since a
  // naive $...$ pattern would otherwise incorrectly match INSIDE a
  // $$...$$ block.
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
          const html = renderMathToHtml(part.slice(2, -2), true);
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        }
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const html = renderMathToHtml(part.slice(1, -1), false);
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}