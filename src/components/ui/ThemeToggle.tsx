import React, { useEffect, useRef, useState } from "react";
import {
  STORAGE_KEY,
  TRANSITION_MS,
  type Theme,
  setHtmlTheme,
  applyTheme,
} from "./themeUtils";

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark";
    }
    return "dark";
  });

  const pendingRef = useRef(false);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (e.newValue === "light" || e.newValue === "dark") {
        setHtmlTheme(e.newValue);
        setTheme(e.newValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggle = () => {
    if (pendingRef.current) return;
    pendingRef.current = true;

    const next: Theme = theme === "dark" ? "light" : "dark";

    applyTheme(next);
    setTheme(next);

    setTimeout(() => {
      pendingRef.current = false;
    }, TRANSITION_MS + 50);
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-brand border-borderMuted hover:bg-bgSurface text-textMuted hover:text-textMain relative flex h-8 w-8 items-center justify-center overflow-hidden border"
    >
      {/* Sun — shown in dark mode, click → go light */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          opacity: isDark ? 1 : 0,
          transform: isDark
            ? "scale(1) rotate(0deg)"
            : "scale(0.5) rotate(90deg)",
          transition:
            "opacity 200ms cubic-bezier(0.4,0,0.2,1), transform 200ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </span>

      {/* Moon — shown in light mode, click → go dark */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          opacity: isDark ? 0 : 1,
          transform: isDark
            ? "scale(0.5) rotate(-90deg)"
            : "scale(1) rotate(0deg)",
          transition:
            "opacity 200ms cubic-bezier(0.4,0,0.2,1), transform 200ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  );
};

export default ThemeToggle;
