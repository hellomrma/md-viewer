import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders text and variant style", () => {
    const { container } = render(
      <Toast toast={{ id: 1, variant: "error", text: "bad" }} onDismiss={() => {}} />,
    );
    const el = screen.getByRole("status");
    expect(el).toHaveTextContent("bad");
    // editorial monochrome: error is signaled by a colored dot, not background
    const dot = container.querySelector("[aria-hidden]");
    expect(dot?.className).toMatch(/red/i);
  });

  it("calls onDismiss when close button clicked", async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Toast toast={{ id: 7, variant: "info", text: "hello" }} onDismiss={fn} />);
    await user.click(screen.getByRole("button", { name: /닫기|close/i }));
    expect(fn).toHaveBeenCalledWith(7);
  });
});
