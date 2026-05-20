import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils/utils";

type TagVariant = "adaptive" | "mock" | "spaced";

interface Session {
  id: string;
  icon: string;
  iconBg: string;
  name: string;
  meta: string;
  tag: TagVariant;
  route: string;
}

const TAG_STYLES: Record<TagVariant, string> = {
  adaptive: "bg-brand/10 text-brand-light border border-brand/20",
  mock: "bg-warn/10 text-warn border border-warn/20",
  spaced: "bg-success/10 text-success border border-success/20",
};

const TAG_LABELS: Record<TagVariant, string> = {
  adaptive: "Adaptive",
  mock: "Mock",
  spaced: "Due Today",
};

const SESSIONS: Session[] = [
  {
    id: "1",
    icon: "⚗️",
    iconBg: "bg-danger/10",
    name: "Chemistry: Organic Reactions",
    meta: "20 Qs · ~14 min · JAMB 2018–2023",
    tag: "adaptive",
    route: "/quiz",
  },
  {
    id: "2",
    icon: "📝",
    iconBg: "bg-warn/10",
    name: "Full Mock Exam",
    meta: "180 Qs · 2 hours · All subjects",
    tag: "mock",
    route: "/mock-exams",
  },
  {
    id: "3",
    icon: "🔁",
    iconBg: "bg-success/10",
    name: "Spaced Repetition Review",
    meta: "28 due cards · ~12 min",
    tag: "spaced",
    route: "/quiz",
  },
];

const RecommendedSessions: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-tight">
          Recommended Sessions
        </h3>
        <button className="text-xs text-brand-light hover:underline">
          See all →
        </button>
      </div>
      <div className="space-y-2">
        {SESSIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(s.route)}
            className="w-full flex items-center gap-3 p-3 bg-bgSurface border border-borderMuted rounded-brand hover:border-white/10 hover:translate-x-0.5 transition-all text-left"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-brand flex items-center justify-center text-base shrink-0",
                s.iconBg,
              )}
            >
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.name}</p>
              <p className="text-[11px] text-textDim mt-0.5">{s.meta}</p>
            </div>
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-1 rounded-full shrink-0",
                TAG_STYLES[s.tag],
              )}
            >
              {TAG_LABELS[s.tag]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendedSessions;
