// src/Store/useStudyTrackingStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StudyTrackingState {
  todayDate: string;
  questionsCompletedToday: number;
  topicsCompletedToday: string[]; // store topic names or ids
  studyStartTime: number | null; // timestamp when user started active session
  totalStudyTimeToday: number; // in minutes
}

interface StudyTrackingActions {
  resetForNewDay: () => void;
  startStudySession: () => void;
  stopStudySession: () => void;
  incrementQuestionsCompleted: (count?: number) => void;
  addCompletedTopic: (topicIdOrName: string) => void;
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
