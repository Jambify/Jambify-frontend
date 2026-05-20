import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSubjectStore } from "../../Store/useSubjectStore";
import { useUserStore } from "../../Store/UseUserStore";
import { cn } from "../../lib/utils/utils";
import { Sparkles, Clock, BookOpen, Target, ArrowRight } from "lucide-react";

interface Session {
  id: string;
  icon: string;
  iconBg: string;
  name: string;
  questions: number;
  minutes: number;
  tag: "recommended" | "mock" | "review";
  difficulty: "Easy" | "Medium" | "Hard";
  route: string;
  subjectColor?: string;
}

const DIFFICULTY_STYLES = {
  Easy:   "bg-success/10 text-success border-success/20",
  Medium: "bg-warn/10 text-warn border-warn/20",
  Hard:   "bg-danger/10 text-danger border-danger/20",
};

function getDifficulty(accuracy: number): "Easy" | "Medium" | "Hard" {
  if (accuracy === 0)  return "Easy";
  if (accuracy >= 70)  return "Medium";
  if (accuracy >= 45)  return "Hard";
  return "Hard";
}

const RecommendedSessions: React.FC = () => {
  const navigate  = useNavigate();
  const { subjects } = useSubjectStore();
  const { questionsCompleted } = useUserStore();

  const sessions = useMemo<Session[]>(() => {
    const isNewUser = questionsCompleted === 0;

    // Sort subjects: weakest first (lowest accuracy), then unstarted
    const sorted = [...subjects].sort((a, b) => {
      if (a.completed === 0 && b.completed === 0) return 0;
      if (a.completed === 0) return -1;
      if (b.completed === 0) return 1;
      return a.accuracy - b.accuracy;
    });

    const built: Session[] = [];

    // Up to 2 subject-based recommendations
    for (const s of sorted.slice(0, 2)) {
      const diff = getDifficulty(s.accuracy);
      const qCount = diff === "Hard" ? 10 : diff === "Medium" ? 8 : 5;
      built.push({
        id:          `subj-${s.id}`,
        icon:        s.icon,
        iconBg:      "bg-brand/10",
        name:        `${s.name}: ${s.weakTopics[0] ?? "Practice"}`,
        questions:   qCount,
        minutes:     Math.round(qCount * 1.4),
        tag:         "recommended",
        difficulty:  diff,
        route:       "/quiz",
        subjectColor: s.color,
      });
    }

    // Always add a mock exam slot
    built.push({
      id:         "mock",
      icon:       "📝",
      iconBg:     "bg-warn/10",
      name:       isNewUser ? "Try a Mini Mock Exam" : "Full Mock Exam",
      questions:  isNewUser ? 20 : 180,
      minutes:    isNewUser ? 28 : 120,
      tag:        "mock",
      difficulty: "Medium",
      route:      "/mock-exams",
    });

    return built;
  }, [subjects, questionsCompleted]);

  const isNewUser = questionsCompleted === 0;

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-light" />
          Recommended Sessions
        </h3>
        <button
          onClick={() => navigate("/subjects")}
          className="text-xs text-brand-light hover:underline"
        >
          See all →
        </button>
      </div>

      {/* New-user nudge banner */}
      {isNewUser && (
        <div className="mb-3 px-3 py-2.5 bg-brand/10 border border-brand/20 rounded-brand flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-light shrink-0" />
          <p className="text-xs text-brand-light leading-snug">
            Complete your first quiz to get personalised recommendations
          </p>
        </div>
      )}

      {/* Session cards — single column on mobile, same on desktop */}
      <div className="space-y-2">
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(s.route)}
            className="w-full flex items-center gap-3 p-3 bg-bgSurface border border-borderMuted rounded-brand hover:border-brand/30 hover:translate-x-0.5 transition-all text-left group"
          >
            {/* Icon */}
            <div
              className={cn(
                "w-9 h-9 rounded-brand flex items-center justify-center text-base shrink-0",
                s.iconBg
              )}
            >
              {s.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Recommended badge */}
              {s.tag === "recommended" && (
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-brand-light">
                    ⭐ For you
                  </span>
                </div>
              )}
              <p className="text-sm font-medium truncate leading-tight">{s.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-[11px] text-textDim">
                  <BookOpen className="w-3 h-3" />
                  {s.questions} Qs
                </span>
                <span className="text-textDim text-[11px]">·</span>
                <span className="flex items-center gap-1 text-[11px] text-textDim">
                  <Clock className="w-3 h-3" />
                  ~{s.minutes} min
                </span>
              </div>
            </div>

            {/* Right side: difficulty + arrow */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                  DIFFICULTY_STYLES[s.difficulty]
                )}
              >
                {s.difficulty}
              </span>
              <span className="flex items-center gap-0.5 text-[11px] text-brand-light font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Start <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendedSessions;
