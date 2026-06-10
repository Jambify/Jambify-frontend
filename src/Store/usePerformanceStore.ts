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

  loadPerformanceData: async () => {
    set({ isLoading: true });
    try {
      const { id: userId } = useUserStore.getState();
      if (!userId) return;

      // Fetch all mock and practice sessions
      const { data: sessions, error } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        set({
          topicStats: [],
          subjectPerformance: [],
          mockHistory: [],
          weeklyActivity: [
            { day: "Sun", questions: 0 },
            { day: "Mon", questions: 0 },
            { day: "Tue", questions: 0 },
            { day: "Wed", questions: 0 },
            { day: "Thu", questions: 0 },
            { day: "Fri", questions: 0 },
            { day: "Sat", questions: 0 },
          ],
          totalQuestions: 0,
          avgAccuracy: 0,
          isLoading: false,
        });
        return;
      }

      // 1. Process Mock History & Latest Score
      const mockSessions = sessions.filter((s) => s.mode === "mock");
      const mockHistory = mockSessions.map((s) => ({
        id: s.id,
        date: s.completed_at,
        score: s.accuracy, // This is accuracy, but we'll show JAMB score separately
        jambScore: Math.round((s.correct / 180) * 400),
      }));

      // 2. Get detailed topic stats from topic_progress table
      const topicStats = await getDetailedTopicStats();

      // 2b. Get subject performance (best/worst scores)
      const subjectPerformance = await getSubjectPerformance();

      // 3. Weekly Activity (last 7 days)
      const weeklyActivity = Array(7).fill(0);
      const now = new Date();
      sessions.forEach((s) => {
        const date = new Date(s.completed_at);
        const diffDays = Math.floor(
          (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays < 7) {
          const dayIndex = 6 - diffDays; // 0=Sun...6=Sat relative to now
          weeklyActivity[dayIndex] += s.total_questions;
        }
      });

      const totalQs = sessions.reduce((sum, s) => sum + s.total_questions, 0);
      const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);

      set({
        mockHistory,
        topicStats,
        subjectPerformance,
        totalQuestions: totalQs,
        avgAccuracy:
          totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading performance data:", error);
      set({ isLoading: false });
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
      await get().loadPerformanceData();

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
      mockScores: [],
      mockHistory: [],
      totalQuestions: 0,
      avgAccuracy: 0,
      isLoading: false,
      error: null,
    });
  },
}));
