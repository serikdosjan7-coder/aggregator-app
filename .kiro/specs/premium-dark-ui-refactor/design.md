# Design Document: Premium Dark UI Refactor

## Overview

This refactor propagates the Porsche Digital Concept / Cyberpunk aesthetic already established in `app/page.tsx` to every other route and shared component in the RideHub Next.js app. The work is purely visual — no backend, Supabase, state, or routing logic is touched.

The core strategy is:

1. **Centralise tokens** — update `globals.css` to be the single source of truth for the new palette.
2. **Lift the base background** — replace `#000000` / `#060709` with `#040507` everywhere.
3. **Introduce glassmorphism** — add a `.glass-panel` utility class and apply it to cards/panels across all pages.
4. **Standardise the accent** — replace the legacy dark red `#8B0000` with the brand red `#e8002b` in every file.
5. **Upgrade vehicle identity** — swap emoji and raw type strings for Lucide icons and premium brand names.
6. **Open the map to guests** — remove the implicit auth gate on `/map` and add a non-blocking sign-in CTA.

---

## Architecture

The refactor touches only the presentation layer. No new routes, providers, or data-fetching patterns are introduced.

```
app/
  globals.css          ← Token definitions, utility classes (primary change)
  layout.tsx           ← themeColor + body bg update
  map/
    page.tsx           ← Accent, glassmorphism, guest access, vehicle icons
    MapView.tsx        ← Accent color update (marker colours)
  auth/
    page.tsx           ← Glassmorphism card, accent update
    reset-password/
      page.tsx         ← Glassmorphism card, accent update
  profile/
    page.tsx           ← Glassmorphism cards, accent update
  admin/
    layout.tsx         ← Base bg, accent update
    page.tsx           ← Accent, vehicle names update
components/
  AppFooter.tsx        ← Token update
  LangSwitcher.tsx     ← Token update
  LuxuryButton.tsx     ← Accent update
  VehicleIllustration.tsx ← Brand accent colours
```

All changes are confined to inline styles, className strings, and CSS rules. The component tree, data flow, and Supabase integration remain identical.

---

## Components and Interfaces

### globals.css — Design Token Layer

The CSS file becomes the canonical token registry. New additions:

```css
:root {
  --color-bg:        #040507;
  --color-surface:   rgba(15, 17, 21, 0.75);
  --color-text:      #ffffff;
  --color-muted:     #8895a5;
  --color-border:    rgba(255, 255, 255, 0.05);
  --color-red:       #e8002b;
  --color-red-dim:   rgba(232, 0, 43, 0.08);
  --color-amber:     #f59e0b;
  --color-amber-dim: rgba(245, 158, 11, 0.1);
  --color-blue:      #00b0ff;
  --color-blue-dim:  rgba(0, 176, 255, 0.08);
}

.glass-panel {
  background:              rgba(15, 17, 21, 0.75);
  backdrop-filter:         blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border:                  1px solid rgba(255, 255, 255, 0.05);
}
```

Updated utility classes:

| Class | Old value | New value |
|---|---|---|
| `.btn-primary` background | `#8B0000` | `#e8002b` |
| `.btn-primary:hover` | `#A30000` | `#ff1a3d` |
| `.btn-secondary:hover` border | `#333333` | `rgba(255,255,255,0.12)` |
| `.spinner` border-top-color | `#8B0000` | `#e8002b` |
| `.automotive-card` background | `#121212` | `rgba(15,17,21,0.75)` |
| `.automotive-card` border | `1px solid #1A1A1A` | `1px solid rgba(255,255,255,0.05)` |

### layout.tsx

- `themeColor` → `#040507`
- `html` / `body` Tailwind class → `bg-[#040507]`

### Auth Pages (`/auth`, `/auth/reset-password`)

Both pages share the same structural pattern:

- Page wrapper background: `#040507`
- Form card: apply `.glass-panel` class (removes the `background: #121212` / `border: 1px solid #1A1A1A` inline overrides)
- All `#8B0000` references → `#e8002b`
- Input focus border: `#e8002b`
- Wordmark color: `#e8002b`

### Profile Page (`/profile`)

- Page wrapper background: `#040507`
- `cardStyle` constant: replace `background: #121212` / `border: 1px solid #1A1A1A` with `.glass-panel` class
- Wallet card border: `#e8002b`
- All `#8B0000` → `#e8002b`
- `AppFooter` receives updated styles via the component update

### Map Page (`/map/page.tsx`)

**Theming:**
- Top bar background: `rgba(15,17,21,0.75)` with `backdropFilter: blur(16px)` (was `#0A0A0A`)
- Sidebar background: `rgba(15,17,21,0.75)` (was `#0A0A0A`)
- Sidebar item active background: `rgba(232,0,43,0.08)` (was `#0A0000`)
- All `#8B0000` → `#e8002b`
- Filter pill active border/background: `#e8002b` / `rgba(232,0,43,0.08)`

**Vehicle icons in sidebar badges:**

Replace the letter-label `div` with a Lucide icon:

```tsx
import { Zap, Bike, Gauge } from "lucide-react"

const TYPE_META: Record<TransportType, { Icon: React.ComponentType<...>; bg: string; color: string }> = {
  scooter: { Icon: Zap,   bg: "rgba(232,0,43,0.12)",    color: "#e8002b" },
  ebike:   { Icon: Bike,  bg: "rgba(245,158,11,0.12)",  color: "#f59e0b" },
  bike:    { Icon: Bike,  bg: "rgba(255,255,255,0.08)", color: "#ffffff" },
  moped:   { Icon: Gauge, bg: "rgba(0,176,255,0.12)",   color: "#00b0ff" },
}
```

**Filter pill labels:**

```tsx
const TYPE_LABELS: Record<TransportType | "all", string> = {
  all:     "All",
  scooter: "Taycan Scooter",
  ebike:   "E-Tron Bike",
  bike:    "Bike",
  moped:   "Urban Moped",
}
```

**Guest access:**

The current code calls `supabase.auth.getUser()` on mount and sets `userInitial` / `userId`. The map itself is never gated — it renders regardless. The only change needed is:

1. When `userId` is `null` after mount, show a "Sign In →" link in the top bar (styled with `#e8002b`) instead of the user-initial avatar button.
2. In `reserveVehicle` and `startRide`, add a guard: if `!userId`, call `showToast("Sign in to book a vehicle")` and return early — no redirect, no crash.
3. Add a slim guest banner below the top bar (dismissible) with text "Explore the map freely. Sign in to ride." and a link to `/auth`.

### MapView.tsx

- Replace `#8B0000` marker color with `#e8002b`
- Replace `#B45309` (amber marker) with `#f59e0b`
- Replace `#0F766E` (teal marker) with `#00b0ff`

### Admin Section (`/admin/layout.tsx`, `/admin/page.tsx`)

- Sidebar background: `#040507` (was `#000000`)
- Main content background: `#040507`
- All `#8B0000` → `#e8002b`
- Fleet breakdown type labels: map raw strings to Brand_Vehicle names
- KPI accent color: `#e8002b`

### AppFooter

```tsx
// Before
background: "#000000"
borderTop: "1px solid #1A1A1A"
color: "#333333"  // muted text

// After
background: "#040507"
borderTop: "1px solid rgba(255,255,255,0.05)"
color: "#8895a5"  // --color-muted
```

### LangSwitcher

```tsx
// Container border
border: "1px solid rgba(255,255,255,0.05)"  // was #1A1A1A

// Inactive button
background: "rgba(15,17,21,0.75)"  // was #0A0A0A
color: "#8895a5"                   // was #A0A0A0

// Active button
background: "#e8002b"  // was #8B0000
```

### LuxuryButton

```tsx
// Primary hover border
borderColor: "#e8002b"  // was #8B0000

// Ghost hover color
color: "#ffffff"        // was #FFFFFF (no change)
borderColor: "#e8002b"  // was #8B0000
```

### VehicleIllustration

Add a `brandColor` prop (optional) that overrides the wheel accent `m` variable:

```tsx
interface Props {
  type: VehicleType
  size?: number
  color?: string
  brandColor?: string  // new — defaults to "#e8002b"
}
```

When `brandColor` is provided, use it for the wheel glow circles instead of the hardcoded `rgba(139,0,0,0.7)`.

---

## Data Models

No new data models are introduced. The only "data" change is the `TYPE_META` and `TYPE_LABELS` lookup objects in `map/page.tsx`, which are pure UI constants.

```ts
// Existing (to be replaced)
const TYPE_META: Record<TransportType, { label: string; bg: string; textColor: string }> = {
  scooter: { label: "S", bg: "#8B0000",  textColor: "#FFFFFF" },
  ebike:   { label: "E", bg: "#B45309",  textColor: "#FFFFFF" },
  bike:    { label: "B", bg: "#FFFFFF",  textColor: "#000000" },
  moped:   { label: "M", bg: "#0F766E",  textColor: "#FFFFFF" },
}

// New
const TYPE_META: Record<TransportType, { Icon: LucideIcon; bg: string; color: string }> = {
  scooter: { Icon: Zap,   bg: "rgba(232,0,43,0.12)",    color: "#e8002b" },
  ebike:   { Icon: Bike,  bg: "rgba(245,158,11,0.12)",  color: "#f59e0b" },
  bike:    { Icon: Bike,  bg: "rgba(255,255,255,0.08)", color: "#ffffff" },
  moped:   { Icon: Gauge, bg: "rgba(0,176,255,0.12)",   color: "#00b0ff" },
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Legacy accent color is absent from all modified source files

*For any* modified TypeScript/TSX source file in the project, the legacy dark red color value `#8B0000` (and its lowercase variant `#8b0000`) SHALL NOT appear as a string literal.

This is a metamorphic property: adding any new UI code should not reintroduce the old accent. The property holds across the entire set of modified files.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

---

### Property 2: Vehicle type → icon and label mapping is total and correct

*For any* vehicle type value in the set `{ scooter, ebike, bike, moped }`, the `TYPE_META` lookup SHALL return a non-null `Icon` component and the `TYPE_LABELS` lookup SHALL return a non-empty string that matches the expected brand name.

This is an invariant property over the finite set of vehicle types — every member of the domain must have a valid mapping.

**Validates: Requirements 4.1, 4.2**

---

### Property 3: Glass-panel class is applied to all required card components

*For any* component in the set `{ Auth form card, Profile stat cards, Profile wallet card, Profile history card }`, the rendered element SHALL have the `glass-panel` CSS class in its `className`.

This is an invariant over the set of glassmorphism-required components.

**Validates: Requirements 3.3, 3.4**

---

### Property 4: Guest user sees map content without redirect

*For any* render of `MapPage` where `supabase.auth.getUser()` resolves with `null` user, the component SHALL NOT call `router.push` or `router.replace`, and the map container element SHALL be present in the rendered output.

This is an invariant: the guest access guarantee must hold regardless of what other state is present.

**Validates: Requirements 5.1, 5.4**

---

## Error Handling

This refactor introduces no new error paths. Existing error handling (Supabase failures falling back to mock data, auth errors showing inline messages) is preserved unchanged.

The one new error surface is the guest booking guard in `reserveVehicle` / `startRide`. If `userId` is null, a toast message is shown — this is a graceful degradation, not an error state.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are used. They are complementary:

- **Unit tests** verify specific examples: correct CSS values in `globals.css`, correct background on the auth page, correct sign-in link in the map top bar for guests.
- **Property tests** verify universal invariants: no legacy color in any file, every vehicle type has a valid icon mapping, every glassmorphism card has the right class.

### Property-Based Testing

The project uses TypeScript/React. The recommended PBT library is **fast-check** (`npm install --save-dev fast-check`).

Each property test runs a minimum of **100 iterations**.

Tag format: `// Feature: premium-dark-ui-refactor, Property N: <property_text>`

**Property 1 — Legacy color absence:**
```ts
// Feature: premium-dark-ui-refactor, Property 1: legacy accent color is absent from all modified source files
fc.assert(fc.property(fc.constantFrom(...modifiedFiles), (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8")
  return !content.includes("#8B0000") && !content.includes("#8b0000")
}), { numRuns: 100 })
```

**Property 2 — Vehicle type mapping completeness:**
```ts
// Feature: premium-dark-ui-refactor, Property 2: vehicle type → icon and label mapping is total and correct
fc.assert(fc.property(fc.constantFrom("scooter", "ebike", "bike", "moped"), (type) => {
  const meta = TYPE_META[type]
  const label = TYPE_LABELS[type]
  return meta.Icon != null && typeof label === "string" && label.length > 0
}), { numRuns: 100 })
```

**Property 3 — Glass-panel class on required components:**
```ts
// Feature: premium-dark-ui-refactor, Property 3: glass-panel class is applied to all required card components
fc.assert(fc.property(fc.constantFrom(...glassmorphismComponents), (component) => {
  const { container } = render(component)
  return container.querySelector(".glass-panel") !== null
}), { numRuns: 100 })
```

**Property 4 — Guest user sees map without redirect:**
```ts
// Feature: premium-dark-ui-refactor, Property 4: guest user sees map content without redirect
fc.assert(fc.property(fc.constant(null), (_) => {
  mockSupabaseUser(null)
  const { container } = render(<MapPage />)
  expect(mockRouter.push).not.toHaveBeenCalled()
  return container.querySelector("[data-testid='map-container']") !== null
}), { numRuns: 100 })
```

### Unit Tests

Unit tests focus on:

- `globals.css` contains all required CSS custom properties with correct values
- `globals.css` `.btn-primary` background is `#e8002b`
- `globals.css` `.glass-panel` class has the correct `backdrop-filter` value
- Auth page renders with `#040507` background
- Map top bar shows "Sign In" link when user is null
- Guest clicking "Reserve" shows a toast, not a redirect
- `VehicleIllustration` renders without crashing for all four vehicle types
- `AppFooter` renders with updated muted text color `#8895a5`
