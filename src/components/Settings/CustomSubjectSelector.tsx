import React from "react";
import { cn } from "../../lib/utils/utils";
import { ALL_SUBJECTS_MASTER } from "../../Store/useSubjectStore";

interface CustomSubjectSelectorProps {
  selectedSubjects: string[];
  onChange: (subjects: string[]) => void;
}

const CustomSubjectSelector: React.FC<CustomSubjectSelectorProps> = ({
  selectedSubjects,
  onChange,
}) => {
  // English is compulsory (always selected and can't be deselected)
  const toggleSubject = (subjectName: string) => {
    if (subjectName === "English") return; // Can't unselect English

    if (selectedSubjects.includes(subjectName)) {
      // Deselect (if not English)
      onChange(selectedSubjects.filter((s) => s !== subjectName));
    } else {
      // Select (max 4 subjects total including English)
      if (selectedSubjects.length < 4) {
        onChange([...selectedSubjects, subjectName]);
      }
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-textDim text-sm">
        English is compulsory. Select 3 more subjects.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {ALL_SUBJECTS_MASTER.map((subject) => {
          const isSelected = selectedSubjects.includes(subject.name);
          const isCompulsory = subject.name === "English";
          return (
            <button
              key={subject.id}
              onClick={() => toggleSubject(subject.name)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left transition-all",
                isSelected
                  ? "bg-brand/10 border-brand"
                  : "bg-bgSurface border-borderMuted hover:border-white/20",
                isCompulsory && "cursor-not-allowed",
              )}
              disabled={isCompulsory}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{subject.icon}</span>
                <span className="text-textMain text-sm font-medium">
                  {subject.name}
                </span>
                {isCompulsory && (
                  <span className="text-textDim text-[10px] font-semibold">
                    (Compulsory)
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomSubjectSelector;
