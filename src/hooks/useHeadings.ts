import { useEffect, useState, type RefObject } from "react";
import type { Heading } from "@/types";

function sameHeadings(a: Heading[], b: Heading[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].text !== b[i].text || a[i].level !== b[i].level) return false;
  }
  return true;
}

/**
 * Collects h1/h2/h3 with non-empty id from the given container.
 * Re-runs on every render to stay in sync after content swaps,
 * but only triggers re-render when the heading list actually changes
 * (returning the same reference from setHeadings is a no-op for React).
 */
export function useHeadings(ref: RefObject<HTMLElement>): Heading[] {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    if (!ref.current) {
      setHeadings((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    const nodes = ref.current.querySelectorAll<HTMLHeadingElement>("h1, h2, h3");
    const list: Heading[] = [];
    nodes.forEach((node) => {
      if (!node.id) return;
      const level = Number(node.tagName.slice(1)) as 1 | 2 | 3;
      list.push({
        id: node.id,
        text: (node.textContent ?? "").replace(/#$/, "").trim(),
        level,
      });
    });
    setHeadings((prev) => (sameHeadings(prev, list) ? prev : list));
  });

  return headings;
}
