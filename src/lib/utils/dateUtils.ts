// src/utils/dateUtils.ts

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

/**
 * Parse a date string like "Apr 27" or "April 27" into a Date object.
 * Uses the supplied year. Returns null if parsing fails.
 */
function parseExamDate(
  examDateStr: string,
  examYear: string,
): Date | null {
  if (!examDateStr?.trim() || !examYear?.trim()) return null;

  const parts = examDateStr.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const monthKey = parts[0].toLowerCase();
  const day = parseInt(parts[1], 10);
  const year = parseInt(examYear, 10);

  const monthIndex = MONTH_MAP[monthKey];
  if (monthIndex === undefined || isNaN(day) || isNaN(year)) return null;

  const d = new Date(year, monthIndex, day, 0, 0, 0, 0);
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Returns the number of calendar days until the exam.
 * Returns 0 if the exam is today or in the past.
 * Returns -1 if the date is invalid.
 */
export function calculateDaysUntilExam(
  examDateStr: string,
  examYear: string,
): number {
  const examDate = parseExamDate(examDateStr, examYear);
  if (!examDate) return -1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = examDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Returns a formatted string like "Apr 27, 2027".
 */
export function formatExamDate(examDateStr: string, examYear: string): string {
  if (!examDateStr?.trim() || !examYear?.trim()) return "Date not set";
  const examDate = parseExamDate(examDateStr, examYear);
  if (!examDate) return "Invalid date";

  return examDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Returns milliseconds until next midnight (local time).
 * Used to schedule daily recalculation.
 */
export function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  return midnight.getTime() - now.getTime();
}
