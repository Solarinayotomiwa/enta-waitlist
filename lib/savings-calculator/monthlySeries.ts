/* REAL MONTHLY SERIES — Jan 2021 → Aug 2026 (68 months).

   Every figure here is sourced, not modelled. This replaces the synthetic
   sampleData.ts, which was calibrated backwards from the Figma acceptance
   numbers and shipped no T-bill rates at all.

   Values are as of the 1st of each month. The final entry (2026-08) is both
   the last deposit month and the valuation point — "today" for the calculator,
   at ₦1,393.63 per dollar.

   FX (ngnPerUsd, basis USDT/NGN — treated as interchangeable with USD/NGN per
     Dami's direction, and labelled "dollars" in the UI):
       • Sep 2023 → Aug 2026 (36 months): REAL. Monierate Pro historical API,
         usdtngn daily composite candles aggregated to monthly averages.
         Monierate applies a documented methodology change on 2026-03-17
         (single-source legacy_host before, trimmed-mean composite after);
         both eras are used as-is.
       • 7 real dated anchors from abokiFX / @naira_rates / press: ₦490 Jan 21,
         ₦700 May 21, ₦570 Sep 21, ₦710 Sep 22, ₦745 Dec 22, ₦755 Jan 23,
         ₦770 Jun 23.
       • The 25 months between those anchors are linearly interpolated.
         Monierate has no coverage before Sep 2023 for any pair and abokiFX
         went dark in Sep 2021, so this gap is irreducible — it is disclosed on
         the page rather than papered over.

   Bitcoin: real first-of-month BTC/USD (Habrador public daily dataset);
     May–Aug 2026 tail from press snapshots, not exact month-end closes.

   Gold: real monthly LBMA gold, USD/oz converted to USD/gram (÷ 31.1035).
     NOTE the unit — the archived series used USD/troy oz.

   T-bills: CBN 364-day benchmark, real reported points (CEIC/THISDAY)
     interpolated monthly. The only series that is not month-by-month primary.

   Provenance split: 36 Monierate · 7 anchor · 25 interpolated.
   Full table and methodology: docs/savings-data-sources.md */

export type SeriesSource = "monierate" | "anchor" | "interpolated";

export type SeriesPoint = {
  /* "YYYY-MM", values as of the 1st of the month. */
  month: string;
  /* Naira per dollar (USDT/NGN composite). */
  ngnPerUsd: number;
  btcUsd: number;
  /* USD per GRAM, not per troy ounce. */
  goldUsdPerGram: number;
  /* CBN 364-day benchmark, annualized %. */
  tbillRatePct: number;
  /* Provenance of the FX figure — the only series with mixed sourcing. */
  source: SeriesSource;
};

export const MONTHLY_SERIES: readonly SeriesPoint[] = [
  /* 2021 */
  { month: "2021-01", ngnPerUsd: 490, btcUsd: 29112, goldUsdPerGram: 60.03, tbillRatePct: 1.2, source: "anchor" },
  { month: "2021-02", ngnPerUsd: 542.5, btcUsd: 33087, goldUsdPerGram: 58.13, tbillRatePct: 2.76, source: "interpolated" },
  { month: "2021-03", ngnPerUsd: 595.0, btcUsd: 45093, goldUsdPerGram: 55.23, tbillRatePct: 4.32, source: "interpolated" },
  { month: "2021-04", ngnPerUsd: 647.5, btcUsd: 58725, goldUsdPerGram: 56.59, tbillRatePct: 5.88, source: "interpolated" },
  { month: "2021-05", ngnPerUsd: 700, btcUsd: 57303, goldUsdPerGram: 59.48, tbillRatePct: 7.44, source: "anchor" },
  { month: "2021-06", ngnPerUsd: 667.5, btcUsd: 36929, goldUsdPerGram: 59.0, tbillRatePct: 9.0, source: "interpolated" },
  { month: "2021-07", ngnPerUsd: 635.0, btcUsd: 34856, goldUsdPerGram: 58.13, tbillRatePct: 8.33, source: "interpolated" },
  { month: "2021-08", ngnPerUsd: 602.5, btcUsd: 41870, goldUsdPerGram: 57.39, tbillRatePct: 7.67, source: "interpolated" },
  { month: "2021-09", ngnPerUsd: 570, btcUsd: 46920, goldUsdPerGram: 57.07, tbillRatePct: 7.0, source: "anchor" },
  { month: "2021-10", ngnPerUsd: 581.67, btcUsd: 43718, goldUsdPerGram: 57.13, tbillRatePct: 6.33, source: "interpolated" },
  { month: "2021-11", ngnPerUsd: 593.33, btcUsd: 61374, goldUsdPerGram: 58.58, tbillRatePct: 5.67, source: "interpolated" },
  { month: "2021-12", ngnPerUsd: 605.0, btcUsd: 56973, goldUsdPerGram: 57.55, tbillRatePct: 5.0, source: "interpolated" },
  /* 2022 */
  { month: "2022-01", ngnPerUsd: 616.67, btcUsd: 46208, goldUsdPerGram: 58.39, tbillRatePct: 5.5, source: "interpolated" },
  { month: "2022-02", ngnPerUsd: 628.33, btcUsd: 38500, goldUsdPerGram: 59.67, tbillRatePct: 6.0, source: "interpolated" },
  { month: "2022-03", ngnPerUsd: 640.0, btcUsd: 44355, goldUsdPerGram: 62.63, tbillRatePct: 6.5, source: "interpolated" },
  { month: "2022-04", ngnPerUsd: 651.67, btcUsd: 46282, goldUsdPerGram: 62.28, tbillRatePct: 7.0, source: "interpolated" },
  { month: "2022-05", ngnPerUsd: 663.33, btcUsd: 38469, goldUsdPerGram: 59.45, tbillRatePct: 7.5, source: "interpolated" },
  { month: "2022-06", ngnPerUsd: 675.0, btcUsd: 29799, goldUsdPerGram: 59.06, tbillRatePct: 8.0, source: "interpolated" },
  { month: "2022-07", ngnPerUsd: 686.67, btcUsd: 19269, goldUsdPerGram: 55.72, tbillRatePct: 8.83, source: "interpolated" },
  { month: "2022-08", ngnPerUsd: 698.33, btcUsd: 23314, goldUsdPerGram: 56.75, tbillRatePct: 9.67, source: "interpolated" },
  { month: "2022-09", ngnPerUsd: 710, btcUsd: 20127, goldUsdPerGram: 54.04, tbillRatePct: 10.5, source: "anchor" },
  { month: "2022-10", ngnPerUsd: 721.67, btcUsd: 19312, goldUsdPerGram: 53.5, tbillRatePct: 11.33, source: "interpolated" },
  { month: "2022-11", ngnPerUsd: 733.33, btcUsd: 20485, goldUsdPerGram: 55.46, tbillRatePct: 12.17, source: "interpolated" },
  { month: "2022-12", ngnPerUsd: 745, btcUsd: 16967, goldUsdPerGram: 57.81, tbillRatePct: 13.0, source: "anchor" },
  /* 2023 */
  { month: "2023-01", ngnPerUsd: 755, btcUsd: 16625, goldUsdPerGram: 61.02, tbillRatePct: 4.5, source: "anchor" },
  { month: "2023-02", ngnPerUsd: 758.0, btcUsd: 23724, goldUsdPerGram: 59.64, tbillRatePct: 4.8, source: "interpolated" },
  { month: "2023-03", ngnPerUsd: 761.0, btcUsd: 23647, goldUsdPerGram: 61.5, tbillRatePct: 5.1, source: "interpolated" },
  { month: "2023-04", ngnPerUsd: 764.0, btcUsd: 28411, goldUsdPerGram: 64.3, tbillRatePct: 5.4, source: "interpolated" },
  { month: "2023-05", ngnPerUsd: 767.0, btcUsd: 28092, goldUsdPerGram: 64.04, tbillRatePct: 5.7, source: "interpolated" },
  { month: "2023-06", ngnPerUsd: 770, btcUsd: 26820, goldUsdPerGram: 62.47, tbillRatePct: 6.0, source: "anchor" },
  { month: "2023-07", ngnPerUsd: 841.43, btcUsd: 30590, goldUsdPerGram: 62.73, tbillRatePct: 7.17, source: "interpolated" },
  { month: "2023-08", ngnPerUsd: 912.86, btcUsd: 29676, goldUsdPerGram: 61.7, tbillRatePct: 8.33, source: "interpolated" },
  { month: "2023-09", ngnPerUsd: 984.29, btcUsd: 25801, goldUsdPerGram: 61.6, tbillRatePct: 9.5, source: "monierate" },
  { month: "2023-10", ngnPerUsd: 1106.86, btcUsd: 27984, goldUsdPerGram: 61.6, tbillRatePct: 10.67, source: "monierate" },
  { month: "2023-11", ngnPerUsd: 1139.87, btcUsd: 35437, goldUsdPerGram: 63.79, tbillRatePct: 11.83, source: "monierate" },
  { month: "2023-12", ngnPerUsd: 1213.26, btcUsd: 38689, goldUsdPerGram: 65.14, tbillRatePct: 13.0, source: "monierate" },
  /* 2024 */
  { month: "2024-01", ngnPerUsd: 1334.27, btcUsd: 44167, goldUsdPerGram: 65.39, tbillRatePct: 12.0, source: "monierate" },
  { month: "2024-02", ngnPerUsd: 1585.49, btcUsd: 43076, goldUsdPerGram: 65.04, tbillRatePct: 16.5, source: "monierate" },
  { month: "2024-03", ngnPerUsd: 1517.1, btcUsd: 62441, goldUsdPerGram: 69.38, tbillRatePct: 21.0, source: "monierate" },
  { month: "2024-04", ngnPerUsd: 1234.54, btcUsd: 69702, goldUsdPerGram: 74.94, tbillRatePct: 21.31, source: "monierate" },
  { month: "2024-05", ngnPerUsd: 1444.23, btcUsd: 58254, goldUsdPerGram: 75.59, tbillRatePct: 21.62, source: "monierate" },
  { month: "2024-06", ngnPerUsd: 1501.02, btcUsd: 67707, goldUsdPerGram: 74.78, tbillRatePct: 21.94, source: "monierate" },
  { month: "2024-07", ngnPerUsd: 1572.82, btcUsd: 62852, goldUsdPerGram: 77.1, tbillRatePct: 22.25, source: "monierate" },
  { month: "2024-08", ngnPerUsd: 1611.16, btcUsd: 65358, goldUsdPerGram: 79.41, tbillRatePct: 22.56, source: "monierate" },
  { month: "2024-09", ngnPerUsd: 1667.43, btcUsd: 57454, goldUsdPerGram: 82.66, tbillRatePct: 22.88, source: "monierate" },
  { month: "2024-10", ngnPerUsd: 1708.5, btcUsd: 60981, goldUsdPerGram: 86.49, tbillRatePct: 23.19, source: "monierate" },
  { month: "2024-11", ngnPerUsd: 1742.32, btcUsd: 69590, goldUsdPerGram: 85.23, tbillRatePct: 23.5, source: "monierate" },
  { month: "2024-12", ngnPerUsd: 1662.62, btcUsd: 97365, goldUsdPerGram: 85.14, tbillRatePct: 22.9, source: "monierate" },
  /* 2025 */
  { month: "2025-01", ngnPerUsd: 1652.71, btcUsd: 94757, goldUsdPerGram: 87.13, tbillRatePct: 22.6, source: "monierate" },
  { month: "2025-02", ngnPerUsd: 1526.46, btcUsd: 100700, goldUsdPerGram: 93.08, tbillRatePct: 21.48, source: "monierate" },
  { month: "2025-03", ngnPerUsd: 1548.39, btcUsd: 86382, goldUsdPerGram: 95.91, tbillRatePct: 20.37, source: "monierate" },
  { month: "2025-04", ngnPerUsd: 1602.51, btcUsd: 85197, goldUsdPerGram: 103.46, tbillRatePct: 19.25, source: "monierate" },
  { month: "2025-05", ngnPerUsd: 1606.12, btcUsd: 96467, goldUsdPerGram: 106.39, tbillRatePct: 18.13, source: "monierate" },
  { month: "2025-06", ngnPerUsd: 1574.66, btcUsd: 105620, goldUsdPerGram: 107.8, tbillRatePct: 17.02, source: "monierate" },
  { month: "2025-07", ngnPerUsd: 1534.84, btcUsd: 105920, goldUsdPerGram: 107.38, tbillRatePct: 15.9, source: "monierate" },
  { month: "2025-08", ngnPerUsd: 1539.09, btcUsd: 113500, goldUsdPerGram: 108.28, tbillRatePct: 16.26, source: "monierate" },
  { month: "2025-09", ngnPerUsd: 1509.97, btcUsd: 109410, goldUsdPerGram: 117.92, tbillRatePct: 16.62, source: "monierate" },
  { month: "2025-10", ngnPerUsd: 1590.92, btcUsd: 118670, goldUsdPerGram: 130.48, tbillRatePct: 16.98, source: "monierate" },
  { month: "2025-11", ngnPerUsd: 1463.45, btcUsd: 110290, goldUsdPerGram: 131.4, tbillRatePct: 17.34, source: "monierate" },
  { month: "2025-12", ngnPerUsd: 1471.15, btcUsd: 86473, goldUsdPerGram: 138.54, tbillRatePct: 17.7, source: "monierate" },
  /* 2026 */
  { month: "2026-01", ngnPerUsd: 1470.96, btcUsd: 88876, goldUsdPerGram: 152.81, tbillRatePct: 17.0, source: "monierate" },
  { month: "2026-02", ngnPerUsd: 1398.74, btcUsd: 77013, goldUsdPerGram: 161.4, tbillRatePct: 16.86, source: "monierate" },
  { month: "2026-03", ngnPerUsd: 1401.58, btcUsd: 65792, goldUsdPerGram: 156.12, tbillRatePct: 16.71, source: "monierate" },
  { month: "2026-04", ngnPerUsd: 1388.4, btcUsd: 68074, goldUsdPerGram: 151.78, tbillRatePct: 16.57, source: "monierate" },
  { month: "2026-05", ngnPerUsd: 1378.7, btcUsd: 81000, goldUsdPerGram: 147.48, tbillRatePct: 16.43, source: "monierate" },
  { month: "2026-06", ngnPerUsd: 1387.75, btcUsd: 71000, goldUsdPerGram: 135.93, tbillRatePct: 16.29, source: "monierate" },
  { month: "2026-07", ngnPerUsd: 1393.66, btcUsd: 62000, goldUsdPerGram: 130.95, tbillRatePct: 16.14, source: "monierate" },
  { month: "2026-08", ngnPerUsd: 1393.63, btcUsd: 63000, goldUsdPerGram: 140.34, tbillRatePct: 16.0, source: "monierate" },
];

/* The valuation point — "today" for the calculator. */
export const LATEST_POINT = MONTHLY_SERIES[MONTHLY_SERIES.length - 1];
