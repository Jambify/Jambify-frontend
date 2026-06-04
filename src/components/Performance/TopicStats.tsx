// src/components/Performance/TopicStats.tsx

import React, { useState } from "react";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { useUserStore } from "../../Store/useUserStore";
import { useQuizStore } from "../../Store/useQuizStore";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils/utils";
import { ArrowRight } from "lucide-react";

type Filter = "all" | "weak" | "strong";

const TopicStats: React.FC = () => {
  const navigate = useNavigate();
  const { topicStats, isLoading } = usePerformanceStore();
  const { subjectCombo } = useUserStore();
  const { setSelectedSubject, setSelectedTopic } = useQuizStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);

  // Filter stats based on user subject combo
  const userSubjects = subjectCombo
    ? subjectCombo.split(",").map((s) => s.trim())
    : [];
  const filteredTopicStats = topicStats.filter((t) =>
    userSubjects.includes(t.subject),
  );

  // Dynamic weak/strong topics from live data
  const weakTopics = filteredTopicStats.filter((t) => t.accuracy < 60);
  const strongTopics = filteredTopicStats.filter((t) => t.accuracy >= 75);

  const visibleTopics =
    filter === "weak"
      ? weakTopics
      : filter === "strong"
        ? strongTopics
        : filteredTopicStats;

  const displayedTopics = showAll ? visibleTopics : visibleTopics.slice(0, 5);
  const hasMore = visibleTopics.length > 5;

  const handleTopicClick = (t: any) => {
    setSelectedSubject(t.subject);
    setSelectedTopic(t.name);
    navigate("/quiz");
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
      <div className="flex items-center justify-center h-48">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bgSurface/30 p-4 rounded-2xl border border-borderMuted/30">
        <div className="flex items-center gap-4">
          <div className="flex gap-1 p-1 bg-bgDeep rounded-xl border border-borderMuted/20">
            {(["all", "weak", "strong"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all",
                  filter === f
                    ? "bg-brand text-white shadow-lg shadow-brand/20"
                    : "text-textDim hover:text-textMain hover:bg-bgSurface",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-bold text-textDim uppercase tracking-widest hidden md:block">
            {visibleTopics.length} Topics found
          </span>
        </div>

        <button
          onClick={() => navigate("/quiz")}
          className="text-[10px] font-black uppercase tracking-widest text-brand hover:text-brand-light flex items-center gap-2 transition-colors group"
        >
          Practice weak topics
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayedTopics.length === 0 && (
          <div className="col-span-full py-12 text-center bg-bgSurface/20 rounded-3xl border border-dashed border-borderMuted/40">
            <p className="text-sm text-textDim font-medium">
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
              className="bg-bgCard border border-borderMuted/60 rounded-2xl p-5 cursor-pointer group hover:border-brand/40 hover:bg-bgSurface/50 transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
              onClick={() => handleTopicClick(t)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">
                    {t.subject}
                  </span>
                  <h4 className="text-sm font-bold text-textMain truncate group-hover:text-brand transition-colors">
                    {t.name}
                  </h4>
                </div>
                <div
                  className={cn(
                    "px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-tight shrink-0",
                    label.cls,
                  )}
                >
                  {label.text}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-textDim uppercase tracking-tighter">
                  <span>Accuracy</span>
                  <span style={{ color: getBarColor(cappedAccuracy) }}>
                    {cappedAccuracy}%
                  </span>
                </div>
                <div className="h-2 bg-bgDeep rounded-full overflow-hidden p-0.5 border border-borderMuted/20">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
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
            className="px-8 py-3 rounded-full bg-bgSurface border border-borderMuted hover:border-brand/40 text-xs font-black uppercase tracking-widest text-textDim hover:text-textMain transition-all active:scale-95 shadow-sm"
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
