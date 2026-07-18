"use client";

import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

type Milestone = {
  year: string;
  title: string;
  body: string;
  image: string;
};

const milestones: Milestone[] = [
  {
    year: "2016",
    title: "Facilitate FX founded",
    body: "The work began with a simple problem: helping people and businesses move between USD and NGN with clearer pricing and more reliable settlement.",
    image: "/images/our history/2016.png",
  },
  {
    year: "2019",
    title: "Stablecoin liquidity in Nigeria",
    body: "The team provided USD liquidity for early stablecoin products in Nigeria, learning where digital dollars could solve real cross-border friction.",
    image: "/images/our history/2019.png",
  },
  {
    year: "2021",
    title: "Shiga launched",
    body: "Shiga started as an OTC desk built for businesses that needed dependable access to digital assets, liquidity, and fast settlement.",
    image: "/images/our history/2021.png",
  },
  {
    year: "2023",
    title: "From desk to infrastructure",
    body: "After the MiniPay accelerator, the focus shifted from a phone-based product toward the deeper infrastructure needed to support wallets, payments, and partners.",
    image: "/images/our history/2023.png",
  },
  {
    year: "2024",
    title: "Regulated rails at scale",
    body: "Selected for the Stellar accelerator and backed by the Africa Growth Fund, Shiga launched V1 and crossed $100M in processed volume.",
    image: "/images/our history/2024.png",
  },
  {
    year: "2025",
    title: "Global partners joined",
    body: "Tether invested and partnered with the company, while Visa accelerator programs helped sharpen the payments and treasury infrastructure.",
    image: "/images/our history/2025.png",
  },
  {
    year: "2026",
    title: "Enta waitlist opens",
    body: "Enta opens the next chapter: one account for USDT, Bitcoin, gold, and cross-border payments, built on the rails Shiga has been proving since 2016.",
    image: "/images/our history/2026.png",
  },
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
        "flex h-[640px] w-[334px] shrink-0 items-start gap-8 transition-opacity duration-300 ease-out",
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
          active ? "h-full" : "h-[360px]",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[44px] font-normal leading-[48px] tracking-[-1px] text-white sm:text-[64px] sm:leading-[52px] sm:tracking-[-1.152px]">
          {milestone.year}
        </p>
        <p
          className={cn(
            "mt-[19px] truncate text-base leading-6 text-white sm:text-lg sm:leading-7",
            active ? "font-semibold" : "font-medium",
          )}
          title={milestone.title}
        >
          {milestone.title}
        </p>
        <div
          aria-hidden="true"
          className="mt-[42px] flex h-[160px] items-start justify-between pr-1"
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
          <p className="text-sm font-medium leading-5 text-white sm:text-base sm:leading-6">
            {milestone.body}
          </p>
          <img
            alt={`${milestone.year} ${milestone.title}`}
            className="mt-6 h-[132px] w-[220px] bg-white object-cover sm:h-[164px] sm:w-[261px]"
            src={milestone.image}
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
    const track = trackRef.current;
    if (track) track.scrollLeft = 303;

    return () => {
      if (edgeTimerRef.current !== undefined) window.clearInterval(edgeTimerRef.current);
    };
  }, []);

  function scrollByColumn(direction: 1 | -1) {
    trackRef.current?.scrollBy({ behavior: "smooth", left: direction * 362 });
  }

  function handleEdgeMove(event: ReactMouseEvent<HTMLElement>) {
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
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative z-10 py-20">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 lg:px-0">
          <h2 className="text-[2.6rem] font-semibold leading-[52px] tracking-[-0.018em] sm:text-[64px] sm:tracking-[-1.152px]">
            Our History
          </h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="Scroll timeline backwards"
              className="flex size-10 items-center justify-center rounded-full bg-[#f9fafb] transition duration-150 ease-out hover:bg-white active:scale-[0.96] sm:size-12"
              onClick={() => scrollByColumn(-1)}
              type="button"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              aria-label="Scroll timeline forwards"
              className="flex size-10 items-center justify-center rounded-full bg-[#f9fafb] transition duration-150 ease-out hover:bg-white active:scale-[0.96] sm:size-12"
              onClick={() => scrollByColumn(1)}
              type="button"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <div
          className="mt-[72px] flex h-[666px] gap-8 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-6 pl-6 [scrollbar-width:none] lg:pl-[max(24px,calc((100vw-1200px)/2))] [&::-webkit-scrollbar]:hidden"
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
