import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MarkdownView } from "./MarkdownView";

describe("MarkdownView", () => {
  it("renders headings with auto slug ids", async () => {
    render(<MarkdownView source={"# Hello World\n\n## Sub"} />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: /Hello World/i })).toHaveAttribute("id", "hello-world");
      expect(screen.getByRole("heading", { level: 2, name: /Sub/i })).toHaveAttribute("id", "sub");
    });
  });

  it("renders GFM table", async () => {
    render(<MarkdownView source={"| a | b |\n|---|---|\n| 1 | 2 |\n"} />);
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  it("makes external links open in new tab safely", async () => {
    render(<MarkdownView source={"[ext](https://example.com)"} />);
    const link = await screen.findByRole("link", { name: /ext/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel") ?? "").toMatch(/noopener/);
    expect(link.getAttribute("rel") ?? "").toMatch(/noreferrer/);
  });

  it("strips script tags", async () => {
    const { container } = render(<MarkdownView source={"<script>alert(1)</script>\n\nHi"} />);
    await waitFor(() => expect(container.querySelector("script")).toBeNull());
    expect(screen.getByText(/Hi/)).toBeInTheDocument();
  });

  it("shows empty notice when source is whitespace only", () => {
    render(<MarkdownView source={"   \n\n  "} />);
    expect(screen.getByText(/내용이 비어 있어요/)).toBeInTheDocument();
  });
});
