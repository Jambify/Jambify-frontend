import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Goal = {
  id: string;
  label: string;
  xp: number;
  done: boolean;
  check: (questionsCompleted: number, topicsCompleted: string[], studyTimeMinutes: number) => boolean;
};

type GoalState = {
  date: string; // YYYY-MM-DD
  goals: Goal[];
  // Auto-complete goals based on user activity
  checkAndCompleteGoals: (
    questionsCompleted: number,
    topicsCompleted: string[],
    studyTimeMinutes: number
  ) => void;
  resetForNewDay: () => void;
};

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDayOfWeek = () => {
  return new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
};

const goalSets: Goal[][] = [
  // Sunday
  [
    { id: "complete-5-questions", label: "Solve 5 practice questions", xp: 50, done: false, check: (q) => q >= 5 },
    { id: "complete-1-topic", label: "Complete all questions in a single topic", xp: 100, done: false, check: (_, t) => t.length >= 1 },
    { id: "practice-10-minutes", label: "Study for at least 10 minutes", xp: 75, done: false, check: (_, __, s) => s >= 10 }
  ],
  // Monday
  [
    { id: "complete-10-questions", label: "Solve 10 practice questions", xp: 80, done: false, check: (q) => q >= 10 },
    { id: "practice-15-minutes", label: "Study for at least 15 minutes", xp: 100, done: false, check: (_, __, s) => s >= 15 },
    { id: "score-80-percent", label: "Get 80% or more accuracy in a session", xp: 120, done: false, check: () => false } // Note: Requires more context
  ],
  // Tuesday
  [
    { id: "complete-2-topics", label: "Complete all questions in 2 topics", xp: 150, done: false, check: (_, t) => t.length >= 2 },
    { id: "practice-20-minutes", label: "Study for at least 20 minutes", xp: 120, done: false, check: (_, __, s) => s >= 20 },
    { id: "complete-7-questions", label: "Solve 7 practice questions", xp: 60, done: false, check: (q) => q >= 7 }
  ],
  // Wednesday
  [
    { id: "practice-25-minutes", label: "Study for at least 25 minutes", xp: 140, done: false, check: (_, __, s) => s >= 25 },
    { id: "complete-3-topics", label: "Complete all questions in 3 topics", xp: 200, done: false, check: (_, t) => t.length >= 3 },
    { id: "complete-12-questions", label: "Solve 12 practice questions", xp: 90, done: false, check: (q) => q >= 12 }
  ],
  // Thursday
  [
    { id: "complete-15-questions", label: "Solve 15 practice questions", xp: 100, done: false, check: (q) => q >= 15 },
    { id: "practice-30-minutes", label: "Study for at least 30 minutes", xp: 150, done: false, check: (_, __, s) => s >= 30 },
    { id: "complete-4-topics", label: "Complete all questions in 4 topics", xp: 250, done: false, check: (_, t) => t.length >= 4 }
  ],
  // Friday
  [
    { id: "practice-12-minutes", label: "Study for at least 12 minutes", xp: 85, done: false, check: (_, __, s) => s >= 12 },
    { id: "complete-8-questions", label: "Solve 8 practice questions", xp: 70, done: false, check: (q) => q >= 8 },
    { id: "complete-1-topic-friday", label: "Complete all questions in a single topic", xp: 110, done: false, check: (_, t) => t.length >= 1 }
  ],
  // Saturday
  [
    { id: "complete-20-questions", label: "Solve 20 practice questions", xp: 130, done: false, check: (q) => q >= 20 },
    { id: "practice-40-minutes", label: "Study for at least 40 minutes", xp: 200, done: false, check: (_, __, s) => s >= 40 },
    { id: "complete-5-topics", label: "Complete all questions in 5 topics", xp: 300, done: false, check: (_, t) => t.length >= 5 }
  ]
];

const getInitialGoals = (): Goal[] => {
  const dayIndex = getDayOfWeek();
  return goalSets[dayIndex].map(g => ({ ...g, done: false }));
};

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      date: getTodayDateString(),
      goals: getInitialGoals(),

      resetForNewDay: () => {
        const today = getTodayDateString();
        if (get().date !== today) {
          set({
            date: today,
            goals: getInitialGoals(),
          });
        }
      },

      checkAndCompleteGoals: (
        questionsCompleted: number,
        topicsCompleted: string[],
        studyTimeMinutes: number
      ) => {
        get().resetForNewDay();
        const currentGoals = get().goals;
        let updatedGoals = [...currentGoals];
        let hasChanges = false;

        // Check each goal
        updatedGoals.forEach(goal => {
          if (!goal.done && goal.check(questionsCompleted, topicsCompleted, studyTimeMinutes)) {
            goal.done = true;
            hasChanges = true;
          }
        });

        if (hasChanges) {
          set({ goals: updatedGoals });
        }
      },
    }),
    {
      name: "daily-goals-storage",
    }
  )
);
