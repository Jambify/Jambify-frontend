
// src/Store/useStudyTrackingStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTodayActivity, upsertTodayActivity } from "../Services/DailyGoalsService";

interface StudyTrackingState {
  todayDate: string;
  questionsCompletedToday: number;
  topicsCompletedToday: string[]; // store topic names or ids
  studyStartTime: number | null; // timestamp when user started active session
  totalStudyTimeToday: number; // in minutes
  bestAccuracyToday: number; // Best accuracy percentage achieved today in any session
  lastSessionAccuracy: number; // Accuracy of the last completed session
  isLoading: boolean;
  isOnline: boolean;
}

interface StudyTrackingActions {
  resetForNewDay: () => void;
  startStudySession: () => void;
  stopStudySession: () => void;
  incrementQuestionsCompleted: (count?: number) => void;
  addCompletedTopic: (topicIdOrName: string) => void;
  getCurrentStudyTime: () => number; // Get total current study time (including active session)
  setSessionAccuracy: (accuracy: number) => void; // Set accuracy for the last completed session
  syncWithDatabase: () => Promise<void>;
}

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getInitialState = (): StudyTrackingState => ({
  todayDate: getTodayDateString(),
  questionsCompletedToday: 0,
  topicsCompletedToday: [],
  studyStartTime: null,
  totalStudyTimeToday: 0,
  bestAccuracyToday: 0,
  lastSessionAccuracy: 0,
  isLoading: false,
  isOnline: navigator.onLine,
});

// Debounce helper
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Create debounced sync function
let debouncedSync: (() => void) | null = null;

export const useStudyTrackingStore = create<
  StudyTrackingState & StudyTrackingActions
>()(
  persist(
    (set, get) => {
      // Initialize debounced sync
      const syncDb = async () => {
        if (!navigator.onLine) return;

        try {
          const dbActivity = await getTodayActivity();
          if (dbActivity) {
            set({
              questionsCompletedToday: Math.max(
                get().questionsCompletedToday,
                dbActivity.questions_completed
              ),
              topicsCompletedToday: Array.from(
                new Set([
                  ...get().topicsCompletedToday,
                  ...dbActivity.topics_completed,
                ])
              ),
              totalStudyTimeToday: Math.max(
                get().totalStudyTimeToday,
                dbActivity.total_study_minutes
              ),
              bestAccuracyToday: Math.max(
                get().bestAccuracyToday,
                Number(dbActivity.best_accuracy_today)
              ),
            });
          }

          await upsertTodayActivity({
            questions_completed: get().questionsCompletedToday,
            topics_completed: get().topicsCompletedToday,
            total_study_minutes: get().getCurrentStudyTime(),
            best_accuracy_today: get().bestAccuracyToday,
          });
        } catch (err) {
          console.error(`[useStudyTrackingStore] ❌ Sync FAILED:`, err);
        }
      };

      debouncedSync = debounce(syncDb, 1000);

      return {
        ...getInitialState(),

        resetForNewDay: () => {
          const today = getTodayDateString();
          if (get().todayDate !== today) {
            set(getInitialState());
          }
        },

        startStudySession: () => {
          get().resetForNewDay();
          if (get().studyStartTime === null) {
            set({ studyStartTime: Date.now() });
          }
        },

        stopStudySession: () => {
          const startTime = get().studyStartTime;
          if (startTime !== null) {
            const elapsedMs = Date.now() - startTime;
            const elapsedMinutes = Math.floor(elapsedMs / 60000);
            const newTotal = get().totalStudyTimeToday + elapsedMinutes;
            set({
              totalStudyTimeToday: newTotal,
              studyStartTime: null,
            });
            debouncedSync?.();
          }
        },

        getCurrentStudyTime: () => {
          const state = get();
          let total = state.totalStudyTimeToday;
          if (state.studyStartTime !== null) {
            const elapsedMs = Date.now() - state.studyStartTime;
            total += Math.floor(elapsedMs / 60000);
          }
          return total;
        },

        setSessionAccuracy: (accuracy: number) => {
          get().resetForNewDay();
          const currentBest = get().bestAccuracyToday;
          const newBest = Math.max(currentBest, accuracy);
          set({
            lastSessionAccuracy: accuracy,
            bestAccuracyToday: newBest,
          });
          debouncedSync?.();
        },

        incrementQuestionsCompleted: (count: number = 1) => {
          get().resetForNewDay();
          const newCount = get().questionsCompletedToday + count;
          set({
            questionsCompletedToday: newCount,
          });
          debouncedSync?.();
        },

        addCompletedTopic: (topicIdOrName: string) => {
          get().resetForNewDay();
          const currentTopics = get().topicsCompletedToday;
          if (!currentTopics.includes(topicIdOrName)) {
            const newTopics = [...currentTopics, topicIdOrName];
            set({
              topicsCompletedToday: newTopics,
            });
            debouncedSync?.();
          }
        },

        syncWithDatabase: async () => {
          debouncedSync?.();
        },
      };
    },
    {
      name: "study-tracking-storage",
    }
  )
);
