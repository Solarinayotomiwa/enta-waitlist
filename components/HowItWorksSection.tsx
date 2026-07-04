"use client";

import { CSSProperties, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

type Step = {
  title: string;
  body: string;
  from: string;
  to: string;
  fromAmount: string;
  toAmount: string;
  metaFrom: string;
  metaTo: string;
  delay: number;
};

const steps: Step[] = [
  {
    title: "Fiat to USD₮",
    body: "Convert your local currency into USD₮ in seconds. Preserve your purchasing power and move money across borders without correspondent banking.",
    from: "NGN",
    to: "USD₮",
    fromAmount: "200,000",
    toAmount: "125",
    metaFrom: "$0 fee",
    metaTo: "0.000625 rate",
    delay: 0,
  },
  {
    title: "USD₮ to fiat",
    body: "Cash out USD₮ to your local currency with direct payouts to bank accounts from virtual accounts in your own name. Fast settlement at transparent rates.",
    from: "USD₮",
    to: "NGN",
    fromAmount: "125",
    toAmount: "200,000",
    metaFrom: "No hidden spread",
    metaTo: "Local settlement",
    delay: 0.05,
  },
  {
    title: "Purchase digital assets",
    body: "Instantly buy and sell gold and Bitcoin straight from your local currency. Hold a store of value or take profit in one tap, no extra accounts required.",
    from: "NGN",
    to: "BTC",
    fromAmount: "200,000",
    toAmount: "0.0014",
    metaFrom: "$0 fee",
    metaTo: "Live quote",
    delay: 0.1,
  },
  {
    title: "Embedded swaps",
    body: "Swap between digital assets across multiple chains without leaving the app. Move between USD₮, gold, and BTC with built-in multichain conversion at competitive rates.",
    from: "USD₮",
    to: "XAU₮",
    fromAmount: "125",
    toAmount: "0.040",
    metaFrom: "Multichain",
    metaTo: "Best route",
    delay: 0.15,
  },
  {
    title: "Payment links",
    body: "Accept crypto payments without ever holding crypto. Share a link, get paid, and receive settlement directly in the currency you choose.",
    from: "USD₮",
    to: "NGN",
    fromAmount: "125",
    toAmount: "200,000",
    metaFrom: "Payment received",
    metaTo: "Bank payout",
    delay: 0.2,
  },
];

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

function CurrencyPicker({ label, icon }: { icon: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg py-1.5 text-sm font-semibold text-[#1849a9]">
      <img alt="" className="size-5" src={icon} />
      <span>{label}</span>
      <img alt="" className="size-5" src={figmaAssets.howCaretDown} />
    </div>
  );
}

function ExchangeRow({
  amount,
  icon,
  label,
  meta,
  title,
}: {
  amount: string;
  icon: string;
  label: string;
  meta: string;
  title: string;
}) {
  return (
    <div className="flex min-h-[76px] items-start justify-between rounded-lg bg-white p-4 shadow-[0_4px_4px_rgba(16,24,40,0.1),0_2px_2px_rgba(16,24,40,0.06)]">
      <div>
        <p className="text-sm font-medium leading-5 text-[#344054]">{title}</p>
        <CurrencyPicker icon={icon} label={label} />
      </div>
      <div className="text-right">
        <p className="text-xl leading-[1.5] text-[#101828]">{amount}</p>
        <p className="text-xs leading-[1.5] text-[#667085]">{meta}</p>
      </div>
    </div>
  );
}

function FlowPreview({ step }: { step: Step }) {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden rounded-xl">
      <img alt="" className="absolute inset-0 size-full object-cover" src={figmaAssets.howCardBg} />
      <div className="how-preview-panel relative z-10 flex w-[325px] max-w-[88%] flex-col gap-2">
        <ExchangeRow
          amount={step.fromAmount}
          icon={step.from === "NGN" ? figmaAssets.howFromCurrency : figmaAssets.howToCurrency}
          label={step.from}
          meta={step.metaFrom}
          title="From"
        />
        <ExchangeRow
          amount={step.toAmount}
          icon={step.to === "NGN" ? figmaAssets.howFromCurrency : figmaAssets.howToCurrency}
          label={step.to}
          meta={step.metaTo}
          title="To"
        />
        <motion.div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-[#175cd3] shadow-[0_10px_26px_rgba(23,92,211,0.35)]"
          whileHover={{ rotate: 180, scale: 1.08 }}
        >
          <img alt="" className="size-5" src={figmaAssets.howSwap} />
        </motion.div>
      </div>
    </div>
  );
}

function StepCard({ step, visible }: { step: Step; visible: boolean }) {
  return (
    <motion.article
      animate={visible ? "visible" : "hidden"}
      className="group relative overflow-hidden rounded-xl"
      initial="hidden"
      transition={{ delay: step.delay, duration: 0.55, ease: "easeOut" }}
      variants={reveal}
    >
      <div className="h-[220px] overflow-hidden rounded-xl sm:h-[240px]">
        <FlowPreview step={step} />
      </div>
      <div className="rounded-b-xl px-2 pb-2 pt-6">
        <p className="text-base font-medium leading-[1.4] tracking-[-0.02em] text-[#53b1fd]">{step.title}</p>
        <p className="mt-3 text-pretty text-lg leading-[1.32] tracking-[-0.014em] text-white sm:text-xl">
          {step.body}
        </p>
      </div>
    </motion.article>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "220px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);
  const motionActive = isInView && !reducedMotion;

  return (
    <section
      className={cn(
        "how-section relative isolate overflow-hidden bg-[#0d101d] px-6 py-24 text-white sm:py-[120px] lg:overflow-visible lg:px-0",
        motionActive && "motion-active",
      )}
      id="how-it-works"
      ref={sectionRef}
    >
      <div aria-hidden="true" className="how-section-glow" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] gap-14 lg:grid-cols-[1fr_600px] lg:gap-16">
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="max-w-[370px] lg:sticky lg:top-[30vh] lg:self-start"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <h2 className="text-balance text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.018em] sm:text-5xl">
            How it works
          </h2>
          <p className="mt-4 max-w-[336px] text-pretty text-base leading-[1.4] tracking-[-0.02em] text-white/78">
            Start with local fiat or USD₮ and move into any supported asset in a few steps.
          </p>
        </motion.div>

        <div className="flex flex-col gap-16">
          {steps.map((step) => (
            <StepCard key={step.title} step={step} visible={contentVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
