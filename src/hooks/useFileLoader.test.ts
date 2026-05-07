import { describe, expect, it, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { loadMarkdownFile, MAX_FILE_BYTES, useFileLoader } from "./useFileLoader";

function makeFile(name: string, content: string, type = "text/markdown"): File {
  return new File([content], name, { type });
}

describe("loadMarkdownFile", () => {
  it("rejects non-md extension", async () => {
    const result = await loadMarkdownFile(makeFile("foo.txt", "x"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("BAD_EXT");
  });

  it("accepts .md", async () => {
    const result = await loadMarkdownFile(makeFile("foo.md", "# hi"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("foo.md");
      expect(result.value.content).toBe("# hi");
      expect(result.value.sizeKB).toBeGreaterThan(0);
    }
  });

  it("accepts .markdown", async () => {
    const result = await loadMarkdownFile(makeFile("doc.markdown", "ok"));
    expect(result.ok).toBe(true);
  });

  it("rejects files over 5MB", async () => {
    const big = new File([new Uint8Array(MAX_FILE_BYTES + 1)], "big.md");
    const result = await loadMarkdownFile(big);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("TOO_LARGE");
  });

  it("rejects non-utf8 bytes", async () => {
    const invalid = new File([new Uint8Array([0xff, 0xfe, 0xfd])], "x.md");
    const result = await loadMarkdownFile(invalid);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("BAD_ENCODING");
  });

  it("accepts empty file as ok with empty content", async () => {
    const result = await loadMarkdownFile(makeFile("empty.md", ""));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.content).toBe("");
  });
});

describe("useFileLoader.loadFromUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads markdown from /docs/<file>", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        expect(url).toBe("/docs/guide.md");
        return new Response("# Guide\n\nbody", {
          status: 200,
          headers: { "content-type": "text/markdown" },
        });
      }),
    );

    const { result } = renderHook(() => useFileLoader());
    await act(async () => {
      await result.current.loadFromUrl("guide.md");
    });
    expect(result.current.error).toBeNull();
    expect(result.current.file?.name).toBe("guide.md");
    expect(result.current.file?.content).toBe("# Guide\n\nbody");
  });

  it("sets FETCH_FAILED on 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not found", { status: 404 })),
    );

    const { result } = renderHook(() => useFileLoader());
    await act(async () => {
      await result.current.loadFromUrl("missing.md");
    });
    expect(result.current.error).toBe("FETCH_FAILED");
    expect(result.current.file).toBeNull();
  });

  it("sets FETCH_FAILED on network error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("net"); }));

    const { result } = renderHook(() => useFileLoader());
    await act(async () => {
      await result.current.loadFromUrl("any.md");
    });
    expect(result.current.error).toBe("FETCH_FAILED");
  });

  it("encodes file name in URL", async () => {
    const fetchMock = vi.fn(async () =>
      new Response("# x", { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFileLoader());
    await act(async () => {
      await result.current.loadFromUrl("hello world.md");
    });
    expect(fetchMock).toHaveBeenCalledWith("/docs/hello%20world.md");
  });
});
