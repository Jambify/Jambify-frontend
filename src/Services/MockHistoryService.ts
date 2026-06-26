import { supabase } from "../lib/supabase";
import type { ExamResult } from "../utils/examCalculations";

export interface MockHistoryEntry {
  id: string;
  taken_at: string;
  jamb_score: number;
  total_correct: number;
  total_questions: number;
  accuracy: number;
  time_taken_secs: number;
  subjects: string[];
  subject_scores: Record<string, {
    correct: number;
    total: number;
    score: number;
  }>;
}

export const saveMockExamHistory = async (
  result: ExamResult,
  timeTakenSecs: number,
): Promise<string | null> => {
  console.log("🔵 [saveMockExamHistory] Called with:", {
    jambScore: result.jambScore,
    totalCorrect: result.totalCorrect,
    totalQuestions: result.totalQuestions,
    percentageScore: result.percentageScore,
    timeTakenSecs,
    subjectBreakdownCount: result.subjectBreakdown?.length,
    subjectBreakdown: result.subjectBreakdown,
  });

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("❌ [saveMockExamHistory] Auth error:", authError);
      return null;
    }
    if (!user) {
      console.error("❌ [saveMockExamHistory] No authenticated user found");
      return null;
    }

    console.log("✅ [saveMockExamHistory] User authenticated:", user.id);

    // Build subject_scores map from subjectBreakdown
    const subjectScores: Record<string, { correct: number; total: number; score: number }> = {};
    result.subjectBreakdown.forEach((sb) => {
      subjectScores[sb.subject] = {
        correct: sb.correct,
        total: sb.total,
        score: sb.score,
      };
    });

    const subjects = result.subjectBreakdown.map(sb => sb.subject);

    const payload = {
      p_user_id:         user.id,
      p_jamb_score:      result.jambScore,
      p_total_correct:   result.totalCorrect,
      p_total_questions: result.totalQuestions,
      p_accuracy:        result.percentageScore,
      p_time_taken_secs: timeTakenSecs,
      p_subjects:        subjects,
      p_subject_scores:  subjectScores,
    };

    console.log("🔵 [saveMockExamHistory] RPC payload:", JSON.stringify(payload, null, 2));

    const { data, error } = await supabase.rpc("save_mock_exam_history", payload);

    if (error) {
      console.error("❌ [saveMockExamHistory] RPC error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return null;
    }

    console.log("✅ [saveMockExamHistory] Saved successfully, new ID:", data);
    return data as string;
  } catch (err) {
    console.error("❌ [saveMockExamHistory] Unexpected error:", err);
    return null;
  }
};

export const getMockExamHistory = async (): Promise<MockHistoryEntry[]> => {
  console.log("🔵 [getMockExamHistory] Fetching...");

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("❌ [getMockExamHistory] Auth error:", authError);
      return [];
    }
    if (!user) {
      console.error("❌ [getMockExamHistory] No authenticated user");
      return [];
    }

    console.log("✅ [getMockExamHistory] Fetching for user:", user.id);

    const { data, error } = await supabase
      .from("mock_exam_history")
      .select("*")
      .eq("user_id", user.id)
      .order("taken_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("❌ [getMockExamHistory] Query error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return [];
    }

    console.log(`✅ [getMockExamHistory] Found ${data?.length ?? 0} entries:`, data);
    return (data as MockHistoryEntry[]) || [];
  } catch (err) {
    console.error("❌ [getMockExamHistory] Unexpected error:", err);
    return [];
  }
};