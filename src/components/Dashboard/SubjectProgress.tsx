import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubjectStore } from "../../Store/useSubjectStore";
import { cn } from "../../lib/utils/utils";
import { BookOpen, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";

const SubjectProgress: React.FC = () => {
  const navigate = useNavigate();
  const { subjects, isLoading, loadSubjects, isInitialized } = useSubjectStore();
  const [filter, setFilter] = useState<"all" | "weak">("all");

  useEffect(() => {
    if (!isInitialized) loadSubjects();
  }, [isInitialized, loadSubjects]);

  const displayed = filter === "weak"
    ? subjects.filter((s) => s.accuracy < 55)
    : subjects;

  const weakCount = subjects.filter((s) => s.accuracy < 55).length;

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5 flex flex-col min-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold tracking-tight">
          Subject Progress
        </h3>
        <button
          onClick={() => navigate("/subjects")}
          className="text-xs text-brand-light hover:underline"
        >
          View all →
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4">
        {(["all", "weak"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-medium transition-all",
              filter === f
                ? "bg-brand text-white"
                : "bg-bgSurface text-textDim hover:text-textMain border border-borderMuted"
            )}
          >
            {f === "all" ? "All subjects" : `Needs work${weakCount > 0 ? ` (${weakCount})` : ""}`}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-3">
          <div className="relative">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
            <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full animate-pulse" />
          </div>
          <p className="text-[10px] text-textDim uppercase tracking-widest font-bold">Syncing data...</p>
        </div>
      )}

      {/* Empty state — no subjects at all */}
      {!isLoading && subjects.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="text-sm font-medium text-textMain">No subjects yet</p>
            <p className="text-xs text-textDim mt-0.5">
              Complete a quiz to track your progress
            </p>
          </div>
          <button
            onClick={() => navigate("/quiz")}
            className="mt-1 px-4 py-2 bg-brand hover:bg-brand-light text-white text-xs font-semibold rounded-brand transition-all"
          >
            Start first quiz
          </button>
        </div>
      )}

      {/* Empty state — filter shows nothing */}
      {!isLoading && subjects.length > 0 && displayed.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center gap-2">
          <span className="text-2xl">🎉</span>
          <p className="text-sm font-medium text-textMain">All subjects looking good!</p>
          <p className="text-xs text-textDim">No weak subjects detected right now.</p>
        </div>
      )}

      {/* Subject list — horizontal scroll on mobile */}
      {!isLoading && displayed.length > 0 && (
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="space-y-3 min-w-0">
            {displayed.map((subject) => {
              const isWeak = subject.accuracy < 55;
              const hasStarted = subject.completed > 0;

              return (
                <div key={subject.id} className="flex items-center gap-3 group">
                  {/* Icon */}
                  <span className="text-base w-7 shrink-0">{subject.icon}</span>

                  {/* Name + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{subject.name}</span>
                      <span
                        className={cn(
                          "text-xs font-mono font-semibold ml-2 shrink-0",
                          !hasStarted
                            ? "text-textDim"
                            : isWeak
                            ? "text-danger"
                            : "text-success"
                        )}
                      >
                        {hasStarted ? `${subject.accuracy}%` : "—"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-bgSurface rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: hasStarted ? `${subject.accuracy}%` : "0%",
                          backgroundColor: hasStarted ? subject.color : "transparent",
                        }}
                      />
                    </div>
                    {/* Weak topics */}
                    {isWeak && subject.weakTopics.length > 0 && (
                      <p className="text-[10px] text-danger mt-0.5 truncate">
                        Weak: {subject.weakTopics.slice(0, 2).join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Practice button */}
                  <button
                    onClick={() => navigate("/quiz")}
                    className={cn(
                      "shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-brand text-[11px] font-semibold transition-all",
                      isWeak
                        ? "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20"
                        : "bg-bgSurface text-textDim border border-borderMuted hover:text-textMain opacity-0 group-hover:opacity-100"
                    )}
                    title={`Practice ${subject.name}`}
                  >
                    {isWeak ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span className="hidden sm:inline">Fix</span>
                      </>
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weak subject alert */}
      {!isLoading && weakCount > 0 && filter === "all" && (
        <button
          onClick={() => setFilter("weak")}
          className="mt-4 w-full flex items-center gap-2 px-3 py-2.5 bg-danger/10 border border-danger/20 rounded-brand text-xs text-danger hover:bg-danger/15 transition-all text-left"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1">
            {weakCount} subject{weakCount > 1 ? "s" : ""} need{weakCount === 1 ? "s" : ""} attention
          </span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      )}
    </div>
  );
};

export default SubjectProgress;
