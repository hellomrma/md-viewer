import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
});

describe("App", () => {
  it("starts in dropzone state", () => {
    render(<App />);
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();
  });

  it("renders markdown after a file is picked", async () => {
    const user = userEvent.setup();
    render(<App />);
    const file = new File(["# Hello"], "doc.md", { type: "text/markdown" });
    const input = screen.getByLabelText(/파일 선택/) as HTMLInputElement;
    await user.upload(input, file);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: /Hello/ })).toBeInTheDocument();
    });
    expect(screen.getByText("doc.md")).toBeInTheDocument();
  });

  it("returns to dropzone on reset", async () => {
    const user = userEvent.setup();
    render(<App />);
    const file = new File(["# Hi"], "x.md", { type: "text/markdown" });
    await user.upload(screen.getByLabelText(/파일 선택/), file);
    await waitFor(() => screen.getByRole("heading", { name: /Hi/ }));
    await user.click(screen.getByRole("button", { name: /새 파일/ }));
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();
  });

  it("shows toast on bad extension", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<App />);
    const file = new File(["x"], "doc.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText(/파일 선택/), file);
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/마크다운 파일만/);
    });
  });
});
