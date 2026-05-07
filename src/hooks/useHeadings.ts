import { useEffect, useState, type RefObject } from "react";
import type { Heading } from "@/types";

/**
 * Collects h1/h2/h3 with non-empty id from the given container.
 * Re-runs on every render so it stays in sync after content swaps.
 */
export function useHeadings(ref: RefObject<HTMLElement>): Heading[] {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    if (!ref.current) { setHeadings([]); return; }
    const nodes = ref.current.querySelectorAll<HTMLHeadingElement>("h1, h2, h3");
    const list: Heading[] = [];
    nodes.forEach((node) => {
      if (!node.id) return;
      const level = Number(node.tagName.slice(1)) as 1 | 2 | 3;
      list.push({ id: node.id, text: (node.textContent ?? "").replace(/#$/, "").trim(), level });
    });
    setHeadings(list);
  });

  return headings;
}
