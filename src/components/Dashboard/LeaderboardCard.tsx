import React, { useState, useEffect } from "react";
import { useLeaderboardStore } from "../../Store/useLeaderboard";
import { useUserStore } from "../../Store/useUserStore";
import { cn } from "../../lib/utils/utils";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Loader2,
  Medal,
} from "lucide-react";

type Tab = "school" | "national";

const RANK_STYLES: Record<
  number,
  { text: string; bg: string; icon: React.ReactNode }
> = {
  1: { text: "text-warn", bg: "bg-warn/10", icon: <Medal size={16} /> },
  2: { text: "text-textDim", bg: "bg-textDim/10", icon: <Medal size={16} /> },
  3: { text: "text-teal", bg: "bg-teal/10", icon: <Medal size={16} /> },
};

function ChangeIndicator({ change }: { change: number }) {
  if (change === 0) return <Minus className="text-textDim h-3 w-3" />;
  if (change > 0)
    return (
      <span className="text-success flex items-center gap-0.5 text-[10px] font-medium">
        <TrendingUp className="h-3 w-3" />
        {change}
      </span>
    );
  return (
    <span className="text-danger flex items-center gap-0.5 text-[10px] font-medium">
      <TrendingDown className="h-3 w-3" />
      {Math.abs(change)}
    </span>
  );
}

const LeaderboardCard: React.FC = () => {
  const { entries, scope, setScope, fetchLeaderboard, isLoading } =
    useLeaderboardStore();
  const { name, schoolRank, overallScore } = useUserStore();
  const [tab, setTab] = useState<Tab>(scope as Tab);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const top3 = entries.slice(0, 3);
  const hasData = entries.length > 0;
  const isNewUser = overallScore === 0 && !isLoading;

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setScope(t);
  };

  return (
    <div className="bg-bgCard border-borderMuted rounded-brand-lg flex flex-col border p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Trophy className="text-warn h-4 w-4" />
          Leaderboard
        </h3>

        {/* Scope tabs */}
        <div className="bg-bgSurface rounded-brand border-borderMuted flex gap-1 border p-0.5">
          {(["school", "national"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all",
                tab === t
                  ? "bg-bgCard text-textMain shadow-sm"
                  : "text-textDim hover:text-textMain",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <Loader2 className="text-brand mb-2 h-8 w-8 animate-spin" />
          <p className="text-textDim text-xs font-medium">
            Fetching champions...
          </p>
        </div>
      )}

      {/* Empty / new-user state */}
      {!isLoading && isNewUser && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
          <div className="border-warn/20 bg-warn/10 flex h-14 w-14 items-center justify-center rounded-full border">
            <Trophy className="text-warn h-6 w-6" />
          </div>
          <div>
            <p className="text-textMain text-sm font-semibold">
              Your rank awaits
            </p>
            <p className="text-textDim mx-auto mt-1 max-w-45 text-xs leading-relaxed">
              Complete a quiz to earn your spot on the leaderboard
            </p>
          </div>
          <div className="mt-1 flex gap-2">
            <button
              onClick={() => {}}
              className="bg-bgSurface border-borderMuted text-textDim hover:text-textMain rounded-brand flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-all"
            >
              <Users className="h-3.5 w-3.5" />
              Invite friends
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard list */}
      {!isLoading && hasData && (
        <div className="flex-1 space-y-0.5">
          {top3.map((entry) => {
            const rankStyle = RANK_STYLES[entry.rank];
            return (
              <div
                key={entry.id}
                className="rounded-brand hover:bg-bgSurface flex items-center gap-2 px-2 py-2 transition-colors sm:gap-2.5 sm:px-2.5"
              >
                {/* Rank medal or number */}
                <div
                  className={cn(
                    "w-6 shrink-0 text-center",
                    rankStyle?.text ?? "text-textDim",
                  )}
                >
                  {rankStyle ? (
                    <span className={rankStyle.text}>{rankStyle.icon}</span>
                  ) : (
                    <span className="font-mono text-xs">{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    background: entry.avatarBg,
                    color: entry.avatarColor,
                  }}
                >
                  {entry.initials}
                </div>

                {/* Name + school */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm leading-tight font-medium">
                    {entry.name}
                  </p>
                  <p className="text-textDim truncate text-[10px]">
                    {entry.school}
                  </p>
                </div>

                {/* Change indicator */}
                <ChangeIndicator change={entry.change} />

                {/* Score */}
                <span className="text-textMain ml-1 shrink-0 font-mono text-sm font-semibold">
                  {entry.score}
                </span>
              </div>
            );
          })}

          {/* Divider */}
          <div className="border-borderMuted my-1.5 border-t" />

          {/* Current user row */}
          <div className="rounded-brand bg-brand/10 border-brand/20 flex items-center gap-2 border px-2 py-2 sm:gap-2.5 sm:px-2.5">
            {/* Rank */}
            <div className="w-6 shrink-0 text-center">
              <span className="text-brand-light font-mono text-xs">
                {schoolRank || "—"}
              </span>
            </div>

            {/* Avatar */}
            <div className="bg-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white">
              {name ? name.slice(0, 2).toUpperCase() : "ME"}
            </div>

            {/* Name */}
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <p className="truncate text-sm font-semibold">{name || "You"}</p>
              <span className="bg-brand shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                You
              </span>
            </div>

            {/* Score */}
            <span className="text-brand-light shrink-0 font-mono text-sm font-semibold">
              {overallScore}
            </span>
          </div>
        </div>
      )}

      {/* No Data State (Not loading, but no entries) */}
      {!isLoading && !hasData && !isNewUser && (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <div className="bg-bgSurface mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <Users className="text-textDim h-6 w-6" />
          </div>
          <p className="text-textMain text-sm font-semibold">No rankings yet</p>
          <p className="text-textDim mt-1 max-w-40 text-xs">
            Be the first to join the leaderboard!
          </p>
          <button
            onClick={() => fetchLeaderboard()}
            className="text-brand hover:text-brand-light mt-4 text-[10px] font-bold tracking-widest uppercase transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;
