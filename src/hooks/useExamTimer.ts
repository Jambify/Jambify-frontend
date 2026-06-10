// src/hooks/useExamTimer.ts

import { useState, useEffect, useRef, useCallback } from "react";

export type TimerStatus = "green" | "yellow" | "orange" | "red";

interface UseExamTimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
  persistenceKey?: string; // Optional key to persist across refreshes
}

export const useExamTimer = ({
  initialTime,
  onTimeUp,
  isActive,
  persistenceKey = "jambify-exam-timer",
}: UseExamTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUpRef in sync
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── Persistence Logic ───────────────────────────────────────────────
  const getEndTime = useCallback(() => {
    const saved = localStorage.getItem(`${persistenceKey}-end`);
    return saved ? parseInt(saved, 10) : null;
  }, [persistenceKey]);

  const setEndTime = useCallback((time: number) => {
    localStorage.setItem(`${persistenceKey}-end`, time.toString());
  }, [persistenceKey]);

  const clearPersistence = useCallback(() => {
    localStorage.removeItem(`${persistenceKey}-end`);
  }, [persistenceKey]);

  const syncTimer = useCallback(() => {
    const endTime = getEndTime();
    if (!endTime) return;

    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    setTimeLeft(remaining);

    if (remaining <= 0) {
      stopTimer();
      clearPersistence();
      onTimeUpRef.current();
    }
  }, [getEndTime, clearPersistence, stopTimer]);

  useEffect(() => {
    if (isActive) {
      let endTime = getEndTime();
      
      // If no end time exists but timer is active, initialize it
      if (!endTime) {
        endTime = Date.now() + initialTime * 1000;
        setEndTime(endTime);
      }

      syncTimer();

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const currentEndTime = getEndTime() || (now + timeLeft * 1000);
        const remaining = Math.max(0, Math.floor((currentEndTime - now) / 1000));
        
        setTimeLeft(remaining);

        if (remaining <= 0) {
          stopTimer();
          clearPersistence();
          onTimeUpRef.current();
        }
      }, 1000);

      // Listen for tab focus/visibility changes to resync
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          syncTimer();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        stopTimer();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    } else {
      stopTimer();
      // We only clear persistence if the exam is explicitly finished/reset, 
      // not just paused (though exams usually aren't paused)
    }
  }, [isActive, initialTime, syncTimer, getEndTime, setEndTime, clearPersistence, stopTimer]);

  // Handle manual clear (e.g. when exam is reset or finished early)
  useEffect(() => {
    if (!isActive) {
      clearPersistence();
    }
  }, [isActive, clearPersistence]);

  const getTimerStatus = (): TimerStatus => {
    const minutesLeft = timeLeft / 60;
    if (minutesLeft < 5) return "red";
    if (minutesLeft < 15) return "orange";
    if (minutesLeft < 30) return "yellow";
    return "green";
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    status: getTimerStatus(),
    setTimeLeft,
  };
};
