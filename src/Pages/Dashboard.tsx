// src/Pages/Dashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { useUserStore } from "../Store/useUserStore";
import { useExamCountdown } from "../hooks/useExamCountdown";
import SubjectProgress from "../components/Dashboard/SubjectProgress";
// import LeaderboardCard from "../components/Dashboard/LeaderboardCard";
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
import { SUBJECT_COMBO_MAP } from "../Store/useSubjectStore";

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
  const userSubjects = Array.isArray(subjectCombo) 
    ? subjectCombo 
    : subjectCombo
    ? SUBJECT_COMBO_MAP[subjectCombo] || [subjectCombo]
    : [];
  const filteredTopicStats = topicStats.filter((t: any) =>
    userSubjects.some((s) => s.toLowerCase() === t.subject.toLowerCase()),
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
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
        {/* ── Left: greeting + CTAs ─────────────────────── */}
        <div className="bg-bgCard border-borderMuted rounded-brand-xl relative overflow-hidden border p-6 md:p-8">
          {/* Subtle ambient glow */}
          <div
            className="pointer-events-none absolute inset-0 ambient-glow"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 100% 50%, rgba(91,59,255,0.10) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10">
            {/* Tag line */}
            <div className="mb-3 flex items-center gap-2">
              <span className="bg-brand/10 border-brand/20 text-brand-light inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase">
                <Zap className="h-3 w-3" />
                JAMB {examYear} Prep
              </span>
              {university && (
                <span className="bg-bgSurface border-borderMuted text-textDim inline-flex max-w-50 items-center gap-1.5 truncate rounded-full border px-2.5 py-1 text-[10px]">
                  🎓 {university}
                </span>
              )}
            </div>

            {/* Greeting */}
            <h2 className="font-display mb-1 text-2xl leading-snug font-bold tracking-tight md:text-3xl">
              Ready to ace it,
            </h2>
            <h2 className="font-display mb-4 text-2xl leading-snug font-bold tracking-tight md:text-3xl">
              <span className="text-brand-light">{name || "Champion"}</span>?
            </h2>

            <p className="text-textMuted mb-6 max-w-md text-sm leading-relaxed">
              {isNewUser
                ? "Welcome! Start your first quiz to track your progress and unlock your personalised dashboard."
                : weakTopics.length > 0
                  ? `Keep pushing — ${weakTopics.length} weak topics need attention today. Focus on ${lowestTopic?.name || "your weakest areas"} to improve.`
                  : `Great job! You've mastered your weak topics. Your strongest area is ${highestTopic?.name || "none yet"}. Keep it up!`}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Primary pair — always visible, share width equally on mobile */}
              <div className="flex min-w-0 flex-1 gap-2 sm:flex-none sm:gap-3">
                <button
                  onClick={() => navigate("/quiz")}
                  className="bg-brand hover:bg-brand-light rounded-brand shadow-brand/30 inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-lg transition-all active:scale-95 sm:flex-none sm:gap-2 sm:px-5"
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="sm:hidden">Daily Quiz</span>
                  <span className="hidden sm:inline">Start Daily Quiz</span>
                </button>
                <button
                  onClick={() => navigate("/mock-exams")}
                  className="bg-bgSurface hover:bg-bgDeep text-textMain border-borderMuted rounded-brand inline-flex flex-1 items-center justify-center gap-1.5 border px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-all active:scale-95 sm:flex-none sm:gap-2 sm:px-5"
                >
                  <Target className="h-4 w-4 shrink-0" />
                  Mock Exam
                </button>
              </div>

              {/* View Progress — hidden on mobile, visible sm+ */}
              <button
                onClick={() => navigate("/performance")}
                className="text-textDim hover:text-textMain rounded-brand hidden items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all sm:inline-flex"
              >
                <TrendingUp className="h-4 w-4" />
                View Progress
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: countdown card ─────────────────────── */}
        <div
          className="bg-bgCard border-borderMuted rounded-brand-xl relative overflow-hidden border"
          style={{
            background: `linear-gradient(135deg, rgba(${cdColor === "#7B5FFF" ? "91,59,255" : cdColor === "#EF4444" ? "239,68,68" : cdColor === "#F59E0B" ? "245,158,11" : "249,115,22"}, var(--cd-opacity, 0.08)) 0%, transparent 70%)`,
          }}
        >
          {/* ── Mobile: compact horizontal strip ── */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 lg:hidden">
            {/* Left: label + date */}
            <div className="flex flex-col gap-0.5">
              <div className="text-textDim flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                <Clock className="h-3 w-3" />
                Exam Countdown
              </div>
              <div className="text-textMuted mt-1 flex items-center gap-1.5 text-[11px]">
                <Calendar className="h-3 w-3 shrink-0" />
                {formattedDate}
              </div>
              {targetScore && (
                <div className="bg-bgSurface border-borderMuted text-textDim mt-1.5 self-start rounded-full border px-2.5 py-0.5 text-[10px] font-medium">
                  Target: {targetScore}
                </div>
              )}
            </div>

            {/* Right: big number */}
            <div className="flex shrink-0 flex-col items-center">
              <div
                className="font-display leading-none font-black tracking-tighter"
                style={{
                  fontSize: "2.75rem",
                  color: isUpdating ? "#6B7280" : cdColor,
                }}
              >
                {isUpdating ? "…" : cdLabel}
              </div>
              <div className="text-textDim mt-0.5 text-[11px] font-medium">
                {isUpdating ? "Updating…" : cdSublabel}
              </div>
            </div>
          </div>

          {/* ── Desktop: original tall centered layout ── */}
          <div className="hidden min-w-40 flex-col items-center justify-center gap-1 px-8 py-6 lg:flex">
            <div className="text-textDim mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
              <Clock className="h-3 w-3" />
              Exam Countdown
            </div>
            <div
              className="font-display leading-none font-black tracking-tighter"
              style={{
                fontSize:
                  daysLeft > 99 ? "3.5rem" : daysLeft < 0 ? "2rem" : "4.5rem",
                color: isUpdating ? "#6B7280" : cdColor,
              }}
            >
              {isUpdating ? "…" : cdLabel}
            </div>
            <div className="text-textDim mt-0.5 text-xs font-medium">
              {isUpdating ? "Updating…" : cdSublabel}
            </div>
            <div className="bg-borderMuted my-2 h-px w-full" />
            <div className="text-textMuted flex items-center gap-1.5 text-[11px]">
              <Calendar className="h-3 w-3 shrink-0" />
              <span className="text-center leading-tight">{formattedDate}</span>
            </div>
            {targetScore && (
              <div className="bg-bgSurface border-borderMuted text-textDim mt-2 rounded-full border px-3 py-1 text-[10px] font-medium">
                Target: {targetScore}
              </div>
            )}
            {cdMotivation && (
              <p className="text-textDim mt-3 max-w-35 text-center text-[10px] leading-relaxed">
                {cdMotivation}
              </p>
            )}
          </div>

          {/* Urgency ring when ≤7 days */}
          {daysLeft >= 0 && daysLeft <= 7 && (
            <div
              className="rounded-brand-xl pointer-events-none absolute inset-0 animate-pulse"
              style={{ boxShadow: `inset 0 0 0 1.5px ${cdColor}40` }}
            />
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          STATS ROW
      ══════════════════════════════════════════════════ */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Best Score */}
        <div className="bg-bgCard border-borderMuted rounded-brand-xl flex flex-col gap-1.5 border p-4 transition-all hover:border-brand/20 md:p-5">
          <div className="flex items-center justify-between">
            <span className="text-textDim text-[9px] font-bold tracking-widest uppercase sm:text-[10px]">
              Best Score
            </span>
            <div className="bg-brand/10 flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8">
              <Target className="text-brand h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          {bestScore > 0 ? (
            <>
              <p className="font-display text-textMain text-2xl font-black tracking-tight sm:text-3xl">
                {bestScore}
              </p>
              <p className="text-success flex items-center gap-1 text-[10px] font-medium sm:text-[11px]">
                <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                Max JAMB
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-textDim text-xl font-black tracking-tight sm:text-2xl">
                —
              </p>
              <p className="text-textDim text-[10px] leading-snug sm:text-[11px]">
                Take mock exam
              </p>
            </>
          )}
        </div>

        {/* Accuracy */}
        <div className="bg-bgCard border-borderMuted rounded-brand-xl flex flex-col gap-1.5 border p-4 transition-all hover:border-success/20 md:p-5">
          <div className="flex items-center justify-between">
            <span className="text-textDim text-[9px] font-bold tracking-widest uppercase sm:text-[10px]">
              Accuracy
            </span>
            <div className="bg-success/10 flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8">
              <CheckCircle2 className="text-success h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          {questionsCompleted > 0 ? (
            <>
              <p className="font-display text-textMain text-2xl font-black tracking-tight sm:text-3xl">
                {accuracy}%
              </p>
              <p className="text-textDim text-[10px] font-medium sm:text-[11px]">
                Up from {previousAccuracy}%
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-textDim text-xl font-black tracking-tight sm:text-2xl">
                —
              </p>
              <p className="text-textDim text-[10px] leading-snug sm:text-[11px]">
                Start first quiz
              </p>
            </>
          )}
        </div>

        {/* Questions Done */}
        <div className="bg-bgCard border-borderMuted rounded-brand-xl flex flex-col gap-1.5 border p-4 transition-all hover:border-blue-500/20 md:p-5">
          <div className="flex items-center justify-between">
            <span className="text-textDim text-[9px] font-bold tracking-widest uppercase sm:text-[10px]">
              Questions
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 sm:h-8 sm:w-8">
              <BookOpen className="h-3.5 w-3.5 text-blue-400 sm:h-4 sm:w-4" />
            </div>
          </div>
          <p
            className={cn(
              "font-display font-black tracking-tight",
              questionsCompleted > 0
                ? "text-textMain text-2xl sm:text-3xl"
                : "text-textDim text-xl sm:text-2xl",
            )}
          >
            {questionsCompleted > 0 ? questionsCompleted.toLocaleString() : "0"}
          </p>
          {questionsCompleted > 0 ? (
            <div>
              <div className="text-textDim mb-1 flex justify-between text-[9px] sm:text-[10px]">
                <span>{questionsPct}%</span>
                <span>{totalQuestions.toLocaleString()}</span>
              </div>
              <div className="bg-bgTrack h-1 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${questionsPct}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-textDim text-[10px] leading-snug sm:text-[11px]">
              Start practising
            </p>
          )}
        </div>

        {/* Streak */}
        <div className="bg-bgCard border-borderMuted rounded-brand-xl flex flex-col gap-1.5 border p-4 transition-all hover:border-orange-500/20 md:p-5">
          <div className="flex items-center justify-between">
            <span className="text-textDim text-[9px] font-bold tracking-widest uppercase sm:text-[10px]">
              Streak
            </span>
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8",
                streak > 0 ? "bg-orange-500/10" : "bg-bgSurface",
              )}
            >
              <Flame
                className={cn(
                  "h-3.5 w-3.5 sm:h-4 sm:w-4",
                  streak > 0 ? "text-orange-400" : "text-textDim",
                )}
              />
            </div>
          </div>
          {streak > 0 ? (
            <>
              <p className="font-display text-textMain text-2xl font-black tracking-tight sm:text-3xl">
                {streak}
                <span className="text-textDim ml-1 text-xs font-semibold sm:text-base">
                  days
                </span>
              </p>
              <p className="flex items-center gap-1 text-[10px] font-medium text-orange-400 sm:text-[11px]">
                Keep it up!
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-textDim text-xl font-black tracking-tight sm:text-2xl">
                0
              </p>
              <p className="text-textDim text-[10px] leading-snug sm:text-[11px]">
                Start today
              </p>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MIDDLE ROW
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SubjectProgress />
        <div className="space-y-4">
          <RecommendedSessions />
          <DailyGoals />
        </div>
        {/* <LeaderboardCard /> */}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
