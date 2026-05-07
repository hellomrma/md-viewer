import { describe, expect, it } from "vitest";
import { loadMarkdownFile, MAX_FILE_BYTES } from "./useFileLoader";

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
