/**
 * src/Pages/MockExam/ReviewExam.tsx
 * ──────────────────────────────────
 * Post-exam review screen with a real AI explanation drawer.
 * The drawer uses the same useAIChat hook as MentorChat.
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useMockStore } from "../../Store/useMockStore";
import { useUserStore } from "../../Store/UseUserStore";
import AppLayout from "../../components/Layout/AppLayout";
import ExamPaywall from "../../components/MockExam/ExamPaywall";
import { cn } from "../../lib/utils/utils";
import { useAIChat, type ChatMessage } from "../../hooks/useAIChat";
import { buildQuestionContext } from "../../lib/ai";
import {
  CheckCircle,
  XCircle,
  BookOpen,
  Send,
  ArrowLeft,
  Filter,
  Trophy,
  X,
  Sparkles,
} from "lucide-react";
import Button from "../../components/Layout/Button";

// ── Typing dots ───────────────────────────────────────────────────────────────
const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-brand/60"
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

// ── AI Drawer ─────────────────────────────────────────────────────────────────
interface AIDrawerProps {
  question: any;
  onClose: () => void;
}

const AIDrawer: React.FC<AIDrawerProps> = ({ question, onClose }) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [showTruthScore, setShowTruthScore] = useState(false);

  // Each question gets its own isolated chat session (no persistence needed)
  const { messages, isLoading, sendMessage } = useAIChat({
    systemPrompt: `You are JAMBIFY AI Tutor (Expert Edition). 
Your goal is to provide deep, professional insights into JAMB questions.
1. Briefly verify if the provided answer is correct.
2. Provide a 'Truth Score' (0-100%).
3. Explain why the answer is correct and others are wrong in under 150 words.
4. Use professional, clear tone.
5. Format verification clearly at the top.`,
  });

  // On open: auto-send the initial explanation request
  const initialSentRef = useRef(false);
  useEffect(() => {
    if (initialSentRef.current) return;
    initialSentRef.current = true;
    const context = buildQuestionContext(question);
    // Send only the context to keep the prompt length under control
    sendMessage(context);

    // Simulate showing truth score after a delay
    setTimeout(() => setShowTruthScore(true), 2000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    // Pass the question as context for follow-up questions
    const ctx = `(Context: This is about the question "${question.text}" — correct answer is option ${String.fromCharCode(65 + question.answer)}: "${question.options[question.answer]}")`;
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
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative w-full max-w-md bg-bgCard h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-borderMuted flex items-center justify-between bg-brand text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-light/20 rounded-brand">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm">AI Tutor</h2>
              <p className="text-[10px] opacity-80 uppercase tracking-widest font-mono">
                Interactive Help
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-light/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question context strip */}
        <div className="px-5 py-3 bg-bgSurface border-b border-borderMuted shrink-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-brand uppercase">
              The Question
            </p>
            {showTruthScore && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 border border-success/20 animate-in fade-in zoom-in duration-500">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[9px] font-bold text-success uppercase tracking-tighter">
                  Verified by AI
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-textMain leading-relaxed line-clamp-3">
            {question.text}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 font-medium">
              ✓ {String.fromCharCode(65 + question.answer)}.{" "}
              {question.options[question.answer]}
            </span>
            {question.topic && (
              <span className="text-[10px] text-textDim">{question.topic}</span>
            )}
          </div>
        </div>

        {/* Chat body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth">
          {/* Message bubbles */}
          {messages.map((msg: ChatMessage) => {
            const isUser = msg.role === "user";
            // Skip the initial context message from display
            if (isUser && msg.content.startsWith("JAMB Question")) return null;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[90%]",
                  isUser ? "ml-auto items-end" : "mr-auto items-start",
                )}
              >
                <span className="text-[9px] font-bold text-textDim uppercase mb-1 px-1">
                  {isUser ? "You" : "AI Tutor"}
                </span>
                <div
                  className={cn(
                    "px-3 py-2.5 rounded-2xl text-sm leading-relaxed",
                    isUser
                      ? "bg-brand text-white rounded-tr-sm"
                      : "bg-bgSurface border border-borderMuted text-textMain rounded-tl-sm",
                    msg.isStreaming &&
                      'after:content-["▋"] after:animate-pulse after:text-brand after:ml-0.5',
                  )}
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {msg.content || (msg.isStreaming ? "" : "…")}
                </div>
              </div>
            );
          })}

          {/* Typing indicator — only when first message is loading */}
          {isLoading &&
            messages.filter((m) => m.role === "ai").length === 0 && (
              <div className="mr-auto">
                <span className="text-[9px] font-bold text-textDim uppercase mb-1 block px-1">
                  AI Tutor
                </span>
                <div className="bg-bgSurface border border-borderMuted rounded-2xl rounded-tl-sm">
                  <TypingDots />
                </div>
              </div>
            )}

          {/* Follow-up suggestions */}
          {!isLoading && messages.length > 1 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {[
                "Why are the other options wrong?",
                "Give me a similar example",
                "Explain more simply",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-2.5 py-1 bg-bgSurface border border-borderMuted rounded-full text-[11px] text-textDim hover:text-textMain hover:border-brand/40 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input footer */}
        <div className="px-4 pb-4 pt-2 border-t border-borderMuted shrink-0 bg-bgCard">
          <div className="flex items-end gap-2 bg-bgSurface border border-borderMuted rounded-brand-lg p-2 focus-within:border-brand transition-colors">
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
              className="flex-1 bg-transparent border-none text-sm px-2 py-1.5 focus:ring-0 resize-none no-scrollbar placeholder:text-textDim text-textMain min-h-9 max-h-25 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2 rounded-brand transition-all shrink-0",
                input.trim() && !isLoading
                  ? "bg-brand text-white hover:bg-brand-light shadow-md shadow-brand/20 active:scale-95"
                  : "bg-borderMuted text-textDim cursor-not-allowed",
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1.5 text-[9px] text-center text-textDim uppercase tracking-tighter">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Main ReviewScreen ─────────────────────────────────────────────────────────
const ReviewScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { questions, answers } = useMockStore();
  const { isPro } = useUserStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "correct" | "incorrect"
  >("all");
  const [selectedAIQuestion, setSelectedAIQuestion] = useState<any | null>(
    null,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const subjectData = useMemo(() => {
    // ... same as before
    const uniqueSubjects = Array.from(new Set(questions.map((q) => q.subject)));
    return uniqueSubjects.map((sub) => {
      const subQs = questions.filter((q) => q.subject === sub);
      const score = subQs.filter(
        (q) => answers[questions.indexOf(q)] === q.answer,
      ).length;
      return { name: sub, score, total: subQs.length };
    });
  }, [questions, answers]);

  const [activeTab, setActiveTab] = useState(subjectData[0]?.name || "");

  const filteredQuestions = useMemo(() => {
    let res = questions.filter((q) => q.subject === activeTab);
    if (statusFilter === "correct")
      res = res.filter((q) => answers[questions.indexOf(q)] === q.answer);
    if (statusFilter === "incorrect")
      res = res.filter((q) => answers[questions.indexOf(q)] !== q.answer);
    return res;
  }, [activeTab, statusFilter, questions, answers]);

  if (!isPro) {
    return (
      <AppLayout
        currentPage="Review"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <ExamPaywall onUpgrade={() => {}} onBack={onBack} />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      currentPage="Review"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="w-full max-w-full overflow-x-hidden box-border relative">
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <Button
              variant="secondary"
              size="sm"
              onClick={onBack}
              icon={<ArrowLeft size={18} />}
              className="rounded-xl shrink-0 bg-brand/10 border-brand/10 text-brand hover:bg-brand/20 active:scale-95 transition-all px-4 self-start"
            >
              Back
            </Button>
            <div className="flex items-center gap-2 bg-brand/5 border border-brand/20 p-2.5 rounded-xl self-start sm:self-auto shrink-0">
              <Trophy className="text-brand w-4 h-4" />
              <span className="text-xs font-bold font-mono">
                Total:{" "}
                {
                  Object.values(answers).filter(
                    (a, i) => a === questions[i]?.answer,
                  ).length
                }
                /{questions.length}
              </span>
            </div>
          </div>

          {/* Sticky nav */}
          <div className="sticky top-0 z-20 bg-bgPage py-2 mb-6 space-y-3 max-w-full">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
              {subjectData.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => setActiveTab(sub.name)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap shrink-0",
                    activeTab === sub.name
                      ? "bg-brand border-brand text-white shadow-md"
                      : "bg-bgCard border-borderMuted text-textDim hover:border-brand/40",
                  )}
                >
                  {sub.name}
                  <span className="opacity-70 text-[10px]">
                    {sub.score}/{sub.total}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
              <Filter size={12} className="text-textDim shrink-0" />
              {["all", "correct", "incorrect"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f as any)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0",
                    statusFilter === f
                      ? "bg-textMain border-textMain text-bgCard"
                      : "bg-transparent border-borderMuted text-textDim",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="h-px bg-borderMuted w-full" />
          </div>

          {/* Questions feed */}
          <div className="space-y-6 pb-20 max-w-full overflow-hidden">
            {filteredQuestions.map((q, idx) => {
              const globalIdx = questions.indexOf(q);
              const userAnswer = answers[globalIdx];
              const isCorrect = userAnswer === q.answer;

              return (
                <div
                  key={q.id}
                  className={cn(
                    "bg-bgCard border rounded-2xl md:rounded-3xl transition-all w-full box-border overflow-hidden",
                    isCorrect
                      ? "border-l-4 border-l-success border-success/20"
                      : "border-l-4 border-l-danger border-danger/20",
                  )}
                >
                  <div className="p-4 md:p-8">
                    {/* Question header */}
                    <div className="flex items-start gap-3 md:gap-5 mb-6 min-w-0">
                      <div
                        className={cn(
                          "w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-1",
                          isCorrect
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger",
                        )}
                      >
                        {isCorrect ? (
                          <CheckCircle size={20} />
                        ) : (
                          <XCircle size={20} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono font-bold text-textDim uppercase">
                          Q {idx + 1}
                        </span>
                        <p className="text-sm md:text-lg font-bold text-textMain mt-1 leading-snug wrap-break-word">
                          {q.text}
                        </p>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 md:ml-16">
                      {q.options.map((opt: string, i: number) => (
                        <div
                          key={i}
                          className={cn(
                            "p-3 md:p-4 rounded-xl border-2 text-xs md:text-sm flex items-center justify-between transition-all min-w-0",
                            i === q.answer
                              ? "border-success bg-success/5 text-success font-bold"
                              : i === userAnswer
                                ? "border-danger bg-danger/5 text-danger"
                                : "border-borderMuted text-textDim opacity-80",
                          )}
                        >
                          <span className="pr-2 wrap-break-word flex-1 min-w-0">
                            <span className="opacity-50 font-mono mr-1">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {opt}
                          </span>
                          {i === q.answer && (
                            <CheckCircle size={14} className="shrink-0 ml-2" />
                          )}
                          {i === userAnswer && i !== q.answer && (
                            <XCircle size={14} className="shrink-0 ml-2" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation + AI button */}
                    <div className="md:ml-16 space-y-4">
                      <div className="p-4 bg-bgSurface/50 rounded-2xl border border-borderMuted overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 text-brand font-black text-[10px] uppercase">
                          <BookOpen size={14} /> Explanation
                        </div>
                        <p className="text-xs md:text-sm text-textMuted leading-relaxed wrap-break-word">
                          {q.explanation || "No explanation provided."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => setSelectedAIQuestion(q)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-light hover:scale-105 transition-all shrink-0 active:scale-95"
                        >
                          <Sparkles size={14} />
                          <span className="text-[11px] font-bold uppercase tracking-tight">
                            Ask AI Tutor
                          </span>
                        </button>
                        <div className="text-right min-w-0">
                          <p className="text-[9px] text-textDim font-mono uppercase">
                            Topic
                          </p>
                          <p className="text-[10px] font-bold text-textMain truncate">
                            {q.topic || "General"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Drawer — mounts fresh per question so each gets its own chat */}
      {selectedAIQuestion && (
        <AIDrawer
          key={selectedAIQuestion.id}
          question={selectedAIQuestion}
          onClose={() => setSelectedAIQuestion(null)}
        />
      )}
    </AppLayout>
  );
};

export default ReviewScreen;
