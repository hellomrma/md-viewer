import { useCallback, useEffect, useRef } from "react";
import type { DocEntry } from "@/types";

export type DeepLinkTarget = DocEntry | "missing" | "home";

interface Args {
  docs: DocEntry[] | null;
  onResolve: (target: DeepLinkTarget) => void;
}

export function useDocsDeepLink({ docs, onResolve }: Args): {
  navigateToDoc: (entry: DocEntry) => void;
  navigateToHome: () => void;
} {
  const onResolveRef = useRef(onResolve);
  useEffect(() => { onResolveRef.current = onResolve; }, [onResolve]);

  useEffect(() => {
    if (!docs) return;
    const dispatch = () => {
      const url = new URL(window.location.href);
      const docParam = url.searchParams.get("doc");
      if (!docParam) { onResolveRef.current("home"); return; }
      const match = docs.find((d) => d.file === docParam);
      onResolveRef.current(match ?? "missing");
    };
    dispatch();
    window.addEventListener("popstate", dispatch);
    return () => window.removeEventListener("popstate", dispatch);
  }, [docs]);

  const navigateToDoc = useCallback((entry: DocEntry) => {
    const url = new URL(window.location.href);
    url.searchParams.set("doc", entry.file);
    window.history.pushState({}, "", url.pathname + url.search + url.hash);
  }, []);

  const navigateToHome = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("doc");
    const search = url.searchParams.toString();
    window.history.pushState(
      {},
      "",
      url.pathname + (search ? `?${search}` : "") + url.hash,
    );
  }, []);

  return { navigateToDoc, navigateToHome };
}
