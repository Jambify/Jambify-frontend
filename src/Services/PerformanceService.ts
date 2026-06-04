// src/services/performanceService.ts

import { supabase } from '../lib/supabase';

export interface WeeklyActivity {
  day: string;
  questions: number;
}

export interface TopicStat {
  id: string;
  name: string;
  subject: string;
  accuracy: number;
}

export interface MockScore {
  score: number;
  total: number;
  date: string;
}

export interface PerformanceSummary {
  totalQuestions: number;
  avgAccuracy: number;
  mockScores: MockScore[];
  sessionsCount: number;
}

interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

interface PerformanceSummaryData {
  total_questions: number;
  avg_accuracy: number;
  mock_scores: MockScore[];
  sessions_count: number;
}

interface WeeklyActivityData {
  date: string;
  questions: number;
}

interface TopicPerformanceData {
  subject: string;
  correct: number;
  total: number;
}

interface QuizSubmissionData {
  session_id: string;
  correct: number;
  total: number;
  accuracy: number;
  streak: number;
}

// Get performance summary from Supabase
export const getPerformanceSummary = async (): Promise<PerformanceSummary> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_performance_summary', {
    p_user_id: user.id
  }) as SupabaseResponse<PerformanceSummaryData>;

  if (error) throw error;

  return {
    totalQuestions: data?.total_questions || 0,
    avgAccuracy: Math.min(data?.avg_accuracy || 0, 100), // Cap at 100%
    mockScores: data?.mock_scores || [],
    sessionsCount: data?.sessions_count || 0,
  };
};

// Get weekly activity from Supabase
export const getWeeklyActivity = async (): Promise<WeeklyActivity[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_weekly_activity', {
    p_user_id: user.id
  }) as SupabaseResponse<WeeklyActivityData[]>;

  if (error) throw error;

  // Map the data to day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: WeeklyActivity[] = dayNames.map(day => ({ day, questions: 0 }));

  if (data && Array.isArray(data)) {
    data.forEach((item) => {
      const date = new Date(item.date);
      const dayIndex = date.getDay();
      if (result[dayIndex]) {
        result[dayIndex].questions = item.questions;
      }
    });
  }

  return result;
};

// Get topic stats from quiz sessions (detailed aggregation from JSONB)
export const getDetailedTopicStats = async (): Promise<TopicStat[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: sessions, error } = await supabase
    .from('quiz_sessions')
    .select('topic_performance')
    .eq('user_id', user.id);

  if (error) throw error;
  if (!sessions || sessions.length === 0) return [];

  const topicAgg: Record<string, { subject: string; correct: number; total: number }> = {};

  sessions.forEach(s => {
    const perf = (s.topic_performance as Record<string, TopicPerformanceData>) || {};
    Object.entries(perf).forEach(([key, data]) => {
      if (!topicAgg[key]) {
        topicAgg[key] = { subject: data.subject, correct: 0, total: 0 };
      }
      topicAgg[key].correct += data.correct || 0;
      topicAgg[key].total += data.total || 0;
    });
  });

  const topics: TopicStat[] = Object.entries(topicAgg).map(([name, data]) => ({
    id: name,
    name: name.split(':')[1] || name,
    subject: data.subject,
    accuracy: Math.round((data.correct / data.total) * 100),
  }));

  return topics.sort((a, b) => a.accuracy - b.accuracy);
};

// Get topic stats from quiz sessions (only subjects the user has actually practiced)
export const getTopicStats = async (): Promise<TopicStat[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Get ALL quiz sessions for this user to see what they've actually practiced
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('subject, accuracy')
    .eq('user_id', user.id);

  if (error) throw error;

  // If no sessions found, return empty array
  if (!data || data.length === 0) {
    console.log("ℹ️ [getTopicStats] No quiz sessions found for user.");
    return [];
  }

  // 2. Create a map to calculate average accuracy per subject
  const quizMap = new Map<string, { total: number; count: number }>();

  data.forEach((session: { subject: string; accuracy: number }) => {
    const subject = session.subject;
    const accuracy = session.accuracy;

    if (quizMap.has(subject)) {
      const existing = quizMap.get(subject)!;
      quizMap.set(subject, {
        total: existing.total + accuracy,
        count: existing.count + 1
      });
    } else {
      quizMap.set(subject, { total: accuracy, count: 1 });
    }
  });

  // 3. Build topics ONLY for subjects found in the quiz_sessions
  const topics: TopicStat[] = [];

  quizMap.forEach((stats, subjectName) => {
    const avgAccuracy = Math.min(Math.round(stats.total / stats.count), 100);

    topics.push({
      id: subjectName,
      name: subjectName,
      subject: subjectName,
      accuracy: avgAccuracy,
    });
  });

  console.log("🔵 Practiced topics (found in sessions):", topics);

  // Sort by accuracy ascending (weakest first)
  return topics.sort((a, b) => a.accuracy - b.accuracy);
};

// Submit quiz session (call from Quiz page)
export const submitQuizSession = async (
  mode: 'practice' | 'mock',
  subject: string,
  questionIds: string[],
  clientAnswers: Record<number, number>,
  timeTakenSeconds: number,
  correctCount?: number, // Optional: calculated by frontend
  totalQuestions?: number, // Optional: calculated by frontend
  topicPerformance?: Record<string, any>
): Promise<{
  sessionId: string;
  correct: number;
  total: number;
  accuracy: number;
  streak: number;
}> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Convert answers to JSONB format with proper typing
  const answersJson: Record<number, number> = {};
  Object.entries(clientAnswers).forEach(([index, answer]) => {
    answersJson[parseInt(index)] = answer;
  });

  // Calculate local accuracy if not provided
  const finalTotal = totalQuestions || questionIds.length;
  const finalCorrect = correctCount !== undefined ? correctCount : 0;
  const finalAccuracy = finalTotal > 0 ? (finalCorrect / finalTotal) * 100 : 0;

  console.log(`🚀 [submitQuizSession] Sending ${subject} (${mode}) to DB:`, {
    correct: finalCorrect,
    total: finalTotal,
    accuracy: finalAccuracy.toFixed(2)
  });

  const { data, error } = await supabase.rpc('submit_quiz_session', {
    p_user_id: user.id,
    p_mode: mode,
    p_subject: subject,
    p_question_ids: questionIds,
    p_client_answers: answersJson,
    p_time_taken_secs: timeTakenSeconds,
    p_frontend_correct: finalCorrect,
    p_frontend_accuracy: finalAccuracy,
    p_topic_performance: topicPerformance || {}
  }) as SupabaseResponse<QuizSubmissionData>;

  if (error) {
    console.error('❌ [submitQuizSession] RPC Error:', error);
    throw error;
  }

  if (!data) throw new Error('Failed to submit session');

  const result = {
    sessionId: data.session_id,
    correct: data.correct,
    total: data.total,
    accuracy: Math.min(data.accuracy, 100),
    streak: data.streak || 0,
  };

  console.log("✅ [submitQuizSession] Result:", result);
  return result;
};
