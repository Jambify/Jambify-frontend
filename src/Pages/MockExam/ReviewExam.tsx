import React, { useState, useMemo, useRef, useEffect } from "react";
import { useMockStore } from "../../Store/useMockStore";
import AppLayout from "../../components/Layout/AppLayout";
import { cn } from "../../lib/utils/utils";
import {
  CheckCircle,
  XCircle,
  BookOpen,
  MessageCircle,
  ArrowLeft,
  Filter,
  Trophy,
  X,
  Sparkles,
} from "lucide-react";
import Button from "../../components/Layout/Button";

const ReviewScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { questions, answers } = useMockStore();

  // --- UI State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "correct" | "incorrect"
  >("all");

  // --- AI Modal State ---
  const [selectedAIQuestion, setSelectedAIQuestion] = useState<any | null>(
    null,
  );
  const [isAILoading, setIsAILoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);

  // --- Scrolling Ref ---
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // --- Scroll to Top on Mount ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- Auto Scroll Logic for AI Chat ---
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, isAILoading]);

  const handleAskAI = (question: any) => {
    setSelectedAIQuestion(question);
    setIsAILoading(true);
    setTimeout(() => {
      setIsAILoading(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();

    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai",
          content: "I'm processing that! (AI automation coming soon...)",
        },
      ]);
    }, 1000);
  };

  const subjectData = useMemo(() => {
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

  return (
    <AppLayout
      currentPage="Review"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="w-full max-w-full overflow-x-hidden box-border relative">
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 overflow-hidden">
          {/* Header & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={onBack}
                // Added 'active:scale-95' for haptic-like visual feedback on tap
                className="rounded-xl shrink-0 bg-brand/10 border-brand/10 text-brand hover:bg-brand/20 active:scale-95 transition-all px-4"
              >
                <div className="flex items-center gap-2 justify-center">
                  <ArrowLeft size={18} />{" "}
                  {/* Slightly larger icon for mobile readability */}
                  <span className="font-medium">Back</span>
                </div>
              </Button>
            </div>
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

          {/* Sticky Nav */}
          <div className="sticky top-0 z-20 bg-bgPage py-2 mb-6 space-y-3 max-w-full">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
              {subjectData.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => setActiveTab(sub.name)}
                  className={cn(
                    "flex items-center sm:gap-4 gap-0.5  px-2 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap shrink-0",
                    activeTab === sub.name
                      ? "bg-brand border-brand text-white shadow-md"
                      : "bg-bgCard border-borderMuted text-textDim hover:border-brand/40",
                  )}
                >
                  {sub.name}{" "}
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

          {/* Questions Feed */}
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
                        <p className="text-sm md:text-lg font-bold text-textMain mt-1 leading-snug wrap-wrap-break-words">
                          {q.text}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 md:ml-16">
                      {q.options.map((opt, i) => (
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
                          <span className="pr-2 wrap-wrap-break-words flex-1 min-w-0">
                            <span className="opacity-50 font-mono mr-1">
                              {String.fromCharCode(65 + i)}.
                            </span>{" "}
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
                    <div className="md:ml-16 space-y-4">
                      <div className="p-4 bg-bgSurface/50 rounded-2xl border border-borderMuted overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 text-brand font-black text-[10px] uppercase">
                          <BookOpen size={14} /> Explanation
                        </div>
                        <p className="text-xs md:text-sm text-textMuted leading-relaxed wrap-wrap-break-words">
                          {q.explanation || "No explanation provided."}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => handleAskAI(q)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl shadow-lg shadow-brand/20 hover:scale-105 transition-all shrink-0"
                        >
                          <MessageCircle size={14} />
                          <span className="text-[11px] font-bold uppercase tracking-tight">
                            Ask AI Helper
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

        {/* --- AI DRAWER MODAL --- */}
        {selectedAIQuestion && (
          <div className="fixed inset-0 z-100 flex justify-end">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => {
                setSelectedAIQuestion(null);
                setChatInput("");
                setChatHistory([]);
              }}
            />
            <div className="relative w-full max-w-md bg-bgCard h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-10 overflow-hidden">
              <div className="p-6 border-b border-borderMuted flex items-center justify-between bg-brand text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold">AI Tutor</h2>
                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-mono">
                      Interactive Help
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedAIQuestion(null);
                    setChatHistory([]);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Chat Body */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth pb-10"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-brand uppercase">
                    The Question
                  </span>
                  <p className="text-sm font-medium text-textMain bg-bgSurface p-4 rounded-xl border border-borderMuted wrap-wrap-break-words">
                    {selectedAIQuestion.text}
                  </p>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-brand uppercase">
                    AI Analysis
                  </span>
                  {isAILoading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-bgSurface rounded w-full"></div>
                      <div className="h-4 bg-bgSurface rounded w-5/6"></div>
                      <div className="h-4 bg-bgSurface rounded w-4/6"></div>
                    </div>
                  ) : (
                    <div className="prose prose-sm text-textMuted leading-relaxed bg-brand/5 p-4 rounded-2xl border border-brand/10 wrap-break-words">
                      <p>
                        Based on{" "}
                        <strong>{selectedAIQuestion.topic || "General"}</strong>
                        , option{" "}
                        {String.fromCharCode(65 + selectedAIQuestion.answer)} is
                        correct because:
                      </p>
                      <p className="mt-2">
                        {selectedAIQuestion.explanation ||
                          "No explanation provided."}
                      </p>
                    </div>
                  )}
                </div>

                {chatHistory.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-borderMuted/30">
                    {chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                          msg.role === "user"
                            ? "ml-auto items-end"
                            : "mr-auto items-start",
                        )}
                      >
                        <span className="text-[9px] font-bold text-textDim uppercase mb-1 px-1">
                          {msg.role === "user" ? "You" : "AI Tutor"}
                        </span>
                        <div
                          className={cn(
                            "p-3 rounded-2xl text-sm leading-relaxed wrap-break-words",
                            msg.role === "user"
                              ? "bg-brand text-white rounded-tr-none shadow-sm"
                              : "bg-bgSurface border border-borderMuted text-textMain rounded-tl-none",
                          )}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-4 text-center">
                  <p className="text-[10px] text-textDim italic">
                    {chatHistory.length === 0
                      ? "Ask a follow-up question below."
                      : "Keep the conversation going!"}
                  </p>
                </div>
              </div>

              {/* Chat Input Footer */}
              <div className="p-4 md:pb-4 pb-24 bg-bgCard border-t border-borderMuted shrink-0">
                <div className="relative flex items-center gap-2 bg-bgSurface border border-borderMuted rounded-2xl p-2 focus-within:border-brand transition-colors">
                  <textarea
                    rows={1}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask for a better explanation..."
                    className="flex-1 bg-transparent border-none text-sm px-2 py-1 focus:ring-0 resize-none no-scrollbar placeholder:text-textDim text-textMain min-h-10 max-h-37.5"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className={cn(
                      "p-2 rounded-xl transition-all shrink-0",
                      chatInput.trim()
                        ? "bg-brand text-white shadow-md shadow-brand/20 hover:scale-105 active:scale-95"
                        : "bg-borderMuted text-textDim cursor-not-allowed",
                    )}
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
                <p className="mt-2 text-[9px] text-center text-textDim uppercase tracking-tighter">
                  AI can make mistakes. Verify important information.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ReviewScreen;
