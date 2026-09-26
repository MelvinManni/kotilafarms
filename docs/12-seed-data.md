# Seed data

Realistic data for `pnpm db:seed`, the dev database and tests. It matches the screen designs in `design/screens/`. The designs assume **today is Saturday 26 September 2026**; the seed script should shift all dates so "today" is the current date (keep day-of-age relationships).

Known gaps to resolve while seeding (the designs were drawn before the books were reconciled):
- Cash position shows ₦879,550 out since 1 Sep, but Set 4 and Set 5 spend to date together is about ₦2.55M. Generate expenses from the per-Set totals and let the cash position be computed; don't hard-code it.
- Expenses page September totals should be recomputed from the seeded expenses.
- Set 3 per-category expenses below are exact and must sum to ₦2,994,800.

## Farm data
- Shareholders (1,000,000 shares): Kosi 633,858 (63.39%), Queen 122,985 (12.30%), ThankGod 122,984 (12.30%), Emeka 120,173 (12.02%). Kosi runs day-to-day and is an owner. Users: Kosi (owner), Queen (owner), ThankGod (owner), Emeka (owner), Adaeze Nwankwo (manager), Chinedu Okafor (recorder), Ifeanyi Obi (recorder, deactivated in July).
- Sets:
  - **Set 5** · Front pen · Brooding · started 20 Sep 2026 · 600 day-olds from Zartech at ₦980 each (₦588,000) · day 6 · deaths 3 (0.5%) · live 597 · spend to date ₦812,600 · starter feed · Gumboro due tomorrow (day 7).
  - **Set 4** · Back pen · Growing · started 2 Sep 2026 · 500 day-olds from Chi Farms at ₦950 (₦475,000) · day 24 · deaths 18 (3.6%): 4 this week, 2 last week, running avg 2.6/week · live 482 · spend to date ₦1,742,350 · finisher (Ultima) 9 bags left, using 2.3/day (~4 days) · weights: day 7 0.176 kg, day 14 0.455 kg, day 21 0.84 kg, day 24 1.03 kg (standard 0.19 / 0.48 / 0.93 / 1.15) · uniformity 78% · ADG 63 g since day 21 · projected 1.72 kg at day 35 vs 2.20 standard (−22%) · wet litter tagged 3 days this week · Gumboro given day 9 and day 16, Lasota day 21 given.
  - **Set 3** · Back pen · Closed 14 Sep 2026 · started 20 Jul 2026 · 500 intake · 35 deaths (7.0%) · 465 sold · spent ₦2,994,800 · revenue ₦3,563,550 (birds ₦3,547,650 + manure ₦15,900) · profit ₦568,750 · margin 15.96% · cost per bird sold ₦6,440 · revenue per bird ₦7,629 · FCR 1.74 · avg weight at sale 2.46 kg · feed was 69% of cost (₦2,066,412).
    - Expenses by category (sum ₦2,994,800): Feed ₦2,066,412 · Day-old chicks ₦445,000 · Drugs and vaccines ₦131,600 · Brooding ₦96,500 · Transport ₦84,000 · Litter (sawdust) ₦36,000 · Labour ₦90,000 · Processing ₦22,500 · Other ₦22,788.
    - Buyers in Set 3: bulk rate ₦7,500/bird. Mama Nkechi 30 birds at ₦7,500 = ₦225,000 paid ₦10,000 → owes ₦215,000 (19 days, sale 7 Sep); Chidi Poultry Mart 20 birds at ₦7,670 = ₦153,400 paid ₦10,000 → owes ₦143,400 (sale 18 Sep); Alhaji Sule 50 birds at ₦7,171 = ₦358,550 paid ₦304,950 → owes ₦53,600 (sale 10 Sep; note: below bulk rate). Total owed ₦412,000.
  - **Set 2** · Closed 2 Jul 2026 · started 11 May · 300 intake · 19 deaths (6.3%) · 281 sold · spent ₦1,712,400 · revenue ₦2,079,400 · profit ₦367,000 · 17.65% · FCR 1.69.
  - **Set 1** · Closed 24 Apr 2026 · started 9 Mar · 200 intake · 19 deaths (9.5%) · 181 sold · spent ₦1,196,300 · revenue ₦1,289,200 · profit ₦92,900 · 7.21% · FCR 1.88.
- Feed prices, finisher (Ultima) per 25 kg bag, last six purchases: 21,500 (6 Jun), 22,000 (1 Jul), 22,800 (28 Jul), 23,200 (14 Aug), 23,800 (2 Sep), 24,800 (22 Sep). Starter (Breedwell) ₦26,200/bag; stock: finisher 9 bags, starter 14 bags (~11 days), grower 0. Transport per feed trip ₦6,000–₦8,500.
- Cash position since reconciled 1 Sep (by Kosi): money in ₦2,164,300, money out ₦879,550, should be on hand ₦1,284,750.
- Shareholder loans (16% p.a. simple, withholding tax 10% on interest): Kosi lent ₦500,000 on 2 Sep 2026, outstanding; Emeka lent ₦250,000 on 15 Jun 2026, repaid 14 Sep 2026 (91 days). Interest = principal × 0.16 × days ÷ 365. (Emeka: gross ₦9,973, WHT ₦997, net ₦8,976. Kosi to 26 Sep = 24 days: gross ₦5,260, WHT ₦526, net ₦4,734.) Borrowing cap agreed: loans ≤ 50% of equity.
- Partner capital (contributed / withdrawn / net): Kosi ₦1,900,000 / ₦150,000 / ₦1,750,000; Queen ₦370,000 / 0 / ₦370,000; ThankGod ₦370,000 / 0 / ₦370,000; Emeka ₦360,000 / ₦40,000 / ₦320,000. Total net equity ₦2,810,000.
- Vaccine schedule default (day of age): Gumboro 1st day 7, Gumboro 2nd day 14, Lasota 1st day 10, Lasota 2nd day 21. (Set 4 in reality: Gumboro day 9 (2 days late), Gumboro day 16, Lasota day 12, Lasota day 21.)
- Drugs in use: Elrox, coccidiosis treatment (Amprolium), Admacin, multivitamins, growth booster (sachet and liquid), calcium, glucose, antibiotics (Oxytetracycline).

