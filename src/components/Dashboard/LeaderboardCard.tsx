import React from 'react';
import { useLeaderboardStore } from '../../Store/useLeaderboard';
import { useUserStore } from '../../Store/UseUserStore';
import { cn } from '../../lib/utils';

const RANK_STYLES: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-gray-400',
  3: 'text-orange-400',
};

const LeaderboardCard: React.FC = () => {
  const { getEntries } = useLeaderboardStore();
  const { name, schoolRank } = useUserStore();

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-tight">School Leaderboard</h3>
        <button className="text-xs text-brand-light hover:underline">National →</button>
      </div>

      <div className="space-y-0.5">
        {getEntries().slice(0, 3).map((entry) => (
          <div key={entry.id}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-brand hover:bg-bgSurface transition-colors"
          >
            <span className={cn('text-xs font-mono w-4 text-center', RANK_STYLES[entry.rank] ?? 'text-textDim')}>
              {entry.rank}
            </span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ background: entry.avatarBg, color: entry.avatarColor }}
            >
              {entry.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.name}</p>
              <p className="text-[11px] text-textDim truncate">{entry.school}</p>
            </div>
            <span className="font-mono text-sm font-medium">{entry.score}</span>
          </div>
        ))}

        {/* Divider */}
        <div className="my-1 border-t border-borderMuted" />

        {/* Current user row */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-brand bg-brand/10 border border-brand/20">
          <span className="text-xs font-mono w-4 text-center text-brand-light">{schoolRank}</span>
          <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {name} <span className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded-full ml-1">You</span>
            </p>
          </div>
          <span className="font-mono text-sm font-medium text-brand-light">267</span>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardCard;