import React, { useState } from "react";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

type Filter = "all" | "weak" | "strong";

const TopicStats: React.FC = () => {
  const navigate = useNavigate();
  const { topicStats } = usePerformanceStore();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = topicStats.filter((t) =>
    filter === "weak"
      ? t.accuracy < 60
      : filter === "strong"
        ? t.accuracy >= 75
        : true,
  );

  const getBarColor = (acc: number) =>
    acc < 60 ? "#FF4D6D" : acc < 75 ? "#FFB020" : "#00C896";

  const getLabel = (acc: number) =>
    acc < 60
      ? { text: "Weak", cls: "bg-danger/10 text-danger border-danger/20" }
      : acc < 75
        ? { text: "Fair", cls: "bg-warn/10 text-warn border-warn/20" }
        : {
            text: "Strong",
            cls: "bg-success/10 text-success border-success/20",
          };

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

      {/* <Filter pills */}
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

      {/* <Topic rows */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <p className="text-xs text-textDim text-center py-4">
            No topics match this filter.
          </p>
        )}
        {visible.map((t) => {
          const label = getLabel(t.accuracy);
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
                      style={{ color: getBarColor(t.accuracy) }}
                    >
                      {t.accuracy}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${t.accuracy}%`,
                      background: getBarColor(t.accuracy),
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicStats;
