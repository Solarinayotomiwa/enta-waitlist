"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

type Audience = {
  title: string;
  icon: string;
  bullets: string[];
};

const audiences: Audience[] = [
  {
    title: "For you",
    icon: figmaAssets.builtForUserCheck,
    bullets: [
      "Stop your savings losing value to a falling local currency.",
      "Send to and receive from family abroad, in minutes.",
      "Hold dollars, Bitcoin, and gold, secured by your passkey — no broker, no vault.",
    ],
  },
  {
    title: "For your business",
    icon: figmaAssets.builtForUsersThree,
    bullets: [
      "Settle cross-border payments without correspondent banks",
      "Choose the best asset for your treasury and switch instantly.",
      "Assign role-based access: owner, admin, viewer based on responsibility.",
    ],
  },
];

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

function AudienceCard({
  active,
  audience,
  onActivate,
}: {
  active: boolean;
  audience: Audience;
  onActivate: () => void;
}) {
  return (
    <motion.div
      animate={{ flexGrow: active ? 1 : 0 }}
      className={cn(
        "flex w-full cursor-pointer flex-col justify-between gap-6 overflow-hidden rounded-xl border bg-gradient-to-b from-[#0c111d] to-[rgba(12,17,29,0.1)] p-6 text-left sm:p-8 lg:h-[340px] lg:w-auto lg:basis-[380px]",
        active ? "gradient-stroke border-transparent" : "border-[#00030a]",
      )}
      initial={false}
      onClick={onActivate}
      onFocus={onActivate}
      onMouseEnter={onActivate}
      role="button"
      tabIndex={0}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <img alt="" className="size-[72px] shrink-0 sm:size-[88px]" src={audience.icon} />
      <div className="flex w-full flex-col gap-3">
        <p className="text-[26px] font-medium leading-8 text-white sm:text-[30px] sm:leading-[38px]">
          {audience.title}
        </p>
        <AnimatePresence initial={false}>
          {active ? (
            <motion.ul
              animate={{ height: "auto", opacity: 1 }}
              className="flex flex-col gap-3 overflow-hidden"
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {audience.bullets.map((bullet) => (
                <li className="flex items-start gap-[10px]" key={bullet}>
                  <span
                    aria-hidden="true"
                    className="mt-[10px] size-[10px] shrink-0 rounded-full bg-white"
                  />
                  <span className="min-w-0 flex-1 text-lg font-normal leading-[27px] text-white sm:text-xl sm:leading-[30px] min-[1330px]:whitespace-nowrap">
                    {bullet}
                  </span>
                </li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function BuiltForSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      className="relative isolate overflow-x-clip bg-[#0d101d] px-6 pb-24 pt-12 text-white sm:pb-[120px] lg:px-0"
      id="built-for"
      ref={sectionRef}
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col">
        <motion.h2
          animate={contentVisible ? "visible" : "hidden"}
          className="mx-auto max-w-[472px] text-balance text-center text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.018em] text-white sm:text-[48px] sm:leading-[52px] sm:tracking-[-0.864px]"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          Built for individuals and businesses
        </motion.h2>
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="mt-12 flex flex-col gap-6 lg:flex-row"
          initial="hidden"
          transition={{ delay: 0.06, duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          {audiences.map((audience, index) => (
            <AudienceCard
              active={index === activeIndex}
              audience={audience}
              key={audience.title}
              onActivate={() => setActiveIndex(index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
