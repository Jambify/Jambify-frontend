// src/Store/useUserStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import { useSubjectStore } from "./useSubjectStore";

// ── Interfaces ────────────────────────────────────────────────────────────────
interface OnboardingData {
  name: string;
  university: string;
  subjectCombo: string;
  targetScore: string;
  examYear: string;
  examDate?: string;
}

interface ProfileUpdate {
  name: string;
  university: string;
  subjectCombo: string;
}
interface ExamUpdate {
  targetScore: string;
  examYear: string;
  examDate: string;
}
interface DownloadedData {
  [key: string]: any;
}

export const APP_CONFIG = {
  PRICING: {
    PRO_LIFETIME: 3000,
    CURRENCY: "₦",
    DISPLAY_PRICE: "3,000",
    PRO_LIFETIME_YEARLY: 20000,
    DISPLAY_PRICE_YEARLY: "20,000",
  },
};

interface UserState {
  // ── Profile ──────────────────────────────────────────
  id: string | null;
  name: string;
  email: string;
  university: string;
  subjectCombo: string;
  targetScore: string;
  examYear: string;
  examDate: string;
  streak: number;
  bestScore: number;
  overallScore: number; // Added for compatibility
  weeklyScoreChange: number;
  accuracy: number;
  previousAccuracy: number;
  questionsCompleted: number;
  totalQuestions: number;
  schoolRank: number;
  topicStats: any[]; // Added for compatibility
  // daysToExam is NOT stored — computed live by useExamCountdown hook
  onboardingComplete: boolean;
  isPro: boolean;
  hasSeenWelcome: boolean;
  downloadedData: DownloadedData;
  _lastSync: number | null;

  // ── Auth ─────────────────────────────────────────────
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;

  // ── Actions ──────────────────────────────────────────
  completeOnboarding: (
    data: OnboardingData,
  ) => Promise<{ error: Error | null }>;
  updateProfile: (data: ProfileUpdate) => Promise<{ error: Error | null }>;
  updateExamSettings: (data: ExamUpdate) => Promise<{ error: Error | null }>;
  resetAccount: () => Promise<{ error: Error | null }>;
  reset: () => void;
  markWelcomeAsSeen: () => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  updateBestScore: (score: number) => Promise<void>;
  incrementQuestions: (n: number) => void;
  updateAccuracy: (acc: number) => void;
  upgradeToPro: () => void;
  downgradeToPro: () => void;
  setDownloadedData: (data: DownloadedData) => void;
  addDownloadedData: (key: string, data: any) => void;

  // ── Auth actions ─────────────────────────────────────
  signOut: () => Promise<void>;
  clearAuthError: () => void;
  syncProfile: (force?: boolean) => Promise<{ onboardingComplete: boolean }>;

  // Legacy — kept for compatibility but not used for OTP flow
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
}

// ── Defaults ──────────────────────────────────────────────────────────────────
// These are the values applied after signOut or on first load.
// Intentionally lean — stats like streak/score are loaded from DB via syncProfile.
const DEFAULTS = {
  id: null,
  name: "",
  email: "",
  university: "",
  subjectCombo: "",
  targetScore: "",
  examYear: "2027",
  examDate: "Apr 27",
  streak: 0,
  bestScore: 0,
  overallScore: 0,
  weeklyScoreChange: 0,
  accuracy: 0,
  previousAccuracy: 0,
  questionsCompleted: 0,
  totalQuestions: 0,
  schoolRank: 0,
  topicStats: [],
  // daysToExam removed — computed live by useExamCountdown
  onboardingComplete: false,
  isPro: false,
  hasSeenWelcome: false,
  downloadedData: {},
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  _lastSync: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getSubjectComboString = (id: string): string =>
  (
    ({
      medicine: "English, Biology, Chemistry, Physics",
      engineering: "English, Mathematics, Physics, Chemistry",
      "social-sci": "English, Mathematics, Economics, Government",
      law: "English, Literature, Government, CRS/IRS",
    }) as Record<string, string>
  )[id] ?? id;

const getSubjectComboId = (str: string): string =>
  (
    ({
      "English, Biology, Chemistry, Physics": "medicine",
      "English, Mathematics, Physics, Chemistry": "engineering",
      "English, Mathematics, Economics, Government": "social-sci",
      "English, Literature, Government, CRS/IRS": "law",
    }) as Record<string, string>
  )[str] ?? str;

// ── Store ─────────────────────────────────────────────────────────────────────
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      // ── syncProfile ────────────────────────────────────
      // Returns { onboardingComplete } so callers can navigate
      // based on the FRESH value without reading stale Zustand state.
      syncProfile: async (force = false) => {
        const { id, _lastSync } = get();
        if (!id) return { onboardingComplete: false };

        const now = Date.now();
        if (!force && _lastSync && now - _lastSync < 5_000) {
          return { onboardingComplete: get().onboardingComplete };
        }

        set({ isLoading: true, _lastSync: now });
        try {
          const { data, error } = (await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .maybeSingle()) as { data: any; error: any };

          if (error) throw error;
          if (!data) return { onboardingComplete: false };

          const onboardingComplete = data.onboarding_complete === true;

          set({
            name: data.name || get().name,
            university: data.university || "",
            targetScore: data.target_score || "",
            examYear: data.exam_year || "2027",
            examDate: data.exam_date || "Apr 27",
            subjectCombo: data.subject_combo
              ? getSubjectComboId(data.subject_combo)
              : "",
            email: data.email || get().email,
            isPro: data.is_pro ?? false,
            bestScore: data.overall_score || 0,
            overallScore: data.overall_score || 0,
            accuracy: data.accuracy || 0,
            streak: data.streak || 0,
            questionsCompleted: data.questions_completed || 0,
            totalQuestions: data.total_questions || 0,
            topicStats: data.topic_performance || [],
            onboardingComplete,
            isLoading: false,
          });

          return { onboardingComplete };
        } catch (err) {
          console.error("[syncProfile]", err);
          return { onboardingComplete: get().onboardingComplete };
        } finally {
          set({ isLoading: false });
        }
      },

      // ── signUp (legacy password flow — kept for compat) ─
      signUp: async (email, _password, name) => {
        // This path is no longer used in the OTP flow.
        // Preserved so existing call-sites don't break.
        set({ isLoading: true, authError: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password: _password,
            options: { data: { full_name: name } },
          });
          if (error) throw error;
          if (data.user) {
            set({ email, name, id: data.user.id, isAuthenticated: true });
            setTimeout(() => get().syncProfile(), 1_000);
          }
          return { error: null };
        } catch (err) {
          set({ authError: (err as Error).message });
          // FIX: preserve the name the user typed even on failure
          // so Onboarding.tsx can display it correctly
          set((s) => ({ name: s.name || "" }));
          return { error: err as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      // ── signIn (legacy password flow) ─────────────────
      signIn: async (email, password) => {
        set({ isLoading: true, authError: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            set({ email, id: data.user.id, isAuthenticated: true });
            await get().syncProfile();
          }
          return { error: null };
        } catch (err) {
          set({ authError: (err as Error).message });
          return { error: err as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      // ── signOut ────────────────────────────────────────
      // Clears everything including the persisted localStorage key.
      signOut: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
          set({ ...DEFAULTS });
          localStorage.removeItem("jambready-user");
        } catch (err) {
          console.error("[signOut]", err);
        } finally {
          set({ isLoading: false });
        }
      },

      clearAuthError: () => set({ authError: null }),

      // ── completeOnboarding ────────────────────────────
      completeOnboarding: async (data) => {
        const { id } = get();
        if (!id) return { error: new Error("Not authenticated") };

        set({ isLoading: true });
        try {
          const { error } = await supabase.rpc("complete_onboarding", {
            p_user_id: id,
            p_name: data.name,
            p_university: data.university,
            p_subject_combo: getSubjectComboString(data.subjectCombo),
            p_target_score: data.targetScore,
            p_exam_year: data.examYear,
            p_exam_date: data.examDate ?? "Apr 27",
          });
          if (error) throw error;

          await useSubjectStore.getState().initialize();

          // Set optimistically — DB already has the truth
          set({
            name: data.name,
            university: data.university,
            subjectCombo: data.subjectCombo,
            targetScore: data.targetScore,
            examYear: data.examYear,
            examDate: data.examDate ?? "Apr 27",
            onboardingComplete: true,
            hasSeenWelcome: false,
          });

          // Force-sync to confirm DB state matches
          await get().syncProfile(true);
          return { error: null };
        } catch (err) {
          console.error("[completeOnboarding]", err);
          return { error: err as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      // ── markWelcomeAsSeen ─────────────────────────────
      markWelcomeAsSeen: () =>
        set({ onboardingComplete: true, hasSeenWelcome: true }),

      // ── Profile updates ───────────────────────────────
      updateProfile: async (data) => {
        const { id } = get();
        if (!id) {
          set(data);
          return { error: null };
        }
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from("profiles")
            .update({
              name: data.name,
              university: data.university,
              subject_combo: getSubjectComboString(data.subjectCombo),
            })
            .eq("id", id);
          if (error) throw error;
          set(data);
          await get().syncProfile();
          return { error: null };
        } catch (err) {
          return { error: err as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateExamSettings: async (data) => {
        const { id } = get();
        if (!id) {
          set(data);
          return { error: null };
        }
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from("profiles")
            .update({
              target_score: data.targetScore,
              exam_year: data.examYear,
              exam_date: data.examDate,
            })
            .eq("id", id);
          if (error) throw error;
          set(data);
          await get().syncProfile();
          return { error: null };
        } catch (err) {
          return { error: err as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      resetAccount: async () => {
        await get().signOut();
        return { error: null };
      },

      reset: () => {
        set({ ...DEFAULTS });
        localStorage.removeItem("jambready-user");
      },

      // ── Simple setters ────────────────────────────────
      setName: (n) => set({ name: n }),
      setEmail: (e) => set({ email: e }),
      updateBestScore: async (score) => {
        const { bestScore, id } = get();
        if (score > bestScore) {
          set({ bestScore: score }); // Optimistic update
          if (id) {
            // Use RPC to bypass RLS restrictions
            const { error } = await supabase.rpc("update_best_score", {
              p_user_id: id,
              p_new_score: score,
            });

            if (error) {
              console.error(
                "❌ Failed to update overall_score via RPC:",
                error,
              );
            } else {
              console.log("✅ overall_score updated via RPC to:", score);
            }
          }
        }
      },
      incrementQuestions: (n) =>
        set((s) => ({ questionsCompleted: s.questionsCompleted + n })),
      updateAccuracy: (acc) =>
        set((s) => ({ previousAccuracy: s.accuracy, accuracy: acc })),
      upgradeToPro: () => set({ isPro: true }),
      downgradeToPro: () => set({ isPro: false }),
      setDownloadedData: (data) => set({ downloadedData: data }),
      addDownloadedData: (k, v) =>
        set((s) => ({
          downloadedData: { ...s.downloadedData, [k]: v },
        })),
    }),

    {
      name: "jambready-user",
      partialize: (s) => ({
        // Persist auth identity and profile so page refresh works
        id: s.id,
        name: s.name,
        email: s.email,
        university: s.university,
        subjectCombo: s.subjectCombo,
        targetScore: s.targetScore,
        examYear: s.examYear,
        examDate: s.examDate,
        onboardingComplete: s.onboardingComplete,
        isPro: s.isPro,
        hasSeenWelcome: s.hasSeenWelcome,
        downloadedData: s.downloadedData,
        streak: s.streak,
        bestScore: s.bestScore,
        weeklyScoreChange: s.weeklyScoreChange,
        accuracy: s.accuracy,
        previousAccuracy: s.previousAccuracy,
        questionsCompleted: s.questionsCompleted,
        totalQuestions: s.totalQuestions,
        schoolRank: s.schoolRank,
        // daysToExam intentionally excluded — computed live by useExamCountdown
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
