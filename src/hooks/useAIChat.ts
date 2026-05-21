/**
 * src/hooks/useAIChat.ts
 * ──────────────────────
 * Reusable chat hook used by both MentorChat and ReviewExam AI drawer.
 *
 * Features:
 * - Streaming responses (text appears word-by-word)
 * - Conversation history maintained for context
 * - Loading / error states
 * - localStorage persistence per session key
 */

import { useCallback, useRef, useState } from 'react';
import { streamAI, type GeminiMessage } from '../lib/ai';

export interface ChatMessage {
  id:      string;
  role:    'user' | 'ai';
  content: string;
  isStreaming?: boolean;
}

interface UseAIChatOptions {
  /** Optional system prompt override */
  systemPrompt?: string;
  /** localStorage key — if provided, history is persisted */
  storageKey?: string;
}

function loadHistory(key?: string): ChatMessage[] {
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(key: string, messages: ChatMessage[]) {
  try {
    // Keep last 50 messages to avoid bloating localStorage
    const trimmed = messages.slice(-50);
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch { /* storage full — ignore */ }
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const { systemPrompt, storageKey } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadHistory(storageKey)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Ref to track the streaming message id so we can update it in-place
  const streamingIdRef = useRef<string | null>(null);
  // Abort flag for cancelling in-flight streams
  const abortRef = useRef(false);

  // Convert our ChatMessage[] to Gemini's format (exclude streaming placeholders)
  const toGeminiHistory = useCallback(
    (msgs: ChatMessage[]): GeminiMessage[] =>
      msgs
        .filter((m) => !m.isStreaming && m.content.trim())
        .map((m) => ({
          role:  m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
    []
  );

  const sendMessage = useCallback(
    async (text: string, prependContext?: string) => {
      if (!text.trim() || isLoading) return;

      setError(null);
      abortRef.current = false;

      const userMsg: ChatMessage = {
        id:      `u-${Date.now()}`,
        role:    'user',
        content: text.trim(),
      };

      // Add user message immediately
      setMessages((prev) => {
        const next = [...prev, userMsg];
        if (storageKey) saveHistory(storageKey, next);
        return next;
      });

      // Create streaming placeholder for AI response
      const aiId = `a-${Date.now()}`;
      streamingIdRef.current = aiId;

      const aiPlaceholder: ChatMessage = {
        id:          aiId,
        role:        'ai',
        content:     '',
        isStreaming: true,
      };

      setMessages((prev) => [...prev, aiPlaceholder]);
      setIsLoading(true);

      // Build history for Gemini (include the new user message)
      const historyForApi = toGeminiHistory([
        ...messages,
        userMsg,
      ]);

      // If there's context to prepend (e.g. question text), inject it into
      // the last user message so the AI has full context
      if (prependContext && historyForApi.length > 0) {
        const last = historyForApi[historyForApi.length - 1];
        last.parts[0].text = `${prependContext}\n\nUser question: ${last.parts[0].text}`;
      }

      let accumulated = '';

      await streamAI(
        historyForApi,
        // onChunk
        (delta) => {
          if (abortRef.current) return;
          accumulated += delta;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? { ...m, content: accumulated, isStreaming: true }
                : m
            )
          );
        },
        // onDone
        () => {
          streamingIdRef.current = null;
          setIsLoading(false);
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === aiId
                ? { ...m, content: accumulated || 'No response received.', isStreaming: false }
                : m
            );
            if (storageKey) saveHistory(storageKey, next);
            return next;
          });
        },
        // onError
        (err) => {
          streamingIdRef.current = null;
          setIsLoading(false);
          setError(err.message);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? { ...m, content: `❌ Error: ${err.message}`, isStreaming: false }
                : m
            )
          );
        },
        systemPrompt,
      );
    },
    [isLoading, messages, systemPrompt, storageKey, toGeminiHistory]
  );

  const clearHistory = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setError(null);
    setIsLoading(false);
    if (storageKey) {
      try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    }
  }, [storageKey]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    setMessages,
  };
}
