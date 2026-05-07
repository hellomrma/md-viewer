import { useRef, useState, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}

export function CodeBlock({ children, className, ...rest }: Props) {
  const ref = useRef<HTMLPreElement | null>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = ref.current?.innerText || ref.current?.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard failure — ignore quietly */
    }
  }

  return (
    <div className="group relative">
      <pre ref={ref} className={className} {...rest}>
        {children}
      </pre>
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
