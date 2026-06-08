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
      <div className="bg-bgCard border-borderMuted rounded-brand-xl flex h-full flex-col items-center justify-center border p-6 text-center">
        <div className="bg-brand/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <BookOpen className="text-brand h-6 w-6" />
        </div>
        <h3 className="font-display text-textMain mb-2 font-bold">
          No Subject Progress Yet
        </h3>
        <p className="text-textDim mb-6 max-w-60 text-sm">
          Start a practice quiz to see your strengths and weaknesses here.
        </p>
        <button
          onClick={() => navigate("/quiz")}
          className="bg-brand hover:bg-brand-light rounded-full px-6 py-2 text-sm font-bold text-white transition-all active:scale-95"
        >
          Start Practice
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bgCard border-borderMuted rounded-brand-xl flex h-full flex-col border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-display text-textMain font-bold">
            Subject Progress
          </h3>
          <p className="text-textDim text-[11px] font-medium">
            Performance across your subjects
          </p>
        </div>
        <button
          onClick={() => navigate("/performance")}
          className="text-brand hover:text-brand-light group flex items-center gap-1 text-xs font-bold"
        >
          View all{" "}
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-[11px] font-black tracking-wider uppercase transition-all",
            filter === "all"
              ? "bg-brand shadow-brand/20 text-white shadow-lg"
              : "bg-bgSurface text-textDim border-borderMuted hover:border-brand/40 border",
          )}
        >
          All subjects
        </button>
        <button
          onClick={() => setFilter("weak")}
          className={cn(
            "rounded-full px-4 py-1.5 text-[11px] font-black tracking-wider uppercase transition-all",
            filter === "weak"
              ? "bg-danger shadow-danger/20 text-white shadow-lg"
              : "bg-bgSurface text-textDim border-borderMuted hover:border-danger/40 border",
          )}
        >
          Needs work ({topicStats.filter((t: any) => t.accuracy < 60).length})
        </button>
      </div>

      <div className="custom-scrollbar space-y-5 overflow-y-auto pr-1">
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
            <div
              key={subj}
              className="group/item cursor-pointer"
              onClick={() => navigate(`/quiz?subject=${encodeURIComponent(subj)}`)}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-bgSurface border-borderMuted flex h-8 w-8 items-center justify-center rounded-lg border text-lg">
                    {getSubjectIcon(subj)}
                  </div>
                  <div>
                    <p className="text-textMain group-hover/item:text-brand text-sm font-bold transition-colors">
                      {subj}
                    </p>
                    {weakTopics.length > 0 && (
                      <p className="text-danger line-clamp-1 text-[10px] font-medium">
                        Weak: {weakTopics.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-textMain text-xs font-bold">
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
              <div className="bg-bgSurface border-borderMuted/30 h-1.5 overflow-hidden rounded-full border shadow-inner">
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
