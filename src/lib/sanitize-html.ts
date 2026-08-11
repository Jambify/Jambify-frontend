import DOMPurify from "dompurify";
import { formatScienceText, SCIENCE_SUBJECTS } from "./utils/formatScienceText";

let purifyInstance: typeof DOMPurify | null = null;

// Initialize DOMPurify only in the browser
if (typeof window !== "undefined") {
  purifyInstance = DOMPurify;
}

export function sanitizeHtml(html: string): string {
  if (!purifyInstance) return html; // Fallback for SSR
  return purifyInstance.sanitize(html, {
    ALLOWED_TAGS: ["em", "strong", "br", "p", "u"], // "u" added — needed for [bracket] underline rendering
    ALLOWED_ATTR: ["class"],
  });
}

export function sanitizeQuestionText(text: string, subject?: string): string {
  // Apply chemistry/math subscript+arrow formatting first (Chemistry,
  // Physics, Mathematics only — see formatScienceText.ts for scope/limits),
  // then our existing bold/italic/underline replacements, then sanitize.
  const scienceFormatted =
    subject && SCIENCE_SUBJECTS.includes(subject) ? formatScienceText(text) : text;

  const formattedText = scienceFormatted
    .replace(/\*\*(.*?)\*\*/g, '<em class="font-semibold text-brand">$1</em>')
    .replace(/\*(.*?)\*/g, '<em class="text-brand">$1</em>')
    .replace(
      /\[([^\[\]]+)\]/g,
      '<u class="underline decoration-2 underline-offset-4 decoration-brand">$1</u>',
    );
  return sanitizeHtml(formattedText);
}