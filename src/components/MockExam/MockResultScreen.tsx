// src/components/MockExam/MockResultScreen.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useMockStore } from "../../Store/useMockStore";
import { useUserStore } from "../../Store/useUserStore";
import Button from "../ui/Button";
import { cn } from "../../lib/utils/utils";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Sparkles,
  ArrowUp,
} from "lucide-react";
import { renderQuestionText } from "../../lib/utils/renderQuestionText";

interface MockResultsScreenProps {
  onRetry: () => void;
  onHome: () => void;
}

const MockResultsScreen: React.FC<MockResultsScreenProps> = ({
  onRetry,
  onHome,
}) => {
  const navigate = useNavigate();
  const { lastResult, questions, answers } = useMockStore();
  const { isAuthenticated, isPro } = useUserStore();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  React.useEffect(() => {
    if (!lastResult || !questions || questions.length === 0) {
      navigate("/mock-exams", { replace: true });
    }
  }, [lastResult, questions, navigate]);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!lastResult || !questions || questions.length === 0) return null;

  const {
    jambScore,
    percentageScore,
    totalCorrect,
    totalQuestions,
    subjectBreakdown,
  } = lastResult;

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "Excellent":
        return "text-success";
      case "Good":
        return "text-brand";
      case "Average":
        return "text-warning";
      case "Poor":
        return "text-danger";
      default:
        return "text-textDim";
    }
  };

  const getPerformanceBg = (performance: string) => {
    switch (performance) {
      case "Excellent":
        return "bg-success/10 border-success/20";
      case "Good":
        return "bg-brand/10 border-brand/20";
      case "Average":
        return "bg-warning/10 border-warning/20";
      case "Poor":
        return "bg-danger/10 border-danger/20";
      default:
        return "bg-bgSurface border-borderMuted";
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Score Overview - Premium Card */}
      <div className="relative mb-10 overflow-hidden rounded-brand-2xl border border-borderMuted bg-bgCard p-10 shadow-2xl shadow-brand/15">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-success/10 blur-3xl" />
        <div className="relative z-10">
          <h2 className="text-textDim mb-6 text-sm font-black tracking-[0.35em] uppercase">
            Unified Mock Result
          </h2>
          <div className="inline-flex flex-col items-center gap-2">
            <div className="font-display text-brand text-8xl leading-none font-black tracking-tighter sm:text-[6rem]">
              {jambScore}
            </div>
            <div className="rounded-full bg-bgSurface/90 px-4 py-2 text-sm font-bold uppercase tracking-[0.24em] text-textDim shadow-sm">
              Out of 400
            </div>
          </div>

          <div className="mt-12 grid gap-4 border-t border-borderMuted/60 pt-10 md:grid-cols-3">
            <div className="rounded-[24px] bg-bgSurface/70 p-5 shadow-sm">
              <span className="text-textDim block text-[10px] font-black uppercase tracking-[0.35em]">
                Accuracy
              </span>
              <span className="font-display text-textMain mt-3 block text-3xl font-black">
                {percentageScore}%
              </span>
            </div>
            <div className="rounded-[24px] bg-bgSurface/70 p-5 shadow-sm">
              <span className="text-textDim block text-[10px] font-black uppercase tracking-[0.35em]">
                Correct
              </span>
              <span className="font-display text-textMain mt-3 block text-3xl font-black">
                {totalCorrect} / {totalQuestions}
              </span>
            </div>
            <div className="rounded-[24px] bg-bgSurface/70 p-5 shadow-sm">
              <span className="text-textDim block text-[10px] font-black uppercase tracking-[0.35em]">
                Status
              </span>
              <span
                className={cn(
                  "font-display mt-3 block text-3xl font-black",
                  getPerformanceColor(
                    subjectBreakdown[0]?.performance || "Good",
                  ),
                )}
              >
                {jambScore >= 250
                  ? "Excellent"
                  : jambScore >= 200
                    ? "Good"
                    : "Average"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-textDim mb-6 ml-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.35em]">
        <span className="h-2.5 w-2.5 rounded-full bg-brand inline-block" />
        Subject Performance
      </h3>
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2">
        {subjectBreakdown.map((sb) => (
          <div
            key={sb.subject}
            className="group overflow-hidden rounded-brand-2xl border border-borderMuted bg-bgCard p-6 shadow-sm transition-all hover:border-brand/30 hover:shadow-brand/10"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="group-hover:text-brand text-lg font-black tracking-tight transition-colors">
                  {sb.subject}
                </h3>
                <div
                  className={cn(
                    "mt-3 inline-flex rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em]",
                    getPerformanceBg(sb.performance),
                    getPerformanceColor(sb.performance),
                  )}
                >
                  {sb.performance}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-textMain text-2xl font-black">
                  {sb.score}%
                </div>
                <div className="text-textDim mt-1 text-[10px] font-black uppercase">
                  {sb.correct} / {sb.total}
                </div>
              </div>
            </div>
            <div className="rounded-full bg-bgSurface h-3 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  sb.score >= 75
                    ? "bg-success"
                    : sb.score >= 60
                      ? "bg-brand"
                      : sb.score >= 45
                        ? "bg-warning"
                        : "bg-danger",
                )}
                style={{ width: `${sb.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Question Review Section */}
      <div className="mb-16">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-textDim ml-1 flex items-center gap-2 text-xs font-black tracking-widest uppercase">
            <div className="bg-brand h-1.5 w-1.5 rounded-full"></div>
            Detailed Review
          </h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/review")}
            className="rounded-full px-4 py-2 text-[10px] font-black tracking-widest uppercase"
            icon={!isPro ? <Lock size={12} /> : undefined}
          >
            {isPro ? "Open Full Review" : "Unlock Review"}
          </Button>
        </div>

        {isPro ? (
          <div className="space-y-4">
            {subjectBreakdown.map((sb) => (
              <div
                key={`review-${sb.subject}`}
                className="border-borderMuted rounded-brand-xl bg-bgCard overflow-hidden border shadow-sm"
              >
                <button
                  onClick={() =>
                    setExpandedSubject(
                      expandedSubject === sb.subject ? null : sb.subject,
                    )
                  }
                  className="hover:bg-bgSurface group flex w-full items-center justify-between p-5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "font-display flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-black",
                        getPerformanceBg(sb.performance),
                        getPerformanceColor(sb.performance),
                      )}
                    >
                      {sb.score}
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black tracking-tight">
                        {sb.subject} Review
                      </span>
                      <span className="text-textDim text-[10px] font-bold tracking-widest uppercase">
                        {sb.total} Questions • {sb.correct} Correct
                      </span>
                    </div>
                  </div>
                  <div className="bg-bgSurface border-borderMuted group-hover:border-brand/30 flex h-8 w-8 items-center justify-center rounded-full border transition-all">
                    {expandedSubject === sb.subject ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </button>

                {expandedSubject === sb.subject && (
                  <div className="border-borderMuted bg-bgSurface/20 space-y-8 border-t p-5">
                    {questions
                      .map((q, i) => ({ ...q, globalIndex: i }))
                      .filter((q) => q.subject === sb.subject)
                      .map((q, idx) => {
                        const userAnswer = answers[q.globalIndex];
                        const isCorrect = userAnswer === q.answer;
                        const isUnanswered = userAnswer === undefined;

                        return (
                          <div key={q.id} className="relative">
                            <div className="mb-4 flex items-start gap-4">
                              <div
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-black shadow-sm",
                                  isCorrect
                                    ? "bg-success/10 border-success/30 text-success"
                                    : isUnanswered
                                      ? "bg-bgSurface border-borderMuted text-textDim"
                                      : "bg-danger/10 border-danger/30 text-danger",
                                )}
                              >
                                {idx + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                {q.instruction && (
                                  <div className="bg-bgCard border-brand text-textMain/80 mb-4 rounded-r-lg border-l-2 p-4 text-xs leading-relaxed whitespace-pre-line italic shadow-sm">
                                    {q.instruction.replace(/<[^>]*>/g, "")}
                                  </div>
                                )}
                                <p className="text-textMain mb-6 text-sm leading-relaxed font-bold sm:text-base">
                                   {renderQuestionText(q.text, q.subject)}
                                </p>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  {q.options.map((opt, optIdx) => (
                                    <div
                                      key={optIdx}
                                      className={cn(
                                        "flex items-center justify-between rounded-xl border px-4 py-3 text-xs transition-all sm:text-sm",
                                        optIdx === q.answer
                                          ? "bg-success/10 border-success/40 text-success font-black shadow-sm"
                                          : optIdx === userAnswer
                                            ? "bg-danger/10 border-danger/40 text-danger font-bold"
                                            : "bg-bgCard border-borderMuted text-textDim hover:border-white/10",
                                      )}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold opacity-40">
                                          {String.fromCharCode(65 + optIdx)}.
                                        </span>
                                        <span>{opt}</span>
                                      </div>
                                      {optIdx === q.answer && (
                                        <CheckCircle
                                          size={16}
                                          className="shrink-0"
                                        />
                                      )}
                                      {optIdx === userAnswer &&
                                        optIdx !== q.answer && (
                                          <XCircle
                                            size={16}
                                            className="shrink-0"
                                          />
                                        )}
                                    </div>
                                  ))}
                                </div>

                                <div className="border-borderMuted/50 mt-6 flex flex-col gap-4 border-t pt-4">
                                  <div className="flex items-center gap-2">
                                    {isCorrect ? (
                                      <span className="text-success flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase">
                                        <div className="bg-success h-1 w-1 rounded-full"></div>{" "}
                                        Correct Response
                                      </span>
                                    ) : isUnanswered ? (
                                      <span className="text-textDim flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase">
                                        <div className="bg-textDim h-1 w-1 rounded-full"></div>{" "}
                                        No Response Provided
                                      </span>
                                    ) : (
                                      <span className="text-danger flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase">
                                        <div className="bg-danger h-1 w-1 rounded-full"></div>{" "}
                                        Incorrect Response
                                      </span>
                                    )}
                                  </div>
                                  {q.explanation && (
                                    <div className="bg-brand/5 text-textMain border-brand/10 rounded-xl border p-5 text-xs leading-relaxed shadow-inner sm:text-sm">
                                      <div className="mb-2 flex items-center gap-2">
                                        <AlertCircle
                                          size={14}
                                          className="text-brand"
                                        />
                                        <span className="text-brand text-[10px] font-black tracking-widest uppercase">
                                          Explanation
                                        </span>
                                      </div>
                                      {q.explanation.replace(/<[^>]*>/g, "")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {idx !==
                              questions.filter(
                                (quest) => quest.subject === sb.subject,
                              ).length -
                                1 && (
                              <div className="via-borderMuted my-10 h-px bg-linear-to-r from-transparent to-transparent opacity-30"></div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-bgCard border-borderMuted rounded-brand-2xl border p-12 text-center shadow-sm">
            <div className="bg-brand/10 text-brand mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <Lock size={32} />
            </div>
            <h4 className="text-textMain mb-2 text-xl font-black">
              Review is Locked
            </h4>
            <p className="text-textMuted mx-auto mb-8 max-w-sm text-sm">
              Upgrade to Schooldra Pro to access detailed explanations, AI-powered
              insights, and a professional review of all your answers.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/review")}
              className="shadow-brand/20 mx-auto flex items-center gap-2 px-10 text-sm font-black shadow-lg"
            >
              <Sparkles size={18} />
              Unlock Pro Review
            </Button>
          </div>
        )}
      </div>

      {/* Guest Prompt - Fixed Positioning */}
      {!isAuthenticated && (
        <div className="bg-brand/5 border-brand/10 rounded-brand-2xl relative mb-12 overflow-hidden border p-10 text-center shadow-inner">
          <div className="bg-brand/10 absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"></div>
          <h4 className="text-brand mb-3 text-xl font-black tracking-tight">
            Save your official performance!
          </h4>
          <p className="text-textDim mx-auto mb-8 max-w-md text-sm leading-relaxed">
            Create a free account to track your JAMB score progress, unlock
            AI-powered explanations, and compete on the leaderboard.
          </p>
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="lg"
              className="shadow-brand/20 px-10 text-sm font-black shadow-lg"
            >
              Create Account
            </Button>
          </div>
        </div>
      )}

      {/* Final Actions */}
      <div className="mb-20 flex flex-col gap-4 sm:flex-row">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={onHome}
          className="bg-bgCard border-borderMuted order-2 h-14 text-sm font-black tracking-tight sm:order-1"
        >
          Back to Dashboard
        </Button>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onRetry}
          className="shadow-brand/20 order-1 h-14 text-sm font-black tracking-tight shadow-lg sm:order-2"
        >
          Start New Attempt
        </Button>
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
    </div>
  );
};

export default MockResultsScreen;
