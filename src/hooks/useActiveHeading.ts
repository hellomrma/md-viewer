import { useEffect, useState } from "react";
import type { Heading } from "@/types";

/**
 * Tracks the heading currently visible near the top of the viewport.
 * Falls back to null on no IntersectionObserver support.
 */
export function useActiveHeading(headings: Heading[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort((a, b) => {
          const at = (a.target as HTMLElement).getBoundingClientRect().top;
          const bt = (b.target as HTMLElement).getBoundingClientRect().top;
          return at - bt;
        });
        setActive((visible[0].target as HTMLElement).id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.5, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return headings.length === 0 ? null : active;
}
