import { create } from 'zustand';
import type { Question } from '../Types';

interface QuizState {
  // Data
  questions:       Question[];
  currentIndex:    number;
  answers:         Record<number, number>;  // questionIndex → chosen option (-1 = timed out)
  // Flags
  isStarted:       boolean;
  isFinished:      boolean;
  hasAnswered:     boolean;               // true once current Q is answered
  // Filter
  selectedSubject: string;
  // Actions
  loadQuestions:     (qs: Question[]) => void;
  submitAnswer:      (qi: number, opt: number) => void;
  next:              () => void;
  reset:             () => void;
  setSelectedSubject:(s: string) => void;
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  questions:       [],
  currentIndex:    0,
  answers:         {},
  isStarted:       false,
  isFinished:      false,
  hasAnswered:     false,
  selectedSubject: 'All',

  loadQuestions: (qs) =>
    set({
      questions:    qs,
      currentIndex: 0,
      answers:      {},
      isStarted:    true,
      isFinished:   false,
      hasAnswered:  false,
    }),

  submitAnswer: (qi, opt) =>
    set((s) => ({
      answers:     { ...s.answers, [qi]: opt },
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
      questions:    [],
      currentIndex: 0,
      answers:      {},
      isStarted:    false,
      isFinished:   false,
      hasAnswered:  false,
    }),

  setSelectedSubject: (s) => set({ selectedSubject: s }),
}));