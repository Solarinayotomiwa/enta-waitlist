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
  barText: string;
  summary: string;
};

const assetOutcomes: AssetOutcome[] = [
  {
    key: "naira",
    label: "Held in naira",
    multiplier: 1,
    icon: figmaAssets.calculatorChartNaira,
    accent: "#e6e7e7",
    barText: "#0d101d",
    summary: "Still ₦6M. But worth 63% less in purchasing power than when you saved it.",
  },
  {
    key: "usdt",
    label: "Held in USDT",
    multiplier: 2.71,
    icon: figmaAssets.calculatorChartUsdt,
    accent: "#00e56b",
    barText: "#0d101d",
    summary:
      "A digital dollar that holds its value. Your savings, shielded from naira devaluation.",
  },
  {
    key: "bitcoin",
    label: "Held in Bitcoin",
    multiplier: 3.15,
    icon: figmaAssets.calculatorChartBtc,
    accent: "#ec8503",
    barText: "#0d101d",
    summary:
      "The hardest money ever made. 21 million forever — against a naira that only expands.",
  },
  {
    key: "xaut",
    label: "Held in Gold",
    multiplier: 3.7666667,
    icon: figmaAssets.calculatorChartXaut,
    accent: "#f9bd03",
    barText: "#fffefe",
    summary:
      "Five thousand years as the ultimate store of value. Now able to be held without the custody and counterfeit risks.",
  },
];

const defaultAmount = 6000000;
const minAmount = 1;
const maxAmount = 1000000000;
const minVisibleBarScale = 0.08;

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
  const isInView = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
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

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-20 lg:gap-[200px]">
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
              href="#waitlist-form"
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
                src={figmaAssets.calculatorHandMoneyMulti}
              />
            </motion.div>

            <motion.div className="flex flex-col justify-center gap-6" variants={sectionReveal}>
              {outcomes.map((item) => {
                const rows = outcomes.filter((outcome) => outcome.key !== expandedKey);
                const isLastRow = rows[rows.length - 1]?.key === item.key;

                if (item.key === expandedKey) {
                  return (
                    <motion.div
                      className="min-h-[324px] overflow-hidden rounded-2xl border border-[#2a2a49] px-5 py-6"
                      key={item.key}
                      layout
                      transition={{ layout: { duration: 0.38, ease: [0.32, 0.72, 0, 1] } }}
                    >
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 8 }}
                        transition={{ delay: 0.05, duration: 0.3, ease: "easeOut" }}
                      >
                        <img
                          alt=""
                          className="h-[66px] w-auto object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
                          src={item.icon}
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
                    transition={{ layout: { duration: 0.38, ease: [0.32, 0.72, 0, 1] } }}
                    type="button"
                  >
                    <motion.span
                      animate={{ opacity: 1 }}
                      className="flex w-full items-start justify-between gap-6"
                      initial={{ opacity: 0 }}
                      transition={{ delay: 0.04, duration: 0.25, ease: "easeOut" }}
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
          className="overflow-hidden rounded-2xl border-[3px] border-[#eeaafd]"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={sectionReveal}
        >
          <div className="grid gap-10 p-6 sm:p-10 lg:h-[624px] lg:grid-cols-[397px_1fr] lg:items-center lg:gap-[50px] lg:py-0 lg:pl-16 lg:pr-[21px]">
            <div className="flex flex-col justify-center">
              <h3 className="text-balance text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.018em] sm:text-5xl sm:leading-[52px]">
                What would your number look like?
              </h3>
              <label className="mt-6 block">
                <span
                  className="flex items-center rounded-lg border border-white bg-black/20 py-4 pl-[23px] pr-5 sm:py-5"
                  data-calculator-amount-field
                >
                  <span className="mr-1 text-4xl font-semibold leading-none sm:text-[48px] sm:leading-[60px] sm:tracking-[-0.96px]">
                    ₦
                  </span>
                  <input
                    aria-label="Amount saved in naira"
                    className="w-full bg-transparent text-4xl font-semibold leading-none tracking-[-0.96px] text-white outline-none placeholder:text-white/30 sm:text-[48px] sm:leading-[60px]"
                    data-calculator-amount-input
                    inputMode="numeric"
                    onChange={onAmountChange}
                    value={amountInput}
                  />
                </span>
              </label>
              <p className="mt-4 text-pretty text-xl leading-[27px] tracking-[-0.32px] text-white/80">
                Enter any amount. See the difference based on real 2021–2026 prices.
              </p>
            </div>

            <div className="relative min-h-[430px] overflow-hidden rounded-[11px] bg-[#111a3a] lg:h-[430px]">
              <div className="absolute inset-x-5 top-14 bottom-10 grid grid-cols-4 gap-3 sm:inset-x-[34px] sm:top-[81px] sm:bottom-[64px] sm:gap-[18px]">
                {outcomes.map((item, index) => (
                  <div
                    className="relative flex h-full items-end justify-center"
                    data-chart-scale={item.chartScale.toFixed(4)}
                    key={item.key}
                  >
                    {index > 0 ? (
                      <img
                        alt=""
                        aria-hidden="true"
                        className="absolute -left-[7px] top-0 h-full w-px sm:-left-[10px]"
                        src={figmaAssets.calculatorChartDivider}
                      />
                    ) : null}
                    <motion.div
                      animate={{
                        bottom: `calc(${(item.chartScale * 100).toFixed(3)}% + 8px)`,
                      }}
                      className="absolute left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-center"
                      initial={false}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    >
                      <p className="whitespace-nowrap text-[10.6px] font-normal leading-4 text-white">
                        {item.label}
                      </p>
                      <img alt="" className="size-7" src={item.icon} />
                    </motion.div>
                    <motion.div
                      aria-label={`${item.label}: ${formatNaira(item.result)}`}
                      animate={{ height: `${(item.chartScale * 100).toFixed(3)}%` }}
                      className="relative w-full max-w-[123px] cursor-pointer overflow-hidden rounded-[11px]"
                      initial={{ height: "18%" }}
                      style={
                        {
                          background: item.accent,
                          transformOrigin: "bottom",
                        } as CSSProperties
                      }
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      whileHover={{ scale: 1.03, filter: "brightness(1.12)" }}
                    >
                      <p
                        className="absolute inset-x-1 bottom-2 text-center text-[11px] font-medium tracking-[-0.31px] sm:bottom-[14px] sm:text-[17.25px]"
                        style={{ color: item.barText }}
                      >
                        <span className="sm:hidden">{formatCompactNaira(item.result)}</span>
                        <span className="hidden sm:inline">{formatNaira(item.result)}</span>
                      </p>
                    </motion.div>
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
