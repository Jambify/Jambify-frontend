import type { OfflinePack } from "../components/PastQuestions/OfflinePackCard";

// FIX: `count` values are TODO placeholders — do NOT ship these as real
// numbers. Query the real per-subject count before release:
//   SELECT subject, COUNT(*) FROM questions
//   WHERE year BETWEEN 2016 AND 2025 GROUP BY subject;
// `years` reflects the actual range fetchQuestionsForPack queries (2016–2025).
// `size` mirrors the PACK_SIZES placeholders in useOfflineStore.ts — keep
// both in sync once real measurements are in.
export const OFFLINE_PACKS: OfflinePack[] = [
  { id: "eng-all", subject: "English", years: "2016–2025", count: 0, size: "1.2 MB" },
  { id: "math-all", subject: "Mathematics", years: "2016–2025", count: 0, size: "1.0 MB" },
  { id: "phy-all", subject: "Physics", years: "2016–2025", count: 0, size: "0.9 MB" },
  { id: "chem-all", subject: "Chemistry", years: "2016–2025", count: 0, size: "0.9 MB" },
  { id: "bio-all", subject: "Biology", years: "2016–2025", count: 0, size: "0.8 MB" },
  { id: "econ-all", subject: "Economics", years: "2016–2025", count: 0, size: "— (TODO)" },
  { id: "govt-all", subject: "Government", years: "2016–2025", count: 0, size: "— (TODO)" },
  { id: "lit-all", subject: "Literature", years: "2016–2025", count: 0, size: "— (TODO)" },
  { id: "geo-all", subject: "Geography", years: "2016–2025", count: 0, size: "— (TODO)" },
  { id: "crs-all", subject: "CRS", years: "2016–2025", count: 0, size: "— (TODO)" },
  { id: "comm-all", subject: "Commerce", years: "2016–2025", count: 0, size: "— (TODO)" },
  { id: "hist-all", subject: "History", years: "2016–2025", count: 0, size: "— (TODO)" },
  { id: "irs-all", subject: "IRS", years: "2016–2025", count: 0, size: "— (TODO)" },
];