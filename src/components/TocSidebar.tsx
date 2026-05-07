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
      className="no-print sticky top-16 hidden h-[calc(100vh-5rem)] w-64 shrink-0 overflow-y-auto border-l border-ink-border px-6 py-8 text-sm dark:border-nightInk-border md:block"
    >
      <p className="kicker mb-4">Table of contents</p>
      <ul className="space-y-px">
        {headings.map((h) => {
          const active = h.id === activeId;
          return (
            <li key={h.id} className={indent[h.level]}>
              <a
                href={`#${h.id}`}
                className={
                  active
                    ? "block truncate bg-ink-fg px-2 py-1 font-semibold text-ink-bg dark:bg-nightInk-fg dark:text-nightInk-bg"
                    : "block truncate px-2 py-1 text-ink-muted hover:text-ink-point dark:text-nightInk-muted dark:hover:text-nightInk-point"
                }
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
