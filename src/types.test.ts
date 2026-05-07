import { describe, expect, it } from "vitest";
import type { FileMeta, Preferences, Heading } from "./types";
import { DEFAULT_PREFERENCES } from "./types";

describe("types module", () => {
  it("exports DEFAULT_PREFERENCES with expected shape", () => {
    expect(DEFAULT_PREFERENCES).toEqual({
      theme: "system",
      width: "normal",
      font: "m",
    });
  });

  it("FileMeta accepts a valid shape", () => {
    const meta: FileMeta = { name: "x.md", content: "# Hi", sizeKB: 1 };
    expect(meta.name).toBe("x.md");
  });

  it("Heading accepts a valid shape", () => {
    const h: Heading = { id: "intro", text: "Intro", level: 1 };
    expect(h.level).toBe(1);
  });

  it("Preferences union types compile", () => {
    const p: Preferences = { theme: "dark", width: "wide", font: "l" };
    expect(p.theme).toBe("dark");
  });
});
