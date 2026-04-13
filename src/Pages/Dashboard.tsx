import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { useUserStore } from '../Store/UseUserStore';
import StatCard from '../components/ui/StatCard';
import SubjectProgress from '../components/Dashboard/SubjectProgress';
import LeaderboardCard from '../components/Dashboard/LeaderboardCard';
import RecommendedSessions from '../components/Dashboard/RecommendedSessions';
import DailyGoals from '../components/Dashboard/DailyGoals';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    name,
    streak,
    overallScore,
    accuracy,
    questionsCompleted,
    totalQuestions,
    // schoolRank,
    examDate,
    daysToExam,
    weeklyScoreChange,
    previousAccuracy,
  } = useUserStore();

  return (
    <AppLayout currentPage="dashboard">

      {/* ── HERO ───────────────────────────────────────── */}
      <div className="relative bg-bgCard border border-borderMuted rounded-brand-xl p-8 mb-6 overflow-hidden">
        {/* subtle glow */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(circle at 80% 50%, rgba(91,59,255,0.08) 0%, transparent 60%)' }} />

        <div className="relative z-10 max-w-lg">
          <p className="text-[11px] tracking-widest uppercase text-brand-light font-medium mb-2">
            JAMB 2025 Preparation
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight mb-2 leading-tight">
            Ready to ace your exam,<br />
            <span className="text-brand-light">{name}</span>?
          </h2>
          <p className="text-sm text-textMuted mb-6">
            You're in the top 38% of students. Keep pushing — 3 weak topics need attention today.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate('/quiz')}
              className="bg-brand hover:bg-brand-light text-blue px-5 py-2.5 rounded-brand font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-brand/40"
            >
              ▶ Start Daily Quiz
            </button>
            <button
              onClick={() => navigate('/performance')}
              className="bg-bgSurface hover:bg-gray-800 text-textMain border border-white/10 px-5 py-2.5 rounded-brand font-medium text-sm transition-all"
            >
              View Progress
            </button>
          </div>
        </div>

        {/* Countdown card */}
        <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 bg-bgSurface border border-white/10 rounded-brand-lg p-5 text-center min-w-27.5">
          <div className="font-display text-5xl font-extrabold text-brand-light tracking-tighter">
            {daysToExam}
          </div>
          <div className="text-[11px] text-textDim uppercase tracking-widest mt-1">days left</div>
          <div className="text-[11px] text-textMuted mt-1">JAMB 2025 · {examDate}</div>
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          emoji="🎯"
          label="Overall Score"
          value={overallScore.toString()}
          change={`+${weeklyScoreChange} this week`}
          up
        />
        <StatCard
          emoji="✅"
          label="Accuracy"
          value={`${accuracy}%`}
          change={`from ${previousAccuracy}% last week`}
          up
        />
        <StatCard
          emoji="📚"
          label="Questions Done"
          value={questionsCompleted.toLocaleString()}
          change={`of ${totalQuestions.toLocaleString()} total`}
        />
        <StatCard
          emoji="🔥"
          label="Current Streak"
          value={`${streak} days`}
          change="Personal Best: 21"
          up={streak > 0}
        />
      </div>

      {/* ── MIDDLE ROW ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SubjectProgress />
        <LeaderboardCard />
      </div>

      {/* ── BOTTOM ROW ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecommendedSessions />
        <DailyGoals />
      </div>

    </AppLayout>
  );
};

export default Dashboard;