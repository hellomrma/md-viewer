import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePreferences, PREFS_STORAGE_KEY } from "./usePreferences";
import { DEFAULT_PREFERENCES } from "@/types";

beforeEach(() => { localStorage.clear(); });
afterEach(() => { vi.restoreAllMocks(); });

describe("usePreferences", () => {
  it("returns defaults when storage is empty", () => {
    const { result } = renderHook(() => usePreferences());
    expect(result.current.prefs).toEqual(DEFAULT_PREFERENCES);
  });

  it("loads stored prefs", () => {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({ theme: "dark", width: "wide", font: "l" }));
    const { result } = renderHook(() => usePreferences());
    expect(result.current.prefs).toEqual({ theme: "dark", width: "wide", font: "l" });
  });

  it("ignores invalid stored payload", () => {
    localStorage.setItem(PREFS_STORAGE_KEY, "{ not json");
    const { result } = renderHook(() => usePreferences());
    expect(result.current.prefs).toEqual(DEFAULT_PREFERENCES);
  });

  it("setTheme updates state and storage", () => {
    const { result } = renderHook(() => usePreferences());
    act(() => result.current.setTheme("dark"));
    expect(result.current.prefs.theme).toBe("dark");
    expect(JSON.parse(localStorage.getItem(PREFS_STORAGE_KEY)!).theme).toBe("dark");
  });

  it("setWidth and setFont update", () => {
    const { result } = renderHook(() => usePreferences());
    act(() => { result.current.setWidth("wide"); result.current.setFont("l"); });
    expect(result.current.prefs.width).toBe("wide");
    expect(result.current.prefs.font).toBe("l");
  });
});
