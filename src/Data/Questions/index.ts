// src/Data/Questions/index.ts
// Register every subject file here.
// Add a new import + key whenever you create a new subject file.

import type { Question } from '../../Types';

import { ENGLISH_QUESTIONS }     from './English';
// import { MATHEMATICS_QUESTIONS } from './Mathematics';
import { PHYSICS_QUESTIONS }     from './Physics';
import { CHEMISTRY_QUESTIONS }   from './Chemistry';
import { BIOLOGY_QUESTIONS }     from './Biology';

// The key here MUST match the subject id in AVAILABLE_SUBJECTS in MockExam.tsx.
// e.g. MockExam has { id: "Literature" } so the key here is "Literature" not "Literature in English"
export const LOCAL_DATABASE: Record<string, Question[]> = {
  'English':     ENGLISH_QUESTIONS,
  // 'Mathematics': MATHEMATICS_QUESTIONS,
  'Physics':     PHYSICS_QUESTIONS,
  'Chemistry':   CHEMISTRY_QUESTIONS,
  'Biology':     BIOLOGY_QUESTIONS,
};

/**
 * Get questions for a subject, optionally filtered by year.
 * Returns up to `count` questions, shuffled.
 * MockExam handles duplication if count > available questions.
 */
export const getLocalQuestions = (
  subject: string,
  year:    string | number,
  count:   number,
): Question[] => {
  let questions = LOCAL_DATABASE[subject] || [];

  // Filter by year unless "Random" is selected
  if (year !== 'Random') {
    const yearNum = typeof year === 'string'
      ? parseInt(year, 10)
      : year;
    questions = questions.filter(q => q.year === yearNum);
  }

  // Shuffle
  const shuffled = [...questions].sort(() => Math.random() - 0.5);

  // Return up to count (MockExam will pad with duplicates if needed)
  return shuffled.slice(0, count);
};

/** Returns total question count across all subjects (useful for stats) */
export const getDatabaseStats = () => {
  return Object.entries(LOCAL_DATABASE).map(([subject, questions]) => ({
    subject,
    total:  questions.length,
    years:  [...new Set(questions.map(q => q.year))].sort(),
  }));
};
export const getTotalQuestionCount = () => {
  return Object.values(LOCAL_DATABASE).reduce((sum, questions) => sum + questions.length, 0);
}
