import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  school: string;
  score: number;
  initials: string;
  avatarBg: string; // dark bg colour for avatar circle
  avatarColor: string; // text colour inside avatar circle
  change: number; // rank change this week (+/- positions)
}

type Scope = "school" | "national";

interface LeaderboardState {
  scope: Scope;
  entries: LeaderboardEntry[];
  isLoading: boolean;
  setScope: (scope: Scope) => void;
  fetchLeaderboard: () => Promise<void>;
  fetchSafeFallback: () => Promise<void>;
}

// Helper to generate a random dark background color for avatars
const getRandomColor = () => {
  const colors = [
    { bg: "#2A2000", text: "#F5C842" }, // Gold/Dark
    { bg: "#001A12", text: "#00C896" }, // Emerald/Dark
    { bg: "#1E0E00", text: "#C8814A" }, // Bronze/Dark
    { bg: "#200008", text: "#FF7090" }, // Pink/Dark
    { bg: "#001420", text: "#4B9FD6" }, // Blue/Dark
    { bg: "#1A002A", text: "#A855F7" }, // Purple/Dark
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const useLeaderboardStore = create<LeaderboardState>()((set, get) => ({
  scope: "national", // Default to national as it's more common
  entries: [],
  isLoading: false,

  setScope: (scope) => {
    set({ scope });
    get().fetchLeaderboard();
  },

  fetchLeaderboard: async () => {
    set({ isLoading: true });
    try {
      console.log("🔵 Fetching leaderboard...");

      // Step 1: Try to fetch with the ideal schema (overall_score)
      const { data, error } = (await supabase
        .from("profiles")
        .select("id, name, university, overall_score")
        .order("overall_score", { ascending: false })
        .limit(20)) as { data: any[]; error: any };

      // If we get a column missing error (42703), immediately trigger the safe fallback
      if (error) {
        if (error.code === "42703") {
          console.warn(
            '⚠️ Supabase: "overall_score" column missing. Using safe fallback.',
          );
          return await get().fetchSafeFallback();
        }
        throw error;
      }

      if (data) {
        console.log(`✅ Leaderboard fetched: ${data.length} users.`);
        set({ entries: mapProfilesToEntries(data) });
      }
    } catch (err) {
      console.error("❌ Leaderboard fetch failed:", err);
      await get().fetchSafeFallback();
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Safe fallback that only fetches columns we are 100% sure exist.
   * Useful when the user hasn't added performance columns to Supabase yet.
   */
  fetchSafeFallback: async () => {
    try {
      const { data, error } = (await supabase
        .from("profiles")
        .select("id, name, university")
        .limit(20)) as { data: any[]; error: any };

      if (error) throw error;

      if (data) {
        console.log("✅ Safe leaderboard fallback loaded.");
        set({ entries: mapProfilesToEntries(data) });
      }
    } catch (err) {
      console.error("Ultimate leaderboard fallback failed:", err);
    }
  },
}));

/** Helper to map raw profile data to LeaderboardEntry format */
const mapProfilesToEntries = (data: any[]): LeaderboardEntry[] => {
  return data.map((profile, index) => {
    const name = profile.name || "Anonymous User";
    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const colors = getRandomColor();

    return {
      id: profile.id,
      rank: index + 1,
      name: name,
      school: profile.university || "No School Set",
      score: profile.overall_score || 0,
      initials: initials,
      avatarBg: colors.bg,
      avatarColor: colors.text,
      change: 0,
    };
  });
};
