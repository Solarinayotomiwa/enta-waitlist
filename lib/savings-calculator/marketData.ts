import { sampleMarketData } from "./sampleData";
import type { SavingsMarketData } from "./types";

/* Single data boundary for the savings calculator.

   TODO(Lekan): swap the implementation here for the production market-data
   API — return `mode: "live"` with real `sources` and `current.capturedAt`
   from the successful response (or `mode: "cached"` with the cached
   timestamp). Nothing in the calculator UI or lib/savings-calculator
   engine may need to change. */

/* T-bill stop rates arrive per-deployment via NEXT_PUBLIC_TBILL_STOP_RATES:
   comma-separated annualized % values, one per month, the first being
   Jan 2021, covering EVERY month of the historical range (currently 67).
   Example: "1.5,4.0,6.5,…,15.5"

   This keeps the leadership rule intact — the repo ships no invented rates —
   while letting each Vercel project (this one, entashiga.io) switch the
   T-Bills row on by pasting the real CBN series into an env var, the same
   way the LaunchList key and webhook URLs are configured. A missing, short,
   or malformed value is ignored (the row stays hidden) with a warning. */
function withConfiguredTbillRates(data: SavingsMarketData): SavingsMarketData {
  const raw = process.env.NEXT_PUBLIC_TBILL_STOP_RATES?.trim();
  if (!raw) return data;

  const rates = raw.split(/[,\s]+/).filter(Boolean).map(Number);
  const valid =
    rates.length >= data.historical.length &&
    rates.every((rate) => Number.isFinite(rate) && rate >= 0 && rate <= 100);

  if (!valid) {
    console.warn(
      `NEXT_PUBLIC_TBILL_STOP_RATES ignored: expected ${data.historical.length}+ numeric ` +
        `values between 0 and 100 (annualized %, one per month from Jan 2021), got ${rates.length}.`,
    );
    return data;
  }

  return {
    ...data,
    historical: data.historical.map((point, index) => ({
      ...point,
      tbillRatePct: rates[index],
    })),
    sources: {
      ...data.sources,
      tbills: data.sources.tbills ?? { name: "CBN 364-day T-bill stop rates" },
    },
  };
}

export async function getSavingsMarketData(): Promise<SavingsMarketData> {
  return withConfiguredTbillRates(sampleMarketData);
}
