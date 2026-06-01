// src/Store/useMockStore.ts

import { create } from 'zustand';
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
  visitedQuestions: Set<number>;
  markedForReview: Set<number>;
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
}

export const useMockStore = create<MockState>()((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: {},
  visitedQuestions: new Set(),
  markedForReview: new Set(),
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
      visitedQuestions: new Set([0]),
      markedForReview: new Set(),
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
      const newMarked = new Set(state.markedForReview);
      if (newMarked.has(index)) {
        newMarked.delete(index);
      } else {
        newMarked.add(index);
      }
      return { markedForReview: newMarked };
    }),

  setVisited: (index) =>
    set((state) => ({
      visitedQuestions: new Set(state.visitedQuestions).add(index),
    })),

  setCurrentIndex: (index) =>
    set((state) => {
      const newVisited = new Set(state.visitedQuestions).add(index);
      return { currentIndex: index, visitedQuestions: newVisited };
    }),

  nextQuestion: () =>
    set((state) => {
      const nextIndex = Math.min(state.currentIndex + 1, state.questions.length - 1);
      const newVisited = new Set(state.visitedQuestions).add(nextIndex);
      return { currentIndex: nextIndex, visitedQuestions: newVisited };
    }),

  prevQuestion: () =>
    set((state) => {
      const prevIndex = Math.max(state.currentIndex - 1, 0);
      const newVisited = new Set(state.visitedQuestions).add(prevIndex);
      return { currentIndex: prevIndex, visitedQuestions: newVisited };
    }),

  tickTimer: () =>
    set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),

  finishExam: (timeTaken) => {
    const { questions, answers } = get();
    const results = calculateExamResults(questions, answers);
    
    const attempt: MockAttempt = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      results,
      timeTaken,
    };

    set((state) => ({
      isFinished: true,
      isStarted: false,
      lastResult: results,
      attempts: [attempt, ...state.attempts],
    }));
  },

  resetExam: () =>
    set({
      questions: [],
      currentIndex: 0,
      answers: {},
      visitedQuestions: new Set(),
      markedForReview: new Set(),
      timeLeft: 0,
      isStarted: false,
      isFinished: false,
      lastResult: null,
    }),

  clearResponse: (index) =>
    set((state) => {
      const newAnswers = { ...state.answers };
      delete newAnswers[index];
      return { answers: newAnswers };
    }),
}));
