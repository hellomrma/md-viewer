import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { useHeadings } from "./useHeadings";

function setupContainer(html: string): HTMLDivElement {
  const div = document.createElement("div");
  div.innerHTML = html;
  document.body.appendChild(div);
  return div;
}

describe("useHeadings", () => {
  it("returns empty when ref is null", () => {
    const { result } = renderHook(() =>
      useHeadings({ current: null } as unknown as RefObject<HTMLElement>),
    );
    expect(result.current).toEqual([]);
  });

  it("extracts h1/h2/h3 with id and text", () => {
    const root = setupContainer(
      '<h1 id="a">A</h1><p>x</p><h2 id="b">B</h2><h3 id="c">C</h3><h4 id="d">D</h4>',
    );
    const ref = { current: root };
    const { result } = renderHook(() => useHeadings(ref as RefObject<HTMLElement>));
    expect(result.current).toEqual([
      { id: "a", text: "A", level: 1 },
      { id: "b", text: "B", level: 2 },
      { id: "c", text: "C", level: 3 },
    ]);
    document.body.removeChild(root);
  });

  it("skips headings without id", () => {
    const root = setupContainer('<h2>NoId</h2><h2 id="ok">OK</h2>');
    const ref = { current: root };
    const { result } = renderHook(() => useHeadings(ref as RefObject<HTMLElement>));
    expect(result.current).toEqual([{ id: "ok", text: "OK", level: 2 }]);
    document.body.removeChild(root);
  });
});
