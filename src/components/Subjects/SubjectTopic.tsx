import React from 'react';
import type { Subject } from '../../Store/useSubjectStore';

interface SubjectTopicsProps {
  subjects: Subject[];
}

const SubjectTopics: React.FC<SubjectTopicsProps> = ({ subjects }) => {
  return (
    <div className="bg-bgCard border border-borderMuted rounded-brand-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-borderMutedbg-white/2">
        <h3 className="font-display font-bold text-textMain flex items-center gap-2">
          <span className="text-danger">🎯</span> Weak Topics Focus
        </h3>
      </div>
      <div className="divide-y divide-borderMuted">
        {subjects.map((subject) => (
          <div key={subject.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-32 shrink-0">
              <p className="text-sm font-bold text-textMain">{subject.name}</p>
              <p className="text-[10px] text-textDim uppercase tracking-tighter">
                {subject.weakTopics.length} Topics to revise
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {subject.weakTopics.map((topic) => (
                <span 
                  key={topic}
                  className="px-3 py-1 rounded-md bg-danger/5 border border-danger/10 text-danger text-xs font-medium hover:bg-danger/10 transition-colors cursor-default"
                >
                  {topic}
                </span>
              ))}
              {subject.weakTopics.length === 0 && (
                <span className="text-xs text-success italic">Mastery achieved in this subject!</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectTopics;