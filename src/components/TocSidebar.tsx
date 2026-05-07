import type { Heading } from "@/types";

interface Props {
  headings: Heading[];
  activeId: string | null;
}

const indent: Record<1 | 2 | 3, string> = {
  1: "pl-0",
  2: "pl-3",
  3: "pl-6",
};

export function TocSidebar({ headings, activeId }: Props) {
  if (headings.length === 0) return null;
  return (
    <aside
      aria-label="목차"
      className="sticky top-16 hidden h-[calc(100vh-5rem)] w-60 shrink-0 overflow-y-auto border-l border-ink-border px-4 py-6 text-sm dark:border-nightInk-border md:block no-print"
    >
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-nightInk-muted">
        목차
      </h2>
      <ul className="space-y-1">
        {headings.map((h) => {
          const active = h.id === activeId;
          return (
            <li key={h.id} className={indent[h.level]}>
              <a
                href={`#${h.id}`}
                className={`block truncate rounded px-2 py-1 transition hover:bg-ink-code dark:hover:bg-nightInk-code ${
                  active
                    ? "bg-ink-code font-semibold text-ink-fg dark:bg-nightInk-code dark:text-nightInk-fg"
                    : "text-ink-muted dark:text-nightInk-muted"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
