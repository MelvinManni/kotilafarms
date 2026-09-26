# Kotila Farm Ledger

The design system for Kotila Farms' internal management tool: a broiler operation in Nigeria run by four shareholders and a small staff. It replaces a WhatsApp-and-notebook record that lost bag counts, sale balances and withdrawals. Every rule here exists to make those omissions impossible.

**The product's character is a ledger that thinks.** It has the seriousness of a set of accounts and the immediacy of something used standing in a poultry pen. It is not a Silicon Valley agtech dashboard.

## Who uses it, and where

| Person | Role | Device and place | What they need from the UI |
| --- | --- | --- | --- |
| Farm staff | Recorder | Phone, outdoors, bright sun, one hand, often no signal | Log one day for one Set in under 60 seconds |
| Day-to-day shareholder | Manager or Owner | Phone in the pen, laptop in the evening | Sets, feed, sales, expenses, and what needs doing today |
| Other shareholders | Owner | Laptop | Money: cash position, balances owed, Set profit, capital and loans |

Two consequences run through everything:

1. **Entry screens are phone-first and built for sunlight.** 56px inputs, 72px mortality stepper, 17px input text, nothing important in a grey lighter than `ink-muted` (7.3:1).
2. **Reading screens are desktop-comfortable.** Ledger tables, figures that align, a PDF-able Set report.

## Principles

1. **Make the omission impossible.** A feed purchase needs bags *and* price per bag *and* total (`LinkedAmounts` works out the third). A sale needs paid *and* balance. An expense needs a Set or farm overhead (`AttributionField`). No third option, no blank.
2. **Mortality and money come first.** They get the heaviest figures (`figure`, `figure-xl`, weight 800) and the only semantic colour that shouts (`alert`, `yellow-100` for money owed). Everything else is quieter.
3. **Say what the number means.** A panel headline states the finding (*Set 4 is 10% under weight — and the gap is widening*), then the figure, then what to do. If nothing is wrong, say so in one line.
4. **Offline is normal.** The app keeps working without signal and says so in words (`SyncStatus`). Nothing is lost silently; nothing is sent twice.
5. **Every change is visible.** Every record shows who entered it; every edit keeps the old value (`AuditTrail`). Family money needs a trail that prevents arguments.
6. **One bold thing per screen.** The growth chart is the product's memorable element. Forms around it stay quiet and disciplined.

## Colour

The palette comes from the brand guide: brand green `#478918`, yellow `#F9C930`, light green `#8BE55C`, accent orange `#F7A231`, near-black `#061101`. For legibility outdoors, text and fills that carry white text use darker steps of the same green.

| Role | Tokens | Rule |
| --- | --- | --- |
| Ground and paper | `ground`, `surface`, `surface-sunken` | Field-green ground; white panels read as paper on it. Inputs are sunken. |
| Ink | `ink`, `ink-2`, `ink-muted`, `ink-faint` | All figures are `ink`. `ink-faint` is for placeholders and disabled text only. |
| Action | `green-600` | The one accent per view: primary button, active nav, focus ring. |
| Brand surfaces | `green-700`, `green-900` | Sign-in hero, phone header band, growth chart panel. |
| Brand marks | `green-500`, `green-300`, `yellow-500` | Logo, chart lines, count badges. Never text on white. |
| Money owed | `yellow-100`, `yellow-300`, `yellow-ink` | Reserved for money buyers owe the farm. |
| Needs attention | `warning-*` | Offline, skipped day, stock running low. |
| Needs action | `alert`, `alert-bg`, `alert-ink` | Mortality above last week, price rise, overdue vaccine. |
| Glass | `glass`, `glass-line`, `scrim` | Functional layer only (below). |

Colours that must be told apart also differ in lightness: `alert` (L≈0.14) vs `green-600` (L≈0.15) are never used for opposite meanings in the same place without a word or arrow (▲ ▼) beside them.

## Type

- **Signika** (the brand's primary face) for page titles, panel titles and finding headlines: `display-xl`, `display`, `display-sm`, `title-lg`, `title`.
- **Plus Jakarta Sans** for everything else, with `font-variant-numeric: tabular-nums` set globally so amounts align in columns without effort. It stands in for the guide's Galano Grotesque, which is not available as a web font; swap `--font-sans` if a licence is bought.
- Figures are weight 800 (`figure-xl` 36px, `figure` 24px, `figure-sm` 17px). Captions never go below 13px.
- Sentence case everywhere. No all-caps eyebrow labels.

## Layout

- **Desktop:** 248px glass side rail + content column (40px side padding, 24px between sections). Panels in a row share height and padding: `k-grid-2`, `k-grid-3`, `k-grid-4`, gap 20px.
- **Phone:** 390px design width, 16px gutter, a green header band behind a floating glass top bar, raised white panels stacked 16px apart, a floating glass tab bar.
- **Spacing** on a 4px base: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64.
- **Radii:** 14px inputs, 20px phone panels, 24px desktop panels, 28px hero chart and modals, pills for buttons and chips.
- **Tables over cards.** Collections (Sets, sales, expenses, buyers) are `LedgerTable` rows, so a second or tenth Set just adds a row. Avoid grids of identical cards.

## Materials: where glass goes

Glass (`glass` + `backdrop-filter: blur(20px) saturate(180%)` + `glass-line` edge + `shadow-glass`) is used **only** on the functional layer: the side rail, the phone top bar and tab bar, modals and sheets. Content is always solid. Never stack glass on glass.

## Motion

Short and quiet: 150ms colour and shadow transitions, a 1px press on buttons, a spinning sync icon. Every animation stops under `prefers-reduced-motion`.

## Iconography

Stroke icons on a 24px grid, 2px stroke, round caps and joins (`Icon`, 48 names). Icons support a label; an icon-only control always has a tooltip and `aria-label` (`IconButton`). No emoji anywhere.

## Logo

Use the files in the **Logos** asset group. The full-colour icon sits beside the Signika wordmark (**Kotila** 600, **Farms** 300 in `green-700`). On `green-700`/`green-900` use the white mark. The oversized white mark at 9–10% opacity is the only decorative pattern allowed, on brand surfaces only.

## Components

36 React components under `window.Kotila`, grouped as Actions, Inputs, Status, Figures, Surfaces, People, Navigation, Overlays, Charts and Foundations. Each has guidelines and a live preview. The farm-specific ones:

- `Stepper`: the mortality control, first on the daily log.
- `LinkedAmounts`: bags × price per bag = total, or birds × price per bird = total. Any two work out the third.
- `AttributionField`: the required Set-or-overhead choice on every expense.
- `SyncStatus`: offline and sync state in words.
- `AuditTrail`: who changed what, from what.
- `GrowthChart`: weight against the breed standard, with projection.

Further sections cover writing, numbers and metrics, offline behaviour, roles and audit, the screen inventory, and the implementation handoff.
