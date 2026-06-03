// src/Store/useMockStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from '../Types';
import { calculateExamResults, type ExamResult } from '../utils/examCalculations';

export interface MockAttempt {
  id: string;
  date: string;
  results: ExamResult;
  timeTaken: number; // seconds
}

interface MockState {
  // Active exam state
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number>; // index -> optionIndex
  visitedQuestions: number[]; // Change to number[] for persistence
  markedForReview: number[]; // Change to number[] for persistence
  timeLeft: number;
  isStarted: boolean;
  isFinished: boolean;

  // Results
  lastResult: ExamResult | null;
  attempts: MockAttempt[];

  // Actions
  startExam: (questions: Question[], duration: number) => void;
  submitAnswer: (index: number, optionIndex: number | null) => void;
  markForReview: (index: number) => void;
  setVisited: (index: number) => void;
  setCurrentIndex: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishExam: (timeTaken: number) => void;
  resetExam: () => void;
  tickTimer: () => void;
  clearResponse: (index: number) => void;
  updateTimeLeft: (seconds: number) => void;
}

export const useMockStore = create<MockState>()(
  persist(
    (set, get) => ({
      questions: [],
      currentIndex: 0,
      answers: {},
      visitedQuestions: [],
      markedForReview: [],
      timeLeft: 0,
      isStarted: false,
      isFinished: false,
      lastResult: null,
      attempts: [],

      startExam: (questions, duration) =>
        set({
          questions,
          currentIndex: 0,
          answers: {},
          visitedQuestions: [0],
          markedForReview: [],
          timeLeft: duration,
          isStarted: true,
          isFinished: false,
          lastResult: null,
        }),

      submitAnswer: (index, optionIndex) =>
        set((state) => {
          const newAnswers = { ...state.answers };
          if (optionIndex === null) {
            delete newAnswers[index];
          } else {
            newAnswers[index] = optionIndex;
          }
          return { answers: newAnswers };
        }),

      markForReview: (index) =>
        set((state) => {
          const newMarked = [...state.markedForReview];
          const idx = newMarked.indexOf(index);
          if (idx !== -1) {
            newMarked.splice(idx, 1);
          } else {
            newMarked.push(index);
          }
          return { markedForReview: newMarked };
        }),

      setVisited: (index) =>
        set((state) => {
          if (state.visitedQuestions.includes(index)) return state;
          return { visitedQuestions: [...state.visitedQuestions, index] };
        }),

      setCurrentIndex: (index) =>
        set((state) => {
          const newVisited = state.visitedQuestions.includes(index)
            ? state.visitedQuestions
            : [...state.visitedQuestions, index];
          return { currentIndex: index, visitedQuestions: newVisited };
        }),

      nextQuestion: () => {
        const { currentIndex, questions } = get();
        if (currentIndex < questions.length - 1) {
          get().setCurrentIndex(currentIndex + 1);
        }
      },

      prevQuestion: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          get().setCurrentIndex(currentIndex - 1);
        }
      },

      finishExam: (timeTaken) => {
        const { questions, answers, attempts } = get();
        const results = calculateExamResults(questions, answers);
        const newAttempt: MockAttempt = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          results,
          timeTaken,
        };
        set({
          isFinished: true,
          isStarted: false,
          lastResult: results,
          attempts: [newAttempt, ...attempts],
        });
      },

      resetExam: () =>
        set({
          questions: [],
          currentIndex: 0,
          answers: {},
          visitedQuestions: [],
          markedForReview: [],
          timeLeft: 0,
          isStarted: false,
          isFinished: false,
          lastResult: null,
        }),

      tickTimer: () =>
        set((state) => ({
          timeLeft: Math.max(0, state.timeLeft - 1),
        })),

      updateTimeLeft: (seconds) => set({ timeLeft: seconds }),

      clearResponse: (index) =>
        set((state) => {
          const newAnswers = { ...state.answers };
          delete newAnswers[index];
          return { answers: newAnswers };
        }),
    }),
    {
      name: 'jambify-mock-exam',
      partialize: (state) => ({
        questions: state.questions,
        currentIndex: state.currentIndex,
        answers: state.answers,
        visitedQuestions: state.visitedQuestions,
        markedForReview: state.markedForReview,
        timeLeft: state.timeLeft,
        isStarted: state.isStarted,
        isFinished: state.isFinished,
        lastResult: state.lastResult,
        attempts: state.attempts,
      }),
    }
  )
);
