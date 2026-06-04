// src/services/database.ts
import { supabase } from '../lib/supabase';

// Questions
export const getQuestions = async (subjectId?: string) => {
  let query = supabase.from('questions').select('*');
  if (subjectId) query = query.eq('subject_id', subjectId);
  return await query;
};

// Quiz Sessions
export const saveQuizSession = async (sessionData: any) => {
  return await supabase.from('quiz_sessions').insert(sessionData);
};

export const getQuizHistory = async () => {
  return await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .order('created_at', { ascending: false });
};

// Subject Progress
export const updateSubjectProgress = async (subjectId: string, score: number) => {
  return await supabase
    .from('subject_progress')
    .upsert({ 
      subject_id: subjectId, 
      score, 
      updated_at: new Date() 
    });
};

// Daily Activity
export const logDailyActivity = async () => {
  const today = new Date().toISOString().split('T')[0];
  return await supabase
    .from('daily_activity')
    .upsert({ date: today, activity_count: 1 });
};

// Leaderboard
export const getLeaderboard = async () => {
  return await supabase
    .from('leaderboard_snapshots')
    .select('*')
    .order('score', { ascending: false })
    .limit(100);
};

// SM2 Cards
export const getDueCards = async () => {
  return await supabase
    .from('sm2_cards')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .lte('due_date', new Date().toISOString());
};

export const updateCard = async (cardId: string, data: any) => {
  return await supabase
    .from('sm2_cards')
    .update(data)
    .eq('id', cardId);
};
