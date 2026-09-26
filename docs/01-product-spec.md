# Kotila Farm — Internal Management Tool
## Feature specification

---

## 1. What this is

An internal web tool for a broiler poultry operation in Nigeria. It replaces a WhatsApp-and-notebook record system that worked but lost information: bag counts left off feed purchases, sale balances never recorded, withdrawals never classified. Every design decision below exists to make those specific omissions impossible.

**Primary job:** record what happens on the farm daily in under a minute, and turn those records into an accurate financial and performance picture of each batch.

**Audience:** three shareholders (one of whom runs day-to-day operations) plus farm staff who enter daily data. Not a consumer product. Not a marketplace. Nobody outside the company sees it.

**Devices:** entry happens on a phone, outdoors, in bright sun, often with one hand and sometimes with no signal. Reading and reporting happens on a laptop. Mobile-first for entry screens, desktop-comfortable for reports.

**Currency:** Nigerian Naira (₦). All money displayed with thousands separators and no decimals.

**Scope for v1:** broilers only. Design the data model so layers or other stock could be added later, but do not build for them now.

---

## 2. The central concept: a Set

Everything in the system hangs off a **Set** — one intake of day-old chicks, tracked from arrival to final sale. Sets are numbered sequentially: Set 1, Set 2, Set 3.

A Set has:
- A number and an optional name
- Start date and bird count at intake
- Supplier and cost of the day-olds
- A status: **Brooding** → **Growing** → **Selling** → **Closed**
- A running bird count (intake − mortality − sold)
- Every expense, sale, feed delivery, weight sample and mortality record attached to it

Multiple Sets can run at once and overlap in time. Reports can be generated for one Set or several Sets together. This matters: the current operation runs one Set at a time, but the moment a second pen opens, every screen must still work.

**A rule to enforce in the UI:** an expense must be attributed to a Set, or explicitly marked as farm overhead. There is no third option and no blank. This single constraint is what makes per-batch profitability real rather than estimated.

---

## 3. Access and roles

Login by email and password. No public signup — accounts are created by an owner.

| Role | Can do |
|---|---|
| **Owner** | Everything, including finance, partner capital, loans, and settlement |
| **Manager** | Everything operational — sets, daily logs, feed, weights, sales, expenses. No access to capital, loans, or shareholder screens |
| **Recorder** | Daily log entry only: mortality, feed used, weights, observations |

Every record stores who entered it and when. Edits keep a visible history — if a bird count changes, it should be possible to see who changed it and what it was before. This is a shared-money business between family members; an auditable trail prevents arguments rather than creating them.

---

## 4. Modules

### 4.1 Daily log

The most-used screen in the product. One screen, one day, one Set. Should be completable in under 60 seconds on a phone.

Captures:
- **Mortality** — count, and an optional cause from a short list (unknown, disease, heat, culled, predator, crush). Cause is optional deliberately; requiring it produces garbage data
- **Feed used** — bags or kilograms consumed today, by feed type
- **Water** — optional, litres or "normal / low / high"
- **Observations** — free text, plus quick-tag chips: coughing, green stool, lethargy, panting, wet litter, poor appetite. These tags are the raw material for the weekly report
- **Temperature/weather** — optional, matters during brooding

Mortality is the field people reach for most. Put it first, make it a large stepper rather than a text input. Show the current live bird count updating as they enter. If a day is skipped, the screen should say so plainly on the next visit and offer to backfill, rather than silently leaving a hole.

### 4.2 Feed

Two halves: what was bought, and what was used.

**Purchases** capture — and this is where the paper records failed — every one of:
- Feed type and brand (starter, grower, finisher; brands in use include Ultima and Breedwell)
- Number of bags **and** weight per bag
- Total cost **and** price per bag, each calculated from the other so neither can be left blank
- Supplier, date, and transport cost as a separate line

**Raw ingredient purchases** are a separate entry type, because the farm sometimes buys maize, soya, red oil, ginger and garlic to mix on site. These need: ingredient, quantity, unit cost, and which Set they feed.

**Consumption** comes from the daily log. The system maintains a running stock balance per feed type and flags when stock will run out at the current consumption rate.

Show a **price-per-bag trend** over time. Feed was 69% of the cost base last cycle; a ₦1,000 move in bag price is the single most consequential number on the farm and it should be impossible to miss.

### 4.3 Weights

Birds are weighed by random sampling, not individually.

A **weight sample** captures: date, Set, number of birds weighed, and each individual weight. From that the system computes:
- Average weight
- Uniformity (coefficient of variation — what share of birds fall within ±10% of the mean)
- Average daily gain since the previous sample
- Actual weight against the breed standard curve for that age in days

Encourage at least 10 birds per sample; warn below that, don't block it.

The **growth chart** is the centrepiece of this module: bird age in days on the x-axis, weight on the y, actual plotted against the target curve, with each sample as a point. Underweight at day 21 is recoverable. Underweight at day 35 is not, and the chart should make that visible while there's still time to act.

### 4.4 Health and medication

Records vaccines, drugs and supplements: what, how much, cost, which Set, and why.

The vaccine schedule matters — Gumboro and Lasota are given on specific days of age. The system should hold a default schedule per Set, show what's due, and mark what was given and when. A missed Gumboro is the kind of thing that shows up three weeks later as mortality.

Items in regular use, for autocomplete: Gumboro, Lasota, Elrox, coccidiosis treatment, Admacin, multivitamins, growth booster (sachet and liquid), calcium, glucose, antibiotics.

### 4.5 Sales

Every sale records:
- Date, Set, buyer
- Number of birds, price per bird, total — with any two calculating the third
- Amount paid **and** balance outstanding, always both
- Payment method and any deposit

Sales of manure and droppings are a separate entry type with just an amount.

**Buyers** are a first-class record, not free text. A buyer page shows every sale to them, their average price per bird, and anything still owed. Last cycle one buyer took 50 birds at ₦7,171 each while the bulk rate was ₦7,500 — that pattern is invisible in a notebook and obvious on a buyer page.

An **outstanding balances** view lists everything owed across all buyers. It should be the first thing an owner sees if anything is unpaid.

### 4.6 Finance

The most extensive module. Five sub-areas.

**Expenses** — every naira out, categorised:
Feed · Day-old chicks · Drugs and vaccines · Transport · Brooding (charcoal, kerosene, fuel) · Litter (sawdust) · Labour · Processing · Equipment and structures · Other

Each expense: date, category, description, amount, Set or overhead, who paid, and optional receipt photo. The **Set-or-overhead** field is required.

Equipment and structures should be flaggable as a **capital item** rather than a running cost, so it can be spread across batches instead of distorting one cycle's profit.

**Partner capital** — tracks each shareholder's equity. Shows contributed, withdrawn, and net position. The company is incorporated with 1,000,000 shares held Kosi 633,858 / Queen 122,985 / ThankGod 122,984 / Emeka 120,173, and the ownership percentages should be visible and fixed here.

**Shareholder loans** — money put in beyond equity, repaid at 16% per annum simple interest. Each loan records: lender, amount, date advanced, date repaid, and calculates interest accrued for the actual days outstanding. It must also show gross interest, withholding tax deducted, and net payable to the lender, because those are three different numbers and confusing them causes arguments.

A **borrowing capacity** indicator: total member loans against total equity, against whatever cap the shareholders agree.

**Set profit and loss** — for any Set or combination of Sets: Revenue (bird sales + manure) − expenses = net profit, with margin, and the full expense breakdown by category.

**Cash position** — money in, money out, what should be on hand. Last cycle this reconciliation is what proved the books were sound; it should be a permanent screen, not a report.

### 4.7 Reports

**Set report.** Select one or more Sets, get the full picture: intake, mortality, birds sold, revenue, expenses by category and by date, profit, margin, cost per bird, revenue per bird, feed conversion ratio, average weight at sale. Exportable to PDF for circulating to shareholders.

**Weekly review.** Every week, for each active Set, generate a short written review covering:
- Mortality this week versus last week versus the Set's running average
- Weight against the breed standard for the current age, and whether the gap is widening or closing
- Feed conversion so far and what it's trending toward
- Feed cost per kilogram of live weight produced
- Any observation tags that recurred — three days of green stool in one week is a signal
- Stock warnings: feed running out, vaccines due
- **What to do differently**, stated as specific actions rather than observations

This should read like a competent farm manager's note, not a dashboard. Three to six short points. If nothing is wrong, it should say so in one line rather than manufacturing concerns.

**Comparison across Sets.** Pick two or more Sets (dropdowns; a Set picked in one list disappears from the others; minimum two, a + button adds more) and compare them side by side on every key metric. This is how the farm actually improves.

---

## 5. Metrics and how they're computed

| Metric | Formula |
|---|---|
| Live birds | Intake − cumulative mortality − birds sold |
| Mortality rate | Cumulative mortality ÷ intake |
| Feed conversion ratio (FCR) | Total feed consumed (kg) ÷ total live weight produced (kg) |
| Average daily gain | (Current avg weight − previous avg weight) ÷ days between samples |
| Uniformity | Share of sampled birds within ±10% of the mean weight |
| Cost per bird started | Total Set expenses ÷ intake count |
| Cost per bird sold | Total Set expenses ÷ birds sold |
| Revenue per bird | Bird sales revenue ÷ birds sold |
| Margin per bird | Revenue per bird − cost per bird sold |
| Feed cost per kg live weight | Feed spend ÷ total live weight produced |
| Net margin | Net profit ÷ total revenue |
| Loan interest | Principal × 16% × days outstanding ÷ 365, then withholding tax, then net |

Calibration (Set 3, last completed cycle): 500 intake, 465 sold, 7.0% mortality, ₦2,994,800 spent, ₦3,563,550 revenue, ₦568,750 profit, 15.96% margin, ₦6,440 cost per bird sold, ₦7,629 revenue per bird. Unit tests for `src/utils/metrics` must reproduce these numbers from the seed data.

---

## 6. Screens

**Dashboard** — active Sets with live bird count, age in days, and mortality rate; cash position; anything outstanding from buyers; what needs doing today.
**Sets list** — every Set, past and present, with status and headline numbers.
**Set detail** — bird count, age, mortality trend, growth chart, feed stock, spend to date, revenue to date. Tabs for daily logs, weights, health, sales, expenses.
**Daily log entry** — phone-first, fast, one day at a time.
**Weight sample entry** — enter a list of weights, see the average and the standard comparison immediately.
**Feed** — purchases, stock levels, consumption, price trend.
**Sales** — sales list, new sale entry, buyer pages, outstanding balances.
**Expenses** — list with filters by Set, category and date; quick-add entry.
**Finance** — capital, loans, cash position, Set P&L.
**Reports** — build a report, view weekly reviews, compare Sets.
**Settings** — users and roles, feed types, expense categories, buyer list, vaccine schedule defaults, breed standard curve.

---

## 7. Design direction

A ledger that thinks: the seriousness of a set of accounts, with the immediacy of something used standing in a poultry pen. High contrast and large targets on entry screens; tabular figures everywhere; mortality and money get the most visual weight; offline and sync state have a real design. Spend boldness in one place — the growth chart. Plain verbs, sentence case, the farm's own words (Set, bag of feed, day-olds, sawdust). Empty states invite the next action. Full rules: `docs/08-design-system.md`.

---

## 8. Build order

**First:** login and roles, Sets, daily log with mortality and feed use, expenses with Set attribution, sales with balances. This alone replaces the notebook.
**Second:** weights and the growth chart, feed stock and reorder warnings, Set P&L, the PDF Set report.
**Third:** the weekly review, Set comparison, capital and loan tracking, buyer analytics.
**Later, not now:** other stock types, staff payroll, mobile app, multi-farm support.
