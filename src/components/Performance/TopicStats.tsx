// src/components/Performance/TopicStats.tsx

import React, { useState } from "react";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils/utils";

type Filter = "all" | "weak" | "strong";

const TopicStats: React.FC = () => {
  const navigate = useNavigate();
  const { topicStats, isLoading } = usePerformanceStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);

  // Limit to first 5 topics unless showAll is true
  const visibleTopics = topicStats.filter((t) =>
    filter === "weak"
      ? t.accuracy < 60
      : filter === "strong"
        ? t.accuracy >= 75
        : true,
  );

  const displayedTopics = showAll ? visibleTopics : visibleTopics.slice(0, 5);
  const hasMore = visibleTopics.length > 5;

  const getBarColor = (acc: number) => {
    const cappedAcc = Math.min(acc, 100);
    if (cappedAcc < 60) return "#FF4D6D";
    if (cappedAcc < 75) return "#FFB020";
    return "#00C896";
  };

  const getLabel = (acc: number) => {
    const cappedAcc = Math.min(acc, 100);
    if (cappedAcc < 60)
      return { text: "Weak", cls: "bg-danger/10 text-danger border-danger/20" };
    if (cappedAcc < 75)
      return { text: "Fair", cls: "bg-warn/10 text-warn border-warn/20" };
    return {
      text: "Strong",
      cls: "bg-success/10 text-success border-success/20",
    };
  };

  if (isLoading) {
    return (
      <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
        <div className="flex items-center justify-center h-32">
          <div className="text-textDim text-sm">Loading topics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-tight">
          Topic breakdown
        </h3>
        <button
          onClick={() => navigate("/quiz")}
          className="text-xs text-brand-light hover:underline"
        >
          Practise weak topics →
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 mb-4">
        {(["all", "weak", "strong"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-medium border transition-all capitalize",
              filter === f
                ? "bg-brand border-brand text-white"
                : "bg-bgSurface border-borderMuted text-textMuted hover:border-white/15 hover:text-textMain",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Topic rows */}
      <div className="space-y-3">
        {displayedTopics.length === 0 && (
          <p className="text-xs text-textDim text-center py-4">
            No topics match this filter.
          </p>
        )}
        {displayedTopics.map((t) => {
          const cappedAccuracy = Math.min(t.accuracy, 100);
          const label = getLabel(cappedAccuracy);
          return (
            <div key={t.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate">{t.name}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-textDim">
                      {t.subject}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                        label.cls,
                      )}
                    >
                      {label.text}
                    </span>
                    <span
                      className="font-mono text-xs font-semibold w-8 text-right"
                      style={{ color: getBarColor(cappedAccuracy) }}
                    >
                      {cappedAccuracy}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${cappedAccuracy}%`,
                      background: getBarColor(cappedAccuracy),
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Show more/less button */}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-brand-light hover:underline mt-2 text-center w-full"
          >
            {showAll
              ? "Show less"
              : `Show ${visibleTopics.length - 5} more topics`}
          </button>
        )}
      </div>
    </div>
  );
};

export default TopicStats;
