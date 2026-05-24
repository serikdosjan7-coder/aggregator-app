import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement("a", { href, ...props }, children),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock Supabase
vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  }),
}));

// Mock i18n
vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    locale: "en",
    setLocale: vi.fn(),
    t: {
      auth: {
        wordmark: "RideHub",
        title: "Sign In",
        subtitle_signin: "Welcome back",
        subtitle_signup: "Create account",
        label_email: "Email",
        label_password: "Password",
        placeholder_email: "email@example.com",
        placeholder_password: "••••••••",
        btn_signin: "Sign In",
        btn_signup: "Sign Up",
        btn_toggle_to_signup: "Create account",
        btn_toggle_to_signin: "Sign in",
        forgot_password: "Forgot password",
        err_invalid: "Invalid credentials",
        err_exists: "Already registered",
        confirm_sent: "Check your email",
        quote: "Urban velocity.",
      },
      reset: {
        title: "Reset Password",
        subtitle: "Enter your email",
        label_email: "Email",
        label_password: "New Password",
        label_confirm: "Confirm Password",
        btn_send: "Send Link",
        btn_sending: "Sending...",
        btn_set: "Set Password",
        success: "Link sent",
        success_reset: "Password updated",
        back_to_auth: "Back to sign in",
        new_password_title: "New Password",
        new_password_subtitle: "Enter your new password",
        err_mismatch: "Passwords do not match",
      },
      profile: {
        footer_powered: "Powered by RideHub",
        footer_dev: "Built with love",
      },
    },
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// Mock LangSwitcher
vi.mock("@/components/LangSwitcher", () => ({
  LangSwitcher: () => React.createElement("div", { "data-testid": "lang-switcher" }),
}));

import AuthPage from "../app/auth/page";

describe("AuthPage", () => {
  beforeEach(() => {
    // Simulate mounted state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.spyOn(React, "useState") as any)
      .mockImplementationOnce(() => [true, vi.fn()])
      .mockImplementation((init: unknown) => [init, vi.fn()]);
  });

  it("renders with page background #040507", () => {
    const { getByTestId } = render(React.createElement(AuthPage));
    const page = getByTestId("auth-page");
    expect(page.style.background).toBe("rgb(4, 5, 7)");
  });

  it("form card has glass-panel class", () => {
    const { getByTestId } = render(React.createElement(AuthPage));
    const page = getByTestId("auth-page");
    const card = page.querySelector(".glass-panel");
    expect(card).not.toBeNull();
  });
});
