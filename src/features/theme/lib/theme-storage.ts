import type { Theme } from "@/features/theme/context/theme-context-value";

const STORAGE_KEY = "estancia360-theme";

export function readStoredTheme(): Theme | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function writeStoredTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
}

export function getPreferredTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
