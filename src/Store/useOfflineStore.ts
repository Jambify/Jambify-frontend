import { create } from "zustand";
import { persist } from "zustand/middleware";
import Dexie from "dexie";
import type { Table } from "dexie";
import { supabase } from "../lib/supabase";
import type { Question } from "../Types";

/**
 * IndexedDB setup for offline question storage
 */
interface QuestionData {
  id?: number;
  packId: string;
  questionData: Question;
  downloadedAt: Date;
}

class SchoolDraOfflineDB extends Dexie {
  questions!: Table<QuestionData>;

  constructor() {
    super("schooldra-offline-db");
    this.version(1).stores({
      questions: "++id, packId, downloadedAt",
    });
  }
}

const db = new SchoolDraOfflineDB();

// FIX: expanded from 5 to all 13 JAMB subjects. Subject strings match
// ALL_SUBJECTS in PastQuestions.tsx and normalizeSubject's conventions
// in questionService.ts exactly (CRS/IRS included).
const PACK_TO_SUBJECT: Record<string, string> = {
  "eng-all": "English",
  "math-all": "Mathematics",
  "phy-all": "Physics",
  "chem-all": "Chemistry",
  "bio-all": "Biology",
  "econ-all": "Economics",
  "govt-all": "Government",
  "lit-all": "Literature",
  "geo-all": "Geography",
  "crs-all": "CRS",
  "comm-all": "Commerce",
  "hist-all": "History",
  "irs-all": "IRS",
};

export const SUBJECT_TO_PACK: Record<string, string> = Object.fromEntries(
  Object.entries(PACK_TO_SUBJECT).map(([packId, subject]) => [subject, packId]),
);

/**
 * Helper function to fetch real questions from Supabase for a pack.
 * Unchanged — was already generic via PACK_TO_SUBJECT, works for any
 * subject without modification.
 */
async function fetchQuestionsForPack(packId: string): Promise<Question[]> {
  const subject = PACK_TO_SUBJECT[packId];
  if (!subject) return [];

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("subject", subject)
    .gte("year", 2016)
    .lte("year", 2025);

  if (error) {
    console.error("[Offline] Error fetching questions:", error);
    return [];
  }

  const questions = (data || []).map((row) => {
    let options: string[] = [];
    if (Array.isArray(row.options)) {
      options = row.options;
    } else if (typeof row.options === "string") {
      try {
        options = JSON.parse(row.options);
      } catch {
        options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
      }
    }

    let answerIndex = 0;
    if (typeof row.answer === "number") answerIndex = row.answer;
    else if (typeof row.answer === "string") {
      const idx = ["a", "b", "c", "d", "e"].indexOf(row.answer.toLowerCase());
      answerIndex = idx >= 0 ? idx : parseInt(row.answer, 10) || 0;
    }

    return {
      id: row.id.toString(),
      subject: row.subject,
      year: parseInt(row.year, 10),
      difficulty: row.difficulty as "Easy" | "Medium" | "Hard",
      text: row.text || row.question || "",
      instruction: row.instruction || row.section || row.passage || "",
      options: options.length ? options : ["Option A", "Option B", "Option C", "Option D"],
      answer: answerIndex,
      explanation: row.explanation || row.solution || "No explanation available.",
      topic: row.topic || "General",
    } as Question;
  });

  return questions;
}

interface OfflineState {
  downloadedPacks: string[];
  downloadingId: string | null;
  totalCachedBytes: number;
  downloadPack: (id: string) => Promise<void>;
  removePack: (id: string) => Promise<void>;
  isPackAvailable: (id: string) => boolean;
  getOfflineQuestions: (packId: string) => Promise<Question[]>;
}

// FIX: the original 5 sizes were hand-set estimates. Rather than inventing
// 8 more numbers with the same false precision, these are PLACEHOLDERS —
// each set to the average of the original 5 (~1MB) as a rough stand-in.
// Before shipping, replace every value below with a real measurement:
// download each pack once, check the actual bulkAdd payload size (or
// query avg row size * COUNT(*) per subject from Supabase directly).
// totalCachedBytes will be wrong for these subjects until then — it's
// used for display/tracking only, not for any storage-limit enforcement,
// so it's not unsafe to ship with placeholders, just inaccurate.
const PACK_SIZES: Record<string, number> = {
  "eng-all": 1258291,
  "math-all": 1048576,
  "phy-all": 943718,
  "chem-all": 943718,
  "bio-all": 838861,
  "econ-all": 1000000, // TODO: placeholder — replace with real measurement
  "govt-all": 1000000, // TODO: placeholder — replace with real measurement
  "lit-all": 1000000, // TODO: placeholder — replace with real measurement
  "geo-all": 1000000, // TODO: placeholder — replace with real measurement
  "crs-all": 1000000, // TODO: placeholder — replace with real measurement
  "comm-all": 1000000, // TODO: placeholder — replace with real measurement
  "hist-all": 1000000, // TODO: placeholder — replace with real measurement
  "irs-all": 1000000, // TODO: placeholder — replace with real measurement
};

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      downloadedPacks: [],
      downloadingId: null,
      totalCachedBytes: 0,

      downloadPack: async (id) => {
        if (get().downloadedPacks.includes(id)) return;
        set({ downloadingId: id });

        try {
          const questions = await fetchQuestionsForPack(id);

          await db.transaction("rw", db.questions, async () => {
            await db.questions.where("packId").equals(id).delete();

            const questionData = questions.map((q) => ({
              packId: id,
              questionData: q,
              downloadedAt: new Date(),
            }));

            await db.questions.bulkAdd(questionData);
          });

          set((s) => ({
            downloadedPacks: [...s.downloadedPacks, id],
            downloadingId: null,
            totalCachedBytes: s.totalCachedBytes + (PACK_SIZES[id] ?? 0),
          }));
        } catch (error) {
          console.error("Failed to download pack:", error);
          set({ downloadingId: null });
        }
      },

      removePack: async (id) => {
        try {
          await db.questions.where("packId").equals(id).delete();

          set((s) => ({
            downloadedPacks: s.downloadedPacks.filter((p) => p !== id),
            totalCachedBytes: s.totalCachedBytes - (PACK_SIZES[id] ?? 0),
          }));
        } catch (error) {
          console.error("Failed to remove pack:", error);
        }
      },

      isPackAvailable: (id) => get().downloadedPacks.includes(id),

      getOfflineQuestions: async (packId: string) => {
        try {
          const questions = await db.questions
            .where("packId")
            .equals(packId)
            .toArray();
          return questions.map((q) => q.questionData);
        } catch (error) {
          console.error("Failed to get offline questions:", error);
          return [];
        }
      },
    }),
    {
      name: "jambready-offline",
      partialize: (s) => ({
        downloadedPacks: s.downloadedPacks,
        totalCachedBytes: s.totalCachedBytes,
      }),
    },
  ),
);