import React from "react";
import AppLayout from "../components/Layout/AppLayout";
import { usePerformanceStore } from "../Store/usePerformanceStore";
import { useUserStore } from "../Store/UseUserStore";
import WeeklyChart from "../components/Performance/WeeklyChart";
import TopicStats from "../components/Performance/TopicStats";
import MockScores from "../components/Performance/MockScores";

const Performance: React.FC = () => {
  const { accuracy, overallScore, questionsCompleted, streak } = useUserStore();
  const { topicStats } = usePerformanceStore();

  const weakCount = topicStats.filter((t) => t.accuracy < 60).length;
  const strongCount = topicStats.filter((t) => t.accuracy >= 75).length;

  return (
    <AppLayout currentPage="performance">
      {/* <── Page header ── */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Performance
        </h2>
        <p className="text-sm text-textMuted mt-1">
          Track your progress, spot weak areas, and see how your scores are
          trending.
        </p>
      </div>

      {/* <── Top stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Overall score"
          value={overallScore.toString()}
          sub="out of 400"
          color="text-brand-light"
          icon="🎯"
          iconBg="bg-brand/10"
        />
        <StatCard
          label="Accuracy"
          value={`${accuracy}%`}
          sub="across all subjects"
          color="text-success"
          icon="✅"
          iconBg="bg-success/10"
        />
        <StatCard
          label="Questions done"
          value={questionsCompleted.toLocaleString()}
          sub="total answered"
          color="text-warn"
          icon="📚"
          iconBg="bg-warn/10"
        />
        <StatCard
          label="Study streak"
          value={`${streak} days`}
          sub="keep it going!"
          color="text-warn"
          icon="🔥"
          iconBg="bg-warn/10"
        />
      </div>

      {/* <── Weak / Strong summary pills ── */}
      {(weakCount > 0 || strongCount > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {weakCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-danger/10 border border-danger/20 rounded-brand text-xs text-danger">
              ⚠️{" "}
              <span>
                {weakCount} weak topic{weakCount > 1 ? "s" : ""} need attention
              </span>
            </div>
          )}
          {strongCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-brand text-xs text-success">
              ✓{" "}
              <span>
                {strongCount} strong topic{strongCount > 1 ? "s" : ""} — keep it
                up!
              </span>
            </div>
          )}
        </div>
      )}

      {/* <── Weekly activity chart ── */}
      <div className="mb-5">
        <WeeklyChart />
      </div>

      {/* <── Topic breakdown + Mock scores ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <TopicStats />
        <MockScores />
      </div>
    </AppLayout>
  );
};

/* ── Inline StatCard — small enough to live here ─────── */
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
  <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-4 sm:p-5">
    <div
      className={`w-9 h-9 ${iconBg} rounded-brand flex items-center justify-center text-lg mb-3`}
    >
      {icon}
    </div>
    <p className="text-[11px] text-textDim uppercase tracking-widest font-medium mb-1">
      {label}
    </p>
    <p className={`font-display text-2xl font-bold tracking-tight ${color}`}>
      {value}
    </p>
    <p className="text-[11px] text-textDim mt-1">{sub}</p>
  </div>
);

export default Performance;
