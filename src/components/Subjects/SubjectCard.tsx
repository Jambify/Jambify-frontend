import React from "react";
import { useNavigate } from "react-router";
import type { Subject } from "../../Types/subject";
import TopicList from "./SubjectTopic";
import { cn } from "../../lib/utils/utils";
import {
  Trophy,
  AlertTriangle,
  BookOpen,
  Calculator,
  Zap,
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
    English: BookOpen,
    Mathematics: Calculator,
    Physics: Zap,
    Chemistry: FlaskConical,
    Biology: Dna,
    Economics: BarChart3,
    Government: Landmark,
    "Literature in English": BookOpen,
    CRS: Church,
    IRS: Moon,
    Commerce: Briefcase,
  };
  const Icon = icons[subject] || BookOpen;
  return <Icon size={20} />;
};

interface SubjectCardProps {
  subject: Subject;
  isExpanded: boolean;
  onToggle: () => void;
  isBest?: boolean;
  isWorst?: boolean;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  isExpanded,
  onToggle,
  isBest,
  isWorst,
}) => {
  const navigate = useNavigate();

  const statusLabel =
    subject.weakTopics.length > 0 && subject.accuracy < 55
      ? { text: "Needs work", cls: "bg-danger/10 text-danger border-danger/20" }
      : subject.accuracy < 75
        ? { text: "In progress", cls: "bg-warn/10 text-warn border-warn/20" }
        : {
            text: "On track",
            cls: "bg-success/10 text-success border-success/20",
          };

  return (
    <div
      className={cn(
        "bg-bgCard rounded-brand-2xl border-borderMuted shadow-card hover:border-brand/20 hover:shadow-brand/20 overflow-hidden border transition-all duration-200 hover:-translate-y-0.5",
      )}
    >
      {/* <── Card top — always visible ── */}
      <div className="cursor-pointer p-5 sm:p-6" onClick={onToggle}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className="group/sub flex min-w-0 flex-1 cursor-pointer items-center gap-4"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/quiz?subject=${encodeURIComponent(subject.name)}`);
            }}
          >
            <div
              className="rounded-brand-lg flex h-12 w-12 shrink-0 items-center justify-center text-xl shadow-sm transition-transform group-hover/sub:scale-105"
              style={{
                background: `color-mix(in srgb, ${subject.color} 18%, transparent)`,
              }}
            >
              {getSubjectIconComponent(subject.name)}
            </div>
            <div className="min-w-0">
              <h3 className="font-display group-hover/sub:text-brand text-base font-bold tracking-tight transition-colors">
                {subject.name}
              </h3>
              <p className="text-textDim mt-1 text-[11px] tracking-[0.24em] uppercase">
                Rank #{subject.rank} nationally
              </p>
            </div>
          </div>

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn(
              "text-textDim mt-1.5 shrink-0 transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {(isBest || isWorst || statusLabel) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {isBest && (
              <span className="bg-success/15 text-success border-success/30 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.24em] uppercase">
                <Trophy size={10} /> Best
              </span>
            )}
            {isWorst && (
              <span className="bg-danger/15 text-danger border-danger/30 flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.24em] uppercase">
                <AlertTriangle size={10} /> Worst
              </span>
            )}
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.24em] uppercase",
                statusLabel.cls,
              )}
            >
              {statusLabel.text}
            </span>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p
              className="font-display text-4xl leading-none font-black tracking-tighter sm:text-5xl"
              style={{ color: subject.color }}
            >
              {subject.accuracy}%
            </p>
            <p className="text-textDim mt-2 text-xs tracking-[0.24em] uppercase">
              accuracy
            </p>
          </div>
          <div className="bg-bgSurface text-textMain min-w-30 rounded-3xl px-3 py-2 text-center text-sm font-semibold shadow-sm">
            {subject.weakTopics.length > 0
              ? `${subject.weakTopics.length} weak topic${subject.weakTopics.length > 1 ? "s" : ""}`
              : "On track"}
          </div>
        </div>

        <div className="bg-bgTrack h-2.5 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${subject.accuracy}%`, background: subject.color }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="border-borderMuted/70 bg-bgSurface/80 animate-slideDown border-t px-5 py-5 sm:px-6">
          {subject.weakTopics.length > 0 && (
            <div className="bg-bgCard/70 border-borderMuted mb-4 rounded-3xl border p-4 shadow-sm">
              <p className="text-danger mb-3 flex items-center gap-2 text-[10px] font-black tracking-[0.28em] uppercase">
                <span className="bg-danger inline-block h-1.5 w-1.5 rounded-full" />
                Lowest Topic
              </p>
              <TopicList
                topics={subject.weakTopics}
                color={subject.color}
                onTopicClick={(topic) => {
                  navigate(
                    `/quiz?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(topic)}`,
                  );
                }}
              />
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/quiz?subject=${encodeURIComponent(subject.name)}`);
              }}
              className="rounded-brand-lg from-brand to-brand-light shadow-brand/20 bg-linear-to-r px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-105 active:scale-98"
            >
              Practise this subject
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/performance");
              }}
              className="rounded-brand-lg border-borderMuted bg-bgSurface text-textMain hover:border-brand/30 hover:bg-bgCard border px-4 py-3 text-sm font-semibold transition-all active:scale-98"
            >
              View stats
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectCard;
