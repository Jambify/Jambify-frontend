// Store/UseUserStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useSubjectStore } from './useSubjectStore';

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
    CURRENCY: '₦',
    DISPLAY_PRICE: '3,000',
    PRO_LIFETIME_YEARLY: 20000,
    DISPLAY_PRICE_YEARLY: '20,000',
  }
};

interface UserState {
  // User data (matches your profiles table)
  id: string | null;
  name: string;
  email: string;
  university: string;
  subjectCombo: string;
  targetScore: string;  // Stored as TEXT in your DB
  examYear: string;
  examDate: string;
  streak: number;
  overallScore: number;
  weeklyScoreChange: number;
  accuracy: number;
  previousAccuracy: number;
  questionsCompleted: number;
  totalQuestions: number;
  schoolRank: number;
  daysToExam: number;
  onboardingComplete: boolean;
  isPro: boolean;
  downloadedData: DownloadedData;
  
  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  
  // Actions
  completeOnboarding: (data: OnboardingData) => Promise<{ error: Error | null }>;
  updateProfile: (data: ProfileUpdate) => Promise<{ error: Error | null }>;
  updateExamSettings: (data: ExamUpdate) => Promise<{ error: Error | null }>;
  resetAccount: () => Promise<{ error: Error | null }>;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  incrementScore: (pts: number) => void;
  incrementQuestions: (n: number) => void;
  updateAccuracy: (acc: number) => void;
  upgradeToPro: () => void;
  downgradeToPro: () => void;
  setDownloadedData: (data: DownloadedData) => void;
  addDownloadedData: (key: string, data: any) => void;
  
  // Auth actions
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  syncProfile: () => Promise<void>;
  clearAuthError: () => void;
}

const DEFAULTS = {
  id: null,
  name: '',
  email: '',
  university: '',
  subjectCombo: '',
  targetScore: '',
  examYear: '2025',
  examDate: 'Jun 14',
  streak: 14,
  overallScore: 267,
  weeklyScoreChange: 12,
  accuracy: 74,
  previousAccuracy: 68,
  questionsCompleted: 1842,
  totalQuestions: 3200,
  schoolRank: 38,
  daysToExam: 47,
  onboardingComplete: false,
  isPro: false,
  downloadedData: {},
  isAuthenticated: false,
  isLoading: false,
  authError: null,
};

// Helper to map subject combo ID to the stored string format
const getSubjectComboString = (comboId: string): string => {
  const combos: Record<string, string> = {
    medicine: "English, Biology, Chemistry, Physics",
    engineering: "English, Mathematics, Physics, Chemistry",
    "social-sci": "English, Mathematics, Economics, Government",
    law: "English, Literature, Government, CRS/IRS",
  };
  return combos[comboId] || comboId;
};

// Helper to parse combo string back to ID
const getSubjectComboId = (comboString: string): string => {
  const combos: Record<string, string> = {
    "English, Biology, Chemistry, Physics": "medicine",
    "English, Mathematics, Physics, Chemistry": "engineering",
    "English, Mathematics, Economics, Government": "social-sci",
    "English, Literature, Government, CRS/IRS": "law",
  };
  return combos[comboString] || comboString;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      // Auth Actions
      signUp: async (email: string, password: string, name: string) => {
        set({ isLoading: true, authError: null });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: name }
            }
          });

          if (error) throw error;
          
          if (data.user) {
            set({ 
              email, 
              name,
              id: data.user.id,
              isAuthenticated: true 
            });
            
            // Wait for your trigger to create the profile
            setTimeout(() => get().syncProfile(), 1000);
          }
          
          return { error: null };
        } catch (error) {
          console.error('Signup error:', error);
          set({ authError: (error as Error).message });
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, authError: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;
          
          if (data.user) {
            set({ 
              email,
              id: data.user.id,
              isAuthenticated: true 
            });
            await get().syncProfile();
          }
          
          return { error: null };
        } catch (error) {
          console.error('Signin error:', error);
          set({ authError: (error as Error).message });
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ ...DEFAULTS, isAuthenticated: false, id: null });
          localStorage.removeItem('jambready-user');
        } catch (error) {
          console.error('Signout error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      syncProfile: async () => {
        const { id } = get();
        if (!id) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            // Map your database fields to store (using 'name' not 'full_name')
            set({
              name: data.name || get().name,
              university: data.university || '',
              targetScore: data.target_score || '',
              examYear: data.exam_year || '2025',
              examDate: data.exam_date || 'Jun 14',
              subjectCombo: data.subject_combo ? getSubjectComboId(data.subject_combo) : '',
              onboardingComplete: data.onboarding_complete || false,
              email: data.email || get().email,
            });
          }
        } catch (error) {
          console.error('Sync profile error:', error);
        }
      },

      clearAuthError: () => set({ authError: null }),

      // Complete Onboarding - Using your stored procedure
      completeOnboarding: async (data: OnboardingData) => {
        const { id } = get();
        
        if (!id) {
          console.error('No user ID found');
          return { error: new Error('Not authenticated') };
        }

        set({ isLoading: true });
        
        try {
          // Call your complete_onboarding function
          const { error } = await supabase.rpc('complete_onboarding', {
            p_user_id: id,
            p_name: data.name,
            p_university: data.university,
            p_subject_combo: getSubjectComboString(data.subjectCombo),
            p_target_score: data.targetScore,
            p_exam_year: data.examYear,
            p_exam_date: data.examDate || 'Jun 14',
          });

          if (error) throw error;
          
          // Initialize subject progress for the new user
          console.log('🔵 Initializing subjects for new user...');
          await useSubjectStore.getState().initialize();
          console.log('🔵 Subjects initialized successfully');
          
          // Update local store
          set({ 
            name: data.name,
            university: data.university,
            subjectCombo: data.subjectCombo,
            targetScore: data.targetScore,
            examYear: data.examYear,
            examDate: data.examDate || 'Jun 14',
            onboardingComplete: true 
          });
          
          await get().syncProfile();
          return { error: null };
        } catch (error) {
          console.error('Complete onboarding error:', error);
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      // Regular profile update (without completing onboarding)
      updateProfile: async (data: ProfileUpdate) => {
        const { id } = get();
        
        if (!id) {
          set(data);
          return { error: null };
        }

        set({ isLoading: true });
        
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              name: data.name,
              university: data.university,
              subject_combo: getSubjectComboString(data.subjectCombo),
            })
            .eq('id', id);

          if (error) throw error;
          
          set(data);
          await get().syncProfile();
          return { error: null };
        } catch (error) {
          console.error('Update profile error:', error);
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      updateExamSettings: async (data: ExamUpdate) => {
        const { id } = get();
        
        if (!id) {
          set(data);
          return { error: null };
        }

        set({ isLoading: true });
        
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              target_score: data.targetScore,
              exam_year: data.examYear,
              exam_date: data.examDate,
            })
            .eq('id', id);

          if (error) throw error;
          
          set(data);
          await get().syncProfile();
          return { error: null };
        } catch (error) {
          console.error('Update exam settings error:', error);
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      resetAccount: async () => {
        const { signOut } = get();
        await signOut();
        return { error: null };
      },

      // Simple setters
      setName: (name: string) => set({ name }),
      setEmail: (email: string) => set({ email }),
      incrementScore: (pts: number) => set((s) => ({ overallScore: s.overallScore + pts })),
      incrementQuestions: (n: number) => set((s) => ({ questionsCompleted: s.questionsCompleted + n })),
      updateAccuracy: (acc: number) => set((s) => ({ previousAccuracy: s.accuracy, accuracy: acc })),
      upgradeToPro: () => set({ isPro: true }),
      downgradeToPro: () => set({ isPro: false }),
      setDownloadedData: (data: DownloadedData) => set({ downloadedData: data }),
      addDownloadedData: (key: string, data: any) => set((s) => ({ 
        downloadedData: { ...s.downloadedData, [key]: data } 
      })),
    }),
    {
      name: 'jambready-user',
      partialize: (s) => ({
        name: s.name,
        email: s.email,
        university: s.university,
        subjectCombo: s.subjectCombo,
        targetScore: s.targetScore,
        examYear: s.examYear,
        examDate: s.examDate,
        onboardingComplete: s.onboardingComplete,
        isPro: s.isPro,
        downloadedData: s.downloadedData,
        streak: s.streak,
        overallScore: s.overallScore,
        weeklyScoreChange: s.weeklyScoreChange,
        accuracy: s.accuracy,
        previousAccuracy: s.previousAccuracy,
        questionsCompleted: s.questionsCompleted,
        totalQuestions: s.totalQuestions,
        schoolRank: s.schoolRank,
        daysToExam: s.daysToExam,
      }),
    },
  ),
);