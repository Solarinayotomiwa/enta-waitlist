"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

type Milestone = {
  year: number;
  title: string;
  description: string;
  image: string;
};

/* Year cover images are expected at /images/history/<year>.<ext>. The folder
   is currently empty, so every item falls back to the shared placeholder —
   swap the image fields once the real 2016–2026 files are uploaded. */
const historyItems: Milestone[] = [
  {
    year: 2016,
    title: "Facilitate FX founded",
    description:
      "It started with a problem. That led to founding Facilitate FX, a business matching USD to NGN and NGN to USD on traditional rails.",
    image: figmaAssets.historyPhoto,
  },
  {
    year: 2019,
    title: "USD liquidity for Nigeria's first stablecoins",
    description: "Provided the USD liquidity behind the first stablecoin products in Nigeria.",
    image: figmaAssets.historyPhoto,
  },
  {
    year: 2021,
    title: "Shiga founded — OTC desk",
    description: "Shiga launches, starting life as an OTC desk.",
    image: figmaAssets.historyPhoto,
  },
  {
    year: 2023,
    title: "MiniPay accelerator",
    description:
      "A runner-up finish in the MiniPay accelerator — and the turn from a mobile-phone product to building technology.",
    image: figmaAssets.historyPhoto,
  },
  {
    year: 2024,
    title: "Stellar accelerator & Africa Growth Fund",
    description:
      "Selected for the Stellar accelerator and raised from the Africa Growth Fund; V1 goes live, crossing $100M in volume.",
    image: figmaAssets.historyPhoto,
  },
  {
    year: 2025,
    title: "Strategic partnership",
    description: "Tether investment and partnership, plus selection into Visa accelerator programmes.",
    image: figmaAssets.historyPhoto,
  },
  {
    year: 2026,
    title: "V2 launch — new product suite",
    description:
      "Rolling out the ENTA app — self-custodial Bitcoin, USD₮ and gold, with cross-border payments — alongside new infrastructure for our banking partners, as we build deeper rails and scale.",
    image: figmaAssets.historyPhoto,
  },
];

const ACTIVE_DURATION_MS = 8000;

type Direction = -1 | 1;

const slideVariants = {
  enter: (direction: Direction) => ({ opacity: 0, x: direction * 56 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: Direction) => ({ opacity: 0, x: direction * -56 }),
};

const fadeVariants = {
  enter: () => ({ opacity: 0, x: 0 }),
  center: { opacity: 1, x: 0 },
  exit: () => ({ opacity: 0, x: 0 }),
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-6", direction === "right" && "rotate-180")}
      fill="none"
      stroke="#101828"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M19 12H5m0 0 6 6m-6-6 6-6" />
    </svg>
  );
}

export function HistorySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const revealed = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
  const inViewNow = useInView(sectionRef, { amount: 0.3 });
  const contentVisible = Boolean(reducedMotion || revealed);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const progressRef = useRef(0);
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const hasMounted = useRef(false);

  /* One rAF timer drives the 8s segment scrub and auto-advance. It only runs
     once the section has revealed and is on screen; rAF stops in hidden tabs
     so progress pauses and resumes. Pointer position never resets it. */
  useEffect(() => {
    if (reducedMotion) return;

    progressRef.current = 0;
    let raf = 0;
    let last: number | null = null;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (last === null) {
        last = now;
        return;
      }
      const dt = Math.min(now - last, 100);
      last = now;
      if (!revealed || !inViewNow) return;

      progressRef.current = Math.min(1, progressRef.current + dt / ACTIVE_DURATION_MS);
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${progressRef.current})`;
      }
      if (progressRef.current >= 1) {
        setDirection(1);
        setActiveIndex((current) => (current + 1) % historyItems.length);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeIndex, inViewNow, reducedMotion, revealed]);

  /* Keep the active year visible by scrolling the timeline track ONLY — never
     the document. Skipped on first render so mounting can't move anything. */
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const track = trackRef.current;
    const column = track?.querySelectorAll<HTMLElement>('[role="tab"]')[activeIndex];
    if (!track || !column) return;
    const outOfView =
      column.offsetLeft < track.scrollLeft ||
      column.offsetLeft + column.offsetWidth > track.scrollLeft + track.clientWidth;
    if (outOfView) {
      track.scrollTo({ behavior: "smooth", left: Math.max(0, column.offsetLeft - 24) });
    }
  }, [activeIndex]);

  function goTo(targetIndex: number, forcedDirection?: Direction) {
    const wrapped = (targetIndex + historyItems.length) % historyItems.length;
    if (wrapped === activeIndex) return;
    setDirection(forcedDirection ?? (wrapped > activeIndex ? 1 : -1));
    progressRef.current = 0;
    if (fillRef.current) fillRef.current.style.transform = "scaleX(0)";
    setActiveIndex(wrapped);
  }

  const active = historyItems[activeIndex];
  const variants = reducedMotion ? fadeVariants : slideVariants;

  return (
    <section className="relative isolate overflow-hidden text-white" id="history" ref={sectionRef}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#175cd3]" />
        <img
          alt=""
          className="absolute inset-0 size-full object-cover object-bottom"
          src={figmaAssets.historySky}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <motion.div
        animate={contentVisible ? "visible" : "hidden"}
        className="relative z-10 py-20"
        initial="hidden"
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        variants={{ hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0 } }}
      >
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 lg:px-0">
          <h2 className="text-[2.6rem] font-semibold leading-[52px] tracking-[-0.018em] sm:text-[64px] sm:tracking-[-1.152px]">
            Our History
          </h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous milestone"
              className="flex size-12 items-center justify-center rounded-full bg-[#f9fafb] transition duration-150 ease-out hover:bg-white active:scale-[0.96]"
              onClick={() => goTo(activeIndex - 1, -1)}
              type="button"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              aria-label="Next milestone"
              className="flex size-12 items-center justify-center rounded-full bg-[#f9fafb] transition duration-150 ease-out hover:bg-white active:scale-[0.96]"
              onClick={() => goTo(activeIndex + 1, 1)}
              type="button"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        {/* Card viewport: the ONLY clipped region, so sliding content never
            spills, while the timeline below stays fully unclipped. */}
        <div className="mx-auto mt-16 w-full max-w-[1200px] px-6 lg:px-0">
          <div className="relative h-[520px] overflow-hidden rounded-xl sm:h-[420px] lg:h-[324px]">
            <AnimatePresence custom={direction} initial={false}>
              <motion.article
                animate="center"
                className="absolute inset-0 flex flex-col justify-between gap-6 rounded-xl bg-[rgba(222,240,255,0.2)] p-5 lg:flex-row lg:items-stretch lg:gap-8"
                custom={direction}
                exit="exit"
                id={`history-panel-${active.year}`}
                initial="enter"
                key={activeIndex}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                variants={variants}
              >
                <div className="flex min-w-0 flex-1 flex-col justify-between text-white">
                  <p className="text-2xl leading-8">{active.year}</p>
                  <div className="flex flex-col gap-3">
                    <p className="text-2xl font-medium leading-8">{active.title}</p>
                    <p className="max-w-[582px] text-lg leading-7">{active.description}</p>
                  </div>
                </div>
                <div className="relative h-[180px] shrink-0 overflow-hidden rounded-2xl bg-white sm:h-full lg:w-[446px]">
                  <img
                    alt=""
                    className="absolute inset-0 size-full rounded-2xl object-cover"
                    src={active.image}
                  />
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Exactly 24px between the card and the timeline; the timeline
              viewport clips nothing vertically. */}
          <div aria-label="History timeline" className="mt-6" role="tablist">
            <div
              className="overflow-x-auto pb-3 pt-1 [overscroll-behavior-inline:contain] [scrollbar-width:none] xl:overflow-visible [&::-webkit-scrollbar]:hidden"
              ref={trackRef}
            >
              <div className="relative flex w-max gap-6 px-1 xl:grid xl:w-full xl:grid-cols-7 xl:gap-4">
                {/* One continuous base line behind every marker. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-[64px] h-px bg-white/40"
                />
                {historyItems.map((milestone, index) => {
                  const state =
                    index === activeIndex ? "active" : index < activeIndex ? "completed" : "future";
                  return (
                    <button
                      aria-controls={`history-panel-${milestone.year}`}
                      aria-selected={state === "active"}
                      className="flex w-[240px] shrink-0 flex-col items-start gap-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/60 xl:w-auto"
                      key={milestone.year}
                      onClick={() => goTo(index)}
                      role="tab"
                      type="button"
                    >
                      <p
                        className={cn(
                          "h-10 overflow-hidden text-sm leading-5 transition-colors duration-300 [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]",
                          state === "future" ? "text-white/80" : "text-white",
                        )}
                      >
                        {milestone.title}
                      </p>
                      <span className="relative flex h-8 w-full items-center">
                        {/* Completed segments: solid white overlay across the
                            full segment (including the column gap). */}
                        {state === "completed" ? (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 right-[-24px] top-1/2 h-px -translate-y-1/2 bg-white xl:right-[-16px]"
                          />
                        ) : null}
                        {state === "active" && activeIndex < historyItems.length - 1 ? (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 right-[-24px] top-1/2 h-px -translate-y-1/2 overflow-hidden xl:right-[-16px]"
                          >
                            <span
                              className="absolute inset-0 origin-left bg-white"
                              ref={fillRef}
                              style={{ transform: "scaleX(0)" }}
                            />
                          </span>
                        ) : null}
                        {state === "active" && activeIndex === historyItems.length - 1 ? (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 overflow-hidden"
                          >
                            <span
                              className="absolute inset-0 origin-left bg-white"
                              ref={fillRef}
                              style={{ transform: "scaleX(0)" }}
                            />
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "relative z-10 rounded-full transition-all duration-300",
                            state === "active" &&
                              "size-3 border-2 border-white bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.3)]",
                            state === "completed" && "size-[10px] bg-white",
                            state === "future" && "size-3 border-2 border-white bg-[#1482ba]",
                          )}
                        />
                      </span>
                      <span
                        className={cn(
                          "flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium leading-5 backdrop-blur-[6px] transition-colors duration-300",
                          state === "active" && "bg-[#eff8ff] text-[#1849a9]",
                          state === "completed" && "bg-white/20 text-white",
                          state === "future" && "bg-[rgba(239,248,255,0.2)] text-white",
                        )}
                      >
                        {milestone.year}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
