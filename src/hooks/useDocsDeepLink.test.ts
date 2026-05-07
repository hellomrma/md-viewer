import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDocsDeepLink } from "./useDocsDeepLink";
import type { DocEntry } from "@/types";

const docs: DocEntry[] = [
  { file: "a.md", title: "Alpha", sizeKB: 1 },
  { file: "b.md", title: "Beta", sizeKB: 1 },
];

beforeEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("useDocsDeepLink", () => {
  it("does nothing while docs is null", () => {
    const onResolve = vi.fn();
    renderHook(() => useDocsDeepLink({ docs: null, onResolve }));
    expect(onResolve).not.toHaveBeenCalled();
  });

  it("does not resolve on mount when no ?doc (preserves user state)", () => {
    const onResolve = vi.fn();
    renderHook(() => useDocsDeepLink({ docs, onResolve }));
    expect(onResolve).not.toHaveBeenCalled();
  });

  it("resolves to home on popstate when ?doc removed", () => {
    window.history.replaceState({}, "", "/?doc=a.md");
    const onResolve = vi.fn();
    renderHook(() => useDocsDeepLink({ docs, onResolve }));
    onResolve.mockClear();

    act(() => {
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(onResolve).toHaveBeenLastCalledWith("home");
  });

  it("resolves to matching entry when ?doc matches", () => {
    window.history.replaceState({}, "", "/?doc=a.md");
    const onResolve = vi.fn();
    renderHook(() => useDocsDeepLink({ docs, onResolve }));
    expect(onResolve).toHaveBeenCalledWith(docs[0]);
  });

  it("resolves to 'missing' when ?doc not in manifest", () => {
    window.history.replaceState({}, "", "/?doc=zzz.md");
    const onResolve = vi.fn();
    renderHook(() => useDocsDeepLink({ docs, onResolve }));
    expect(onResolve).toHaveBeenCalledWith("missing");
  });

  it("re-resolves on popstate", () => {
    const onResolve = vi.fn();
    renderHook(() => useDocsDeepLink({ docs, onResolve }));
    onResolve.mockClear();

    act(() => {
      window.history.pushState({}, "", "/?doc=b.md");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(onResolve).toHaveBeenLastCalledWith(docs[1]);
  });

  it("navigateToDoc updates URL to ?doc=<file>", () => {
    const onResolve = vi.fn();
    const { result } = renderHook(() =>
      useDocsDeepLink({ docs, onResolve }),
    );
    act(() => result.current.navigateToDoc(docs[0]));
    expect(new URL(window.location.href).searchParams.get("doc")).toBe("a.md");
  });

  it("navigateToHome removes ?doc from URL", () => {
    window.history.replaceState({}, "", "/?doc=a.md");
    const onResolve = vi.fn();
    const { result } = renderHook(() =>
      useDocsDeepLink({ docs, onResolve }),
    );
    act(() => result.current.navigateToHome());
    expect(new URL(window.location.href).searchParams.get("doc")).toBeNull();
  });
});
