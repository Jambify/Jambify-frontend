import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Question } from "../Types";
import { useStudyTrackingStore } from "./useStudyTrackingStore";

interface QuizState {
  // Data
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number>; // questionIndex → chosen option (-1 = timed out)
  // Flags
  isStarted: boolean;
  isFinished: boolean;
  hasAnswered: boolean; // true once current Q is answered
  // Timer
  timeLeft: number;
  quizDuration: number;
  // Filter
  selectedSubject: string;
  selectedTopic: string;
  selectedDifficulty: "Easy" | "Medium" | "Hard" | "All";
  isFinishedQuiz: boolean;
  finishQuiz: () => void; // Action to mark quiz as finished when time expires
  // Actions
  loadQuestions: (qs: Question[], duration?: number) => void;
  submitAnswer: (qi: number, opt: number) => void;
  updateTime: (seconds: number) => void;
  next: () => void;
  reset: () => void;
  setSelectedSubject: (s: string) => void;
  setSelectedTopic: (t: string) => void;
  setSelectedDifficulty: (d: "Easy" | "Medium" | "Hard" | "All") => void;
  setSubjectAndTopic: (subject: string, topic: string) => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      questions: [],
      currentIndex: 0,
      answers: {},
      isStarted: false,
      isFinished: false,
      hasAnswered: false,
      timeLeft: 0,
      quizDuration: 1800, // 30 mins default
      selectedSubject: "English",
      selectedTopic: "All",
      selectedDifficulty: "All",
      isFinishedQuiz: false,

      finishQuiz: () => {
        useStudyTrackingStore.getState().stopStudySession();
        return set({
          isFinished: true,
          isStarted: false,
          isFinishedQuiz: true,
        });
      },

      loadQuestions: (qs, duration = 1800) => {
        useStudyTrackingStore.getState().startStudySession();
        return set({
          questions: qs,
          currentIndex: 0,
          answers: {},
          isStarted: true,
          isFinished: false,
          hasAnswered: false,
          timeLeft: duration,
          quizDuration: duration,
        });
      },

      updateTime: (seconds) => set({ timeLeft: seconds }),

      submitAnswer: (qi, opt) => {
        useStudyTrackingStore.getState().incrementQuestionsCompleted();
        return set((s) => ({
          answers: { ...s.answers, [qi]: opt },
          hasAnswered: true,
        }));
      },

      next: () => {
        const { currentIndex, questions } = get();
        const nextIndex = currentIndex + 1;
        if (nextIndex >= questions.length) {
          set({ isFinished: true, hasAnswered: false });
        } else {
          set({ currentIndex: nextIndex, hasAnswered: false });
        }
      },

      reset: () => {
        useStudyTrackingStore.getState().stopStudySession();
        // Clear the timer localStorage as well
        localStorage.removeItem("jambify-quiz-session-timer-end");
        set({
          questions: [],
          currentIndex: 0,
          answers: {},
          isStarted: false,
          isFinished: false,
          hasAnswered: false,
          isFinishedQuiz: false,
          timeLeft: 0,
          quizDuration: 1800,
          selectedTopic: "All",
          selectedDifficulty: "All",
        });
      },

      setSelectedSubject: (s) =>
        set({
          selectedSubject: s,
          selectedTopic: "All",
          selectedDifficulty: "All",
        }),
      setSelectedTopic: (t) => set({ selectedTopic: t }),
      setSelectedDifficulty: (d) => set({ selectedDifficulty: d }),
      setSubjectAndTopic: (subject, topic) =>
        set({
          selectedSubject: subject,
          selectedTopic: topic,
          selectedDifficulty: "All",
        }),
    }),
    {
      name: "jambify-quiz-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist essential state to keep it lightweight - DO NOT persist timer or quiz flags
      partialize: (state) => ({
        questions: state.questions,
        currentIndex: state.currentIndex,
        answers: state.answers,
        isStarted: state.isStarted,
        isFinished: state.isFinished,
        hasAnswered: state.hasAnswered,
        quizDuration: state.quizDuration,
        timeLeft: state.timeLeft,
        selectedSubject: state.selectedSubject,
        selectedTopic: state.selectedTopic,
        selectedDifficulty: state.selectedDifficulty,
      }),
    }
  )
);
