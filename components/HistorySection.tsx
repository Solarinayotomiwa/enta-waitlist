"use client";

import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

type Milestone = {
  year: string;
  title: string;
  body: string;
};

// Placeholder body copy until real milestone stories are written.
const placeholderBody =
  "When it comes to facilitating transactions between the US dollar (USD) and the Nigerian naira (NGN).";

const milestones: Milestone[] = [
  { year: "2016", title: "USD-NGN traditional rails", body: placeholderBody },
  { year: "2019", title: "USD liquidity for stablecoin traders", body: placeholderBody },
  { year: "2021", title: "Shiga founded, stablecoin trading", body: placeholderBody },
  { year: "2023", title: "Celo Minipay accelerator runner-up", body: placeholderBody },
  { year: "2024", title: "Stellar accelerator, Africa Growth Fund", body: placeholderBody },
  { year: "2024", title: "V1 launched, $100M volume", body: placeholderBody },
  { year: "2025", title: "Tether investment and partnership", body: placeholderBody },
  { year: "2026", title: "Building deeper rails, scaling", body: placeholderBody },
];

const tickCount = 16;

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

function MilestoneColumn({
  active,
  milestone,
  onActivate,
}: {
  active: boolean;
  milestone: Milestone;
  onActivate: () => void;
}) {
  const ticksRef = useRef<HTMLDivElement | null>(null);

  function handleTickMove(event: ReactMouseEvent<HTMLDivElement>) {
    const wrap = ticksRef.current;
    if (!wrap) return;

    for (const tick of Array.from(wrap.children) as HTMLElement[]) {
      const rect = tick.getBoundingClientRect();
      const distance = Math.abs(event.clientX - (rect.left + rect.width / 2));
      const boost = Math.max(0, 1 - distance / 110);
      tick.style.transform = boost > 0 ? `scaleY(${(1 + boost * 0.5).toFixed(3)})` : "";
    }
  }

  function handleTickLeave() {
    const wrap = ticksRef.current;
    if (!wrap) return;

    for (const tick of Array.from(wrap.children) as HTMLElement[]) {
      tick.style.transform = "";
    }
  }

  return (
    <div
      className={cn(
        "flex h-[532px] w-[334px] shrink-0 items-start gap-8 transition-opacity duration-300 ease-out",
        active ? "opacity-100" : "opacity-70",
      )}
      onFocus={onActivate}
      onMouseEnter={onActivate}
      onMouseLeave={handleTickLeave}
      tabIndex={0}
    >
      <span
        aria-hidden="true"
        className={cn(
          "w-[1.5px] shrink-0 bg-gradient-to-b from-white/80 to-transparent transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          active ? "h-full" : "h-[115px]",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[64px] font-normal leading-[52px] tracking-[-1.152px] text-white">
          {milestone.year}
        </p>
        <p
          className={cn(
            "mt-[19px] truncate text-lg leading-7 text-white",
            active ? "font-semibold" : "font-medium",
          )}
        >
          {milestone.title}
        </p>
        <div
          aria-hidden="true"
          className="mt-[42px] flex h-[115px] items-start justify-between pr-1"
          onMouseLeave={handleTickLeave}
          onMouseMove={handleTickMove}
          ref={ticksRef}
        >
          {Array.from({ length: tickCount }, (_, tick) => (
            <span
              className={cn(
                "history-tick h-full w-[1.5px] bg-gradient-to-b to-transparent",
                active ? "from-white" : "from-white/80",
              )}
              key={tick}
            />
          ))}
        </div>
        <div
          className={cn(
            "mt-10 w-[394px] max-w-[80vw] transition-[opacity,transform] duration-300 ease-out",
            active
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0",
          )}
        >
          <p className="text-base font-medium leading-6 text-white">{milestone.body}</p>
          <img
            alt=""
            className="mt-6 h-[164px] w-[261px] bg-white object-cover"
            src={figmaAssets.historyPlaceholder}
          />
        </div>
      </div>
    </div>
  );
}

export function HistorySection() {
  const [activeIndex, setActiveIndex] = useState(2);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const edgeSpeedRef = useRef(0);
  const edgeTimerRef = useRef<number | undefined>(undefined);
  const edgeStepRef = useRef(0);

  useEffect(() => {
    // Match the design frame's initial crop: the track starts mid-scroll.
    if (trackRef.current) trackRef.current.scrollLeft = 303;

    return () => {
      if (edgeTimerRef.current !== undefined) window.clearInterval(edgeTimerRef.current);
    };
  }, []);

  function scrollByColumn(direction: 1 | -1) {
    trackRef.current?.scrollBy({ behavior: "smooth", left: direction * 362 });
  }

  function handleEdgeMove(event: ReactMouseEvent<HTMLElement>) {
    // Edge zones advance the timeline in smooth chunks while the cursor stays nearby.
    const zone = 180;
    const width = window.innerWidth;
    let direction: 1 | -1 | 0 = 0;

    if (event.clientX < zone) {
      direction = -1;
    } else if (event.clientX > width - zone) {
      direction = 1;
    }

    edgeSpeedRef.current = direction;

    if (direction !== 0 && edgeTimerRef.current === undefined) {
      edgeStepRef.current = 0;
      trackRef.current?.scrollBy({ behavior: "smooth", left: direction * 280 });

      edgeTimerRef.current = window.setInterval(() => {
        const track = trackRef.current;

        if (!track || edgeSpeedRef.current === 0) {
          window.clearInterval(edgeTimerRef.current);
          edgeTimerRef.current = undefined;
          edgeStepRef.current = 0;
          return;
        }

        edgeStepRef.current += 1;

        const distance = edgeStepRef.current >= 2 ? 520 : 280;
        track.scrollBy({ behavior: "smooth", left: edgeSpeedRef.current * distance });
      }, 520);
    }
  }

  function handleEdgeLeave() {
    edgeSpeedRef.current = 0;
    edgeStepRef.current = 0;
  }

  return (
    <section
      className="relative isolate overflow-hidden text-white"
      id="history"
      onMouseLeave={handleEdgeLeave}
      onMouseMove={handleEdgeMove}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#175cd3]" />
        <img
          alt=""
          className="absolute inset-0 size-full object-cover object-bottom"
          src={figmaAssets.historySky}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 py-20">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 lg:px-0">
          <h2 className="text-[2.6rem] font-semibold leading-[52px] tracking-[-0.018em] sm:text-[64px] sm:tracking-[-1.152px]">
            Our History
          </h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="Scroll timeline backwards"
              className="flex size-12 items-center justify-center rounded-full bg-[#f9fafb]"
              onClick={() => scrollByColumn(-1)}
              type="button"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              aria-label="Scroll timeline forwards"
              className="flex size-12 items-center justify-center rounded-full bg-[#f9fafb]"
              onClick={() => scrollByColumn(1)}
              type="button"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <div
          className="mt-[100px] flex h-[558px] gap-8 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ref={trackRef}
        >
          {milestones.map((milestone, index) => (
            <MilestoneColumn
              active={index === activeIndex}
              key={`${milestone.year}-${milestone.title}`}
              milestone={milestone}
              onActivate={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
