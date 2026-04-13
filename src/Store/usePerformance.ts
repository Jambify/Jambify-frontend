import { create } from 'zustand';

interface TopicStat {
  id: string;
  name: string;
  subject: string;
  accuracy: number;
}

interface WeeklyActivity {
  day: string;     // 'Mon' | 'Tue' etc.
  questions: number;
}

interface PerformanceState {
  weeklyActivity: WeeklyActivity[];
  topicStats: TopicStat[];
  mockScores: number[];
}

export const usePerformanceStore = create<PerformanceState>(() => ({
  weeklyActivity: [
    { day: 'Mon', questions: 45 },
    { day: 'Tue', questions: 72 },
    { day: 'Wed', questions: 30 },
    { day: 'Thu', questions: 88 },
    { day: 'Fri', questions: 65 },
    { day: 'Sat', questions: 20 },
    { day: 'Sun', questions: 0  },
  ],
  topicStats: [
    { id: 't1', name: 'Organic Chemistry',   subject: 'Chemistry',    accuracy: 32 },
    { id: 't2', name: 'Acid-Base Reactions', subject: 'Chemistry',    accuracy: 41 },
    { id: 't3', name: 'Arithmetic Series',   subject: 'Mathematics',  accuracy: 55 },
    { id: 't4', name: 'Projectile Motion',   subject: 'Physics',      accuracy: 62 },
    { id: 't5', name: "Newton's Laws",       subject: 'Physics',      accuracy: 88 },
    { id: 't6', name: 'Word Problems',       subject: 'Mathematics',  accuracy: 91 },
  ],
  mockScores: [241, 248, 255],
}));