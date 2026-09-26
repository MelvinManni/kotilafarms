# Screen designs

24 screens exported from the design canvas "Kotila Farm — Internal tool". Each `.dc.html` file is one artboard:

- The markup inside `<x-dc>` is the layout, copy and spacing. Inline styles use the design tokens' values.
- `<x-import component-from-global-scope="Kotila.X" …>` marks a design-system component with its props (kebab-case). Build it with the matching component from `docs/08-design-system.md`.
- `{{name}}` holes are filled from `renderVals()` in the script at the bottom — that is the example data for the screen.
- `<sc-for>` repeats, `<sc-if>` shows conditionally.
- `/_blob/…` image URLs are the logos: use `design/logos/` instead.

The files do not run on their own (they need the canvas runtime). Map them to routes with `docs/09-screens.md`.

| File | Screen |
| --- | --- |
| Main, SignInPhone, SetPassword | Sign in (desktop, phone offline), accept invite |
| Dashboard, DashboardPhone | Today (owner desktop, recorder phone) — hand-built before the component library; match the look, build with components |
| DailyLog, WeightSample, ExpenseQuickAdd | Phone entry screens |
| SetsList, SetDetail, RecordHistory | Sets and edit history |
| Feed, FeedPurchase, Health | Feed and health |
| Sales, NewSale, Buyer, Expenses | Sales, buyers, expenses |
| Finance, Capital | Cash, Set P&L, capital and loans |
| SetReport, WeeklyReview, CompareSets | Reports |
| Settings | Users and roles |
