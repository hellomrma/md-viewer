import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActiveHeading } from "./useActiveHeading";
import type { Heading } from "@/types";

type IOCallback = (entries: Array<{ target: Element; isIntersecting: boolean; intersectionRatio: number }>) => void;

let lastCallback: IOCallback | null = null;

class MockIO {
  callback: IOCallback;
  constructor(cb: IOCallback) { this.callback = cb; lastCallback = cb; }
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  lastCallback = null;
  (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
    MockIO as unknown as typeof IntersectionObserver;
  document.body.innerHTML = '<h1 id="a">A</h1><h2 id="b">B</h2>';
});

describe("useActiveHeading", () => {
  it("returns null initially", () => {
    const headings: Heading[] = [{ id: "a", text: "A", level: 1 }];
    const { result } = renderHook(() => useActiveHeading(headings));
    expect(result.current).toBeNull();
  });

  it("updates when an entry becomes intersecting", () => {
    const headings: Heading[] = [
      { id: "a", text: "A", level: 1 },
      { id: "b", text: "B", level: 2 },
    ];
    const { result } = renderHook(() => useActiveHeading(headings));
    act(() => {
      lastCallback!([
        { target: document.getElementById("b")!, isIntersecting: true, intersectionRatio: 1 },
      ]);
    });
    expect(result.current).toBe("b");
  });
});
