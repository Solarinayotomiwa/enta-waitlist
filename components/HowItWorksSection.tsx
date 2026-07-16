"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

type Step = {
  title: string;
  body: string;
};

const steps: Step[] = [
  {
    title: "Start anywhere",
    body: "Fund your account with local currency, dollar stablecoins, or Bitcoin. There is no single required starting point.",
  },
  {
    title: "It all lives in one account",
    body: "Switch between dollars, Bitcoin, and gold without signing up for an exchange or moving between different apps.",
  },
  {
    title: "Then do whatever you need",
    body: "Hold it, spend it, send it abroad, or settle a payment — everything runs from the same account.",
  },
];

const AUTO_ADVANCE_MS = 7000;

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

const entryCards = [
  {
    heading: "Have local currency?",
    body: "Turn your naira, cedis, or shillings into dollars, Bitcoin, or gold in a few taps.",
    image: figmaAssets.howEntryLocal,
    panelBg: "#dcfae6",
    emphasized: false,
  },
  {
    heading: "Already hold dollars?",
    body: "Bring your USDT or USDC straight in and put it to work right away.",
    image: figmaAssets.howEntryDollars,
    panelBg: "#ebe9fe",
    emphasized: true,
  },
  {
    heading: "Own Bitcoin?",
    body: "Move it in and manage it alongside everything else, in one place.",
    image: figmaAssets.howEntryBitcoin,
    panelBg: "#fbe8ff",
    emphasized: false,
  },
] as const;

const actionCards = [
  {
    icon: figmaAssets.howIconCardholder,
    title: "Hold it",
    body: "Preserve value in the form that suits you.",
  },
  {
    icon: figmaAssets.howIconHandCoins,
    title: "Spend it",
    body: "Use your assets whenever you need them.",
  },
  {
    icon: figmaAssets.howIconPaperPlane,
    title: "Send abroad",
    body: "Move money internationally.",
  },
  {
    icon: figmaAssets.howIconScroll,
    title: "Settle a payment",
    body: "Complete all payments from one account.",
  },
] as const;

const panelSwap = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};

function EntryPointsPanel() {
  return (
    <div className="flex size-full items-center justify-center p-5 lg:p-0">
      <div className="flex w-full flex-col items-center justify-center gap-4 lg:w-[554px] lg:gap-6">
        {entryCards.map((card) => (
          <div
            className={cn(
              "flex items-stretch overflow-hidden bg-white",
              card.emphasized
                ? "w-full gap-6 rounded-xl"
                : "w-full gap-[21.12px] rounded-[10.56px] lg:w-[487.52px]",
            )}
            key={card.heading}
          >
            <div
              className={cn(
                "relative shrink-0 self-stretch overflow-hidden",
                card.emphasized ? "w-[104px] sm:w-[142px]" : "w-[92px] sm:w-[124.96px]",
              )}
              style={{ backgroundColor: card.panelBg }}
            >
              <img
                alt=""
                className={cn(
                  "absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-cover",
                  card.emphasized
                    ? "h-[169px] w-[136px] -translate-x-[calc(50%+2.5px)]"
                    : "h-[148.72px] w-[119.35px] -translate-x-[calc(50%+2.4px)]",
                )}
                src={card.image}
              />
            </div>
            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col",
                card.emphasized ? "gap-1 py-6 pr-6" : "gap-[3.52px] py-[21.12px] pr-[21.12px]",
              )}
            >
              <p
                className={cn(
                  "font-medium text-[#53b1fd]",
                  card.emphasized
                    ? "text-lg leading-[27px] sm:text-xl sm:leading-[30px]"
                    : "text-base leading-6 sm:text-[17.6px] sm:leading-[26.4px]",
                )}
              >
                {card.heading}
              </p>
              <p
                className={cn(
                  "font-medium text-[#101828]",
                  card.emphasized
                    ? "text-lg leading-[27px] sm:text-xl sm:leading-[30px]"
                    : "text-base leading-6 sm:text-[17.6px] sm:leading-[26.4px]",
                )}
              >
                {card.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="size-full p-5 lg:p-0">
      <img
        alt="Enta account dashboard showing wallet balances and recent activity"
        className="size-full rounded-lg object-cover object-left-top lg:absolute lg:left-[42px] lg:top-[44px] lg:h-[576px] lg:w-[678px] lg:max-w-none lg:rounded-none lg:object-contain"
        src={figmaAssets.howDashboard}
      />
    </div>
  );
}

function ActionsPanel() {
  return (
    <div className="flex size-full items-center justify-center p-5 lg:p-0">
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:absolute lg:left-[38px] lg:top-[94px] lg:h-[432px] lg:w-[643px] lg:gap-x-3 lg:gap-y-4">
        {actionCards.map((card) => (
          <div
            className="flex min-h-[160px] flex-col justify-between rounded-[9.862px] bg-white px-5 py-6 lg:h-[208px] lg:min-h-0"
            key={card.title}
          >
            <img alt="" className="size-8" src={card.icon} />
            <div>
              <p className="text-lg font-medium leading-7 text-[#101828]">{card.title}</p>
              <p className="text-sm leading-5 text-[#101828]">{card.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const stepPanels = [EntryPointsPanel, DashboardPanel, ActionsPanel] as const;

function StepRow({
  active,
  index,
  onSelect,
  step,
}: {
  active: boolean;
  index: number;
  onSelect: () => void;
  step: Step;
}) {
  return (
    <div
      className={cn(
        "w-full border-t pb-1 pt-[23px] transition-colors duration-300",
        active ? "border-t-white" : "border-t-[0.5px] border-t-[#667085]",
      )}
    >
      <button
        aria-expanded={active}
        className="flex w-full items-center gap-2 text-left"
        onClick={onSelect}
        type="button"
      >
        <span
          className={cn(
            "text-[22px] leading-[26.4px] transition-colors duration-300 sm:text-[28px] sm:leading-[33.6px]",
            active ? "font-medium text-white" : "font-normal text-[#667085]",
          )}
        >
          {step.title}
        </span>
        <span
          className={cn(
            "flex-1 text-right text-base leading-[30px] transition-colors duration-300 [font-family:var(--font-plex-mono),'IBM_Plex_Mono',monospace]",
            active ? "text-white" : "text-[#667085]",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {active ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="max-w-[419px] pt-2 text-lg leading-[27px] text-white sm:text-xl sm:leading-[30px]">
              {step.body}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "220px", once: true });
  const inViewNow = useInView(sectionRef, { amount: 0.35 });
  const contentVisible = Boolean(reducedMotion || isInView);
  const motionActive = isInView && !reducedMotion;

  const [activeStep, setActiveStep] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  useEffect(() => {
    if (!autoAdvance || !inViewNow || reducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(interval);
  }, [autoAdvance, inViewNow, reducedMotion]);

  function selectStep(index: number) {
    setAutoAdvance(false);
    setActiveStep(index);
  }

  const ActivePanel = stepPanels[activeStep];

  return (
    <section
      className={cn(
        "how-section relative isolate overflow-x-clip bg-[#0d101d] px-6 py-24 text-white sm:py-[120px] lg:px-0",
        motionActive && "motion-active",
      )}
      id="how-it-works"
      ref={sectionRef}
    >
      <div aria-hidden="true" className="how-section-glow" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-14 lg:h-[620px] lg:flex-row lg:gap-14">
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="flex w-full flex-col justify-between pt-4 lg:w-[424px] lg:shrink-0"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-[2.35rem] font-medium leading-[1.08] tracking-[-0.018em] text-white sm:text-[48px] sm:leading-[52px] sm:tracking-[-0.864px]">
              How it works
            </h2>
            <p className="max-w-[419px] pb-1 text-pretty text-xl leading-[30px] text-white/80">
              Start with local fiat or USDT and move into any supported asset in a few steps.
            </p>
          </div>
          <div className="mt-12 flex flex-col gap-6 pb-6 lg:mt-0">
            {steps.map((step, index) => (
              <StepRow
                active={index === activeStep}
                index={index}
                key={step.title}
                onSelect={() => selectStep(index)}
                step={step}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="relative min-h-[420px] w-full flex-1 overflow-hidden rounded-2xl bg-white lg:min-h-0"
          initial="hidden"
          transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full rounded-2xl object-cover"
            src={figmaAssets.howGradientBg}
          />
          <AnimatePresence initial={false}>
            <motion.div
              animate="visible"
              className="absolute inset-0"
              exit="exit"
              initial="hidden"
              key={activeStep}
              transition={{ duration: reducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              variants={panelSwap}
            >
              <ActivePanel />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
