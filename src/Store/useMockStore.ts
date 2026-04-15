import { create } from 'zustand';
import type { Question } from '../Types';

export interface MockAttempt {
  id:            string;
  date:          string;
  score:         number;
  total:         number;
  timeTaken:     number;   // seconds
  subjectScores: Record<string, { correct: number; total: number }>;
}

interface MockState {
  // Active exam
  questions:    Question[];
  currentIndex: number;
  answers:      Record<number, number>;
  timeLeft:     number;
  isStarted:    boolean;
  isFinished:   boolean;
  // History
  attempts:     MockAttempt[];
  // Actions
  startExam:      (questions: Question[], duration: number) => void;
  submitAnswer:   (qi: number, opt: number) => void;
  nextQuestion:   (index: number) => void;
  prevQuestion:   () => void;
  finishExam:     () => void;
  resetExam:      () => void;
  tickTimer:      () => void;
}

const buildSubjectScores = (
  questions: Question[],
  answers:   Record<number, number>,
) => {
  const map: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q, i) => {
    if (!map[q.subject]) map[q.subject] = { correct: 0, total: 0 };
    map[q.subject].total++;
    if (answers[i] === q.answer) map[q.subject].correct++;
  });
  return map;
};

export const useMockStore = create<MockState>()((set, get) => ({
  questions:    [],
  currentIndex: 0,
  answers:      {},
  timeLeft:     0,
  isStarted:    false,
  isFinished:   false,
  attempts:     [],

  startExam: (questions, duration) =>
    set({
      questions,
      currentIndex: 0,
      answers:      {},
      timeLeft:     duration,
      isStarted:    true,
      isFinished:   false,
    }),

  submitAnswer: (qi, opt) =>
    set((s) => ({ answers: { ...s.answers, [qi]: opt } })),

  nextQuestion: (index) =>
    set({ currentIndex: index }),

  prevQuestion: () =>
    set((s) => ({ currentIndex: Math.max(0, s.currentIndex - 1) })),

  tickTimer: () =>
    set((s) => ({ timeLeft: Math.max(0, s.timeLeft - 1) })),

  finishExam: () => {
    const { questions, answers, timeLeft } = get();
    const score    = questions.filter((q, i) => answers[i] === q.answer).length;
    const attempt: MockAttempt = {
      id:            Date.now().toString(),
      date:          new Date().toLocaleDateString('en-GB', {
                       day: 'numeric', month: 'short', year: 'numeric'
                     }),
      score,
      total:         questions.length,
      timeTaken:     7200 - timeLeft,
      subjectScores: buildSubjectScores(questions, answers),
    };
    set((s) => ({
      isFinished: true,
      attempts:   [...s.attempts, attempt],
    }));
  },

  resetExam: () =>
    set({
      questions:    [],
      currentIndex: 0,
      answers:      {},
      timeLeft:     0,
      isStarted:    false,
      isFinished:   false,
    }),
}));