export const STORAGE_KEY = "schooldra-theme";
export const TRANSITION_MS = 200;

export type Theme = "dark" | "light";

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function getSavedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* private browsing */
  }
  return null;
}

export function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function setHtmlTheme(theme: Theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

export function initTheme() {
  const html = document.documentElement;
  const theme = getSavedTheme() ?? getSystemTheme();

  html.classList.add("preload");

  setHtmlTheme(theme);

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

export function applyTheme(theme: Theme) {
  setHtmlTheme(theme);
  persistTheme(theme);
}
