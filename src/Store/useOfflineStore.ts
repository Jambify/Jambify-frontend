import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useOfflineStore
 * ───────────────
 * Tracks which question packs have been "downloaded"
 * for offline use. In Phase 4 this will trigger a real
 * Service Worker cache.write() call. For now it simulates
 * the download with a 2-second delay and persists the
 * downloaded pack list to localStorage.
 */

interface OfflineState {
  downloadedPacks:  string[];           // pack IDs cached for offline
  downloadingId:    string | null;       // pack currently being downloaded
  totalCachedBytes: number;              // rough size tracking
  downloadPack:     (id: string) => void;
  removePack:       (id: string) => void;
  isPackAvailable:  (id: string) => boolean;
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

      downloadPack: (id) => {
        if (get().downloadedPacks.includes(id)) return;
        set({ downloadingId: id });

        // Simulate download — replace with real SW cache.write() in Phase 4
        setTimeout(() => {
          set((s) => ({
            downloadedPacks:  [...s.downloadedPacks, id],
            downloadingId:    null,
            totalCachedBytes: s.totalCachedBytes + (PACK_SIZES[id] ?? 0),
          }));
        }, 2000);
      },

      removePack: (id) =>
        set((s) => ({
          downloadedPacks:  s.downloadedPacks.filter((p) => p !== id),
          totalCachedBytes: s.totalCachedBytes - (PACK_SIZES[id] ?? 0),
        })),

      isPackAvailable: (id) => get().downloadedPacks.includes(id),
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