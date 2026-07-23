import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateSavings, isSavingsError } from "../lib/savings-calculator/calculateSavings";
import { formatDuration, formatMonthLabel } from "../lib/savings-calculator/formatters";
import { sampleMarketData } from "../lib/savings-calculator/sampleData";
import type { SavingsResult } from "../lib/savings-calculator/types";

function expectResult(value: ReturnType<typeof calculateSavings>): SavingsResult {
  assert.ok(!isSavingsError(value), `expected a result, got error: ${JSON.stringify(value)}`);
  return value;
}

function within(actual: number, expected: number, tolerance: number, label: string) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ≈${expected} ±${tolerance}, got ${actual.toFixed(2)}`,
  );
}

describe("calculateSavings — approved acceptance figures (sample dataset)", () => {
  it("default state: monthly ₦100,000 over 66 months", () => {
    const result = expectResult(
      calculateSavings({ mode: "monthly", amountNgn: 100_000, months: 66 }, sampleMarketData),
    );

    within(result.bitcoinUsd, 22_364, 60, "Bitcoin");
    within(result.goldUsd, 13_089, 40, "Gold");
    within(result.usdtUsd, 7_613, 25, "USDT");
    within(result.nairaUsd, 4_400, 15, "Naira");
    within(result.bitcoinVsUsdt, 14_751, 70, "Bitcoin vs USDT");
    within(result.goldVsUsdt, 5_476, 50, "Gold vs USDT");
    within(result.nairaLossUsd, 3_213, 30, "Naira loss");
    assert.equal(result.totalNgn, 6_600_000);
    assert.equal(result.startMonth, "2021-01");
  });

  it("lump sum: ₦1,000,000 over 66 months loses ~68–69% in naira terms", () => {
    const result = expectResult(
      calculateSavings({ mode: "once", amountNgn: 1_000_000, months: 66 }, sampleMarketData),
    );

    const lossPct = (result.nairaLossUsd / result.usdtUsd) * 100;
    assert.ok(lossPct >= 68 && lossPct <= 69, `expected 68–69% loss, got ${lossPct.toFixed(2)}%`);
  });

  it("scales linearly with amount", () => {
    const base = expectResult(
      calculateSavings({ mode: "monthly", amountNgn: 100_000, months: 66 }, sampleMarketData),
    );
    const ten = expectResult(
      calculateSavings({ mode: "monthly", amountNgn: 1_000_000, months: 66 }, sampleMarketData),
    );

    within(ten.bitcoinUsd, base.bitcoinUsd * 10, 1, "10× Bitcoin");
    within(ten.usdtUsd, base.usdtUsd * 10, 1, "10× USDT");
  });

  it("shorter windows use the most recent months", () => {
    const result = expectResult(
      calculateSavings({ mode: "monthly", amountNgn: 100_000, months: 12 }, sampleMarketData),
    );
    assert.equal(result.startMonth, "2025-07");
    assert.equal(result.totalNgn, 1_200_000);
  });
});

describe("calculateSavings — validation", () => {
  it("rejects invalid amounts", () => {
    for (const amount of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.ok(
        isSavingsError(
          calculateSavings({ mode: "monthly", amountNgn: amount, months: 66 }, sampleMarketData),
        ),
        `amount ${amount} should be rejected`,
      );
    }
  });

  it("rejects out-of-range durations", () => {
    for (const months of [11, 67, 6.5]) {
      assert.ok(
        isSavingsError(
          calculateSavings({ mode: "monthly", amountNgn: 100_000, months }, sampleMarketData),
        ),
        `months ${months} should be rejected`,
      );
    }
  });

  it("refuses zero or invalid market rates instead of hiding them", () => {
    const broken = structuredClone(sampleMarketData);
    broken.historical[10].btcUsd = 0;
    assert.ok(
      isSavingsError(calculateSavings({ mode: "monthly", amountNgn: 100_000, months: 66 }, broken)),
    );

    const badCurrent = structuredClone(sampleMarketData);
    badCurrent.current.ngnPerUsd = Number.NaN;
    assert.ok(
      isSavingsError(
        calculateSavings({ mode: "monthly", amountNgn: 100_000, months: 66 }, badCurrent),
      ),
    );
  });
});

describe("formatters", () => {
  it("formats durations with correct singular/plural", () => {
    assert.equal(formatDuration(12), "1 yr");
    assert.equal(formatDuration(13), "1 yr 1 mo");
    assert.equal(formatDuration(24), "2 yrs");
    assert.equal(formatDuration(66), "5 yrs 6 mos");
    assert.equal(formatDuration(25), "2 yrs 1 mo");
  });

  it("formats month labels", () => {
    assert.equal(formatMonthLabel("2021-01"), "Jan 2021");
    assert.equal(formatMonthLabel("2026-07"), "Jul 2026");
  });
});
