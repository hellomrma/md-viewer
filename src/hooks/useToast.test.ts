import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "./useToast";

describe("useToast", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it("push adds a toast and auto-removes after 4s", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());
    act(() => { result.current.push({ variant: "info", text: "hi" }); });
    expect(result.current.toasts).toHaveLength(1);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(result.current.toasts).toEqual([]);
    vi.useRealTimers();
  });

  it("dismiss removes immediately", () => {
    const { result } = renderHook(() => useToast());
    let id = -1;
    act(() => { id = result.current.push({ variant: "error", text: "boom" }); });
    expect(result.current.toasts).toHaveLength(1);
    act(() => { result.current.dismiss(id); });
    expect(result.current.toasts).toEqual([]);
  });
});
