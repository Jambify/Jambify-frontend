import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Question } from "../Types";

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

      finishQuiz: () =>
        set({
          isFinished: true,
          isStarted: false,
          isFinishedQuiz: true,
        }),

      loadQuestions: (qs, duration = 1800) =>
        set({
          questions: qs,
          currentIndex: 0,
          answers: {},
          isStarted: true,
          isFinished: false,
          hasAnswered: false,
          timeLeft: duration,
          quizDuration: duration,
        }),

      updateTime: (seconds) => set({ timeLeft: seconds }),

      submitAnswer: (qi, opt) =>
        set((s) => ({
          answers: { ...s.answers, [qi]: opt },
          hasAnswered: true,
        })),

      next: () => {
        const { currentIndex, questions } = get();
        const nextIndex = currentIndex + 1;
        if (nextIndex >= questions.length) {
          set({ isFinished: true, hasAnswered: false });
        } else {
          set({ currentIndex: nextIndex, hasAnswered: false });
        }
      },

      reset: () =>
        set({
          questions: [],
          currentIndex: 0,
          answers: {},
          isStarted: false,
          isFinished: false,
          hasAnswered: false,
          isFinishedQuiz: false,
          selectedTopic: "All",
          selectedDifficulty: "All",
        }),

      setSelectedSubject: (s) =>
        set({
          selectedSubject: s,
          selectedTopic: "All",
          selectedDifficulty: "All",
        }),
      setSelectedTopic: (t) => set({ selectedTopic: t }),
      setSelectedDifficulty: (d) => set({ selectedDifficulty: d }),
    }),
    {
      name: "jambify-quiz-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist essential state to keep it lightweight
      partialize: (state) => ({
        questions: state.questions,
        currentIndex: state.currentIndex,
        answers: state.answers,
        isStarted: state.isStarted,
        isFinished: state.isFinished,
        timeLeft: state.timeLeft,
        quizDuration: state.quizDuration,
        selectedSubject: state.selectedSubject,
        selectedTopic: state.selectedTopic,
        selectedDifficulty: state.selectedDifficulty,
      }),
    }
  )
);
