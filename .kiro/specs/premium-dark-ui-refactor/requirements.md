# Requirements Document

## Introduction

This feature performs a global UI refactoring of the RideHub Next.js aggregator app to apply a consistent premium dark design (Porsche Digital Concept / Cyberpunk aesthetic) across all routes and shared components. The reference design is already established in `app/page.tsx`. The goal is to propagate that design system — design tokens, glassmorphism panels, vehicle naming, and icon language — to every other page and shared component without touching any backend, Supabase, or state logic.

## Glossary

- **Design_System**: The set of design tokens, color values, typography rules, and component patterns defined in `app/page.tsx` and codified in `globals.css`.
- **Design_Token**: A named CSS custom property or constant representing a color, spacing, or visual value (e.g. `--color-bg: #040507`).
- **Glassmorphism_Panel**: A UI panel with `background: rgba(15,17,21,0.75)`, `backdropFilter: blur(16px)`, and `border: 1px solid rgba(255,255,255,0.05)`.
- **Brand_Vehicle**: One of the three named vehicle types: Taycan Scooter (red accent), E-Tron Bike (amber accent), Urban Moped (blue accent).
- **Map_Page**: The `/map` route rendered by `app/map/page.tsx` and `app/map/MapView.tsx`.
- **Auth_Page**: The `/auth` route and `/auth/reset-password` sub-route.
- **Profile_Page**: The `/profile` route.
- **Admin_Section**: The `/admin` layout and all sub-pages under it.
- **Shared_Component**: A component in `components/` used across multiple pages (AppFooter, LangSwitcher, LuxuryButton, VehicleIllustration).
- **Guest_User**: A visitor who has not authenticated with Supabase.
- **Lucide_Icon**: An icon imported from the `lucide-react` package.

---

## Requirements

### Requirement 1: Unified Design Token System

**User Story:** As a developer, I want all design tokens centralised in `globals.css`, so that the entire app shares a single source of truth for colors, surfaces, and borders.

#### Acceptance Criteria

1. THE Design_System SHALL define CSS custom properties in `:root` for all base colors: `--color-bg: #040507`, `--color-surface: rgba(15,17,21,0.75)`, `--color-text: #ffffff`, `--color-muted: #8895a5`, `--color-border: rgba(255,255,255,0.05)`.
2. THE Design_System SHALL define brand-specific tokens: `--color-red: #e8002b`, `--color-red-dim: rgba(232,0,43,0.08)`, `--color-amber: #f59e0b`, `--color-amber-dim: rgba(245,158,11,0.1)`, `--color-blue: #00b0ff`, `--color-blue-dim: rgba(0,176,255,0.08)`.
3. WHEN any page or component references a background color, text color, or border color, THE Design_System SHALL supply that value via a CSS custom property or a shared constant rather than a hardcoded hex literal.
4. THE Design_System SHALL update the `body` background to `#040507` and remove the legacy `#000000` and `#8B0000` values from `:root`.

---

### Requirement 2: Dark Base Theme on All Pages

**User Story:** As a user, I want every page to feel visually consistent, so that navigating between routes does not produce jarring light or mismatched backgrounds.

#### Acceptance Criteria

1. THE Auth_Page SHALL render its page background as `#040507` and its form card as a Glassmorphism_Panel.
2. THE Profile_Page SHALL render its page background as `#040507` and all stat/wallet/history cards as Glassmorphism_Panels.
3. THE Map_Page SHALL render its top bar and sidebar backgrounds using the dark surface token (`rgba(15,17,21,0.75)` with backdrop blur) rather than `#0A0A0A` / `#121212`.
4. THE Admin_Section SHALL render its sidebar and main content area backgrounds using `#040507` as the base, replacing the current `#000000` base.
5. WHEN a page is loading (spinner state), THE page SHALL display a `#040507` background rather than `#000000`.

---

### Requirement 3: Glassmorphism Panel Component

**User Story:** As a developer, I want a reusable glassmorphism panel style, so that cards and overlays look consistent without duplicating CSS.

#### Acceptance Criteria

1. THE Design_System SHALL expose a `.glass-panel` CSS utility class with `background: rgba(15,17,21,0.75)`, `backdrop-filter: blur(16px)`, `-webkit-backdrop-filter: blur(16px)`, and `border: 1px solid rgba(255,255,255,0.05)`.
2. WHEN a card or panel component applies `.glass-panel`, THE component SHALL inherit the glassmorphism appearance without additional inline background or border overrides.
3. THE Auth_Page form card SHALL use the `.glass-panel` style.
4. THE Profile_Page stat cards, wallet card, and history card SHALL use the `.glass-panel` style.

---

### Requirement 4: Brand Vehicle Naming and Icons

**User Story:** As a user, I want to see consistent premium vehicle names and icons everywhere, so that the brand identity feels polished and unified.

#### Acceptance Criteria

1. THE Map_Page SHALL replace the generic type labels ("S", "E", "B", "M") in sidebar badges with Lucide_Icons: `Zap` for Taycan Scooter, `Bike` for E-Tron Bike, `Gauge` for Urban Moped.
2. THE Map_Page sidebar filter pills SHALL display "Taycan Scooter", "E-Tron Bike", "Urban Moped" as the human-readable labels for the `scooter`, `ebike`, and `moped` filter values respectively.
3. THE Admin_Section fleet breakdown SHALL replace the raw type strings ("scooter", "ebike", "bike", "moped") with the Brand_Vehicle display names.
4. THE VehicleIllustration component SHALL accept a `color` prop that defaults to `#ffffff` and SHALL use the brand accent color (`#e8002b` for scooter, `#f59e0b` for ebike, `#00b0ff` for moped) when rendered in a branded context.
5. WHEN vehicle emoji characters (⚡, 🚲, 🛵) appear in any page or component, THE component SHALL replace them with the corresponding Lucide_Icon (`Zap`, `Bike`, `Gauge`).

---

### Requirement 5: Map Page Guest Access

**User Story:** As a Guest_User, I want to browse the vehicle map without being forced to register, so that I can evaluate the service before committing to sign-up.

#### Acceptance Criteria

1. THE Map_Page SHALL render the full map view and vehicle list for a Guest_User without redirecting to `/auth`.
2. WHEN a Guest_User attempts to reserve or start a ride, THE Map_Page SHALL display a prompt directing the user to sign in rather than silently failing or crashing.
3. WHILE a Guest_User is viewing the Map_Page, THE Map_Page SHALL display a non-blocking banner or CTA inviting the user to sign in, without obscuring the map or vehicle list.
4. THE Map_Page top bar SHALL show a "Sign In" link styled with the red accent (`#e8002b`) when no authenticated user is detected, replacing the current user-initial avatar button.

---

### Requirement 6: Shared Component Theming

**User Story:** As a developer, I want all shared components to use the updated design tokens, so that they integrate seamlessly into any page without visual inconsistency.

#### Acceptance Criteria

1. THE AppFooter component SHALL update its background to `#040507`, its border to `rgba(255,255,255,0.05)`, and its muted text color to `#8895a5`.
2. THE LangSwitcher component SHALL update its border to `rgba(255,255,255,0.05)`, its inactive button background to `rgba(15,17,21,0.75)`, and its active button background to `#e8002b`.
3. THE LuxuryButton component SHALL update its primary variant hover border color from `#8B0000` to `#e8002b` and its ghost variant hover color from `#8B0000` to `#e8002b`.
4. THE LangSwitcher active state SHALL use `#e8002b` as the accent color instead of `#8B0000`.

---

### Requirement 7: Global CSS and Font Consistency

**User Story:** As a developer, I want `globals.css` and `layout.tsx` to reflect the updated design system, so that the base layer is correct before any page-level styles are applied.

#### Acceptance Criteria

1. THE Design_System SHALL update the `.btn-primary` CSS class background from `#8B0000` to `#e8002b` and its hover state to a lighter variant of `#e8002b`.
2. THE Design_System SHALL update the `.btn-secondary` hover background and border to use `rgba(255,255,255,0.05)` for the border and `rgba(15,17,21,0.75)` for the hover background.
3. THE Design_System SHALL update the `.spinner` border-top-color from `#8B0000` to `#e8002b`.
4. THE Design_System SHALL update the `.automotive-card` background from `#121212` to `rgba(15,17,21,0.75)` and its border to `rgba(255,255,255,0.05)`.
5. THE `RootLayout` SHALL set `themeColor` in the viewport export to `#040507`.
6. THE `RootLayout` body class SHALL use `bg-[#040507]` instead of `bg-[#060709]`.

---

### Requirement 8: Accent Color Standardisation

**User Story:** As a developer, I want all red accent usages to reference the single brand red `#e8002b`, so that the legacy dark red `#8B0000` is fully replaced.

#### Acceptance Criteria

1. THE Auth_Page SHALL replace all occurrences of `#8B0000` with `#e8002b` in inline styles and focus handlers.
2. THE Profile_Page SHALL replace all occurrences of `#8B0000` with `#e8002b` in inline styles, wallet card border, and logout button hover.
3. THE Admin_Section layout and dashboard SHALL replace all occurrences of `#8B0000` with `#e8002b`.
4. THE Map_Page SHALL replace all occurrences of `#8B0000` with `#e8002b` in sidebar active states, filter pills, and the active ride bar.
5. IF a component uses `#8B0000` as a hardcoded value, THEN THE component SHALL be updated to use `#e8002b` or the `--color-red` CSS custom property.

---

### Requirement 9: Preserve Backend and State Logic

**User Story:** As a developer, I want all Supabase queries, authentication flows, state management, and routing logic to remain unchanged, so that the refactoring carries zero risk of breaking existing functionality.

#### Acceptance Criteria

1. THE refactoring SHALL NOT modify any Supabase client calls, query logic, or data-mapping functions.
2. THE refactoring SHALL NOT modify any React state declarations, `useEffect` hooks managing data fetching, or event handler logic.
3. THE refactoring SHALL NOT modify any Next.js routing (`useRouter`, `Link` hrefs) or authentication redirect logic.
4. THE refactoring SHALL NOT modify the `I18nProvider`, `useI18n` hook, or any translation key references.
5. WHEN a file is modified for UI purposes, THE file SHALL pass TypeScript compilation without new type errors.
