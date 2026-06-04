// src/types/subject.ts

export interface Topic {
  id: string;
  name: string;
  accuracy: number;
  questionsAttempted: number;
  correctAnswers: number;
}

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
  topics?: Topic[];
}

export interface SubjectProgress {
  id: string;
  user_id: string;
  subject_id: string;
  subject_name: string;
  accuracy: number;
  questions_attempted: number;
  total_questions: number;
  mastered: boolean;
  updated_at: string;
}

export interface TopicProgress {
  id: string;
  user_id: string;
  subject_id: string;
  topic_id: string;
  topic_name: string;
  accuracy: number;
  questions_attempted: number;
  correct_answers: number;
}
