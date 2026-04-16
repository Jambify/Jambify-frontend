import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Dexie from 'dexie';
import type { Table } from 'dexie';

/**
 * IndexedDB setup for offline question storage
 */
interface QuestionData {
  id?: number;
  packId: string;
  questionData: any; // Store the actual question data
  downloadedAt: Date;
}

class JambifyOfflineDB extends Dexie {
  questions!: Table<QuestionData>;

  constructor() {
    super('jambify-offline-db');
    this.version(1).stores({
      questions: '++id, packId, downloadedAt',
    });
  }
}

const db = new JambifyOfflineDB();

/**
 * Helper function to simulate fetching sample questions for different packs
 */
async function fetchSampleQuestionsForPack(packId: string): Promise<any[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return sample questions based on pack ID
  const sampleQuestions = [
    {
      id: `${packId}-1`,
      text: `Sample question 1 from ${packId}`,
      subject: packId.split('-')[0],
      year: 2023,
      topic: 'General',
      difficulty: 'Medium',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 0
    },
    {
      id: `${packId}-2`,
      text: `Sample question 2 from ${packId}`,
      subject: packId.split('-')[0],
      year: 2023,
      topic: 'General',
      difficulty: 'Easy',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 1
    }
  ];
  
  return sampleQuestions;
}

/**
 * useOfflineStore
 * -------------------
 * Tracks which question packs have been downloaded
 * for offline use using IndexedDB via Dexie.js
 */

interface OfflineState {
  downloadedPacks:  string[];           // pack IDs cached for offline
  downloadingId:    string | null;       // pack currently being downloaded
  totalCachedBytes: number;              // rough size tracking
  downloadPack:     (id: string) => Promise<void>;
  removePack:       (id: string) => Promise<void>;
  isPackAvailable:  (id: string) => boolean;
  getOfflineQuestions: (packId: string) => Promise<any[]>;
}

/** Pack sizes in bytes for tracking (approximate) */
const PACK_SIZES: Record<string, number> = {
  'eng-all':  1258291,
  'math-all': 1048576,
  'phy-all':  943718,
  'chem-all': 943718,
  'bio-all':  838861,
};

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      downloadedPacks:  [],
      downloadingId:    null,
      totalCachedBytes: 0,

      downloadPack: async (id) => {
        if (get().downloadedPacks.includes(id)) return;
        set({ downloadingId: id });

        try {
          // Simulate fetching sample questions based on pack ID
          // In a real app, this would fetch from an API
          const sampleQuestions = await fetchSampleQuestionsForPack(id);
          
          // Store questions in IndexedDB
          await db.transaction('rw', db.questions, async () => {
            // Clear existing questions for this pack
            await db.questions.where('packId').equals(id).delete();
            
            // Add new questions
            const questionData = sampleQuestions.map(q => ({
              packId: id,
              questionData: q,
              downloadedAt: new Date()
            }));
            
            await db.questions.bulkAdd(questionData);
          });

          set((s) => ({
            downloadedPacks:  [...s.downloadedPacks, id],
            downloadingId:    null,
            totalCachedBytes: s.totalCachedBytes + (PACK_SIZES[id] ?? 0),
          }));
        } catch (error) {
          console.error('Failed to download pack:', error);
          set({ downloadingId: null });
        }
      },

      removePack: async (id) => {
        try {
          // Remove from IndexedDB
          await db.questions.where('packId').equals(id).delete();
          
          set((s) => ({
            downloadedPacks:  s.downloadedPacks.filter((p) => p !== id),
            totalCachedBytes: s.totalCachedBytes - (PACK_SIZES[id] ?? 0),
          }));
        } catch (error) {
          console.error('Failed to remove pack:', error);
        }
      },

      isPackAvailable: (id) => get().downloadedPacks.includes(id),

      getOfflineQuestions: async (packId: string) => {
        try {
          const questions = await db.questions.where('packId').equals(packId).toArray();
          return questions.map(q => q.questionData);
        } catch (error) {
          console.error('Failed to get offline questions:', error);
          return [];
        }
      },
    }),
    {
      name: 'jambready-offline',
      partialize: (s) => ({
        downloadedPacks:  s.downloadedPacks,
        totalCachedBytes: s.totalCachedBytes,
      }),
    },
  ),
);