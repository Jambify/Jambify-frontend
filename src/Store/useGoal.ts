
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getTodayGoalsProgress,
  upsertGoalProgress,
} from "../Services/DailyGoalsService";

export type Goal = {
  id: string;
  label: string;
  xp: number;
  done: boolean;
  check: (
    questionsCompleted: number,
    topicsCompleted: string[],
    studyTimeMinutes: number,
    bestAccuracyToday: number
  ) => boolean;
};

type GoalState = {
  date: string; // YYYY-MM-DD
  goals: Goal[];
  isLoading: boolean;
  // Auto-complete goals based on user activity
  checkAndCompleteGoals: (
    questionsCompleted: number,
    topicsCompleted: string[],
    studyTimeMinutes: number,
    bestAccuracyToday: number
  ) => Promise<void>;
  resetForNewDay: () => void;
  syncWithDatabase: () => Promise<void>;
  reset: () => void
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
    {
      id: "complete-40-questions",
      label: "Solve 40 practice questions",
      xp: 200,
      done: false,
      check: (q) => q >= 40,
    },
    {
      id: "complete-2-topics",
      label: "Complete all questions in 2 topics",
      xp: 150,
      done: false,
      check: (_, t) => t.length >= 2,
    },
    {
      id: "practice-180-minutes",
      label: "Study for at least 3 hours",
      xp: 250,
      done: false,
      check: (_, __, s) => s >= 180,
    },
  ],
  // Monday
  [
    {
      id: "complete-45-questions",
      label: "Solve 45 practice questions",
      xp: 220,
      done: false,
      check: (q) => q >= 45,
    },
    {
      id: "practice-210-minutes",
      label: "Study for at least 3.5 hours",
      xp: 280,
      done: false,
      check: (_, __, s) => s >= 210,
    },
    {
      id: "score-85-percent",
      label: "Get 85% or more accuracy in a session",
      xp: 150,
      done: false,
      check: (_, __, ___, a) => a >= 85,
    },
  ],
  // Tuesday
  [
    {
      id: "complete-3-topics",
      label: "Complete all questions in 3 topics",
      xp: 200,
      done: false,
      check: (_, t) => t.length >= 3,
    },
    {
      id: "practice-240-minutes",
      label: "Study for at least 4 hours",
      xp: 300,
      done: false,
      check: (_, __, s) => s >= 240,
    },
    {
      id: "complete-50-questions",
      label: "Solve 50 practice questions",
      xp: 240,
      done: false,
      check: (q) => q >= 50,
    },
  ],
  // Wednesday
  [
    {
      id: "practice-270-minutes",
      label: "Study for at least 4.5 hours",
      xp: 330,
      done: false,
      check: (_, __, s) => s >= 270,
    },
    {
      id: "complete-4-topics",
      label: "Complete all questions in 4 topics",
      xp: 250,
      done: false,
      check: (_, t) => t.length >= 4,
    },
    {
      id: "complete-55-questions",
      label: "Solve 55 practice questions",
      xp: 260,
      done: false,
      check: (q) => q >= 55,
    },
  ],
  // Thursday
  [
    {
      id: "complete-60-questions",
      label: "Solve 60 practice questions",
      xp: 280,
      done: false,
      check: (q) => q >= 60,
    },
    {
      id: "practice-300-minutes",
      label: "Study for at least 5 hours",
      xp: 360,
      done: false,
      check: (_, __, s) => s >= 300,
    },
    {
      id: "complete-5-topics",
      label: "Complete all questions in 5 topics",
      xp: 300,
      done: false,
      check: (_, t) => t.length >= 5,
    },
  ],
  // Friday
  [
    {
      id: "practice-180-minutes-friday",
      label: "Study for at least 3 hours",
      xp: 220,
      done: false,
      check: (_, __, s) => s >= 180,
    },
    {
      id: "complete-40-questions-friday",
      label: "Solve 40 practice questions",
      xp: 200,
      done: false,
      check: (q) => q >= 40,
    },
    {
      id: "complete-2-topics-friday",
      label: "Complete all questions in 2 topics",
      xp: 170,
      done: false,
      check: (_, t) => t.length >= 2,
    },
  ],
  // Saturday
  [
    {
      id: "complete-70-questions",
      label: "Solve 70 practice questions",
      xp: 320,
      done: false,
      check: (q) => q >= 70,
    },
    {
      id: "practice-360-minutes",
      label: "Study for at least 6 hours",
      xp: 400,
      done: false,
      check: (_, __, s) => s >= 360,
    },
    {
      id: "complete-6-topics",
      label: "Complete all questions in 6 topics",
      xp: 350,
      done: false,
      check: (_, t) => t.length >= 6,
    },
  ],
];

const getInitialGoals = (): Goal[] => {
  const dayIndex = getDayOfWeek();
  return goalSets[dayIndex].map((g) => ({ ...g, done: false }));
};

// Debounce helper
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

let debouncedGoalSync: (() => void) | null = null;

export const useGoalStore = create<GoalState>()(

  persist(
    (set, get) => {
      const syncDb = async () => {
        if (!navigator.onLine) return;

        try {
          set({ isLoading: true });

          const dbProgress = await getTodayGoalsProgress();
          const dayIndex = getDayOfWeek();
          const todayGoalDefs = goalSets[dayIndex];

          // Merge DB progress with goal definitions
          const mergedGoals = todayGoalDefs.map((def) => {
            const persisted = dbProgress.find((p) => p.goal_id === def.id);
            return {
              ...def,
              done: persisted?.completed || false,
            };
          });

          set({ goals: mergedGoals, isLoading: false });
        } catch (err) {
          console.error(`[useGoalStore] ❌ Sync FAILED:`, err);
          set({ isLoading: false });
        }
      };

      debouncedGoalSync = debounce(syncDb, 1000);

      return {
        date: getTodayDateString(),
        goals: getInitialGoals(),
        isLoading: false,

        resetForNewDay: () => {
          const today = getTodayDateString();
          if (get().date !== today) {
            set({
              date: today,
              goals: getInitialGoals(),
            });
          }
        },
        reset: () => {
          set({
            date: getTodayDateString(),
            goals: getInitialGoals(),
            isLoading: false,
          });
          localStorage.removeItem("daily-goals-storage");
        },

        syncWithDatabase: async () => {
          debouncedGoalSync?.();
        },

        checkAndCompleteGoals: async (
          questionsCompleted: number,
          topicsCompleted: string[],
          studyTimeMinutes: number,
          bestAccuracyToday: number
        ) => {
          get().resetForNewDay();

          const dayIndex = getDayOfWeek();
          const todayGoalDefs = goalSets[dayIndex];
          const currentGoals = get().goals;

          let hasChanges = false;
          const updatedGoals = currentGoals.map((goal) => {
            const goalDef = todayGoalDefs.find((g) => g.id === goal.id);
            if (!goalDef) return goal;

            const shouldComplete =
              !goal.done &&
              goalDef.check(
                questionsCompleted,
                topicsCompleted,
                studyTimeMinutes,
                bestAccuracyToday
              );

            if (shouldComplete) {
              console.log(`[useGoalStore] 🎉 Goal "${goal.label}" completed!`);
              hasChanges = true;
              // Update DB asynchronously
              upsertGoalProgress(goal.id, true, goalDef.xp);
              return { ...goal, done: true };
            }

            return goal;
          });

          if (hasChanges) {
            set({ goals: updatedGoals });
          }

        },
      };
    },

    {
      name: "daily-goals-storage",
      partialize: (state) => ({
        date: state.date,
        goals: state.goals.map((g) => ({ id: g.id, done: g.done })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const dayIndex = getDayOfWeek();
          const todayGoalDefs = goalSets[dayIndex];
          const persistedDate = state.date;
          const today = getTodayDateString();

          if (persistedDate === today) {
            state.goals = todayGoalDefs.map((def) => {
              const persistedGoal = state.goals?.find((g) => g.id === def.id);
              return {
                ...def,
                done: persistedGoal?.done || false,
              };
            });
          } else {
            state.date = today;
            state.goals = getInitialGoals();
          }
        }
      },
    }

  )

);

