# Numbers, money and metrics

Numbers are the content. They are always tabular, always `ink` unless they need action, and always formatted the same way.

## Formatting

| Kind | Format | Helper |
| --- | --- | --- |
| Money | `₦3,563,550`, no decimals, `−₦879,550` for money out (true minus sign) | `Kotila.format.naira(n)` |
| Percent | `3.6%`, one decimal; margins two decimals in reports (`15.96%`) | `Kotila.format.pct(n, d)` |
| Weight | `1.03 kg` for bird averages; `25 kg` bags | `Kotila.format.kg(n)` |
| Counts | `482`, thousands separators from 1,000 | `Kotila.format.int(n)` |
| FCR | `1.72`, two decimals, no unit | — |

Right-align figures in tables. Put the unit or comparison in a caption beneath (*of 500 started*, *18 birds*), not in the figure.

## Visual weight

- **Mortality** figures use `figure` (24px, 800). A mortality figure turns `alert` only when it is above last week or the Set's running average, and it always carries a `Delta` explaining the comparison.
- **Money** figures use `figure-xl` for the one amount a panel exists for; `figure-sm` inside rows. Money owed to the farm is `#7A4B00` on white or `yellow-ink` on `yellow-100`.
- Everything else (age, feed stock, weights) uses `figure` or `figure-sm` in plain `ink`.

## Metrics: definitions the UI must use

| Metric | Formula | Shown as |
| --- | --- | --- |
| Live birds | intake − cumulative mortality − birds sold | `482` of 500 started |
| Mortality rate | cumulative mortality ÷ intake | `3.6%` · 18 birds |
| Feed conversion ratio | total feed consumed (kg) ÷ total live weight produced (kg) | `1.72` |
| Average daily gain | (current avg − previous avg) ÷ days between samples | `63 g a day` |
| Uniformity | share of sampled birds within ±10% of the sample mean | `78%` |
| Gap to standard | actual avg ÷ breed standard at that age − 1 | `−10.4%` |
| Cost per bird started | total Set expenses ÷ intake | `₦5,990` |
| Cost per bird sold | total Set expenses ÷ birds sold | `₦6,440` |
| Revenue per bird | bird sales revenue ÷ birds sold | `₦7,629` |
| Margin per bird | revenue per bird − cost per bird sold | `₦1,189` |
| Feed cost per kg live weight | feed spend ÷ total live weight produced | `₦1,646` (₦2,066,412 ÷ 1,255 kg) |
| Net margin | net profit ÷ total revenue | `15.96%` |
| Shareholder loan interest | principal × 16% × days outstanding ÷ 365 (simple) | gross, withholding tax, net — always three lines |

## Calibration data

Mock data must use real magnitudes. The last completed cycle (Set 3): 500 intake, 465 sold, 7.0% mortality, ₦2,994,800 spent, ₦3,563,550 revenue, ₦568,750 profit, 15.96% margin, ₦6,440 cost per bird sold, ₦7,629 revenue per bird. Feed was 69% of the cost base. Round numbers make a design look untested.

## Charts

- **Growth chart:** day of age on x (0–42), kg on y (0–3.0). Standard dashed `yellow-500` with a ±5% band; actual solid `green-300` (on `green-900`) or `green-600` (on white). Shade from day 28: *hard to recover*. Project the current daily gain forward and state the gap.
- **Sparklines** for price per bag and weekly deaths: the endpoint is the emphasis; red-orange when the latest move is bad.
- **Breakdowns** (`BarList`): largest first, one hue, the top bar emphasised.
- Every chart has an `aria-label` that states the headline number.
