// src/Store/useSubjectStore.ts

import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useUserStore } from "./useUserStore";
import { getDetailedTopicStats } from "../Services/PerformanceService";
import type { Subject, SubjectProgress } from "../Types/subject";

interface SubjectState {
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  loadSubjects: () => Promise<void>;
  updateSubject: (
    id: string,
    accuracy: number,
    completed: number,
  ) => Promise<void>;
  incrementCompleted: (id: string, count: number) => Promise<void>;
  updateAccuracy: (id: string, accuracy: number) => Promise<void>;
  initialize: () => Promise<void>;
}

// Complete master list of all possible subjects with their details
const ALL_SUBJECTS_MASTER = [
  {
    id: "eng",
    name: "English",
    icon: "📖",
    color: "#7B5FFF",
    total: 420,
    topics: [
      "Comprehension",
      "Lexis and Structure",
      "Oral English",
      "Sentence Interpretation",
      "Figures of Speech",
    ],
  },
  {
    id: "math",
    name: "Mathematics",
    icon: "🔢",
    color: "#00C896",
    total: 380,
    topics: [
      "Number Bases",
      "Fractions, Decimals and Percentages",
      "Indices, Logarithms and Surds",
      "Sets",
      "Polynomials",
      "Variation",
      "Inequalities",
      "Progressions",
      "Binary Operations",
      "Matrices and Determinants",
      "Euclidean Geometry",
      "Mensuration",
      "Loci",
      "Coordinate Geometry",
      "Trigonometry",
      "Differentiation",
      "Integration",
      "Statistics",
      "Probability",
    ],
  },
  {
    id: "phy",
    name: "Physics",
    icon: "⚡",
    color: "#FFB020",
    total: 310,
    topics: [
      "Mechanics",
      "Thermal Physics",
      "Optics",
      "Electricity and Magnetism",
      "Waves",
      "Modern Physics",
    ],
  },
  {
    id: "chem",
    name: "Chemistry",
    icon: "⚗️",
    color: "#FF4D6D",
    total: 340,
    topics: [
      "Rates of Chemical Reactions",
      "Industrial Chemistry",
      "Organic Chemistry",
      "Gases & Gas Laws",
      "Chemical Bonding",
      "Thermodynamics",
      "Inorganic Chemistry",
      "Redox Reactions",
      "States of Matter & Matter Properties",
      "Atomic Structure",
      "Acids, Bases, & Salts",
      "Electrolysis",
      "Water Chemistry",
      "Environmental Chemistry",
    ],
  },
  {
    id: "bio",
    name: "Biology",
    icon: "🧬",
    color: "#00C896",
    total: 290,
    topics: [
      "Adaptation",
      "Cell Biology",
      "Genetics",
      "Ecology",
      "Evolution",
      "Circulatory System",
      "Plant Biology",
      "Public Health",
    ],
  },
  {
    id: "econ",
    name: "Economics",
    icon: "📊",
    color: "#FFB020",
    total: 270,
    topics: [
      "Introduction to Economics (Scarcity & Choice)",
      "Demand and Supply (Elasticity & Equilibrium)",
      "Production Theory (PPF & Factors)",
      "Macroeconomics (National Income & Growth)",
      "Public Finance, Money & Banking",
      "Market Structures (Competition & Monopoly)",
      "International Trade & Organizations",
      "Agricultural Economics",
      "Statistics (Central Tendency & Variance)",
    ],
  },
  {
    id: "gov", name: "Government", icon: "🏛️", color: "#EC4899", total: 300, topics: [
      "Political Science & Governance - Systems of Government",
      "Political Science & Governance - Political Ideologies",
      "Political Science & Governance - Public Opinion",
      "Nigerian Government & History - Pre-colonial Administration",
      "Nigerian Government & History - Colonial History",
      "Nigerian Government & History - Post-Independence Political History",
      "Nigerian Government & History - Nigerian Federalism",
      "Constitutions & Legal Framework - Constitutional Development",
      "Constitutions & Legal Framework - Rule of Law",
      "International Relations & Organizations - Foreign Policy",
      "International Relations & Organizations - International Organizations",
      "Public Administration & Elections - Civil Service",
      "Public Administration & Elections - Public Corporations",
      "Public Administration & Elections - Electoral Processes",
      "Arms of Government - Executive, Legislative, and Judiciary",
      "Arms of Government - Pressure Groups"
    ]
  },
  { id: "lit", name: "Literature in English", icon: "📚", color: "#F97316", total: 300 },
  { id: "crs", name: "CRS", icon: "✝️", color: "#A855F7", total: 250 },
  { id: "irs", name: "IRS", icon: "🌙", color: "#00C896", total: 250 },
  { id: "com", name: "Commerce", icon: "💼", color: "#FFB020", total: 300 },
];

// Maps short subject ID to full name (for database enum)
export const SHORT_ID_TO_FULL_NAME: Record<string, string> = {
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

// Maps full subject name (from database enum) back to short ID
export const FULL_NAME_TO_SHORT_ID: Record<string, string> = {
  English: "eng",
  Mathematics: "math",
  Physics: "phy",
  Chemistry: "chem",
  Biology: "bio",
  Economics: "econ",
  Government: "gov",
  "Literature in English": "lit",
  CRS: "crs",
  IRS: "irs",
  Commerce: "com",
};

// Map subject combo ID to list of subject names (matches your onboarding)
export const SUBJECT_COMBO_MAP: Record<string, string[]> = {
  medicine: ["English", "Biology", "Chemistry", "Physics"],
  engineering: ["English", "Mathematics", "Physics", "Chemistry"],
  "social-sci": ["English", "Mathematics", "Economics", "Government"],
  law: ["English", "Literature in English", "Government", "CRS"],
  art: ["English", "Literature in English", "Government", "CRS"],
  commerce: ["English", "Mathematics", "Economics", "Commerce"],
};

// Map subject name to master subject object
export const getSubjectFromName = (name: string) => {
  const nameMap: Record<string, any> = {
    English: ALL_SUBJECTS_MASTER.find((s) => s.name === "English"),
    Mathematics: ALL_SUBJECTS_MASTER.find((s) => s.name === "Mathematics"),
    Physics: ALL_SUBJECTS_MASTER.find((s) => s.name === "Physics"),
    Chemistry: ALL_SUBJECTS_MASTER.find((s) => s.name === "Chemistry"),
    Biology: ALL_SUBJECTS_MASTER.find((s) => s.name === "Biology"),
    Economics: ALL_SUBJECTS_MASTER.find((s) => s.name === "Economics"),
    Government: ALL_SUBJECTS_MASTER.find((s) => s.name === "Government"),
    "Literature in English": ALL_SUBJECTS_MASTER.find((s) => s.name === "Literature in English"),
    CRS: ALL_SUBJECTS_MASTER.find((s) => s.name === "CRS"),
    IRS: ALL_SUBJECTS_MASTER.find((s) => s.name === "IRS"),
    Commerce: ALL_SUBJECTS_MASTER.find((s) => s.name === "Commerce"),
  };
  return nameMap[name];
};

// Calculate national rank based on accuracy
const calculateRank = (accuracy: number): number => {
  if (accuracy >= 90) return 5;
  if (accuracy >= 80) return 12;
  if (accuracy >= 70) return 25;
  if (accuracy >= 60) return 45;
  if (accuracy >= 50) return 60;
  return 75;
};

// Get user's selected subjects based on their onboarding subject combo
const getUserSelectedSubjects = (): string[] => {
  const subjectComboId = useUserStore.getState().subjectCombo;
  // Default to engineering if not set (fallback)
  const subjects =
    SUBJECT_COMBO_MAP[subjectComboId] || SUBJECT_COMBO_MAP["engineering"];
  console.log(
    "🔵 User selected subjects:",
    subjects,
    "from combo:",
    subjectComboId,
  );
  return subjects;
};

// Fetch user's subject progress (only selected subjects)
const fetchUserSubjects = async (): Promise<Subject[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get user's selected subjects from their onboarding choice
  const selectedSubjectNames = getUserSelectedSubjects();

  // Get the master data for only selected subjects
  const selectedSubjectsMaster = selectedSubjectNames
    .map((name) => getSubjectFromName(name))
    .filter((s) => s !== undefined);

  // Fetch existing progress and real topic stats
  const [{ data: existingProgress, error }, realTopicStats] = await Promise.all(
    [
      supabase.from("subject_progress").select("*").eq("user_id", user.id),
      getDetailedTopicStats(),
    ],
  );

  if (error) throw error;

  // Create a map of existing progress, using FULL_NAME_TO_SHORT_ID to map back
  const progressMap = new Map<string, SubjectProgress>();
  existingProgress?.forEach((p) => {
    const shortId = FULL_NAME_TO_SHORT_ID[p.subject];
    if (shortId) progressMap.set(shortId, p);
  });

  // Build subjects only for selected ones
  const subjects: Subject[] = selectedSubjectsMaster.map((master) => {
    const progress = progressMap.get(master.id);
    const accuracy = progress?.accuracy || 0;
    const completed = progress?.questions_done || 0;
    const rank = calculateRank(accuracy);

    // Collect weakest topic (only from real database data)
    let weakTopics: string[] = [];
    const subjectTopicStats = realTopicStats
      .filter((t) => t.subject === master.name)
      .sort((a, b) => a.accuracy - b.accuracy); // Sort weakest first

    if (subjectTopicStats.length > 0) {
      weakTopics = [subjectTopicStats[0].name];
    }

    return {
      id: master.id,
      name: master.name,
      icon: master.icon,
      color: master.color,
      accuracy: accuracy,
      completed: completed,
      total: master.total,
      rank: rank,
      weakTopics: weakTopics,
      topics: (master as any).topics || [],
    };
  });

  return subjects;
};

// Initialize subject progress for a new user (only selected subjects)
const initializeUserSubjects = async (): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get user's selected subjects
  const selectedSubjectNames = getUserSelectedSubjects();
  const selectedSubjectsMaster = selectedSubjectNames
    .map((name) => getSubjectFromName(name))
    .filter((s) => s !== undefined);

  console.log("🔵 Initializing subjects for user:", selectedSubjectNames);

  for (const master of selectedSubjectsMaster) {
    const fullName = SHORT_ID_TO_FULL_NAME[master.id];
    if (!fullName) continue;
    const { error } = await supabase.from("subject_progress").upsert(
      {
        user_id: user.id,
        subject: fullName,
        accuracy: 0,
        questions_done: 0,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,subject",
      },
    );

    if (error) console.error(`Error initializing ${master.name}:`, error);
  }
};

// Update subject progress in database
const updateSubjectProgressInDB = async (
  subjectId: string,
  newAccuracy: number,
  questionsDone: number,
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const master = ALL_SUBJECTS_MASTER.find((s) => s.id === subjectId);
  if (!master) throw new Error("Subject not found");
  const fullName = SHORT_ID_TO_FULL_NAME[subjectId];
  if (!fullName) throw new Error("Subject not found in mapping");

  const { error } = await supabase.from("subject_progress").upsert(
    {
      user_id: user.id,
      subject: fullName,
      accuracy: newAccuracy,
      questions_done: questionsDone,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,subject",
    },
  );

  if (error) throw error;
};

export const useSubjectStore = create<SubjectState>()((set, get) => ({
  subjects: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  loadSubjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const subjects = await fetchUserSubjects();
      set({ subjects, isLoading: false, isInitialized: true });
    } catch (error) {
      console.error("Failed to load subjects:", error);
      set({ error: "Failed to load subjects", isLoading: false });
    }
  },

  updateSubject: async (id: string, accuracy: number, completed: number) => {
    try {
      await updateSubjectProgressInDB(id, accuracy, completed);

      set((state) => ({
        subjects: state.subjects.map((subject) =>
          subject.id === id
            ? {
              ...subject,
              accuracy,
              completed,
            }
            : subject,
        ),
      }));
    } catch (error) {
      console.error("Failed to update subject:", error);
    }
  },

  incrementCompleted: async (id: string, count: number) => {
    const subject = get().subjects.find((s) => s.id === id);
    if (!subject) return;

    const newCompleted = Math.min(subject.completed + count, subject.total);
    const newAccuracy = subject.accuracy;

    await get().updateSubject(id, newAccuracy, newCompleted);
  },

  updateAccuracy: async (id: string, accuracy: number) => {
    const subject = get().subjects.find((s) => s.id === id);
    if (!subject) return;

    await get().updateSubject(id, accuracy, subject.completed);
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      await initializeUserSubjects();
      await get().loadSubjects();
    } catch (error) {
      console.error("Failed to initialize subjects:", error);
      set({ error: "Failed to initialize subjects", isLoading: false });
    }
  },
}));
