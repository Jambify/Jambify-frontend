// src/Pages/Performance.tsx (FIXED)

import React, { useState, useEffect } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { usePerformanceStore } from "../Store/usePerformanceStore";
import { useUserStore } from "../Store/UseUserStore";
import WeeklyChart from "../components/Performance/WeeklyChart";
import TopicStats from "../components/Performance/TopicStats";
import MockScores from "../components/Performance/MockScores";
import PageLoader from "../components/ui/PageLoader";

const Performance: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    topicStats,
    totalQuestions,
    avgAccuracy,
    isLoading,
    loadPerformanceData,
  } = usePerformanceStore();
  const { questionsCompleted } = useUserStore();

  useEffect(() => {
    console.log("🔵 Loading performance data...");
    loadPerformanceData();
  }, [loadPerformanceData]);

  // Use questionsCompleted as fallback if totalQuestions is 0
  const displayTotalQuestions =
    totalQuestions > 0 ? totalQuestions : questionsCompleted;

  const weakCount = topicStats.filter((t) => t.accuracy < 60).length;
  const strongCount = topicStats.filter((t) => t.accuracy >= 75).length;

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
      <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-textMain">
              Performance Insights
            </h1>
            <p className="text-textDim mt-1">
              Detailed breakdown of your academic progress
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-textDim bg-bgCard border border-borderMuted px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-success rounded-full" />
            LIVE DATA SYNCED
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Questions"
            value={displayTotalQuestions.toLocaleString()}
            sub="questions answered"
            color="text-brand"
            icon="📊"
            iconBg="bg-brand/10"
          />
          <StatCard
            label="Average Accuracy"
            value={`${Math.round(avgAccuracy)}%`}
            sub="across all subjects"
            color="text-success"
            icon="🎯"
            iconBg="bg-success/10"
          />
          <StatCard
            label="Weak Topics"
            value={weakCount.toString()}
            sub="accuracy below 60%"
            color="text-danger"
            icon="⚠️"
            iconBg="bg-danger/10"
          />
          <StatCard
            label="Strong Topics"
            value={strongCount.toString()}
            sub="accuracy above 75%"
            color="text-warn"
            icon="🔥"
            iconBg="bg-warn/10"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weekly Activity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">
                Weekly Activity
              </h3>
              <span className="text-xs text-textDim">Last 7 days</span>
            </div>
            <WeeklyChart />
          </div>

          {/* Mock Exam History */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg">Mock History</h3>
            <MockScores />
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg">Subject Breakdown</h3>
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
  <div className="bg-bgCard border border-borderMuted rounded-3xl p-6 hover:border-brand/20 transition-all group relative overflow-hidden">
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 transition-transform group-hover:scale-110 ${iconBg}`}
    >
      {icon}
    </div>
    <p className="text-[11px] text-textDim uppercase tracking-widest font-bold mb-1">
      {label}
    </p>
    <div className="flex items-baseline gap-1">
      <h4
        className={`font-display text-3xl font-black tracking-tighter ${color}`}
      >
        {value}
      </h4>
    </div>
    <p className="text-[10px] text-textDim mt-1 font-medium">{sub}</p>

    {/* Decorative line */}
    <div
      className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${iconBg.replace(
        "/10",
        "/30",
      )}`}
    />
  </div>
);

export default Performance;
