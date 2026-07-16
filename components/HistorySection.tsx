"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

type Milestone = {
  year: string;
  title: string;
  body: string;
  label: string;
};

// Placeholder body copy until real milestone stories are written.
const placeholderBody =
  "It started with a problem. That led to founding Facilitate FX, a business matching USD to NGN and NGN to USD on traditional rails.";

const milestones: Milestone[] = [
  {
    year: "2016",
    title: "Facilitate FX founded",
    body: placeholderBody,
    label: "USD-NGN traditional rails",
  },
  {
    year: "2019",
    title: "USD liquidity for stablecoin traders",
    body: placeholderBody,
    label: "USD liquidity for stablecoin traders",
  },
  {
    year: "2021",
    title: "Shiga founded, stablecoin trading",
    body: placeholderBody,
    label: "Shiga founded, stablecoin trading",
  },
  {
    year: "2023",
    title: "Celo Minipay accelerator runner-up",
    body: placeholderBody,
    label: "Celo Minipay accelerator runner-up",
  },
  {
    year: "2024",
    title: "V1 launched, $100M volume",
    body: placeholderBody,
    label: "V1 launched, $100M volume",
  },
  {
    year: "2025",
    title: "Tether investment and partnership",
    body: placeholderBody,
    label: "Tether investment and partnership",
  },
  {
    year: "2026",
    title: "Building deeper rails, scaling",
    body: placeholderBody,
    label: "Building deeper rails, scaling",
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

  /* One rAF timer drives the 8s progress and auto-advance; rAF stops in hidden
     tabs so progress pauses and resumes from where it was. Pointer position
     never resets it. */
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
      if (!inViewNow) return;

      progressRef.current = Math.min(1, progressRef.current + dt / ACTIVE_DURATION_MS);
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${progressRef.current})`;
      }
      if (progressRef.current >= 1) {
        setDirection(1);
        setActiveIndex((current) => (current + 1) % milestones.length);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeIndex, inViewNow, reducedMotion]);

  /* Keep the active year visible by scrolling the timeline track ONLY —
     never scrollIntoView, which can scroll the whole document (that was the
     bug that made fresh page loads open at this section). Skipped on the
     first render so mounting never moves anything. */
  const hasMounted = useRef(false);
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
    const wrapped = (targetIndex + milestones.length) % milestones.length;
    if (wrapped === activeIndex) return;
    setDirection(forcedDirection ?? (wrapped > activeIndex ? 1 : -1));
    progressRef.current = 0;
    if (fillRef.current) fillRef.current.style.transform = "scaleX(0)";
    setActiveIndex(wrapped);
  }

  const active = milestones[activeIndex];
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

        <div className="mx-auto mt-16 w-full max-w-[1200px] px-6 lg:px-0">
          <div className="relative h-[520px] sm:h-[420px] lg:h-[324px]">
            <AnimatePresence custom={direction} initial={false}>
              <motion.article
                animate="center"
                className="absolute inset-0 flex flex-col justify-between gap-6 rounded-xl bg-[rgba(222,240,255,0.2)] p-5 lg:flex-row lg:items-stretch lg:gap-8"
                custom={direction}
                exit="exit"
                initial="enter"
                key={activeIndex}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                variants={variants}
              >
                <div className="flex min-w-0 flex-1 flex-col justify-between text-white">
                  <p className="text-2xl leading-8">{active.year}</p>
                  <div className="flex flex-col gap-3">
                    <p className="text-2xl font-medium leading-8">{active.title}</p>
                    <p className="max-w-[582px] text-lg leading-7">{active.body}</p>
                  </div>
                </div>
                <div className="relative h-[180px] shrink-0 overflow-hidden rounded-2xl bg-white sm:h-full lg:w-[446px]">
                  <img
                    alt=""
                    className="absolute inset-0 size-full rounded-2xl object-cover"
                    src={figmaAssets.historyPhoto}
                  />
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>

        <div
          aria-label="History timeline"
          className="mx-auto mt-12 w-full max-w-[1200px] px-6 lg:px-0"
          role="tablist"
        >
          <div
            className="overflow-x-auto overflow-y-visible pb-2 [overscroll-behavior-inline:contain] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            ref={trackRef}
          >
            <div className="relative flex w-max gap-[30px] pr-6">
              {/* One continuous base line behind every marker — the markers and
                  the active progress fill sit on top of it, so there are no
                  gaps between years. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-[80px] h-px bg-white/40"
              />
              {milestones.map((milestone, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    aria-selected={isActive}
                    className="flex w-[260px] shrink-0 flex-col items-start gap-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:w-[350px]"
                    key={`${milestone.year}-${milestone.title}`}
                    onClick={() => goTo(index)}
                    role="tab"
                    type="button"
                  >
                    <p
                      className={cn(
                        "h-12 overflow-hidden text-base leading-6 transition-colors duration-300 [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]",
                        isActive ? "text-white" : "text-white/80",
                      )}
                    >
                      {milestone.label}
                    </p>
                    <span className="relative flex h-8 w-full items-center">
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 right-[-30px] top-1/2 h-px -translate-y-1/2 overflow-hidden"
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
                          isActive
                            ? "size-[10px] bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.3)]"
                            : "size-3 border-2 border-white bg-[#1482ba]",
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        "flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium leading-5 transition-colors duration-300",
                        isActive ? "bg-[#eff8ff] text-[#1849a9]" : "bg-[#f9fafb]/90 text-[#344054]",
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
      </motion.div>
    </section>
  );
}
