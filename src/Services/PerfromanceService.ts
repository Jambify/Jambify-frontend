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

// Get performance summary from Supabase
export const getPerformanceSummary = async (): Promise<PerformanceSummary> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_performance_summary', {
    p_user_id: user.id
  });

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
  });

  if (error) throw error;
  
  // Map the data to day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: WeeklyActivity[] = dayNames.map(day => ({ day, questions: 0 }));
  
  if (data && Array.isArray(data)) {
    data.forEach((item: any) => {
      const date = new Date(item.date);
      const dayIndex = date.getDay();
      if (result[dayIndex]) {
        result[dayIndex].questions = item.questions;
      }
    });
  }
  
  return result;
};

// Get topic stats from quiz sessions (only user's selected subjects)
// src/services/performanceService.ts - Updated getTopicStats

// Get topic stats from quiz sessions (only user's selected subjects)
export const getTopicStats = async (): Promise<TopicStat[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get the user's selected subjects from onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('subject_combo')
    .eq('id', user.id)
    .maybeSingle();

  // Parse the subject combo string to get actual subjects
  const selectedSubjects: string[] = profile?.subject_combo 
    ? profile.subject_combo.split(',').map((s: string) => s.trim())
    : [];

  console.log("🔵 User's selected subjects from profile:", selectedSubjects);

  // If no selected subjects found, return empty array
  if (selectedSubjects.length === 0) {
    return [];
  }

  // Get quiz sessions for selected subjects
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('subject, accuracy')
    .eq('user_id', user.id)
    .in('subject', selectedSubjects);

  if (error) throw error;

  // Create a map of existing quiz data
  const quizMap = new Map<string, { total: number; count: number }>();
  
  data?.forEach((session: { subject: string; accuracy: number }) => {
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

  // Build topics for ALL selected subjects (not just those with quiz data)
  const topics: TopicStat[] = [];
  
  selectedSubjects.forEach((subjectName: string) => {
    const quizData = quizMap.get(subjectName);
    let avgAccuracy = 0;
    
    if (quizData && quizData.count > 0) {
      avgAccuracy = Math.min(Math.round(quizData.total / quizData.count), 100);
    }
    
    topics.push({
      id: subjectName,
      name: subjectName,
      subject: subjectName,
      accuracy: avgAccuracy,
    });
  });

  console.log("🔵 Final topics (all selected subjects):", topics);

  // Sort by accuracy ascending (weakest first)
  return topics.sort((a, b) => a.accuracy - b.accuracy);
};

// Submit quiz session (call from Quiz page)
export const submitQuizSession = async (
  mode: 'practice' | 'mock',
  subject: string,
  questionIds: string[],
  clientAnswers: Record<number, number>,
  timeTakenSeconds: number
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

  const { data, error } = await supabase.rpc('submit_quiz_session', {
    p_user_id: user.id,
    p_mode: mode,
    p_subject: subject,
    p_question_ids: questionIds,
    p_client_answers: answersJson,
    p_time_taken_secs: timeTakenSeconds,
  });

  if (error) throw error;
  
  return {
    sessionId: data.session_id,
    correct: data.correct,
    total: data.total,
    accuracy: Math.min(data.accuracy, 100), // Cap at 100%
    streak: data.streak,
  };
};