"use client";

import { ChangeEvent, CSSProperties, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

type AssetOutcome = {
  key: "naira" | "usdt" | "bitcoin" | "xaut";
  label: string;
  multiplier: number;
  icon: string;
  accent: string;
  summary: string;
};

const assetOutcomes: AssetOutcome[] = [
  {
    key: "naira",
    label: "Held in naira",
    multiplier: 1,
    icon: figmaAssets.calculatorChartNaira,
    accent: "#7ba7ff",
    summary: "Still ₦6M. But worth 63% less in purchasing power than when you saved it.",
  },
  {
    key: "usdt",
    label: "Held in USDT",
    multiplier: 2.71,
    icon: figmaAssets.calculatorChartUsdt,
    accent: "#31c48d",
    summary:
      "A digital dollar that holds its value. Your savings, shielded from naira devaluation.",
  },
  {
    key: "bitcoin",
    label: "Held in Bitcoin",
    multiplier: 3.15,
    icon: figmaAssets.calculatorChartBtc,
    accent: "#f7931a",
    summary:
      "The hardest money ever made. 21 million forever — against a naira that only expands.",
  },
  {
    key: "xaut",
    label: "Held in Gold",
    multiplier: 3.7666667,
    icon: figmaAssets.calculatorChartXaut,
    accent: "#f2c94c",
    summary:
      "Five thousand years as the ultimate store of value. Now able to be held without the custody and counterfeit risks. The ultimate hedge against devaluation.",
  },
];

const defaultAmount = 6000000;
const minAmount = 1;
const maxAmount = 1000000000;
const minVisibleBarScale = 0.08;
const chartLabelReserveRem = 5.75;

function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    currency: "NGN",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Math.round(value));
}

function formatCompactNaira(value: number) {
  const rounded = Math.round(value);

  if (rounded >= 1_000_000_000) {
    return `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(rounded / 1_000_000_000)}B`;
  }

  if (rounded >= 1_000_000) {
    return `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(rounded / 1_000_000)}M`;
  }

  if (rounded >= 1_000) {
    return `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 1 }).format(rounded / 1_000)}K`;
  }

  return formatNaira(rounded);
}

function parseAmountInput(value: string) {
  const next = Number(value.replace(/[^\d]/g, ""));
  if (!Number.isFinite(next)) return 0;
  return Math.min(Math.max(next, 0), maxAmount);
}

function formatAmountInput(value: number) {
  if (value <= 0) return "";
  return value.toLocaleString("en-NG");
}

function getAmountHeightFactor(value: number) {
  const minLog = Math.log10(minAmount);
  const maxLog = Math.log10(maxAmount);
  const currentLog = Math.log10(Math.min(Math.max(value, minAmount), maxAmount));
  const magnitude = (currentLog - minLog) / (maxLog - minLog);

  return 0.78 + magnitude * 0.22;
}

const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function CalculatorSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "220px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);
  const shouldAnimate = isInView && !reducedMotion;
  const [amount, setAmount] = useState(defaultAmount);
  const [amountInput, setAmountInput] = useState(defaultAmount.toLocaleString("en-NG"));
  const [expandedKey, setExpandedKey] = useState<AssetOutcome["key"]>("xaut");

  const outcomes = useMemo(
    () => {
      const calculated = assetOutcomes.map((item) => {
        const result = amount * item.multiplier;

        return {
          ...item,
          result,
        };
      });
      const maxResult = Math.max(...calculated.map((item) => item.result));
      const amountHeightFactor = getAmountHeightFactor(amount);

      return calculated.map((item) => {
        const relativeScale = maxResult > 0 ? item.result / maxResult : 0;
        const chartScale = Math.min(Math.max(relativeScale * amountHeightFactor, minVisibleBarScale), 1);

        return {
          ...item,
          chartScale,
        };
      });
    },
    [amount],
  );
  function onAmountChange(event: ChangeEvent<HTMLInputElement>) {
    const nextAmount = parseAmountInput(event.target.value);

    setAmount(nextAmount);
    setAmountInput(formatAmountInput(nextAmount));
  }

  return (
    <section
      className={cn(
        "calculator-section relative isolate overflow-hidden bg-[#0d101d] px-6 py-24 text-white sm:py-[120px] lg:px-0",
        shouldAnimate && "motion-active",
      )}
      id="calculator"
      ref={sectionRef}
    >
      <div aria-hidden="true" className="calculator-orb" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-20">
        <div className="grid gap-10 lg:grid-cols-[390px_1fr] lg:gap-12">
          <motion.div
            animate={contentVisible ? "visible" : "hidden"}
            className="max-w-[410px]"
            initial="hidden"
            transition={{ duration: 0.55, ease: "easeOut" }}
            variants={sectionReveal}
          >
            <p className="mb-3 text-xl leading-[30px] text-[#4b8bff]">The savings problem</p>
            <h2 className="text-balance text-[2.35rem] font-semibold leading-[1.12] tracking-[-0.018em] sm:text-5xl sm:leading-[54px]">
              You saved ₦6,000,000. But did you really?
            </h2>
            <p className="mt-4 text-pretty text-lg leading-[26px] tracking-[-0.32px] text-white sm:text-xl">
              The money is still there. The number has not changed. But what it can buy has been
              shrinking every single month.
            </p>
            <a
              className="mt-10 inline-flex h-10 items-center justify-center rounded-lg bg-white px-3.5 text-sm font-semibold capitalize text-[#0c111d] transition duration-150 ease-out hover:bg-white/90"
              href="#waitlist"
            >
              Join our waitlist
            </a>
          </motion.div>

          <motion.div
            animate={contentVisible ? "visible" : "hidden"}
            className="grid gap-8 lg:grid-cols-[387px_1fr]"
            initial="hidden"
            transition={{ delayChildren: 0.1, staggerChildren: 0.08 }}
          >
            <motion.div
              className="relative min-h-[440px] overflow-hidden rounded-2xl border border-[#414167] bg-[#111827] lg:min-h-[541px]"
              transition={{ duration: 0.5, ease: "easeOut" }}
              variants={sectionReveal}
            >
              <img
                alt=""
                className="absolute inset-0 size-full object-cover opacity-70"
                src={figmaAssets.calculatorBg}
              />
              <img
                alt=""
                className="absolute inset-0 size-full object-cover"
                src={figmaAssets.calculatorHandMoney}
              />
            </motion.div>

            <motion.div className="flex flex-col justify-center gap-6" variants={sectionReveal}>
              {outcomes.map((item) => {
                const rows = outcomes.filter((outcome) => outcome.key !== expandedKey);
                const isLastRow = rows[rows.length - 1]?.key === item.key;

                if (item.key === expandedKey) {
                  return (
                    <motion.div
                      className="overflow-hidden rounded-2xl border border-[#2a2a49] px-5 py-6"
                      key={item.key}
                      layout
                      transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
                    >
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 14 }}
                        transition={{ delay: 0.16, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <img
                          alt=""
                          className="h-[66px] w-auto object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
                          src={item.key === "xaut" ? figmaAssets.calculatorGoldCoin : item.icon}
                        />
                        <p className="mt-3 text-[2rem] font-medium leading-none tracking-[-0.576px] text-white">
                          {formatNaira(item.result)}
                        </p>
                        <p className="mt-6 text-base font-medium leading-[23px] tracking-[-0.32px] text-white/60">
                          {item.label}
                        </p>
                        <p className="mt-3 text-pretty text-xl leading-[26px] tracking-[-0.32px] text-white">
                          {item.summary}
                        </p>
                      </motion.div>
                    </motion.div>
                  );
                }

                return (
                  <motion.button
                    className={cn(
                      "flex w-full cursor-pointer items-start justify-between gap-6 pb-3 text-left",
                      !isLastRow && "border-b border-[#414167]",
                    )}
                    key={item.key}
                    layout
                    onClick={() => setExpandedKey(item.key)}
                    onFocus={() => setExpandedKey(item.key)}
                    onMouseEnter={() => setExpandedKey(item.key)}
                    transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
                    type="button"
                  >
                    <motion.span
                      animate={{ opacity: 1 }}
                      className="flex w-full items-start justify-between gap-6"
                      initial={{ opacity: 0 }}
                      transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
                    >
                      <p className="text-base font-medium leading-[23px] tracking-[-0.32px] text-white/60">
                        {item.label}
                      </p>
                      <p className="text-2xl font-medium tracking-[-0.432px] text-white">
                        {formatNaira(item.result)}
                      </p>
                    </motion.span>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="overflow-hidden rounded-2xl border border-[#eeaafd]/70 bg-[#0f1430] shadow-2xl shadow-black/25"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={sectionReveal}
        >
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[397px_1fr] lg:p-16">
            <div className="flex flex-col justify-center">
              <h3 className="text-balance text-[2.35rem] font-semibold leading-[1.08] sm:text-5xl">
                What would your number look like?
              </h3>
              <label className="mt-8 block">
                <span className="mb-3 block text-sm font-medium text-white/70">Enter your amount</span>
                <span
                  className="flex min-h-[104px] items-center rounded-lg border border-white bg-transparent px-5 sm:px-6"
                  data-calculator-amount-field
                >
                  <span className="mr-3 text-6xl font-semibold leading-none sm:text-[4rem]">₦</span>
                  <input
                    aria-label="Amount saved in naira"
                    className="w-full bg-transparent text-4xl font-semibold leading-none tracking-[-0.02em] text-white outline-none placeholder:text-white/30 sm:text-5xl"
                    data-calculator-amount-input
                    inputMode="numeric"
                    onChange={onAmountChange}
                    value={amountInput}
                  />
                </span>
              </label>
              <p className="mt-4 text-pretty text-lg leading-7 text-white/76">
                Enter any amount. See the difference based on real 2021–2026 price movement.
              </p>
            </div>

            <div className="relative min-h-[430px] overflow-hidden rounded-2xl bg-[#111a3a] p-5 sm:min-h-[462px] sm:p-8">
              <div className="absolute inset-x-5 top-8 bottom-12 grid grid-cols-4 gap-3 border-b border-white/15 sm:inset-x-8 sm:gap-5">
                {outcomes.map((item) => (
                  <div
                    className="relative flex h-full items-end justify-center"
                    data-chart-scale={item.chartScale.toFixed(4)}
                    key={item.key}
                  >
                    <motion.div
                      animate={{
                        bottom: `calc(${(item.chartScale * 100).toFixed(3)}% - ${(
                          item.chartScale * chartLabelReserveRem
                        ).toFixed(3)}rem + 0.25rem)`,
                      }}
                      className="absolute left-1/2 z-20 flex w-[3.25rem] -translate-x-1/2 flex-col items-center text-center sm:w-max"
                      initial={false}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    >
                      <div className="flex size-9 items-center justify-center rounded-full bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.22)] ring-1 ring-white/35 sm:size-12">
                        <img alt="" className="size-6 sm:size-8" src={item.icon} />
                      </div>
                      <p className="mt-1.5 text-[0.68rem] font-semibold leading-none text-white sm:mt-2 sm:text-sm">
                        {item.label.replace("Held in ", "")}
                      </p>
                      <p className="mt-1 text-[0.66rem] font-semibold leading-none text-white/82 sm:text-xs">
                        <span className="sm:hidden">{formatCompactNaira(item.result)}</span>
                        <span className="hidden sm:inline">{formatNaira(item.result)}</span>
                      </p>
                    </motion.div>
                    <motion.div
                      aria-label={`${item.label}: ${formatNaira(item.result)}`}
                      className="calculator-bar relative h-[calc(100%-5.75rem)] w-full max-w-[123px] rounded-t-2xl"
                      animate={{ scaleY: item.chartScale }}
                      initial={{ scaleY: 0.18 }}
                      style={
                        {
                          "--bar-accent": item.accent,
                          transformOrigin: "bottom",
                        } as CSSProperties
                      }
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
