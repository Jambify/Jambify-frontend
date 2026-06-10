
import { supabase } from "../lib/supabase";

// ===========================================================
// TYPES
// ===========================================================
export interface QuizSessionData {
  id: string;
  subject: string;
  accuracy: number;
  correct: number;
  total: number;
  created_at: string;
  mode: "practice" | "mock";
}

export interface TopicStat {
  id: string;
  name: string;
  subject: string;
  accuracy: number;
  mastery_level: number; // 0=unstarted,1=learning,2=practicing,3=mastered
}

export interface SubjectPerformance {
  subject: string;
  best_score: number;
  worst_score: number;
  total_attempts: number;
  last_score: number;
}

export interface WeeklyActivity {
  day: string;
  questions: number;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  date: string;
  questions_completed: number;
  accuracy: number;
  streak: number;
  goals_completed: string[];
  xp_earned: number;
}

export interface QuizSubmissionData {
  session_id: string;
  correct: number;
  total: number;
  accuracy: number;
  streak: number;
  subject: string;
}

type SupabaseResponse<T> = {
  data: T | null;
  error: any;
};

// Helper to get date string in YYYY-MM-DD format (local time)
const getDateKey = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// ===========================================================
// FUNCTION TO UPDATE DAILY ACTIVITY (streak, daily questions, etc.)
// ===========================================================
export const updateDailyActivity = async (
  questionsAdded: number,
  accuracy: number,
  goalsCompleted: string[] = [],
  xpAdded: number = 0
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    const today = new Date();
    const todayKey = getDateKey(today);
    await supabase.rpc("update_daily_activity", {
      p_user_id: user.id,
      p_date: todayKey,
      p_questions_added: questionsAdded,
      p_accuracy: accuracy,
      p_goals_completed: goalsCompleted,
      p_xp_added: xpAdded
    });
  } catch (err) {
    console.error("❌ [updateDailyActivity] Failed:", err);
  }
};

// ===========================================================
// FUNCTION TO UPDATE TOPIC MASTERY (per question, per topic)
// ===========================================================
export const updateTopicMastery = async (
  subject: string,
  topic: string,
  correct: boolean
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.rpc("update_topic_mastery", {
      p_user_id: user.id,
      p_subject: subject,
      p_topic: topic,
      p_correct: correct
    });
  } catch (err) {
    console.error("❌ [updateTopicMastery] Failed:", err);
  }
};

// ===========================================================
// FUNCTION TO UPDATE SUBJECT PERFORMANCE (BEST/WORST SCORES)
// ===========================================================
export const updateSubjectPerformance = async (
  subject: string,
  score: number,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    console.log(`Updating performance for ${subject}: ${score}%`);
    await supabase.rpc("update_subject_performance", {
      p_user_id: user.id,
      p_subject: subject,
      p_score: score
    });
  } catch (err) {
    console.error("❌ [updateSubjectPerformance] Failed:", err);
  }
};

// ===========================================================
// GET SUBJECT PERFORMANCE DATA
// ===========================================================
export const getSubjectPerformance = async (): Promise<
  SubjectPerformance[]
> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("subject_performance")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("❌ [getSubjectPerformance] Failed:", err);
    return [];
  }
};

// ===========================================================
// GET DAILY ACTIVITY DATA
// ===========================================================
export const getDailyActivity = async (): Promise<DailyActivity[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("daily_activity")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(7);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("❌ [getDailyActivity] Failed:", err);
    return [];
  }
};

// ===========================================================
// GET TODAY'S DAILY ACTIVITY
// ===========================================================
export const getTodayActivity = async (): Promise<DailyActivity | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const todayKey = getDateKey(new Date());

    const { data, error } = await supabase
      .from("daily_activity")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayKey)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("❌ [getTodayActivity] Failed:", err);
    return null;
  }
};

// ===========================================================
// FUNCTION TO UPDATE WEAK TOPIC PROGRESS (legacy, kept for compatibility)
// ===========================================================
export const updateWeakestTopic = async (
  subject: string,
  topicPerformance: Record<
    string,
    { subject: string; correct: number; total: number }
  >
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    console.log("=== updateWeakestTopic STARTED ===");
    console.log("Subject input:", subject);
    console.log("Topic performance object:", topicPerformance);

    // Step 1: Update ALL topics using new topic_mastery
    for (const [key, data] of Object.entries(topicPerformance)) {
      if (data.subject === subject && data.total > 0) {
        const topic = key.includes(":") ? key.split(":")[1] : key;
        // Update for each question in topic
        for (let i = 0; i < data.total; i++) {
          const isCorrect = i < data.correct;
          await updateTopicMastery(subject, topic, isCorrect);
        }
      }
    }

    // Step 2: Also update legacy topic_progress (for compatibility)
    let weakestTopic: {
      topic: string;
      correct: number;
      total: number;
      accuracy: number;
    } | null = null;

    for (const [key, data] of Object.entries(topicPerformance)) {
      if (data.subject === subject && data.total > 0) {
        const topic = key.includes(":") ? key.split(":")[1] : key;
        const accuracy = Math.round((data.correct / data.total) * 100);

        if (accuracy < 50 && (
          !weakestTopic || accuracy < weakestTopic.accuracy
        )) {
          weakestTopic = { topic, ...data, accuracy };
        }
      }
    }

    if (!weakestTopic) {
      await supabase.from("topic_progress").delete().eq("user_id", user.id).eq("subject", subject);
      return;
    }

    const { data: existing } = await supabase.from("topic_progress").select("*").eq("user_id", user.id).eq("subject", subject).maybeSingle();

    const newAccuracy = weakestTopic.accuracy;

    if (existing) {
      if (existing.accuracy <= newAccuracy) return;
      await supabase.from("topic_progress").update({
        topic: weakestTopic.topic,
        correct: weakestTopic.correct,
        incorrect: weakestTopic.total - weakestTopic.correct,
        total: weakestTopic.total,
        accuracy: newAccuracy,
        last_attempt_at: new Date().toISOString()
      }).eq("id", existing.id);
    } else {
      await supabase.from("topic_progress").insert({
        user_id: user.id,
        subject: subject,
        topic: weakestTopic.topic,
        correct: weakestTopic.correct,
        incorrect: weakestTopic.total - weakestTopic.correct,
        total: weakestTopic.total,
        accuracy: newAccuracy,
        last_attempt_at: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error("❌ [updateWeakestTopic] Failed:", err);
  }
};

// ===========================================================
// Get detailed topic stats from topic_mastery
// ===========================================================
export const getDetailedTopicStats = async (): Promise<TopicStat[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    console.log("🔍 [getDetailedTopicStats] Fetching for user:", user.id);

    const { data, error } = await supabase
      .from("topic_mastery")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ [getDetailedTopicStats] Error:", error);
      return [];
    }

    console.log("✅ [getDetailedTopicStats] Retrieved:", data);

    const topics: TopicStat[] = (data || []).map((tm) => ({
      id: `${tm.subject}:${tm.topic}`,
      name: tm.topic,
      subject: tm.subject,
      accuracy: Math.round(tm.accuracy),
      mastery_level: tm.mastery_level
    }));

    return topics;
  } catch (err) {
    console.error("❌ [getDetailedTopicStats] Failed:", err);
    return [];
  }
};

// ===========================================================
// Get quiz sessions history
// ===========================================================
export const getQuizSessions = async (): Promise<QuizSessionData[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("quiz_sessions")
    .select("id, subject, accuracy, correct, total, created_at, mode")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
};

// ===========================================================
// Submit quiz session
// ===========================================================
export const submitQuizSession = async (
  mode: "practice" | "mock",
  subject: string,
  questionIds: string[],
  clientAnswers: Record<number, number>,
  timeTakenSeconds: number,
  correctCount?: number,
  totalQuestions?: number,
  topicPerformance?: Record<string, any>
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const answersJson: Record<number, number> = {};
  Object.entries(clientAnswers).forEach(([index, answer]) => {
    answersJson[parseInt(index)] = answer;
  });

  const finalTotal = totalQuestions || questionIds.length;
  const finalCorrect = correctCount !== undefined ? correctCount : 0;
  const finalAccuracy = finalTotal > 0 ? (finalCorrect / finalTotal) * 100 : 0;

  const { data, error } = (await supabase.rpc("submit_quiz_session", {
    p_user_id: user.id,
    p_mode: mode,
    p_subject: subject,
    p_question_ids: questionIds,
    p_client_answers: answersJson,
    p_time_taken_secs: timeTakenSeconds,
    p_frontend_correct: finalCorrect,
    p_frontend_accuracy: finalAccuracy,
    p_topic_performance: topicPerformance || {},
  })) as SupabaseResponse<QuizSubmissionData>;

  if (error) {
    console.error("❌ [submitQuizSession] RPC Error:", error);
    throw error;
  }

  if (!data) throw new Error("Failed to submit session");

  // Update weakest topic & topic mastery
  if (topicPerformance) {
    await updateWeakestTopic(subject, topicPerformance);
  }

  // Update subject performance
  await updateSubjectPerformance(subject, finalAccuracy);

  // Update daily activity
  await updateDailyActivity(finalTotal, finalAccuracy, [], Math.round(finalAccuracy / 2));

  // Get new streak from DB (via daily activity)
  const todayActivity = await getTodayActivity();

  return {
    session_id: data.session_id,
    correct: data.correct,
    total: data.total,
    accuracy: Math.min(data.accuracy, 100),
    streak: todayActivity?.streak || 0,
    subject
  };
};

