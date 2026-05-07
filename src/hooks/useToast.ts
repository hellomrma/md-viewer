import { useCallback, useRef, useState } from "react";
import type { ToastMessage, ToastVariant } from "@/types";

const AUTO_DISMISS_MS = 4000;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((input: { variant: ToastVariant; text: string }) => {
    const id = ++seq.current;
    setToasts((cur) => [...cur, { id, ...input }]);
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    return id;
  }, [dismiss]);

  return { toasts, push, dismiss };
}
