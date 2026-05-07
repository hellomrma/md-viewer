import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
} from "shiki/bundle/web";

const LANGS: BundledLanguage[] = [
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
];

let promise: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
  if (!promise) {
    promise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: LANGS,
    });
  }
  return promise;
}

export function isSupportedLang(lang: string | undefined): boolean {
  if (!lang) return false;
  return (LANGS as readonly string[]).includes(lang);
}
