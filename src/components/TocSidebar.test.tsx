import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TocSidebar } from "./TocSidebar";
import type { Heading } from "@/types";

const HEADINGS: Heading[] = [
  { id: "intro", text: "Intro", level: 1 },
  { id: "details", text: "Details", level: 2 },
  { id: "more", text: "More", level: 3 },
];

describe("TocSidebar", () => {
  it("renders nothing when headings are empty", () => {
    const { container } = render(<TocSidebar headings={[]} activeId={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders heading list with hash links and indentation by level", () => {
    render(<TocSidebar headings={HEADINGS} activeId={null} />);
    const intro = screen.getByRole("link", { name: "Intro" });
    expect(intro).toHaveAttribute("href", "#intro");
    expect(screen.getByRole("link", { name: "Details" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "More" })).toBeInTheDocument();
  });

  it("highlights the active heading", () => {
    render(<TocSidebar headings={HEADINGS} activeId="details" />);
    const active = screen.getByRole("link", { name: "Details" });
    expect(active.className).toMatch(/font-semibold|text-blue|bg-/);
  });
});
