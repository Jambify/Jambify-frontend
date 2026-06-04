// src/hooks/useExamCountdown.ts
import { useState, useEffect, useCallback } from 'react';
import { useUserStore }                      from '../Store/useUserStore';
import {
  calculateDaysUntilExam,
  formatExamDate,
  msUntilMidnight,
} from '../lib/utils/dateUtils';

interface ExamCountdown {
  daysLeft:      number;      // -1 = invalid date, 0 = today/past, >0 = future
  formattedDate: string;      // e.g. "27 Apr 2027"
  isPast:        boolean;
  isToday:       boolean;
  isUpdating:    boolean;
  updateExamDate: (newDate: string, newYear: string) => Promise<{ error: Error | null }>;
}

export function useExamCountdown(): ExamCountdown {
  const examDate = useUserStore(s => s.examDate);
  const examYear = useUserStore(s => s.examYear);
  const updateExamSettings = useUserStore(s => s.updateExamSettings);
  const targetScore        = useUserStore(s => s.targetScore);

  const [daysLeft, setDaysLeft]         = useState(() => calculateDaysUntilExam(examDate, examYear));
  const [formattedDate, setFormattedDate] = useState(() => formatExamDate(examDate, examYear));
  const [isUpdating, setIsUpdating]     = useState(false);

  // Recompute whenever examDate or examYear changes
  const recalculate = useCallback(() => {
    setDaysLeft(calculateDaysUntilExam(examDate, examYear));
    setFormattedDate(formatExamDate(examDate, examYear));
  }, [examDate, examYear]);

  useEffect(() => {
    // Recalculate immediately when deps change
    recalculate();

    // Schedule one recalculation at midnight, then chain daily
    let dailyInterval: ReturnType<typeof setInterval>;

    const midnightTimeout = setTimeout(() => {
      recalculate();
      // After the first midnight, recalculate every 24 hours
      dailyInterval = setInterval(recalculate, 24 * 60 * 60 * 1000);
    }, msUntilMidnight());

    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(dailyInterval);
    };
  }, [recalculate]); // recalculate is memoized with examDate + examYear

  const updateExamDate = useCallback(async (
    newDate: string,
    newYear: string,
  ): Promise<{ error: Error | null }> => {
    setIsUpdating(true);
    try {
      const result = await updateExamSettings({
        targetScore,
        examYear: newYear,
        examDate: newDate,
      });
      return result;
    } finally {
      setIsUpdating(false);
    }
  }, [updateExamSettings, targetScore]);

  return {
    daysLeft,
    formattedDate,
    isPast:   daysLeft === 0,
    isToday:  daysLeft === 0 && calculateDaysUntilExam(examDate, examYear) === 0,
    isUpdating,
    updateExamDate,
  };
}
