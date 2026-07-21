import { NextResponse } from "next/server";
import {
  HISTORICAL_RATES,
  MARKET_SOURCES,
  type MarketRates,
  type MarketSnapshot,
  isValidRates,
} from "@/lib/market";

/* Current prices come from CoinGecko's free endpoint (no API key). The
   NGN/USD rate is derived from the USDT quote pair (NGN price ÷ USD price),
   so the FX basis matches the asset-price basis. Historical rates are a
   verified embedded snapshot — see lib/market.ts. */
const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether,tether-gold&vs_currencies=usd,ngn";

type CoinGeckoResponse = {
  bitcoin?: { usd?: number; ngn?: number };
  tether?: { usd?: number; ngn?: number };
  "tether-gold"?: { usd?: number; ngn?: number };
};

/* Survives between invocations while the serverless instance stays warm, so
   a transient CoinGecko failure serves the last good data — clearly marked
   stale — instead of an error. */
let lastGoodSnapshot: MarketSnapshot | null = null;

async function fetchCurrentRates(): Promise<{ rates: MarketRates; timestamp: string } | null> {
  try {
    const response = await fetch(COINGECKO_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      console.error("CoinGecko responded", response.status);
      return null;
    }

    const data = (await response.json()) as CoinGeckoResponse;
    const tetherUsd = data.tether?.usd;
    const tetherNgn = data.tether?.ngn;

    const rates: Partial<MarketRates> = {
      ngnPerUsd: tetherUsd && tetherNgn ? tetherNgn / tetherUsd : undefined,
      usdtUsd: tetherUsd,
      btcUsd: data.bitcoin?.usd,
      xautUsd: data["tether-gold"]?.usd,
    };

    if (!isValidRates(rates)) {
      console.error("CoinGecko returned incomplete rates", Object.keys(data));
      return null;
    }

    return { rates, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("CoinGecko request failed", error);
    return null;
  }
}

export async function GET() {
  const live = await fetchCurrentRates();

  if (live) {
    lastGoodSnapshot = {
      timestamp: live.timestamp,
      current: live.rates,
      historical: HISTORICAL_RATES,
      sources: MARKET_SOURCES,
    };

    return NextResponse.json(lastGoodSnapshot, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  }

  if (lastGoodSnapshot) {
    return NextResponse.json(
      { ...lastGoodSnapshot, stale: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { error: "Market data is temporarily unavailable. Please try again shortly." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
