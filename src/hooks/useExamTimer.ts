// src/hooks/useExamTimer.ts

import { useState, useEffect, useRef, useCallback } from "react";

export type TimerStatus = "green" | "yellow" | "orange" | "red";

interface UseExamTimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
}

export const useExamTimer = ({
  initialTime,
  onTimeUp,
  isActive,
}: UseExamTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopTimer();
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [isActive, onTimeUp, stopTimer]);

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
