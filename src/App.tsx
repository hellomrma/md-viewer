import React, { useEffect, useRef } from "react";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { usePrefs } from "@/context/usePrefs";
import { useFileLoader, type LoadErrorCode } from "@/hooks/useFileLoader";
import { useToast } from "@/hooks/useToast";
import { useHeadings } from "@/hooks/useHeadings";
import { useActiveHeading } from "@/hooks/useActiveHeading";
import { Dropzone } from "@/components/Dropzone";
import { Toolbar } from "@/components/Toolbar";
import { TocSidebar } from "@/components/TocSidebar";
import { MarkdownView } from "@/components/MarkdownView";
import { ToastStack } from "@/components/Toast";

const ERROR_TEXT: Record<LoadErrorCode, string> = {
  BAD_EXT: "마크다운 파일만 열 수 있어요 (.md, .markdown)",
  TOO_LARGE: "5MB 이하 파일만 지원해요",
  BAD_ENCODING: "UTF-8 마크다운 파일이어야 해요",
  MULTIPLE: "한 번에 하나의 파일만 열 수 있어요",
};

function widthClass(w: "narrow" | "normal" | "wide"): string {
  return `md-width-${w}`;
}
function fontClass(f: "s" | "m" | "l"): string {
  return `md-font-${f}`;
}

function Shell() {
  const { prefs } = usePrefs();
  const { file, error, loadFromList, reset } = useFileLoader();
  const { toasts, push, dismiss } = useToast();
  const bodyRef = useRef<HTMLDivElement>(null);
  const headings = useHeadings(bodyRef as React.RefObject<HTMLElement>);
  const activeId = useActiveHeading(headings);

  useEffect(() => {
    if (error) push({ variant: "error", text: ERROR_TEXT[error] });
  }, [error, push]);

  return (
    <div className="min-h-screen">
      {!file && <Dropzone onFiles={loadFromList} />}
      {file && (
        <>
          <Toolbar fileName={file.name} onReset={reset} />
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
