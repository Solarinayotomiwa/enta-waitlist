"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";
import { SmoothGlobe } from "@/components/DottedGlobe";

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

const cardHover =
  "transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.015] focus-within:-translate-y-1";

function PasskeyVisual() {
  return (
    <div className="relative min-h-[297px] flex-1 overflow-hidden rounded-xl bg-[#dcfae6] lg:min-h-0">
      <div className="absolute left-1/2 top-1/2 flex w-[315px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-[15.5px] rounded-[7.75px] bg-white p-[15.5px]">
        <div className="flex items-start gap-[15.5px]">
          <img alt="" className="size-[25.8px] shrink-0" src={figmaAssets.featuresIconLaptop} />
          <div className="flex flex-col gap-[10.33px]">
            <div className="flex flex-col gap-[2.58px]">
              <p className="text-[10.33px] font-semibold leading-[15.5px] text-[#101828]">
                This Mac
              </p>
              <p className="text-[9.04px] leading-[12.9px] text-[#344054]">
                Use this device biometrics to sign in
              </p>
            </div>
            <span className="flex w-fit items-center gap-[2.58px] rounded-full bg-[#f9fafb] px-[5.17px] py-[1.29px]">
              <img alt="" className="size-[7.75px]" src={figmaAssets.featuresIconClock} />
              <span className="text-[7.75px] font-medium leading-[11.6px] text-[#344054]">
                Takes less than 30 seconds
              </span>
            </span>
          </div>
        </div>
        <span className="flex h-[31px] w-full items-center justify-center rounded-[5.17px] bg-[#175cd3] text-[10.33px] font-semibold capitalize leading-[15.5px] text-white shadow-[0_0.65px_1.29px_rgba(16,24,40,0.05),inset_0_0_0_1px_rgba(16,24,40,0.18),inset_0_-1.29px_0_0_rgba(16,24,40,0.05)]">
          Create passkey
        </span>
      </div>
    </div>
  );
}

function GlobeVisual() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative min-h-[297px] flex-1 overflow-hidden rounded-xl bg-[#070d1a] lg:min-h-0"
      onBlur={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={-1}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(83,177,253,0.24),rgba(23,92,211,0.08)_38%,rgba(7,13,26,0)_68%)] opacity-90" />
      <div className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#53b1fd]/20 bg-[#101828]/20 shadow-[0_0_70px_rgba(83,177,253,0.2)] transition duration-500 group-hover:shadow-[0_0_90px_rgba(83,177,253,0.32)]" />
      <SmoothGlobe hovered={hovered} />
    </div>
  );
}

type FeatureCard = {
  title: string;
  body: string;
  visual: ReactNode;
};

const featureCards: FeatureCard[] = [
  {
    title: "Only you can move it",
    body: "Only you can access your account using your device and biometrics. Shiga cannot freeze or transfer your assets.",
    visual: (
      <div className="relative min-h-[297px] flex-1 overflow-hidden rounded-xl lg:min-h-0">
        <img
          alt="Enta dashboard shown in dark mode"
          className="absolute inset-0 size-full rounded-xl object-cover"
          src={figmaAssets.featuresMoveDashboardV2}
        />
      </div>
    ),
  },
  {
    title: "Never lose access",
    body: "Self-custody without a seed phrase. If you lose your device, recover your account securely.",
    visual: <PasskeyVisual />,
  },
  {
    title: "Regulated, not a workaround",
    body: "Built on regulated infrastructure, backed by Tether. Over $350M moved for individuals and businesses in Africa and the GCC.",
    visual: <GlobeVisual />,
  },
];

export function FeaturesGridSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);

  return (
    <section
      className="relative isolate overflow-x-clip bg-[#0d101d] px-6 pb-24 text-white sm:pb-[120px] lg:px-0"
      id="features"
      ref={sectionRef}
    >
      <div className="mx-auto flex w-full max-w-[1224px] flex-col gap-4">
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className={cn(
            "flex flex-col gap-10 rounded-2xl bg-[#182230] p-5 lg:h-[495px] lg:flex-row lg:items-center lg:gap-12",
            cardHover,
          )}
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <div className="flex flex-col justify-center lg:w-[424px] lg:shrink-0">
            <div className="flex flex-col gap-2">
              <p className="text-[22px] font-medium leading-[30px] text-white sm:text-2xl sm:leading-8 lg:whitespace-nowrap">
                The rate you see is the rate you get
              </p>
              <p className="max-w-[419px] text-lg leading-[27px] text-[#d0d5dd] sm:text-xl sm:leading-[30px]">
                No hidden markup. We settle directly on our own rails, so there&rsquo;s no
                correspondent bank or middleman taking a cut of your money.
              </p>
            </div>
          </div>
          <img
            alt="Enta buy widget converting naira in a few taps"
            className="w-full rounded-xl object-cover lg:h-[455px] lg:w-[712px]"
            src={figmaAssets.featuresBuyWidget}
          />
        </motion.div>

        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="grid gap-4 lg:grid-cols-3"
          initial="hidden"
          transition={{ delay: 0.06, duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          {featureCards.map((card) => (
            <div
              className={cn("flex flex-col gap-8 rounded-2xl bg-[#182230] p-5 lg:h-[529px]", cardHover)}
              key={card.title}
            >
              <div className="flex min-h-[150px] flex-col gap-2">
                <p className="text-[20px] font-medium leading-[30px] text-white">{card.title}</p>
                <p className="text-lg leading-[28px] text-[#d0d5dd]">{card.body}</p>
              </div>
              {card.visual}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
