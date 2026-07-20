/**
 * src/admin/pages/AdminOverview.tsx
 * ───────────────────────────────────
 * Quick-glance stats for the admin dashboard.
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Crown, BookOpen, Activity, Loader2, Wallet, UserPlus } from 'lucide-react';
import { cn } from '../../lib/utils/utils';

interface Stats {
  totalUsers: number;
  proUsers: number;
  frozenUsers: number;
  totalQuizSessions: number;
  totalMockExams: number;
  avgAccuracy: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  activeRevenue: number;     // NEW
}

interface RecentSignup {
  id: string;
  name: string;
  university: string;
  created_at: string;
}

const Card: React.FC<{
  label: string; value: string | number;
  sub?: string; icon: React.ReactNode; color: string;
}> = ({ label, value, sub, icon, color }) => (
  <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest text-textDim">{label}</span>
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', color)}>{icon}</div>
    </div>
    <p className="font-display text-3xl font-black tracking-tight text-textMain">{value}</p>
    {sub && <p className="text-xs text-textDim">{sub}</p>}
  </div>
);

const AdminOverview: React.FC = () => {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]); // NEW
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const today     = new Date().toISOString().slice(0, 10);
        const weekAgo   = new Date(Date.now() - 7 * 86400_000).toISOString();

        const [profiles, sessions, mocks, newToday, newWeek, revenue, recent] = await Promise.all([
          supabase.from('profiles').select('is_pro, is_frozen, accuracy', { count: 'exact' }),
          supabase.from('quiz_sessions').select('id', { count: 'exact', head: true }),
          supabase.from('mock_exam_history').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', today),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
          // NEW — sum of currently-active subscriptions
          supabase.from('pro_users').select('amount, status, expires_at').eq('status', 'active'),
          // NEW — last 5 signups
          supabase.from('profiles').select('id, name, university, created_at').order('created_at', { ascending: false }).limit(5),
        ]);

        const rows      = (profiles.data ?? []) as any[];
        const proCount  = rows.filter(r => r.is_pro).length;
        const frozen    = rows.filter(r => r.is_frozen).length;
        const accs      = rows.map(r => r.accuracy ?? 0).filter(Boolean);
        const avgAcc    = accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 0;

        // NEW — only count rows that aren't actually expired
        const activeRevenue = ((revenue.data ?? []) as any[])
          .filter(r => !r.expires_at || new Date(r.expires_at) > new Date())
          .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

        setStats({
          totalUsers:        profiles.count ?? 0,
          proUsers:          proCount,
          frozenUsers:       frozen,
          totalQuizSessions: sessions.count ?? 0,
          totalMockExams:    mocks.count ?? 0,
          avgAccuracy:       avgAcc,
          newUsersToday:     newToday.count ?? 0,
          newUsersThisWeek:  newWeek.count ?? 0,
          activeRevenue,     // NEW
        });

        setRecentSignups((recent.data ?? []) as RecentSignup[]); // NEW
      } catch (err) {
        console.error('[AdminOverview]', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 text-brand animate-spin" />
    </div>
  );

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Total Users"    value={stats.totalUsers}
          sub={`+${stats.newUsersToday} today · +${stats.newUsersThisWeek} this week`}
          icon={<Users className="w-4 h-4 text-brand" />}          color="bg-brand/10" />
        <Card label="Pro Users"      value={stats.proUsers}
          sub={`${stats.totalUsers ? Math.round((stats.proUsers / stats.totalUsers) * 100) : 0}% of total`}
          icon={<Crown className="w-4 h-4 text-warn" />}            color="bg-warn/10" />
        <Card label="Quiz Sessions"  value={stats.totalQuizSessions.toLocaleString()}
          sub="All time practice sessions"
          icon={<BookOpen className="w-4 h-4 text-success" />}      color="bg-success/10" />
        <Card label="Mock Exams"     value={stats.totalMockExams.toLocaleString()}
          sub="Completed mock exams"
          icon={<Activity className="w-4 h-4 text-blue-400" />}     color="bg-blue-500/10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card label="Avg Accuracy"   value={`${stats.avgAccuracy}%`}
          sub="Across all users" icon={<Activity className="w-4 h-4 text-brand-light" />} color="bg-brand/10" />
        <Card label="Frozen Accounts" value={stats.frozenUsers}
          sub="Currently suspended" icon={<Users className="w-4 h-4 text-blue-400" />} color="bg-blue-500/10" />
        <Card label="Free Users"     value={stats.totalUsers - stats.proUsers}
          sub="Not yet upgraded" icon={<Users className="w-4 h-4 text-textDim" />} color="bg-bgSurface" />
      </div>

      {/* ── NEW ROW: Revenue + Recent Signups ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card label="Active Revenue" value={`₦${stats.activeRevenue.toLocaleString()}`}
          sub="Sum of currently active subscriptions"
          icon={<Wallet className="w-4 h-4 text-success" />} color="bg-success/10" />

        <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-textDim">Recent Signups</span>
            <UserPlus className="w-4 h-4 text-brand" />
          </div>
          {recentSignups.length === 0 ? (
            <p className="text-textDim text-xs">No signups yet</p>
          ) : (
            <div className="space-y-2">
              {recentSignups.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="text-textMain truncate font-medium">{u.name || '—'}</p>
                    <p className="text-textDim text-xs truncate">{u.university || 'No university set'}</p>
                  </div>
                  <span className="text-textDim text-[10px] shrink-0 ml-2">
                    {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-textDim mb-3">Quick Links</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '→ Manage Users',     href: '/admin/users' },
            { label: '→ Supabase Studio',  href: 'https://supabase.com/dashboard', external: true },
          ].map(({ label, href, external }) => (
            <a key={href} href={href} target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="px-4 py-2 bg-bgSurface border border-borderMuted rounded-brand text-sm text-textMuted hover:text-textMain hover:border-brand/40 transition-all">
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;