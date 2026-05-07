import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

function mockManifestAndDocs(
  manifest: unknown,
  docContents: Record<string, string>,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url === "/docs/manifest.json") {
        return new Response(JSON.stringify(manifest), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      const file = decodeURIComponent(url.replace("/docs/", ""));
      const content = docContents[file];
      if (content === undefined) return new Response("", { status: 404 });
      return new Response(content, {
        status: 200,
        headers: { "content-type": "text/markdown" },
      });
    }),
  );
}

describe("App docs library integration", () => {
  it("renders Library section when manifest has docs", async () => {
    mockManifestAndDocs(
      {
        version: 1,
        generatedAt: "x",
        docs: [{ file: "guide.md", title: "Guide", sizeKB: 1 }],
      },
      { "guide.md": "# Guide\n\nbody" },
    );
    render(<App />);
    await waitFor(() =>
      expect(screen.getByText("Guide")).toBeInTheDocument(),
    );
  });

  it("clicking a card opens the doc and updates URL", async () => {
    mockManifestAndDocs(
      {
        version: 1,
        generatedAt: "x",
        docs: [{ file: "guide.md", title: "Guide", sizeKB: 1 }],
      },
      { "guide.md": "# Guide\n\nbody" },
    );
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => screen.getByText("Guide"));
    await user.click(screen.getByRole("button", { name: /Guide/ }));
    await waitFor(() =>
      expect(window.location.search).toBe("?doc=guide.md"),
    );
  });

  it("?doc=missing.md shows error toast and stays on home", async () => {
    window.history.replaceState({}, "", "/?doc=missing.md");
    mockManifestAndDocs(
      {
        version: 1,
        generatedAt: "x",
        docs: [{ file: "guide.md", title: "Guide", sizeKB: 1 }],
      },
      { "guide.md": "# Guide" },
    );
    render(<App />);
    await waitFor(() =>
      expect(screen.getByText(/불러오지 못했어요/)).toBeInTheDocument(),
    );
    expect(window.location.search).toBe("");
  });

  it("hides Library section when manifest is empty", async () => {
    const fetchSpy = vi.fn(async () =>
      new Response(JSON.stringify({ version: 1, generatedAt: "x", docs: [] }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchSpy);
    render(<App />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    expect(screen.queryByText(/라이브러리에서 바로 열기/)).toBeNull();
  });
});
