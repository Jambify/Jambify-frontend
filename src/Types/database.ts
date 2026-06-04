// src/types/database.ts
export interface Question {
  id: string;
  subject_id: string;
  text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: number;
  year?: number;
}

export interface QuizSession {
  id: string;
  user_id: string;
  subject_id: string;
  score: number;
  total_questions: number;
  time_spent: number;
  created_at: string;
}

export interface SubjectProgress {
  id: string;
  user_id: string;
  subject_id: string;
  accuracy: number;
  questions_attempted: number;
  mastered: boolean;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  score: number;
  rank: number;
  snapshot_date: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  date: string;
  questions_completed: number;
  streak_days: number;
}

export interface SM2Card {
  id: string;
  user_id: string;
  question_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  due_date: string;
}
