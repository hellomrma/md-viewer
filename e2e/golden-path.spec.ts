import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, "fixtures", "sample.md");

test("drop file → render → TOC → dark mode → reset", async ({ page }) => {
  await page.goto("/");

  // Empty state shown
  await expect(page.getByTestId("dropzone")).toBeVisible();

  // Pick file via input
  await page.getByLabel("파일 선택").setInputFiles(FIXTURE);

  // Heading visible
  await expect(page.getByRole("heading", { level: 1, name: /Sample Document/ })).toBeVisible();
  await expect(page.getByText("sample.md")).toBeVisible();

  // TOC item present and clickable (desktop)
  const tocLink = page.getByRole("link", { name: "Features" });
  await expect(tocLink).toBeVisible();
  await tocLink.click();
  await expect(page).toHaveURL(/#features$/);

  // Toggle dark theme
  await page.getByLabel("테마").selectOption("dark");
  await expect(page.locator("html")).toHaveClass(/dark/);

  // Reset → back to dropzone
  await page.getByRole("button", { name: /새 파일/ }).click();
  await expect(page.getByTestId("dropzone")).toBeVisible();
});

test("rejects non-md file with toast", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("파일 선택").setInputFiles({
    name: "bad.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not markdown"),
  });
  await expect(page.getByRole("status")).toContainText("마크다운 파일만");
});
