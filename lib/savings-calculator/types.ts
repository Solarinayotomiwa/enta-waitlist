export type HistoricalPoint = {
  /* "YYYY-MM", values as of the 1st of the month. */
  month: string;
  ngnPerUsd: number;
  btcUsd: number;
  goldUsdPerOz: number;
};

export type SavingsMarketData = {
  historical: HistoricalPoint[];
  current: {
    capturedAt: string;
    ngnPerUsd: number;
    btcUsd: number;
    goldUsdPerOz: number;
  };
  sources: {
    fx?: { name: string; url?: string };
    bitcoin?: { name: string; url?: string };
    gold?: { name: string; url?: string };
  };
  mode: "sample" | "live" | "cached";
};

export type SavingsMode = "monthly" | "once";

export type SavingsInput = {
  mode: SavingsMode;
  /* Naira per deposit (monthly) or the single lump sum (once). */
  amountNgn: number;
  /* 12–66. */
  months: number;
};

export type SavingsResult = {
  /* Current USD values. */
  bitcoinUsd: number;
  goldUsd: number;
  usdtUsd: number;
  nairaUsd: number;
  /* Comparisons, in USD. */
  bitcoinVsUsdt: number;
  goldVsUsdt: number;
  nairaLossUsd: number;
  /* Total nominal naira put in over the window. */
  totalNgn: number;
  /* "YYYY-MM" of the first month in the window. */
  startMonth: string;
  /* Today's NGN/USD rate, for the NGN display toggle. */
  ngnPerUsdNow: number;
};

export type SavingsError = { error: string };
