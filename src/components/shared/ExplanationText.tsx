// src/components/shared/ExplanationText.tsx
//
// Renders explanation text that may contain LaTeX delimited by $$...$$
// (display math) or $...$ (inline math), mixed with plain text. Falls
// back to plain text for explanations with no LaTeX at all — cheap
// early exit so the ~600+ explanations WITHOUT LaTeX pay zero cost.
//
// SETUP REQUIRED (one-time):
//   1. npm install katex
//   2. Add this import once near the top of your app entry (e.g.
//      src/main.tsx), not per-component:
//        import "katex/dist/katex.min.css";
//
// SCOPE: this is separate from formatScienceText.ts / renderQuestionText.tsx
// (which handle Unicode subscripts/arrows in `text`/`options`). This
// component is specifically for `explanation`, which contains real LaTeX
// syntax rather than plain-text formulas.
//
// Security note: KaTeX is configured with trust: false, which disables
// LaTeX commands capable of embedding arbitrary HTML/URLs (\href, \url,
// \includegraphics, etc. are stripped/ignored) — this is KaTeX's own
// built-in guard against untrusted input. Used here instead of a
// DOMPurify pass, since KaTeX's rendered output is dense with span/svg
// markup that a generic HTML allowlist would otherwise strip apart.

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