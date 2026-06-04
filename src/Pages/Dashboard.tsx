// src/Pages/Dashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { useUserStore } from "../Store/useUserStore";
import { useExamCountdown } from "../hooks/useExamCountdown";
import SubjectProgress from "../components/Dashboard/SubjectProgress";
import LeaderboardCard from "../components/Dashboard/LeaderboardCard";
import RecommendedSessions from "../components/Dashboard/RecommendedSessions";
import DailyGoals from "../components/Dashboard/DailyGoals";
import {
  BookOpen,
  TrendingUp,
  Calendar,
  Clock,
  Flame,
  Target,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { cn } from "../lib/utils/utils";

// ── Countdown display helpers ─────────────────────────────
function countdownColor(days: number): string {
  if (days < 0) return "#6B7280"; // grey  — no date
  if (days === 0) return "#F97316"; // orange — exam day
  if (days <= 7) return "#EF4444"; // red   — critical
  if (days <= 30) return "#F59E0B"; // amber — soon
  return "#7B5FFF"; // brand — comfortable
}

function countdownBadge(days: number): { label: string; sublabel: string } {
  if (days < 0) return { label: "—", sublabel: "No date set" };
  if (days === 0) return { label: "Today", sublabel: "Exam day 🎯" };
  if (days === 1) return { label: "1", sublabel: "day remaining" };
  return { label: days.toString(), sublabel: "days remaining" };
}

function countdownMotivation(days: number): string {
  if (days < 0) return "";
  if (days === 0) return "🎯 Today is the day. You've got this!";
  if (days <= 7) return "⚡ Final sprint! Give it everything you have.";
  if (days <= 30) return "💪 Keep pushing — you're on track.";
  if (days <= 100) return "📈 Stay consistent and you'll get there.";
  return "🎯 You have plenty of time — stay consistent.";
}

import { usePerformanceStore } from "../Store/usePerformanceStore";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { topicStats, avgAccuracy, loadPerformanceData } =
    usePerformanceStore();

  const {
    name,
    streak,
    bestScore,
    questionsCompleted,
    totalQuestions,
    examYear,
    previousAccuracy,
    targetScore,
    university,
    subjectCombo,
  } = useUserStore();

  React.useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData]);

  const accuracy = Math.round(avgAccuracy);

  // Filter stats based on user subject combo
  const userSubjects = subjectCombo
    ? subjectCombo.split(",").map((s) => s.trim())
    : [];
  const filteredTopicStats = topicStats.filter((t: any) =>
    userSubjects.includes(t.subject),
  );

  // Dynamic weak/strong topics from live data
  const weakTopics = filteredTopicStats.filter((t: any) => t.accuracy < 60);

  // Highest and Lowest topic logic
  const sortedTopics = [...filteredTopicStats].sort(
    (a: any, b: any) => b.accuracy - a.accuracy,
  );
  const highestTopic = sortedTopics.length > 0 ? sortedTopics[0] : null;
  const lowestTopic =
    sortedTopics.length > 1 ? sortedTopics[sortedTopics.length - 1] : null;

  const { daysLeft, formattedDate, isUpdating } = useExamCountdown();

  const { label: cdLabel, sublabel: cdSublabel } = countdownBadge(daysLeft);
  const cdColor = countdownColor(daysLeft);
  const cdMotivation = countdownMotivation(daysLeft);

  const isNewUser = questionsCompleted === 0 && bestScore === 0;

  // Progress bar fill for questions
  const questionsPct =
    totalQuestions > 0
      ? Math.min(100, Math.round((questionsCompleted / totalQuestions) * 100))
      : 0;

  return (
    <AppLayout
      currentPage="dashboard"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      {/* ══════════════════════════════════════════════════
          HERO — two-column grid, no absolute positioning
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 mb-6">
        {/* ── Left: greeting + CTAs ─────────────────────── */}
        <div className="relative bg-bgCard border border-borderMuted rounded-brand-xl p-6 md:p-8 overflow-hidden">
          {/* Subtle ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 100% 50%, rgba(91,59,255,0.10) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10">
            {/* Tag line */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/10 border border-brand/20 text-[10px] font-bold tracking-widest uppercase text-brand-light">
                <Zap className="w-3 h-3" />
                JAMB {examYear} Prep
              </span>
              {university && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bgSurface border border-borderMuted text-[10px] text-textDim truncate max-w-50">
                  🎓 {university}
                </span>
              )}
            </div>

            {/* Greeting */}
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight leading-snug mb-1">
              Ready to ace it,
            </h2>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight leading-snug mb-4">
              <span className="text-brand-light">{name || "Champion"}</span>?
            </h2>

            <p className="text-sm text-textMuted mb-6 max-w-md leading-relaxed">
              {isNewUser
                ? "Welcome! Start your first quiz to track your progress and unlock your personalised dashboard."
                : weakTopics.length > 0
                  ? `Keep pushing — ${weakTopics.length} weak topics need attention today. Focus on ${lowestTopic?.name || "your weakest areas"} to improve.`
                  : `Great job! You've mastered your weak topics. Your strongest area is ${highestTopic?.name || "none yet"}. Keep it up!`}
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Primary pair — always visible, share width equally on mobile */}
              <div className="flex gap-2 sm:gap-3 flex-1 sm:flex-none min-w-0">
                <button
                  onClick={() => navigate("/quiz")}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-brand hover:bg-brand-light text-white px-3 sm:px-5 py-2.5 rounded-brand font-semibold text-sm whitespace-nowrap transition-all shadow-lg shadow-brand/30 active:scale-95"
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span className="sm:hidden">Daily Quiz</span>
                  <span className="hidden sm:inline">Start Daily Quiz</span>
                </button>
                <button
                  onClick={() => navigate("/mock-exams")}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-bgSurface hover:bg-bgDeep text-textMain border border-borderMuted px-3 sm:px-5 py-2.5 rounded-brand font-semibold text-sm whitespace-nowrap transition-all active:scale-95"
                >
                  <Target className="w-4 h-4 shrink-0" />
                  Mock Exam
                </button>
              </div>

              {/* View Progress — hidden on mobile, visible sm+ */}
              <button
                onClick={() => navigate("/performance")}
                className="hidden sm:inline-flex items-center gap-2 text-textDim hover:text-textMain px-4 py-2.5 rounded-brand font-medium text-sm whitespace-nowrap transition-all"
              >
                <TrendingUp className="w-4 h-4" />
                View Progress
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: countdown card ─────────────────────── */}
        <div
          className="relative overflow-hidden bg-bgCard border border-borderMuted rounded-brand-xl"
          style={{
            background: `linear-gradient(135deg, rgba(${cdColor === "#7B5FFF" ? "91,59,255" : cdColor === "#EF4444" ? "239,68,68" : cdColor === "#F59E0B" ? "245,158,11" : "249,115,22"},0.08) 0%, transparent 70%)`,
          }}
        >
          {/* ── Mobile: compact horizontal strip ── */}
          <div className="flex lg:hidden items-center justify-between px-5 py-4 gap-4">
            {/* Left: label + date */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-textDim">
                <Clock className="w-3 h-3" />
                Exam Countdown
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-textMuted mt-1">
                <Calendar className="w-3 h-3 shrink-0" />
                {formattedDate}
              </div>
              {targetScore && (
                <div className="mt-1.5 self-start px-2.5 py-0.5 rounded-full bg-bgSurface border border-borderMuted text-[10px] text-textDim font-medium">
                  Target: {targetScore}
                </div>
              )}
            </div>

            {/* Right: big number */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="font-display font-black leading-none tracking-tighter"
                style={{
                  fontSize: "2.75rem",
                  color: isUpdating ? "#6B7280" : cdColor,
                }}
              >
                {isUpdating ? "…" : cdLabel}
              </div>
              <div className="text-[11px] text-textDim font-medium mt-0.5">
                {isUpdating ? "Updating…" : cdSublabel}
              </div>
            </div>
          </div>

          {/* ── Desktop: original tall centered layout ── */}
          <div className="hidden lg:flex flex-col items-center justify-center px-8 py-6 gap-1 min-w-40">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-textDim mb-1">
              <Clock className="w-3 h-3" />
              Exam Countdown
            </div>
            <div
              className="font-display font-black leading-none tracking-tighter"
              style={{
                fontSize:
                  daysLeft > 99 ? "3.5rem" : daysLeft < 0 ? "2rem" : "4.5rem",
                color: isUpdating ? "#6B7280" : cdColor,
              }}
            >
              {isUpdating ? "…" : cdLabel}
            </div>
            <div className="text-xs text-textDim font-medium mt-0.5">
              {isUpdating ? "Updating…" : cdSublabel}
            </div>
            <div className="w-full h-px bg-borderMuted my-2" />
            <div className="flex items-center gap-1.5 text-[11px] text-textMuted">
              <Calendar className="w-3 h-3 shrink-0" />
              <span className="text-center leading-tight">{formattedDate}</span>
            </div>
            {targetScore && (
              <div className="mt-2 px-3 py-1 rounded-full bg-bgSurface border border-borderMuted text-[10px] text-textDim font-medium">
                Target: {targetScore}
              </div>
            )}
            {cdMotivation && (
              <p className="mt-3 text-[10px] text-textDim text-center leading-relaxed max-w-35">
                {cdMotivation}
              </p>
            )}
          </div>

          {/* Urgency ring when ≤7 days */}
          {daysLeft >= 0 && daysLeft <= 7 && (
            <div
              className="absolute inset-0 rounded-brand-xl pointer-events-none animate-pulse"
              style={{ boxShadow: `inset 0 0 0 1.5px ${cdColor}40` }}
            />
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          STATS ROW
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Best Score */}
        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-4 md:p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-textDim">
              Best Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-brand" />
            </div>
          </div>
          {bestScore > 0 ? (
            <>
              <p className="font-display text-3xl font-black tracking-tight text-textMain">
                {bestScore}
              </p>
              <p className="text-[11px] text-success font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Max JAMB Score
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-2xl font-black tracking-tight text-textDim">
                —
              </p>
              <p className="text-[11px] text-textDim leading-snug">
                Take a mock exam to see
              </p>
            </>
          )}
        </div>

        {/* Accuracy */}
        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-4 md:p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-textDim">
              Accuracy
            </span>
            <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
          </div>
          {questionsCompleted > 0 ? (
            <>
              <p className="font-display text-3xl font-black tracking-tight text-textMain">
                {accuracy}%
              </p>
              <p className="text-[11px] text-textDim font-medium">
                from {previousAccuracy}% last week
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-2xl font-black tracking-tight text-textDim">
                —
              </p>
              <p className="text-[11px] text-textDim leading-snug">
                Take your first quiz
              </p>
            </>
          )}
        </div>

        {/* Questions Done */}
        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-4 md:p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-textDim">
              Questions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p
            className={cn(
              "font-display font-black tracking-tight",
              questionsCompleted > 0
                ? "text-3xl text-textMain"
                : "text-2xl text-textDim",
            )}
          >
            {questionsCompleted > 0 ? questionsCompleted.toLocaleString() : "0"}
          </p>
          {questionsCompleted > 0 ? (
            <div>
              <div className="flex justify-between text-[10px] text-textDim mb-1">
                <span>{questionsPct}% complete</span>
                <span>{totalQuestions.toLocaleString()} total</span>
              </div>
              <div className="h-1.5 rounded-full bg-bgSurface overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${questionsPct}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-textDim leading-snug">
              Start practising
            </p>
          )}
        </div>

        {/* Streak */}
        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-4 md:p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-textDim">
              Streak
            </span>
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                streak > 0 ? "bg-orange-500/10" : "bg-bgSurface",
              )}
            >
              <Flame
                className={cn(
                  "w-4 h-4",
                  streak > 0 ? "text-orange-400" : "text-textDim",
                )}
              />
            </div>
          </div>
          {streak > 0 ? (
            <>
              <p className="font-display text-3xl font-black tracking-tight text-textMain">
                {streak}
                <span className="text-base font-semibold text-textDim ml-1">
                  days
                </span>
              </p>
              <p className="text-[11px] text-orange-400 font-medium flex items-center gap-1">
                <Flame className="w-3 h-3" /> Keep it going!
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-2xl font-black tracking-tight text-textDim">
                0
              </p>
              <p className="text-[11px] text-textDim leading-snug">
                Start your streak today
              </p>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MIDDLE ROW
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SubjectProgress />
        <LeaderboardCard />
      </div>

      {/* ══════════════════════════════════════════════════
          BOTTOM ROW
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecommendedSessions />
        <DailyGoals />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
