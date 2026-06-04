import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  initialSeconds: number;
  onExpire?:      () => void;
  autoStart?:     boolean;
}

interface UseTimerReturn {
  timeLeft:  number;
  formatted: string;    // "1:30" format
  pct:       number;    // 0–100, useful for progress bars
  isRunning: boolean;
  reset:     (seconds?: number) => void;
  pause:     () => void;
  resume:    () => void;
}

export function useTimer({
  initialSeconds,
  onExpire,
  autoStart = true,
}: UseTimerOptions): UseTimerReturn {
  const [timeLeft,  setTimeLeft]  = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  /** Use a ref for the interval so we never close over stale state */
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef  = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const clearTick = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!isRunning) { clearTick(); return; }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTick();
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTick;
  }, [isRunning, clearTick]);

  const reset = useCallback((seconds = initialSeconds) => {
    clearTick();
    setTimeLeft(seconds);
    setIsRunning(true);
  }, [initialSeconds, clearTick]);

  const pause  = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true),  []);

  const mins      = Math.floor(timeLeft / 60);
  const secs      = timeLeft % 60;
  const formatted = `${mins}:${String(secs).padStart(2, '0')}`;
  const pct       = Math.round((timeLeft / initialSeconds) * 100);

  return { timeLeft, formatted, pct, isRunning, reset, pause, resume };
}
