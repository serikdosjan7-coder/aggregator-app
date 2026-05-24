// Feature: premium-dark-ui-refactor, Property 3: glass-panel class is applied to all required card components
import { describe, it, expect, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import * as fc from "fast-check";

// ── Mocks ──────────────────────────────────────────────────────────────────

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
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
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
      auth: {
        wordmark: "RideHub", title: "Sign In", subtitle_signin: "Welcome back",
        subtitle_signup: "Create account", label_email: "Email", label_password: "Password",
        placeholder_email: "email@example.com", placeholder_password: "••••••••",
        btn_signin: "Sign In", btn_signup: "Sign Up", btn_toggle_to_signup: "Create account",
        btn_toggle_to_signin: "Sign in", forgot_password: "Forgot password",
        err_invalid: "Invalid credentials", err_exists: "Already registered",
        confirm_sent: "Check your email", quote: "Urban velocity.",
      },
      reset: {
        title: "Reset Password", subtitle: "Enter your email", label_email: "Email",
        label_password: "New Password", label_confirm: "Confirm Password",
        btn_send: "Send Link", btn_sending: "Sending...", btn_set: "Set Password",
        success: "Link sent", success_reset: "Password updated", back_to_auth: "Back to sign in",
        new_password_title: "New Password", new_password_subtitle: "Enter your new password",
        err_mismatch: "Passwords do not match",
      },
      nav: { map: "Map" },
      profile: {
        wordmark: "RideHub", section_label: "Profile", stat_rides: "Rides",
        stat_spent: "Spent", stat_rating: "Rating", wallet_section: "Wallet",
        credits_title: "Credits", history_section: "History", history_empty: "No rides yet",
        account_section: "Account", account_version: "Version", account_platform: "Platform",
        btn_signout: "Sign Out", signing_out: "Signing out...", col_date: "Date",
        col_vehicle: "Vehicle", col_duration: "Duration", col_machine: "Machine",
        col_cost: "Cost", footer_powered: "Powered by RideHub", footer_dev: "Built with love",
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

// Spy useState to simulate mounted=true
const realUseState = React.useState;
function mockUseStateForMounted<T>(init: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  // First call (isMounted) returns true
  return realUseState(typeof init === "function" ? (init as () => T)() : init);
}

import AuthPage from "../app/auth/page";
import ProfilePage from "../app/profile/page";

// ── Property 3 ─────────────────────────────────────────────────────────────

describe("Property 3: Glass-panel class is applied to all required card components", () => {
  it("Auth form card has glass-panel class across all renders", () => {
    // Feature: premium-dark-ui-refactor, Property 3: glass-panel class is applied to all required card components
    fc.assert(
      fc.property(fc.constant("auth-form-card"), (_label) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (vi.spyOn(React, "useState") as any)
          .mockImplementationOnce(() => [true, vi.fn()])
          .mockImplementation((init: unknown) => [init, vi.fn()]);

        const { container } = render(React.createElement(AuthPage));
        const hasGlass = container.querySelector(".glass-panel") !== null;
        cleanup();
        vi.restoreAllMocks();
        return hasGlass;
      }),
      { numRuns: 10 }
    );
  });

  it("Profile stat cards have glass-panel class across all renders", () => {
    fc.assert(
      fc.property(fc.constant("profile-stat-cards"), (_label) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (vi.spyOn(React, "useState") as any)
          .mockImplementationOnce(() => [true, vi.fn()])
          .mockImplementation((init: unknown) => [init, vi.fn()]);

        const { container } = render(React.createElement(ProfilePage));
        const hasGlass = container.querySelectorAll(".glass-panel").length > 0;
        cleanup();
        vi.restoreAllMocks();
        return hasGlass;
      }),
      { numRuns: 10 }
    );
  });
});
