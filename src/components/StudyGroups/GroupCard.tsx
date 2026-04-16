import React from 'react';
import type { StudyGroup } from '../../Store/useGroupStore';
import Button from '../ui/Button';

interface GroupCardProps {
  group:    StudyGroup;
  isMember: boolean;
  onJoin?:  () => void;
  onLeave?: () => void;
  onOpen:   () => void;
}

const SUBJ_COLORS: Record<string, string> = {
  English: '#7B5FFF', Mathematics: '#00C896',
  Physics: '#FFB020', Chemistry: '#FF4D6D',
  Biology: '#00C896', Mixed: '#7B5FFF',
};

const GroupCard: React.FC<GroupCardProps> = ({
  group, isMember, onJoin, onLeave, onOpen,
}) => {
  const color = SUBJ_COLORS[group.subject] ?? '#7B5FFF';

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5 hover:border-white/10 transition-all flex flex-col gap-4">

      {/* <Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-brand flex items-center justify-center text-xl shrink-0"
          style={{ background: color + '18' }}
        >
          {group.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-sm tracking-tight truncate">
              {group.name}
            </h3>
            {isMember && (
              <span className="text-[9px] font-bold px-2 py-0.5 bg-success/15 text-success border border-success/20 rounded-full">
                JOINED
              </span>
            )}
          </div>
          <p className="text-[11px] text-textDim mt-0.5">
            {group.subject} · {group.memberCount} members
          </p>
        </div>
      </div>

      {/* <Description */}
      <p className="text-xs text-textMuted leading-relaxed line-clamp-2">
        {group.description}
      </p>

      {/* <Member avatars */}
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-2">
          {group.recentMembers.slice(0, 4).map((m, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-bgCard flex items-center justify-center text-[9px] font-bold"
              style={{ background: color, color: '#fff' }}
            >
              {m.slice(0, 1).toUpperCase()}
            </div>
          ))}
        </div>
        <span className="text-[11px] text-textDim">
          {group.memberCount > 4
            ? `+${group.memberCount - 4} more`
            : `${group.memberCount} members`}
        </span>
        <span className="ml-auto text-[10px] text-textDim">
          {group.isActive ? (
            <span className="flex items-center gap-1 text-success">
              <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
              Active now
            </span>
          ) : 'Quiet'}
        </span>
      </div>

      {/* <Actions */}
      <div className="flex gap-2">
        <Button
          variant="primary" size="sm"
          fullWidth onClick={onOpen}
        >
          {isMember ? 'Open chat' : 'Preview'}
        </Button>
        {!isMember && (
          <Button
            variant="secondary" size="sm"
            onClick={onJoin}
          >
            Join
          </Button>
        )}
        {isMember && (
          <Button
            variant="ghost" size="sm"
            onClick={onLeave}
          >
            Leave
          </Button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;