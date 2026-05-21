import React, { useState } from "react";
import { useLeaderboardStore } from "../../Store/useLeaderboard";
import { useUserStore } from "../../Store/UseUserStore";
import { cn } from "../../lib/utils/utils";
import { Trophy, TrendingUp, TrendingDown, Minus, Users } from "lucide-react";

type Tab = "school" | "national";

const RANK_STYLES: Record<number, { text: string; bg: string; label: string }> = {
  1: { text: "text-yellow-400", bg: "bg-yellow-400/10", label: "🥇" },
  2: { text: "text-gray-300",   bg: "bg-gray-400/10",   label: "🥈" },
  3: { text: "text-orange-400", bg: "bg-orange-400/10", label: "🥉" },
};

function ChangeIndicator({ change }: { change: number }) {
  if (change === 0) return <Minus className="w-3 h-3 text-textDim" />;
  if (change > 0)
    return (
      <span className="flex items-center gap-0.5 text-success text-[10px] font-medium">
        <TrendingUp className="w-3 h-3" />
        {change}
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-danger text-[10px] font-medium">
      <TrendingDown className="w-3 h-3" />
      {Math.abs(change)}
    </span>
  );
}

const LeaderboardCard: React.FC = () => {
  const { schoolEntries, nationalEntries, scope, setScope } = useLeaderboardStore();
  const { name, schoolRank, overallScore } = useUserStore();
  const [tab, setTab] = useState<Tab>(scope as Tab);

  const entries = tab === "school" ? schoolEntries : nationalEntries;
  const top3    = entries.slice(0, 3);
  const hasData = entries.length > 0;
  const isNewUser = overallScore === 0;

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setScope(t);
  };

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-tight flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Leaderboard
        </h3>

        {/* Scope tabs */}
        <div className="flex gap-1 bg-bgSurface rounded-brand p-0.5 border border-borderMuted">
          {(["school", "national"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all capitalize",
                tab === t
                  ? "bg-bgCard text-textMain shadow-sm"
                  : "text-textDim hover:text-textMain"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Empty / new-user state */}
      {isNewUser && (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-textMain">Your rank awaits</p>
            <p className="text-xs text-textDim mt-1 max-w-45 mx-auto leading-relaxed">
              Complete a quiz to earn your spot on the leaderboard
            </p>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => {}}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bgSurface border border-borderMuted text-textDim hover:text-textMain text-xs font-medium rounded-brand transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              Invite friends
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard list */}
      {!isNewUser && hasData && (
        <div className="space-y-0.5 flex-1">
          {top3.map((entry) => {
            const rankStyle = RANK_STYLES[entry.rank];
            return (
              <div
                key={entry.id}
                className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-2.5 py-2 rounded-brand hover:bg-bgSurface transition-colors"
              >
                {/* Rank medal or number */}
                <div className={cn("w-6 text-center shrink-0", rankStyle?.text ?? "text-textDim")}>
                  {rankStyle ? (
                    <span className="text-sm">{rankStyle.label}</span>
                  ) : (
                    <span className="text-xs font-mono">{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ background: entry.avatarBg, color: entry.avatarColor }}
                >
                  {entry.initials}
                </div>

                {/* Name + school */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{entry.name}</p>
                  <p className="text-[10px] text-textDim truncate">{entry.school}</p>
                </div>

                {/* Change indicator */}
                <ChangeIndicator change={entry.change} />

                {/* Score */}
                <span className="font-mono text-sm font-semibold text-textMain shrink-0 ml-1">
                  {entry.score}
                </span>
              </div>
            );
          })}

          {/* Divider */}
          <div className="my-1.5 border-t border-borderMuted" />

          {/* Current user row */}
          <div className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-2.5 py-2 rounded-brand bg-brand/10 border border-brand/20">
            {/* Rank */}
            <div className="w-6 text-center shrink-0">
              <span className="text-xs font-mono text-brand-light">{schoolRank || "—"}</span>
            </div>

            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {name ? name.slice(0, 2).toUpperCase() : "ME"}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <p className="text-sm font-semibold truncate">{name || "You"}</p>
              <span className="shrink-0 text-[9px] bg-brand text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                You
              </span>
            </div>

            {/* Score */}
            <span className="font-mono text-sm font-semibold text-brand-light shrink-0">
              {overallScore}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;
