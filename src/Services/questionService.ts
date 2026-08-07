// src/Services/questionService.ts

import { supabase } from "../lib/supabase";
import type { PostgrestFilterBuilder } from "@supabase/supabase-js";
import type { Question } from "../Types";
import { getLocalQuestions } from "../Data/Questions";

// Helper to normalize subject names to match the database enum
const normalizeSubject = (subject: string): string => {
  const lower: string = subject.toLowerCase();
  if (lower === "crs") return "CRS";
  if (lower === "irs") return "IRS";
  if (lower === "literature") return "Literature";
  return subject;
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Difficulty = "Easy" | "Medium" | "Hard";

type DbOptionShape = { a?: string; b?: string; c?: string; d?: string };

interface DbQuestionRow {
  id?: string | number;
  subject?: string;
  year?: string | number;
  examyear?: string | number;
  difficulty?: string;
  text?: string;
  question?: string;
  instruction?: string;
  section?: string;
  passage?: string;
  explanation?: string;
  solution?: string;
  topic?: string;
  options?: string[] | string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option?: DbOptionShape;
  answer?: number | string;
  answer_index?: number;
}

interface UserSeenQuestionRow {
  question_id: string;
}

const MIN_YEAR = 2010;
const MAX_YEAR = 2025;

// ── Helpers ───────────────────────────────────────────────────────────────────

const shuffleOptions = (
  options: string[],
  correctIndex: number,
): { shuffled: string[]; newIndex: number } => {
  const arr = options.map((opt, i) => ({ opt, originalIndex: i }));

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return {
    shuffled: arr.map((item) => item.opt),
    newIndex: arr.findIndex((item) => item.originalIndex === correctIndex),
  };
};

const mapDbToQuestion = (row: DbQuestionRow, subject: string): Question => {
  let rawOptions: string[] = [];
  try {
    if (Array.isArray(row.options)) {
      rawOptions = row.options;
    } else if (typeof row.options === "string" && row.options.startsWith("{")) {
      rawOptions = row.options
        .slice(1, -1)
        .split(",")
        .map((s: string) => s.trim().replace(/^"|"$/g, ""));
    } else if (row.option_a) {
      // NOTE: .filter(Boolean) doesn't narrow (string | undefined)[] -> string[]
      // in TypeScript's eyes, so we use an explicit type predicate instead.
      rawOptions = [row.option_a, row.option_b, row.option_c, row.option_d].filter(
        (opt): opt is string => Boolean(opt),
      );
    } else if (row.option && row.option.a) {
      rawOptions = [row.option.a, row.option.b, row.option.c, row.option.d].filter(
        (opt): opt is string => Boolean(opt),
      );
    }
  } catch (e) {
    console.warn("[mapDbToQuestion] Error parsing options:", e);
  }

  let rawAnswer = 0;
  try {
    if (typeof row.answer === "number") rawAnswer = row.answer;
    else if (typeof row.answer_index === "number") rawAnswer = row.answer_index;
    else if (typeof row.answer === "string") {
      const lower = row.answer.toLowerCase();
      const idx = ["a", "b", "c", "d", "e"].indexOf(lower);
      rawAnswer = idx >= 0 ? idx : parseInt(row.answer, 10) || 0;
    }
  } catch (e) {
    console.warn("[mapDbToQuestion] Error parsing answer:", e);
  }

  const { shuffled, newIndex } = shuffleOptions(rawOptions, rawAnswer);

  return {
    id: row.id?.toString() ?? "",
    subject: (row.subject ?? subject) as Question["subject"],
    year: parseInt(String(row.year ?? row.examyear ?? "2023"), 10),
    difficulty: (row.difficulty ?? "Medium") as Question["difficulty"],
    text: row.text ?? row.question ?? "Question text missing",
    instruction: row.instruction ?? row.section ?? row.passage ?? "",
    options: shuffled.length > 0 ? shuffled : ["Option A", "Option B", "Option C", "Option D"],
    answer: newIndex >= 0 ? newIndex : 0,
    explanation: row.explanation ?? row.solution ?? "No explanation available.",
    topic: row.topic ?? "General",
  };
};

function resolveYear(year: string | number | null | undefined): number | null {
  if (!year) return null;
  const s = year.toString();
  if (s.toLowerCase().includes("random") || s === "") return null;
  const n = parseInt(s, 10);
  if (isNaN(n)) return null;
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, n));
}

function resolveDifficulty(d: string | undefined): Difficulty | undefined {
  if (!d || d === "All") return undefined;
  const map: Record<string, Difficulty> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };
  return map[d.toLowerCase()];
}

// ── Random-slice fetcher ───────────────────────────────────────────────────────
async function fetchRandomSlice(

  // PostgrestFilterBuilder generic signature is version-fragile (it changed
  // shape between supabase-js versions and now requires 4-8 type args).
  // Typing this precisely would break on the next supabase-js upgrade, so
  // we deliberately keep it loose here rather than chase the exact generics.
  applyFilters: <Q extends PostgrestFilterBuilder<any, any, any, any>>(q: Q) => Q,
  fetchSize: number,
): Promise<DbQuestionRow[]> {
  const countBuilder = applyFilters(
    supabase.from("questions").select("id", { count: "exact", head: true }),
  );
  const { count } = await countBuilder;

  const total = count ?? 0;
  if (total === 0) return [];

  const windowSize = Math.min(fetchSize, total);
  const maxOffset = Math.max(0, total - windowSize);
  const randomOffset = Math.floor(Math.random() * (maxOffset + 1));

  const dataBuilder = applyFilters(supabase.from("questions").select("*"));
  const { data } = await dataBuilder.range(randomOffset, randomOffset + windowSize - 1);

  return (data ?? []) as DbQuestionRow[];
}

// ── Recently-seen tracking (opt-in, additive) ──────────────────────────────────

/**
 * Fetch this user's question IDs seen TODAY (resets naturally at local midnight)
 * for a given subject + topic, so callers can pass them as `excludeIds`.
 * Returns [] silently on any error or if logged out — never blocks a quiz.
 */
export async function getRecentlySeenQuestionIds(
  subject: string,
  topic: string = "All",
): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const formattedSubject =
      subject.trim().charAt(0).toUpperCase() + subject.trim().slice(1).toLowerCase();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let q = supabase
      .from("user_seen_questions")
      .select("question_id")
      .eq("user_id", user.id)
      .eq("subject", normalizeSubject(formattedSubject))
      .gte("seen_at", startOfToday.toISOString());

    if (topic && topic !== "All") {
      q = q.eq("topic", topic);
    } else {
      q = q.is("topic", null);
    }

    const { data, error } = await q;

    if (error) {
      console.warn("[getRecentlySeenQuestionIds] error:", error.message);
      return [];
    }
    return (data ?? []).map((r: UserSeenQuestionRow) => r.question_id);
  } catch (err) {
    console.error("[getRecentlySeenQuestionIds]", err);
    return [];
  }
}

/**
 * Record question IDs the user was just shown, tagged by subject + topic,
 * so today's exclusion list can be looked up later. Fire-and-forget —
 * never throws, never blocks the quiz.
 *
 * Also performs an occasional lazy purge of old rows (~5% of calls), so the
 * table stays small even without a Supabase Cron Job configured. This purge
 * is a safety net only — see the SQL Cron Job option below for the primary
 * cleanup path.
 */
export async function recordSeenQuestions(
  subject: string,
  questionIds: string[],
  topic: string = "All",
): Promise<void> {
  if (questionIds.length === 0) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const formattedSubject =
      subject.trim().charAt(0).toUpperCase() + subject.trim().slice(1).toLowerCase();

    const rows = questionIds.map((qid) => ({
      user_id: user.id,
      question_id: qid,
      subject: normalizeSubject(formattedSubject),
      topic: topic && topic !== "All" ? topic : null,
    }));

    const { error } = await supabase.from("user_seen_questions").insert(rows);
    if (error) console.warn("[recordSeenQuestions] error:", error.message);

    // Lazy purge safety net — fires ~5% of the time, never awaited,
    // never blocks or slows down the quiz. Deletes anything older than 2 days.
    if (Math.random() < 0.05) {
      (async () => {
        try {
          await supabase
            .from("user_seen_questions")
            .delete()
            .lt("seen_at", new Date(Date.now() - 2 * 86400_000).toISOString());
        } catch {
          // best-effort cleanup, safe to ignore failures
        }
      })();
    }
  } catch (err) {
    console.error("[recordSeenQuestions]", err);
  }
}

// ── Main service function ─────────────────────────────────────────────────────

export const fetchQuestionsWithFallback = async (
  subject: string,
  year: string | number,
  requiredCount: number,
  difficulty: string = "All",
  excludeIds: string[] = [],
): Promise<Question[]> => {
  const formattedSubject =
    subject.trim().charAt(0).toUpperCase() + subject.trim().slice(1).toLowerCase();
  const resolvedYear = resolveYear(year);
  const resolvedDiff =
    difficulty === "All"
      ? undefined
      : ((difficulty.trim().charAt(0).toUpperCase() +
        difficulty.trim().slice(1).toLowerCase()) as Difficulty);
  const fetchedIds = new Set<string>(excludeIds);
  const finalQuestions: Question[] = [];
  const seenContent = new Set<string>();

  console.log("🚀 [questionService] fetch params:", {
    subject: formattedSubject,
    year: resolvedYear ?? (typeof year === "string" ? year : "Random"),
    difficulty: resolvedDiff ?? "All",
    required: requiredCount,
    excluding: excludeIds.length,
  });

  const fetchForYearAndDiff = async (
    targetYear: number | null,
    targetDiff: Difficulty | undefined,
    needed: number,
  ): Promise<Question[]> => {
    const applyFilters = (q: any) => {
      let query = q.eq("subject", normalizeSubject(formattedSubject));

      if (targetYear !== null) {
        query = query.eq("year", targetYear);
      } else {
        query = query.gte("year", MIN_YEAR).lte("year", MAX_YEAR);
      }

      if (targetDiff) {
        query = query.eq("difficulty", targetDiff);
      }

      // FIX: previously filtered IDs down to numeric-only, which silently
      // dropped every UUID and disabled exclusion entirely. Question IDs
      // are UUIDs in this schema, so they're used as-is.
      if (fetchedIds.size > 0) {
        const idList = Array.from(fetchedIds);
        if (idList.length > 0) {
          query = query.not("id", "in", `(${idList.join(",")})`);
        }
      }
      return query;
    };

    const data = await fetchRandomSlice(applyFilters, needed * 10);
    const results: Question[] = [];

    if (data.length > 0) {
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      for (const row of shuffled) {
        const mapped = mapDbToQuestion(row, formattedSubject);
        const contentKey = mapped.text.trim().toLowerCase();

        if (!fetchedIds.has(mapped.id) && !seenContent.has(contentKey)) {
          fetchedIds.add(mapped.id);
          seenContent.add(contentKey);
          results.push(mapped);
        }
      }
    }
    return results;
  };

  try {
    // ── TIER 1: Primary Attempt ─────────
    if (finalQuestions.length < requiredCount) {
      const needed = requiredCount - finalQuestions.length;
      const results = await fetchForYearAndDiff(resolvedYear, resolvedDiff, needed);
      finalQuestions.push(...results);
      console.log(`🎯 [Tier 1] Got ${results.length} questions`);
    }

    // ── TIER 2: Nearby Years ────────────────────────
    if (finalQuestions.length < requiredCount && resolvedYear !== null) {
      const nearbyYears: number[] = [];
      let offset = 1;
      while (nearbyYears.length < MAX_YEAR - MIN_YEAR) {
        const higher: number = resolvedYear + offset;
        const lower: number = resolvedYear - offset;

        if (higher <= MAX_YEAR) nearbyYears.push(higher);
        if (lower >= MIN_YEAR && lower !== resolvedYear) nearbyYears.push(lower);

        offset++;
        if (higher > MAX_YEAR && lower < MIN_YEAR) break;
      }

      console.log(`🔍 [Tier 2] Trying nearby years:`, nearbyYears);

      for (const yr of nearbyYears) {
        if (finalQuestions.length >= requiredCount) break;
        const needed = requiredCount - finalQuestions.length;
        const results = await fetchForYearAndDiff(yr, resolvedDiff, needed);
        finalQuestions.push(...results);
        console.log(`🔍 [Tier 2] Year ${yr}: Got ${results.length} questions`);
      }
    }

    // ── TIER 3: Relax Difficulty ──────────────────────
    if (finalQuestions.length < requiredCount && resolvedYear !== null && resolvedDiff) {
      const needed = requiredCount - finalQuestions.length;
      const results = await fetchForYearAndDiff(resolvedYear, undefined, needed);
      finalQuestions.push(...results);
      console.log(`🎯 [Tier 3] Relaxed difficulty: Got ${results.length} questions`);
    }

    // ── TIER 4: Any Year, Any Difficulty ───────────────────────────────────
    if (finalQuestions.length < requiredCount) {
      const needed = requiredCount - finalQuestions.length;
      const results = await fetchForYearAndDiff(null, undefined, needed);
      finalQuestions.push(...results);
      console.log(`🎯 [Tier 4] Any year/any difficulty: Got ${results.length} questions`);
    }

    // ── TIER 5: Local Data ──────────────────────────────────────────────────
    if (finalQuestions.length < requiredCount) {
      const remaining = requiredCount - finalQuestions.length;
      console.log(`📦 [Tier 5] Pulling ${remaining} from local data`);

      const local = getLocalQuestions(subject, resolvedYear ?? "Random", requiredCount * 2);
      for (const q of local) {
        if (finalQuestions.length >= requiredCount) break;
        if (!fetchedIds.has(q.id)) {
          fetchedIds.add(q.id);
          finalQuestions.push(q);
        }
      }
    }

    console.log(`🎁 [questionService] Returning ${finalQuestions.length} questions total`);
    return finalQuestions.slice(0, requiredCount).sort(() => Math.random() - 0.5);
  } catch (err) {
    console.error("🔥 [questionService] Critical failure:", err);
    return getLocalQuestions(subject, resolvedYear ?? "Random", requiredCount);
  }
};

// ── Topic list (unchanged) ─────────────────────────────────────────────────────

export const LIKELY_TOPICS: Record<string, string[]> = {
  English: ["Vocabulary", "Phonetics", "Grammar", "Comprehension", "Novel", "Cloze Passage", "Spelling"],
  Mathematics: ["Algebra", "Geometry", "Arithmetic", "Statistics", "Calculus  ", "Probability"],
  Physics: [
    "Astronomy", "Atomic Physics", "Biology/Optics", "Current Electricity", "Elasticity",
    "Electric Fields", "Electrochemistry", "Electromagnetic Induction", "Electromagnetic Spectrum",
    "Electromagnetism", "Electrostatics", "Energy Quantization", "Fields", "Gases",
    "Gravitational Field", "Gravitational Fields", "Heat Energy", "Hydrostatics", "Magnetism",
    "Measurement", "Mechanics", "Meteorology", "Modern Physics", "Optics", "States of Matter",
    "Thermal Expansion", "Thermal Physics", "Units and Measurements", "Waves",
  ],
  Chemistry: [
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Atomic Structure",
    "Industrial Chemistry",
    "Stoichiometry",
    "Gas Laws",
    "Electrochemistry",
    "Acids and Bases",
    "Chemical Bonding",
    "Redox Reactions",
    "Periodic Table",
    "Analytical Chemistry",
    "Thermodynamics",
    "Environmental Chemistry",
    "Solutions",
    "Physical Chemistry",
    "States of Matter",
    "Water Chemistry",
    "Chemical Equilibrium",
    "Chemical Kinetics",
    "Polymers",
  ],
  Biology: [
    "Ecology", "Genetics", "Cell Biology", "Adaptation", "Reproduction", "Zoology",
    "Plant Physiology", "Classification", "Health", "Excretory System", "Physiology",
    "Circulatory System", "Nutrition", "Botany", "Evolution", "Microbiology", "Nervous System",
    "Respiratory System", "Endocrine System", "Digestive System", "Photosynthesis", "General",
  ],
  Economics: [
    "Agricultural Economics", "Business Finance", "Business Organizations", "Consumer Behaviour",
    "Demand", "Demand and Supply", "Development Economics", "Distribution", "Economic Analysis",
    "Economic Growth", "Economic Systems", "Elasticity", "Environmental Economics",
    "Factors of Production", "Financial Institutions", "General Knowledge", "Industrialization",
    "Inflation", "International Organizations", "International Trade", "Introduction to Economics",
    "Labour Economics", "Land Economics", "Location of Industries", "Macroeconomics",
    "Market Mechanisms", "Market Structures", "Marketing", "Mathematics", "Methodology",
    "Monetary Economics", "Monetary Policy", "Money and Banking", "Money Market", "National Income",
    "Natural Resources", "Petroleum Economics", "Population", "Price Control", "Price System",
    "Price Theory", "Production", "Production Possibility Frontier", "Production Theory",
    "Production/Costs", "Public Finance", "Statistics", "Supply", "Supply/Demand", "Unemployment",
  ],
  Government: [
    "Arms of Government", "Citizenship", "Colonial Administration", "Constitutions", "Democracy",
    "Economic Policy", "Elections", "Foreign Policy", "Geography", "History",
    "International Organizations", "International Relations", "Nigerian Foreign Policy",
    "Nigerian Government", "Political Ideologies", "Political Parties", "Political Science",
    "Pressure Groups", "Public Administration", "Public Opinion", "Systems of Government",
  ],
  Literature: [
    "1984", "Animal Farm", "Attahiru", "Drama", "Faceless", "Hamlet", "Harvest of Corruption",
    "Legal/Publishing", "Literary Appreciation", "Literary Authors", "Literary Principles",
    "Lonely Days", "Macbeth", "Morountodun", "Native Son", "Othello", "Phonetics", "Poetry",
    "Prose", "The Joy of Motherhood", "The New Man", "The Wives Revolt", "Twelfth Night",
    "Witnesses to Tears",
  ],
  Geography: ["Physical Geography", "Human Geography", "Map Reading", "Regional Geography"],
  CRS: ["Old Testament", "New Testament"],
  Commerce: [
    "Business Organization", "International Trade", "Finance", "Business Documents",
    "Production", "Business Law", "Marketing", "Banking", "Distribution",
  ],
  History: [
    "Pre-Colonial Africa", "Colonial Rule", "Independence Movements", "Post-Independence",
    "Nigerian History",
  ],
  IRS: ["Tawheed", "Seerah", "Fiqh", "Hadith", "Quranic Studies"],
};

export const normalizeTopicName = (topic: string, subject: string): string => {
  const subjectTopics = LIKELY_TOPICS[subject] || [];
  const topicLower = topic.toLowerCase();

  for (const validTopic of subjectTopics) {
    if (validTopic.toLowerCase() === topicLower) {
      return validTopic;
    }
  }

  for (const validTopic of subjectTopics) {
    if (validTopic.toLowerCase().includes(topicLower) || topicLower.includes(validTopic.toLowerCase())) {
      return validTopic;
    }
  }

  const topicWords = topicLower.split(" ");
  for (const validTopic of subjectTopics) {
    const validWords = validTopic.toLowerCase().split(" ");
    const hasMatch = topicWords.some((tWord) => validWords.some((vWord) => tWord === vWord));
    if (hasMatch) {
      return validTopic;
    }
  }

  return topic.charAt(0).toUpperCase() + topic.slice(1);
};

export const fetchTopicsBySubject = async (subject: string): Promise<string[]> => {
  try {
    const formattedSubject =
      subject.trim().charAt(0).toUpperCase() + subject.trim().slice(1).toLowerCase();
    const { data, error } = await supabase
      .from("questions")
      .select("topic")
      .eq("subject", normalizeSubject(formattedSubject))
      .gte("year", MIN_YEAR)
      .lte("year", MAX_YEAR);

    if (error) {
      console.warn("[fetchTopicsBySubject] DB error:", error.message);
    }

    const dbTopics = data
      ? (Array.from(
        new Set(data.map((r) => normalizeTopicName(r.topic || "", formattedSubject)).filter(Boolean)),
      ) as string[])
      : [];

    const fallbackTopics = LIKELY_TOPICS[formattedSubject] ?? [];
    return Array.from(new Set([...dbTopics, ...fallbackTopics])).sort();
  } catch (err) {
    console.error("[fetchTopicsBySubject]", err);
    const formattedSubject =
      subject.trim().charAt(0).toUpperCase() + subject.trim().slice(1).toLowerCase();
    return LIKELY_TOPICS[formattedSubject] ?? [];
  }
};

export const fetchAllQuestionsForBrowse = async (
  subject?: string,
  year?: string | number,
  topic?: string,
  difficulty?: string,
): Promise<Question[]> => {
  try {
    let q = supabase.from("questions").select("*").gte("year", MIN_YEAR).lte("year", MAX_YEAR);

    if (subject && subject !== "All") {
      const formattedSubject =
        subject.trim().charAt(0).toUpperCase() + subject.trim().slice(1).toLowerCase();
      q = q.eq("subject", normalizeSubject(formattedSubject));
    }

    if (year && year !== "All") {
      const resolvedYear = resolveYear(year);
      if (resolvedYear !== null) {
        q = q.eq("year", resolvedYear);
      }
    }

    if (topic && topic !== "All") {
      q = q.eq("topic", topic);
    }

    const resolvedDiff = resolveDifficulty(difficulty);
    if (resolvedDiff) {
      q = q.eq("difficulty", resolvedDiff);
    }

    // FIX: a single unbounded `await q` silently truncates at Supabase's
    // default 1000-row cap with no error thrown — it just looks like a
    // smaller dataset than actually exists (e.g. "All Subjects" reporting
    // 977 when the real total across subjects is in the thousands).
    // Loop in fixed-size batches via .range() until a batch comes back
    // shorter than the batch size — that's the only reliable signal that
    // we've reached the actual end of the result set.
    const BATCH_SIZE = 1000;
    let allRows: DbQuestionRow[] = [];
    let batchOffset = 0;

    while (true) {
      const { data, error } = await q.range(batchOffset, batchOffset + BATCH_SIZE - 1);

      if (error) {
        console.error("[fetchAllQuestionsForBrowse] Error:", error);
        break;
      }

      const batch = (data ?? []) as DbQuestionRow[];
      allRows = allRows.concat(batch);

      if (batch.length < BATCH_SIZE) break;
      batchOffset += BATCH_SIZE;
    }

    const data = allRows;

    if (data.length > 0) {
      const seenContent = new Set<string>();
      const finalQuestions: Question[] = [];

      for (const row of data) {
        const mapped = mapDbToQuestion(row, row.subject ?? "Unknown");
        const contentKey = mapped.text.trim().toLowerCase();

        if (!seenContent.has(contentKey)) {
          seenContent.add(contentKey);
          finalQuestions.push(mapped);
        }
      }

      return finalQuestions;
    }

    return [];
  } catch (err) {
    console.error("[fetchAllQuestionsForBrowse] Critical failure:", err);
    return [];
  }
};

export const fetchQuestionsByTopic = async (
  subject: string,
  topic: string,
  limit: number = 10,
  difficulty: string = "All",
  excludeIds: string[] = [],
): Promise<Question[]> => {
  try {
    const actualLimit = topic.toLowerCase() === "novel" ? Math.min(limit, 10) : limit;
    const formattedSubject =
      subject.trim().charAt(0).toUpperCase() + subject.trim().slice(1).toLowerCase();
    const resolvedDiff = resolveDifficulty(difficulty);

    const applyFilters = (q: any) => {
      let query = q
        .eq("subject", normalizeSubject(formattedSubject))
        .eq("topic", topic)
        .gte("year", MIN_YEAR)
        .lte("year", MAX_YEAR);

      if (resolvedDiff) query = query.eq("difficulty", resolvedDiff);

      // FIX: same issue as above — no numeric filter, IDs are UUIDs
      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }
      return query;
    };

    const data = await fetchRandomSlice(applyFilters, actualLimit * 5);

    if (data.length > 0) {
      const fetchedIds = new Set<string>(excludeIds);
      const seenContent = new Set<string>();
      const finalQuestions: Question[] = [];

      const shuffled = [...data].sort(() => Math.random() - 0.5);

      for (const row of shuffled) {
        if (finalQuestions.length >= actualLimit) break;
        const mapped = mapDbToQuestion(row, formattedSubject);
        const contentKey = mapped.text.trim().toLowerCase();

        if (!fetchedIds.has(mapped.id) && !seenContent.has(contentKey)) {
          fetchedIds.add(mapped.id);
          seenContent.add(contentKey);
          finalQuestions.push(mapped);
        }
      }
      return finalQuestions;
    }

    return fetchQuestionsWithFallback(formattedSubject, "Random", actualLimit, difficulty, excludeIds);
  } catch (err) {
    console.error("[fetchQuestionsByTopic]", err);
    const formattedSubject =
      subject.trim().charAt(0).toUpperCase() + subject.trim().slice(1).toLowerCase();
    return fetchQuestionsWithFallback(formattedSubject, "Random", limit, difficulty, excludeIds);
  }
};