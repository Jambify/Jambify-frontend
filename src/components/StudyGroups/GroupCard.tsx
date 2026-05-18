import React from 'react';
import type { StudyGroup } from '../../Store/useGroupStore';
import Button from '../ui/Button';
// import { cn } from '../../lib/utils';
import { Users, MessageCircle, Activity } from 'lucide-react';

interface Props {
  group:    StudyGroup;
  isMember: boolean;
  onJoin?:  () => void;
  onLeave?: () => void;
  onOpen:   () => void;
}

const SUBJECT_COLORS: Record<string, string> = {
  English: 'rgb(123,95,255)',  Mathematics: 'rgb(0,200,150)',
  Physics: 'rgb(255,176,32)',   Chemistry:   'rgb(255,77,109)',
  Biology: 'rgb(0,200,150)',    Economics:   'rgb(255,176,32)',
  Government: 'rgb(236,72,153)', Literature:  'rgb(249,115,22)',
  Mixed:   'rgb(123,95,255)',
};

const GroupCard: React.FC<Props> = ({ group, isMember, onJoin, onOpen, onLeave }) => {
  const color = SUBJECT_COLORS[group.subject] ?? 'rgb(123,95,255)';

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5 hover:border-white/10 transition-all flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-brand flex items-center justify-center text-xl shrink-0"
          style={{ background: `linear-gradient(135deg, ${color}22, ${color}18)` }}
        >
          {group.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-sm tracking-tight truncate">{group.name}</h3>
            {isMember && (
              <span className="text-[9px] font-bold px-2 py-0.5 bg-success/15 text-success border border-success/20 rounded-full">
                JOINED
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-textDim mt-0.5">
            <Users className="w-3 h-3" />
            <span>{group.member_count}</span>
            <span>·</span>
            <span>{group.subject}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-textMuted leading-relaxed line-clamp-2">
        {group.description || 'No description provided.'}
      </p>

      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-2">
          {group.recentMembers.slice(0, 4).map((m, i) => (
            <div key={i}
              className="w-6 h-6 rounded-full border-2 border-bgCard flex items-center justify-center text-[9px] font-bold"
              style={{ background: color, color: '#fff' }}>
              {m.slice(0, 1).toUpperCase()}
            </div>
          ))}
        </div>
        <span className="text-[11px] text-textDim">
          {group.member_count > 4 ? `+${group.member_count - 4} more` : `${group.member_count} members`}
        </span>
        <span className="ml-auto text-[10px]">
          {group.isActive
            ? <span className="flex items-center gap-1 text-success"><Activity className="w-3 h-3"/> Active</span>
            : <span className="flex items-center gap-1 text-textDim"><MessageCircle className="w-3 h-3"/> Quiet</span>}
        </span>
      </div>

      <div className="flex gap-2">
        <Button variant="primary" size="sm" fullWidth onClick={onOpen}>
          {isMember ? 'Open chat' : 'Preview'}
        </Button>
        {!isMember && <Button variant="secondary" size="sm" onClick={onJoin}>Join</Button>}
        {isMember  && <Button variant="ghost"     size="sm" onClick={onLeave}>Leave</Button>}
      </div>
    </div>
  );
};

export default GroupCard;