// src/Store/useDailyGoalsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DailyGoal, DailyGoalProgress, DailyGoalsState } from "../Types/dailyGoals";

// Define our 3 daily goals that work for all subject combos
const DAILY_GOAL_TEMPLATES = [
  {
    id: "complete-5-questions",
    title: "Solve 5 Questions",
    description: "Complete 5 practice questions",
    xpReward: 50,
  },
  {
    id: "complete-1-topic",
    title: "Finish a Topic",
    description: "Complete all questions in a single topic",
    xpReward: 100,
  },
  {
    id: "practice-10-minutes",
    title: "Study for 10 Minutes",
    description: "Spend at least 10 minutes studying (active time in app)",
    xpReward: 75,
  },
];

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Initial state factory
const getInitialState = (): DailyGoalsState => ({
  date: getTodayDateString(),
  goals: DAILY_GOAL_TEMPLATES,
  progress: DAILY_GOAL_TEMPLATES.map((template) => ({
    id: template.id,
    completed: false,
    completedAt: null,
  })),
  totalXpEarnedToday: 0,
});

interface DailyGoalsStore extends DailyGoalsState {
  // Actions
  resetForNewDay: () => void;
  markGoalCompleted: (goalId: string) => void;
  checkAndUpdateGoalProgress: (
    questionsCompleted: number,
    topicsCompleted: string[],
    studyTimeMinutes: number
  ) => void;
}

export const useDailyGoalsStore = create<DailyGoalsStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      resetForNewDay: () => {
        const today = getTodayDateString();
        if (get().date !== today) {
          set(getInitialState());
        }
      },

      markGoalCompleted: (goalId: string) => {
        const currentProgress = get().progress;
        const goalIndex = currentProgress.findIndex((p) => p.id === goalId);
        if (goalIndex !== -1 && !currentProgress[goalIndex].completed) {
          const goal = get().goals.find((g) => g.id === goalId);
          if (goal) {
            const newProgress = [...currentProgress];
            newProgress[goalIndex] = {
              ...newProgress[goalIndex],
              completed: true,
              completedAt: new Date().toISOString(),
            };
            set({
              progress: newProgress,
              totalXpEarnedToday: get().totalXpEarnedToday + goal.xpReward,
            });
          }
        }
      },

      checkAndUpdateGoalProgress: (
        questionsCompleted: number,
        topicsCompleted: string[],
        studyTimeMinutes: number
      ) => {
        // Reset for new day if needed
        get().resetForNewDay();

        // Check each goal
        if (questionsCompleted >= 5) {
          get().markGoalCompleted("complete-5-questions");
        }

        if (topicsCompleted.length >= 1) {
          get().markGoalCompleted("complete-1-topic");
        }

        if (studyTimeMinutes >= 10) {
          get().markGoalCompleted("practice-10-minutes");
        }
      },
    }),
    {
      name: "daily-goals-storage",
    }
  )
);
