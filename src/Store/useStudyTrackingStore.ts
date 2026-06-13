// src/Store/useStudyTrackingStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StudyTrackingState {
  todayDate: string;
  questionsCompletedToday: number;
  topicsCompletedToday: string[]; // store topic names or ids
  studyStartTime: number | null; // timestamp when user started active session
  totalStudyTimeToday: number; // in minutes
  bestAccuracyToday: number; // Best accuracy percentage achieved today in any session
  lastSessionAccuracy: number; // Accuracy of the last completed session
}

interface StudyTrackingActions {
  resetForNewDay: () => void;
  startStudySession: () => void;
  stopStudySession: () => void;
  incrementQuestionsCompleted: (count?: number) => void;
  addCompletedTopic: (topicIdOrName: string) => void;
  getCurrentStudyTime: () => number; // Get total current study time (including active session)
  setSessionAccuracy: (accuracy: number) => void; // Set accuracy for the last completed session
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
});

export const useStudyTrackingStore = create<
  StudyTrackingState & StudyTrackingActions
>()(
  persist(
    (set, get) => ({
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
          set({
            totalStudyTimeToday: get().totalStudyTimeToday + elapsedMinutes,
            studyStartTime: null,
          });
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
        set({
          lastSessionAccuracy: accuracy,
          bestAccuracyToday: Math.max(currentBest, accuracy),
        });
      },

      incrementQuestionsCompleted: (count: number = 1) => {
        get().resetForNewDay();
        set({
          questionsCompletedToday: get().questionsCompletedToday + count,
        });
      },

      addCompletedTopic: (topicIdOrName: string) => {
        get().resetForNewDay();
        if (!get().topicsCompletedToday.includes(topicIdOrName)) {
          set({
            topicsCompletedToday: [
              ...get().topicsCompletedToday,
              topicIdOrName,
            ],
          });
        }
      },
    }),
    {
      name: "study-tracking-storage",
    }
  )
);
