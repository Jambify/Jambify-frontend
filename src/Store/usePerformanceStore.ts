
// src/Store/usePerformanceStore.ts

import { create } from "zustand";
import {
  submitQuizSession,
  getDetailedTopicStats,
  getSubjectPerformance,
  type WeeklyActivity,
  type TopicStat,
  type SubjectPerformance,
  updateSubjectPerformance,
} from "../Services/PerformanceService";
import { useUserStore } from "./useUserStore";
import { supabase } from "../lib/supabase";
interface PerformanceState {
  // Data
  weeklyActivity: WeeklyActivity[];
  topicStats: TopicStat[];
  subjectPerformance: SubjectPerformance[];
  mockScores: number[];
  mockHistory: any[]; // Added
  totalQuestions: number;
  avgAccuracy: number;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  loadPerformanceData: () => Promise<void>;
  addMockScore: (score: number) => void;
  addActivity: (day: string, count: number) => void;
  updateTopic: (id: string, accuracy: number) => void;
  addQuizResult: (
    mode: "practice" | "mock",
    subject: string,
    questionIds: string[],
    answers: Record<number, number>,
    timeTaken: number,
    correctCount?: number,
    totalQuestions?: number,
    topicPerformance?: Record<string, any>, // Added
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
    { day: "Sun", questions: 0 },
    { day: "Mon", questions: 0 },
    { day: "Tue", questions: 0 },
    { day: "Wed", questions: 0 },
    { day: "Thu", questions: 0 },
    { day: "Fri", questions: 0 },
    { day: "Sat", questions: 0 },
  ],
  topicStats: [],
  subjectPerformance: [],
  mockScores: [],
  mockHistory: [],
  totalQuestions: 0,
  avgAccuracy: 0,
  isLoading: false,
  error: null,
  isInitialized: false,

  loadPerformanceData: async (force = false) => {
    if (get().isInitialized && !force) {
      return;
    }
    set({ isLoading: true });
    try {
      const { id: userId } = useUserStore.getState();
      if (!userId) {
        set({ isLoading: false });
        return;
      }

      // Fetch all mock and practice sessions
      const { data: sessions, error } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      // Get detailed topic stats from topic_progress table
      const topicStats = await getDetailedTopicStats();

      // Get subject performance
      const subjectPerformance = await getSubjectPerformance();

      // Calculate total questions and avg accuracy
      const totalQs = sessions?.reduce((sum, s) => sum + s.total_questions, 0) || 0;
      const totalCorrect = sessions?.reduce((sum, s) => sum + s.correct, 0) || 0;
      const avgAcc = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;

      // Calculate weekly activity
      const today = new Date();
      const weeklyActivity = Array(7).fill(0).map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const questionsForDay = sessions?.filter(s => {
          const sessionDate = new Date(s.completed_at);
          return (
            sessionDate.toDateString() === date.toDateString()
          );
        }).reduce((sum, s) => sum + s.total_questions, 0) || 0;
        return { day: dayName, questions: questionsForDay };
      });

      // Process mock history
      const mockSessions = sessions?.filter((s) => s.mode === "mock") || [];
      const mockHistory = mockSessions.map((s) => ({
        id: s.id,
        date: s.completed_at,
        score: s.accuracy, // This is accuracy, but we'll show JAMB score separately
        jambScore: Math.round((s.correct / 180) * 400),
      }));

      set({
        weeklyActivity,
        topicStats,
        subjectPerformance,
        totalQuestions: totalQs,
        avgAccuracy: avgAcc,
        mockHistory,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Error loading performance data:", error);
      set({ isLoading: false, error: "Failed to load performance data" });
    }
  },

  addMockScore: (score: number) => {
    set((state) => ({
      mockScores: [...state.mockScores, score],
    }));
  },

  // ← ADD THIS FUNCTION - for updating weekly activity
  addActivity: (day: string, count: number) => {
    set((state) => ({
      weeklyActivity: state.weeklyActivity.map((d) =>
        d.day === day ? { ...d, questions: d.questions + count } : d,
      ),
    }));
  },

  // ← ADD THIS FUNCTION - for updating topic accuracy
  updateTopic: (id: string, accuracy: number) => {
    set((state) => ({
      topicStats: state.topicStats.map((t) =>
        t.id === id ? { ...t, accuracy } : t,
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
    topicPerformance?: Record<string, any>,
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
        topicPerformance,
      );

      // Refresh data after adding quiz result
      await get().loadPerformanceData(true);

      // Sync user profile after successful submission
      await useUserStore.getState().syncProfile(true);

      // Update subject-level tracking
      await updateSubjectPerformance(subject, result.accuracy);

      return result;
    } catch (error) {
      console.error("Failed to submit quiz result:", error);
      throw error;
    }
  },

  reset: () => {
    set({
      weeklyActivity: [
        { day: "Sun", questions: 0 },
        { day: "Mon", questions: 0 },
        { day: "Tue", questions: 0 },
        { day: "Wed", questions: 0 },
        { day: "Thu", questions: 0 },
        { day: "Fri", questions: 0 },
        { day: "Sat", questions: 0 },
      ],
      topicStats: [],
      subjectPerformance: [],
      mockScores: [],
      mockHistory: [],
      totalQuestions: 0,
      avgAccuracy: 0,
      isLoading: false,
      error: null,
    });
  },
}));
