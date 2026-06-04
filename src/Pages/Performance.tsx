// src/Pages/Performance.tsx (FIXED)

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { usePerformanceStore } from "../Store/usePerformanceStore";
import { useUserStore } from "../Store/useUserStore";
import { useQuizStore } from "../Store/useQuizStore";
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
      <div className="max-w-350 mx-auto space-y-8 animate-fadeIn px-2 lg:px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight text-textMain">
              Performance Insights
            </h1>
            <p className="text-textDim mt-1 lg:text-lg">
              Detailed breakdown of your academic progress
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-textDim bg-bgCard border border-borderMuted px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            LIVE DATA SYNCED
          </div>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Detailed Stats - Left/Center Column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <div className="bg-bgCard border border-borderMuted rounded-brand-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-display text-xl font-bold text-textMain">
                    Weekly activity
                  </h3>
                  <p className="text-xs text-textDim font-medium">
                    Questions answered in last 7 days
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand bg-brand/5 px-3 py-1.5 rounded-full border border-brand/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  Live
                </div>
              </div>
              <div className="h-75 lg:h-100">
                <WeeklyChart />
              </div>
            </div>

            {/* Subject Selection Grid - Only user subjects */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {userSubjectsWithIcons.map((s) => (
                <button
                  key={s.name}
                  onClick={() => {
                    useQuizStore.getState().setSelectedSubject(s.name);
                    navigate("/quiz");
                  }}
                  className="flex flex-col items-center gap-4 p-5 rounded-brand-2xl bg-bgCard border border-borderMuted hover:border-brand/40 transition-all group active:scale-95 shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-bgSurface flex items-center justify-center text-2xl group-hover:scale-110 transition-transform group-hover:bg-brand/5">
                    {s.icon}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-textDim group-hover:text-textMain">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mock Performance Center - Right Sidebar/Column */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="bg-bgCard border border-borderMuted rounded-brand-2xl p-6 lg:p-8 relative overflow-hidden group shadow-sm flex flex-col h-full">
              {/* Background Decorative Element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-brand/10"></div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-display text-xl font-bold text-textMain">
                    Mock Exam Performance
                  </h3>
                  <p className="text-xs text-textDim font-medium">
                    Analysis of your full-length CBT attempts
                  </p>
                </div>
                <button
                  onClick={() => navigate("/mock-exams")}
                  className="p-2 rounded-full bg-bgSurface hover:bg-brand/10 text-brand transition-colors group/btn"
                >
                  <ArrowRight
                    size={18}
                    className="group-hover/btn:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>

              {/* Main Score Display */}
              <div className="grid grid-cols-1 gap-6 relative z-10 flex-1">
                {/* Best Score Card */}
                <div className="bg-bgSurface/40 border border-borderMuted/60 rounded-brand-2xl p-6 flex flex-col justify-between transition-all hover:border-brand/40 hover:bg-bgSurface/60 group/card">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center group-hover/card:scale-110 transition-transform">
                        <Target size={20} className="text-brand" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-textDim">
                        Personal Best
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl xl:text-7xl font-display font-black text-brand tracking-tighter">
                        {bestScore || "0"}
                      </span>
                      <span className="text-lg font-bold text-textDim uppercase">
                        / 400
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-borderMuted/30 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-textDim uppercase tracking-wider">
                      Highest Unified Score
                    </span>
                    <div className="flex items-center gap-1.5 text-success bg-success/10 px-2 py-1 rounded-md">
                      <Zap size={12} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-tight">
                        Elite
                      </span>
                    </div>
                  </div>
                </div>

                {/* Latest Score Card */}
                <div className="bg-bgSurface/40 border border-borderMuted/60 rounded-brand-2xl p-6 flex flex-col justify-between transition-all hover:border-success/40 hover:bg-bgSurface/60 group/card">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center group-hover/card:scale-110 transition-transform">
                        <Clock size={20} className="text-success" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-textDim">
                        Latest Attempt
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl xl:text-7xl font-display font-black text-textMain tracking-tighter">
                        {mockHistory.length > 0
                          ? mockHistory[0].jambScore
                          : "0"}
                      </span>
                      <span className="text-lg font-bold text-textDim uppercase">
                        / 400
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-borderMuted/30 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-textDim uppercase tracking-wider">
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
                        <span className="text-[10px] font-black text-success uppercase tracking-widest bg-success/10 px-2.5 py-1 rounded">
                          New Record
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {/* Unified Progress Section */}
              <div className="mt-8 p-6 lg:p-7 bg-bgDeep/40 rounded-brand-2xl border border-borderMuted/40 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center text-white shadow-xl shadow-brand/20">
                      <Trophy size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-textMain">
                        Progress to Target
                      </h4>
                      <p className="text-[11px] text-textDim font-medium">
                        JAMB Admission Goal: 320 Points
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-display font-black text-brand leading-none">
                      {Math.min(Math.round((bestScore / 320) * 100), 100)}%
                    </div>
                    <span className="text-[10px] font-bold text-textDim uppercase tracking-tighter">
                      Completed
                    </span>
                  </div>
                </div>

                <div className="h-5 bg-bgDeep rounded-full overflow-hidden border border-borderMuted/20 p-1.5">
                  <div
                    className="h-full bg-linear-to-r from-brand/60 via-brand to-brand-light rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(123,95,255,0.5)] relative"
                    style={{
                      width: `${Math.min((bestScore / 320) * 100, 100)}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-size-[20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-textDim font-bold italic flex items-center gap-2">
                    <Sparkles size={14} className="text-brand" />
                    {bestScore >= 320
                      ? "Target achieved! You're ready."
                      : `Need ${320 - bestScore} more for target.`}
                  </p>
                  <span className="text-[11px] font-black text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">
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
            <h3 className="font-display font-bold text-2xl text-textMain">
              Subject Breakdown
            </h3>
            <div className="h-px flex-1 bg-borderMuted/50 mx-6 hidden md:block" />
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
  <div className="bg-bgCard border border-borderMuted rounded-4xl p-6 lg:p-7 hover:border-brand/30 transition-all group relative overflow-hidden shadow-sm hover:shadow-md">
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110 shadow-sm ${iconBg}`}
    >
      {icon}
    </div>
    <p className="text-[11px] lg:text-xs text-textDim uppercase tracking-widest font-black mb-1.5">
      {label}
    </p>
    <div className="flex items-baseline gap-1">
      <h4
        className={`font-display text-3xl lg:text-4xl font-black tracking-tighter ${color}`}
      >
        {value}
      </h4>
    </div>
    <p className="text-[11px] text-textDim mt-2 font-medium">{sub}</p>

    {/* Decorative gradient corner */}
    <div
      className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity ${iconBg.replace(
        "/10",
        "/60",
      )}`}
    />
  </div>
);

export default Performance;
