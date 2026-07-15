import { useState, useEffect, useRef, useCallback } from "react";

interface UseTimerOptions {
  initialSeconds: number;
  onExpire?: () => void;
  autoStart?: boolean;
  persistenceKey?: string; // Optional key to persist across refreshes
}

interface UseTimerReturn {
  timeLeft: number;
  formatted: string; // "1:30" format
  pct: number; // 0–100, useful for progress bars
  isRunning: boolean;
  reset: (seconds?: number) => void;
  pause: () => void;
  resume: () => void;
  sync: () => void; // Manually sync with stored end time
}

export function useTimer({
  initialSeconds,
  onExpire,
  autoStart = true,
  persistenceKey = "Schooldra-quiz-timer",
}: UseTimerOptions): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  /** Use a ref for the interval so we never close over stale state */
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const clearTick = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
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

  const sync = useCallback(() => {
    const endTime = getEndTime();
    if (!endTime) return;

    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    setTimeLeft(remaining);

    if (remaining <= 0) {
      clearTick();
      setIsRunning(false);
      clearPersistence();
      onExpireRef.current?.();
    }
  }, [getEndTime, clearTick, clearPersistence]);

  useEffect(() => {
    if (!isRunning) {
      clearTick();
      return;
    }

    let endTime = getEndTime();
    if (!endTime) {
      endTime = Date.now() + timeLeft * 1000;
      setEndTime(endTime);
    }

    sync();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const currentEndTime = getEndTime() || (now + timeLeft * 1000);
      const remaining = Math.max(0, Math.floor((currentEndTime - now) / 1000));

      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearTick();
        setIsRunning(false);
        clearPersistence();
        onExpireRef.current?.();
      }
    }, 1000);

    // Visibility change listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearTick();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, clearTick, sync, getEndTime, setEndTime, clearPersistence, timeLeft]);

  const reset = useCallback(
    (seconds = initialSeconds) => {
      clearTick();
      const newEndTime = Date.now() + seconds * 1000;
      setEndTime(newEndTime);
      setTimeLeft(seconds);
      setIsRunning(true);
    },
    [initialSeconds, clearTick, setEndTime],
  );

  const pause = useCallback(() => {
    setIsRunning(false);
    clearPersistence();
  }, [clearPersistence]);

  const resume = useCallback(() => {
    const newEndTime = Date.now() + timeLeft * 1000;
    setEndTime(newEndTime);
    setIsRunning(true);
  }, [timeLeft, setEndTime]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formatted = `${mins}:${String(secs).padStart(2, "0")}`;
  const pct = Math.round((timeLeft / initialSeconds) * 100);

  return { timeLeft, formatted, pct, isRunning, reset, pause, resume, sync };
}
