import type {
  HistoricalPoint,
  SavingsError,
  SavingsInput,
  SavingsMarketData,
  SavingsResult,
} from "./types";

export const MIN_MONTHS = 12;
export const MAX_MONTHS = 66;

function isPositiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isValidPoint(point: HistoricalPoint | undefined): point is HistoricalPoint {
  return (
    !!point &&
    isPositiveFinite(point.ngnPerUsd) &&
    isPositiveFinite(point.btcUsd) &&
    isPositiveFinite(point.goldUsdPerOz)
  );
}

/* The deposit window is the `months` months immediately before the current
   month — the current month itself never receives a deposit; it only prices
   the final valuation. With 67 points ending Jul 2026, 66 months spans
   Jan 2021 → Jun 2026. */
function windowStartIndex(data: SavingsMarketData, months: number): number {
  return data.historical.length - 1 - months;
}

export function calculateSavings(
  input: SavingsInput,
  data: SavingsMarketData,
): SavingsResult | SavingsError {
  const { mode, amountNgn, months } = input;

  if (!isPositiveFinite(amountNgn)) {
    return { error: "Enter an amount above zero." };
  }
  if (!Number.isInteger(months) || months < MIN_MONTHS || months > MAX_MONTHS) {
    return { error: `Duration must be between ${MIN_MONTHS} and ${MAX_MONTHS} months.` };
  }

  const start = windowStartIndex(data, months);
  if (start < 0) {
    return { error: "Historical market data does not cover the selected period." };
  }

  const nowPoint = {
    ngnPerUsd: data.current.ngnPerUsd,
    btcUsd: data.current.btcUsd,
    goldUsdPerOz: data.current.goldUsdPerOz,
  };
  if (
    !isPositiveFinite(nowPoint.ngnPerUsd) ||
    !isPositiveFinite(nowPoint.btcUsd) ||
    !isPositiveFinite(nowPoint.goldUsdPerOz)
  ) {
    return { error: "Current market rates are unavailable." };
  }

  let usdSum = 0;
  let btcUnits = 0;
  let goldOz = 0;
  let totalNgn = 0;

  if (mode === "monthly") {
    for (let i = start; i < start + months; i++) {
      const point = data.historical[i];
      if (!isValidPoint(point)) {
        return { error: "Historical market data is incomplete for the selected period." };
      }

      const usd = amountNgn / point.ngnPerUsd;
      usdSum += usd;
      btcUnits += usd / point.btcUsd;
      goldOz += usd / point.goldUsdPerOz;
      totalNgn += amountNgn;
    }
  } else {
    const point = data.historical[start];
    if (!isValidPoint(point)) {
      return { error: "Historical market data is incomplete for the selected period." };
    }

    usdSum = amountNgn / point.ngnPerUsd;
    btcUnits = usdSum / point.btcUsd;
    goldOz = usdSum / point.goldUsdPerOz;
    totalNgn = amountNgn;
  }

  const bitcoinUsd = btcUnits * nowPoint.btcUsd;
  const goldUsd = goldOz * nowPoint.goldUsdPerOz;
  const usdtUsd = usdSum;
  const nairaUsd = totalNgn / nowPoint.ngnPerUsd;

  const values = [bitcoinUsd, goldUsd, usdtUsd, nairaUsd];
  if (values.some((value) => !Number.isFinite(value))) {
    return { error: "The calculation produced an invalid result." };
  }

  return {
    bitcoinUsd,
    goldUsd,
    usdtUsd,
    nairaUsd,
    bitcoinVsUsdt: bitcoinUsd - usdtUsd,
    goldVsUsdt: goldUsd - usdtUsd,
    nairaLossUsd: usdtUsd - nairaUsd,
    totalNgn,
    startMonth: data.historical[start].month,
    ngnPerUsdNow: nowPoint.ngnPerUsd,
  };
}

export function isSavingsError(
  result: SavingsResult | SavingsError,
): result is SavingsError {
  return "error" in result;
}
