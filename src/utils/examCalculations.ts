// src/utils/examCalculations.ts
import type { Question } from "../Types";

export interface SubjectScore {
  subject: string;
  correct: number;
  total: number;
  score: number; // percentage
  performance: "Excellent" | "Good" | "Average" | "Poor";
}

export interface TopicPerformance {
  subject: string;
  name: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface ExamResult {
  jambScore: number;
  percentageScore: number;
  totalCorrect: number;
  totalQuestions: number;
  subjectBreakdown: SubjectScore[];
  topicPerformance: Record<string, TopicPerformance>;
}

export const getPerformanceIndicator = (
  percentage: number,
): SubjectScore["performance"] => {
  if (percentage >= 75) return "Excellent";
  if (percentage >= 60) return "Good";
  if (percentage >= 45) return "Average";
  return "Poor";
};

export const calculateExamResults = (
  questions: Question[],
  answers: Record<number, number>,
): ExamResult => {
  const totalQuestions = questions.length;
  let totalCorrect = 0;

  const subjectMap: Record<string, { correct: number; total: number }> = {};
  const topicMap: Record<string, TopicPerformance> = {};

  questions.forEach((q, index) => {
    if (!subjectMap[q.subject]) {
      subjectMap[q.subject] = { correct: 0, total: 0 };
    }

    const topicKey = `${q.subject}:${q.topic}`;
    if (!topicMap[topicKey]) {
      topicMap[topicKey] = {
        subject: q.subject,
        name: q.topic,
        correct: 0,
        total: 0,
        accuracy: 0,
      };
    }

    subjectMap[q.subject].total++;
    topicMap[topicKey].total++;

    if (answers[index] === q.answer) {
      totalCorrect++;
      subjectMap[q.subject].correct++;
      topicMap[topicKey].correct++;
    }
  });

  // Calculate accuracies for topics
  Object.values(topicMap).forEach((t) => {
    t.accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
  });

  // Scale JAMB score relative to a full 180-question exam for realism
  const jambScore =
    totalQuestions > 0 ? Math.round((totalCorrect / 180) * 400) : 0;
  const percentageScore =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const subjectBreakdown: SubjectScore[] = Object.entries(subjectMap).map(
    ([subject, data]) => {
      const score = Math.round((data.correct / data.total) * 100);
      return {
        subject,
        correct: data.correct,
        total: data.total,
        score,
        performance: getPerformanceIndicator(score),
      };
    },
  );

  return {
    jambScore,
    percentageScore,
    totalCorrect,
    totalQuestions,
    subjectBreakdown,
    topicPerformance: topicMap,
  };
};

export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
