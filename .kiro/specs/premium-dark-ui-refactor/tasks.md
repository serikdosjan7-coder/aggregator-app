# Implementation Plan: Premium Dark UI Refactor

## Overview

Propagate the Porsche Digital Concept / Cyberpunk design system from `app/page.tsx` to every other route and shared component. All changes are purely visual — no backend, Supabase, state, or routing logic is modified.

## Tasks

- [x] 1. Update `globals.css` with the new design token system
  - Replace `:root` custom properties with the new palette: `--color-bg: #040507`, `--color-surface: rgba(15,17,21,0.75)`, `--color-text: #ffffff`, `--color-muted: #8895a5`, `--color-border: rgba(255,255,255,0.05)`, and all brand tokens (`--color-red`, `--color-red-dim`, `--color-amber`, `--color-amber-dim`, `--color-blue`, `--color-blue-dim`)
  - Add `.glass-panel` utility class with `background: rgba(15,17,21,0.75)`, `backdrop-filter: blur(16px)`, `-webkit-backdrop-filter: blur(16px)`, `border: 1px solid rgba(255,255,255,0.05)`
  - Update `.btn-primary` background to `#e8002b`, hover to `#ff1a3d`
  - Update `.btn-secondary` hover border to `rgba(255,255,255,0.12)` and hover background to `rgba(15,17,21,0.75)`
  - Update `.spinner` `border-top-color` to `#e8002b`
  - Update `.automotive-card` background to `rgba(15,17,21,0.75)` and border to `1px solid rgba(255,255,255,0.05)`
  - Update `body` background to `var(--color-bg)`
  - _Requirements: 1.1, 1.2, 1.4, 7.1, 7.2, 7.3, 7.4_

  - [x] 1.1 Write unit tests for globals.css token presence
    - Verify all required CSS custom properties exist with correct values
    - Verify `.glass-panel` class has correct `backdrop-filter` value
    - Verify `.btn-primary` background is `#e8002b`
    - _Requirements: 1.1, 1.2, 3.1, 7.1_

- [x] 2. Update `app/layout.tsx` base theme
  - Set `themeColor` in viewport export to `#040507`
  - Update `html` and `body` Tailwind classes from `bg-[#060709]` to `bg-[#040507]`
  - _Requirements: 7.5, 7.6_

- [x] 3. Refactor shared components to use updated tokens
  - [x] 3.1 Update `components/AppFooter.tsx`
    - Change footer background from `#000000` to `#040507`
    - Change `borderTop` from `1px solid #1A1A1A` to `1px solid rgba(255,255,255,0.05)`
    - Change muted text color from `#333333` to `#8895a5`
    - _Requirements: 6.1_

  - [x] 3.2 Update `components/LangSwitcher.tsx`
    - Change container border from `1px solid #1A1A1A` to `1px solid rgba(255,255,255,0.05)`
    - Change inactive button background from `#0A0A0A` to `rgba(15,17,21,0.75)` and color from `#A0A0A0` to `#8895a5`
    - Change active button background from `#8B0000` to `#e8002b`
    - _Requirements: 6.2, 6.4, 8.5_

  - [x] 3.3 Update `components/LuxuryButton.tsx`
    - Change primary variant hover border color from `#8B0000` to `#e8002b`
    - Change primary variant hover background from `rgba(139,0,0,0.15)` to `rgba(232,0,43,0.15)`
    - Change ghost variant hover border color from `#8B0000` to `#e8002b`
    - _Requirements: 6.3, 8.5_

  - [x] 3.4 Update `components/VehicleIllustration.tsx`
    - Add optional `brandColor` prop (defaults to `#e8002b`)
    - Replace hardcoded `rgba(139,0,0,0.7)` wheel accent with `brandColor` at reduced opacity
    - _Requirements: 4.4_

  - [x] 3.5 Write unit tests for shared components
    - Render `AppFooter` and verify background is `#040507` and text color is `#8895a5`
    - Render `LangSwitcher` with active locale and verify active button background is `#e8002b`
    - Render `VehicleIllustration` for all four types and verify no crash and default color is `#ffffff`
    - _Requirements: 6.1, 6.2, 4.4_

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Refactor auth pages
  - [x] 5.1 Update `app/auth/page.tsx`
    - Change page wrapper background from `#000000` to `#040507`
    - Replace form card inline `background: #121212` / `border: 1px solid #1A1A1A` with `className="glass-panel"`
    - Replace all `#8B0000` occurrences with `#e8002b` (wordmark, input focus, submit button, forgot-password link)
    - _Requirements: 2.1, 3.3, 8.1_

  - [x] 5.2 Update `app/auth/reset-password/page.tsx`
    - Change page wrapper background from `#000000` to `#040507`
    - Replace form card inline styles with `className="glass-panel"`
    - Replace all `#8B0000` occurrences with `#e8002b`
    - _Requirements: 2.1, 3.3, 8.1_

  - [x] 5.3 Write unit tests for auth pages
    - Render `AuthPage` and verify outermost div background is `#040507`
    - Verify form card has `glass-panel` class
    - _Requirements: 2.1, 3.3_

- [x] 6. Refactor profile page
  - Update `app/profile/page.tsx`
  - Change page wrapper background from `#000000` to `#040507`
  - Replace `cardStyle` constant (`background: #121212`, `border: 1px solid #1A1A1A`) with `.glass-panel` class applied via `className`
  - Replace wallet card inline border `1px solid #8B0000` with `1px solid #e8002b`
  - Replace all remaining `#8B0000` occurrences with `#e8002b` (logout button hover, machine ID color, wallet icon border)
  - _Requirements: 2.2, 3.4, 8.2_

  - [x] 6.1 Write unit tests for profile page
    - Render `ProfilePage` (mocked Supabase) and verify page background is `#040507`
    - Verify stat card has `glass-panel` class
    - _Requirements: 2.2, 3.4_

- [x] 7. Refactor map page — theming and vehicle icons
  - [x] 7.1 Update `TYPE_META` and add `TYPE_LABELS` in `app/map/page.tsx`
    - Replace letter-label `TYPE_META` with icon-based version using `Zap`, `Bike`, `Gauge` from `lucide-react`
    - Add `TYPE_LABELS` mapping: `scooter → "Taycan Scooter"`, `ebike → "E-Tron Bike"`, `bike → "Bike"`, `moped → "Urban Moped"`
    - Update sidebar badge rendering to use `<Icon size={16} />` instead of the letter label `div`
    - Update filter pill labels to use `TYPE_LABELS`
    - _Requirements: 4.1, 4.2_

  - [x] 7.2 Apply dark surface theme to map top bar and sidebar
    - Change top bar background from `#0A0A0A` to `rgba(15,17,21,0.75)` with `backdropFilter: blur(16px)`
    - Change sidebar background from `#0A0A0A` to `rgba(15,17,21,0.75)` with `backdropFilter: blur(16px)`
    - Change sidebar item active background from `#0A0000` to `rgba(232,0,43,0.08)`
    - Change filter pill active background from `#0A0000` to `rgba(232,0,43,0.08)`
    - Replace all `#8B0000` occurrences with `#e8002b`
    - Replace `#1A1A1A` border values with `rgba(255,255,255,0.05)`
    - _Requirements: 2.3, 8.4_

  - [x] 7.3 Write property test for vehicle type mapping completeness
    - **Property 2: Vehicle type → icon and label mapping is total and correct**
    - For any vehicle type in `{ scooter, ebike, bike, moped }`, `TYPE_META[type].Icon` is non-null and `TYPE_LABELS[type]` is a non-empty string
    - **Validates: Requirements 4.1, 4.2**

- [x] 8. Implement guest access on map page
  - In `app/map/page.tsx`, after the auth `useEffect` resolves with no user, show a "Sign In →" link in the top bar (styled `#e8002b`) instead of the user-initial avatar button
  - Add a slim dismissible guest banner below the top bar: "Explore the map freely. Sign in to ride." with a `/auth` link
  - In `reserveVehicle` and `startRide`, add a guard: `if (!userId) { showToast("Sign in to book a vehicle"); return }`
  - Do NOT add any `router.push("/auth")` call — the map must remain accessible
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 8.1 Write unit tests for guest map access
    - Render `MapPage` with mocked null Supabase user; verify `router.push` is not called
    - Verify "Sign In" link is present in the top bar
    - Verify guest banner is rendered
    - Simulate clicking "Reserve" as guest; verify toast appears and no redirect occurs
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 8.2 Write property test for guest user sees map without redirect
    - **Property 4: Guest user sees map content without redirect**
    - For any render of MapPage with null user, `router.push` is never called and the map container is present
    - **Validates: Requirements 5.1, 5.4**

- [x] 9. Refactor admin section
  - [x] 9.1 Update `app/admin/layout.tsx`
    - Change sidebar and main content background from `#000000` to `#040507`
    - Replace all `#8B0000` occurrences with `#e8002b`
    - Replace `#1A1A1A` border values with `rgba(255,255,255,0.05)`
    - _Requirements: 2.4, 8.3_

  - [x] 9.2 Update `app/admin/page.tsx`
    - Replace all `#8B0000` occurrences with `#e8002b`
    - Update fleet breakdown type labels: map `"scooter"` → `"Taycan Scooter"`, `"ebike"` → `"E-Tron Bike"`, `"moped"` → `"Urban Moped"`, `"bike"` → `"Bike"`
    - Update `card` constant border from `1px solid #1A1A1A` to `1px solid rgba(255,255,255,0.05)`
    - _Requirements: 4.3, 8.3_

- [x] 10. Update `app/map/MapView.tsx` accent colors
  - Replace `#8B0000` marker color with `#e8002b`
  - Replace `#B45309` amber marker with `#f59e0b`
  - Replace `#0F766E` teal marker with `#00b0ff`
  - _Requirements: 8.4_

- [x] 11. Write property test for legacy color absence
  - **Property 1: Legacy accent color is absent from all modified source files**
  - For any file in the set of modified source files, the string `#8B0000` (and `#8b0000`) does not appear
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

- [x] 11.1 Write property test using fast-check
  - Use `fc.constantFrom(...modifiedFiles)` to generate file paths
  - Read each file and assert absence of `#8B0000` / `#8b0000`
  - Minimum 100 runs
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12. Write property test for glass-panel class on required components
  - **Property 3: Glass-panel class is applied to all required card components**
  - For any component in `{ Auth form card, Profile stat cards, Profile wallet card, Profile history card }`, the rendered element has `glass-panel` in its className
  - **Validates: Requirements 3.3, 3.4**

- [x] 13. Final checkpoint — Ensure all tests pass
  - Run `tsc --noEmit` to verify no new TypeScript errors
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks include testing to ensure comprehensive coverage from the start
- All tasks preserve existing Supabase queries, state hooks, routing, and i18n logic
- The `#8B0000` → `#e8002b` replacement is the single most pervasive change — search each file before editing
- `MapView.tsx` uses Leaflet and is dynamically imported; edit it independently of `map/page.tsx`
- Property tests require `fast-check`: `npm install --save-dev fast-check`
