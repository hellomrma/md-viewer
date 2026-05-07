import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
  it("renders children pre", () => {
    render(
      <CodeBlock>
        <code>const x = 1;</code>
      </CodeBlock>,
    );
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });

  it("copy button writes pre text to clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(async () => undefined);
    // Must run AFTER userEvent.setup() — user-event v14 stubs navigator.clipboard during setup.
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(
      <CodeBlock>
        <code>hello world</code>
      </CodeBlock>,
    );
    await user.click(screen.getByRole("button", { name: /복사|copy/i }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("hello world"));
  });
});
