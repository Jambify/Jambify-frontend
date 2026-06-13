
import { supabase } from "../lib/supabase";

// Helper to get today's date as YYYY-MM-DD
const getTodayDateKey = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Cache current user to avoid multiple rapid auth calls
let cachedUser: Awaited<ReturnType<typeof supabase.auth.getUser>> | null = null;
let lastUserFetch = 0;
const USER_CACHE_TTL = 30000; // 30 seconds

async function getCachedUser() {
  const now = Date.now();
  if (!cachedUser || now - lastUserFetch > USER_CACHE_TTL) {
    try {
      cachedUser = await supabase.auth.getUser();
      lastUserFetch = now;
    } catch (err) {
      console.error(`[DailyGoalsService] ❌ Error fetching user:`, err);
      throw err;
    }
  }
  return cachedUser;
}

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
    const { data: userData, error: userError } = await getCachedUser();
    if (userError || !userData?.user) return null;

    const { data, error } = await supabase
      .from("daily_activity")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("activity_date", getTodayDateKey())
      .maybeSingle();

    if (error) {
      console.error(`[DailyGoalsService] ❌ Error fetching activity:`, error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`[DailyGoalsService] ❌ Unexpected error in getTodayActivity:`, err);
    return null;
  }
};

export const upsertTodayActivity = async (
  updates: Partial<Omit<DailyActivity, "id" | "user_id" | "activity_date">>,
): Promise<DailyActivity | null> => {
  try {
    const { data: userData, error: userError } = await getCachedUser();
    if (userError || !userData?.user) return null;

    const today = getTodayDateKey();

    const { data, error } = await supabase
      .from("daily_activity")
      .upsert(
        {
          user_id: userData.user.id,
          activity_date: today,
          questions_completed: 0,
          topics_completed: [],
          total_study_minutes: 0,
          best_accuracy_today: 0,
          ...updates,
        },
        {
          onConflict: "user_id, activity_date",
        },
      )
      .select()
      .single();

    if (error) {
      console.error(`[DailyGoalsService] ❌ Error upserting activity:`, error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`[DailyGoalsService] ❌ Unexpected error in upsertTodayActivity:`, err);
    return null;
  }
};

// ==================================================
// Daily Goals Progress Functions
// ==================================================

export interface DailyGoalProgress {
  id?: string;
  user_id: string;
  goal_date: string;
  goal_id: string;
  completed: boolean;
  completed_at?: string;
  xp_earned: number;
}

export const getTodayGoalsProgress = async (): Promise<DailyGoalProgress[]> => {
  try {
    const { data: userData, error: userError } = await getCachedUser();
    if (userError || !userData?.user) return [];

    const { data, error } = await supabase
      .from("daily_goals_progress")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("goal_date", getTodayDateKey());

    if (error) {
      console.error(`[DailyGoalsService] ❌ Error fetching goals:`, error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(`[DailyGoalsService] ❌ Unexpected error in getTodayGoalsProgress:`, err);
    return [];
  }
};

export const upsertGoalProgress = async (
  goalId: string,
  completed: boolean,
  xpEarned: number,
): Promise<DailyGoalProgress | null> => {
  try {
    const { data: userData, error: userError } = await getCachedUser();
    if (userError || !userData?.user) return null;

    const today = getTodayDateKey();

    const { data, error } = await supabase
      .from("daily_goals_progress")
      .upsert(
        {
          user_id: userData.user.id,
          goal_date: today,
          goal_id: goalId,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          xp_earned: completed ? xpEarned : 0,
        },
        { onConflict: "user_id, goal_date, goal_id" },
      )
      .select()
      .single();

    if (error) {
      console.error(`[DailyGoalsService] ❌ Error upserting goal:`, error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(`[DailyGoalsService] ❌ Unexpected error in upsertGoalProgress:`, err);
    return null;
  }
};

