// src/components/PastQuestions/QuestionAIHelper.tsx

import React, { useState } from "react";
import { Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { useAIChat } from "../../hooks/useAIChat";
import type { Question } from "../../Types";

interface QuestionAIHelperProps {
  question: Question;
}

const STARTERS = [
  {
    label: "Explain it simpler",
    prompt: "Can you explain the answer to this question in a simpler way?",
  },
  {
    label: "Why is this correct?",
    prompt:
      "Walk me through exactly why this is the correct answer, step by step.",
  },
  {
    label: "Give me a similar question",
    prompt:
      "Give me a similar practice question on the same topic, with a different scenario, so I can test myself.",
  },
];

const QuestionAIHelper: React.FC<QuestionAIHelperProps> = ({ question }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const systemPrompt = `You are Schooldra AI, helping a student understand ONE specific past JAMB question. Stay focused on this question and its topic — do not give general study advice or change subject.

Question (${question.subject}, ${question.year}, topic: ${question.topic}):
"${question.text}"

Options: ${question.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join(" | ")}
Correct answer: ${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}
Official explanation: ${question.explanation}

Be concise, encouraging, and specific to this question. Under 150 words unless asked for more detail.`;

  const { messages, isLoading, sendMessage, isAtLimit } = useAIChat({
    systemPrompt,
    storageKey: `schooldra-pq-helper-${question.id}`,
  });

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage(text.trim());
    setInput("");
  };

  return (
    <div className="border-borderMuted mt-3 border-t pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-brand-light flex items-center gap-1.5 text-xs font-semibold"
      >
        <Sparkles size={14} />
        Ask AI about this question
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-2.5 space-y-2.5">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSend(s.prompt)}
                  className="bg-bgSurface border-borderMuted text-textDim hover:text-textMain hover:border-brand/40 rounded-full border px-3 py-1.5 text-xs transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand/10 text-textMain ml-6"
                  : "bg-bgSurface border-borderMuted text-textMain mr-6 border"
              }`}
            >
              {msg.content || (msg.isStreaming ? "…" : "")}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "ai" && (
            <div className="text-textDim flex items-center gap-2 text-xs">
              <Loader2 size={14} className="animate-spin" />
              Thinking…
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder={
                isAtLimit ? "Session limit reached" : "Ask a follow-up…"
              }
              disabled={isLoading || isAtLimit}
              className="bg-bgSurface border-borderMuted text-textMain focus:ring-brand/30 flex-1 rounded-lg border px-3 py-1.5 text-xs focus:ring-2 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading || isAtLimit}
              className="bg-brand hover:bg-brand-light rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Ask
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionAIHelper;
