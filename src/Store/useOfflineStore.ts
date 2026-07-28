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
  questionData: Question; // Store the actual question data
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

// Map pack IDs to subjects
const PACK_TO_SUBJECT: Record<string, string> = {
  "eng-all": "English",
  "math-all": "Mathematics",
  "phy-all": "Physics",
  "chem-all": "Chemistry",
  "bio-all": "Biology",
};

/**
 * Helper function to fetch real questions from Supabase for a pack
 */
async function fetchQuestionsForPack(packId: string): Promise<Question[]> {
  const subject = PACK_TO_SUBJECT[packId];
  if (!subject) return [];

  // Fetch all questions for that subject from 2016-2025
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

  // Transform DB rows to our Question type
  const questions = (data || []).map((row) => {
    let options: string[] = [];
    if (Array.isArray(row.options)) {
      options = row.options;
    } else if (typeof row.options === "string") {
      try {
        options = JSON.parse(row.options);
      } catch{
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

/**
 * useOfflineStore
 * -------------------
 * Tracks which question packs have been downloaded
 * for offline use using IndexedDB via Dexie.js
 */

interface OfflineState {
  downloadedPacks: string[]; // pack IDs cached for offline
  downloadingId: string | null; // pack currently being downloaded
  totalCachedBytes: number; // rough size tracking
  downloadPack: (id: string) => Promise<void>;
  removePack: (id: string) => Promise<void>;
  isPackAvailable: (id: string) => boolean;
  getOfflineQuestions: (packId: string) => Promise<Question[]>;
}

/** Pack sizes in bytes for tracking (approximate) */
const PACK_SIZES: Record<string, number> = {
  "eng-all": 1258291,
  "math-all": 1048576,
  "phy-all": 943718,
  "chem-all": 943718,
  "bio-all": 838861,
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
          // Fetch real questions from Supabase for this pack
          const questions = await fetchQuestionsForPack(id);

          // Store questions in IndexedDB
          await db.transaction("rw", db.questions, async () => {
            // Clear existing questions for this pack
            await db.questions.where("packId").equals(id).delete();

            // Add new questions
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
          // Remove from IndexedDB
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
