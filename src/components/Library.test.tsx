import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Library } from "./Library";

describe("Library", () => {
  it("renders nothing when docs is empty", () => {
    const { container } = render(<Library docs={[]} onSelect={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a card per doc with title, file, size", () => {
    render(
      <Library
        docs={[
          { file: "a.md", title: "Alpha", sizeKB: 3 },
          { file: "b.md", title: "Beta", sizeKB: 12 },
        ]}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("a.md")).toBeInTheDocument();
    expect(screen.getByText("b.md")).toBeInTheDocument();
    expect(screen.getByText("3 KB")).toBeInTheDocument();
    expect(screen.getByText("12 KB")).toBeInTheDocument();
  });

  it("invokes onSelect with the entry when card clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const docs = [{ file: "a.md", title: "Alpha", sizeKB: 1 }];
    render(<Library docs={docs} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: /Alpha/ }));
    expect(onSelect).toHaveBeenCalledWith(docs[0]);
  });

  it("each card is a button (keyboard accessible)", () => {
    render(
      <Library
        docs={[{ file: "a.md", title: "Alpha", sizeKB: 1 }]}
        onSelect={() => {}}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
