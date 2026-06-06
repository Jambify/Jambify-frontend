/**
 * SM-2 Spaced Repetition Algorithm
 * ──────────────────────────────────
 * Used to schedule when a question should be reviewed again.
 * Called after each quiz session for every answered question.
 *
 * Quality scale (0–5):
 *   5 = perfect response
 *   4 = correct with minor hesitation
 *   3 = correct with serious difficulty
 *   2 = incorrect but correct answer felt easy to recall
 *   1 = incorrect, correct answer remembered
 *   0 = complete blackout
 *
 * Returns the next review interval in days.
 */

export interface SM2Card {
  id: string;
  easeFactor: number; // starts at 2.5, min 1.3
  interval: number; // days until next review
  repetitions: number; // times reviewed successfully
  nextReview: number; // Date.now() timestamp
}

export function sm2(card: SM2Card, quality: number): SM2Card {
  if (quality < 0 || quality > 5) throw new Error("Quality must be 0–5");

  let { easeFactor, interval, repetitions } = card;

  if (quality < 3) {
    // Failed — reset repetitions, review again tomorrow
    repetitions = 0;
    interval = 1;
  } else {
    // Passed — advance interval
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions++;
  }

  // Update ease factor based on quality
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReview: Date.now() + interval * 24 * 60 * 60 * 1000,
  };
}

/** Convert a correct/incorrect result to a quality score */
export function resultToQuality(
  correct: boolean,
  timeSpent: number,
  totalTime: number,
): number {
  if (!correct) return 1;
  const ratio = timeSpent / totalTime;
  if (ratio < 0.25) return 5; // fast and correct
  if (ratio < 0.6) return 4; // normal pace
  return 3; // slow but correct
}
