// src/store/useUserStore.ts
import { create } from 'zustand';

interface UserState {
  name: string;
  streak: number;
  overallScore: number;
  accuracy: number;
  questionsCompleted: number;
  schoolRank: number;
  setName: (name: string) => void;
  daysToExam: number;
  examDate: string;
  weeklyScoreChange: number;
  previousAccuracy: number;  
  totalQuestions: number;  

}

export const useUserStore = create<UserState>((set) => ({
  name: 'Adeola',
  streak: 14,
  overallScore: 267,
  accuracy: 74,
  questionsCompleted: 1842,
  schoolRank: 38,
  setName: (name) => set({ name }),
    examDate: '2025-03-15',
    daysToExam: 120,
    weeklyScoreChange: 5,
    previousAccuracy: 70,
    totalQuestions: 2000,
}));