import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { extractTitle, buildManifest, writeManifest } from "./docs-manifest";

describe("extractTitle", () => {
  it("returns first H1 line", () => {
    expect(extractTitle("# Hello\n\nbody", "x.md")).toBe("Hello");
  });

  it("trims whitespace", () => {
    expect(extractTitle("#   spaced   \n", "x.md")).toBe("spaced");
  });

  it("ignores H1 inside backtick fenced code blocks", () => {
    const src = "```\n# not a title\n```\n# real title";
    expect(extractTitle(src, "x.md")).toBe("real title");
  });

  it("ignores H1 inside tilde fenced code blocks", () => {
    const src = "~~~\n# not a title\n~~~\n# real title";
    expect(extractTitle(src, "x.md")).toBe("real title");
  });

  it("ignores H2/H3/etc.", () => {
    expect(extractTitle("## sub\n# top", "x.md")).toBe("top");
  });

  it("falls back to filename when no H1 found", () => {
    expect(extractTitle("just body text", "my_doc.md")).toBe("My doc");
    expect(extractTitle("", "getting-started.markdown")).toBe("Getting started");
  });

  it("does not match `#` followed by non-space", () => {
    // `#foo` is not a heading
    expect(extractTitle("#foo\n# real", "x.md")).toBe("real");
  });
});

describe("buildManifest", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "docs-manifest-"));
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("returns empty docs for empty directory", async () => {
    const m = await buildManifest(dir);
    expect(m.version).toBe(1);
    expect(m.docs).toEqual([]);
    expect(typeof m.generatedAt).toBe("string");
  });

  it("returns empty docs when directory does not exist", async () => {
    const m = await buildManifest(path.join(dir, "missing"));
    expect(m.docs).toEqual([]);
  });

  it("collects .md and .markdown files", async () => {
    await fs.writeFile(path.join(dir, "a.md"), "# Alpha\n");
    await fs.writeFile(path.join(dir, "b.markdown"), "# Bravo\n");
    await fs.writeFile(path.join(dir, "ignore.txt"), "# Nope\n");
    const m = await buildManifest(dir);
    expect(m.docs.map((d) => d.file).sort()).toEqual(["a.md", "b.markdown"]);
    const titles = Object.fromEntries(m.docs.map((d) => [d.file, d.title]));
    expect(titles["a.md"]).toBe("Alpha");
    expect(titles["b.markdown"]).toBe("Bravo");
  });

  it("excludes manifest.json itself", async () => {
    await fs.writeFile(path.join(dir, "manifest.json"), "{}");
    await fs.writeFile(path.join(dir, "real.md"), "# Real\n");
    const m = await buildManifest(dir);
    expect(m.docs.map((d) => d.file)).toEqual(["real.md"]);
  });

  it("sorts docs by file name (Korean locale)", async () => {
    await fs.writeFile(path.join(dir, "c.md"), "# C\n");
    await fs.writeFile(path.join(dir, "a.md"), "# A\n");
    await fs.writeFile(path.join(dir, "b.md"), "# B\n");
    const m = await buildManifest(dir);
    expect(m.docs.map((d) => d.file)).toEqual(["a.md", "b.md", "c.md"]);
  });

  it("computes sizeKB from full file size, not from 8KB head read", async () => {
    const big = "# Title\n" + "x".repeat(20 * 1024); // 20+KB
    await fs.writeFile(path.join(dir, "big.md"), big);
    const m = await buildManifest(dir);
    expect(m.docs[0].sizeKB).toBeGreaterThanOrEqual(20);
  });

  it("falls back to filename title when H1 absent", async () => {
    await fs.writeFile(path.join(dir, "no-heading.md"), "just body\n");
    const m = await buildManifest(dir);
    expect(m.docs[0].title).toBe("No heading");
  });
});

describe("writeManifest", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "docs-manifest-write-"));
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("writes manifest.json with valid schema", async () => {
    await fs.writeFile(path.join(dir, "x.md"), "# X\n");
    await writeManifest(dir);
    const raw = await fs.readFile(path.join(dir, "manifest.json"), "utf8");
    const parsed = JSON.parse(raw);
    expect(parsed.version).toBe(1);
    expect(parsed.docs).toEqual([
      { file: "x.md", title: "X", sizeKB: 1 },
    ]);
  });

  it("creates directory if missing", async () => {
    const subdir = path.join(dir, "missing-yet");
    await writeManifest(subdir);
    const raw = await fs.readFile(path.join(subdir, "manifest.json"), "utf8");
    expect(JSON.parse(raw).docs).toEqual([]);
  });
});
