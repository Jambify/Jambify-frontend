
import { supabase } from "../lib/supabase";
import { normalizeTopicName } from "./questionService";

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


const getLocalDateStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getYesterdayStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};



// Calculate and update streak
// ===========================================================
// STREAK — uses last_active_date DATE column as single source of truth
// Popup shows at every 7-day interval (7, 14, 21, 28...)
// Misses a day → resets to 0
// ===========================================================
export const calculateAndUpdateStreak = async (
  isQuizSubmission = false
): Promise<{ streak: number; shouldShowPopup: boolean }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { streak: 0, shouldShowPopup: false };

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("streak, last_active_date, last_seen_streak_popup")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile) return { streak: 0, shouldShowPopup: false };

    const todayStr = getLocalDateStr();
    const yesterdayStr = getYesterdayStr();

    const lastActiveDate = profile.last_active_date as string | null;
    const currentStreak = profile.streak || 0;
    const lastSeenStreakPopup = profile.last_seen_streak_popup || 0;

    let newStreak = currentStreak;
    let shouldShowPopup = false;
    let needsDbUpdate = false;

    // Already counted today — return immediately, no DB touch
    if (lastActiveDate === todayStr) {
      return { streak: currentStreak, shouldShowPopup: false };
    }

    if (isQuizSubmission) {
      if (!lastActiveDate) {
        // First quiz ever
        newStreak = 1;
      } else if (lastActiveDate === yesterdayStr) {
        // Consecutive day — increment
        newStreak = currentStreak + 1;
      } else {
        // Missed one or more days — reset to 1
        newStreak = 1;
      }

      needsDbUpdate = true;

      // ✅ Show popup at every 7-day interval (7, 14, 21, 28...)
      // and only if the user hasn't already seen this level
      if (newStreak % 7 === 0 && newStreak > lastSeenStreakPopup) {
        shouldShowPopup = true;
      }
    } else {
      // App load — check if streak needs resetting
      if (lastActiveDate && currentStreak > 0 && lastActiveDate < yesterdayStr) {
        // Last active was before yesterday — streak broken
        newStreak = 0;
        needsDbUpdate = true;
      }
    }

    if (needsDbUpdate) {
      await supabase
        .from("profiles")
        .update({
          streak: newStreak,
          last_active_date: isQuizSubmission ? todayStr : lastActiveDate,
          ...(shouldShowPopup && { last_seen_streak_popup: newStreak }),
        })
        .eq("id", user.id);
    }

    return { streak: newStreak, shouldShowPopup };
  } catch (err) {
    console.error("❌ [calculateAndUpdateStreak] Failed:", err);
    return { streak: 0, shouldShowPopup: false };
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

    // Use topic_progress table logic manually for compatibility
    const { data: existing } = await supabase
      .from("subject_performance")
      .select("*")
      .eq("user_id", user.id)
      .eq("subject", subject)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("subject_performance")
        .update({
          best_score: Math.max(existing.best_score, score),
          worst_score: Math.min(existing.worst_score, score),
          total_attempts: (existing.total_attempts || 0) + 1,
          last_score: score,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("subject_performance").insert({
        user_id: user.id,
        subject: subject,
        best_score: score,
        worst_score: score,
        total_attempts: 1,
        last_score: score,
      });
    }
  } catch (err) {
    console.error("❌ [updateSubjectPerformance] Failed:", err);
  }
};

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
// FUNCTION TO UPDATE WEAK TOPIC PROGRESS
// Only updates if new topic is weaker than existing one
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

    // Step 1: Find the weakest topic from the current quiz session for this subject
    let weakestTopic: {
      topic: string;
      correct: number;
      total: number;
      accuracy: number;
    } | null = null;

    for (const [key, data] of Object.entries(topicPerformance)) {
      console.log(`Processing key: ${key}, data.subject: ${data.subject}`);
      if (data.subject === subject && data.total > 0) {
        const rawTopic = key.includes(":") ? key.split(":")[1] : key;
        const topic = normalizeTopicName(rawTopic, subject);
        const accuracy = Math.round((data.correct / data.total) * 100);
        console.log(`Topic (raw): ${rawTopic}, Topic (normalized): ${topic}, Accuracy: ${accuracy}%`);

        // If accuracy >=50%, skip this topic entirely (don't track mastered topics)
        if (accuracy >= 50) {
          console.log(`Skipping topic ${topic} (accuracy ${accuracy} >= 50)`);
          continue;
        }

        if (
          !weakestTopic ||
          accuracy < weakestTopic.accuracy ||
          (accuracy === weakestTopic.accuracy && data.total > weakestTopic.total)
        ) {
          weakestTopic = {
            topic,
            correct: data.correct,
            total: data.total,
            accuracy,
          };
          console.log(`New weakest topic selected: ${JSON.stringify(weakestTopic)}`);
        }
      }
    }

    // If NO weak topics found (all >=50%), DELETE any existing row for this subject
    if (!weakestTopic) {
      console.log("No weak topics found! Deleting existing row if present...");
      const deleteResult = await supabase
        .from("topic_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("subject", subject);
      console.log("Delete result:", deleteResult);
      if (deleteResult.error) {
        console.error("❌ Delete error:", deleteResult.error);
      }
      return;
    }

    // Step 2: Check if we already have a weak topic for this subject
    const { data: existing } = await supabase
      .from("topic_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("subject", subject)
      .maybeSingle();

    console.log("Existing row in DB:", existing);

    const newAccuracy = weakestTopic.accuracy;

    if (existing) {
      // If existing topic's accuracy is better or same, do nothing
      if (existing.accuracy <= newAccuracy) {
        console.log(`Existing accuracy (${existing.accuracy}) <= new (${newAccuracy}) — doing nothing`);
        return;
      }

      console.log("Updating existing row with new weaker topic...");
      // Otherwise, update to the new weaker topic
      await supabase
        .from("topic_progress")
        .update({
          topic: weakestTopic.topic,
          correct: weakestTopic.correct,
          incorrect: weakestTopic.total - weakestTopic.correct,
          total: weakestTopic.total,
          accuracy: newAccuracy,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      console.log("Inserting new row for weakest topic...");
      // No existing topic, insert the new one
      const insertResult = await supabase
        .from("topic_progress")
        .insert({
          user_id: user.id,
          subject: subject,
          topic: weakestTopic.topic,
          correct: weakestTopic.correct,
          incorrect: weakestTopic.total - weakestTopic.correct,
          total: weakestTopic.total,
          accuracy: newAccuracy,
          last_attempt_at: new Date().toISOString(),
        });
      console.log("Insert result:", insertResult);
    }
  } catch (err) {
    console.error("❌ [updateWeakestTopic] Failed:", err);
  }
};

// ===========================================================
// Get detailed topic stats from topic_progress table
// (One topic per subject ONLY)
// ===========================================================
export const getDetailedTopicStats = async (): Promise<TopicStat[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    console.log("🔍 [getDetailedTopicStats] Fetching for user:", user.id);

    const { data, error } = await supabase
      .from("topic_progress")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ [getDetailedTopicStats] Error:", error);
      return [];
    }

    console.log("✅ [getDetailedTopicStats] Retrieved:", data);

    // Ensure only one topic per subject (though DB should enforce with unique constraint)
    const topics: TopicStat[] = (data || []).map((tp) => ({
      id: `${tp.subject}:${tp.topic}`,
      name: tp.topic,
      subject: tp.subject,
      accuracy: Math.round(tp.accuracy),
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
  topicPerformance?: Record<string, any>,
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

  // Update weakest topic
  if (topicPerformance) {
    await updateWeakestTopic(subject, topicPerformance);
  }

  // Update subject performance
  await updateSubjectPerformance(subject, finalAccuracy);

  // Calculate and update streak
  const { streak: newStreak, shouldShowPopup } = await calculateAndUpdateStreak(true);

  return {
    session_id: data.session_id,
    correct: data.correct,
    total: data.total,
    accuracy: Math.min(data.accuracy, 100),
    streak: newStreak,
    shouldShowPopup,
    subject
  };
};
