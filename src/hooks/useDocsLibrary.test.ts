import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDocsLibrary } from "./useDocsLibrary";

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(body: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(
      typeof body === "string" ? body : JSON.stringify(body),
      { status, headers: { "content-type": "application/json" } },
    )),
  );
}

describe("useDocsLibrary", () => {
  it("starts in loading state", () => {
    mockFetch({ version: 1, generatedAt: "x", docs: [] });
    const { result } = renderHook(() => useDocsLibrary());
    expect(result.current.status).toBe("loading");
  });

  it("transitions to ready with valid manifest", async () => {
    mockFetch({
      version: 1,
      generatedAt: "x",
      docs: [{ file: "a.md", title: "A", sizeKB: 1 }],
    });
    const { result } = renderHook(() => useDocsLibrary());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    if (result.current.status === "ready") {
      expect(result.current.docs).toEqual([
        { file: "a.md", title: "A", sizeKB: 1 },
      ]);
    }
  });

  it("transitions to error on 404", async () => {
    mockFetch("missing", 404);
    const { result } = renderHook(() => useDocsLibrary());
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("transitions to error on invalid JSON", async () => {
    mockFetch("not json {", 200);
    const { result } = renderHook(() => useDocsLibrary());
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("transitions to error on wrong version", async () => {
    mockFetch({ version: 2, docs: [] });
    const { result } = renderHook(() => useDocsLibrary());
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("transitions to error when docs is not an array", async () => {
    mockFetch({ version: 1, docs: "nope" });
    const { result } = renderHook(() => useDocsLibrary());
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("transitions to error when entries are malformed", async () => {
    mockFetch({ version: 1, docs: [{ file: "a.md" }] });
    const { result } = renderHook(() => useDocsLibrary());
    await waitFor(() => expect(result.current.status).toBe("error"));
  });
});
