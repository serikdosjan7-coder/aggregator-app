import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const cssPath = path.resolve(__dirname, "../app/globals.css");
const css = fs.readFileSync(cssPath, "utf-8");

describe("globals.css design tokens", () => {
  it("defines --color-bg as #040507", () => {
    expect(css).toContain("--color-bg:        #040507");
  });

  it("defines --color-surface as rgba(15, 17, 21, 0.75)", () => {
    expect(css).toContain("--color-surface:   rgba(15, 17, 21, 0.75)");
  });

  it("defines --color-text as #ffffff", () => {
    expect(css).toContain("--color-text:      #ffffff");
  });

  it("defines --color-muted as #8895a5", () => {
    expect(css).toContain("--color-muted:     #8895a5");
  });

  it("defines --color-border as rgba(255, 255, 255, 0.05)", () => {
    expect(css).toContain("--color-border:    rgba(255, 255, 255, 0.05)");
  });

  it("defines --color-red as #e8002b", () => {
    expect(css).toContain("--color-red:       #e8002b");
  });

  it("defines --color-red-dim", () => {
    expect(css).toContain("--color-red-dim:");
  });

  it("defines --color-amber as #f59e0b", () => {
    expect(css).toContain("--color-amber:     #f59e0b");
  });

  it("defines --color-amber-dim", () => {
    expect(css).toContain("--color-amber-dim:");
  });

  it("defines --color-blue as #00b0ff", () => {
    expect(css).toContain("--color-blue:      #00b0ff");
  });

  it("defines --color-blue-dim", () => {
    expect(css).toContain("--color-blue-dim:");
  });

  it(".glass-panel has correct backdrop-filter", () => {
    expect(css).toContain("backdrop-filter:         blur(16px)");
  });

  it(".glass-panel has -webkit-backdrop-filter", () => {
    expect(css).toContain("-webkit-backdrop-filter: blur(16px)");
  });

  it(".btn-primary background is #e8002b", () => {
    expect(css).toContain("background: #e8002b");
  });

  it(".btn-primary hover is #ff1a3d", () => {
    expect(css).toContain("background: #ff1a3d");
  });

  it(".spinner border-top-color is #e8002b", () => {
    expect(css).toContain("border-top-color: #e8002b");
  });

  it("does not contain legacy #8B0000", () => {
    expect(css).not.toContain("#8B0000");
    expect(css).not.toContain("#8b0000");
  });
});
