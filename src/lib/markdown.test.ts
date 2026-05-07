import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { remarkPlugins, rehypePlugins } from "./markdown";

async function render(md: string): Promise<string> {
  const proc = unified().use(remarkParse);
  for (const p of remarkPlugins) proc.use(...(Array.isArray(p) ? p : [p]));
  proc.use(remarkRehype, { allowDangerousHtml: false });
  for (const p of rehypePlugins) proc.use(...(Array.isArray(p) ? p : [p]));
  proc.use(rehypeStringify, { allowDangerousHtml: false });
  const file = await proc.process(md);
  return String(file);
}

describe("markdown pipeline", () => {
  it("renders headings with slug ids", async () => {
    const html = await render("# Hello World\n\n## Sub Title");
    // rehype-sanitize prefixes heading ids with "user-content-" via defaultSchema clobberPrefix
    expect(html).toMatch(/id="(user-content-)?hello-world"/);
    expect(html).toMatch(/id="(user-content-)?sub-title"/);
  });

  it("renders GFM tables", async () => {
    const html = await render("| a | b |\n| - | - |\n| 1 | 2 |\n");
    expect(html).toContain("<table>");
    expect(html).toContain("<th>a</th>");
  });

  it("renders GFM task lists with checkboxes", async () => {
    const html = await render("- [x] done\n- [ ] todo\n");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("checked");
  });

  it("strips <script> via sanitize", async () => {
    const html = await render('<script>alert(1)</script>\n\nHi');
    expect(html).not.toContain("<script");
    expect(html).toContain("Hi");
  });

  it("strips javascript: URL via sanitize", async () => {
    const html = await render("[click](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });

  it("highlights fenced code with shiki (adds shiki span class)", async () => {
    const html = await render("```ts\nconst x: number = 1;\n```\n");
    // Shiki outputs class="shiki ..." on <pre> and inline <span style=...>
    expect(html).toMatch(/class="[^"]*shiki/);
  });

  it("autolinks headings (anchor element)", async () => {
    const html = await render("# Title");
    expect(html).toContain('href="#title"');
  });
});
