/**
 * src/Pages/MockExam/ReviewExam.tsx
 * ──────────────────────────────────
 * Post-exam review screen with a real AI explanation drawer.
 * The drawer uses the same useAIChat hook as MentorChat.
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useMockStore } from "../../Store/useMockStore";
import { useUserStore } from "../../Store/useUserStore";
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
  ArrowUp,
} from "lucide-react";
import Button from "../../components/Layout/Button";

// ── Typing dots ───────────────────────────────────────────────────────────────
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
      <div className="bg-bgCard animate-in slide-in-from-right relative z-10 flex h-full w-full max-w-md flex-col overflow-hidden shadow-2xl duration-300">
        {/* Header */}
        <div className="border-borderMuted bg-brand flex shrink-0 items-center justify-between border-b px-5 py-4 text-white">
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
            {question.text}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="bg-success/10 text-success border-success/20 rounded-full border px-2 py-0.5 text-[10px] font-medium">
              ✓ {String.fromCharCode(65 + question.answer)}.{" "}
              {question.options[question.answer]}
            </span>
            {question.topic && (
              <span className="text-textDim text-[10px]">{question.topic}</span>
            )}
          </div>
        </div>

        {/* Chat body */}
        <div className="flex-1 space-y-4 overflow-y-auto scroll-smooth px-5 py-4">
          {/* Message bubbles */}
          {messages.map((msg: ChatMessage) => {
            const isUser = msg.role === "user";
            // Skip the initial context message from display
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

          {/* Typing indicator — only when first message is loading */}
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
                  className="bg-bgSurface border-borderMuted text-textDim hover:text-textMain hover:border-brand/40 rounded-full border px-2.5 py-1 text-[11px] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input footer */}
        <div className="border-borderMuted bg-bgCard shrink-0 border-t px-4 pt-2 pb-4">
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
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      <div className="relative box-border w-full max-w-full overflow-x-hidden">
        <div className="mx-auto max-w-5xl overflow-hidden px-4 py-6 md:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={onBack}
              icon={<ArrowLeft size={18} />}
              className="bg-brand/10 border-brand/10 text-brand hover:bg-brand/20 shrink-0 self-start rounded-xl px-4 transition-all active:scale-95"
            >
              Back
            </Button>
            <div className="bg-brand/5 border-brand/20 flex shrink-0 items-center gap-2 self-start rounded-xl border p-2.5 sm:self-auto">
              <Trophy className="text-brand h-4 w-4" />
              <span className="font-mono text-xs font-bold">
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
          <div className="bg-bgPage sticky top-0 z-20 mb-6 max-w-full space-y-3 py-2">
            <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto pb-1">
              {subjectData.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => setActiveTab(sub.name)}
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold whitespace-nowrap transition-all",
                    activeTab === sub.name
                      ? "bg-brand border-brand text-white shadow-md"
                      : "bg-bgCard border-borderMuted text-textDim hover:border-brand/40",
                  )}
                >
                  {sub.name}
                  <span className="text-[10px] opacity-70">
                    {sub.score}/{sub.total}
                  </span>
                </button>
              ))}
            </div>
            <div className="no-scrollbar flex max-w-full items-center gap-2 overflow-x-auto pb-1">
              <Filter size={12} className="text-textDim shrink-0" />
              {["all", "correct", "incorrect"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f as any)}
                  className={cn(
                    "shrink-0 rounded-lg border px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all",
                    statusFilter === f
                      ? "bg-textMain border-textMain text-bgCard"
                      : "border-borderMuted text-textDim bg-transparent",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="bg-borderMuted h-px w-full" />
          </div>

          {/* Questions feed */}
          <div className="max-w-full space-y-6 overflow-hidden pb-20">
            {filteredQuestions.map((q, idx) => {
              const globalIdx = questions.indexOf(q);
              const userAnswer = answers[globalIdx];
              const isCorrect = userAnswer === q.answer;

              return (
                <div
                  key={q.id}
                  className={cn(
                    "bg-bgCard box-border w-full overflow-hidden rounded-2xl border transition-all md:rounded-3xl",
                    isCorrect
                      ? "border-l-success border-success/20 border-l-4"
                      : "border-l-danger border-danger/20 border-l-4",
                  )}
                >
                  <div className="p-4 md:p-8">
                    {/* Question header */}
                    <div className="mb-6 flex min-w-0 items-start gap-3 md:gap-5">
                      <div
                        className={cn(
                          "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm md:h-12 md:w-12",
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
                        <span className="text-textDim font-mono text-[10px] font-bold uppercase">
                          Q {idx + 1}
                        </span>
                        <p className="text-textMain mt-1 text-sm leading-snug font-bold wrap-break-word md:text-lg">
                          {q.text}
                        </p>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="mb-6 grid grid-cols-1 gap-3 md:ml-16 md:grid-cols-2">
                      {q.options.map((opt: string, i: number) => (
                        <div
                          key={i}
                          className={cn(
                            "flex min-w-0 items-center justify-between rounded-xl border-2 p-3 text-xs transition-all md:p-4 md:text-sm",
                            i === q.answer
                              ? "border-success bg-success/5 text-success font-bold"
                              : i === userAnswer
                                ? "border-danger bg-danger/5 text-danger"
                                : "border-borderMuted text-textDim opacity-80",
                          )}
                        >
                          <span className="min-w-0 flex-1 pr-2 wrap-break-word">
                            <span className="mr-1 font-mono opacity-50">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {opt}
                          </span>
                          {i === q.answer && (
                            <CheckCircle size={14} className="ml-2 shrink-0" />
                          )}
                          {i === userAnswer && i !== q.answer && (
                            <XCircle size={14} className="ml-2 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation + AI button */}
                    <div className="space-y-4 md:ml-16">
                      <div className="bg-bgSurface/50 border-borderMuted overflow-hidden rounded-2xl border p-4">
                        <div className="text-brand mb-2 flex items-center gap-2 text-[10px] font-black uppercase">
                          <BookOpen size={14} /> Explanation
                        </div>
                        <p className="text-textMuted text-xs leading-relaxed wrap-break-word md:text-sm">
                          {q.explanation || "No explanation provided."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => setSelectedAIQuestion(q)}
                          className="bg-brand shadow-brand/20 hover:bg-brand-light flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                        >
                          <Sparkles size={14} />
                          <span className="text-[11px] font-bold tracking-tight uppercase">
                            Ask AI Tutor
                          </span>
                        </button>
                        <div className="min-w-0 text-right">
                          <p className="text-textDim font-mono text-[9px] uppercase">
                            Topic
                          </p>
                          <p className="text-textMain truncate text-[10px] font-bold">
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={handleScrollToTop}
          className="bg-brand hover:bg-brand-light fixed right-6 bottom-20 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 sm:right-8 sm:bottom-8"
        >
          <ArrowUp className="h-6 w-6 text-white" />
        </button>
      )}

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
