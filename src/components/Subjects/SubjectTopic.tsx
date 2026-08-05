import React from "react";
import { cn } from "../../lib/utils/utils";

interface TopicListProps {
  topics: string[];
  color: string;
  onTopicClick?: (topic: string) => void;
}

const TopicList: React.FC<TopicListProps> = ({
  topics,
  color,
  onTopicClick,
}) => {
  if (topics.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {topics.map((topic) => (
        <div
          key={topic}
          onClick={() => onTopicClick?.(topic)}
          className={cn(
            "group rounded-brand-lg bg-bgSurface/80 flex cursor-pointer items-center gap-3 border border-transparent px-3 py-3 shadow-sm transition-all",
            onTopicClick &&
              "hover:border-brand/30 hover:bg-bgCard active:scale-98",
          )}
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: color }}
          />
          <span className="text-textMain flex-1 text-sm font-semibold tracking-tight">
            {topic}
          </span>
          <span className="bg-danger/10 text-danger rounded-full px-2 py-1 text-[10px] font-black tracking-[0.2em] uppercase">
            Weak
          </span>
        </div>
      ))}
    </div>
  );
};

export default TopicList;
