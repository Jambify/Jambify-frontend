// src/components/Performance/TopicStats.tsx

import React, { useState } from "react";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { useUserStore } from "../../Store/useUserStore";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils/utils";
import { ArrowRight } from "lucide-react";

const TopicStats: React.FC = () => {
  const navigate = useNavigate();
  const { topicStats, isLoading } = usePerformanceStore();
  const { subjectCombo } = useUserStore();
  const [showAll, setShowAll] = useState(false);

  // Filter stats based on user subject combo
  const userSubjects = subjectCombo
    ? subjectCombo.split(",").map((s) => s.trim())
    : [];
  const filteredTopicStats = topicStats.filter((t) =>
    userSubjects.includes(t.subject),
  );

  // Only show weakest topics (accuracy < 60)
  const weakTopics = filteredTopicStats
    .filter((t) => t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy); // Sort weakest first

  const visibleTopics = weakTopics;

  const displayedTopics = showAll ? visibleTopics : visibleTopics.slice(0, 5);
  const hasMore = visibleTopics.length > 5;

  const handleTopicClick = (t: any) => {
    navigate(`/quiz?subject=${encodeURIComponent(t.subject)}&topic=${encodeURIComponent(t.name)}`);
  };

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
      <div className="flex h-48 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-brand/20 border-t-brand h-10 w-10 animate-spin rounded-full border-4" />
          <div className="text-textDim text-sm font-medium">
            Analyzing topics...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="bg-bgSurface/30 border-borderMuted/30 flex flex-col justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="text-textDim text-[10px] font-bold tracking-widest uppercase">
            {visibleTopics.length} Weak Topics found
          </span>
        </div>

        <button
          onClick={() => navigate("/quiz")}
          className="text-brand hover:text-brand-light group flex items-center gap-2 text-[10px] font-black tracking-widest uppercase transition-colors"
        >
          Practice weak topics
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {displayedTopics.length === 0 && (
          <div className="bg-bgSurface/20 border-borderMuted/40 col-span-full rounded-3xl border border-dashed py-12 text-center">
            <p className="text-textDim text-sm font-medium">
              No topics match this filter. Try another one!
            </p>
          </div>
        )}
        {displayedTopics.map((t) => {
          const cappedAccuracy = Math.min(t.accuracy, 100);
          const label = getLabel(cappedAccuracy);
          return (
            <div
              key={t.id}
              className="bg-bgCard border-borderMuted/60 group hover:border-brand/40 hover:bg-bgSurface/50 cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
              onClick={() => handleTopicClick(t)}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex min-w-0 flex-col">
                  <span className="text-brand mb-1 text-[10px] font-black tracking-widest uppercase">
                    {t.subject}
                  </span>
                  <h4 className="text-textMain group-hover:text-brand truncate text-sm font-bold transition-colors">
                    {t.name}
                  </h4>
                </div>
                <div
                  className={cn(
                    "shrink-0 rounded-md border px-2 py-1 text-[9px] font-black tracking-tight uppercase",
                    label.cls,
                  )}
                >
                  {label.text}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-textDim flex items-center justify-between text-[10px] font-bold tracking-tighter uppercase">
                  <span>Accuracy</span>
                  <span style={{ color: getBarColor(cappedAccuracy) }}>
                    {cappedAccuracy}%
                  </span>
                </div>
                <div className="bg-bgDeep border-borderMuted/20 h-2 overflow-hidden rounded-full border p-0.5">
                  <div
                    className="h-full rounded-full shadow-sm transition-all duration-1000 ease-out"
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
      </div>

      {/* Show more/less button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-bgSurface border-borderMuted hover:border-brand/40 text-textDim hover:text-textMain rounded-full border px-8 py-3 text-xs font-black tracking-widest uppercase shadow-sm transition-all active:scale-95"
          >
            {showAll
              ? "Show less"
              : `Show ${visibleTopics.length - 5} more topics`}
          </button>
        </div>
      )}
    </div>
  );
};

export default TopicStats;
