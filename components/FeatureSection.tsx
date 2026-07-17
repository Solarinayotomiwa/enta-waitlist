"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

type AssetCard = {
  title: string;
  description: string;
  background: string;
  token: string;
  className: string;
  tokenClassName: string;
};

const assetCards: AssetCard[] = [
  {
    title: "USD₮",
    description:
      "The value of a dollar, accessible from your local currency. The fastest way to protect your purchasing power without touching a bank.",
    background: figmaAssets.featureUsdtBg,
    token: figmaAssets.featureUsdtToken,
    className: "lg:translate-y-4 lg:hover:translate-y-2",
    tokenClassName: "",
  },
  {
    title: "Bitcoin",
    description:
      "Access it from your local currency or USDT at the best rates, with the deepest liquidity in the market. No markup. No runaround.",
    background: figmaAssets.featureBitcoinBg,
    token: figmaAssets.featureBitcoinToken,
    className: "lg:translate-y-32 lg:hover:translate-y-[120px]",
    tokenClassName: "",
  },
  {
    title: "Gold",
    description:
      "Five thousand years of value storage. Now accessible from your phone, from your local currency, with no vault required.",
    background: figmaAssets.featureGoldBg,
    token: figmaAssets.featureGoldToken,
    className: "",
    tokenClassName: "",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function WalletIllustration({ animate }: { animate: boolean }) {
  return (
    <motion.div
      animate={animate ? { y: [0, -10, 0], rotate: [0, -0.35, 0.35, 0] } : undefined}
      className="feature-wallet relative mx-auto w-[318px] sm:w-[410px] lg:w-[484px]"
      transition={{ duration: 6.5, ease: "easeInOut", repeat: Infinity }}
    >
      <img
        alt=""
        className="block h-auto w-full drop-shadow-[0_28px_70px_rgba(6,10,24,0.5)]"
        src={figmaAssets.featureWalletHd}
      />
    </motion.div>
  );
}

function FeatureAssetCard({
  card,
  index,
  animate,
}: {
  animate: boolean;
  card: AssetCard;
  index: number;
}) {
  return (
    <motion.article
      animate={animate ? "visible" : "hidden"}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-[#00030a] bg-gradient-to-b from-[#0c111d] to-[rgba(12,17,29,0.1)] transition duration-300 ease-out hover:-translate-y-2 hover:border-[#6b7fd0]/70 hover:shadow-[0_24px_60px_rgba(6,10,24,0.45)] lg:w-[332px]",
        card.className,
      )}
      initial="hidden"
      tabIndex={0}
      transition={{ delay: 0.08 * index, duration: 0.55, ease: "easeOut" }}
      variants={reveal}
    >
      <div className="relative h-[234px] overflow-hidden bg-[#0c111d] sm:h-[253px]">
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          src={card.background}
        />
        {/* Static at rest; hovering or focusing the card plays one faux-3D
            coin revolution (see .feature-coin in globals.css). */}
        <div className="absolute inset-0 grid place-items-center [perspective:900px]">
          <img
            alt=""
            className={cn(
              "feature-card-token feature-coin h-[91.8%] w-[91.8%] object-contain object-center",
              card.tokenClassName,
            )}
            src={card.token}
          />
        </div>
        <div className="absolute inset-x-0 bottom-[-1px] h-[90px] bg-gradient-to-b from-[rgba(56,79,130,0)] to-[#0c111c] to-[75%]" />
      </div>
      <div className="min-h-[146px] px-5 pb-8 pt-[31px] text-white">
        <h3 className="text-[2.45rem] font-medium leading-[1.15] tracking-[-0.018em] sm:text-[45px] sm:leading-[52px]">
          {card.title}
        </h3>
        <p className="mt-2 text-pretty text-sm font-medium leading-[18.2px] tracking-[-0.28px] text-white">
          {card.description}
        </p>
      </div>
    </motion.article>
  );
}

export function FeatureSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);
  const shouldAnimate = isInView && !reducedMotion;

  return (
    <section
      className={cn(
        "feature-section relative isolate overflow-x-clip bg-[#0d101d] px-6 py-24 text-white sm:py-[120px] lg:px-0 lg:pb-[349px]",
        shouldAnimate && "motion-active",
      )}
      id="assets"
      ref={sectionRef}
    >
      <img
        alt=""
        aria-hidden="true"
        className="feature-ambient-frame pointer-events-none absolute left-1/2 -top-64 z-0 h-[674px] w-[1369px] max-w-none -translate-x-1/2 opacity-45"
        src={figmaAssets.featureAmbientFrame}
      />
      <div aria-hidden="true" className="feature-ambient-glow" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center">
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="max-w-[662px] text-center"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <h2 className="text-balance text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.018em] sm:text-5xl">
            Three assets. One account.
          </h2>
          <p className="mx-auto mt-4 max-w-[404px] text-pretty text-xl leading-7 tracking-[-0.16px] text-white">
            Hold value in the form that works for your situation. Stable, hard, or appreciating.
          </p>
        </motion.div>

        <div className="relative mt-12 w-full lg:mt-[26px]">
          <div className="relative z-20 mx-auto w-full max-w-[520px]">
            <WalletIllustration animate={shouldAnimate} />
          </div>

          {/* One responsive connector diagram: a stem from the wallet's bottom
              centre reaches a branch line, rounded elbows drop into the USDT
              and Gold cards, and a straight run continues to the Bitcoin card.
              Endpoints extend ~2px under the artwork/cards to hide seams. */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 hidden size-full lg:block"
            preserveAspectRatio="none"
            viewBox="0 0 1200 861"
          >
            <g
              fill="none"
              stroke="#414167"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.75"
              strokeWidth="1.5"
            >
              <path d="M600 408 L600 435" vectorEffect="non-scaling-stroke" />
              <path
                d="M600 435 L178 435 Q166 435 166 447 L166 461"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M600 435 L1022 435 Q1034 435 1034 440 L1034 445"
                vectorEffect="non-scaling-stroke"
              />
              <path d="M600 435 L600 572" vectorEffect="non-scaling-stroke" />
            </g>
          </svg>

          <div className="relative z-20 mt-8 grid gap-5 sm:grid-cols-3 lg:mt-0 lg:flex lg:h-[420px] lg:items-start lg:justify-between">
            {assetCards.map((card, index) => (
              <FeatureAssetCard animate={contentVisible} card={card} index={index} key={card.title} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
