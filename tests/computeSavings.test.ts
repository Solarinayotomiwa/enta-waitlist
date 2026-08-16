import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_MONTHS,
  MIN_MONTHS,
  computeSavings,
  isSavingsError,
} from "../lib/savings-calculator/computeSavings";
import { LATEST_POINT, MONTHLY_SERIES } from "../lib/savings-calculator/monthlySeries";

function within(actual: number, expected: number, tolerance: number, label: string) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ≈${expected} (±${tolerance}), got ${actual}`,
  );
}

function ok(input: { amountNgn: number; months: number }) {
  const result = computeSavings(input);
  assert.ok(!isSavingsError(result), `expected a result, got ${JSON.stringify(result)}`);
  return result;
}

describe("computeSavings — approved acceptance figures (savings-problem-breakdown.md)", () => {
  /* 66 × ₦100,000 over 2021-03 → 2026-08, valued at ₦1,393.63/$. */
  const result = ok({ amountNgn: 100_000, months: 66 });

  it("matches the published bitcoin, gold, dollar and T-bill figures", () => {
    within(result.bitcoinUsd, 11_453, 5, "Bitcoin");
    within(result.goldUsd, 14_337, 5, "Gold");
    within(result.usdtUsd, 6_894, 5, "Dollars");
    within(result.tbillUsd, 7_434, 5, "T-Bills");
  });

  it("reports the right window and totals", () => {
    assert.equal(result.totalNgn, 6_600_000);
    assert.equal(result.startMonth, "2021-03");
    assert.equal(result.endMonth, "2026-08");
    assert.equal(result.ngnPerUsdNow, 1393.63);
  });

  it("gold leads, then bitcoin, then T-bills, then dollars", () => {
    assert.ok(result.goldUsd > result.bitcoinUsd);
    assert.ok(result.bitcoinUsd > result.tbillUsd);
    assert.ok(result.tbillUsd > result.usdtUsd);
  });

  it("derives the comparisons from the dollar baseline", () => {
    within(result.bitcoinVsUsdt, result.bitcoinUsd - result.usdtUsd, 1e-9, "bitcoinVsUsdt");
    within(result.goldVsUsdt, result.goldUsd - result.usdtUsd, 1e-9, "goldVsUsdt");
    within(result.tbillVsUsdt, result.tbillUsd - result.usdtUsd, 1e-9, "tbillVsUsdt");
    within(result.tbillVsUsdt, 540, 5, "T-bills ahead of dollars");
  });

  it("scales linearly with the deposit", () => {
    const doubled = ok({ amountNgn: 200_000, months: 66 });
    within(doubled.bitcoinUsd, result.bitcoinUsd * 2, 0.01, "Bitcoin doubled");
    within(doubled.goldUsd, result.goldUsd * 2, 0.01, "Gold doubled");
    within(doubled.usdtUsd, result.usdtUsd * 2, 0.01, "Dollars doubled");
    within(doubled.tbillUsd, result.tbillUsd * 2, 0.01, "T-Bills doubled");
    assert.equal(doubled.totalNgn, 13_200_000);
  });

  it("windows a shorter duration off the end of the series", () => {
    const short = ok({ amountNgn: 100_000, months: 12 });
    assert.equal(short.startMonth, "2025-09");
    assert.equal(short.endMonth, "2026-08");
    assert.equal(short.totalNgn, 1_200_000);
  });
});

describe("computeSavings — validation", () => {
  it("rejects non-positive or non-finite amounts", () => {
    for (const amountNgn of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      const result = computeSavings({ amountNgn, months: 66 });
      assert.ok(isSavingsError(result), `expected an error for amount ${amountNgn}`);
    }
  });

  it("rejects durations outside 12–66 and non-integers", () => {
    for (const months of [MIN_MONTHS - 1, MAX_MONTHS + 1, 6.5, 0, -12]) {
      const result = computeSavings({ amountNgn: 100_000, months });
      assert.ok(isSavingsError(result), `expected an error for ${months} months`);
    }
  });

  it("refuses a series with zeroed rates instead of hiding them", () => {
    const broken = MONTHLY_SERIES.map((point) => ({ ...point, ngnPerUsd: 0 }));
    const result = computeSavings({ amountNgn: 100_000, months: 12 }, broken);
    assert.ok(isSavingsError(result));
  });

  it("refuses a series shorter than the requested window", () => {
    const result = computeSavings(
      { amountNgn: 100_000, months: 66 },
      MONTHLY_SERIES.slice(-20),
    );
    assert.ok(isSavingsError(result));
  });
});

describe("MONTHLY_SERIES — integrity", () => {
  it("covers 68 months from Jan 2021 to Aug 2026", () => {
    assert.equal(MONTHLY_SERIES.length, 68);
    assert.equal(MONTHLY_SERIES[0].month, "2021-01");
    assert.equal(LATEST_POINT.month, "2026-08");
  });

  it("is strictly ascending by month with no gaps", () => {
    for (let i = 1; i < MONTHLY_SERIES.length; i++) {
      assert.ok(
        MONTHLY_SERIES[i].month > MONTHLY_SERIES[i - 1].month,
        `${MONTHLY_SERIES[i].month} does not follow ${MONTHLY_SERIES[i - 1].month}`,
      );
    }
  });

  it("has finite, positive prices and a usable rate on every point", () => {
    for (const point of MONTHLY_SERIES) {
      for (const [field, value] of [
        ["ngnPerUsd", point.ngnPerUsd],
        ["btcUsd", point.btcUsd],
        ["goldUsdPerGram", point.goldUsdPerGram],
      ] as const) {
        assert.ok(
          Number.isFinite(value) && value > 0,
          `${point.month} ${field} is ${value}`,
        );
      }
      assert.ok(
        Number.isFinite(point.tbillRatePct) &&
          point.tbillRatePct >= 0 &&
          point.tbillRatePct <= 100,
        `${point.month} tbillRatePct is ${point.tbillRatePct}`,
      );
    }
  });

  it("keeps the documented provenance split of 36 Monierate / 7 anchor / 25 interpolated", () => {
    const count = (source: string) =>
      MONTHLY_SERIES.filter((point) => point.source === source).length;
    assert.equal(count("monierate"), 36);
    assert.equal(count("anchor"), 7);
    assert.equal(count("interpolated"), 25);
  });

  it("uses real Monierate FX for every month from Sep 2023 onward", () => {
    for (const point of MONTHLY_SERIES) {
      if (point.month >= "2023-09") {
        assert.equal(point.source, "monierate", `${point.month} is not Monierate-sourced`);
      }
    }
  });
});
