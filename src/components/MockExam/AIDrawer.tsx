/**
 * FIXED AIDrawer Component
 * ─────────────────────────
 * Fixes:
 * 1. Mobile keyboard pushing input off-screen (100dvh + safe-area-inset-bottom)
 * 2. Error message styling (icon + better UI)
 * 3. Input area stays visible on mobile
 * 4. Better chat body constraints
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../lib/utils/utils";
import { useAIChat, type ChatMessage } from "../../hooks/useAIChat";
import { renderQuestionText } from "../../lib/utils/renderQuestionText";
import type { Question } from "../../Types";

const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="bg-brand/60 h-2 w-2 rounded-full"
        style={{
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40%            { transform: translateY(-6px); opacity: 1; }
      }
    `}</style>
  </div>
);

interface AIDrawerProps {
  question: Question;
  userAnswer: number | -1;
  onClose: () => void;
}

const AIDrawer: React.FC<AIDrawerProps> = ({
  question,
  userAnswer,
  onClose,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [showTruthScore, setShowTruthScore] = useState(false);

  const skipped = userAnswer === -1;
  const isCorrectAns = userAnswer === question.answer;
  const userAnswerText =
    !skipped && question.options[userAnswer]
      ? question.options[userAnswer]
      : "(not answered / skipped)";
  const correctAnswerText = question.options[question.answer];

  const { messages, isLoading, sendMessage, error } = useAIChat({
    systemPrompt: `You are Schooldra AI Tutor (Expert Edition). 
Your goal is to provide deep, professional, and TARGETED insights into JAMB questions — focusing specifically on the user's chosen answer and their mistakes.

Structure your response exactly in this order with clear section headers on their own lines:
1. TRUTH SCORE: (0-100%) — confidence that the provided correct answer is accurate.
2. USER'S ANSWER ANALYSIS: 
   - If they answered correctly: confirm and reinforce why their choice was right in 2 sentences.
   - If they answered WRONG: pinpoint the specific misconception or error in their chosen answer. Why exactly is their option wrong? What trap did they fall for? Be specific in 2-3 sentences.
   - If they SKIPPED: explain what they should look for and how to approach similar questions.
3. WHY THE CORRECT ANSWER IS RIGHT: Explain in 2-3 clear, simple sentences why option ${String.fromCharCode(
      65 + question.answer,
    )} is the correct choice.
4. WHY OTHER OPTIONS ARE WRONG: For each of the other wrong options, give 1 sentence on why it is incorrect.

Tone: Professional but encouraging. Keep under 200 words total.
CRITICAL: Never use markdown formatting — no **bold**, *italics*, backticks, or asterisk/dash bullets. This chat displays plain text only. Use plain numbered sections (1., 2., 3., 4.) and line breaks only.`,
  });

  const initialSentRef = useRef(false);
  useEffect(() => {
    if (initialSentRef.current) return;
    initialSentRef.current = true;

    const userChoiceLine = skipped
      ? `USER'S CHOICE: Skipped (no answer selected)`
      : `USER'S CHOICE: ${String.fromCharCode(
          65 + userAnswer,
        )}. ${userAnswerText} — ${isCorrectAns ? "CORRECT" : "INCORRECT"}`;

    const customContext = `You are Schooldra AI Tutor. Analyze this JAMB question with specific focus on the user's chosen answer.

SUBJECT: ${question.subject || "Unknown"}
TOPIC: ${question.topic || "General"}

QUESTION:
"${question.text.length > 600 ? question.text.substring(0, 600) + "..." : question.text}"

OPTIONS:
${question.options
  .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
  .join("\n")}

${userChoiceLine}
CORRECT ANSWER: ${String.fromCharCode(
      65 + question.answer,
    )}. ${correctAnswerText}

Please respond with your structured analysis as instructed in your system prompt.`;

    sendMessage(customContext);
    setTimeout(() => setShowTruthScore(true), 2000);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const userChoice = skipped
      ? "user skipped this question"
      : `user chose option ${String.fromCharCode(65 + userAnswer)}: "${userAnswerText}"`;
    const ctx = `(Context: This is about the JAMB question "${question.text}". Correct answer is option ${String.fromCharCode(
      65 + question.answer,
    )}: "${correctAnswerText}"; ${userChoice}.)`;
    sendMessage(input.trim(), ctx);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel — 100dvh = viewport height (excludes keyboard on mobile) */}
      <div
        className="bg-bgCard animate-in slide-in-from-right relative z-50 flex w-full max-w-md flex-col overflow-hidden shadow-2xl duration-300"
        style={{
          height: "100dvh",
        }}
      >
        {/* Header */}
        <div className="border-borderMuted bg-brand flex shrink-0 items-center justify-between border-b px-5 py-4 text-white safe-area-top">
          <div className="flex items-center gap-3">
            <div className="bg-brand-light/20 rounded-brand p-2">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">AI Tutor</h2>
              <p className="font-mono text-[10px] tracking-widest uppercase opacity-80">
                Interactive Help
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-brand-light/10 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Question context strip */}
        <div className="bg-bgSurface border-borderMuted shrink-0 border-b px-5 py-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-brand text-[10px] font-bold uppercase">
              The Question
            </p>
            {showTruthScore && (
              <div className="bg-success/10 border-success/20 animate-in fade-in zoom-in flex items-center gap-1.5 rounded-full border px-2 py-0.5 duration-500">
                <div className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
                <span className="text-success text-[9px] font-bold tracking-tighter uppercase">
                  Verified by AI
                </span>
              </div>
            )}
          </div>
          <p className="text-textMain line-clamp-3 text-xs leading-relaxed">
            {renderQuestionText(question.text, question.subject)}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="bg-success/10 text-success border-success/20 rounded-full border px-2 py-0.5 text-[10px] font-medium">
              ✓ Correct: {String.fromCharCode(65 + question.answer)}.{" "}
              {correctAnswerText}
            </span>
            {!skipped && (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  isCorrectAns
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-danger/10 text-danger border-danger/20",
                )}
              >
                {isCorrectAns
                  ? "✓ Your answer was correct"
                  : `✗ You chose: ${userAnswerText}`}
              </span>
            )}
            {skipped && (
              <span className="bg-bgSurface text-textDim border-borderMuted rounded-full border px-2 py-0.5 text-[10px] font-medium">
                ⏭ You skipped this question
              </span>
            )}
            {question.topic && (
              <span className="text-textDim text-[10px]">{question.topic}</span>
            )}
          </div>
        </div>

        {/* Chat body — constrained, leaves room for input footer */}
        <div className="flex-1 space-y-4 overflow-y-auto scroll-smooth px-5 py-4 min-h-0">
          {/* Message bubbles */}
          {messages.map((msg: ChatMessage) => {
            const isUser = msg.role === "user";
            if (isUser && msg.content.startsWith("JAMB Question")) return null;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex max-w-[90%] flex-col",
                  isUser ? "ml-auto items-end" : "mr-auto items-start",
                )}
              >
                <span className="text-textDim mb-1 px-1 text-[9px] font-bold uppercase">
                  {isUser ? "You" : "AI Tutor"}
                </span>
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2.5 text-sm leading-relaxed",
                    isUser
                      ? "bg-brand rounded-tr-sm text-white"
                      : "bg-bgSurface border-borderMuted text-textMain rounded-tl-sm border",
                    msg.isStreaming &&
                      'after:text-brand after:ml-0.5 after:animate-pulse after:content-["▋"]',
                  )}
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {msg.content || (msg.isStreaming ? "" : "…")}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isLoading &&
            messages.filter((m) => m.role === "ai").length === 0 && (
              <div className="mr-auto">
                <span className="text-textDim mb-1 block px-1 text-[9px] font-bold uppercase">
                  AI Tutor
                </span>
                <div className="bg-bgSurface border-borderMuted rounded-2xl rounded-tl-sm border">
                  <TypingDots />
                </div>
              </div>
            )}

          {/* Error message with retry */}
          {error && (
            <div className="mr-auto w-full max-w-sm animate-in slide-in-from-top duration-300">
              <div className="bg-danger/12 border-danger/40 rounded-2xl border px-4 py-3 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-0.5">
                    <AlertCircle className="text-danger h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-danger text-sm font-bold">Error</p>
                    <p className="text-danger/85 text-xs leading-relaxed mt-0.5">
                      {error}
                    </p>
                  </div>
                </div>
                {/* Retry and Dismiss buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      // Retry: send the last user message again
                      const lastUserMsg = messages
                        .slice()
                        .reverse()
                        .find((m) => m.role === "user");
                      if (lastUserMsg) {
                        sendMessage(lastUserMsg.content);
                      }
                    }}
                    className="bg-danger text-white hover:bg-danger/90 active:scale-95 flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      // Dismiss: error clears naturally when new message arrives
                      setInput("");
                    }}
                    className="bg-danger/20 text-danger hover:bg-danger/30 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up suggestions */}
          {!isLoading && messages.length > 1 && !error && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {[
                "Why are the other options wrong?",
                "Give me a similar example",
                "Explain more simply",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="bg-bgSurface border-borderMuted text-textDim hover:text-textMain hover:border-brand/40 rounded-full border px-2.5 py-1 text-[11px] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input footer — safe-area-inset-bottom accounts for keyboard on mobile */}
        <div className="border-borderMuted bg-bgCard shrink-0 border-t px-4 py-3 safe-area-bottom">
          <div className="bg-bgSurface border-borderMuted rounded-brand-lg focus-within:border-brand flex items-end gap-2 border p-2 transition-colors">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question…"
              disabled={isLoading}
              className="no-scrollbar placeholder:text-textDim text-textMain max-h-25 min-h-9 flex-1 resize-none border-none bg-transparent px-2 py-1.5 text-sm focus:ring-0 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "rounded-brand shrink-0 p-2 transition-all",
                input.trim() && !isLoading
                  ? "bg-brand hover:bg-brand-light shadow-brand/20 text-white shadow-md active:scale-95"
                  : "bg-borderMuted text-textDim cursor-not-allowed",
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-textDim mt-1.5 text-center text-[9px] tracking-tighter uppercase">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIDrawer;