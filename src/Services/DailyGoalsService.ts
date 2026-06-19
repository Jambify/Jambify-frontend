
import { supabase } from "../lib/supabase";
import type {  DailyGoalProgress } from "../Types/dailyGoals";

// Add this export at the top level


// Helper to get today's date as YYYY-MM-DD
const getTodayDateKey = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
// Replace getCachedUser entirely — no TTL cache needed
// supabase.auth.getUser() already caches internally and is fast
async function getAuthenticatedUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// Remove the cachedUser, lastUserFetch, USER_CACHE_TTL variables entirely
// Remove clearUserCache export (no longer needed)

// Cache current user to avoid multiple rapid auth calls
// let cachedUser: Awaited<ReturnType<typeof supabase.auth.getUser>> | null = null;
// let lastUserFetch = 0;
// const USER_CACHE_TTL = 30000; // 30 seconds

// async function getCachedUser() {
//   const now = Date.now();
//   if (!cachedUser || now - lastUserFetch > USER_CACHE_TTL) {
//     try {
//       cachedUser = await supabase.auth.getUser();
//       lastUserFetch = now;
//     } catch (err) {
//       console.error(`[DailyGoalsService] ❌ Error fetching user:`, err);
//       throw err;
//     }
//   }
//   return cachedUser;
// }

// ==================================================
// Daily Activity Functions
// ==================================================

export interface DailyActivity {
  id?: string;
  user_id: string;
  activity_date: string;
  questions_completed: number;
  topics_completed: string[];
  total_study_minutes: number;
  best_accuracy_today: number;
}

export const getTodayActivity = async (): Promise<DailyActivity | null> => {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return null;  // ← not authenticated, bail cleanly

    const { data, error } = await supabase
      .from("daily_activity")
      .select("*")
      .eq("user_id", user.id)
      .eq("activity_date", getTodayDateKey())
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
};

export const upsertTodayActivity = async (
  updates: Partial<Omit<DailyActivity, "id" | "user_id" | "activity_date">>,
): Promise<DailyActivity | null> => {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return null;  // ← no user = no write, ever

    const today = getTodayDateKey();
    const { data, error } = await supabase
      .from("daily_activity")
      .upsert(
        { user_id: user.id, activity_date: today, questions_completed: 0,
          topics_completed: [], total_study_minutes: 0, best_accuracy_today: 0,
          ...updates },
        { onConflict: "user_id, activity_date" },
      )
      .select()
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
};

export const getTodayGoalsProgress = async (): Promise<DailyGoalProgress[]> => {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return [];  // ← no user = no read

    const { data, error } = await supabase
      .from("daily_goals_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("goal_date", getTodayDateKey());

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
};

export const upsertGoalProgress = async (
  goalId: string,
  completed: boolean,
  xpEarned: number,
): Promise<DailyGoalProgress | null> => {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return null;  // ← no user = no write

    const today = getTodayDateKey();
    const { data, error } = await supabase
      .from("daily_goals_progress")
      .upsert(
        { user_id: user.id, goal_date: today, goal_id: goalId, completed,
          completed_at: completed ? new Date().toISOString() : null,
          xp_earned: completed ? xpEarned : 0 },
        { onConflict: "user_id, goal_date, goal_id" },
      )
      .select()
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
};

