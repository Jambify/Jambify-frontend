import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Goal = {
  id: string;
  label: string;
  xp: number;
  done: boolean;
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

const getInitialGoals = (): Goal[] => [
  { id: "complete-5-questions", label: "Solve 5 practice questions", xp: 50, done: false },
  { id: "complete-1-topic", label: "Complete all questions in a single topic", xp: 100, done: false },
  { id: "practice-10-minutes", label: "Study for at least 10 minutes", xp: 75, done: false },
];

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
        const goal1 = updatedGoals.find((g) => g.id === "complete-5-questions");
        if (goal1 && !goal1.done && questionsCompleted >= 5) {
          goal1.done = true;
          hasChanges = true;
        }

        const goal2 = updatedGoals.find((g) => g.id === "complete-1-topic");
        if (goal2 && !goal2.done && topicsCompleted.length >= 1) {
          goal2.done = true;
          hasChanges = true;
        }

        const goal3 = updatedGoals.find((g) => g.id === "practice-10-minutes");
        if (goal3 && !goal3.done && studyTimeMinutes >= 10) {
          goal3.done = true;
          hasChanges = true;
        }

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
