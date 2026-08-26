
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

export interface MockHistoryEntry {
  id: string;
  date: string;
  score: number;
  jambScore: number;
}

type TopicPerformance = Record<string, { subject: string; correct: number; total: number }>;

// Helper to get week number and year (same as in PerformanceService)
const getWeekAndYear = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Make week start on Monday (1-7)
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNum}`;
};
interface PerformanceState {
  // Data
  weeklyActivity: WeeklyActivity[];
  topicStats: TopicStat[];
  subjectPerformance: SubjectPerformance[];
  mockScores: number[];
  mockHistory: MockHistoryEntry[];
  totalQuestions: number;
  avgAccuracy: number;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  hasFetched: boolean;


  // Actions
  loadPerformanceData: (force?: boolean) => Promise<void>;
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
    topicPerformance?: TopicPerformance,
  ) => Promise<{
    correct: number;
    total: number;
    accuracy: number;
    streak: number;
    shouldShowPopup: boolean;
    subject: string;
  }>;
  reset: () => void;
}

export const usePerformanceStore = create<PerformanceState>()(
  (set, get) => ({
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
    isLoading: true,
    error: null,
    isInitialized: false,
    hasFetched: false,

    loadPerformanceData: async (force = false) => {
      if (get().isInitialized && !force) {
        return;
      }
      const state = get();
      const shouldPreserveCachedData =
        force &&
        state.hasFetched &&
        (state.totalQuestions > 0 ||
          state.topicStats.length > 0 ||
          state.mockHistory.length > 0);

      if (shouldPreserveCachedData) {
        set({
          isLoading: true,
          error: null,
        });
      } else {
        set({
          isLoading: true,
          error: null,
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
        });
      }

      // Timeout after 15 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const { id: userId } = useUserStore.getState();
        if (!userId) {
          clearTimeout(timeoutId);
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

        console.log("📊 [loadPerformanceData] Fetched sessions:", sessions);
        console.log("📊 [loadPerformanceData] Each session:");
        sessions?.forEach((s, i) => {
          console.log(`  Session ${i}: subject=${s.subject}, correct=${s.correct}, total=${s.total_questions}, mode=${s.mode}`);
        });
        const totalQs = sessions?.reduce((sum, s) => sum + (s.total_questions || 0), 0) || 0;
        const totalCorrect = sessions?.reduce((sum, s) => sum + (s.correct || 0), 0) || 0;
        console.log("📊 [loadPerformanceData] totalQuestions:", totalQs);
        console.log("📊 [loadPerformanceData] totalCorrect:", totalCorrect);

        // Get detailed topic stats from topic_progress table
        const topicStats = await getDetailedTopicStats();

        // Get subject performance
        const subjectPerformance = await getSubjectPerformance();

        // ✅ Calculate from raw session data for display accuracy
        // This is the ground truth regardless of what the profile column says
        const avgAcc = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;

        // Sync the ground truth to the profiles table to keep it up to date
        try {
          const { id: userId } = useUserStore.getState();
          if (userId) {
            console.log("🔄 Updating profiles table:", {
              userId,
              avgAcc,
              totalCorrect,
              totalQs,
            });

            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                accuracy: avgAcc,
                questions_completed: totalCorrect,
                total_questions: totalQs,
              })
              .eq("id", userId);

            if (updateError) {
              console.error("❌ Failed to update profiles table:", updateError);
            } else {
              console.log("✅ profiles table updated successfully");
            }

            // Also update useUserStore locally to match
            console.log("🔄 Updating useUserStore locally:", {
              accuracy: avgAcc,
              questionsCompleted: totalCorrect,
              totalQuestions: totalQs,
            });
            useUserStore.setState({
              accuracy: avgAcc,
              questionsCompleted: totalCorrect,
              totalQuestions: totalQs,
            });
          }
        } catch (err) {
          console.error("❌ Failed to update profiles table with performance data:", err);
        }

        // Calculate weekly activity (only current week)
        const today = new Date();
        const currentWeek = getWeekAndYear(today);
        const weeklyActivity = Array(7).fill(0).map((_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - (6 - i));
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

          // Only include sessions from current week
          const questionsForDay = sessions?.filter(s => {
            const sessionDate = new Date(s.completed_at);
            const sessionWeek = getWeekAndYear(sessionDate);
            return sessionWeek === currentWeek &&
              sessionDate.toDateString() === date.toDateString();
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

        clearTimeout(timeoutId);
        set({
          weeklyActivity,
          topicStats,
          subjectPerformance,
          totalQuestions: totalQs,
          avgAccuracy: avgAcc,
          mockHistory,
          isLoading: false,
          isInitialized: true,
          hasFetched: true,
        });
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("Error loading performance data:", error);

        // Handle timeout specifically
        if ((error as Error).name === 'AbortError') {
          set({
            isLoading: false,
            error: "Request timed out. Please check your internet connection and try again."
          });
        } else {
          set({
            isLoading: false,
            error: "We couldn't load your performance data right now. Please check your internet connection and try again."
          });
        }
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
      topicPerformance?: TopicPerformance,
    ) => {
      console.log("📝 [addQuizResult] called with:", {
        mode,
        subject,
        correctCount,
        totalQuestions,
        questionIdsLength: questionIds.length,
      });

      // 🚀 OPTIMISTIC UPDATE FIRST!
      if (correctCount && totalQuestions) {
        const state = get();
        const newTotalQs = state.totalQuestions + totalQuestions;
        const newTotalCorrect = (state.totalQuestions > 0 ? Math.round((state.avgAccuracy / 100) * state.totalQuestions) : 0) + correctCount;
        const newAvgAcc = newTotalQs > 0 ? Math.round((newTotalCorrect / newTotalQs) * 100) : 0;

        // Optimistic update to performance store
        set({
          totalQuestions: newTotalQs,
          avgAccuracy: newAvgAcc,
        });

        // Optimistic update to user store
        useUserStore.setState({
          accuracy: newAvgAcc,
          questionsCompleted: newTotalCorrect,
          totalQuestions: newTotalQs,
        });

        // Update weekly activity optimistically
        const today = new Date();
        const dayName = today.toLocaleDateString("en-US", { weekday: "short" });
        set((prev) => ({
          weeklyActivity: prev.weeklyActivity.map((d) =>
            d.day === dayName ? { ...d, questions: d.questions + totalQuestions } : d,
          ),
        }));
      }

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
        console.log("📝 [addQuizResult] submitQuizSession returned:", result);

        // Now refresh data from DB for full accuracy
        await get().loadPerformanceData(true);

        // Update subject-level tracking
        await updateSubjectPerformance(subject, result.accuracy);

        // If we should show the streak popup, set it in useUserStore
        if (result.shouldShowPopup) {
          useUserStore.getState().setShowStreakPopup(true, result.streak);
        }

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
        isLoading: true,
        error: null,
        isInitialized: false,
        hasFetched: false,
      });
    }
  })
);
