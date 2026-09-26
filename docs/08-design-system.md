# Design system in code

The design system is **Kotila Farm Ledger**. Its full brand book is in `design/brand/` (start with `00-brand-book.md`). This doc says how to build it with shadcn (Base UI) and Tailwind.

## Setup

1. `pnpm dlx shadcn@latest init` → choose **Base UI** (the default), Next.js, CSS variables on.
2. Paste `design/theme.css` into `src/app/globals.css` as its header comment says. Delete the dark theme block — the product is light only (used outdoors).
3. Fonts with `next/font/google`: `Signika` (300, 400, 600, 700) as `--font-signika`, `Plus_Jakarta_Sans` (400–800) as `--font-jakarta`, applied on `<html>`.
4. Logos: turn `design/logos/*.svg` into React components in `src/svgs/` (`kotila-icon.tsx`, `kotila-mark.tsx` with a `color` prop for green or white). Use the icon beside a text wordmark (**Kotila** Signika 600, **Farms** Signika 300 in green-700); the white mark on green-700/green-900.

## Component mapping

`design/reference-components/kotila-ui.js` is a working React reference for every component, with the props contract in `index.d.ts` and live previews in the Design System artifact. Rebuild each as a typed component, composing shadcn primitives where one exists. **Keep the props from `index.d.ts`** so screens can be built straight from the designs.

| Kotila component | Build on | Location |
| --- | --- | --- |
| Button, IconButton | shadcn `button` (+ `tooltip` for IconButton; `label` required → aria-label + tooltip) | `components/kotila/button.tsx` |
| Tooltip | shadcn `tooltip` | re-export |
| Field, TextInput, MoneyInput, Select, Checkbox | shadcn `field`/`label`, `input`, `select`, `checkbox` | `components/kotila/fields/*` |
| LinkedAmounts | 3 inputs; any two → third; marks the calculated one | `components/kotila/linked-amounts.tsx` |
| Stepper | custom (72px − / + buttons, big tabular value, `alertAbove`) | `components/kotila/stepper.tsx` |
| ChipGroup | shadcn `toggle-group` (multiple / single) | `components/kotila/chip-group.tsx` |
| Segmented | shadcn `toggle-group` single or `tabs` | `components/kotila/segmented.tsx` |
| AttributionField | `radio-group` styled as tiles + "Farm overhead"; required | `components/kotila/attribution-field.tsx` |
| Tag, StatusChip, Delta | shadcn `badge` variants | `components/kotila/tag.tsx` |
| Figure, Money, Rows | plain components + `utils/format` | `components/kotila/figure.tsx` |
| Panel | shadcn `card` (border, 24px radius; `raised`, `deep` variants) | `components/kotila/panel.tsx` |
| LedgerTable | shadcn `table` (+ TanStack Table only if sorting is needed) | `components/kotila/ledger-table.tsx` |
| Notice | shadcn `alert` with tones: neutral, warning, alert, success, owed | `components/kotila/notice.tsx` |
| SyncStatus | badge + tooltip, reads the offline queue store | `components/kotila/sync-status.tsx` |
| Person, RoleBadge | shadcn `avatar` + badge | `components/kotila/person.tsx` |
| AuditTrail | list; data from `/api/audit` | `components/kotila/audit-trail.tsx` |
| EmptyState | shadcn `empty` if available, else custom | `components/kotila/empty-state.tsx` |
| SideRail | shadcn `sidebar`, glass | `components/layout/side-rail.tsx` |
| TopBar, TabBar | custom, glass, phone only | `components/layout/*` |
| Tabs | shadcn `tabs` (underline style) | re-export |
| Sheet | shadcn `dialog` (desktop) / `drawer` or `sheet` bottom (phone), glass surface | `components/kotila/sheet.tsx` |
| GrowthChart, Sparkline, BarList | hand-written SVG (port from reference; keep the maths) | `components/kotila/charts/*` |

## Rules that must survive the port

- One primary button per view. Entry screens: 56px controls, 72px stepper, full-width 64px save button.
- Mortality and money are the heaviest figures (800 weight, tabular). `alert` colour only when action is needed.
- Glass only on rail, phone top/tab bars, dialogs and sheets. Content panels are solid white with a 1px `line` border (desktop) or `shadow-raise` (phone over the green band).
- Collections are ledger tables, not card grids. Figures right-aligned.
- Every icon-only control: `aria-label` + tooltip. No emoji.
- Copy: sentence case, plain verbs, the farm's words (`design/brand/10-writing.md`).
- Empty states say what the section is for and offer the action.
