import { create } from 'zustand';

export interface Subject {
  id:          string;
  name:        string;
  icon:        string;
  color:       string;
  accuracy:    number;   // 0–100
  completed:   number;   // questions answered
  total:       number;   // questions available
  rank:        number;   // national rank
  weakTopics:  string[];
}

interface SubjectState {
  subjects: Subject[];
  updateAccuracy: (id: string, accuracy: number) => void;
  incrementCompleted: (id: string, count: number) => void;
}

export const useSubjectStore = create<SubjectState>()((set) => ({
  subjects: [
    {
      id: 'eng', name: 'English', icon: '📖',
      color: '#7B5FFF', accuracy: 82,
      completed: 344, total: 420, rank: 12,
      weakTopics: ['Antonyms', 'Oral English'],
    },
    {
      id: 'math', name: 'Mathematics', icon: '🔢',
      color: '#00C896', accuracy: 61,
      completed: 232, total: 380, rank: 45,
      weakTopics: ['Integration', 'Matrices', 'Permutation'],
    },
    {
      id: 'phy', name: 'Physics', icon: '⚡',
      color: '#FFB020', accuracy: 74,
      completed: 229, total: 310, rank: 23,
      weakTopics: ['Electromagnetism'],
    },
    {
      id: 'chem', name: 'Chemistry', icon: '⚗️',
      color: '#FF4D6D', accuracy: 48,
      completed: 163, total: 340, rank: 67,
      weakTopics: ['Organic Reactions', 'Acid-Base', 'Electrochemistry'],
    },
    {
      id: 'bio', name: 'Biology', icon: '🧬',
      color: '#00C896', accuracy: 70,
      completed: 203, total: 290, rank: 30,
      weakTopics: ['Genetics', 'Ecology'],
    },
    {
      id: 'econ', name: 'Economics', icon: '📊',
      color: '#FFB020', accuracy: 55,
      completed: 149, total: 270, rank: 55,
      weakTopics: ['Monetary Policy', 'Elasticity'],
    },
  ],

  updateAccuracy: (id, accuracy) =>
    set((s) => ({
      subjects: s.subjects.map((sub) =>
        sub.id === id ? { ...sub, accuracy } : sub
      ),
    })),

  incrementCompleted: (id, count) =>
    set((s) => ({
      subjects: s.subjects.map((sub) =>
        sub.id === id
          ? { ...sub, completed: Math.min(sub.completed + count, sub.total) }
          : sub
      ),
    })),
}));