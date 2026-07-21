/* Shared market-data model for the savings comparison and the interactive
   calculator. Both sections MUST use this single calculation path — no
   hardcoded multipliers anywhere else. */

export type AssetKey = "ngn" | "usdt" | "btc" | "xaut";

export type MarketRates = {
  /* How many naira one US dollar buys. */
  ngnPerUsd: number;
  usdtUsd: number;
  btcUsd: number;
  xautUsd: number;
};

export type MarketSnapshot = {
  /* ISO timestamp of the successful fetch that produced `current`. */
  timestamp: string;
  /* True when the API served a previously cached snapshot because the live
     request failed — the UI must then say "Last updated…", never "live". */
  stale?: boolean;
  current: MarketRates;
  historical: MarketRates & { date: string };
  sources: {
    fx: { name: string; url: string };
    assets: { name: string; url: string };
    historical: { name: string; url: string };
  };
};

/* The historical reference date for every comparison on the page. The
   previous copy said "real 2021–2026 prices" without a precise day; 1 January
   2021 matches that copy but STILL NEEDS PRODUCT APPROVAL. */
export const COMPARISON_START_DATE = "2021-01-01";

/* The fixed example used by the "You saved ₦6,000,000. But did you really?"
   section. */
export const SAVINGS_EXAMPLE_NGN = 6_000_000;

/* Verified once from Yahoo Finance daily closes for 2021-01-01 and embedded
   as a snapshot because free APIs no longer serve >365-day history:
   - BTC-USD  close 29,374.15  (finance.yahoo.com/quote/BTC-USD)
   - XAUT-USD close  1,914.97  (finance.yahoo.com/quote/XAUT-USD)
   - USDT-USD close      1.0019 (finance.yahoo.com/quote/USDT-USD)
   - NGN=X    close    380.70  (official interbank rate; the parallel-market
     rate at the time was materially higher — basis needs product approval) */
export const HISTORICAL_RATES: MarketRates & { date: string } = {
  date: COMPARISON_START_DATE,
  ngnPerUsd: 380.7,
  usdtUsd: 1.0019,
  btcUsd: 29374.15,
  xautUsd: 1914.97,
};

export const MARKET_SOURCES: MarketSnapshot["sources"] = {
  fx: { name: "CoinGecko", url: "https://www.coingecko.com/" },
  assets: { name: "CoinGecko", url: "https://www.coingecko.com/" },
  historical: { name: "Yahoo Finance", url: "https://finance.yahoo.com/" },
};

export type ComparisonResult = {
  asset: AssetKey;
  /* Nominal naira for "ngn"; token quantity for the other assets. */
  historicalQuantity: number;
  currentUsdValue: number;
};

function isPositiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function isValidRates(rates: Partial<MarketRates> | undefined): rates is MarketRates {
  return (
    !!rates &&
    isPositiveFinite(rates.ngnPerUsd) &&
    isPositiveFinite(rates.usdtUsd) &&
    isPositiveFinite(rates.btcUsd) &&
    isPositiveFinite(rates.xautUsd)
  );
}

/* Model: the entered naira amount is converted to USD at the historical
   NGN/USD rate, that USD buys each asset at its historical price, and the
   quantity is valued at today's price. The naira row is simply what the same
   nominal amount converts to at today's rate. All outputs are USD. */
export function calculateAssetComparison(
  amountNgn: number,
  snapshot: Pick<MarketSnapshot, "current" | "historical">,
): ComparisonResult[] {
  if (!Number.isFinite(amountNgn) || amountNgn <= 0) return [];
  if (!isValidRates(snapshot.current) || !isValidRates(snapshot.historical)) return [];

  const { current, historical } = snapshot;
  const historicalUsd = amountNgn / historical.ngnPerUsd;

  return [
    {
      asset: "ngn",
      historicalQuantity: amountNgn,
      currentUsdValue: amountNgn / current.ngnPerUsd,
    },
    {
      asset: "usdt",
      historicalQuantity: historicalUsd / historical.usdtUsd,
      currentUsdValue: (historicalUsd / historical.usdtUsd) * current.usdtUsd,
    },
    {
      asset: "btc",
      historicalQuantity: historicalUsd / historical.btcUsd,
      currentUsdValue: (historicalUsd / historical.btcUsd) * current.btcUsd,
    },
    {
      asset: "xaut",
      historicalQuantity: historicalUsd / historical.xautUsd,
      currentUsdValue: (historicalUsd / historical.xautUsd) * current.xautUsd,
    },
  ];
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdSmallFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value > 0 && value < 1 ? usdSmallFormatter.format(value) : usdFormatter.format(value);
}

export function formatUsdCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1_000_000) {
    return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value / 1_000_000)}M`;
  }
  if (value >= 100_000) {
    return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value / 1_000)}K`;
  }
  return formatUsd(value);
}

export function formatSnapshotTimestamp(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return "";

  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Lagos",
  }).format(date);

  return `${formatted} WAT`;
}

export function formatComparisonDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
