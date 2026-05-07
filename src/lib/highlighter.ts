import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
} from "shiki/bundle/web";

// Languages supported by the web bundle; cast needed because BundledLanguage
// union in shiki/bundle/web doesn't list every alias (e.g. "go", "rust", "diff"
// are real grammars bundled but missing from the narrower type union).
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
] satisfies string[] as unknown as BundledLanguage[];

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
