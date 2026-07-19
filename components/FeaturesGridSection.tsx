"use client";

import Image from "next/image";
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
    <div className="featureVisualPanel featureVisualPanel--access">
      <div className="featureIllustration featureIllustration--access">
        <Image
          alt=""
          className="h-auto max-h-full w-auto max-w-full object-contain"
          height={166}
          quality={100}
          sizes="(max-width: 767px) 90vw, (max-width: 1199px) 45vw, 32vw"
          src="/images/features/never-lose-access.png"
          width={328}
        />
      </div>
    </div>
  );
}

function GlobeVisual() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative min-h-[297px] flex-1 overflow-hidden rounded-xl bg-[#D1E9FF] lg:min-h-0"
      onBlur={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={-1}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(75,139,255,0.18),rgba(209,233,255,0)_62%)]" />
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
      <div className="featureVisualPanel featureVisualPanel--move">
        <div className="featureIllustration featureIllustration--move">
          <Image
            alt=""
            className="object-contain"
            fill
            quality={100}
            sizes="(max-width: 767px) 90vw, (max-width: 1199px) 45vw, 32vw"
            src="/images/features/only-you-can-move-it.png"
          />
        </div>
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
            className="h-auto w-full max-w-[712px] rounded-xl"
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
