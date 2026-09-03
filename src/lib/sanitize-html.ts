import DOMPurify from "dompurify";
import katex from "katex";
import { formatScienceText, SCIENCE_SUBJECTS } from "./utils/formatScienceText";

let purifyInstance: typeof DOMPurify | null = null;

// Initialize DOMPurify only in the browser
if (typeof window !== "undefined") {
  purifyInstance = DOMPurify;
}

// Matches $$...$$ (display) and $...$ (inline), non-greedy, with escaped $ allowed
const KATEX_BLOCK_RE = /\$\$([\s\S]+?)\$\$/g;
const KATEX_INLINE_RE = /\$([^\n$]+?)\$/g;

function sanitizeHtml(html: string): string {
  if (!purifyInstance) return html; // Fallback for SSR
  return purifyInstance.sanitize(html, {
    // Allow KaTeX's span tags plus math styling classes alongside our custom
    ALLOWED_TAGS: ["em", "strong", "br", "p", "u", "span", "semantics", "annotation", "annotation-xml", "mrow", "mn", "mo", "mi", "msup", "msub", "mfrac", "msqrt", "mtext", "mpadded", "mspace", "mover", "munder", "munderover", "msubsup", "mtable", "mtr", "mtd", "mlabeledtr", "mglyph", "menclose", "mstack", "mlongdiv", "mscarries", "mscarry", "msgroup", "msrow", "mstacklongdiv", "maction", "math"],
    ALLOWED_ATTR: ["class", "style", "aria-hidden", "role", "display", "xmlns", "href", "title"],
    ADD_TAGS: ["svg", "path", "line", "rect", "defs", "clippath", "g", "polyline", "polygon", "circle", "ellipse"],
    ADD_ATTR: ["viewBox", "d", "x", "y", "cx", "cy", "r", "rx", "ry", "width", "height", "stroke", "stroke-width", "fill", "fill-rule", "stroke-linecap", "stroke-linejoin", "points", "transform", "clip-path", "version", "xmlns:xlink", "preserveAspectRatio"],
  });
}

export function sanitizeQuestionText(text: string, subject?: string): string {
  // ---- Step 0: Extract all KaTeX segments FIRST ----
  // We pull KaTeX out before touching any bold/italic/science formatting so the regex engines
  // never see the $...$ content (prevents accidental bold/underline matches inside formulas).
  const katexFragments: string[] = [];
  let protectedText: string = text ?? "";

  // Replace block $$...$$ first (more specific pattern)
  protectedText = protectedText.replace(KATEX_BLOCK_RE, (_match, latex: string) => {
    katexFragments.push(renderKatexHtml(latex, true));
    return `{{__KATEX_FRAGMENT_${katexFragments.length - 1}__}}`;
  });

  // Then replace inline $...$
  protectedText = protectedText.replace(KATEX_INLINE_RE, (_match, latex: string) => {
    katexFragments.push(renderKatexHtml(latex, false));
    return `{{__KATEX_FRAGMENT_${katexFragments.length - 1}__}}`;
  });

  // ---- Step 1: Apply chemistry/math subscript+arrow formatting ----
  const scienceFormatted =
    subject && SCIENCE_SUBJECTS.includes(subject) ? formatScienceText(protectedText) : protectedText;

  // ---- Step 2: Apply existing **bold / *italic / [english-bracket]underline markdown transforms ----
  let formattedHtml = scienceFormatted
    .replace(/\*\*(.*?)\*\*/g, '<em class="font-semibold text-brand">$1</em>')
    .replace(/\*(.*?)\*/g, '<em class="text-brand">$1</em>')
    .replace(
      /\[([^\[\]]+)\]/g,
      (match, content: string) => {
        // For English -> underline; for other subjects keep literal [brackets] annotation
        // (This was the bug we fixed previously: don't underline Physics [g = 10 m/s²] annotations)
        if (subject === "English") {
          return `<u class="underline decoration-2 underline-offset-4 decoration-brand">${content}</u>`;
        }
        return match; // leave brackets intact
      },
    );

  // ---- Step 3: Splice the KaTeX HTML back in ----
  for (let i = 0; i < katexFragments.length; i++) {
    const placeholder = `{{__KATEX_FRAGMENT_${i}__}}`;
    while (formattedHtml.includes(placeholder)) {
      formattedHtml = formattedHtml.replace(placeholder, katexFragments[i]);
    }
  }

  // ---- Step 4: Sanitize combined HTML (DOMPurify allows KaTeX's span/svg/math tags) ----
  return sanitizeHtml(formattedHtml);
}

function renderKatexHtml(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
      output: "htmlAndMathml",
    });
  } catch (e) {
    // If KaTeX fails, return original wrapped in a code span so user still sees input
    const escaped = (latex ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<span class="bg-danger/10 text-danger px-1 rounded font-mono text-xs">${displayMode ? "$$" : "$"}${escaped}${displayMode ? "$$" : "$"}</span>`;
  }
}