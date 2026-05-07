import { useEffect } from "react";
import type { FileMeta } from "@/types";

const DEFAULT_TITLE = "MD Viewer — 브라우저 마크다운 뷰어";
const DEFAULT_DESC =
  "마크다운(.md) 파일을 브라우저에서 바로 열람하는 무료 뷰어. 파일은 서버로 전송되지 않으며, GitHub Flavored Markdown·코드 하이라이팅·목차 자동 생성을 지원합니다.";

function extractDescription(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  const collected: string[] = [];

  for (const line of lines) {
    if (/^(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^#{1,6}\s/.test(line)) continue;
    if (/^[>\-*+]|\d+\./.test(line)) continue;
    if (/^[|!]/.test(line)) continue;
    if (line.trim() === "") {
      if (collected.length > 0) break;
      continue;
    }
    const cleaned = line
      .trim()
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
      .replace(/`[^`]+`/g, "")
      .replace(/[*_~]/g, "")
      .trim();
    if (cleaned) collected.push(cleaned);
  }

  const text = collected.join(" ").trim();
  return text ? text.slice(0, 160) : DEFAULT_DESC;
}

function setMeta(selector: string, attrName: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName.startsWith("og:") || attrName.startsWith("twitter:") ? "property" : "name", attrName);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useDocumentMeta(file: FileMeta | null) {
  useEffect(() => {
    if (!file) {
      document.title = DEFAULT_TITLE;
      setMeta('meta[name="title"]', "title", DEFAULT_TITLE);
      setMeta('meta[name="description"]', "description", DEFAULT_DESC);
      setProperty("og:title", DEFAULT_TITLE);
      setProperty("og:description", DEFAULT_DESC);
      setProperty("og:url", window.location.origin + "/");
      setMeta('meta[name="twitter:title"]', "twitter:title", DEFAULT_TITLE);
      setMeta('meta[name="twitter:description"]', "twitter:description", DEFAULT_DESC);
      setCanonical(window.location.origin + "/");
      return;
    }

    const docName = file.name.replace(/\.(md|markdown)$/i, "");
    const pageTitle = `${docName} — MD Viewer`;
    const desc = extractDescription(file.content);
    const docParam = new URLSearchParams(window.location.search).get("doc");
    const canonical = docParam
      ? `${window.location.origin}${window.location.pathname}?doc=${encodeURIComponent(docParam)}`
      : window.location.href;

    document.title = pageTitle;
    setMeta('meta[name="title"]', "title", pageTitle);
    setMeta('meta[name="description"]', "description", desc);
    setProperty("og:title", pageTitle);
    setProperty("og:description", desc);
    setProperty("og:url", canonical);
    setMeta('meta[name="twitter:title"]', "twitter:title", pageTitle);
    setMeta('meta[name="twitter:description"]', "twitter:description", desc);
    setCanonical(canonical);
  }, [file]);
}
