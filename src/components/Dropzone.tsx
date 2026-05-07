import { useCallback, useRef, useState } from "react";

interface Props {
  onFiles: (files: FileList | File[]) => void;
}

const FEATURES: { num: string; title: string; desc: string }[] = [
  {
    num: "01",
    title: "로컬 처리",
    desc: "파일은 브라우저 안에서만 처리됩니다. 서버로 전송되거나 저장되지 않습니다.",
  },
  {
    num: "02",
    title: "코드 하이라이팅",
    desc: "Shiki 기반 구문 강조로 JavaScript, TypeScript, Python 등 100여 개 언어를 지원합니다.",
  },
  {
    num: "03",
    title: "자동 목차",
    desc: "헤딩을 자동으로 인식해 목차를 만들고, 현재 읽는 섹션을 하이라이트합니다.",
  },
  {
    num: "04",
    title: "라이트 · 다크 모드",
    desc: "시스템 설정을 자동으로 감지하며, 툴바에서 직접 모드를 전환할 수 있습니다.",
  },
  {
    num: "05",
    title: "레이아웃 조절",
    desc: "좁게 · 보통 · 넓게 세 가지 너비와 세 가지 글자 크기를 지원합니다.",
  },
  {
    num: "06",
    title: "즉시 렌더링",
    desc: "파일을 떨어뜨리는 순간 바로 렌더링됩니다. 별도의 빌드나 로딩이 없습니다.",
  },
];

function CornerMark({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-3 w-3 ${className}`}
    >
      <span className="absolute inset-0 border-l border-t border-current" />
    </span>
  );
}

export function Dropzone({ onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [active, setActive] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setActive(false);
      if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files);
    },
    [onFiles],
  );

  return (
    <div className="min-h-screen bg-ink-bg text-ink-fg dark:bg-nightInk-bg dark:text-nightInk-fg">
      {/* Header */}
      <header className="border-b border-ink-border dark:border-nightInk-border">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6 py-6">
          <a href="/" className="flex items-baseline gap-3 no-underline">
            <strong
              className="text-xl font-semibold text-ink-fg dark:text-nightInk-fg"
              style={{ letterSpacing: "-0.025em" }}
            >
              MD Viewer
            </strong>
            <span className="kicker hidden sm:inline">Markdown Viewer</span>
          </a>
          <span className="kicker font-mono">v1.0</span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-20 sm:pt-24">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <aside className="col-span-12 lg:col-span-3">
            <p
              className="text-sm text-ink-muted dark:text-nightInk-muted"
              style={{ lineHeight: 1.7 }}
            >
              브라우저에서 마크다운 파일을<br />
              빠르게 보는 뷰어입니다.<br />
              파일은 서버로 전송되지 않습니다.
            </p>
          </aside>

          <h1
            className="col-span-12 text-[3rem] font-semibold text-ink-fg dark:text-nightInk-fg sm:text-[4rem] lg:col-span-9 lg:text-[4.5rem]"
            style={{ letterSpacing: "-0.035em", lineHeight: 1.05 }}
          >
            <span className="block">마크다운 파일을,</span>
            <span className="block">브라우저에서 봅니다.</span>
          </h1>
        </div>
      </section>

      {/* Drop zone */}
      <section className="border-y border-ink-border dark:border-nightInk-border">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid grid-cols-12 gap-x-6 gap-y-6">
            <div className="col-span-12 lg:col-span-3">
              <p className="kicker mb-3">File</p>
              <p
                className="text-sm text-ink-muted dark:text-nightInk-muted"
                style={{ lineHeight: 1.7 }}
              >
                .md / .markdown<br />
                최대 5MB · UTF-8
              </p>
            </div>

            <div
              data-testid="dropzone"
              onDragEnter={(e) => {
                e.preventDefault();
                setActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setActive(true);
              }}
              onDragLeave={() => setActive(false)}
              onDrop={onDrop}
              className={`relative col-span-12 px-8 py-14 sm:px-12 sm:py-16 lg:col-span-9 ${
                active
                  ? "border border-ink-point text-ink-point dark:border-nightInk-point dark:text-nightInk-point"
                  : "border border-ink-fg text-ink-fg dark:border-nightInk-fg dark:text-nightInk-fg"
              }`}
            >
              <CornerMark className="left-[-1px] top-[-1px]" />
              <CornerMark className="right-[-1px] top-[-1px] rotate-90" />
              <CornerMark className="bottom-[-1px] right-[-1px] rotate-180" />
              <CornerMark className="bottom-[-1px] left-[-1px] -rotate-90" />

              <p className="kicker mb-5 font-mono">{active ? "Drop now" : "Drop"}</p>
              <p
                className="mb-3 text-3xl font-semibold sm:text-4xl"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                {active ? "파일을 놓으세요" : ".md 파일을 이 영역에 드래그"}
              </p>
              <p className="mb-10 text-sm text-ink-muted dark:text-nightInk-muted">
                또는 아래 링크로 파일을 선택할 수 있습니다.
              </p>

              <label className="cta cursor-pointer">
                <span>파일 선택하기</span>
                <span aria-hidden>→</span>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".md,.markdown,text/markdown"
                  className="sr-only"
                  aria-label="파일 선택"
                  onChange={(e) => {
                    if (e.target.files?.length) onFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 grid grid-cols-12 gap-x-6">
          <p className="kicker col-span-12 mb-3 lg:col-span-3 lg:mb-0">Features</p>
          <h2
            className="col-span-12 max-w-2xl text-3xl font-semibold text-ink-fg dark:text-nightInk-fg sm:text-4xl lg:col-span-9"
            style={{ letterSpacing: "-0.025em", lineHeight: 1.15 }}
          >
            기능.
          </h2>
        </div>

        <ul className="border-t border-ink-fg dark:border-nightInk-fg">
          {FEATURES.map((f) => (
            <li
              key={f.num}
              className="grid grid-cols-12 items-baseline gap-x-6 gap-y-2 border-b border-ink-border py-7 dark:border-nightInk-border"
            >
              <span
                className="col-span-2 font-mono text-xs text-ink-subtle dark:text-nightInk-subtle sm:col-span-1"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {f.num}
              </span>
              <h3
                className="col-span-10 text-lg font-semibold text-ink-fg dark:text-nightInk-fg sm:col-span-4 sm:text-xl"
                style={{ letterSpacing: "-0.025em" }}
              >
                {f.title}
              </h3>
              <p
                className="col-span-12 text-sm text-ink-muted dark:text-nightInk-muted sm:col-span-7"
                style={{ lineHeight: 1.7 }}
              >
                {f.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Spec strip */}
      <section className="border-t border-ink-border dark:border-nightInk-border">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
            {[
              { k: "Privacy", v: "Local only" },
              { k: "Max size", v: "5 MB" },
              { k: "Formats", v: ".md / .markdown" },
              { k: "Encoding", v: "UTF-8" },
            ].map((s) => (
              <div key={s.k}>
                <p className="kicker mb-2">{s.k}</p>
                <p
                  className="font-mono text-sm font-semibold text-ink-fg dark:text-nightInk-fg"
                  style={{ letterSpacing: "-0.005em" }}
                >
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-border bg-ink-surface dark:border-nightInk-border dark:bg-nightInk-surface">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-12 gap-x-6 gap-y-8">
            <div className="col-span-12 lg:col-span-4">
              <p className="kicker mb-3">About</p>
              <p
                className="text-xs text-ink-subtle dark:text-nightInk-subtle"
                style={{ lineHeight: 1.7 }}
              >
                로컬에서 마크다운 파일을 보는 뷰어.<br />
                파일은 서버로 전송되지 않습니다.
              </p>
            </div>
            <div className="col-span-6 lg:col-span-4">
              <p className="kicker mb-3">Stack</p>
              <p
                className="font-mono text-xs text-ink-subtle dark:text-nightInk-subtle"
                style={{ lineHeight: 1.8 }}
              >
                React · TypeScript<br />
                Vite · Tailwind<br />
                Shiki · remark / rehype
              </p>
            </div>
            <div className="col-span-6 lg:col-span-4">
              <p className="kicker mb-3">Version</p>
              <p
                className="font-mono text-xs text-ink-subtle dark:text-nightInk-subtle"
                style={{ lineHeight: 1.8 }}
              >
                v1.0<br />
                Local build
              </p>
            </div>
          </div>
          <div className="mt-12 flex items-baseline justify-between border-t border-ink-border pt-5 dark:border-nightInk-border">
            <p className="kicker font-mono">© MD Viewer</p>
            <p className="kicker font-mono hidden sm:inline">Local-only</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
