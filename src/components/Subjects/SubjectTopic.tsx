import React from "react";
import { cn } from "../../lib/utils/utils";

interface TopicListProps {
  topics: string[];
  color: string;
  onTopicClick?: (topic: string) => void;
}

const TopicList: React.FC<TopicListProps> = ({ topics, color, onTopicClick }) => {
  if (topics.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {topics.map((topic) => (
        <div
          key={topic}
          onClick={() => onTopicClick?.(topic)}
          className={cn(
            "bg-bgSurface rounded-brand border-borderMuted flex items-center gap-2.5 border px-3 py-2 transition-all",
            onTopicClick && "hover:border-brand/40 hover:bg-bgCard cursor-pointer active:scale-[0.98]"
          )}
        >
          {/* <Colour dot */}
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: color }}
          />
          <span className="text-textMuted flex-1 text-xs">{topic}</span>
          {/* <Weak indicator */}
          <span className="text-danger text-[10px] font-medium">Weak</span>
        </div>
      ))}
    </div>
  );
};

export default TopicList;
