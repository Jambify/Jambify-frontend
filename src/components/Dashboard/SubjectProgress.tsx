import React from "react";
import { useNavigate } from "react-router-dom";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { useUserStore } from "../../Store/useUserStore";
import { useSubjectStore, SUBJECT_COMBO_MAP } from "../../Store/useSubjectStore";
import { BookOpen, AlertTriangle, ArrowRight, CheckCircle, Sparkles } from "lucide-react";

// Helper to get subject icons
const getSubjectIcon = (subject: string) => {
  const icons: Record<string, string> = {
    English: "📖",
    Mathematics: "🔢",
    Physics: "⚡",
    Chemistry: "⚗️",
    Biology: "🧬",
    Economics: "📊",
    Government: "🏛️",
    "Literature in English": "📚",
    CRS: "✝️",
    IRS: "🌙",
    Commerce: "💼",
  };
  return icons[subject] || "📖";
};

const SubjectProgress: React.FC = () => {
  const navigate = useNavigate();
  const { topicStats, isLoading } = usePerformanceStore();
  const { subjectCombo } = useUserStore();
  const { subjects } = useSubjectStore();

  // Get user's subjects from combo ID (e.g. "medicine" -> ["English", "Biology", ...])
  const userSubjects = Array.isArray(subjectCombo) 
    ? subjectCombo 
    : subjectCombo
    ? SUBJECT_COMBO_MAP[subjectCombo] || [subjectCombo] // Fallback to raw string if not in map
    : [];

  // Only use topicStats that are part of user's subject combo and have accuracy < 50
  const comboWeakestTopics = topicStats.filter(
    (t) => userSubjects.some(s => s.toLowerCase() === t.subject.toLowerCase()) && t.accuracy < 50
  );

  // Check if user has taken any exams or quizzes
  const hasActivity = usePerformanceStore.getState().mockHistory.length > 0 || topicStats.length > 0;

  // If no activity yet, show the "No Exam Taken" placeholder
  if (!hasActivity && !isLoading) {
    return (
      <div className="bg-bgCard border-borderMuted rounded-brand-xl flex h-full flex-col items-center justify-center border p-6 text-center">
        <div className="bg-brand/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <BookOpen className="text-brand h-6 w-6" />
        </div>
        <h3 className="font-display text-textMain mb-2 font-bold">
          No Exam Taken Yet
        </h3>
        <p className="text-textDim mb-6 max-w-60 text-sm">
          Take your first mock exam to unlock your personalized progress tracking.
        </p>
        <button
          onClick={() => navigate("/mock-exams")}
          className="bg-brand hover:bg-brand-light rounded-full px-6 py-2 text-sm font-bold text-white transition-all active:scale-95"
        >
          Take Mock Exam
        </button>
      </div>
    );
  }

  // If all topics mastered (no weak topics found), show "All Mastered" placeholder
  if (comboWeakestTopics.length === 0 && !isLoading) {
    return (
      <div className="bg-bgCard border-borderMuted rounded-brand-xl flex h-full flex-col items-center justify-center border p-6 text-center">
        <div className="bg-success/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <CheckCircle className="text-success h-6 w-6" />
        </div>
        <h3 className="font-display text-textMain mb-2 font-bold">
          All Topics Mastered!
        </h3>
        <p className="text-textDim mb-6 max-w-60 text-sm">
          You've reached over 50% accuracy in all your topics. Ready for the exam!
        </p>
        <button
          onClick={() => navigate("/mock-exams")}
          className="bg-success hover:bg-success-light rounded-full px-6 py-2 text-sm font-bold text-white transition-all active:scale-95"
        >
          Final Mock Exam
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bgCard border-borderMuted rounded-brand-xl flex h-full flex-col border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-display text-textMain font-bold">
            Weakest Topics
          </h3>
          <p className="text-textDim text-[11px] font-medium">
            One critical area from each of your subjects
          </p>
        </div>
        <button
          onClick={() => navigate("/performance")}
          className="text-brand hover:text-brand-light group flex items-center gap-1 text-xs font-bold"
        >
          View all{" "}
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <div className="custom-scrollbar space-y-3 overflow-y-auto pr-1">
        {comboWeakestTopics.map((item, index) => {
          const subjectData = subjects.find((s) => s.name === item.subject);
          const progressColor =
            item.accuracy < 30
              ? "#FF4D6D"
              : "#FFB020";

          return (
            <div
              key={`${item.subject}-${item.name}-${index}`}
              className="group cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() =>
                navigate(
                  `/quiz?subject=${encodeURIComponent(item.subject)}&topic=${encodeURIComponent(item.name)}`
                )
              }
            >
              <div className="bg-bgSurface border-borderMuted hover:border-brand/30 rounded-brand-lg flex items-center gap-3 border p-4 transition-all">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                  style={{ background: `${subjectData?.color || "#7B5FFF"}20` }}
                >
                  {getSubjectIcon(item.subject)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-textMain group-hover:text-brand text-sm font-bold transition-colors truncate">
                    {item.name}
                  </p>
                  <p className="text-textDim text-[11px] font-medium">
                    {item.subject}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-textMain text-xs font-bold">
                      {Math.round(item.accuracy)}%
                    </span>
                    {item.accuracy < 30 ? (
                      <AlertTriangle size={12} className="text-danger" />
                    ) : (
                      <Sparkles size={12} className="text-warn" />
                    )}
                  </div>
                  <div className="bg-bgTrack w-20 h-1.5 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.accuracy}%`,
                        background: progressColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectProgress;