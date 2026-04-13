import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjectStore } from '../../Store/useSubjectStore';
import { cn } from '../../lib/utils';

const SubjectProgress: React.FC = () => {
  const navigate = useNavigate();
  const { subjects } = useSubjectStore();
  const weakSubject = subjects.find(s => s.accuracy < 55);

  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold tracking-tight">Subject Progress</h3>
        <button
          onClick={() => navigate('/subjects')}
          className="text-xs text-brand-light hover:underline"
        >
          View all →
        </button>
      </div>

      <div className="space-y-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="flex items-center gap-3">
            <span className="text-base w-7 shrink-0">{subject.icon}</span>
            <span className="text-sm font-medium w-24 shrink-0 truncate">{subject.name}</span>
            <div className="flex-1 h-1.5 bg-bgSurface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${subject.accuracy}%`, backgroundColor: subject.color }}
              />
            </div>
            <span
              className={cn(
                'text-xs font-mono w-8 text-right shrink-0',
                subject.accuracy < 55 ? 'text-danger font-semibold' : 'text-textMuted'
              )}
            >
              {subject.accuracy}%
            </span>
          </div>
        ))}
      </div>

      {weakSubject && (
        <div className="mt-4 px-3 py-2.5 bg-danger/10 border border-danger/20 rounded-brand text-xs text-danger">
          ⚠️ {weakSubject.name} needs attention — weak topics detected
        </div>
      )}
    </div>
  );
};

export default SubjectProgress;