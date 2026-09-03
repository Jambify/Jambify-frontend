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
 *
 * Role-aware behavior:
 *   Pass `role` ("student" | "moderator" | "admin") to askAI/streamAI and the
 *   AI will use a different system instruction for staff vs. students.
 *   Callers should derive this from useUserStore (isAdmin / isModerator).
 */

export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export type ChatRole = "student" | "moderator" | "admin"; // NEW

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
// gemini-2.5-flash: free tier on v1beta, best price-performance model
// Model code confirmed at: https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash
const MODEL = "gemini-2.5-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;

// ── System instruction for regular students (unchanged) ────────────────────────
const STUDENT_SYSTEM_INSTRUCTION = `You are Schooldra AI, an expert JAMB (Joint Admissions and Matriculation Board) 
exam preparation tutor for Nigerian students. You specialize in all JAMB subjects: 
English, Mathematics, Physics, Chemistry, Biology, Economics, Government, Literature, CRS/IRS.

Rules:
- Always be encouraging, clear, and concise
- Use simple language appropriate for secondary school students
- When explaining answers, break them down step by step
- Reference JAMB past questions and patterns when relevant
- Keep responses focused and under 300 words unless a detailed explanation is needed
- Use Nigerian context and examples where helpful
- Never give answers without explanations
- CRITICAL: Never use markdown formatting — no **bold**, *italics*, backticks, or asterisk/dash bullet lists. This chat displays plain text only, so any markdown symbols will show up as literal characters on screen. For structure, use plain numbered steps ("1.", "2.") or line breaks instead of markdown syntax.`;

// NEW — system instruction for admins/moderators. Same subject-matter
// expertise, but treats the person as staff rather than a student: skips
// the "encouraging tutor" framing, allows more technical/direct answers,
// and can discuss Schooldra itself (content quality, question accuracy,
// how a topic is typically tested) rather than only tutoring a student.
const STAFF_SYSTEM_INSTRUCTION = `You are Schooldra AI, operating in staff mode for a Schooldra team member 
(admin or moderator), not a student. You still specialize in all JAMB subjects: 
English, Mathematics, Physics, Chemistry, Biology, Economics, Government, Literature, CRS/IRS.

Rules:
- Speak to the person as a colleague, not a student — skip encouragement/motivational framing
- Be direct, technical, and concise; assume subject-matter familiarity
- You may discuss the JAMB question bank itself: flag potentially incorrect answers, 
  ambiguous wording, outdated syllabus references, or duplicate/near-duplicate questions if asked
- You may answer meta-questions about how a topic is typically tested, common student 
  misconceptions, or how to explain a concept to students, since this may inform their moderation work
- No response length cap — give as much detail as the question warrants
- CRITICAL: Never use markdown formatting — no **bold**, *italics*, backticks, or asterisk/dash bullet lists. This chat displays plain text only, so any markdown symbols will show up as literal characters on screen. For structure, use plain numbered steps ("1.", "2.") or line breaks instead of markdown syntax.`;

function resolveSystemInstruction(role?: ChatRole, override?: string): string {
  if (override) return override; // explicit systemPrompt always wins
  if (role === "admin" || role === "moderator") return STAFF_SYSTEM_INSTRUCTION;
  return STUDENT_SYSTEM_INSTRUCTION;
}

// ── Core fetch helper ─────────────────────────────────────────────────────────

function buildBody(history: GeminiMessage[], systemPrompt: string) {
  return JSON.stringify({
    system_instruction: {
      parts: [{ text: systemPrompt }],
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
  role?: ChatRole, // NEW
): Promise<string> {
  if (!API_KEY) {
    return "⚠️ AI is not configured yet. Add VITE_GEMINI_API_KEY to your .env file. Get a free key at https://aistudio.google.com/app/apikey";
  }

  const res = await fetch(`${BASE_URL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: buildBody(history, resolveSystemInstruction(role, systemPrompt)),
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
  role?: ChatRole, // NEW
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
        body: buildBody(history, resolveSystemInstruction(role, systemPrompt)),
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
