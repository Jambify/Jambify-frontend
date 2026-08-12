// src/lib/utils/formatScienceText.ts
//
// Converts plain-text chemistry/math notation into real Unicode
// subscript/superscript characters and proper arrows, for display only.
// The DB keeps storing plain text (e.g. "CnH2n+2") — this is purely a
// render-time transform, same pattern as the [bracket] underline fix.
//
// SCOPE: only call this for Chemistry / Physics / Mathematics questions.
// The heuristics below assume formula-like content and can misfire on
// plain English sentences (e.g. don't apply to English/Government/etc).
//
// KNOWN LIMITATIONS (Option A):
// - No fractions, roots, or stacked exponents — that needs real math
//   rendering (KaTeX), which is a separate, bigger project (Option B).
// - Ion-charge notation without an explicit "^" (e.g. "Ca2+" meaning a
//   2+ charge) is genuinely ambiguous with a formula subscript and is
//   NOT specially handled — it will render as "Ca₂+" (subscripted 2,
//   literal +) rather than "Ca²⁺". Use "Ca^2+" in source text if you
//   want the charge superscripted correctly.
// - Subscript letters only exist in Unicode for: a e i o r u v x n.
//   Any other letter needed as a subscript (rare) won't convert.
// - FIXED: Rule 5 ("Cn" -> C + subscript n) previously matched when
//   followed by whitespace or end-of-string, which caught the ordinary
//   English word "An" (e.g. "An organic compound...") and wrongly
//   subscripted its "n". Now it only matches when immediately followed
//   by another uppercase letter with NO space — the only way "Cn"
//   actually appears in real formula notation like "CnH2n".

const SUBSCRIPT_DIGITS: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "+": "₊", "-": "₋",
};

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻",
};

const SUBSCRIPT_LETTERS: Record<string, string> = {
  a: "ₐ", e: "ₑ", i: "ᵢ", o: "ₒ", r: "ᵣ", u: "ᵤ", v: "ᵥ", x: "ₓ", n: "ₙ",
};

function toSubscript(str: string): string {
  return str
    .split("")
    .map((ch) => SUBSCRIPT_DIGITS[ch] ?? SUBSCRIPT_LETTERS[ch] ?? ch)
    .join("");
}

function toSuperscript(str: string): string {
  return str
    .split("")
    .map((ch) => SUPERSCRIPT_DIGITS[ch] ?? ch)
    .join("");
}

export const SCIENCE_SUBJECTS = ["Chemistry", "Physics", "Mathematics"];

export function formatScienceText(text: string): string {
  let out = text;

  // ── 1. Arrows (reaction arrows, implication arrows) ────────────────
  out = out
    .replace(/<-{1,2}>|<=+>/g, " ⇌ ")
    .replace(/-{1,2}>|=+>/g, " → ")
    .replace(/<-{1,2}|<=+/g, " ← ")
    .replace(/\s{2,}/g, " ");

  // ── 2. Explicit caret exponents/superscripts: x^2, ^+, ^- ──────────
  out = out.replace(/\^(\d+|[+-])/g, (_, val) => toSuperscript(val));

  // ── 3. Coefficient+variable formula subscript: "2n+2", "2n-2" ──────
  out = out.replace(
    /(\d+)n([+-])(\d+)/g,
    (_, d1, sign, d2) => toSubscript(d1) + toSubscript("n") + toSubscript(sign) + toSubscript(d2),
  );

  // ── 4. Bare coefficient+variable: "2n" (not already consumed above) ─
  out = out.replace(/(\d+)n(?![a-zA-Z0-9])/g, (_, d1) => toSubscript(d1) + toSubscript("n"));

  // ── 5. Element letter + trailing "n" DIRECTLY before next element ──
  // (FIXED: no longer matches whitespace/end-of-string — that caught
  // "An organic compound" as if "An" were formula notation. Real formula
  // "Cn" in e.g. "CnH2n" is always immediately followed by another
  // element symbol with zero space between them.)
  out = out.replace(/([A-Z])n(?=[A-Z])/g, (_, el) => el + toSubscript("n"));

  // ── 6. General element-formula digit subscript: H2O, CO2, CaCO3 ────
  out = out.replace(/([A-Za-z])(\d+)(?!\d)/g, (_, letter, digits) => letter + toSubscript(digits));

  return out;
}