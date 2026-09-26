# Screens

Each screen has a design in `design/screens/<File>.dc.html`. Those files are design-canvas sources: read the markup for layout, copy and component use, and the `renderVals()` block at the bottom for the exact example data. They are not app code — rebuild them with the real components and live data.

| Route | Design file | Roles | Data (API) |
| --- | --- | --- | --- |
| `/sign-in` | Main (desktop), SignInPhone (phone, offline state) | public | NextAuth |
| `/invite/[token]` | SetPassword | public | `POST /api/invites/accept` |
| `/today` (owner/manager) | Dashboard | O M | `/api/today` |
| `/today` (recorder, phone) | DashboardPhone | R | `/api/today` (no money) |
| `/log/[setId]/[date]` | DailyLog | O M R | `/api/sets/:id/logs` |
| `/weigh/[setId]` | WeightSample | O M R | `/api/sets/:id/weights` |
| Quick expense sheet (phone) | ExpenseQuickAdd | O M | `POST /api/expenses` |
| `/sets` | SetsList | O M | `/api/sets` |
| `/sets/[id]` | SetDetail | O M | `/api/sets/:id` + tabs |
| Edit history sheet (any record) | RecordHistory | O M | `/api/audit` |
| `/feed` | Feed | O M | `/api/feed/*` |
| Feed purchase sheet | FeedPurchase | O M | `POST /api/feed/purchases` |
| `/health` | Health | O M | `/api/sets/:id/vaccines`, `/api/health` |
| `/sales` | Sales | O M | `/api/sales`, `/api/sales/outstanding` |
| New sale sheet | NewSale | O M | `POST /api/sales` |
| `/sales/buyers/[id]` | Buyer | O M | `/api/buyers/:id` |
| `/expenses` | Expenses | O M | `/api/expenses` |
| `/finance` (cash + P&L) | Finance | O (M: cash, P&L) | `/api/finance/cash`, `/api/finance/pnl` |
| `/finance/capital` | Capital | O | `/api/finance/capital`, `/api/finance/loans` |
| `/reports/set?ids=` | SetReport | O M | `/api/reports/set` (+ PDF) |
| `/reports/weekly` | WeeklyReview | O M | `/api/reports/weekly` |
| `/reports/compare` | CompareSets | O M | `/api/reports/compare` |
| `/settings/*` | Settings | O (M partial) | `/api/users`, `/api/settings/*` |

## Acceptance criteria that matter most

- **Daily log:** deaths stepper is first; live bird count updates as it changes; cause optional; saving works offline and confirms instantly; a skipped day shows "Set N has no log for <day>" with a fill-in action; completing a normal day takes under 60 seconds on a phone.
- **Weight sample:** average, uniformity (±10%), gap to breed standard and bird count update as each weight is typed; below 10 birds shows a warning, never blocks.
- **Expenses:** cannot save without a Set or "Farm overhead"; capital items flagged; receipt photo optional.
- **Feed purchase:** bags, price per bag and total — any two calculate the third; none can be blank; transport is its own line.
- **Sales:** birds × price = total (any two → third); paid and balance always both shown; outstanding balances banner is the first thing an owner sees when anything is unpaid; buyer page shows average price per bird vs the bulk rate.
- **Set detail:** growth chart with ±5% standard band, today marker, "hard to recover" zone from day 28, projection to day 35 stating the gap.
- **Feed:** run-out warning from stock ÷ recent daily use; price-per-bag trend with the latest change called out.
- **Finance:** cash position = money in − money out since the last reconciliation; loans show gross interest, withholding tax and net as three lines; borrowing capacity against the cap in Settings.
- **Compare Sets:** dropdown per Set, minimum two; a Set picked in one list is removed from the others; "Add a Set" adds another dropdown until all are used; lists after the second can be removed; table columns, "Best" column and findings follow the picks; running Sets compare mortality "so far" and show "—" for sale-dependent metrics.
- **Weekly review:** 3–6 short points per active Set, each ending in an action; one line when nothing is wrong; every number comes from `utils/metrics`.
- **Edit history:** every record's history sheet shows who, when, field, old (struck) → new, and the reason.
- **Roles:** navigation and actions a role can't use are hidden; the API refuses them anyway.
