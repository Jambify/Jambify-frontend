// src/components/MockExam/MockResultScreen.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMockStore } from "../../Store/useMockStore";
import { useUserStore } from "../../Store/UseUserStore";
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
} from "lucide-react";

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

  if (!lastResult) return null;

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
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Score Overview - Premium Card */}
      <div className="relative overflow-hidden bg-bgCard border border-borderMuted rounded-brand-2xl p-10 mb-10 text-center shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-success/5 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <h2 className="text-sm font-black text-textDim uppercase tracking-[0.3em] mb-6">
            Unified Mock Result
          </h2>
          <div className="inline-flex flex-col items-center">
            <div className="text-8xl sm:text-9xl font-display font-black text-brand leading-none tracking-tighter">
              {jambScore}
            </div>
            <div className="text-lg font-bold text-textDim uppercase tracking-widest mt-2">
              Out of 400
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-12 pt-10 border-t border-borderMuted/50">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-textDim uppercase tracking-widest mb-1">
                Accuracy
              </span>
              <span className="text-3xl font-display font-black text-textMain">
                {percentageScore}%
              </span>
            </div>
            <div className="w-px h-12 bg-borderMuted hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-textDim uppercase tracking-widest mb-1">
                Correct
              </span>
              <span className="text-3xl font-display font-black text-textMain">
                {totalCorrect} / {totalQuestions}
              </span>
            </div>
            <div className="w-px h-12 bg-borderMuted hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-textDim uppercase tracking-widest mb-1">
                Status
              </span>
              <span
                className={cn(
                  "text-3xl font-display font-black",
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

      {/* Subject Breakdown - Grid */}
      <h3 className="text-xs font-black text-textDim uppercase tracking-widest mb-6 ml-1 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
        Subject Performance
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {subjectBreakdown.map((sb) => (
          <div
            key={sb.subject}
            className="group bg-bgCard border border-borderMuted rounded-brand-xl p-6 flex flex-col gap-4 hover:border-brand/30 transition-all shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-lg tracking-tight group-hover:text-brand transition-colors">
                  {sb.subject}
                </h3>
                <div
                  className={cn(
                    "inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border mt-1",
                    getPerformanceBg(sb.performance),
                    getPerformanceColor(sb.performance),
                  )}
                >
                  {sb.performance}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-display font-black text-textMain">
                  {sb.score}%
                </div>
                <div className="text-[10px] text-textDim uppercase font-black">
                  {sb.correct} / {sb.total}
                </div>
              </div>
            </div>
            <div className="h-2 bg-bgSurface rounded-full overflow-hidden p-0.5 border border-borderMuted/30">
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-textDim uppercase tracking-widest ml-1 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
            Detailed Review
          </h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/review")}
            className="rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest"
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
                className="border border-borderMuted rounded-brand-xl overflow-hidden bg-bgCard shadow-sm"
              >
                <button
                  onClick={() =>
                    setExpandedSubject(
                      expandedSubject === sb.subject ? null : sb.subject,
                    )
                  }
                  className="w-full flex items-center justify-between p-5 hover:bg-bgSurface transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg border flex items-center justify-center font-display font-black text-sm",
                        getPerformanceBg(sb.performance),
                        getPerformanceColor(sb.performance),
                      )}
                    >
                      {sb.score}
                    </div>
                    <div className="text-left">
                      <span className="font-black text-sm block tracking-tight">
                        {sb.subject} Review
                      </span>
                      <span className="text-[10px] text-textDim uppercase font-bold tracking-widest">
                        {sb.total} Questions • {sb.correct} Correct
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-bgSurface border border-borderMuted flex items-center justify-center group-hover:border-brand/30 transition-all">
                    {expandedSubject === sb.subject ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </button>

                {expandedSubject === sb.subject && (
                  <div className="p-5 space-y-8 border-t border-borderMuted bg-bgSurface/20">
                    {questions
                      .map((q, i) => ({ ...q, globalIndex: i }))
                      .filter((q) => q.subject === sb.subject)
                      .map((q, idx) => {
                        const userAnswer = answers[q.globalIndex];
                        const isCorrect = userAnswer === q.answer;
                        const isUnanswered = userAnswer === undefined;

                        return (
                          <div key={q.id} className="relative">
                            <div className="flex items-start gap-4 mb-4">
                              <div
                                className={cn(
                                  "shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-black shadow-sm",
                                  isCorrect
                                    ? "bg-success/10 border-success/30 text-success"
                                    : isUnanswered
                                      ? "bg-bgSurface border-borderMuted text-textDim"
                                      : "bg-danger/10 border-danger/30 text-danger",
                                )}
                              >
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                {q.instruction && (
                                  <div className="mb-4 p-4 bg-bgCard border-l-2 border-brand rounded-r-lg text-xs italic text-textMain/80 leading-relaxed whitespace-pre-line shadow-sm">
                                    {q.instruction.replace(/<[^>]*>/g, "")}
                                  </div>
                                )}
                                <p className="text-sm sm:text-base font-bold text-textMain leading-relaxed mb-6">
                                  {q.text}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {q.options.map((opt, optIdx) => (
                                    <div
                                      key={optIdx}
                                      className={cn(
                                        "px-4 py-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all",
                                        optIdx === q.answer
                                          ? "bg-success/10 border-success/40 text-success font-black shadow-sm"
                                          : optIdx === userAnswer
                                            ? "bg-danger/10 border-danger/40 text-danger font-bold"
                                            : "bg-bgCard border-borderMuted text-textDim hover:border-white/10",
                                      )}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="opacity-40 font-mono font-bold">
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

                                <div className="mt-6 pt-4 border-t border-borderMuted/50 flex flex-col gap-4">
                                  <div className="flex items-center gap-2">
                                    {isCorrect ? (
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-success flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-success"></div>{" "}
                                        Correct Response
                                      </span>
                                    ) : isUnanswered ? (
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-textDim flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-textDim"></div>{" "}
                                        No Response Provided
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-danger flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-danger"></div>{" "}
                                        Incorrect Response
                                      </span>
                                    )}
                                  </div>
                                  {q.explanation && (
                                    <div className="bg-brand/5 p-5 rounded-xl text-xs sm:text-sm text-textMain border border-brand/10 leading-relaxed shadow-inner">
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle
                                          size={14}
                                          className="text-brand"
                                        />
                                        <span className="font-black uppercase tracking-widest text-[10px] text-brand">
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
                              <div className="h-px bg-linear-to-r from-transparent via-borderMuted to-transparent my-10 opacity-30"></div>
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
          <div className="bg-bgCard border border-borderMuted rounded-brand-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h4 className="text-xl font-black text-textMain mb-2">
              Review is Locked
            </h4>
            <p className="text-sm text-textMuted mb-8 max-w-sm mx-auto">
              Upgrade to JAMBIFY Pro to access detailed explanations, AI-powered
              insights, and a professional review of all your answers.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/review")}
              className="px-10 shadow-lg shadow-brand/20 font-black text-sm flex items-center gap-2 mx-auto"
            >
              <Sparkles size={18} />
              Unlock Pro Review
            </Button>
          </div>
        )}
      </div>

      {/* Guest Prompt - Fixed Positioning */}
      {!isAuthenticated && (
        <div className="relative overflow-hidden bg-brand/5 border border-brand/10 rounded-brand-2xl p-10 mb-12 text-center shadow-inner">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <h4 className="text-xl font-black text-brand mb-3 tracking-tight">
            Save your official performance!
          </h4>
          <p className="text-sm text-textDim mb-8 max-w-md mx-auto leading-relaxed">
            Create a free account to track your JAMB score progress, unlock
            AI-powered explanations, and compete on the leaderboard.
          </p>
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="lg"
              className="px-10 shadow-lg shadow-brand/20 font-black text-sm"
            >
              Create Account
            </Button>
          </div>
        </div>
      )}

      {/* Final Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={onHome}
          className="order-2 sm:order-1 font-black text-sm tracking-tight h-14 bg-bgCard border-borderMuted"
        >
          Back to Dashboard
        </Button>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onRetry}
          className="order-1 sm:order-2 font-black text-sm tracking-tight h-14 shadow-lg shadow-brand/20"
        >
          Start New Attempt
        </Button>
      </div>
    </div>
  );
};

export default MockResultsScreen;
