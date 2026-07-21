import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HISTORICAL_RATES,
  type MarketRates,
  calculateAssetComparison,
  formatUsd,
} from "../lib/market";

const current: MarketRates = {
  ngnPerUsd: 1381,
  usdtUsd: 0.9992,
  btcUsd: 66147,
  xautUsd: 4059.22,
};

const snapshot = { current, historical: HISTORICAL_RATES };

describe("calculateAssetComparison", () => {
  it("computes the documented model for ₦6,000,000", () => {
    const results = calculateAssetComparison(6_000_000, snapshot);
    const byAsset = Object.fromEntries(results.map((r) => [r.asset, r]));

    const historicalUsd = 6_000_000 / HISTORICAL_RATES.ngnPerUsd;

    assert.equal(results.length, 4);
    assert.ok(Math.abs(byAsset.ngn.currentUsdValue - 6_000_000 / current.ngnPerUsd) < 1e-6);
    assert.ok(
      Math.abs(
        byAsset.usdt.currentUsdValue -
          (historicalUsd / HISTORICAL_RATES.usdtUsd) * current.usdtUsd,
      ) < 1e-6,
    );
    assert.ok(
      Math.abs(
        byAsset.btc.currentUsdValue - (historicalUsd / HISTORICAL_RATES.btcUsd) * current.btcUsd,
      ) < 1e-6,
    );
    assert.ok(
      Math.abs(
        byAsset.xaut.currentUsdValue -
          (historicalUsd / HISTORICAL_RATES.xautUsd) * current.xautUsd,
      ) < 1e-6,
    );
  });

  it("scales proportionally with the entered amount", () => {
    const amounts = [1_000, 10_000, 100_000, 1_000_000, 6_000_000];
    const base = calculateAssetComparison(1_000, snapshot);

    for (const amount of amounts) {
      const results = calculateAssetComparison(amount, snapshot);
      const factor = amount / 1_000;

      results.forEach((result, index) => {
        const expected = base[index].currentUsdValue * factor;
        assert.ok(
          Math.abs(result.currentUsdValue - expected) < 1e-6 * factor,
          `${result.asset} at ₦${amount} should be exactly ${factor}× the ₦1,000 result`,
        );
        assert.ok(Number.isFinite(result.currentUsdValue) && result.currentUsdValue > 0);
      });
    }
  });

  it("returns an empty result for invalid amounts", () => {
    assert.deepEqual(calculateAssetComparison(0, snapshot), []);
    assert.deepEqual(calculateAssetComparison(-5, snapshot), []);
    assert.deepEqual(calculateAssetComparison(Number.NaN, snapshot), []);
  });

  it("refuses to calculate from invalid rates instead of hiding them with || 0", () => {
    const broken = {
      current: { ...current, btcUsd: 0 },
      historical: HISTORICAL_RATES,
    };
    assert.deepEqual(calculateAssetComparison(1_000, broken), []);

    const missing = {
      current: { ...current, xautUsd: Number.NaN },
      historical: HISTORICAL_RATES,
    };
    assert.deepEqual(calculateAssetComparison(1_000, missing), []);
  });

  it("keeps USDT roughly flat and naira well below the historical USD value", () => {
    const results = calculateAssetComparison(1_000_000, snapshot);
    const byAsset = Object.fromEntries(results.map((r) => [r.asset, r]));
    const historicalUsd = 1_000_000 / HISTORICAL_RATES.ngnPerUsd;

    assert.ok(Math.abs(byAsset.usdt.currentUsdValue - historicalUsd) / historicalUsd < 0.01);
    assert.ok(byAsset.ngn.currentUsdValue < historicalUsd * 0.5);
  });
});

describe("formatUsd", () => {
  it("formats standard values with two decimals", () => {
    assert.equal(formatUsd(1), "$1.00");
    assert.equal(formatUsd(4.82), "$4.82");
    assert.equal(formatUsd(15760.44), "$15,760.44");
  });

  it("keeps sub-dollar precision without noise", () => {
    assert.equal(formatUsd(0.64), "$0.64");
    assert.equal(formatUsd(0.0723), "$0.0723");
  });

  it("never renders NaN or undefined", () => {
    assert.equal(formatUsd(Number.NaN), "—");
    assert.equal(formatUsd(undefined as unknown as number), "—");
  });
});
