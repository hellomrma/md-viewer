import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropzone } from "./Dropzone";

function makeFile(name: string): File {
  return new File(["# hi"], name, { type: "text/markdown" });
}

describe("Dropzone", () => {
  it("renders helper text and file input", () => {
    render(<Dropzone onFiles={() => {}} />);
    expect(screen.getAllByText(/끌어다 놓|드래그/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/파일 선택/i)).toBeInTheDocument();
  });

  it("calls onFiles when file picked via input", async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Dropzone onFiles={fn} />);
    const input = screen.getByLabelText(/파일 선택/i) as HTMLInputElement;
    await user.upload(input, makeFile("doc.md"));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(Array.from(fn.mock.calls[0][0]).length).toBe(1);
  });

  it("calls onFiles on drop event", () => {
    const fn = vi.fn();
    render(<Dropzone onFiles={fn} />);
    const zone = screen.getByTestId("dropzone");
    const dataTransfer = { files: [makeFile("a.md")], items: [], types: ["Files"] };
    fireEvent.drop(zone, { dataTransfer });
    expect(fn).toHaveBeenCalled();
  });

  it("toggles active class on dragenter/leave", () => {
    render(<Dropzone onFiles={() => {}} />);
    const zone = screen.getByTestId("dropzone");
    fireEvent.dragEnter(zone, { dataTransfer: { types: ["Files"] } });
    expect(zone.className).toMatch(/ring|border-/);
    fireEvent.dragLeave(zone);
  });
});
