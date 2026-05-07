import { useCallback, useState } from "react";
import type { FileMeta } from "@/types";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
const VALID_EXT = /\.(md|markdown)$/i;

export type LoadErrorCode =
  | "BAD_EXT"
  | "TOO_LARGE"
  | "BAD_ENCODING"
  | "MULTIPLE"
  | "FETCH_FAILED";

export type LoadResult =
  | { ok: true; value: FileMeta }
  | { ok: false; code: LoadErrorCode };

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export async function loadMarkdownFile(file: File): Promise<LoadResult> {
  if (!VALID_EXT.test(file.name)) return { ok: false, code: "BAD_EXT" };
  if (file.size > MAX_FILE_BYTES) return { ok: false, code: "TOO_LARGE" };

  const buf = await readFileAsArrayBuffer(file);
  let content: string;
  try {
    content = new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return { ok: false, code: "BAD_ENCODING" };
  }

  return {
    ok: true,
    value: {
      name: file.name,
      content,
      sizeKB: Math.max(1, Math.round(file.size / 1024)),
    },
  };
}

export interface UseFileLoaderState {
  file: FileMeta | null;
  error: LoadErrorCode | null;
  loadFromList: (list: FileList | File[]) => Promise<void>;
  loadOne: (file: File) => Promise<void>;
  loadFromUrl: (fileName: string) => Promise<void>;
  reset: () => void;
}

export function useFileLoader(): UseFileLoaderState {
  const [file, setFile] = useState<FileMeta | null>(null);
  const [error, setError] = useState<LoadErrorCode | null>(null);

  const loadOne = useCallback(async (f: File) => {
    setError(null);
    const result = await loadMarkdownFile(f);
    if (result.ok) setFile(result.value);
    else { setFile(null); setError(result.code); }
  }, []);

  const loadFromList = useCallback(async (list: FileList | File[]) => {
    const arr = Array.from(list);
    if (arr.length === 0) return;
    if (arr.length > 1) { setError("MULTIPLE"); return; }
    await loadOne(arr[0]);
  }, [loadOne]);

  const loadFromUrl = useCallback(async (fileName: string) => {
    setError(null);
    try {
      const res = await fetch(`/docs/${encodeURIComponent(fileName)}`);
      if (!res.ok) { setFile(null); setError("FETCH_FAILED"); return; }
      const content = await res.text();
      setFile({
        name: fileName,
        content,
        sizeKB: Math.max(1, Math.round(content.length / 1024)),
      });
    } catch {
      setFile(null);
      setError("FETCH_FAILED");
    }
  }, []);

  const reset = useCallback(() => { setFile(null); setError(null); }, []);

  return { file, error, loadFromList, loadOne, loadFromUrl, reset };
}
