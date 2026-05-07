import React, { useCallback, useEffect, useRef } from "react";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { usePrefs } from "@/context/usePrefs";
import { useFileLoader, type LoadErrorCode } from "@/hooks/useFileLoader";
import { useToast } from "@/hooks/useToast";
import { useHeadings } from "@/hooks/useHeadings";
import { useActiveHeading } from "@/hooks/useActiveHeading";
import { useDocsLibrary } from "@/hooks/useDocsLibrary";
import { useDocsDeepLink, type DeepLinkTarget } from "@/hooks/useDocsDeepLink";
import { Dropzone } from "@/components/Dropzone";
import { Toolbar } from "@/components/Toolbar";
import { TocSidebar } from "@/components/TocSidebar";
import { MarkdownView } from "@/components/MarkdownView";
import { ToastStack } from "@/components/Toast";
import type { DocEntry } from "@/types";

const ERROR_TEXT: Record<LoadErrorCode, string> = {
  BAD_EXT: "마크다운 파일만 열 수 있어요 (.md, .markdown)",
  TOO_LARGE: "5MB 이하 파일만 지원해요",
  BAD_ENCODING: "UTF-8 마크다운 파일이어야 해요",
  MULTIPLE: "한 번에 하나의 파일만 열 수 있어요",
  FETCH_FAILED: "문서를 불러오지 못했어요",
};

function widthClass(w: "narrow" | "normal" | "wide"): string {
  return `md-width-${w}`;
}
function fontClass(f: "s" | "m" | "l"): string {
  return `md-font-${f}`;
}

function Shell() {
  const { prefs } = usePrefs();
  const { file, error, loadFromList, loadFromUrl, reset } = useFileLoader();
  const { toasts, push, dismiss } = useToast();
  const bodyRef = useRef<HTMLDivElement>(null);
  const headings = useHeadings(bodyRef as React.RefObject<HTMLElement>);
  const activeId = useActiveHeading(headings);

  const library = useDocsLibrary();
  const docs = library.status === "ready" ? library.docs : null;

  const onResolve = useCallback(
    (target: DeepLinkTarget) => {
      if (target === "home") {
        reset();
      } else if (target === "missing") {
        reset();
        push({ variant: "error", text: ERROR_TEXT.FETCH_FAILED });
        const url = new URL(window.location.href);
        url.searchParams.delete("doc");
        const search = url.searchParams.toString();
        window.history.replaceState(
          {},
          "",
          url.pathname + (search ? `?${search}` : "") + url.hash,
        );
      } else {
        void loadFromUrl(target.file);
      }
    },
    [reset, push, loadFromUrl],
  );

  const { navigateToDoc, navigateToHome } = useDocsDeepLink({ docs, onResolve });

  useEffect(() => {
    if (error) push({ variant: "error", text: ERROR_TEXT[error] });
  }, [error, push]);

  const handleSelect = useCallback(
    (entry: DocEntry) => {
      navigateToDoc(entry);
      void loadFromUrl(entry.file);
    },
    [navigateToDoc, loadFromUrl],
  );

  const handleReset = useCallback(() => {
    navigateToHome();
    reset();
  }, [navigateToHome, reset]);

  return (
    <div className="min-h-screen">
      {!file && (
        <Dropzone
          onFiles={loadFromList}
          library={
            docs && docs.length > 0
              ? { docs, onSelect: handleSelect }
              : undefined
          }
        />
      )}
      {file && (
        <>
          <Toolbar fileName={file.name} onReset={handleReset} />
          <div className="mx-auto flex max-w-screen-2xl">
            <main className="min-w-0 flex-1">
              <MarkdownView
                ref={bodyRef}
                source={file.content}
                widthClass={widthClass(prefs.width)}
                fontClass={fontClass(prefs.font)}
              />
            </main>
            <TocSidebar headings={headings} activeId={activeId} />
          </div>
        </>
      )}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <Shell />
    </PreferencesProvider>
  );
}
