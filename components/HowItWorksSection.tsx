"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const STEP_DURATION_MS = 3000;
const COMPLETE_HOLD_MS = 150;

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
  },
  {
    heading: "Already hold dollars?",
    body: "Bring your USD₮ or USDC straight in and put it to work right away.",
    image: figmaAssets.howEntryDollars,
    panelBg: "#ebe9fe",
  },
  {
    heading: "Own Bitcoin?",
    body: "Move it in and manage it alongside everything else, in one place.",
    image: figmaAssets.howEntryBitcoin,
    panelBg: "#fbe8ff",
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

/* "Start anywhere": cards render at their exact Figma sizes — the highlighted
   card is the full-width 554px variant (142px icon panel, 20px text, 12px
   radius), the resting cards the 487.52px variant. Framer's layout animation
   moves the emphasis between cards; hovering or focusing another card hands it
   the highlighted treatment, the middle card holds it by default. */
function EntryPointsPanel() {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? 1;

  return (
    <div className="flex size-full items-center justify-center p-5 lg:p-0">
      <div
        className="flex w-full flex-col items-center justify-center gap-4 lg:w-[554px] lg:gap-6"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setHovered(null);
        }}
        onMouseLeave={() => setHovered(null)}
      >
        {entryCards.map((card, index) => {
          const isActive = index === active;
          return (
            <motion.div
              className={cn(
                "flex w-full items-stretch overflow-hidden bg-white outline-none",
                isActive
                  ? "z-10 gap-6 rounded-xl"
                  : "gap-[21.12px] rounded-[10.56px] lg:w-[487.52px]",
              )}
              key={card.heading}
              layout
              onFocus={() => setHovered(index)}
              onMouseEnter={() => setHovered(index)}
              tabIndex={0}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className={cn(
                  "relative shrink-0 self-stretch overflow-hidden",
                  isActive ? "w-[104px] sm:w-[142px]" : "w-[92px] sm:w-[124.96px]",
                )}
                layout
                style={{ backgroundColor: card.panelBg }}
              >
                <motion.img
                  alt=""
                  className={cn(
                    "absolute left-1/2 top-1/2 max-w-none -translate-x-[calc(50%+2.5px)] -translate-y-1/2 object-cover",
                    isActive ? "h-[169px] w-[136px]" : "h-[148.72px] w-[119.35px]",
                  )}
                  layout
                  src={card.image}
                />
              </motion.div>
              <motion.div
                className={cn(
                  "flex min-w-0 flex-1 flex-col",
                  isActive ? "gap-1 py-6 pr-6" : "gap-[3.52px] py-[21.12px] pr-[21.12px]",
                )}
                layout
              >
                <motion.p
                  className={cn(
                    "font-medium text-[#53b1fd]",
                    isActive
                      ? "text-lg leading-[27px] sm:text-xl sm:leading-[30px]"
                      : "text-base leading-6 sm:text-[17.6px] sm:leading-[26.4px]",
                  )}
                  layout
                >
                  {card.heading}
                </motion.p>
                <motion.p
                  className={cn(
                    "font-medium text-[#101828]",
                    isActive
                      ? "text-lg leading-[27px] sm:text-xl sm:leading-[30px]"
                      : "text-base leading-6 sm:text-[17.6px] sm:leading-[26.4px]",
                  )}
                  layout
                >
                  {card.body}
                </motion.p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="size-full p-5 lg:p-0">
      <div
        className="size-full outline-none transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.015] focus-visible:-translate-y-1 focus-visible:scale-[1.015] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 lg:absolute lg:left-[42px] lg:top-[44px] lg:h-[576px] lg:w-[678px]"
        tabIndex={0}
      >
        <img
          alt="Enta account dashboard showing wallet balances and recent activity"
          className="size-full rounded-lg object-cover object-left-top"
          src={figmaAssets.accountDashboardHd}
        />
      </div>
    </div>
  );
}

function ActionsPanel() {
  return (
    <div className="flex size-full items-center justify-center p-5 lg:p-0">
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:absolute lg:left-[38px] lg:top-[94px] lg:h-[432px] lg:w-[643px] lg:gap-x-3 lg:gap-y-4">
        {actionCards.map((card) => (
          <div
            className="flex min-h-[160px] flex-col justify-between rounded-[9.862px] bg-white px-5 py-6 outline-none transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.025] focus-visible:-translate-y-1 focus-visible:scale-[1.025] focus-visible:ring-2 focus-visible:ring-[#53b1fd] lg:h-[208px] lg:min-h-0"
            key={card.title}
            tabIndex={0}
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
  fillRef,
  index,
  onSelect,
  step,
}: {
  active: boolean;
  fillRef: (node: HTMLSpanElement | null) => void;
  index: number;
  onSelect: () => void;
  step: Step;
}) {
  return (
    <div className="w-full pb-1">
      {active ? (
        <span aria-hidden="true" className="relative block h-px w-full bg-white/30">
          <span
            className="absolute inset-0 origin-left bg-white"
            ref={fillRef}
            style={{ transform: "scaleX(0)" }}
          />
        </span>
      ) : (
        <span aria-hidden="true" className="block h-px w-full bg-transparent shadow-[0_0.5px_0_0_#667085]" />
      )}
      <button
        aria-expanded={active}
        className="mt-[22px] flex w-full items-center gap-2 text-left"
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
  const isInView = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
  const inViewNow = useInView(sectionRef, { amount: 0.35 });
  const contentVisible = Boolean(reducedMotion || isInView);
  const motionActive = isInView && !reducedMotion;

  const [activeStep, setActiveStep] = useState(0);
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const progressRef = useRef(0);
  /* 1 = normal speed (3000ms per step); 0.6 while hovered/focused so the
     effective duration becomes exactly 5000ms. Delta-time based, so speed
     changes continue smoothly from the current progress with no jump. */
  const speedRef = useRef(1);

  const setFillNode = useCallback((node: HTMLSpanElement | null) => {
    fillRef.current = node;
    if (node) node.style.transform = `scaleX(${progressRef.current})`;
  }, []);

  /* One rAF-driven timer owns the progress value, the fill visual, and the
     step switch, so the counter and the displayed content can never drift
     apart. rAF stops in hidden tabs (auto-pause); hover/focus slow the timer
     to 70% via speedRef; progress always continues from its current value. */
  useEffect(() => {
    if (reducedMotion) return;

    progressRef.current = 0;
    let raf = 0;
    let last: number | null = null;
    let holdUntil: number | null = null;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (last === null) {
        last = now;
        return;
      }
      const dt = Math.min(now - last, 100);
      last = now;

      if (!inViewNow) return;

      if (holdUntil !== null) {
        if (now >= holdUntil) {
          setActiveStep((current) => (current + 1) % steps.length);
        }
        return;
      }

      progressRef.current = Math.min(
        1,
        progressRef.current + (dt * speedRef.current) / STEP_DURATION_MS,
      );
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${progressRef.current})`;
      }
      if (progressRef.current >= 1) {
        holdUntil = now + COMPLETE_HOLD_MS;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeStep, inViewNow, reducedMotion]);

  function selectStep(index: number) {
    progressRef.current = 0;
    if (fillRef.current) fillRef.current.style.transform = "scaleX(0)";
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
      <div
        className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-14 lg:h-[620px] lg:flex-row lg:gap-14"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) speedRef.current = 1;
        }}
        onFocus={() => {
          speedRef.current = 0.6;
        }}
        onMouseEnter={() => {
          speedRef.current = 0.6;
        }}
        onMouseLeave={() => {
          speedRef.current = 1;
        }}
      >
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
              Start with local fiat or USD₮ and move into any supported asset in a few steps.
            </p>
          </div>
          <div className="mt-12 flex flex-col gap-6 pb-6 lg:mt-0">
            {steps.map((step, index) => (
              <StepRow
                active={index === activeStep}
                fillRef={setFillNode}
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
          transition={{ delay: 0.06, duration: 0.55, ease: "easeOut" }}
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
              transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
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
