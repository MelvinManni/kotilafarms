
# AttributionField

Every expense belongs to one Set or to farm overhead. There is no third option and no blank: saving without a choice shows the error.

This single constraint makes profit per Set real rather than estimated. Show active Sets first with their day; closed Sets appear only when backdating.

# AuditTrail

Edit history for any record: who, when, which field, the old value struck through and the new one in bold, with the reason if given. Opens from the history icon on every record.

This is a shared-money business between family members; a visible trail prevents arguments.

# BarList

Horizontal bars for a breakdown, largest first, one hue with the top bar emphasised. Expenses by category, deaths by cause.

# Button

One pill-shaped button; one `primary` per view.

- `primary` (green-600, white text) is the single most likely next step: *Log today*, *Save sale*.
- `secondary` for alternatives, `outline` for a second strong option on phone (*Fill in Friday*), `quiet` for inline links that need a hit area, `danger` for destructive actions, `owed` only inside the money-owed band.
- `size="lg"` (56px) on every entry screen; `size="xl"` (64px) for the phone's main action. Desktop toolbars use the default 44px.
- Labels are plain verbs in sentence case: *Record a feed purchase*, never *Submit*.

# Checkbox

Native checkbox, 22px, green accent, whole row tappable. Used for *Capital item* on equipment expenses and *Keep me signed in*.

# ChipGroup

Toggle chips. Multiple choice for quick observation tags (*coughing, green stool, lethargy, panting, wet litter, poor appetite*); single choice for an optional cause of death.

Tags are the raw material for the weekly review, so keep the list short and fixed. Never make the cause required: required causes produce guesses.

# Delta

Change against a comparison, as a small chip. Red-orange when the change is bad for the farm, green when good — set `goodWhen` so direction maps to meaning (deaths: down is good; weight: up is good).

# EmptyState

What an empty section is for, and the one action that fills it. Never *No data available*.

# Field

Label, control, then one line of hint or error. Wraps any control; the input components use it for you.

Labels sit above the control (never placeholder-as-label). Mark required fields with a red asterisk; mark optional ones with *optional* instead — on entry screens most fields are optional by design.

# Figure

A number with its label and a sub-line. Numbers are the content: always tabular, always ink — `tone="alert"` only when the number itself needs action (mortality above last week).

Sizes: `sm` inside rows, default in tables, `lg` on phone Set cards, `xl` for the one amount a panel exists for.

# GrowthChart

The product's one bold element. Average weight by day of age against the breed standard: dashed yellow standard with a ±5% band, green actual line with a point per sample, a today marker, a shaded *hard to recover* zone from day 28, and a dotted projection that states the gap it is heading for.

Default `theme` is `deep` (on the green-900 panel). Use `light` inside ordinary panels (Set detail, reports). Replace `standard` with the curve from Settings.

# Icon

Stroke icons on a 24px grid, 2px stroke, round caps. Decorative by default; pass `label` when an icon carries meaning alone. `Kotila.Icon.names` lists every name.

# IconButton

Round icon-only button. `label` is required and is used as both `aria-label` and the tooltip — an icon without words is never shipped.

Use for search, close, back and row menus. Minimum 44px; `size="lg"` (56px) on phone headers.

# LedgerTable

The workhorse: Sets, sales, expenses, balances. Text left, figures right, tabular numerals, header in caption style, hairline rows, a heavy ink rule above totals.

Cells take plain values or `{value, sub, tone, figure, status, tag, delta}`. Rows that open something get `onRowClick` and a chevron column.

# LinkedAmounts

Three linked fields — quantity, price each, total. Type any two and the third is worked out and marked *calculated*.

This is the fix for the paper records' biggest hole: bag counts left off feed purchases, and totals written with no unit price. Use it for feed purchases (bags × price per bag) and bird sales (birds × price per bird). None of the three can be blank.

# Money

Formats naira: ₦, thousands separators, no decimals, a true minus sign for money out. Use `Kotila.format.naira()` for strings.

# MoneyInput

Naira input: ₦ prefix, thousands separators as you type, whole naira only. Shows a *calculated* pill when the value was derived (see LinkedAmounts).

# Notice

A full-width message with an icon, a title that states the fact, one line of detail and at most one action.

- `owed` — money buyers owe the farm. First thing an owner sees when anything is unpaid.
- `warning` — offline, a skipped day, stock running low.
- `alert` — do something today (mortality spike, missed vaccine).
- `success` — confirmations that matter (synced, reconciled).

# Panel

A white sheet on the field-green ground. Borders, not shadows, on desktop; `raised` (shadow, no border) only on phone where panels sit over the green header band. `deep` is reserved for the growth chart.

Title states the subject (*Cash position*); a `headline` title states a finding (*Set 4 is 10% under weight*).

# Person

Initials avatar, name and role or a meta line. Every record shows who entered it.

# RoleBadge

Owner, Manager or Recorder. Owners see capital, loans and settlement; managers everything operational; recorders the daily log only.

# Rows

Label–value pairs down a panel, hairline between rows, values right-aligned and tabular. A `total` row gets a heavy ink rule above it, like a ledger.

# Segmented

Two to four mutually exclusive options in one control. Water level, units (bags / kg), report period.

# Select

Native select styled as an input. For short fixed lists: feed type, payment method, expense category.

# Sheet

Glass modal on desktop, bottom sheet on phone (`variant="sheet"`). Secondary tasks open here so the page behind stays in view: new sale, quick-add expense, edit history, record a payment.

One primary action in the footer, on the right (desktop) or full width at the bottom (phone).

# SideRail

Desktop navigation: glass rail, 248px. Finance is hidden from anyone who is not an owner; recorders never see the desktop rail. Badges count things needing money attention (unpaid sales). Sync state lives at the foot.

# Sparkline

Small trend line with a faint area and an emphasised endpoint. Feed price per bag, weekly deaths. No axes: put the figure beside it.

# StatusChip

A Set's stage: Brooding → Growing → Selling → Closed, optionally with its age in days.

# Stepper

The mortality control. Huge − / + buttons (72px) either side of the count; the count turns alert-coloured when it is above `alertAbove` (usually yesterday's count or the week's average).

It is the first thing on the daily log. Never replace it with a text input: people reach for it one-handed in the pen.

# SyncStatus

Connection state in words and colour, never colour alone: *All synced · 2 min ago*, *Offline · 3 waiting*, *Sending 3 entries…*, *1 entry needs a look*. The tooltip explains what it means for the person.

Pill in phone top bars; `block` at the foot of the desktop side rail. Offline is a normal state, not an error: the app keeps working and says so.

# TabBar

Phone bottom navigation: floating glass, 72px, 4–5 items. Recorders: Today, Log, Weigh, History. Managers on phone: Today, Sets, a central + (new entry), Sales, More.

# Tabs

Underline tabs for sections inside a page (Set detail: Daily logs, Weights, Health, Sales, Expenses). Counts in a small pill.

# Tag

Small rounded label for a state. Tone means something: `success` done/healthy, `warning` needs attention soon, `alert` needs action, `deep` in progress with money, `closed` finished.

# TextInput

56px text input with a sunken fill, 17px value text. `multiline` for notes, `suffix` for a unit (kg, litres).

# Tooltip

Dark bubble on hover or keyboard focus. Required on every icon-only control, status indicator and figure whose meaning is not obvious (a delta, a derived number).

Write the tooltip as the answer to “what does this mean?”: *Up from 2 last week. Running average is 2.6 a week.*

# TopBar

Phone top bar: floating glass, 60px, over the green header band. Logo or back button, title, sync pill, account.
