# Screens

Every screen of v1, where it lives, and the components it is built from. The canvas *Kotila Farm — Auth & Dashboard* holds a design for each.

## Two kinds of screen

| | Entry screens | Reading screens |
| --- | --- | --- |
| Device | Phone first (390) | Desktop first (1440), must still work on phone |
| Goal | Finish in under 60 seconds | See the picture, decide, act |
| Type | `body-lg`, 56px controls, 72px stepper | `body`, 44px controls, ledger tables |
| Layout | One column, one day, one Set | Rail + content column, panels in equal grids |
| Primary action | One full-width `xl` button at the bottom | One `primary` button top right |

## Inventory

| Screen | Canvas artboard | Who | Built from |
| --- | --- | --- | --- |
| Sign in | Main, SignInPhone | All | TextInput, Button, Notice (offline) |
| Accept invite | SetPassword | New users | TextInput, RoleBadge |
| Today (owner) | Dashboard | Owner, manager | SideRail, Notice owed, LedgerTable, GrowthChart, Panel, Rows, Sparkline |
| Today (recorder) | DashboardPhone | Recorder | TopBar, Notice missed day, Button xl, Figure, TabBar |
| Daily log | DailyLog | Everyone | Stepper, ChipGroup, Segmented, TextInput, SyncStatus |
| Weight sample | WeightSample | Everyone | TextInput list, Figure, GrowthChart (light) |
| Quick expense (phone) | ExpenseQuickAdd | Owner, manager | Sheet (sheet), MoneyInput, AttributionField, Select |
| Sets list | SetsList | Owner, manager | LedgerTable, StatusChip, Tabs |
| Set detail | SetDetail | Owner, manager | Figure, GrowthChart (light), Tabs, LedgerTable, BarList |
| Edit history | RecordHistory | Owner, manager | Sheet, AuditTrail |
| Feed | Feed | Owner, manager | Sparkline, LedgerTable, Notice warning |
| Feed purchase | FeedPurchase | Owner, manager | Sheet, LinkedAmounts, MoneyInput, AttributionField |
| Health and vaccines | Health | Owner, manager | LedgerTable, Tag, Notice alert |
| Sales and balances | Sales | Owner, manager | Notice owed, LedgerTable, Tabs |
| New sale | NewSale | Owner, manager | Sheet, LinkedAmounts, MoneyInput (paid / balance) |
| Buyer | Buyer | Owner, manager | Figure, LedgerTable, Delta |
| Expenses | Expenses | Owner, manager | LedgerTable, Select filters, BarList |
| Finance: cash and Set P&L | Finance | Owner (P&L also manager) | Figure, Rows, BarList |
| Finance: capital and loans | Capital | Owner | LedgerTable, Rows (gross / WHT / net) |
| Set report | SetReport | Owner, manager | Figure grid, Rows, BarList, GrowthChart (light) |
| Weekly review | WeeklyReview | Owner, manager | Panel headline, numbered actions, Delta |
| Compare Sets | CompareSets | Owner, manager | LedgerTable, Delta |
| Settings | Settings | Owner | LedgerTable, Person, RoleBadge |

## Patterns

- **Page head:** date or context in `ink-muted`, `display` title, actions on the right (quiet secondary, one primary).
- **Summary before detail:** a row of 3–4 `Figure`s or a finding headline, then the table.
- **Secondary tasks open in a `Sheet`:** new sale, record a payment, quick expense, edit history, feed purchase. The page behind stays visible.
- **Every record row ends with a caption of who entered it** and a history icon on hover (desktop) or in the row's detail (phone).
- **Filters** are `Select`s and `Segmented`s above a table, never a separate filter page.
