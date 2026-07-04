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
      "Holds the value of a dollar. Moves like a text message. The fastest way to true financial flexibility",
    background: figmaAssets.featureUsdtBg,
    token: figmaAssets.featureUsdtToken,
    className: "lg:translate-y-4",
    tokenClassName: "translate-y-5 scale-[1.08] object-[50%_58%]",
  },
  {
    title: "Bitcoin",
    description:
      "Access it from Naira, dirhams, Kenyan shillings or USD₮ at the best rates, with the deepest liquidity in the market.",
    background: figmaAssets.featureBitcoinBg,
    token: figmaAssets.featureBitcoinToken,
    className: "lg:translate-y-[7.25rem]",
    tokenClassName: "translate-y-4 scale-[1.04] object-[50%_56%]",
  },
  {
    title: "Gold",
    description:
      "Now accessible from your phone, bought directly from your local currency. Real gold. Digital access. No vault required.",
    background: figmaAssets.featureGoldBg,
    token: figmaAssets.featureGoldToken,
    className: "",
    tokenClassName: "translate-y-5 scale-[1.04] object-[50%_58%]",
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
        src={figmaAssets.featureWalletBalanceCard}
      />
    </motion.div>
  );
}

function FeatureAssetCard({ card, index, animate }: { animate: boolean; card: AssetCard; index: number }) {
  return (
    <motion.article
      animate={animate ? "visible" : "hidden"}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-[#303650] bg-[#0c111d] shadow-2xl shadow-black/20 transition duration-300 ease-out hover:-translate-y-1 hover:border-[#6b7fd0]/70 hover:shadow-blue-950/30 lg:w-[332px]",
        card.className,
      )}
      initial="hidden"
      transition={{ delay: 0.08 * index, duration: 0.55, ease: "easeOut" }}
      variants={reveal}
    >
      <div className="relative h-[234px] overflow-hidden bg-white sm:h-[253px]">
        <img
          alt=""
          className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          src={card.background}
        />
        <img
          alt=""
          className={cn(
            "feature-card-token absolute inset-0 size-full origin-top object-cover transition duration-700 ease-out group-hover:scale-[1.1]",
            card.tokenClassName,
          )}
          src={card.token}
        />
        <div className="absolute inset-x-0 bottom-[-1px] h-28 bg-gradient-to-b from-transparent to-[#0c111d]" />
      </div>
      <div className="min-h-[146px] px-5 pb-8 pt-4 text-white">
        <h3 className="text-[2.45rem] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[2.8rem]">
          {card.title}
        </h3>
        <p className="mt-3 text-pretty text-sm font-medium leading-[1.3] tracking-[-0.02em] text-white/88">
          {card.description}
        </p>
      </div>
    </motion.article>
  );
}

export function FeatureSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "180px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);
  const shouldAnimate = isInView && !reducedMotion;

  return (
    <section
      className={cn(
        "feature-section relative isolate overflow-hidden bg-[#0d101d] px-6 py-24 text-white sm:py-[120px] lg:px-0",
        shouldAnimate && "motion-active",
      )}
      id="assets"
      ref={sectionRef}
    >
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 z-0 h-[48rem] max-w-none -translate-x-1/2 opacity-45"
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
          <p className="mx-auto mt-4 max-w-[404px] text-pretty text-base leading-[1.4] tracking-[-0.01em] text-white/76">
            Hold value in the form that works for your situation — stable, hard, or appreciating.
          </p>
        </motion.div>

        <div className="relative mt-12 w-full lg:mt-10">
          <div className="relative z-20 mx-auto w-full max-w-[520px]">
            <WalletIllustration animate={shouldAnimate} />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[355px] z-10 hidden w-[760px] -translate-x-1/2 lg:block"
          >
            <img
              alt=""
              className="absolute right-1/2 top-0 h-16 w-[377px] opacity-80"
              src={figmaAssets.featureConnectorLeft}
            />
            <img
              alt=""
              className="absolute left-1/2 top-0 h-16 w-[377px] opacity-80"
              src={figmaAssets.featureConnectorRight}
            />
            <span className="absolute left-1/2 top-0 h-[170px] w-px -translate-x-1/2 bg-[#414167]/70" />
          </div>

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
