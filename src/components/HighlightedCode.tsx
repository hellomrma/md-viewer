import { useEffect, useRef, useState } from "react";
import { getHighlighter, isSupportedLang } from "@/lib/highlighter";

interface Props {
  code: string;
  lang: string;
}

export function HighlightedCode({ code, lang }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    const effectiveLang = isSupportedLang(lang) ? lang : "text";
    getHighlighter()
      .then((h) => {
        if (cancelled.current) return;
        setHtml(
          h.codeToHtml(code, {
            lang: effectiveLang,
            themes: { light: "github-light", dark: "github-dark" },
            defaultColor: false,
          }),
        );
      })
      .catch(() => {});
    return () => {
      cancelled.current = true;
    };
  }, [code, lang]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="group relative my-5">
      {html ? (
        <div
          className="overflow-x-auto rounded-lg [&_pre]:p-4 [&_pre]:font-sans [&_pre]:text-[0.9em] [&_code]:font-sans"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto rounded-lg bg-ink-code p-4 font-sans text-[0.9em] dark:bg-nightInk-code">
          <code>{code}</code>
        </pre>
      )}
      <button
        type="button"
        aria-label={copied ? "복사됨" : "복사"}
        onClick={copy}
        className="absolute right-2 top-2 rounded border border-ink-border bg-ink-bg px-2 py-1 text-xs opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100 dark:border-nightInk-border dark:bg-nightInk-bg max-md:opacity-100"
      >
        {copied ? "복사됨" : "복사"}
      </button>
    </div>
  );
}
