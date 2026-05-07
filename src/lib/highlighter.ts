import { createHighlighter, type Highlighter } from "shiki";

const LANGS = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "html",
  "css",
  "json",
  "markdown",
  "bash",
  "shell",
  "python",
  "go",
  "rust",
  "yaml",
  "xml",
  "sql",
  "diff",
] as const;

let promise: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
  if (!promise) {
    promise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [...LANGS],
    });
  }
  return promise;
}

export function isSupportedLang(lang: string | undefined): boolean {
  if (!lang) return false;
  return (LANGS as readonly string[]).includes(lang);
}
