// src/Store/useSubjectStore.ts

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useUserStore } from './useUserStore';
import { getDetailedTopicStats, } from '../Services/PerformanceService';

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  accuracy: number;
  completed: number;
  total: number;
  rank: number;
  weakTopics: string[];
}

interface SubjectProgressDB {
  id: string;
  user_id: string;
  subject_id: string;
  subject_name: string;
  accuracy: number;
  questions_attempted: number;
  mastered: boolean;
  updated_at: string;
  created_at: string;
}

interface SubjectState {
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  loadSubjects: () => Promise<void>;
  updateSubject: (id: string, accuracy: number, completed: number) => Promise<void>;
  incrementCompleted: (id: string, count: number) => Promise<void>;
  updateAccuracy: (id: string, accuracy: number) => Promise<void>;
  initialize: () => Promise<void>;
}

// Complete master list of all possible subjects with their details
const ALL_SUBJECTS_MASTER = [
  { id: 'eng', name: 'English', icon: '📖', color: '#7B5FFF', total: 420 },
  { id: 'math', name: 'Mathematics', icon: '🔢', color: '#00C896', total: 380 },
  { id: 'phy', name: 'Physics', icon: '⚡', color: '#FFB020', total: 310 },
  { id: 'chem', name: 'Chemistry', icon: '⚗️', color: '#FF4D6D', total: 340 },
  { id: 'bio', name: 'Biology', icon: '🧬', color: '#00C896', total: 290 },
  { id: 'econ', name: 'Economics', icon: '📊', color: '#FFB020', total: 270 },
  { id: 'gov', name: 'Government', icon: '🏛️', color: '#EC4899', total: 300 },
  { id: 'lit', name: 'Literature', icon: '📚', color: '#F97316', total: 300 },
  { id: 'crs', name: 'CRS/IRS', icon: '✝️', color: '#A855F7', total: 250 },
];

// Map subject combo ID to list of subject names (matches your onboarding)
const SUBJECT_COMBO_MAP: Record<string, string[]> = {
  medicine: ["English", "Biology", "Chemistry", "Physics"],
  engineering: ["English", "Mathematics", "Physics", "Chemistry"],
  "social-sci": ["English", "Mathematics", "Economics", "Government"],
  law: ["English", "Literature", "Government", "CRS/IRS"],
};

// Map subject name to master subject object
const getSubjectFromName = (name: string) => {
  const nameMap: Record<string, any> = {
    'English': ALL_SUBJECTS_MASTER.find(s => s.name === 'English'),
    'Mathematics': ALL_SUBJECTS_MASTER.find(s => s.name === 'Mathematics'),
    'Physics': ALL_SUBJECTS_MASTER.find(s => s.name === 'Physics'),
    'Chemistry': ALL_SUBJECTS_MASTER.find(s => s.name === 'Chemistry'),
    'Biology': ALL_SUBJECTS_MASTER.find(s => s.name === 'Biology'),
    'Economics': ALL_SUBJECTS_MASTER.find(s => s.name === 'Economics'),
    'Government': ALL_SUBJECTS_MASTER.find(s => s.name === 'Government'),
    'Literature': ALL_SUBJECTS_MASTER.find(s => s.name === 'Literature'),
    'CRS/IRS': ALL_SUBJECTS_MASTER.find(s => s.name === 'CRS/IRS'),
  };
  return nameMap[name];
};

// Calculate national rank based on accuracy
const calculateRank = (accuracy: number): number => {
  if (accuracy >= 90) return 5;
  if (accuracy >= 80) return 12;
  if (accuracy >= 70) return 25;
  if (accuracy >= 60) return 45;
  if (accuracy >= 50) return 60;
  return 75;
};

// Get user's selected subjects based on their onboarding subject combo
const getUserSelectedSubjects = (): string[] => {
  const subjectComboId = useUserStore.getState().subjectCombo;
  // Default to engineering if not set (fallback)
  const subjects = SUBJECT_COMBO_MAP[subjectComboId] || SUBJECT_COMBO_MAP['engineering'];
  console.log('🔵 User selected subjects:', subjects, 'from combo:', subjectComboId);
  return subjects;
};

// Fetch user's subject progress (only selected subjects)
const fetchUserSubjects = async (): Promise<Subject[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user's selected subjects from their onboarding choice
  const selectedSubjectNames = getUserSelectedSubjects();

  // Get the master data for only selected subjects
  const selectedSubjectsMaster = selectedSubjectNames
    .map(name => getSubjectFromName(name))
    .filter(s => s !== undefined);

  // Fetch existing progress and real topic stats
  const [{ data: existingProgress, error }, realTopicStats] = await Promise.all([
    supabase.from('subject_progress').select('*').eq('user_id', user.id),
    getDetailedTopicStats()
  ]);

  if (error) throw error;

  // Create a map of existing progress
  const progressMap = new Map<string, SubjectProgressDB>();
  existingProgress?.forEach(p => {
    progressMap.set(p.subject_id, p);
  });

  // Build subjects only for selected ones
  const subjects: Subject[] = selectedSubjectsMaster.map(master => {
    const progress = progressMap.get(master.id);
    const accuracy = progress?.accuracy || 0;
    const completed = progress?.questions_attempted || 0;
    const rank = calculateRank(accuracy);

    // Find the single lowest accuracy topic for this subject from real data
    const subjectTopics = realTopicStats.filter(t => t.subject === master.name);
    const lowestTopic = subjectTopics.length > 0 ? [subjectTopics[0].name] : [];

    return {
      id: master.id,
      name: master.name,
      icon: master.icon,
      color: master.color,
      accuracy: accuracy,
      completed: completed,
      total: master.total,
      rank: rank,
      weakTopics: lowestTopic,
    };
  });

  return subjects;
};

// Initialize subject progress for a new user (only selected subjects)
const initializeUserSubjects = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user's selected subjects
  const selectedSubjectNames = getUserSelectedSubjects();
  const selectedSubjectsMaster = selectedSubjectNames
    .map(name => getSubjectFromName(name))
    .filter(s => s !== undefined);

  console.log('🔵 Initializing subjects for user:', selectedSubjectNames);

  for (const master of selectedSubjectsMaster) {
    const { error } = await supabase
      .from('subject_progress')
      .upsert({
        user_id: user.id,
        subject_id: master.id,
        subject_name: master.name,
        accuracy: 0,
        questions_attempted: 0,
        mastered: false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,subject_id'
      });

    if (error) console.error(`Error initializing ${master.name}:`, error);
  }
};

// Update subject progress in database
const updateSubjectProgressInDB = async (
  subjectId: string,
  newAccuracy: number,
  questionsAttempted: number
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const master = ALL_SUBJECTS_MASTER.find(s => s.id === subjectId);
  if (!master) throw new Error('Subject not found');

  const { error } = await supabase
    .from('subject_progress')
    .upsert({
      user_id: user.id,
      subject_id: subjectId,
      subject_name: master.name,
      accuracy: newAccuracy,
      questions_attempted: questionsAttempted,
      mastered: newAccuracy >= 80,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,subject_id'
    });

  if (error) throw error;
};

export const useSubjectStore = create<SubjectState>()((set, get) => ({
  subjects: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  loadSubjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const subjects = await fetchUserSubjects();
      set({ subjects, isLoading: false, isInitialized: true });
    } catch (error) {
      console.error('Failed to load subjects:', error);
      set({ error: 'Failed to load subjects', isLoading: false });
    }
  },

  updateSubject: async (id: string, accuracy: number, completed: number) => {
    try {
      await updateSubjectProgressInDB(id, accuracy, completed);

      set((state) => ({
        subjects: state.subjects.map((subject) =>
          subject.id === id
            ? {
              ...subject,
              accuracy,
              completed
            }
            : subject
        ),
      }));
    } catch (error) {
      console.error('Failed to update subject:', error);
    }
  },

  incrementCompleted: async (id: string, count: number) => {
    const subject = get().subjects.find(s => s.id === id);
    if (!subject) return;

    const newCompleted = Math.min(subject.completed + count, subject.total);
    const newAccuracy = subject.accuracy;

    await get().updateSubject(id, newAccuracy, newCompleted);
  },

  updateAccuracy: async (id: string, accuracy: number) => {
    const subject = get().subjects.find(s => s.id === id);
    if (!subject) return;

    await get().updateSubject(id, accuracy, subject.completed);
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      await initializeUserSubjects();
      await get().loadSubjects();
    } catch (error) {
      console.error('Failed to initialize subjects:', error);
      set({ error: 'Failed to initialize subjects', isLoading: false });
    }
  },
}));
