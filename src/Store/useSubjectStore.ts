import { create } from 'zustand';

export interface Subject {
  id:        string;
  name:      string;
  icon:      string;
  color:     string;   // hex — used for bar fill
  accuracy:  number;   // 0–100
  completed: number;   // questions answered
  total:     number;   // total questions available
  rank:      number;   // national rank for this subject
  weakTopics: string[];
}

interface SubjectState {
  subjects: Subject[];
  /** Call this after a quiz session to update accuracy */
  updateAccuracy: (subjectId: string, newAccuracy: number) => void;
}

export const useSubjectStore = create<SubjectState>()((set) => ({
  subjects: [
    {
      id: 'eng',
      name: 'English',
      icon: '📖',
      color: '#7B5FFF',
      accuracy: 82,
      completed: 344,
      total: 420,
      rank: 12,
      weakTopics: ['Antonyms', 'Oral English'],
    },
    {
      id: 'math',
      name: 'Mathematics',
      icon: '🔢',
      color: '#00C896',
      accuracy: 61,
      completed: 232,
      total: 380,
      rank: 45,
      weakTopics: ['Integration', 'Matrices', 'Permutation'],
    },
    {
      id: 'phy',
      name: 'Physics',
      icon: '⚡',
      color: '#FFB020',
      accuracy: 74,
      completed: 229,
      total: 310,
      rank: 23,
      weakTopics: ['Electromagnetism'],
    },
    {
      id: 'chem',
      name: 'Chemistry',
      icon: '⚗️',
      color: '#FF4D6D',
      accuracy: 48,
      completed: 163,
      total: 340,
      rank: 67,
      weakTopics: ['Organic Reactions', 'Acid-Base', 'Electrochemistry'],
    },
  ],

  updateAccuracy: (subjectId, newAccuracy) =>
    set((s) => ({
      subjects: s.subjects.map((sub) =>
        sub.id === subjectId ? { ...sub, accuracy: newAccuracy } : sub
      ),
    })),
}));