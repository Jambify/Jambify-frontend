import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingData {
  name:         string;
  university:   string;
  subjectCombo: string;
  targetScore:  string;
  examYear:     string;
}

interface UserState {
  // Profile
  name:               string;
  university:         string;
  subjectCombo:       string;
  targetScore:        string;
  examYear:           string;
  // Stats
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
  // Onboarding flag — persisted so it survives refresh
  onboardingComplete: boolean;
  // Actions
  completeOnboarding: (data: OnboardingData) => void;
  setName:            (name: string) => void;
  incrementScore:     (pts: number) => void;
  incrementQuestions: (count: number) => void;
  updateAccuracy:     (acc: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Profile — empty until onboarding completes
      name:               '',
      university:         '',
      subjectCombo:       '',
      targetScore:        '',
      examYear:           '2025',
      // Stats
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

      completeOnboarding: (data) =>
        set({
          ...data,
          onboardingComplete: true,
        }),

      setName:            (name)  => set({ name }),
      incrementScore:     (pts)   => set((s) => ({ overallScore:       s.overallScore + pts })),
      incrementQuestions: (count) => set((s) => ({ questionsCompleted: s.questionsCompleted + count })),
      updateAccuracy:     (acc)   => set((s) => ({ previousAccuracy: s.accuracy, accuracy: acc })),
    }),
    {
      name:    'jambready-user',   // localStorage key
      partialize: (s) => ({          // only persist what matters
        name:               s.name,
        university:         s.university,
        subjectCombo:       s.subjectCombo,
        targetScore:        s.targetScore,
        examYear:           s.examYear,
        onboardingComplete: s.onboardingComplete,
      }),
    },
  ),
);