/**
 * ThemeToggle.tsx
 * ───────────────
 * Sun / Moon toggle — dark (default) ↔ light theme.
 *
 * DOM strategy:
 *   dark  → <html>                    (no attribute, :root vars apply)
 *   light → <html data-theme="light"> ([data-theme="light"] vars apply)
 *
 * Theme swap is SYNCHRONOUS — setAttribute/removeAttribute happens
 * in the same microtask as the click handler. CSS transitions on
 * .theme-ready * handle the smooth animation automatically.
 * No rAF, no setTimeout, no intermediate states = no flash.
 *
 * Preload guard:
 *   `.preload` on <html> (added by initTheme) suppresses all transitions
 *   until 100ms after the page loads, preventing cold-load flash.
 */

import React, { useEffect, useRef, useState } from "react";

/* ── constants ────────────────────────────────────────── */

const STORAGE_KEY = "schooldra-theme";
const TRANSITION_MS = 200;

/* ── types ────────────────────────────────────────────── */

type Theme = "dark" | "light";

/* ── pure helpers ─────────────────────────────────────── */

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function getSavedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* private browsing */
  }
  return null;
}

function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

/* ── Single atomic DOM write ──────────────────────────── */
// setAttribute and removeAttribute are both single operations.
// The browser will never see a state with NO theme applied.
function setHtmlTheme(theme: Theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   initTheme — call synchronously in main.tsx before render
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function initTheme() {
  const html = document.documentElement;
  const theme = getSavedTheme() ?? getSystemTheme();

  // Block transitions during initial paint so the correct theme
  // is applied instantly with no animation on page load.
  html.classList.add("preload");

  // Apply theme synchronously — no rAF, no delay.
  setHtmlTheme(theme);

  // Remove preload guard after first paint + a small buffer.
  // Using 'load' event ensures the DOM is fully painted first.
  const enable = () => {
    setTimeout(() => {
      html.classList.remove("preload");
      html.classList.add("theme-ready");
    }, 100);
  };

  if (document.readyState === "complete") {
    enable();
  } else {
    window.addEventListener("load", enable, { once: true });
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   applyTheme — synchronous, atomic, no intermediate state
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function applyTheme(theme: Theme) {
  // Write the new theme value in ONE synchronous operation.
  // setAttribute/removeAttribute is atomic — the browser never
  // renders a frame where neither theme is applied.
  // The .theme-ready CSS rule handles the 200ms transition.
  setHtmlTheme(theme);
  persistTheme(theme);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ThemeToggle component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark";
    }
    return "dark";
  });

  // Debounce: ignore clicks until the CSS transition finishes
  const pendingRef = useRef(false);

  // Cross-tab sync
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

    // 1. Swap the DOM attribute synchronously — zero intermediate state
    applyTheme(next);

    // 2. Update React state so the icon animates
    setTheme(next);

    // 3. Re-enable after the CSS transition completes
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
