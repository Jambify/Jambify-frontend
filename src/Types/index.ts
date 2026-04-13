export interface Question {
  id: string;
  subject: 'English' | 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology';
  year: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
  options: string[];
  answer: number;        // index of correct option
  explanation: string;
  topic: string;
}

export interface QuizSession {
  questions: Question[];
  answers: Record<number, number>;  // questionIndex → chosen option
  startedAt: number;                // Date.now()
  finishedAt?: number;
}