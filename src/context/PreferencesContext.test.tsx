import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesProvider, usePrefs } from "./PreferencesContext";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

function Probe() {
  const { prefs, setTheme } = usePrefs();
  return (
    <>
      <span data-testid="theme">{prefs.theme}</span>
      <button onClick={() => setTheme("dark")}>dark</button>
    </>
  );
}

describe("PreferencesContext", () => {
  it("provides defaults", () => {
    render(<PreferencesProvider><Probe /></PreferencesProvider>);
    expect(screen.getByTestId("theme")).toHaveTextContent("system");
  });

  it("applies dark class when theme=dark", async () => {
    const user = userEvent.setup();
    render(<PreferencesProvider><Probe /></PreferencesProvider>);
    await user.click(screen.getByText("dark"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("does not apply dark class when theme=light", () => {
    localStorage.setItem("mdv:prefs", JSON.stringify({ theme: "light", width: "normal", font: "m" }));
    render(<PreferencesProvider><Probe /></PreferencesProvider>);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("throws if usePrefs called outside provider", () => {
    const Boom = () => { usePrefs(); return null; };
    expect(() => render(<Boom />)).toThrow();
  });
});
