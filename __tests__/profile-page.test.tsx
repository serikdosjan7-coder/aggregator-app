import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      signOut: vi.fn().mockResolvedValue({}),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}));

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    locale: "en",
    setLocale: vi.fn(),
    t: {
      nav: { map: "Map" },
      profile: {
        wordmark: "RideHub",
        section_label: "Profile",
        stat_rides: "Rides",
        stat_spent: "Spent",
        stat_rating: "Rating",
        wallet_section: "Wallet",
        credits_title: "Credits",
        history_section: "History",
        history_empty: "No rides yet",
        account_section: "Account",
        account_version: "Version",
        account_platform: "Platform",
        btn_signout: "Sign Out",
        signing_out: "Signing out...",
        col_date: "Date",
        col_vehicle: "Vehicle",
        col_duration: "Duration",
        col_machine: "Machine",
        col_cost: "Cost",
        footer_powered: "Powered by RideHub",
        footer_dev: "Built with love",
      },
    },
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

vi.mock("@/components/LangSwitcher", () => ({
  LangSwitcher: () => React.createElement("div", { "data-testid": "lang-switcher" }),
}));

vi.mock("@/components/AppFooter", () => ({
  AppFooter: () => React.createElement("footer", { "data-testid": "app-footer" }),
}));

import ProfilePage from "../app/profile/page";

describe("ProfilePage", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.spyOn(React, "useState") as any)
      .mockImplementationOnce(() => [true, vi.fn()])
      .mockImplementation((init: unknown) => [init, vi.fn()]);
  });

  it("renders with page background #040507", () => {
    const { getByTestId } = render(React.createElement(ProfilePage));
    const page = getByTestId("profile-page");
    expect(page.style.background).toBe("rgb(4, 5, 7)");
  });

  it("stat card has glass-panel class", () => {
    const { getByTestId } = render(React.createElement(ProfilePage));
    const page = getByTestId("profile-page");
    const glassCards = page.querySelectorAll(".glass-panel");
    expect(glassCards.length).toBeGreaterThan(0);
  });
});
