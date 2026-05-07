import type { ToastMessage } from "@/types";

interface Props {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

export function Toast({ toast, onDismiss }: Props) {
  const isError = toast.variant === "error";

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-start gap-3 border border-ink-fg bg-ink-bg px-4 py-3 text-sm text-ink-fg dark:border-nightInk-fg dark:bg-nightInk-bg dark:text-nightInk-fg"
    >
      <span
        aria-hidden
        className={`mt-1.5 inline-block size-1.5 shrink-0 rounded-full ${
          isError ? "bg-red-600 dark:bg-red-400" : "bg-ink-fg dark:bg-nightInk-fg"
        }`}
      />
      <span className="flex-1" style={{ lineHeight: 1.6 }}>
        {toast.text}
      </span>
      <button
        type="button"
        aria-label="닫기"
        className="text-ink-subtle hover:text-ink-point dark:text-nightInk-subtle dark:hover:text-nightInk-point"
        onClick={() => onDismiss(toast.id)}
      >
        ✕
      </button>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: number) => void }) {
  return (
    <div className="no-print pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
