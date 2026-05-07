import type { DocEntry } from "@/types";

interface Props {
  docs: DocEntry[];
  onSelect: (entry: DocEntry) => void;
}

export function Library({ docs, onSelect }: Props) {
  if (docs.length === 0) return null;

  return (
    <section className="border-t border-ink-border dark:border-nightInk-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="kicker mb-6">Library</p>
        <h2
          className="mb-14 max-w-2xl text-3xl font-semibold text-ink-fg dark:text-nightInk-fg sm:text-4xl"
          style={{ letterSpacing: "-0.025em", lineHeight: 1.15 }}
        >
          라이브러리에서 바로 열기
        </h2>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d, i) => (
            <button
              key={d.file}
              type="button"
              onClick={() => onSelect(d)}
              className="ed-card text-left"
            >
              <p
                className="mb-2 text-xs text-ink-subtle dark:text-nightInk-subtle"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3
                className="mb-3 text-xl font-semibold text-ink-fg dark:text-nightInk-fg"
                style={{ letterSpacing: "-0.025em" }}
              >
                {d.title}
              </h3>
              <p className="kicker mb-2">{d.file}</p>
              <p className="text-xs text-ink-subtle dark:text-nightInk-subtle">
                {d.sizeKB} KB
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
