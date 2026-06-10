import React from "react";
import { useNavigate } from "react-router-dom";
import type { Subject } from "../../Types/subject";
import TopicList from "./SubjectTopic";
import { cn } from "../../lib/utils/utils";

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
  const progressPct = Math.round((subject.completed / subject.total) * 100);

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
        "bg-bgCard rounded-brand-lg overflow-hidden border transition-all duration-200",
        isExpanded
          ? "border-brand/20 dark:border-white/15"
          : "border-borderMuted hover:border-brand/20 dark:hover:border-white/10",
      )}
    >
      {/* <── Card top — always visible ── */}
      <div className="cursor-pointer p-5" onClick={onToggle}>
        {/* <Header row */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div 
            className="flex items-center gap-3 group/sub cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/quiz?subject=${encodeURIComponent(subject.name)}`);
            }}
          >
            <div
              className="rounded-brand flex h-11 w-11 shrink-0 items-center justify-center text-xl transition-transform group-hover/sub:scale-110"
              style={{ background: `${subject.color}18` }}
            >
              {subject.icon}
            </div>
            <div>
              <h3 className="font-display text-base font-semibold tracking-tight group-hover/sub:text-brand transition-colors">
                {subject.name}
              </h3>
              <p className="text-textDim mt-0.5 text-[11px]">
                Rank #{subject.rank} nationally
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isBest && (
              <span className="bg-success/20 text-success rounded border border-success/30 px-2 py-0.5 text-[10px] font-bold tracking-tight uppercase">
                🏆 Best
              </span>
            )}
            {isWorst && (
              <span className="bg-danger/20 text-danger rounded border border-danger/30 px-2 py-0.5 text-[10px] font-bold tracking-tight uppercase">
                ⚠️ Worst
              </span>
            )}
            <span
              className={cn(
                "rounded border px-2 py-0.5 text-[10px] font-medium",
                statusLabel.cls,
              )}
            >
              {statusLabel.text}
            </span>
            {/* <Chevron */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={cn(
                "text-textDim shrink-0 transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* <Big accuracy number */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p
              className="font-display text-4xl leading-none font-black tracking-tighter"
              style={{ color: subject.color }}
            >
              {subject.accuracy}%
            </p>
            <p className="text-textDim mt-1 text-[11px]">accuracy</p>
          </div>
          <div className="text-right">
            <p className="text-textMain font-mono text-sm font-medium">
              {subject.completed}
              <span className="text-textDim">/{subject.total}</span>
            </p>
            <p className="text-textDim mt-0.5 text-[11px]">questions done</p>
          </div>
        </div>

        {/* <Accuracy bar */}
        <div className="bg-bgTrack mb-1 h-1.5 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${subject.accuracy}%`, background: subject.color }}
          />
        </div>

        {/* <Progress bar */}
        <div className="flex items-center justify-between">
          <span className="text-textDim text-[10px]">
            {progressPct}% of questions attempted
          </span>
        </div>
      </div>

      {/* <── Expanded section — topics + action buttons ── */}
      {isExpanded && (
        <div className="border-borderMuted animate-slideDown border-t">
          {/* <Lowest topic */}
          {subject.weakTopics.length > 0 && (
            <div className="px-5 pt-4 pb-2">
              <p className="text-danger mb-2 flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase">
                <div className="bg-danger h-1 w-1 rounded-full"></div>
                Lowest Topic
              </p>
              <TopicList 
                topics={subject.weakTopics} 
                color={subject.color} 
                onTopicClick={(topic) => {
                  navigate(`/quiz?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(topic)}`);
                }}
              />
            </div>
          )}
          {/* 
          <Action buttons */}
          <div className="flex gap-2 px-5 py-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/quiz?subject=${encodeURIComponent(subject.name)}`);
              }}
              className="rounded-brand flex-1 py-2 text-xs font-medium text-white transition-all active:scale-[0.98]"
              style={{ background: subject.color }}
            >
              Practise this subject
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/performance");
              }}
              className="rounded-brand bg-bgSurface border-borderMuted text-textMuted hover:text-textMain border px-4 py-2 text-xs font-medium transition-all hover:border-brand/20 dark:hover:border-white/15"
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
