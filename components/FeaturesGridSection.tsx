"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { figmaAssets } from "@/lib/figma-assets";

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

function PasskeyVisual() {
  return (
    <div className="relative min-h-[297px] flex-1 overflow-hidden rounded-xl">
      <img
        alt=""
        aria-hidden="true"
        className="absolute left-[-15.18%] top-[-11.49%] h-[119.12%] w-[130.37%] max-w-none"
        src={figmaAssets.featuresPasskeyBg}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-xl bg-[#961c7c] mix-blend-color"
      />
      <div className="absolute left-[20.67px] top-[82px] flex w-[315px] max-w-[calc(100%-32px)] flex-col gap-[15.5px] rounded-[7.75px] bg-white p-[15.5px]">
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

const featureCards = [
  {
    title: "Only you can move it",
    body: "Only you can access your account using your device and biometrics. Shiga cannot freeze or transfer your assets.",
    visual: (
      <div className="relative min-h-[297px] flex-1 overflow-hidden rounded-xl">
        <img
          alt="Enta dashboard shown in dark mode"
          className="absolute inset-0 size-full rounded-xl object-cover"
          src={figmaAssets.featuresMoveDashboard}
        />
      </div>
    ),
  },
  {
    title: "Never lose access",
    body: "Self-custody without a seed phrase to memorise or lose. If you lose your device, you can recover your account safely — securely, and on your terms.",
    visual: <PasskeyVisual />,
  },
  {
    title: "Regulated, not a workaround",
    body: "Built on regulated infrastructure and backed by Tether. Over $350M already moved for individuals and businesses across Africa and the GCC.",
    visual: <div className="min-h-[297px] flex-1 rounded-xl bg-[#fce7f6]" />,
  },
] as const;

export function FeaturesGridSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "220px", once: true });
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
          className="flex flex-col gap-10 rounded-2xl bg-[#182230] p-5 lg:flex-row lg:gap-12"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <div className="flex flex-col justify-center pt-4 lg:w-[424px] lg:shrink-0">
            <div className="flex flex-col gap-2 pb-6">
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
            alt="Enta dashboard showing balances, transactions, and deposits"
            className="w-full rounded-xl object-cover lg:h-[604px] lg:w-[712px]"
            src={figmaAssets.featuresRateDashboard}
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
              className="flex flex-col gap-8 rounded-2xl bg-[#182230] p-5 lg:h-[529px]"
              key={card.title}
            >
              <div className="flex flex-col gap-2">
                <p className="text-[22px] font-medium leading-[30px] text-white sm:text-2xl sm:leading-8">
                  {card.title}
                </p>
                <p className="text-lg leading-[27px] text-[#d0d5dd] sm:text-xl sm:leading-[30px]">
                  {card.body}
                </p>
              </div>
              {card.visual}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
