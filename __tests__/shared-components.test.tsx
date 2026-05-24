import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement("a", { href, ...props }, children),
}));

// Mock i18n
vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    locale: "en",
    setLocale: vi.fn(),
    t: {
      profile: {
        footer_powered: "Powered by RideHub",
        footer_dev: "Built with love",
      },
    },
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

import { AppFooter } from "../components/AppFooter";
import { LangSwitcher } from "../components/LangSwitcher";
import { VehicleIllustration } from "../components/VehicleIllustration";

describe("AppFooter", () => {
  it("renders with background #040507", () => {
    const { container } = render(React.createElement(AppFooter));
    const footer = container.querySelector("footer");
    expect(footer).not.toBeNull();
    // jsdom normalises hex to rgb
    expect(footer!.style.background).toBe("rgb(4, 5, 7)");
  });

  it("renders muted text with color #8895a5", () => {
    const { container } = render(React.createElement(AppFooter));
    const paras = container.querySelectorAll("p");
    // jsdom normalises #8895a5 → rgb(136, 149, 165)
    const mutedParas = Array.from(paras).filter(
      (p) => p.style.color === "rgb(136, 149, 165)"
    );
    expect(mutedParas.length).toBeGreaterThan(0);
  });

  it("has border-top with rgba(255,255,255,0.05)", () => {
    const { container } = render(React.createElement(AppFooter));
    const footer = container.querySelector("footer");
    expect(footer!.style.borderTop).toContain("rgba(255, 255, 255, 0.05)");
  });
});

describe("LangSwitcher", () => {
  it("renders active button with background #e8002b", () => {
    const { container } = render(React.createElement(LangSwitcher));
    const buttons = container.querySelectorAll("button");
    // locale is "en", so the "en" button should be active
    const activeBtn = Array.from(buttons).find((b) => b.textContent === "en");
    expect(activeBtn).not.toBeNull();
    // jsdom normalises #e8002b → rgb(232, 0, 43)
    expect(activeBtn!.style.background).toBe("rgb(232, 0, 43)");
  });

  it("renders inactive buttons with muted color #8895a5", () => {
    const { container } = render(React.createElement(LangSwitcher));
    const buttons = container.querySelectorAll("button");
    const inactiveBtns = Array.from(buttons).filter((b) => b.textContent !== "en");
    inactiveBtns.forEach((btn) => {
      // jsdom normalises #8895a5 → rgb(136, 149, 165)
      expect(btn.style.color).toBe("rgb(136, 149, 165)");
    });
  });
});

describe("VehicleIllustration", () => {
  const types = ["scooter", "ebike", "bike", "moped"] as const;

  types.forEach((type) => {
    it(`renders ${type} without crashing`, () => {
      const { container } = render(
        React.createElement(VehicleIllustration, { type })
      );
      expect(container.querySelector("svg")).not.toBeNull();
    });
  });

  it("uses default color #ffffff", () => {
    const { container } = render(
      React.createElement(VehicleIllustration, { type: "scooter" })
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // The first circle stroke should use the default color
    const firstCircle = svg!.querySelector("circle");
    expect(firstCircle!.getAttribute("stroke")).toBe("#ffffff");
  });
});
