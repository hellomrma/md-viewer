import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { Toolbar } from "./Toolbar";

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
});

describe("Toolbar", () => {
  it("renders title and reset/print/theme/width/font controls", () => {
    render(
      <PreferencesProvider>
        <Toolbar fileName="hello.md" onReset={() => {}} />
      </PreferencesProvider>,
    );
    expect(screen.getByText("hello.md")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /새 파일/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /인쇄|print/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/테마/)).toBeInTheDocument();
    expect(screen.getByLabelText(/폭/)).toBeInTheDocument();
    expect(screen.getByLabelText(/글자/)).toBeInTheDocument();
  });

  it("invokes onReset when reset button clicked", async () => {
    const fn = vi.fn();
    const user = userEvent.setup();
    render(
      <PreferencesProvider>
        <Toolbar fileName="x.md" onReset={fn} />
      </PreferencesProvider>,
    );
    await user.click(screen.getByRole("button", { name: /새 파일/ }));
    expect(fn).toHaveBeenCalled();
  });

  it("selecting dark theme via dropdown applies dark class", async () => {
    const user = userEvent.setup();
    render(
      <PreferencesProvider>
        <Toolbar fileName="x.md" onReset={() => {}} />
      </PreferencesProvider>,
    );
    await user.click(screen.getByLabelText(/테마/));
    await user.click(screen.getByRole("option", { name: /다크/ }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
