// src/services/subjectService.ts

import { supabase } from "../lib/supabase";
import type { Subject } from "../Types/subject";

// Master list of subjects (static data)
const SUBJECTS_MASTER = [
  { id: "eng", name: "English", icon: "📖", color: "#7B5FFF", total: 420 },
  { id: "math", name: "Mathematics", icon: "🔢", color: "#00C896", total: 380 },
  { id: "phy", name: "Physics", icon: "⚡", color: "#FFB020", total: 310 },
  { id: "chem", name: "Chemistry", icon: "⚗️", color: "#FF4D6D", total: 340 },
  { id: "bio", name: "Biology", icon: "🧬", color: "#00C896", total: 290 },
  { id: "econ", name: "Economics", icon: "📊", color: "#FFB020", total: 270 },
];

// Calculate national rank based on accuracy
const calculateRank = (accuracy: number): number => {
  if (accuracy >= 90) return 5;
  if (accuracy >= 80) return 12;
  if (accuracy >= 70) return 25;
  if (accuracy >= 60) return 45;
  if (accuracy >= 50) return 60;
  return 75;
};

// Get weak topics based on subject and accuracy
const getWeakTopics = (subjectId: string, accuracy: number): string[] => {
  if (accuracy >= 75) return [];

  const weakTopicsMap: Record<string, string[]> = {
    eng: ["Antonyms", "Oral English", "Comprehension"],
    math: ["Integration", "Matrices", "Permutation", "Calculus"],
    phy: ["Electromagnetism", "Thermodynamics", "Mechanics"],
    chem: [
      "Organic Reactions",
      "Acid-Base",
      "Electrochemistry",
      "Stoichiometry",
    ],
    bio: ["Genetics", "Ecology", "Physiology", "Cell Division"],
    econ: [
      "Monetary Policy",
      "Elasticity",
      "Market Structure",
      "Demand/Supply",
    ],
  };

  const allWeakTopics = weakTopicsMap[subjectId] || [];
  const numberOfWeakTopics = Math.max(1, Math.floor((75 - accuracy) / 15));
  return allWeakTopics.slice(0, numberOfWeakTopics);
};

// Fetch or initialize subject progress for the current user
export const fetchUserSubjects = async (): Promise<Subject[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch existing progress from Supabase
  const { data: existingProgress, error } = await supabase
    .from("subject_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;

  // Create a map of existing progress
  const progressMap = new Map<string, any>();
  existingProgress?.forEach((p) => {
    progressMap.set(p.subject, p);
  });

  // Build subjects with real progress data
  const subjects: Subject[] = SUBJECTS_MASTER.map((master) => {
    const progress = progressMap.get(master.id);
    const accuracy = progress?.accuracy || 0;
    const completed = progress?.questions_done || 0;
    const rank = calculateRank(accuracy);
    const weakTopics = getWeakTopics(master.id, accuracy);

    return {
      id: master.id,
      name: master.name,
      icon: master.icon,
      color: master.color,
      accuracy: accuracy,
      completed: completed,
      total: master.total,
      rank: rank,
      weakTopics: weakTopics,
    };
  });

  return subjects;
};

// Update subject progress after quiz completion
export const updateSubjectProgressInDB = async (
  subjectId: string,
  newAccuracy: number,
  questionsAttempted: number,
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const master = SUBJECTS_MASTER.find((s) => s.id === subjectId);
  if (!master) throw new Error("Subject not found");

  const { error } = await supabase.from("subject_progress").upsert(
    {
      user_id: user.id,
      subject: subjectId,
      accuracy: newAccuracy,
      questions_done: questionsAttempted,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,subject",
    },
  );

  if (error) throw error;
};

// Initialize subject progress for a new user (called after onboarding)
export const initializeUserSubjects = async (): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  for (const master of SUBJECTS_MASTER) {
    const { error } = await supabase.from("subject_progress").upsert(
      {
        user_id: user.id,
        subject: master.id,
        accuracy: 0,
        questions_done: 0,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,subject",
      },
    );

    if (error) console.error(`Error initializing ${master.name}:`, error);
  }
};
