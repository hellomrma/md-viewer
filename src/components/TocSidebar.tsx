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
      className="toc-scrollbar no-print fixed bottom-6 right-4 top-20 z-10 hidden w-60 overflow-y-auto rounded-lg border border-ink-border bg-ink-bg/95 backdrop-blur-sm px-5 pt-5 pb-6 text-sm shadow-lg dark:border-[#2a2a2a] dark:bg-[#111]/35 md:block"
    >
      <p className="kicker mb-5 dark:text-[#888]">Table of contents</p>
      <ul className="space-y-0.5">
        {headings.map((h) => {
          const active = h.id === activeId;
          return (
            <li key={h.id} className={indent[h.level]}>
              <a
                href={`#${h.id}`}
                className={
                  active
                    ? "block truncate rounded px-2 py-1.5 font-semibold bg-ink-fg text-ink-bg dark:bg-[#e7e8ec] dark:text-[#23262c]"
                    : "block truncate rounded px-2 py-1.5 text-ink-muted hover:bg-ink-surface hover:text-ink-fg dark:text-[#a4a8b1] dark:hover:bg-[#333] dark:hover:text-[#e7e8ec]"
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
