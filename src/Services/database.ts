// src/services/database.ts
import { supabase } from "../lib/supabase";
import type { QuizSession, SM2Card } from "../Types/database";

// Maps short subject ID to full name (for database enum)
const SHORT_ID_TO_FULL_NAME: Record<string, string> = {
  eng: "English",
  math: "Mathematics",
  phy: "Physics",
  chem: "Chemistry",
  bio: "Biology",
  econ: "Economics",
  gov: "Government",
  lit: "Literature in English",
  crs: "CRS",
  irs: "IRS",
  com: "Commerce",
};

// Questions
export const getQuestions = async (subject?: string) => {
  let query = supabase.from("questions").select("*");
  if (subject) query = query.eq("subject", subject);
  return await query;
};

// Quiz Sessions
export const saveQuizSession = async (sessionData: Omit<QuizSession, "id" | "created_at"> & { id?: string; created_at?: string }) => {
  return await supabase.from("quiz_sessions").insert(sessionData);
};

export const getQuizHistory = async () => {
  return await supabase
    .from("quiz_sessions")
    .select("*")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .order("created_at", { ascending: false });
};

// Subject Progress
export const updateSubjectProgress = async (
  subject: string,
  accuracy: number,
  questionsDone: number,
) => {
  const fullName = SHORT_ID_TO_FULL_NAME[subject] || subject;
  return await supabase.from("subject_progress").upsert({
    subject: fullName,
    accuracy,
    questions_done: questionsDone,
    updated_at: new Date(),
  }, {
    onConflict: "user_id,subject"
  });
};

// Daily Activity
export const logDailyActivity = async () => {
  const today = new Date().toISOString().split("T")[0];
  return await supabase
    .from("daily_activity")
    .upsert({ date: today, activity_count: 1 });
};

// Leaderboard
export const getLeaderboard = async () => {
  return await supabase
    .from("leaderboard_snapshots")
    .select("*")
    .order("score", { ascending: false })
    .limit(100);
};

// SM2 Cards
export const getDueCards = async () => {
  return await supabase
    .from("sm2_cards")
    .select("*")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .lte("due_date", new Date().toISOString());
};

export const updateCard = async (cardId: string, data: Partial<Omit<SM2Card, "id" | "user_id">>) => {
  return await supabase.from("sm2_cards").update(data).eq("id", cardId);
};
