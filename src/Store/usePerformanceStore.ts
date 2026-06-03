// src/Store/usePerformanceStore.ts

import { create } from 'zustand';
import {
  getPerformanceSummary,
  getWeeklyActivity,
  getTopicStats,
  submitQuizSession,
  type WeeklyActivity,
  type TopicStat
} from '../Services/PerfromanceService';

interface PerformanceState {
  // Data
  weeklyActivity: WeeklyActivity[];
  topicStats: TopicStat[];
  mockScores: number[];
  totalQuestions: number;
  avgAccuracy: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPerformanceData: () => Promise<void>;
  loadWeeklyActivity: () => Promise<void>;
  loadTopicStats: () => Promise<void>;
  addMockScore: (score: number) => void;
  addActivity: (day: string, count: number) => void;  // ← ADD THIS
  updateTopic: (id: string, accuracy: number) => void;  // ← ADD THIS
  addQuizResult: (
    mode: "practice" | "mock",
    subject: string,
    questionIds: string[],
    answers: Record<number, number>,
    timeTaken: number,
    correctCount?: number,
    totalQuestions?: number,
  ) => Promise<{
    correct: number;
    total: number;
    accuracy: number;
    streak: number;
  }>;
  reset: () => void;
}

export const usePerformanceStore = create<PerformanceState>()((set, get) => ({
  weeklyActivity: [
    { day: 'Sun', questions: 0 },
    { day: 'Mon', questions: 0 },
    { day: 'Tue', questions: 0 },
    { day: 'Wed', questions: 0 },
    { day: 'Thu', questions: 0 },
    { day: 'Fri', questions: 0 },
    { day: 'Sat', questions: 0 },
  ],
  topicStats: [],
  mockScores: [],
  totalQuestions: 0,
  avgAccuracy: 0,
  isLoading: false,
  error: null,

  // src/Store/usePerformanceStore.ts

  // Update the loadPerformanceData function
  loadPerformanceData: async () => {
    set({ isLoading: true, error: null });
    try {
      const summary = await getPerformanceSummary();
      const weekly = await getWeeklyActivity();
      const topics = await getTopicStats();  // This will now only return selected subjects

      // Extract mock scores from summary
      const mockScores = summary.mockScores.map(m => m.score);

      console.log("🔵 Loaded topics (only selected subjects):", topics);

      set({
        totalQuestions: summary.totalQuestions,
        avgAccuracy: Math.min(summary.avgAccuracy, 100), // Cap at 100%
        weeklyActivity: weekly,
        topicStats: topics,
        mockScores: mockScores,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load performance data:', error);
      set({ error: 'Failed to load performance data', isLoading: false });
    }
  },

  loadWeeklyActivity: async () => {
    try {
      const weekly = await getWeeklyActivity();
      set({ weeklyActivity: weekly });
    } catch (error) {
      console.error('Failed to load weekly activity:', error);
    }
  },

  loadTopicStats: async () => {
    try {
      const topics = await getTopicStats();
      set({ topicStats: topics });
    } catch (error) {
      console.error('Failed to load topic stats:', error);
    }
  },

  addMockScore: (score: number) => {
    set((state) => ({
      mockScores: [...state.mockScores, score]
    }));
  },

  // ← ADD THIS FUNCTION - for updating weekly activity
  addActivity: (day: string, count: number) => {
    set((state) => ({
      weeklyActivity: state.weeklyActivity.map((d) =>
        d.day === day ? { ...d, questions: d.questions + count } : d
      ),
    }));
  },

  // ← ADD THIS FUNCTION - for updating topic accuracy
  updateTopic: (id: string, accuracy: number) => {
    set((state) => ({
      topicStats: state.topicStats.map((t) =>
        t.id === id ? { ...t, accuracy } : t
      ),
    }));
  },

  addQuizResult: async (
    mode: "practice" | "mock",
    subject: string,
    questionIds: string[],
    answers: Record<number, number>,
    timeTaken: number,
    correctCount?: number,
    totalQuestions?: number,
  ) => {
    try {
      const result = await submitQuizSession(
        mode,
        subject,
        questionIds,
        answers,
        timeTaken,
        correctCount,
        totalQuestions,
      );

      // Refresh data after adding quiz result
      await get().loadPerformanceData();

      return result;
    } catch (error) {
      console.error("Failed to submit quiz result:", error);
      throw error;
    }
  },

  reset: () => {
    set({
      weeklyActivity: [
        { day: 'Sun', questions: 0 },
        { day: 'Mon', questions: 0 },
        { day: 'Tue', questions: 0 },
        { day: 'Wed', questions: 0 },
        { day: 'Thu', questions: 0 },
        { day: 'Fri', questions: 0 },
        { day: 'Sat', questions: 0 },
      ],
      topicStats: [],
      mockScores: [],
      totalQuestions: 0,
      avgAccuracy: 0,
      isLoading: false,
      error: null,
    });
  },
}));