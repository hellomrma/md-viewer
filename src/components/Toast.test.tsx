import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders text and variant style", () => {
    render(<Toast toast={{ id: 1, variant: "error", text: "bad" }} onDismiss={() => {}} />);
    const el = screen.getByRole("status");
    expect(el).toHaveTextContent("bad");
    expect(el.className).toMatch(/red|error|destructive/i);
  });

  it("calls onDismiss when close button clicked", async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Toast toast={{ id: 7, variant: "info", text: "hello" }} onDismiss={fn} />);
    await user.click(screen.getByRole("button", { name: /닫기|close/i }));
    expect(fn).toHaveBeenCalledWith(7);
  });
});
