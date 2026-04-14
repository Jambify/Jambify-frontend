import { create } from 'zustand';

export interface TopicStat {
  id:       string;
  name:     string;
  subject:  string;
  accuracy: number;
}

export interface WeeklyActivity {
  day:       string;
  questions: number;
}

interface PerformanceState {
  weeklyActivity: WeeklyActivity[];
  topicStats:     TopicStat[];
  mockScores:     number[];
  /** Call after a quiz to record a new mock score */
  addMockScore:   (score: number) => void;
  /** Call after a quiz session to update a topic's accuracy */
  updateTopic:    (id: string, accuracy: number) => void;
  /** Bump today's question count */
  addActivity:    (day: string, count: number) => void;
}

export const usePerformanceStore = create<PerformanceState>()((set) => ({
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
    { id: 't1', name: 'Organic Chemistry',   subject: 'Chemistry',   accuracy: 32 },
    { id: 't2', name: 'Acid-Base Reactions', subject: 'Chemistry',   accuracy: 41 },
    { id: 't3', name: 'Arithmetic Series',   subject: 'Mathematics', accuracy: 55 },
    { id: 't4', name: 'Projectile Motion',   subject: 'Physics',     accuracy: 62 },
    { id: 't5', name: "Newton's Laws",       subject: 'Physics',     accuracy: 88 },
    { id: 't6', name: 'Word Problems',       subject: 'Mathematics', accuracy: 91 },
  ],

  mockScores: [241, 248, 255],

  addMockScore: (score) =>
    set((s) => ({ mockScores: [...s.mockScores, score] })),

  updateTopic: (id, accuracy) =>
    set((s) => ({
      topicStats: s.topicStats.map((t) =>
        t.id === id ? { ...t, accuracy } : t
      ),
    })),

  addActivity: (day, count) =>
    set((s) => ({
      weeklyActivity: s.weeklyActivity.map((d) =>
        d.day === day ? { ...d, questions: d.questions + count } : d
      ),
    })),
}));