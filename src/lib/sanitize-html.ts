import DOMPurify from "dompurify";

let purifyInstance: typeof DOMPurify | null = null;

// Initialize DOMPurify only in the browser
if (typeof window !== "undefined") {
  purifyInstance = DOMPurify;
}

export function sanitizeHtml(html: string): string {
  if (!purifyInstance) return html; // Fallback for SSR
  return purifyInstance.sanitize(html, {
    ALLOWED_TAGS: ["em", "strong", "br", "p"],
    ALLOWED_ATTR: ["class"],
  });
}

export function sanitizeQuestionText(text: string): string {
  // First apply our bold/italic replacements, then sanitize
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<em class="font-semibold text-brand">$1</em>')
    .replace(/\*(.*?)\*/g, '<em class="text-brand">$1</em>');
  return sanitizeHtml(formattedText);
}
