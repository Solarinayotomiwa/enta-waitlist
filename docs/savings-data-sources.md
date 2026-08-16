# Savings calculator — data and methodology

Source of truth for every figure behind "The savings problem" section on the
homepage. The series lives in
[`lib/savings-calculator/monthlySeries.ts`](../lib/savings-calculator/monthlySeries.ts);
the maths lives in
[`lib/savings-calculator/computeSavings.ts`](../lib/savings-calculator/computeSavings.ts).

Comparative claims about investment outcomes are made on a public page. Have
compliance review this before launch, and always state the date window
alongside any asset comparison.

## What it models

A saver putting a fixed sum of naira aside every month (dollar-cost averaging),
and what that stream is worth today across four vehicles: Bitcoin, gold, dollars
(held as USD/USDT), and Nigerian Treasury Bills.

- Each deposit converts to dollars at that month's real rate.
- Bitcoin and gold accumulate units at that month's real price, valued once at
  today's price.
- Dollars are held flat — this is the baseline every other row is compared to.
- T-Bills compound the naira balance at the prevailing 364-day rate, then
  convert once at today's rate.

## The window and "today"

The series spans **Jan 2021 → Aug 2026 (68 months)**. The slider offers 12–66
deposits, and the window is always the *most recent* N months, so the default
66-deposit case runs **Mar 2021 → Aug 2026**. The final month is both the last
deposit month and the valuation point — "today", at the real Monierate rate of
₦1,393.63 per dollar.

## Result (66 × ₦100,000 = ₦6,600,000 in)

| Held in | Worth (USD) | vs. holding dollars |
|---|---|---|
| Gold | $14,337 | +$7,443 |
| Bitcoin | $11,453 | +$4,559 |
| T-Bills | $7,434 | +$540 |
| Dollars | $6,894 | baseline |

Gold leads, then Bitcoin. Over this full window T-Bills come out roughly level
with holding dollars. **This is window-dependent**: over the shorter
Jan 2023 – Nov 2024 span, T-Bills trail dollars, because the naira more than
doubled in that stretch. These figures are pinned as assertions in
[`tests/computeSavings.test.ts`](../tests/computeSavings.test.ts).

## Data provenance (the honest part)

Of the 68 FX months: **36 are real Monierate USDT/NGN, 7 are real dated anchors,
25 are interpolated.** That is 53% real Monierate data, and all interpolation
sits in Jan 2021 – Aug 2023. Each row in `monthlySeries.ts` carries its own
`source` field, and the split is asserted in the test suite.

**Exchange rate.** Real Monierate Pro USDT/NGN composite, daily candles from
2023-09-11 aggregated to monthly averages. Monierate's coverage does not begin
before Sep 2023 for any pair, and no other source covers 2021–2022 (abokiFX went
dark in Sep 2021), so those months are linearly interpolated between real dated
anchors from abokiFX / @naira_rates / press: ₦490 Jan 21, ₦700 May 21, ₦570
Sep 21, ₦710 Sep 22, ₦745 Dec 22, ₦755 Jan 23, ₦770 Jun 23. Monierate applies a
documented methodology change on 2026-03-17 (single-source before, trimmed-mean
composite after); both eras are used as-is. USDT/NGN and USD/NGN are treated as
interchangeable, per Dami's direction, and labelled "dollars" in the UI.

**Bitcoin.** Real first-of-month BTC/USD from the Habrador public daily dataset;
the May–Aug 2026 tail comes from press snapshots rather than exact month-end
closes.

**Gold.** Real monthly LBMA gold, USD/oz converted to USD/gram (÷ 31.1035). Note
the unit — the archived series used USD/troy oz.

**T-Bills.** CBN 364-day benchmark, real reported points (CEIC/THISDAY)
interpolated monthly. This is the only series that is not month-by-month
primary.

## Known limitations

- 2021–2022 FX is interpolated between real anchors and cannot be improved from
  any available source.
- Recent Bitcoin and gold tail months are press snapshots, not exact month-end
  closes.
- T-bill rates are interpolated between real CBN points.

## Recommendation

Lead public copy with the idle-naira finding from the original dataset (a saver
holding naira rather than stablecoin lost ~30% of real value Jan 2023 – Nov
2024), which is fully backed by real data. The idle-naira row is not currently
rendered in the calculator — the panel shows four rows — so that finding needs a
home elsewhere in the copy if it is to be used.

## Full dataset

| Month | NGN/USD | FX source | Bitcoin (USD) | Gold (USD/g) | T-bill % |
|---|---|---|---|---|---|
| 2021-01 | 490 | anchor | 29,112 | 60.03 | 1.2 |
| 2021-02 | 542.5 | interpolated | 33,087 | 58.13 | 2.76 |
| 2021-03 | 595.0 | interpolated | 45,093 | 55.23 | 4.32 |
| 2021-04 | 647.5 | interpolated | 58,725 | 56.59 | 5.88 |
| 2021-05 | 700 | anchor | 57,303 | 59.48 | 7.44 |
| 2021-06 | 667.5 | interpolated | 36,929 | 59.0 | 9.0 |
| 2021-07 | 635.0 | interpolated | 34,856 | 58.13 | 8.33 |
| 2021-08 | 602.5 | interpolated | 41,870 | 57.39 | 7.67 |
| 2021-09 | 570 | anchor | 46,920 | 57.07 | 7.0 |
| 2021-10 | 581.67 | interpolated | 43,718 | 57.13 | 6.33 |
| 2021-11 | 593.33 | interpolated | 61,374 | 58.58 | 5.67 |
| 2021-12 | 605.0 | interpolated | 56,973 | 57.55 | 5.0 |
| 2022-01 | 616.67 | interpolated | 46,208 | 58.39 | 5.5 |
| 2022-02 | 628.33 | interpolated | 38,500 | 59.67 | 6.0 |
| 2022-03 | 640.0 | interpolated | 44,355 | 62.63 | 6.5 |
| 2022-04 | 651.67 | interpolated | 46,282 | 62.28 | 7.0 |
| 2022-05 | 663.33 | interpolated | 38,469 | 59.45 | 7.5 |
| 2022-06 | 675.0 | interpolated | 29,799 | 59.06 | 8.0 |
| 2022-07 | 686.67 | interpolated | 19,269 | 55.72 | 8.83 |
| 2022-08 | 698.33 | interpolated | 23,314 | 56.75 | 9.67 |
| 2022-09 | 710 | anchor | 20,127 | 54.04 | 10.5 |
| 2022-10 | 721.67 | interpolated | 19,312 | 53.5 | 11.33 |
| 2022-11 | 733.33 | interpolated | 20,485 | 55.46 | 12.17 |
| 2022-12 | 745 | anchor | 16,967 | 57.81 | 13.0 |
| 2023-01 | 755 | anchor | 16,625 | 61.02 | 4.5 |
| 2023-02 | 758.0 | interpolated | 23,724 | 59.64 | 4.8 |
| 2023-03 | 761.0 | interpolated | 23,647 | 61.5 | 5.1 |
| 2023-04 | 764.0 | interpolated | 28,411 | 64.3 | 5.4 |
| 2023-05 | 767.0 | interpolated | 28,092 | 64.04 | 5.7 |
| 2023-06 | 770 | anchor | 26,820 | 62.47 | 6.0 |
| 2023-07 | 841.43 | interpolated | 30,590 | 62.73 | 7.17 |
| 2023-08 | 912.86 | interpolated | 29,676 | 61.7 | 8.33 |
| 2023-09 | 984.29 | Monierate | 25,801 | 61.6 | 9.5 |
| 2023-10 | 1,106.86 | Monierate | 27,984 | 61.6 | 10.67 |
| 2023-11 | 1,139.87 | Monierate | 35,437 | 63.79 | 11.83 |
| 2023-12 | 1,213.26 | Monierate | 38,689 | 65.14 | 13.0 |
| 2024-01 | 1,334.27 | Monierate | 44,167 | 65.39 | 12.0 |
| 2024-02 | 1,585.49 | Monierate | 43,076 | 65.04 | 16.5 |
| 2024-03 | 1,517.1 | Monierate | 62,441 | 69.38 | 21.0 |
| 2024-04 | 1,234.54 | Monierate | 69,702 | 74.94 | 21.31 |
| 2024-05 | 1,444.23 | Monierate | 58,254 | 75.59 | 21.62 |
| 2024-06 | 1,501.02 | Monierate | 67,707 | 74.78 | 21.94 |
| 2024-07 | 1,572.82 | Monierate | 62,852 | 77.1 | 22.25 |
| 2024-08 | 1,611.16 | Monierate | 65,358 | 79.41 | 22.56 |
| 2024-09 | 1,667.43 | Monierate | 57,454 | 82.66 | 22.88 |
| 2024-10 | 1,708.5 | Monierate | 60,981 | 86.49 | 23.19 |
| 2024-11 | 1,742.32 | Monierate | 69,590 | 85.23 | 23.5 |
| 2024-12 | 1,662.62 | Monierate | 97,365 | 85.14 | 22.9 |
| 2025-01 | 1,652.71 | Monierate | 94,757 | 87.13 | 22.6 |
| 2025-02 | 1,526.46 | Monierate | 100,700 | 93.08 | 21.48 |
| 2025-03 | 1,548.39 | Monierate | 86,382 | 95.91 | 20.37 |
| 2025-04 | 1,602.51 | Monierate | 85,197 | 103.46 | 19.25 |
| 2025-05 | 1,606.12 | Monierate | 96,467 | 106.39 | 18.13 |
| 2025-06 | 1,574.66 | Monierate | 105,620 | 107.8 | 17.02 |
| 2025-07 | 1,534.84 | Monierate | 105,920 | 107.38 | 15.9 |
| 2025-08 | 1,539.09 | Monierate | 113,500 | 108.28 | 16.26 |
| 2025-09 | 1,509.97 | Monierate | 109,410 | 117.92 | 16.62 |
| 2025-10 | 1,590.92 | Monierate | 118,670 | 130.48 | 16.98 |
| 2025-11 | 1,463.45 | Monierate | 110,290 | 131.4 | 17.34 |
| 2025-12 | 1,471.15 | Monierate | 86,473 | 138.54 | 17.7 |
| 2026-01 | 1,470.96 | Monierate | 88,876 | 152.81 | 17.0 |
| 2026-02 | 1,398.74 | Monierate | 77,013 | 161.4 | 16.86 |
| 2026-03 | 1,401.58 | Monierate | 65,792 | 156.12 | 16.71 |
| 2026-04 | 1,388.4 | Monierate | 68,074 | 151.78 | 16.57 |
| 2026-05 | 1,378.7 | Monierate | 81,000 | 147.48 | 16.43 |
| 2026-06 | 1,387.75 | Monierate | 71,000 | 135.93 | 16.29 |
| 2026-07 | 1,393.66 | Monierate | 62,000 | 130.95 | 16.14 |
| 2026-08 | 1,393.63 | Monierate | 63,000 | 140.34 | 16.0 |

## Archived implementation

The previous calculator is kept at
[`components/SavingsCalculatorOld.tsx`](../components/SavingsCalculatorOld.tsx)
for comparison. It ran on the synthetic `sampleData.ts` series, supported a
lump-sum mode and an idle-naira row, hid the T-Bills row unless
`NEXT_PUBLIC_TBILL_STOP_RATES` was set, and used a per-deposit locked-rate T-bill
model instead of the rolling model above. It is rendered nowhere.
`NEXT_PUBLIC_TBILL_STOP_RATES` no longer affects the live page and does not need
to be set on any deployment.
