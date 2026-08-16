import { MONTHLY_SERIES, type SeriesPoint } from "./monthlySeries";

export const MIN_MONTHS = 12;
export const MAX_MONTHS = 66;

export type SavingsInput = {
  /* Naira deposited every month. */
  amountNgn: number;
  /* 12–66 monthly deposits. */
  months: number;
};

export type SavingsOutcome = {
  /* Current USD values. */
  bitcoinUsd: number;
  goldUsd: number;
  usdtUsd: number;
  tbillUsd: number;
  /* Comparisons against the dollar baseline, in USD. */
  bitcoinVsUsdt: number;
  goldVsUsdt: number;
  tbillVsUsdt: number;
  /* Total nominal naira put in over the window. */
  totalNgn: number;
  /* "YYYY-MM" bounds of the deposit window. */
  startMonth: string;
  endMonth: string;
  /* Today's NGN/USD rate, for the NGN display toggle. */
  ngnPerUsdNow: number;
};

export type SavingsError = { error: string };

function isPositiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isValidPoint(point: SeriesPoint | undefined): point is SeriesPoint {
  return (
    !!point &&
    isPositiveFinite(point.ngnPerUsd) &&
    isPositiveFinite(point.btcUsd) &&
    isPositiveFinite(point.goldUsdPerGram) &&
    typeof point.tbillRatePct === "number" &&
    Number.isFinite(point.tbillRatePct) &&
    point.tbillRatePct >= 0
  );
}

/* Dollar-cost averaging over the last `months` entries of the series.

   Window semantics, per the approved savings-problem-breakdown.md artifact:
   the deposit window is `series.slice(-months)`, so the final series entry is
   BOTH the last deposit month and the valuation point. (The archived engine
   excluded the current month from deposits — that difference is why its
   figures do not match this one's.)

   Each deposit converts at its own month's rate; Bitcoin and gold accumulate
   units at that month's real price and are valued once at today's price;
   dollars are held flat and are the baseline everything else is compared to. */
export function computeSavings(
  input: SavingsInput,
  series: readonly SeriesPoint[] = MONTHLY_SERIES,
): SavingsOutcome | SavingsError {
  const { amountNgn, months } = input;

  if (!isPositiveFinite(amountNgn)) {
    return { error: "Enter an amount above zero." };
  }
  if (!Number.isInteger(months) || months < MIN_MONTHS || months > MAX_MONTHS) {
    return { error: `Duration must be between ${MIN_MONTHS} and ${MAX_MONTHS} months.` };
  }
  if (series.length < months) {
    return { error: "Historical market data does not cover the selected period." };
  }

  const window = series.slice(-months);
  const now = series[series.length - 1];
  if (!isValidPoint(now)) {
    return { error: "Current market rates are unavailable." };
  }

  let usdSum = 0;
  let btcUnits = 0;
  let goldGrams = 0;
  let totalNgn = 0;

  /* T-bills: a single naira balance that rolls at each month's prevailing
     364-day rate and receives that month's deposit afterwards, so a deposit
     earns nothing in its own deposit month. Converted to USD once, at today's
     rate, after the whole window has accrued.

     This rolling model comes from the approved savings-problem-breakdown.md
     artifact and replaces the archived engine's per-deposit locked-rate model
     (see calculateSavings.ts) — do not reconcile the two without a founder
     decision. */
  let tbillNgn = 0;

  for (const point of window) {
    if (!isValidPoint(point)) {
      return { error: "Historical market data is incomplete for the selected period." };
    }

    const usd = amountNgn / point.ngnPerUsd;
    usdSum += usd;
    btcUnits += usd / point.btcUsd;
    goldGrams += usd / point.goldUsdPerGram;
    totalNgn += amountNgn;
    tbillNgn = tbillNgn * (1 + point.tbillRatePct / 100 / 12) + amountNgn;
  }

  const bitcoinUsd = btcUnits * now.btcUsd;
  const goldUsd = goldGrams * now.goldUsdPerGram;
  const usdtUsd = usdSum;
  const tbillUsd = tbillNgn / now.ngnPerUsd;

  const values = [bitcoinUsd, goldUsd, usdtUsd, tbillUsd];
  if (values.some((value) => !Number.isFinite(value))) {
    return { error: "The calculation produced an invalid result." };
  }

  return {
    bitcoinUsd,
    goldUsd,
    usdtUsd,
    tbillUsd,
    bitcoinVsUsdt: bitcoinUsd - usdtUsd,
    goldVsUsdt: goldUsd - usdtUsd,
    tbillVsUsdt: tbillUsd - usdtUsd,
    totalNgn,
    startMonth: window[0].month,
    endMonth: now.month,
    ngnPerUsdNow: now.ngnPerUsd,
  };
}

export function isSavingsError(
  result: SavingsOutcome | SavingsError,
): result is SavingsError {
  return "error" in result;
}
