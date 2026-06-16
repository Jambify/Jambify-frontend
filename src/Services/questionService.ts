// src/Services/questionService.ts

import { supabase } from "../lib/supabase";
import type { Question } from "../Types";
import { getLocalQuestions } from "../Data/Questions";

// Helper to normalize subject names to match the database enum
const normalizeSubject = (subject: string): string => {
  const lower: string = subject.toLowerCase();
  if (lower === "crs") return "CRS";
  if (lower === "irs") return "IRS";
  if (lower === "literature") return "Literature";
  // If it's already correctly cased, return as-is
  return subject;
};

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
 * Fetches questions with a multi-tier fallback:
 *  1. Try exact year + subject (+ optional difficulty)
 *  2. If not enough, try nearby years (increment +1, -1, +2, -2, etc.)
 *  3. If still not enough, relax difficulty
 *  4. If still not enough, try any year/any difficulty
 *  5. Last resort: local TypeScript data
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

  // Helper to fetch questions for a specific year and difficulty
  const fetchForYearAndDiff = async (
    targetYear: number | null,
    targetDiff: Difficulty | undefined,
    needed: number,
  ): Promise<Question[]> => {
    let q = supabase
      .from("questions")
      .select("*")
      .eq("subject", normalizeSubject(formattedSubject));

    if (targetYear !== null) {
      q = q.eq("year", targetYear);
    } else {
      q = q.gte("year", MIN_YEAR).lte("year", MAX_YEAR);
    }

    if (targetDiff) {
      q = q.eq("difficulty", targetDiff);
    }

    if (fetchedIds.size > 0) {
      const idList = Array.from(fetchedIds).filter(
        (id) => !isNaN(Number(id)),
      );
      if (idList.length > 0) {
        q = q.not("id", "in", `(${idList.join(",")})`);
      }
    }

    const { data } = await q.limit(needed * 10);
    const results: Question[] = [];

    if (data && data.length > 0) {
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
    // ── TIER 1: Primary Attempt (Exact Year + Specified Difficulty) ─────────
    if (finalQuestions.length < requiredCount) {
      const needed = requiredCount - finalQuestions.length;
      const results = await fetchForYearAndDiff(resolvedYear, resolvedDiff, needed);
      finalQuestions.push(...results);
      console.log(`🎯 [Tier 1] Got ${results.length} questions`);
    }

    // ── TIER 2: Try Nearby Years (Exact Difficulty) ────────────────────────
    if (finalQuestions.length < requiredCount && resolvedYear !== null) {
      // Generate nearby years in order: +1, -1, +2, -2, etc.
      const nearbyYears: number[] = [];
      let offset = 1;
      while (nearbyYears.length < (MAX_YEAR - MIN_YEAR)) {
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

    // ── TIER 3: Relax Difficulty (Exact Year + Any Difficulty) ──────────────
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
    return finalQuestions.slice(0, requiredCount).sort(() => Math.random() - 0.5);
  } catch (err) {
    console.error("🔥 [questionService] Critical failure:", err);
    // Return local fallback
    return getLocalQuestions(subject, resolvedYear ?? "Random", requiredCount);
  }
};

// ── Topic helpers ─────────────────────────────────────────────────────────────

export const LIKELY_TOPICS: Record<string, string[]> = {
  English: [
    "Comprehension",
    "Lexis and Structure",
    "Oral English",
    "Synonyms & Antonyms",
    "Sentence Interpretation",
    "Novel",
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
    "Astronomy",
    "Atomic Physics",
    "Biology/Optics",
    "Current Electricity",
    "Elasticity",
    "Electric Fields",
    "Electrochemistry",
    "Electromagnetic Induction",
    "Electromagnetic Spectrum",
    "Electromagnetism",
    "Electrostatics",
    "Energy Quantization",
    "Fields",
    "Gases",
    "Gravitational Field",
    "Gravitational Fields",
    "Heat Energy",
    "Hydrostatics",
    "Magnetism",
    "Measurement",
    "Mechanics",
    "Meteorology",
    "Modern Physics",
    "Optics",
    "States of Matter",
    "Thermal Expansion",
    "Thermal Physics",
    "Units and Measurements",
    "Waves",
  ],
  Chemistry: [
    "Acid-Base Titrations",
    "Acids and Bases",
    "Acids/Bases",
    "Allotropy",
    "Alloys",
    "Analytical Chemistry",
    "Anorganic Chemistry",
    "Atomic Structure",
    "Biochemistry",
    "Carbon and Compounds",
    "Chemical Bonding",
    "Chemical Changes",
    "Chemical Equilibrium",
    "Chemical Formulas",
    "Chemical Kinetics",
    "Colloids",
    "Coordination Chemistry",
    "Corrosion",
    "Earth Chemistry",
    "Electrochemistry",
    "Electrolysis",
    "Environmental Chemistry",
    "Equilibrium",
    "Gas Laws",
    "Gases",
    "Hygroscopic Substances",
    "Industrial Chemistry",
    "Inorganic Chem",
    "Inorganic Chemistry",
    "Kinetic Theory",
    "Laboratory Safety",
    "Material Science",
    "Matter and Changes",
    "Matter and Mixtures",
    "Matter and Properties",
    "Metallurgy",
    "Metals and Compounds",
    "Nuclear Chemistry",
    "Organic Chemistry",
    "Periodic Table",
    "Periodic Trends",
    "Physical Chemistry",
    "Physical Properties",
    "Polymer Chemistry",
    "Polymers",
    "Qualitative Analysis",
    "Rates of Radicals",
    "Rates of Reactions",
    "Reaction Rates",
    "Redox",
    "Redox Reactions",
    "Separation Techniques",
    "Solubility",
    "Solutions",
    "States of Matter",
    "Stoichiometry",
    "Thermodynamics",
    "Titration",
    "Water",
    "Water Chemistry",
  ],
  Biology: [
    "Adaptation",
    "Agriculture",
    "Anatomy",
    "Animal Behavior",
    "Animal Diversity",
    "Atmospheric Pollutants",
    "Biochemistry",
    "Cell Biochemistry",
    "Cell Biology",
    "Circulatory System",
    "Classification",
    "Developmental Biology",
    "Digestive System",
    "Ecology",
    "Endocrine System",
    "Entomology",
    "Evolution",
    "Excretion",
    "Excretory System",
    "Fungi",
    "General",
    "Genetics",
    "Health",
    "Homeostasis",
    "Hormonal System",
    "Insects",
    "Lymphatic System",
    "Microbiology",
    "Nervous System",
    "Nutrient Cycles",
    "Nutrition",
    "Pathology",
    "Photosynthesis",
    "Physiology",
    "Plant Anatomy",
    "Plant Biology",
    "Plant Classification",
    "Plant Kingdom",
    "Plant Nutrition",
    "Plant Pathology",
    "Plant Physiology",
    "Plant Reproduction",
    "Psychology",
    "Public Health",
    "Reproduction",
    "Reproductive System",
    "Respiratory System",
    "Sense Organs",
    "Sensory Organs",
    "Skeletal System",
    "Taxonomy",
  ],
  Economics: [
    "Agricultural Economics",
    "Business Finance",
    "Business Organizations",
    "Consumer Behaviour",
    "Demand",
    "Demand and Supply",
    "Development Economics",
    "Distribution",
    "Economic Analysis",
    "Economic Growth",
    "Economic Systems",
    "Elasticity",
    "Environmental Economics",
    "Factors of Production",
    "Financial Institutions",
    "General Knowledge",
    "Industrialization",
    "Inflation",
    "International Organizations",
    "International Trade",
    "Introduction to Economics",
    "Labour Economics",
    "Land Economics",
    "Location of Industries",
    "Macroeconomics",
    "Market Mechanisms",
    "Market Structures",
    "Marketing",
    "Mathematics",
    "Methodology",
    "Monetary Economics",
    "Monetary Policy",
    "Money and Banking",
    "Money Market",
    "National Income",
    "Natural Resources",
    "Petroleum Economics",
    "Population",
    "Price Control",
    "Price System",
    "Price Theory",
    "Production",
    "Production Possibility Frontier",
    "Production Theory",
    "Production/Costs",
    "Public Finance",
    "Statistics",
    "Supply",
    "Supply/Demand",
    "Unemployment",
  ],
  Government: [
    "Arms of Government",
    "Citizenship",
    "Colonial Administration",
    "Constitutions",
    "Democracy",
    "Economic Policy",
    "Elections",
    "Foreign Policy",
    "Geography",
    "History",
    "International Organizations",
    "International Relations",
    "Nigerian Foreign Policy",
    "Nigerian Government",
    "Political Ideologies",
    "Political Parties",
    "Political Science",
    "Pressure Groups",
    "Public Administration",
    "Public Opinion",
    "Systems of Government",
  ],
  Literature: [
    "1984",
    "Animal Farm",
    "Attahiru",
    "Drama",
    "Faceless",
    "Hamlet",
    "Harvest of Corruption",
    "Legal/Publishing",
    "Literary Appreciation",
    "Literary Authors",
    "Literary Principles",
    "Lonely Days",
    "Macbeth",
    "Morountodun",
    "Native Son",
    "Othello",
    "Phonetics",
    "Poetry",
    "Prose",
    "The Joy of Motherhood",
    "The New Man",
    "The Wives Revolt",
    "Twelfth Night",
    "Witnesses to Tears",
  ],
  Geography: [
    "Physical Geography",
    "Human Geography",
    "Map Reading",
    "Regional Geography",
  ],
  Crs: ["Old Testament", "Life of Christ", "Acts of the Apostles", "Epistles"],
};

// Helper to normalize topic names to match LIKELY_TOPICS
export const normalizeTopicName = (topic: string, subject: string): string => {
  const subjectTopics = LIKELY_TOPICS[subject] || [];
  const topicLower = topic.toLowerCase();

  // 1. Check for EXACT match first (highest priority)
  for (const validTopic of subjectTopics) {
    if (validTopic.toLowerCase() === topicLower) {
      return validTopic;
    }
  }

  // 2. Check for exact sub-match (e.g., "Digestive" is in "Digestive System")
  for (const validTopic of subjectTopics) {
    if (validTopic.toLowerCase().includes(topicLower) || topicLower.includes(validTopic.toLowerCase())) {
      return validTopic;
    }
  }

  // 3. Check if any word in the topic matches any word in a valid topic
  const topicWords = topicLower.split(" ");
  for (const validTopic of subjectTopics) {
    const validWords = validTopic.toLowerCase().split(" ");
    const hasMatch = topicWords.some(tWord => validWords.some(vWord => tWord === vWord));
    if (hasMatch) {
      return validTopic;
    }
  }

  // 4. Fallback: just capitalize first letter
  return topic.charAt(0).toUpperCase() + topic.slice(1);
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
    // Cap Novel questions at 10 max
    const actualLimit = topic.toLowerCase() === "novel" ? Math.min(limit, 10) : limit;

    const formattedSubject =
      subject.trim().charAt(0).toUpperCase() +
      subject.trim().slice(1).toLowerCase();
    const resolvedDiff = resolveDifficulty(difficulty);

    let q = supabase
      .from("questions")
      .select("*")
      .eq("subject", normalizeSubject(formattedSubject))
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

    const { data, error } = await q.limit(actualLimit * 5);

    if (error) throw error;

    if (data && data.length > 0) {
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

    // Topic returned nothing — fall back to general subject fetch
    return fetchQuestionsWithFallback(
      formattedSubject,
      "Random",
      actualLimit,
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
