import { useEffect, useState } from "react";
import type { DocEntry } from "@/types";

export type LibraryState =
  | { status: "loading" }
  | { status: "ready"; docs: DocEntry[] }
  | { status: "error" };

const MANIFEST_URL = "/docs/manifest.json";

function isDocEntry(v: unknown): v is DocEntry {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.file === "string" &&
    typeof obj.title === "string" &&
    typeof obj.sizeKB === "number"
  );
}

function parseManifest(json: unknown): DocEntry[] | null {
  if (!json || typeof json !== "object") return null;
  const m = json as Record<string, unknown>;
  if (m.version !== 1) return null;
  if (!Array.isArray(m.docs)) return null;
  if (!m.docs.every(isDocEntry)) return null;
  return m.docs as DocEntry[];
}

export function useDocsLibrary(): LibraryState {
  const [state, setState] = useState<LibraryState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(MANIFEST_URL);
        if (!res.ok) { if (!cancelled) setState({ status: "error" }); return; }
        const json = await res.json();
        const docs = parseManifest(json);
        if (cancelled) return;
        if (docs) setState({ status: "ready", docs });
        else setState({ status: "error" });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}
