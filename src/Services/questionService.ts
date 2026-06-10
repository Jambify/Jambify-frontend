// src/Services/questionService.ts

import { supabase } from "../lib/supabase";
import type { Question } from "../Types";
import { getLocalQuestions } from "../Data/Questions";

// ── Types ─────────────────────────────────────────────────────────────────────
type Difficulty = "Easy" | "Medium" | "Hard";

// Valid years your DB actually has data for
// const VALID_YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;
const MIN_YEAR = 2016;
const MAX_YEAR = 2025;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Fisher-Yates shuffle that also tracks the correct answer index.
 */
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

/**
 * Normalises a DB row (any shape) into the internal Question type.
 */
const mapDbToQuestion = (row: any, subject: string): Question => {
  // Extract options from various possible formats
  let rawOptions: string[] = [];
  try {
    if (Array.isArray(row.options)) {
      rawOptions = row.options;
    } else if (typeof row.options === "string" && row.options.startsWith("{")) {
      // Handle Postgres array string format "{a,b,c}" if needed
      rawOptions = row.options
        .slice(1, -1)
        .split(",")
        .map((s: string) => s.trim().replace(/^"|"$/g, ""));
    } else if (row.option_a) {
      rawOptions = [
        row.option_a,
        row.option_b,
        row.option_c,
        row.option_d,
      ].filter(Boolean);
    } else if (row.option && row.option.a) {
      rawOptions = [
        row.option.a,
        row.option.b,
        row.option.c,
        row.option.d,
      ].filter(Boolean);
    }
  } catch (e) {
    console.warn("[mapDbToQuestion] Error parsing options:", e);
  }

  // Extract correct-answer index
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

  // Ensure ID is a string, but note that the DB expects UUID format
  // If it's a local question with a non-UUID ID, it might fail DB operations
  return {
    id: row.id?.toString() ?? "",
    subject: (row.subject ?? subject) as any,
    year: parseInt(row.year ?? row.examyear ?? "2023", 10),
    difficulty: (row.difficulty ?? "Medium") as any,
    text: row.text ?? row.question ?? "Question text missing",
    instruction: row.instruction ?? row.section ?? row.passage ?? "",
    options:
      shuffled.length > 0
        ? shuffled
        : ["Option A", "Option B", "Option C", "Option D"],
    answer: newIndex >= 0 ? newIndex : 0,
    explanation: row.explanation ?? row.solution ?? "No explanation available.",
    topic: row.topic ?? "General",
  };
};

/**
 * Parse year input to a number or null (for "Random").
 * Clamps to VALID_YEARS range.
 */
function resolveYear(year: string | number | null | undefined): number | null {
  if (!year) return null;
  const s = year.toString();
  if (s.toLowerCase().includes("random") || s === "") return null;
  const n = parseInt(s, 10);
  if (isNaN(n)) return null;
  // Clamp to valid range
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, n));
}

/**
 * Convert "All" / undefined to undefined so the filter is omitted,
 * otherwise return the exact difficulty string the enum expects.
 * Your DB enum has exactly: 'Easy', 'Medium', 'Hard'
 */
function resolveDifficulty(d: string | undefined): Difficulty | undefined {
  if (!d || d === "All") return undefined;
  // Normalise case to match enum
  const map: Record<string, Difficulty> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };
  return map[d.toLowerCase()];
}

// ── Main service function ─────────────────────────────────────────────────────

/**
 * Fetches questions with a three-tier fallback:
 *  1. Supabase — exact year + subject (+ optional difficulty)
 *  2. Supabase — any year for the same subject (fills remaining gap)
 *  3. Local TypeScript data — ultimate fallback
 */
export const fetchQuestionsWithFallback = async (
  subject: string,
  year: string | number,
  requiredCount: number,
  difficulty: string = "All",
  excludeIds: string[] = [],
): Promise<Question[]> => {
  // Normalise inputs
  const formattedSubject =
    subject.trim().charAt(0).toUpperCase() +
    subject.trim().slice(1).toLowerCase();
  const resolvedYear = resolveYear(year);
  const resolvedDiff =
    difficulty === "All"
      ? undefined
      : ((difficulty.trim().charAt(0).toUpperCase() +
          difficulty.trim().slice(1).toLowerCase()) as Difficulty);
  const fetchedIds = new Set<string>(excludeIds);
  let finalQuestions: Question[] = [];

  // Also track content hashes to avoid same question with different IDs
  const seenContent = new Set<string>();

  console.log("🚀 [questionService] fetch params:", {
    subject: formattedSubject,
    year: resolvedYear ?? (typeof year === "string" ? year : "Random"),
    difficulty: resolvedDiff ?? "All",
    required: requiredCount,
    excluding: excludeIds.length,
  });

  try {
    // ── TIER 1: Primary Attempt (Strict Filter) ─────────────────────────────
    {
      let q = supabase
        .from("questions")
        .select("*")
        .eq("subject", formattedSubject);

      if (resolvedYear !== null) {
        q = q.eq("year", resolvedYear);
      } else {
        q = q.gte("year", MIN_YEAR).lte("year", MAX_YEAR);
      }

      if (resolvedDiff) {
        q = q.eq("difficulty", resolvedDiff);
      }

      if (fetchedIds.size > 0) {
        // Use filtering by ID to ensure we don't get duplicates
        const idList = Array.from(fetchedIds).filter(
          (id) => !isNaN(Number(id)),
        );
        if (idList.length > 0) {
          q = q.not("id", "in", `(${idList.join(",")})`);
        }
      }

      const { data, error } = await q.limit(requiredCount * 10); // Fetch more for variety

      if (error) {
        console.error("❌ [Tier 1 fetch error]", error.message);
        throw error;
      }

      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        for (const row of shuffled) {
          if (finalQuestions.length >= requiredCount) break;
          const mapped = mapDbToQuestion(row, formattedSubject);

          const contentKey = mapped.text.trim().toLowerCase();
          if (!fetchedIds.has(mapped.id) && !seenContent.has(contentKey)) {
            fetchedIds.add(mapped.id);
            seenContent.add(contentKey);
            finalQuestions.push(mapped);
          }
        }
      }
    }

    // ── TIER 2: Fallback (Relax Difficulty) ──────────────────────────────────
    if (finalQuestions.length < requiredCount && resolvedDiff) {
      const needed = requiredCount - finalQuestions.length;

      let q = supabase
        .from("questions")
        .select("*")
        .eq("subject", formattedSubject);

      if (resolvedYear !== null) {
        q = q.eq("year", resolvedYear);
      } else {
        q = q.gte("year", MIN_YEAR).lte("year", MAX_YEAR);
      }

      if (fetchedIds.size > 0) {
        const idList = Array.from(fetchedIds).filter(
          (id) => !isNaN(Number(id)),
        );
        if (idList.length > 0) {
          q = q.not("id", "in", `(${idList.join(",")})`);
        }
      }

      const { data } = await q.limit(needed * 5);

      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        for (const row of shuffled) {
          if (finalQuestions.length >= requiredCount) break;
          const mapped = mapDbToQuestion(row, formattedSubject);

          const contentKey = mapped.text.trim().toLowerCase();
          if (!fetchedIds.has(mapped.id) && !seenContent.has(contentKey)) {
            fetchedIds.add(mapped.id);
            seenContent.add(contentKey);
            finalQuestions.push(mapped);
          }
        }
      }
    }

    // ── TIER 3: Last Resort (Any Year, Any Difficulty) ──────────────────────
    if (finalQuestions.length < requiredCount) {
      const needed = requiredCount - finalQuestions.length;

      let q = supabase
        .from("questions")
        .select("*")
        .eq("subject", formattedSubject);

      if (fetchedIds.size > 0) {
        const idList = Array.from(fetchedIds).filter(
          (id) => !isNaN(Number(id)),
        );
        if (idList.length > 0) {
          q = q.not("id", "in", `(${idList.join(",")})`);
        }
      }

      const { data } = await q.limit(needed * 5);

      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        for (const row of shuffled) {
          if (finalQuestions.length >= requiredCount) break;
          const mapped = mapDbToQuestion(row, formattedSubject);

          const contentKey = mapped.text.trim().toLowerCase();
          if (!fetchedIds.has(mapped.id) && !seenContent.has(contentKey)) {
            fetchedIds.add(mapped.id);
            seenContent.add(contentKey);
            finalQuestions.push(mapped);
          }
        }
      }
    }

    // ── TIER 4: Local Data ──────────────────────────────────────────────────
    if (finalQuestions.length < requiredCount) {
      const remaining = requiredCount - finalQuestions.length;
      console.log(`📦 [Tier 4] Pulling ${remaining} from local data`);

      const local = getLocalQuestions(
        subject,
        resolvedYear ?? "Random",
        requiredCount * 2,
      );
      for (const q of local) {
        if (finalQuestions.length >= requiredCount) break;
        if (!fetchedIds.has(q.id)) {
          fetchedIds.add(q.id);
          finalQuestions.push(q);
        }
      }
    }

    console.log(
      `🎁 [questionService] Returning ${finalQuestions.length} questions total`,
    );
    return finalQuestions.sort(() => Math.random() - 0.5);
  } catch (err) {
    console.error("🔥 [questionService] Critical failure:", err);
    // Return local fallback
    return getLocalQuestions(subject, resolvedYear ?? "Random", requiredCount);
  }
};

// ── Topic helpers ─────────────────────────────────────────────────────────────

const LIKELY_TOPICS: Record<string, string[]> = {
  English: [
    "Comprehension",
    "Lexis and Structure",
    "Oral English",
    "Synonyms & Antonyms",
    "Sentence Interpretation",
  ],
  Mathematics: [
    "Number Bases",
    "Fractions & Percentages",
    "Indices & Logarithms",
    "Algebra",
    "Trigonometry",
    "Calculus",
    "Statistics",
    "Geometry",
  ],
  Physics: [
    "Mechanics",
    "Heat & Thermodynamics",
    "Waves & Optics",
    "Electricity & Magnetism",
    "Atomic & Nuclear Physics",
  ],
  Chemistry: [
    "Atomic Structure",
    "Chemical Bonding",
    "Stoichiometry",
    "Organic Chemistry",
    "Electrochemistry",
    "Acids, Bases & Salts",
  ],
  Biology: [
    "Adaptation",
    "Cell Biology",
    "Genetics",
    "Ecology",
    "Evolution",
    "Circulatory System",
    "Plant Biology",
    "Public Health",
  ],
  Economics: [
    "Demand and Supply",
    "Market Structure",
    "National Income",
    "Monetary Policy",
    "Economic Development",
  ],
  Government: [
    "Basic Concepts",
    "Political Ideologies",
    "Constitution",
    "International Organizations",
    "Public Administration",
  ],
  Literature: [
    "Literary Appreciation",
    "Drama",
    "Poetry",
    "Prose",
    "African Literature",
  ],
  Geography: [
    "Physical Geography",
    "Human Geography",
    "Map Reading",
    "Regional Geography",
  ],
  Crs: ["Old Testament", "Life of Christ", "Acts of the Apostles", "Epistles"],
};

/**
 * Fetch unique topics for a subject from Supabase, merged with known defaults.
 */
export const fetchTopicsBySubject = async (
  subject: string,
): Promise<string[]> => {
  try {
    const formattedSubject =
      subject.trim().charAt(0).toUpperCase() +
      subject.trim().slice(1).toLowerCase();
    const { data, error } = await supabase
      .from("questions")
      .select("topic")
      .eq("subject", formattedSubject)
      .gte("year", MIN_YEAR)
      .lte("year", MAX_YEAR);

    if (error) {
      console.warn("[fetchTopicsBySubject] DB error:", error.message);
    }

    const dbTopics = data
      ? (Array.from(
          new Set(data.map((r) => r.topic).filter(Boolean)),
        ) as string[])
      : [];

    const fallbackTopics = LIKELY_TOPICS[formattedSubject] ?? [];
    return Array.from(new Set([...dbTopics, ...fallbackTopics])).sort();
  } catch (err) {
    console.error("[fetchTopicsBySubject]", err);
    const formattedSubject =
      subject.trim().charAt(0).toUpperCase() +
      subject.trim().slice(1).toLowerCase();
    return LIKELY_TOPICS[formattedSubject] ?? [];
  }
};

/**
 * Fetch all questions for Past Questions browsing.
 * Can filter by subject, year, topic, difficulty.
 */
export const fetchAllQuestionsForBrowse = async (
  subject?: string,
  year?: string | number,
  topic?: string,
  difficulty?: string,
): Promise<Question[]> => {
  try {
    let q = supabase
      .from("questions")
      .select("*")
      .gte("year", MIN_YEAR)
      .lte("year", MAX_YEAR);

    if (subject && subject !== "All") {
      const formattedSubject =
        subject.trim().charAt(0).toUpperCase() +
        subject.trim().slice(1).toLowerCase();
      q = q.eq("subject", formattedSubject);
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

    const { data, error } = await q;

    if (error) {
      console.error("[fetchAllQuestionsForBrowse] Error:", error);
      return [];
    }

    if (data && data.length > 0) {
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

/**
 * Fetch questions by subject + topic.
 * Falls back to general subject questions if topic returns nothing.
 */
export const fetchQuestionsByTopic = async (
  subject: string,
  topic: string,
  limit: number = 10,
  difficulty: string = "All",
  excludeIds: string[] = [],
): Promise<Question[]> => {
  try {
    const formattedSubject =
      subject.trim().charAt(0).toUpperCase() +
      subject.trim().slice(1).toLowerCase();
    const resolvedDiff = resolveDifficulty(difficulty);

    let q = supabase
      .from("questions")
      .select("*")
      .eq("subject", formattedSubject)
      .eq("topic", topic)
      .gte("year", MIN_YEAR)
      .lte("year", MAX_YEAR);

    if (resolvedDiff) q = q.eq("difficulty", resolvedDiff);

    if (excludeIds.length > 0) {
      const idList = excludeIds.filter((id) => !isNaN(Number(id)));
      if (idList.length > 0) {
        q = q.not("id", "in", `(${idList.join(",")})`);
      }
    }

    const { data, error } = await q.limit(limit * 5);

    if (error) throw error;

    if (data && data.length > 0) {
      const fetchedIds = new Set<string>(excludeIds);
      const seenContent = new Set<string>();
      const finalQuestions: Question[] = [];

      const shuffled = [...data].sort(() => Math.random() - 0.5);

      for (const row of shuffled) {
        if (finalQuestions.length >= limit) break;
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

    // Topic returned nothing — fall back to general subject fetch
    return fetchQuestionsWithFallback(
      formattedSubject,
      "Random",
      limit,
      difficulty,
      excludeIds,
    );
  } catch (err) {
    console.error("[fetchQuestionsByTopic]", err);
    const formattedSubject =
      subject.trim().charAt(0).toUpperCase() +
      subject.trim().slice(1).toLowerCase();
    return fetchQuestionsWithFallback(
      formattedSubject,
      "Random",
      limit,
      difficulty,
      excludeIds,
    );
  }
};
