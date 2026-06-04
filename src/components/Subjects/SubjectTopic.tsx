import React from 'react';

interface TopicListProps {
  topics: string[];
  color:  string;
}

const TopicList: React.FC<TopicListProps> = ({ topics, color }) => {
  if (topics.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {topics.map((topic) => (
        <div
          key={topic}
          className="flex items-center gap-2.5 px-3 py-2 bg-bgSurface rounded-brand border border-borderMuted"
        >
          {/* <Colour dot */}
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: color }}
          />
          <span className="text-xs text-textMuted flex-1">{topic}</span>
          {/* <Weak indicator */}
          <span className="text-[10px] text-danger font-medium">Weak</span>
        </div>
      ))}
    </div>
  );
};

export default TopicList;
