import { createContext, useEffect, type ReactNode } from "react";
import { usePreferences, type UsePreferencesState } from "@/hooks/usePreferences";

// eslint-disable-next-line react-refresh/only-export-components -- context object must live alongside provider
export const PreferencesContext = createContext<UsePreferencesState | null>(null);

function applyDarkClass(theme: string) {
  if (typeof document === "undefined") return;
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const value = usePreferences();

  useEffect(() => { applyDarkClass(value.prefs.theme); }, [value.prefs.theme]);

  useEffect(() => {
    if (value.prefs.theme !== "system") return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyDarkClass("system");
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [value.prefs.theme]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
