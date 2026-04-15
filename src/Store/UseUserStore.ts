import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingData {
  name:         string;
  university:   string;
  subjectCombo: string;
  targetScore:  string;
  examYear:     string;
}

interface ProfileUpdate {
  name:         string;
  university:   string;
  subjectCombo: string;
}

interface ExamUpdate {
  targetScore: string;
  examYear:    string;
  examDate:    string;
}

interface UserState {
  name:               string;
  university:         string;
  subjectCombo:       string;
  targetScore:        string;
  examYear:           string;
  streak:             number;
  overallScore:       number;
  weeklyScoreChange:  number;
  accuracy:           number;
  previousAccuracy:   number;
  questionsCompleted: number;
  totalQuestions:     number;
  schoolRank:         number;
  examDate:           string;
  daysToExam:         number;
  onboardingComplete: boolean;
  // Actions
  completeOnboarding:  (data: OnboardingData) => void;
  updateProfile:       (data: ProfileUpdate)  => void;
  updateExamSettings:  (data: ExamUpdate)     => void;
  resetAccount:        () => void;
  setName:             (name: string) => void;
  incrementScore:      (pts: number)  => void;
  incrementQuestions:  (n: number)    => void;
  updateAccuracy:      (acc: number)  => void;
   isPro:       boolean;              // Pro plan status
  upgradeToPro:() => void;           // Simulate upgrade (Phase 1 demo)
  downgradeToPro:() => void;         // For testing — revert to free
}

const DEFAULTS = {
  name:               '',
  university:         '',
  subjectCombo:       '',
  targetScore:        '',
  examYear:           '2025',
  streak:             14,
  overallScore:       267,
  weeklyScoreChange:  12,
  accuracy:           74,
  previousAccuracy:   68,
  questionsCompleted: 1842,
  totalQuestions:     3200,
  schoolRank:         38,
  examDate:           'Jun 14',
  daysToExam:         47,
  onboardingComplete: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      completeOnboarding: (data) =>
        set({ ...data, onboardingComplete: true }),

      // ✅ Called by ProfileForm — updates name, university, subjectCombo
      updateProfile: (data) =>
        set({ ...data }),

      // ✅ Called by ExamSettings — updates targetScore, examYear, examDate
      updateExamSettings: (data) =>
        set({ ...data }),

      // ✅ Called by DangerZone — wipes everything back to defaults
      resetAccount: () =>
        set({ ...DEFAULTS }),

      setName:            (name)  => set({ name }),
      incrementScore:     (pts)   => set((s) => ({ overallScore:       s.overallScore + pts })),
      incrementQuestions: (n)     => set((s) => ({ questionsCompleted: s.questionsCompleted + n })),
      updateAccuracy:     (acc)   => set((s) => ({ previousAccuracy: s.accuracy, accuracy: acc })),
      isPro: false, // Default to free plan
      upgradeToPro: () => set({ isPro: true }),
      downgradeToPro: () => set({ isPro: false }),
      
    }),
    {
      name: 'jambready-user',
      partialize: (s) => ({
        name:               s.name,
        university:         s.university,
        subjectCombo:       s.subjectCombo,
        targetScore:        s.targetScore,
        examYear:           s.examYear,
        examDate:           s.examDate,
        onboardingComplete: s.onboardingComplete,
         isPro: s.isPro,
      }),
    },
  ),
);