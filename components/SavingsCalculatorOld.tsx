"use client";

/* ARCHIVED — the pre-Monierate calculator, kept for comparison only. Rendered
   nowhere; app/page.tsx uses components/SavingsCalculator.tsx.

   This version runs on the synthetic sampleData.ts series (calibrated so the
   approved Figma acceptance figures fall out of the math), supports the
   lump-sum mode and the idle-naira row, hides T-Bills unless
   NEXT_PUBLIC_TBILL_STOP_RATES is set, and accrues T-bill interest with the
   per-deposit locked-rate model. The live component replaced all of that with
   the real 68-month series in monthlySeries.ts.

   Safe to delete once the new calculator is signed off — this file and
   calculateSavings.ts / sampleData.ts / marketData.ts / sampleData's tests are
   the only remaining users of the old path, and git retains them. */

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import {
  MAX_MONTHS,
  MIN_MONTHS,
  calculateSavings,
  isSavingsError,
} from "@/lib/savings-calculator/calculateSavings";
import {
  formatDuration,
  formatMonthLabel,
  formatNgn,
  formatPlainNumber,
  formatUsd,
} from "@/lib/savings-calculator/formatters";
import { getSavingsMarketData } from "@/lib/savings-calculator/marketData";
import type {
  SavingsMarketData,
  SavingsMode,
  SavingsResult,
} from "@/lib/savings-calculator/types";

const DEFAULT_AMOUNT = 100_000;
const MAX_AMOUNT = 1_000_000_000;
/* Figma: the longest bar spans ≈70% of the card's inner width. */
const MAX_BAR_PERCENT = 70;
const MIN_BAR_PERCENT = 4.5;

type AssetRow = {
  key: "bitcoin" | "gold" | "usdt" | "tbill" | "naira";
  name: string;
  icon: string;
  barColor: string;
  valueUsd: number;
};

const assetIcons = {
  bitcoin: "/images/savings-calculator/bitcoin.png",
  gold: "/images/savings-calculator/xaut.png",
  usdt: "/images/savings-calculator/usdt.png",
  /* Same ₦ glyph, green circle for the interest-earning row, red for idle. */
  tbill: "/images/savings-calculator/naira.png",
  naira: "/images/savings-calculator/naira-red.png",
} as const;

const TBILL_GREEN = "#22a35a";

/* Signed-percentage formatting for the T-bills sub-line: sub-1% gaps show one
   decimal ("0.6"), never a clamped "0" — founder-confirmed fix. */
function formatPercentGap(pct: number): string {
  const magnitude = Math.abs(pct);
  return magnitude >= 1 ? String(Math.round(magnitude)) : magnitude.toFixed(1);
}

function parseAmountInput(value: string) {
  const next = Number(value.replace(/[^\d]/g, ""));
  if (!Number.isFinite(next)) return 0;
  return Math.min(Math.max(next, 0), MAX_AMOUNT);
}

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

/* Comparison sub-line under Bitcoin/Gold: "+14,751 dollars ahead of just
   holding dollars" (or "behind", in red). In NGN mode the figure converts
   with the same rate as the main values. */
function ComparisonLine({
  deltaUsd,
  currency,
  fxNow,
}: {
  deltaUsd: number;
  currency: "USD" | "NGN";
  fxNow: number;
}) {
  const behind = deltaUsd < 0;
  const magnitude = Math.abs(deltaUsd);
  const figure =
    currency === "USD" ? formatPlainNumber(magnitude) : formatNgn(magnitude * fxNow);
  const unit = currency === "USD" ? " dollars" : "";

  return (
    <p
      className={cn("text-base leading-6", behind ? "text-[#f04438]" : "text-white")}
    >
      {behind ? `${figure}${unit} behind just holding dollars` : `+${figure}${unit} ahead of just holding dollars`}
    </p>
  );
}

export function SavingsCalculatorOld() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);

  const [data, setData] = useState<SavingsMarketData | null>(null);
  const [mode, setMode] = useState<SavingsMode>("monthly");
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [amountInput, setAmountInput] = useState(DEFAULT_AMOUNT.toLocaleString("en-NG"));
  const [months, setMonths] = useState(MAX_MONTHS);
  const [currency, setCurrency] = useState<"USD" | "NGN">("USD");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    let cancelled = false;
    getSavingsMarketData().then((marketData) => {
      if (!cancelled) setData(marketData);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const outcome = useMemo(
    () => (data ? calculateSavings({ mode, amountNgn: amount, months }, data) : null),
    [data, mode, amount, months],
  );
  const result: SavingsResult | null = outcome && !isSavingsError(outcome) ? outcome : null;
  const calcError = outcome && isSavingsError(outcome) ? outcome.error : null;

  /* Debounced screen-reader announcement so slider drags don't announce
     every pixel. */
  useEffect(() => {
    if (!result) return;

    const timer = window.setTimeout(() => {
      setAnnouncement(
        `Over ${formatDuration(months)}: Bitcoin ${formatUsd(result.bitcoinUsd)}, gold ${formatUsd(result.goldUsd)}, USDT ${formatUsd(result.usdtUsd)}${
          result.tbillUsd !== null ? `, T-bills ${formatUsd(result.tbillUsd)}` : ""
        }, naira ${formatUsd(result.nairaUsd)}.`,
      );
    }, 400);
    return () => window.clearTimeout(timer);
  }, [result, months]);

  const startLabel = result ? formatMonthLabel(result.startMonth) : "";
  const headlineTotal = mode === "monthly" ? amount * months : amount;

  const rows: AssetRow[] = useMemo(() => {
    if (!result) return [];

    const all: AssetRow[] = [
      { key: "bitcoin", name: "Held in Bitcoin", icon: assetIcons.bitcoin, barColor: "#f8bd03", valueUsd: result.bitcoinUsd },
      { key: "gold", name: "Held in Gold", icon: assetIcons.gold, barColor: "#ec8502", valueUsd: result.goldUsd },
      { key: "usdt", name: "Held in USD₮", icon: assetIcons.usdt, barColor: "#11b4b4", valueUsd: result.usdtUsd },
      { key: "naira", name: "Held in Naira", icon: assetIcons.naira, barColor: "#f04438", valueUsd: result.nairaUsd },
    ];

    if (result.tbillUsd !== null) {
      all.push({
        key: "tbill",
        name: "In Nigerian T-Bills",
        icon: assetIcons.tbill,
        barColor: TBILL_GREEN,
        valueUsd: result.tbillUsd,
      });
    }

    /* Strictly by value — T-bills can legitimately out-earn the dollar in
       high-rate windows and must be allowed to re-sort above USD₮. */
    return all.sort((a, b) => b.valueUsd - a.valueUsd);
  }, [result]);

  /* Leadership requirement: no invented rates. When the series is absent the
     row hides and we say so once in the console instead of failing silently. */
  const tbillWarnedRef = useRef(false);
  useEffect(() => {
    if (result && result.tbillUsd === null && !tbillWarnedRef.current) {
      tbillWarnedRef.current = true;
      console.warn(
        "Savings calculator: T-bill rate series missing from market data — hiding the T-Bills row.",
      );
    }
  }, [result]);

  const maxValue = rows.length ? Math.max(...rows.map((row) => row.valueUsd)) : 0;

  function onAmountChange(event: ChangeEvent<HTMLInputElement>) {
    const next = parseAmountInput(event.target.value);
    setAmount(next);
    setAmountInput(next > 0 ? next.toLocaleString("en-NG") : "");
  }

  function displayValue(valueUsd: number) {
    if (!result) return "—";
    return currency === "USD" ? formatUsd(valueUsd) : formatNgn(valueUsd * result.ngnPerUsdNow);
  }

  const sliderFraction = (months - MIN_MONTHS) / (MAX_MONTHS - MIN_MONTHS);
  const sliderPercent = sliderFraction * 100;
  /* The 24px thumb's centre travels 12px in from each track end, so the fill
     boundary is offset to sit under the thumb centre (matches the tick
     positioning below). */
  const sliderFillCss = `calc(${sliderPercent.toFixed(3)}% + ${(12 - sliderFraction * 24).toFixed(2)}px)`;

  return (
    <section
      className="relative isolate overflow-hidden bg-[#0d101f] px-6 py-24 text-white sm:py-[120px] lg:px-0 lg:py-[200px]"
      id="savings-calculator"
      ref={sectionRef}
    >
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 lg:grid-cols-[1fr_607px] lg:items-stretch">
        {/* Left column */}
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="flex flex-col justify-between gap-12 pb-4"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <div className="flex flex-col gap-3">
            <p className="text-xl leading-[30px] text-[#4b8bff]">The savings problem</p>
            <div className="flex flex-col gap-8">
              <h2 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.6px] text-white sm:text-[48px] sm:leading-[0.9] sm:tracking-[-0.864px]">
                <span className="mb-2 block sm:mb-4">You saved {formatNgn(headlineTotal)}.</span>
                <span className="block">But did you really?</span>
              </h2>
              <p className="max-w-[522px] text-xl leading-[1.37] tracking-[-0.32px] sm:text-2xl">
                <span className="font-semibold text-white">
                  {mode === "monthly"
                    ? `Saving ${formatNgn(amount)} every month since ${startLabel} (${months} deposits) `
                    : `Putting away ${formatNgn(amount)} at once in ${startLabel} `}
                </span>
                <span className="text-[#d0d5dd]">
                  — this is what it would be worth today, depending on what you held it in.
                </span>
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-[545px] flex-col gap-10">
            <div className="flex flex-col gap-7">
              <div className="relative w-fit">
                <select
                  aria-label="Savings frequency"
                  className="cursor-pointer appearance-none rounded-lg border-2 border-[#344054] bg-transparent py-3 pl-4 pr-11 text-[22px] font-medium capitalize leading-[30px] text-white outline-none transition duration-150 ease-out focus-visible:border-[#1570ef] [&>option]:bg-[#141a2c]"
                  onChange={(event) => setMode(event.target.value as SavingsMode)}
                  value={mode}
                >
                  <option value="monthly">Saved monthly</option>
                  <option value="once">Saved at once</option>
                </select>
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 20 20"
                >
                  <path d="M4.5 7.5 10 13l5.5-5.5" />
                </svg>
              </div>

              <div className="flex flex-col gap-0.5">
                <label
                  className="text-base leading-6 text-[#d0d5dd]"
                  htmlFor="savings-amount"
                >
                  {mode === "monthly" ? "How much do you save each month?" : "How much did you put away?"}
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex h-[68px] w-full items-center gap-2 border-b-2 border-[#98a2b3] py-3 pr-4">
                    <span className="text-[44px] font-medium leading-none tracking-[-0.8px] text-white sm:text-[48px]">₦</span>
                    <input
                      className="w-full bg-transparent text-[38px] font-medium leading-none tracking-[-0.72px] text-white outline-none placeholder:text-white/30 sm:text-[44px]"
                      id="savings-amount"
                      inputMode="numeric"
                      onChange={onAmountChange}
                      value={amountInput}
                    />
                  </div>
                  <p className="text-base leading-6 text-[#d0d5dd]">
                    {amount > 0
                      ? mode === "monthly"
                        ? `${formatNgn(amount)} / month`
                        : `${formatNgn(amount)}, one time`
                      : "Enter an amount"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-6">
              <div className="flex items-center gap-2">
                <label
                  className="flex-1 text-2xl font-medium leading-8 text-white"
                  htmlFor="savings-duration"
                >
                  {mode === "monthly" ? "How long have you saved for?" : "How long ago?"}
                </label>
                <p className="text-base leading-6 text-[#d0d5dd]">{formatDuration(months)}</p>
              </div>
              <div className="flex flex-col gap-6">
                <input
                  aria-valuetext={formatDuration(months)}
                  className="savings-range w-full"
                  id="savings-duration"
                  max={MAX_MONTHS}
                  min={MIN_MONTHS}
                  onChange={(event) => setMonths(Number(event.target.value))}
                  style={{
                    background: `linear-gradient(to right, #1570ef ${sliderFillCss}, #475467 ${sliderFillCss})`,
                  }}
                  type="range"
                  value={months}
                />
                {/* Each tick sits at its true position on the 12–66 month
                    scale (the thumb centre travels 12px in from both track
                    ends), so the labels line up with the thumb. */}
                <div className="relative h-[30px] text-sm font-medium leading-[30px] text-white sm:text-xl">
                  {[1, 2, 3, 4, 5].map((year) => {
                    const p = (year * 12 - MIN_MONTHS) / (MAX_MONTHS - MIN_MONTHS);
                    return (
                      <span
                        className="absolute -translate-x-1/2 whitespace-nowrap"
                        key={year}
                        style={{ left: `calc(${(p * 100).toFixed(3)}% + ${(12 - p * 24).toFixed(1)}px)` }}
                      >
                        {year} {year === 1 ? "yr" : "yrs"}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results card */}
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="flex w-full flex-col gap-8 rounded-xl border border-[#eeaafd] bg-[#141a2c] p-6 sm:p-8"
          initial="hidden"
          transition={{ delay: 0.12, duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xl font-medium leading-[30px] text-white/60">
              What it&rsquo;s worth today
            </p>
            <div
              aria-label="Display currency"
              className="flex items-center overflow-hidden rounded-lg border border-[#344054]"
              role="group"
            >
              {(["USD", "NGN"] as const).map((option, index) => (
                <button
                  aria-pressed={currency === option}
                  className={cn(
                    "px-4 py-3 text-sm font-medium leading-5 text-white transition duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1570ef]",
                    index > 0 && "border-l border-[#344054]",
                    currency === option ? "bg-[#102a56]" : "hover:bg-white/5",
                  )}
                  key={option}
                  onClick={() => setCurrency(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {calcError ? (
            <p className="text-lg leading-6 text-white/70">{calcError}</p>
          ) : !result ? (
            <p className="text-base leading-6 text-white/50">Loading market data…</p>
          ) : (
            <div className="flex flex-col gap-5">
              {rows.map((row, index) => {
                const ratio = maxValue > 0 ? row.valueUsd / maxValue : 0;
                const widthPercent = Math.max(MIN_BAR_PERCENT, ratio * MAX_BAR_PERCENT);

                return (
                  <div className="flex flex-col gap-4" key={row.key}>
                    {index > 0 ? <div className="h-px w-full bg-[#344054]/60" /> : null}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-2">
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <img
                              alt=""
                              className="size-8 shrink-0 rounded-full object-cover"
                              src={row.icon}
                            />
                            <p className="text-xl font-semibold leading-8 text-white sm:text-2xl">
                              {row.name}
                            </p>
                          </div>
                          {row.key === "bitcoin" ? (
                            <ComparisonLine
                              currency={currency}
                              deltaUsd={result.bitcoinVsUsdt}
                              fxNow={result.ngnPerUsdNow}
                            />
                          ) : row.key === "gold" ? (
                            <ComparisonLine
                              currency={currency}
                              deltaUsd={result.goldVsUsdt}
                              fxNow={result.ngnPerUsdNow}
                            />
                          ) : row.key === "usdt" ? (
                            <p className="text-base leading-6 text-white">your dollars, preserved</p>
                          ) : row.key === "tbill" && result.tbillUsd !== null ? (
                            (() => {
                              /* Signed gap vs the dollar: + is behind, − is
                                 ahead. Never clamped — "0% behind" while
                                 actually ahead was the founder-flagged bug. */
                              const pctRaw =
                                ((result.usdtUsd - result.tbillUsd) / result.usdtUsd) * 100;

                              if (pctRaw <= -0.05) {
                                /* Genuinely ahead: adopt the winners' pattern
                                   and styling exactly, like Bitcoin/Gold. */
                                return (
                                  <ComparisonLine
                                    currency={currency}
                                    deltaUsd={result.tbillUsd - result.usdtUsd}
                                    fxNow={result.ngnPerUsdNow}
                                  />
                                );
                              }

                              return (
                                <p className="text-base leading-6 text-[#d0d5dd]">
                                  {pctRaw >= 0.05
                                    ? `earned interest, still ${formatPercentGap(pctRaw)}% behind the dollar`
                                    : "earned interest, level with the dollar"}
                                </p>
                              );
                            })()
                          ) : (
                            <p className="text-base leading-6 text-[#f04438]">
                              you lost{" "}
                              {currency === "USD"
                                ? formatUsd(result.nairaLossUsd)
                                : formatNgn(result.nairaLossUsd * result.ngnPerUsdNow)}{" "}
                              of value to depreciation
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-right text-xl font-semibold leading-8 tabular-nums text-white sm:text-2xl">
                          {displayValue(row.valueUsd)}
                        </p>
                      </div>
                      <div
                        className="h-8 rounded-lg transition-[width] duration-[600ms] ease-out motion-reduce:transition-none"
                        style={{ background: row.barColor, width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <p className="text-base leading-6 text-white/60">
              Illustrative figures using historical prices and Nigerian 364-day T-bill stop rates.
              Past performance does not predict future results. Not investment advice.
            </p>
            {data && data.mode !== "sample" ? (
              <p className="text-[13px] leading-5 text-white/40">
                Market data updated {new Date(data.current.capturedAt).toLocaleString("en-GB")}
                {[
                  data.sources.fx?.name,
                  data.sources.bitcoin?.name,
                  data.sources.gold?.name,
                  data.sources.tbills?.name,
                ].some(Boolean)
                  ? `. Sources: ${[
                      data.sources.fx?.name,
                      data.sources.bitcoin?.name,
                      data.sources.gold?.name,
                      data.sources.tbills?.name,
                    ]
                      .filter(Boolean)
                      .join(", ")}.`
                  : "."}
              </p>
            ) : null}
          </div>

          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
