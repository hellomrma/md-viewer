import { usePrefs } from "@/context/usePrefs";

interface Props {
  fileName: string;
  onReset: () => void;
}

export function Toolbar({ fileName, onReset }: Props) {
  const { prefs, setTheme, setWidth, setFont } = usePrefs();

  return (
    <header
      className="no-print sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-ink-border bg-ink-bg/80 px-4 py-3 backdrop-blur dark:border-nightInk-border dark:bg-nightInk-bg/80"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span aria-hidden className="text-base">📄</span>
        <span className="truncate text-sm font-medium" title={fileName}>{fileName}</span>
      </div>

      <label className="text-xs">
        <span className="sr-only">테마</span>
        <select
          aria-label="테마"
          className="rounded border border-ink-border bg-transparent px-2 py-1 dark:border-nightInk-border"
          value={prefs.theme}
          onChange={(e) => setTheme(e.target.value as typeof prefs.theme)}
        >
          <option value="system">시스템</option>
          <option value="light">라이트</option>
          <option value="dark">다크</option>
        </select>
      </label>

      <label className="text-xs">
        <span className="sr-only">폭</span>
        <select
          aria-label="폭"
          className="rounded border border-ink-border bg-transparent px-2 py-1 dark:border-nightInk-border"
          value={prefs.width}
          onChange={(e) => setWidth(e.target.value as typeof prefs.width)}
        >
          <option value="narrow">좁게</option>
          <option value="normal">보통</option>
          <option value="wide">넓게</option>
        </select>
      </label>

      <label className="text-xs">
        <span className="sr-only">글자 크기</span>
        <select
          aria-label="글자 크기"
          className="rounded border border-ink-border bg-transparent px-2 py-1 dark:border-nightInk-border"
          value={prefs.font}
          onChange={(e) => setFont(e.target.value as typeof prefs.font)}
        >
          <option value="s">S</option>
          <option value="m">M</option>
          <option value="l">L</option>
        </select>
      </label>

      <button
        type="button"
        onClick={() => window.print()}
        className="rounded border border-ink-border px-2 py-1 text-xs hover:bg-ink-code dark:border-nightInk-border dark:hover:bg-nightInk-code"
      >
        인쇄
      </button>

      <button
        type="button"
        onClick={onReset}
        className="rounded border border-ink-border px-2 py-1 text-xs hover:bg-ink-code dark:border-nightInk-border dark:hover:bg-nightInk-code"
      >
        새 파일 열기
      </button>
    </header>
  );
}
