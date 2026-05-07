import type { ToastMessage } from "@/types";

interface Props {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

export function Toast({ toast, onDismiss }: Props) {
  const variantClass =
    toast.variant === "error"
      ? "border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950/60 dark:text-red-100"
      : "border-ink-border bg-ink-bg text-ink-fg dark:border-nightInk-border dark:bg-nightInk-bg dark:text-nightInk-fg";

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-md border px-3 py-2 text-sm shadow-md ${variantClass}`}
    >
      <span className="flex-1">{toast.text}</span>
      <button
        type="button"
        aria-label="닫기"
        className="opacity-60 hover:opacity-100"
        onClick={() => onDismiss(toast.id)}
      >
        ✕
      </button>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 no-print">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
