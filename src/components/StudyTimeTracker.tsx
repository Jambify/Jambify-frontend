
import { useEffect } from "react";
import { useStudyTrackingStore } from "../Store/useStudyTrackingStore";

const StudyTimeTracker: React.FC = () => {
  const { startStudySession, stopStudySession } = useStudyTrackingStore();

  useEffect(() => {
    // Start study session when component mounts (app opens)
    startStudySession();

    // Track visibility (pause when tab is hidden, resume when visible)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopStudySession();
      } else {
        startStudySession();
      }
    };

    // Track window focus/blur
    const handleFocus = () => startStudySession();
    const handleBlur = () => stopStudySession();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      stopStudySession();
    };
  }, [startStudySession, stopStudySession]);

  return null;
};

export default StudyTimeTracker;
