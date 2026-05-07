import { describe, expect, it } from "vitest";
import { sanitizeSchema } from "./sanitizeSchema";

describe("sanitizeSchema", () => {
  it("inherits a baseline (has tagNames array)", () => {
    expect(Array.isArray(sanitizeSchema.tagNames)).toBe(true);
    expect(sanitizeSchema.tagNames!.length).toBeGreaterThan(20);
  });

  it("allows class on code/pre/span (Shiki output)", () => {
    expect(sanitizeSchema.attributes!.code).toEqual(expect.arrayContaining(["className", "class"]));
    expect(sanitizeSchema.attributes!.pre).toEqual(expect.arrayContaining(["className", "class"]));
    expect(sanitizeSchema.attributes!.span).toEqual(expect.arrayContaining(["className", "class", "style"]));
  });

  it("allows id on heading tags (rehype-slug)", () => {
    for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
      expect(sanitizeSchema.attributes![tag]).toEqual(expect.arrayContaining(["id"]));
    }
  });

  it("allows aria-label and href on a (autolink)", () => {
    expect(sanitizeSchema.attributes!.a).toEqual(expect.arrayContaining(["href", "ariaLabel"]));
  });

  it("does not allow script tag", () => {
    expect(sanitizeSchema.tagNames).not.toContain("script");
  });

  it("disables clobberPrefix so heading ids are not rewritten", () => {
    expect(sanitizeSchema.clobberPrefix).toBe("");
  });
});
