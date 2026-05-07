import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PREFERENCES, type Preferences, type Theme, type Width, type FontSize } from "@/types";

export const PREFS_STORAGE_KEY = "mdv:prefs";

function readStored(): Preferences {
  if (typeof localStorage === "undefined") return DEFAULT_PREFERENCES;
  const raw = localStorage.getItem(PREFS_STORAGE_KEY);
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      theme: (["light", "dark", "system"] as const).includes(parsed.theme as Theme)
        ? (parsed.theme as Theme) : DEFAULT_PREFERENCES.theme,
      width: (["narrow", "normal", "wide"] as const).includes(parsed.width as Width)
        ? (parsed.width as Width) : DEFAULT_PREFERENCES.width,
      font: (["s", "m", "l"] as const).includes(parsed.font as FontSize)
        ? (parsed.font as FontSize) : DEFAULT_PREFERENCES.font,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export interface UsePreferencesState {
  prefs: Preferences;
  setTheme: (t: Theme) => void;
  setWidth: (w: Width) => void;
  setFont: (f: FontSize) => void;
}

export function usePreferences(): UsePreferencesState {
  const [prefs, setPrefs] = useState<Preferences>(() => readStored());

  useEffect(() => {
    try { localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs)); } catch { /* quota — ignore */ }
  }, [prefs]);

  const setTheme = useCallback((theme: Theme) => setPrefs((p) => ({ ...p, theme })), []);
  const setWidth = useCallback((width: Width) => setPrefs((p) => ({ ...p, width })), []);
  const setFont = useCallback((font: FontSize) => setPrefs((p) => ({ ...p, font })), []);

  return { prefs, setTheme, setWidth, setFont };
}
