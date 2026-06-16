/**
 * src/lib/ai.ts
 * ─────────────
 * Thin wrapper around Google Gemini 1.5 Flash (free tier).
 *
 * Setup: add VITE_GEMINI_API_KEY to your .env file.
 * Get a free key at: https://aistudio.google.com/app/apikey
 *
 * Usage:
 *   import { askAI, streamAI } from '../lib/ai';
 *   const reply = await askAI([{ role: 'user', parts: [{ text: 'Hello' }] }]);
 */

export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
// gemini-2.5-flash: free tier on v1beta, best price-performance model
// Model code confirmed at: https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash
const MODEL = "gemini-2.5-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;

// ── System instruction injected into every request ────────────────────────────
// Keeps the AI focused on JAMB prep and prevents off-topic responses.
const SYSTEM_INSTRUCTION = `You are JAMBIFY AI, an expert JAMB (Joint Admissions and Matriculation Board) 
exam preparation tutor for Nigerian students. You specialize in all JAMB subjects: 
English, Mathematics, Physics, Chemistry, Biology, Economics, Government, Literature, CRS/IRS.

Rules:
- Always be encouraging, clear, and concise
- Use simple language appropriate for secondary school students
- When explaining answers, break them down step by step
- Reference JAMB past questions and patterns when relevant
- Keep responses focused and under 300 words unless a detailed explanation is needed
- Use Nigerian context and examples where helpful
- Format responses with clear structure (use bullet points, numbered steps where appropriate)
- Never give answers without explanations`;

// ── Core fetch helper ─────────────────────────────────────────────────────────

function buildBody(history: GeminiMessage[], systemPrompt?: string) {
  return JSON.stringify({
    system_instruction: {
      parts: [{ text: systemPrompt ?? SYSTEM_INSTRUCTION }],
    },
    contents: history,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  });
}

// ── Non-streaming: returns full text ─────────────────────────────────────────

export async function askAI(
  history: GeminiMessage[],
  systemPrompt?: string,
): Promise<string> {
  if (!API_KEY) {
    return "⚠️ AI is not configured yet. Add VITE_GEMINI_API_KEY to your .env file. Get a free key at https://aistudio.google.com/app/apikey";
  }

  const res = await fetch(`${BASE_URL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: buildBody(history, systemPrompt),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as any)?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from AI."
  );
}

// ── Streaming: calls onChunk with each text delta ─────────────────────────────

export async function streamAI(
  history: GeminiMessage[],
  onChunk: (delta: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  systemPrompt?: string,
): Promise<void> {
  if (!API_KEY) {
    onChunk(
      "⚠️ AI is not configured yet. Add VITE_GEMINI_API_KEY to your .env file. Get a free key at https://aistudio.google.com/app/apikey",
    );
    onDone();
    return;
  }

  try {
    const res = await fetch(
      `${BASE_URL}:streamGenerateContent?alt=sse&key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: buildBody(history, systemPrompt),
      },
    );

    if (!res.ok || !res.body) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any)?.error?.message ?? `HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") continue;
        try {
          const parsed = JSON.parse(json);
          const delta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (delta) onChunk(delta);
        } catch {
          // malformed chunk — skip
        }
      }
    }

    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

// ── Convenience: build a question-explanation prompt ─────────────────────────

export function buildQuestionContext(q: {
  text: string;
  options: string[];
  answer: number;
  explanation?: string;
  subject?: string;
  topic?: string;
  year?: number | string;
}): string {
  const correctOption = q.options[q.answer];
  // More aggressive truncation for extremely long questions
  const truncatedText =
    q.text.length > 500 ? q.text.substring(0, 500) + "..." : q.text;

  return `Analyze this JAMB ${q.subject ?? ""} question:
"${truncatedText}"
Answer is ${String.fromCharCode(65 + q.answer)}. ${correctOption}
Briefly verify accuracy and explain why it's correct.`;
}
