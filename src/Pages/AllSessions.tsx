import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import PageHelmet from "../components/SEO/PageHelmet";
import AppLayout from "../components/Layout/AppLayout";
import { useSubjectStore } from "../Store/useSubjectStore";
import { useUserStore } from "../Store/useUserStore";
import { cn } from "../lib/utils/utils";
import {
  Sparkles,
  Clock,
  BookOpen,
  ArrowRight,
  FileText,
  Star,
  Zap,
  Target,
  Infinity as InfinityIcon,
} from "lucide-react";
import {
  BookOpen as SubjectBookOpen,
  Calculator,
  Zap as PhysicsIcon,
  FlaskConical,
  Dna,
  BarChart3,
  Landmark,
  Church,
  Moon,
  Briefcase,
} from "lucide-react";

const getSubjectIconComponent = (subject: string) => {
  const icons: Record<string, React.ElementType> = {
    English: SubjectBookOpen,
    Mathematics: Calculator,
    Physics: PhysicsIcon,
    Chemistry: FlaskConical,
    Biology: Dna,
    Economics: BarChart3,
    Government: Landmark,
    "Literature in English": SubjectBookOpen,
    CRS: Church,
    IRS: Moon,
    Commerce: Briefcase,
  };
  return icons[subject] || SubjectBookOpen;
};

interface Session {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  name: string;
  questions: number;
  minutes: number;
  tag: "recommended" | "mock" | "review" | "quick" | "marathon";
  difficulty: "Easy" | "Medium" | "Hard";
  route: string;
}

const DIFFICULTY_STYLES = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-warn/10 text-warn border-warn/20",
  Hard: "bg-danger/10 text-danger border-danger/20",
};

function getDifficulty(accuracy: number): "Easy" | "Medium" | "Hard" {
  if (accuracy === 0) return "Easy";
  if (accuracy >= 70) return "Medium";
  if (accuracy >= 45) return "Hard";
  return "Hard";
}

const SessionCard: React.FC<{ s: Session; onClick: () => void }> = ({
  s,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="bg-bgSurface border-borderMuted rounded-brand hover:border-brand/30 group flex w-full items-center gap-3 border p-3 text-left transition-all hover:translate-x-0.5"
  >
    <div
      className={cn(
        "rounded-brand flex h-9 w-9 shrink-0 items-center justify-center text-base",
        s.iconBg,
      )}
    >
      {s.icon}
    </div>
    <div className="min-w-0 flex-1">
      {s.tag === "recommended" && (
        <div className="mb-0.5 flex items-center gap-1">
          <span className="text-brand-light flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase">
            <Star size={10} /> For you
          </span>
        </div>
      )}
      <p className="truncate text-sm leading-tight font-medium">{s.name}</p>
      <div className="mt-0.5 flex items-center gap-2">
        <span className="text-textDim flex items-center gap-1 text-[11px]">
          <BookOpen className="h-3 w-3" />
          {s.questions} Qs
        </span>
        <span className="text-textDim text-[11px]">·</span>
        <span className="text-textDim flex items-center gap-1 text-[11px]">
          <Clock className="h-3 w-3" />~{s.minutes} min
        </span>
      </div>
    </div>
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <span
        className={cn(
          "rounded-full border px-2 py-0.5 text-[10px] font-medium",
          DIFFICULTY_STYLES[s.difficulty],
        )}
      >
        {s.difficulty}
      </span>
      <span className="text-brand-light flex items-center gap-0.5 text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100">
        Start <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  </button>
);

const AllSessions: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { subjects } = useSubjectStore();
  const { questionsCompleted } = useUserStore();
  const isNewUser = questionsCompleted === 0;

  // ── Recommended: one session per subject, weakest-first ordering ──
  const recommended = useMemo<Session[]>(() => {
    const sorted = [...subjects].sort((a, b) => {
      if (a.completed === 0 && b.completed === 0) return 0;
      if (a.completed === 0) return -1;
      if (b.completed === 0) return 1;
      return a.accuracy - b.accuracy;
    });

    return sorted.map((s) => {
      const diff = getDifficulty(s.accuracy);
      const qCount = diff === "Hard" ? 10 : diff === "Medium" ? 8 : 5;
      const topic = s.weakTopics[0] ?? "";
      const route = topic
        ? `/quiz?subject=${encodeURIComponent(s.name)}&topic=${encodeURIComponent(topic)}`
        : `/quiz?subject=${encodeURIComponent(s.name)}`;
      const SubjectIcon = getSubjectIconComponent(s.name);
      return {
        id: `subj-${s.id}`,
        icon: <SubjectIcon size={18} />,
        iconBg: "bg-brand/10",
        name: `${s.name}: ${s.weakTopics[0] ?? "Practice"}`,
        questions: qCount,
        minutes: Math.round(qCount * 1.4),
        tag: "recommended" as const,
        difficulty: diff,
        route,
      };
    });
  }, [subjects]);

  // ── Fixed session types: quick, standard-ish, marathon, mock ──
  const otherSessions = useMemo<Session[]>(
    () => [
      {
        id: "quick",
        icon: <Zap size={18} />,
        iconBg: "bg-brand/10",
        name: "Quick Fire",
        questions: 10,
        minutes: 10,
        tag: "quick",
        difficulty: "Easy",
        route: "/quiz",
      },
      {
        id: "standard",
        icon: <Target size={18} />,
        iconBg: "bg-brand/10",
        name: "Standard Practice",
        questions: 20,
        minutes: 30,
        tag: "quick",
        difficulty: "Medium",
        route: "/quiz",
      },
      {
        id: "marathon",
        icon: <InfinityIcon size={18} />,
        iconBg: "bg-brand/10",
        name: "Marathon Quiz",
        questions: 100,
        minutes: 15,
        tag: "marathon",
        difficulty: "Hard",
        route: "/quiz",
      },
      {
        id: "mock",
        icon: <FileText size={18} />,
        iconBg: "bg-warn/10",
        name: isNewUser ? "Try a Mini Mock Exam" : "Full Mock Exam",
        questions: isNewUser ? 20 : 180,
        minutes: isNewUser ? 28 : 120,
        tag: "mock",
        difficulty: "Medium",
        route: "/mock-exams",
      },
    ],
    [isNewUser],
  );

  return (
    <AppLayout
      currentPage="sessions"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <PageHelmet
        title="All Sessions | SCHOOLDRA"
        description="Browse all recommended practice sessions, quizzes, and mock exams tailored to your JAMB UTME preparation."
        canonical="https://www.schooldra.com/sessions"
      />
      <div className="animate-fadeIn mx-auto max-w-4xl space-y-6 px-2 lg:px-4">
        <div>
          <h1 className="font-display text-textMain text-2xl font-bold tracking-tight lg:text-3xl">
            All Sessions
          </h1>
          <p className="text-textDim mt-1 text-sm">
            Every recommended session and quiz mode in one place
          </p>
        </div>

        {isNewUser && (
          <div className="bg-brand/10 border-brand/20 rounded-brand flex items-center gap-2 border px-3 py-2.5">
            <Sparkles className="text-brand-light h-3.5 w-3.5 shrink-0" />
            <p className="text-brand-light text-xs leading-snug">
              Complete your first quiz to get personalised recommendations
            </p>
          </div>
        )}

        {recommended.length > 0 && (
          <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-5">
            <h3 className="font-display mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Sparkles className="text-brand-light h-4 w-4" />
              Recommended For You
            </h3>
            <div className="space-y-2">
              {recommended.map((s) => (
                <SessionCard
                  key={s.id}
                  s={s}
                  onClick={() => navigate(s.route)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-5">
          <h3 className="font-display mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight">
            <BookOpen className="text-brand-light h-4 w-4" />
            Practice & Exam Modes
          </h3>
          <div className="space-y-2">
            {otherSessions.map((s) => (
              <SessionCard key={s.id} s={s} onClick={() => navigate(s.route)} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AllSessions;