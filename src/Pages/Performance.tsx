// src/Pages/Performance.tsx (FIXED)

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { usePerformanceStore } from "../Store/usePerformanceStore";
import { useUserStore } from "../Store/useUserStore";
import WeeklyChart from "../components/Performance/WeeklyChart";
import TopicStats from "../components/Performance/TopicStats";
import PageLoader from "../components/ui/PageLoader";
import { ArrowRight, Clock, Sparkles, Target, Trophy, Zap } from "lucide-react";

const getSubjectIcon = (subject: string) => {
  const icons: Record<string, string> = {
    English: "📚",
    Mathematics: "🔢",
    Physics: "⚛️",
    Chemistry: "🧪",
    Biology: "🧬",
  };
  return icons[subject] || "📖";
};

const Performance: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    topicStats,
    mockHistory, // Added from performance store
    totalQuestions,
    avgAccuracy,
    isLoading,
    loadPerformanceData,
  } = usePerformanceStore();
  const { questionsCompleted, subjectCombo, bestScore, accuracy } =
    useUserStore();
  // Removed mockHistory from useMockStore since it's fetched from DB in performanceStore

  useEffect(() => {
    console.log("🔵 Loading performance data...");
    loadPerformanceData();
  }, [loadPerformanceData]);

  // Use the profile accuracy if available, fallback to session accuracy
  const displayAccuracy = accuracy > 0 ? accuracy : avgAccuracy;

  // Use questionsCompleted as fallback if totalQuestions is 0
  const displayTotalQuestions =
    totalQuestions > 0 ? totalQuestions : questionsCompleted;

  // Filter stats based on user subject combo
  const userSubjects = subjectCombo
    ? subjectCombo.split(",").map((s) => s.trim())
    : [];
  const filteredTopicStats = topicStats.filter((t) =>
    userSubjects.includes(t.subject),
  );

  // Highest and Lowest topic logic
  const sortedTopics = [...filteredTopicStats].sort(
    (a, b) => b.accuracy - a.accuracy,
  );
  const highestTopic = sortedTopics.length > 0 ? sortedTopics[0] : null;
  const lowestTopic =
    sortedTopics.length > 1 ? sortedTopics[sortedTopics.length - 1] : null;

  const userSubjectsWithIcons = userSubjects.map((name) => ({
    name,
    icon: getSubjectIcon(name),
  }));

  if (isLoading) {
    return (
      <AppLayout
        currentPage="performance"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <PageLoader message="Analyzing your performance..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      currentPage="performance"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="animate-fadeIn mx-auto max-w-350 space-y-8 px-2 lg:px-4">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-textMain text-3xl font-bold tracking-tight lg:text-4xl">
              Performance Insights
            </h1>
            <p className="text-textDim mt-1 lg:text-lg">
              Detailed breakdown of your academic progress
            </p>
          </div>
          <div className="text-textDim bg-bgCard border-borderMuted flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm">
            <span className="bg-success h-2 w-2 animate-pulse rounded-full" />
            LIVE DATA SYNCED
          </div>
        </div>

        {/* Performance Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <StatCard
            label="Average Accuracy"
            value={`${Math.round(displayAccuracy)}%`}
            sub={displayAccuracy > 0 ? "Overall average" : "No data yet"}
            color="text-brand"
            icon="🎯"
            iconBg="bg-brand/10"
          />
          <StatCard
            label="Highest Topic"
            value={highestTopic ? highestTopic.name : "—"}
            sub={
              highestTopic
                ? `${highestTopic.accuracy}% accuracy`
                : "Practice to see"
            }
            color="text-success"
            icon="🏆"
            iconBg="bg-success/10"
          />
          <StatCard
            label="Lowest Topic"
            value={lowestTopic ? lowestTopic.name : "—"}
            sub={
              lowestTopic
                ? `${lowestTopic.accuracy}% accuracy`
                : "Practice to see"
            }
            color="text-danger"
            icon="⚠️"
            iconBg="bg-danger/10"
          />
          <StatCard
            label="Questions Done"
            value={displayTotalQuestions.toLocaleString()}
            sub="Total attempted"
            color="text-warn"
            icon="📚"
            iconBg="bg-warn/10"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Detailed Stats - Left/Center Column */}
          <div className="space-y-8 lg:col-span-7 xl:col-span-8">
            <div className="bg-bgCard border-borderMuted rounded-brand-2xl border p-6 shadow-sm lg:p-8">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-display text-textMain text-xl font-bold">
                    Weekly activity
                  </h3>
                  <p className="text-textDim text-xs font-medium">
                    Questions answered in last 7 days
                  </p>
                </div>
                <div className="text-brand bg-brand/5 border-brand/10 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold">
                  <div className="bg-brand h-1.5 w-1.5 animate-pulse rounded-full" />
                  Live
                </div>
              </div>
              <div className="h-75 lg:h-100">
                <WeeklyChart />
              </div>
            </div>

            {/* Subject Selection Grid - Only user subjects */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {userSubjectsWithIcons.map((s) => (
                <button
                  key={s.name}
                  onClick={() => {
                    navigate(`/quiz?subject=${encodeURIComponent(s.name)}`);
                  }}
                  className="rounded-brand-2xl bg-bgCard border-borderMuted hover:border-brand/40 group flex flex-col items-center gap-4 border p-5 shadow-sm transition-all hover:shadow-md active:scale-95"
                >
                  <div className="bg-bgSurface group-hover:bg-brand/5 flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110">
                    {s.icon}
                  </div>
                  <span className="text-textDim group-hover:text-textMain text-[11px] font-black tracking-wider uppercase">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mock Performance Center - Right Sidebar/Column */}
          <div className="space-y-6 lg:col-span-5 xl:col-span-4">
            <div className="bg-bgCard border-borderMuted rounded-brand-2xl group relative flex h-full flex-col overflow-hidden border p-6 shadow-sm lg:p-8">
              {/* Background Decorative Element */}
              <div className="bg-brand/5 group-hover:bg-brand/10 absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full blur-3xl transition-colors"></div>

              <div className="relative z-10 mb-8 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-display text-textMain text-xl font-bold">
                    Mock Exam Performance
                  </h3>
                  <p className="text-textDim text-xs font-medium">
                    Analysis of your full-length CBT attempts
                  </p>
                </div>
                <button
                  onClick={() => navigate("/mock-exams")}
                  className="bg-bgSurface hover:bg-brand/10 text-brand group/btn rounded-full p-2 transition-colors"
                >
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover/btn:translate-x-0.5"
                  />
                </button>
              </div>

              {/* Main Score Display */}
              <div className="relative z-10 grid flex-1 grid-cols-1 gap-6">
                {/* Best Score Card */}
                <div className="bg-bgSurface/40 border-borderMuted/60 rounded-brand-2xl hover:border-brand/40 hover:bg-bgSurface/60 group/card flex flex-col justify-between border p-6 transition-all">
                  <div>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="bg-brand/10 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover/card:scale-110">
                        <Target size={20} className="text-brand" />
                      </div>
                      <span className="text-textDim text-xs font-black tracking-widest uppercase">
                        Personal Best
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-brand text-6xl font-black tracking-tighter xl:text-7xl">
                        {bestScore || "0"}
                      </span>
                      <span className="text-textDim text-lg font-bold uppercase">
                        / 400
                      </span>
                    </div>
                  </div>
                  <div className="border-borderMuted/30 mt-6 flex items-center justify-between border-t pt-4">
                    <span className="text-textDim text-[11px] font-bold tracking-wider uppercase">
                      Highest Unified Score
                    </span>
                    <div className="text-success bg-success/10 flex items-center gap-1.5 rounded-md px-2 py-1">
                      <Zap size={12} fill="currentColor" />
                      <span className="text-[10px] font-black tracking-tight uppercase">
                        Elite
                      </span>
                    </div>
                  </div>
                </div>

                {/* Latest Score Card */}
                <div className="bg-bgSurface/40 border-borderMuted/60 rounded-brand-2xl hover:border-success/40 hover:bg-bgSurface/60 group/card flex flex-col justify-between border p-6 transition-all">
                  <div>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover/card:scale-110">
                        <Clock size={20} className="text-success" />
                      </div>
                      <span className="text-textDim text-xs font-black tracking-widest uppercase">
                        Latest Attempt
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-textMain text-6xl font-black tracking-tighter xl:text-7xl">
                        {mockHistory.length > 0
                          ? mockHistory[0].jambScore
                          : "0"}
                      </span>
                      <span className="text-textDim text-lg font-bold uppercase">
                        / 400
                      </span>
                    </div>
                  </div>
                  <div className="border-borderMuted/30 mt-6 flex items-center justify-between border-t pt-4">
                    <span className="text-textDim text-[11px] font-bold tracking-wider uppercase">
                      {mockHistory.length > 0
                        ? new Date(mockHistory[0].date).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )
                        : "No attempts recorded"}
                    </span>
                    {mockHistory.length > 0 &&
                      mockHistory[0].jambScore >= bestScore &&
                      bestScore > 0 && (
                        <span className="text-success bg-success/10 rounded px-2.5 py-1 text-[10px] font-black tracking-widest uppercase">
                          New Record
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {/* Unified Progress Section */}
              <div className="bg-bgDeep/40 rounded-brand-2xl border-borderMuted/40 relative z-10 mt-8 border p-6 lg:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand shadow-brand/20 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-xl">
                      <Trophy size={24} />
                    </div>
                    <div>
                      <h4 className="text-textMain text-xs font-black tracking-widest uppercase">
                        Progress to Target
                      </h4>
                      <p className="text-textDim text-[11px] font-medium">
                        JAMB Admission Goal: 320 Points
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-brand text-3xl leading-none font-black">
                      {Math.min(Math.round((bestScore / 320) * 100), 100)}%
                    </div>
                    <span className="text-textDim text-[10px] font-bold tracking-tighter uppercase">
                      Completed
                    </span>
                  </div>
                </div>

                <div className="bg-bgDeep border-borderMuted/20 h-5 overflow-hidden rounded-full border p-1.5">
                  <div
                    className="from-brand/60 via-brand to-brand-light relative h-full rounded-full bg-linear-to-r shadow-[0_0_20px_rgba(123,95,255,0.5)] transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min((bestScore / 320) * 100, 100)}%`,
                    }}
                  >
                    <div className="absolute inset-0 animate-[shimmer_2s_linear_infinite] bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-size-[20px_20px]"></div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-textDim flex items-center gap-2 text-xs font-bold italic">
                    <Sparkles size={14} className="text-brand" />
                    {bestScore >= 320
                      ? "Target achieved! You're ready."
                      : `Need ${320 - bestScore} more for target.`}
                  </p>
                  <span className="text-brand bg-brand/10 rounded-full px-3 py-1 text-[11px] font-black tracking-widest uppercase">
                    Target: 320
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-textMain text-2xl font-bold">
              Subject Breakdown
            </h3>
            <div className="bg-borderMuted/50 mx-6 hidden h-px flex-1 md:block" />
          </div>
          <TopicStats />
        </div>
      </div>
    </AppLayout>
  );
};

/* Internal StatCard component for Performance page */
interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sub,
  color,
  icon,
  iconBg,
}) => (
  <div className="bg-bgCard border-borderMuted hover:border-brand/30 group relative overflow-hidden rounded-4xl border p-6 shadow-sm transition-all hover:shadow-md lg:p-7">
    <div
      className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-sm transition-transform group-hover:scale-110 ${iconBg}`}
    >
      {icon}
    </div>
    <p className="text-textDim mb-1.5 text-[11px] font-black tracking-widest uppercase lg:text-xs">
      {label}
    </p>
    <div className="flex items-baseline gap-1">
      <h4
        className={`font-display text-3xl font-black tracking-tighter lg:text-4xl ${color}`}
      >
        {value}
      </h4>
    </div>
    <p className="text-textDim mt-2 text-[11px] font-medium">{sub}</p>

    {/* Decorative gradient corner */}
    <div
      className={`absolute -right-2 -bottom-2 h-12 w-12 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-40 ${iconBg.replace(
        "/10",
        "/60",
      )}`}
    />
  </div>
);

export default Performance;
