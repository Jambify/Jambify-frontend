import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { useUserStore } from "../../Store/useUserStore";
import { cn } from "../../lib/utils/utils";
import { BookOpen, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";

// Helper to get subject icons
const getSubjectIcon = (subject: string) => {
  const icons: Record<string, string> = {
    English: "📚",
    Mathematics: "🔢",
    Physics: "⚛️",
    Chemistry: "🧪",
    Biology: "🧬",
  };
  return icons[subject] || "📖";
};

const SubjectProgress: React.FC = () => {
  const navigate = useNavigate();
  const { topicStats, isLoading } = usePerformanceStore();
  const { subjectCombo } = useUserStore();
  const [filter, setFilter] = useState<"all" | "weak">("all");

  const userSubjects = subjectCombo
    ? subjectCombo.split(",").map((s) => s.trim())
    : [];

  // Only show subjects that have data (been practiced)
  const subjectsWithData = userSubjects.filter((subj) =>
    topicStats.some((t) => t.subject === subj),
  );

  // If no subjects practiced yet, show a placeholder
  if (subjectsWithData.length === 0 && !isLoading) {
    return (
      <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-brand" />
        </div>
        <h3 className="font-display font-bold text-textMain mb-2">
          No Subject Progress Yet
        </h3>
        <p className="text-sm text-textDim max-w-60 mb-6">
          Start a practice quiz to see your strengths and weaknesses here.
        </p>
        <button
          onClick={() => navigate("/quiz")}
          className="bg-brand hover:bg-brand-light text-white px-6 py-2 rounded-full text-sm font-bold transition-all active:scale-95"
        >
          Start Practice
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-display font-bold text-textMain">
            Subject Progress
          </h3>
          <p className="text-[11px] text-textDim font-medium">
            Performance across your subjects
          </p>
        </div>
        <button
          onClick={() => navigate("/performance")}
          className="text-xs font-bold text-brand hover:text-brand-light flex items-center gap-1 group"
        >
          View all{" "}
          <ArrowRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all",
            filter === "all"
              ? "bg-brand text-white shadow-lg shadow-brand/20"
              : "bg-bgSurface text-textDim border border-borderMuted hover:border-brand/40",
          )}
        >
          All subjects
        </button>
        <button
          onClick={() => setFilter("weak")}
          className={cn(
            "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all",
            filter === "weak"
              ? "bg-danger text-white shadow-lg shadow-danger/20"
              : "bg-bgSurface text-textDim border border-borderMuted hover:border-danger/40",
          )}
        >
          Needs work ({topicStats.filter((t: any) => t.accuracy < 60).length})
        </button>
      </div>

      <div className="space-y-5 overflow-y-auto pr-1 custom-scrollbar">
        {subjectsWithData.map((subj) => {
          // Get the general performance for this subject (average of topics)
          const subjectTopics = topicStats.filter(
            (t: any) => t.subject === subj,
          );
          const avgAccuracy = Math.round(
            subjectTopics.reduce((sum, t) => sum + t.accuracy, 0) /
              subjectTopics.length,
          );

          const weakTopics = subjectTopics
            .filter((t) => t.accuracy < 60)
            .map((t) => t.name);

          // If filtering for weak and this subject has no weak topics, skip it
          if (filter === "weak" && weakTopics.length === 0) return null;

          return (
            <div key={subj} className="group/item">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bgSurface border border-borderMuted flex items-center justify-center text-lg">
                    {getSubjectIcon(subj)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-textMain group-hover/item:text-brand transition-colors">
                      {subj}
                    </p>
                    {weakTopics.length > 0 && (
                      <p className="text-[10px] text-danger font-medium line-clamp-1">
                        Weak: {weakTopics.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-textMain">
                    {avgAccuracy}%
                  </span>
                  <div className="flex items-center gap-1">
                    {avgAccuracy < 50 ? (
                      <AlertTriangle size={12} className="text-danger" />
                    ) : avgAccuracy >= 75 ? (
                      <CheckCircle size={12} className="text-success" />
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden border border-borderMuted/30 shadow-inner">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    avgAccuracy < 50
                      ? "bg-danger"
                      : avgAccuracy < 75
                        ? "bg-warning"
                        : "bg-success",
                  )}
                  style={{ width: `${avgAccuracy}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectProgress;
