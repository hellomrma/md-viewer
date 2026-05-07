import { useContext } from "react";
import { PreferencesContext } from "./PreferencesContext";
import type { UsePreferencesState } from "@/hooks/usePreferences";

export function usePrefs(): UsePreferencesState {
  const v = useContext(PreferencesContext);
  if (!v) throw new Error("usePrefs must be used within PreferencesProvider");
  return v;
}
