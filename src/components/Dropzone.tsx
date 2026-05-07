import { useCallback, useRef, useState } from "react";

interface Props {
  onFiles: (files: FileList | File[]) => void;
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
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div
        data-testid="dropzone"
        onDragEnter={(e) => { e.preventDefault(); setActive(true); }}
        onDragOver={(e) => { e.preventDefault(); setActive(true); }}
        onDragLeave={() => setActive(false)}
        onDrop={onDrop}
        className={`w-full max-w-md rounded-2xl border-2 border-dashed p-10 text-center transition ${
          active
            ? "border-blue-500 ring-4 ring-blue-200/40 dark:ring-blue-900/40"
            : "border-ink-border dark:border-nightInk-border"
        }`}
      >
        <h1 className="mb-2 text-xl font-semibold">MD Viewer</h1>
        <p className="mb-6 text-sm text-ink-muted dark:text-nightInk-muted">
          여기에 .md 파일을 끌어다 놓거나, 파일을 선택하세요.
          <br />
          파일은 서버로 전송되지 않습니다.
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-ink-border px-4 py-2 text-sm font-medium hover:bg-ink-code dark:border-nightInk-border dark:hover:bg-nightInk-code">
          <span>파일 선택</span>
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
  );
}
