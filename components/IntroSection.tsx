"use client";

import { CSSProperties, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

const introLogos = [
  { src: figmaAssets.introLogoTether, width: 149 },
  { src: figmaAssets.introLogoTrafigura, width: 169 },
  { src: figmaAssets.introLogoVisa, width: 126 },
  { src: figmaAssets.introLogoFirstBank, width: 144 },
  { src: figmaAssets.introLogoTechCabal, width: 193 },
  { src: figmaAssets.introLogoTelegram, width: 185 },
] as const;

const proofStats = [
  {
    label: "Transaction volume",
    value: "$350M+",
    body: "We’ve processed $350 million across African and GCC corridors, helping businesses and individuals move money at the speed of a text message.",
  },
  {
    label: "Markets served",
    value: "15+",
    body: "Fifteen markets and counting. From Lagos to Dubai to London — we’re live where it matters most for emerging market users.",
  },
  {
    label: "Transactions processed",
    value: "17,000",
    body: "Over 17,000 transactions completed across our corridors. Every one of them settled without a correspondent bank, without the runaround.",
  },
  {
    label: "Years building",
    value: "5+",
    body: "Five years building regulated financial infrastructure for emerging markets. Backed by Tether. Licensed in the EU and DIFC. Built to last.",
  },
] as const;

const introReveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export function IntroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);
  const shouldAnimate = isInView && !reducedMotion;

  return (
    <section
      className={cn(
        "intro-section relative isolate -mt-px overflow-hidden bg-[#0d101d] px-6 pb-24 pt-28 text-white sm:pb-[120px] sm:pt-36 lg:px-0 lg:pt-[200px]",
        shouldAnimate && "motion-active",
      )}
      id="proof"
      ref={sectionRef}
    >
      <div aria-hidden="true" className="intro-glow" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center gap-14">
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="mb-2 flex max-w-[966px] flex-col items-center text-center"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={introReveal}
        >
          <h2 className="text-balance text-[2.35rem] font-semibold leading-[1.08] tracking-[-0.018em] text-white sm:text-5xl sm:leading-[52px]">
            We&apos;re not asking you to trust us. We&apos;re showing you exactly why you should.
          </h2>
        </motion.div>

        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="intro-logo-mask w-full max-w-[1072px] overflow-hidden"
          initial="hidden"
          transition={{ delay: 0.12, duration: 0.55, ease: "easeOut" }}
          variants={introReveal}
        >
          <div className="intro-logo-track flex w-max items-center gap-[60px]">
            {[...introLogos, ...introLogos].map((logo, index) => (
              <img
                alt=""
                className="h-12 max-w-none opacity-75"
                key={logo.src + "-" + index}
                src={logo.src}
                style={{ width: logo.width } as CSSProperties}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="grid w-full gap-3 md:grid-cols-2 md:gap-0 md:bg-[#132143] xl:grid-cols-4"
          initial="hidden"
          transition={{ delayChildren: 0.18, staggerChildren: 0.08 }}
        >
          {proofStats.map((stat) => (
            <motion.article
              className="flex min-h-[238px] flex-col justify-between rounded-2xl border border-[#132143] bg-[#0d101d] py-6 pl-6 pr-8 transition-[border-color,box-shadow] duration-200 ease-out hover:border-[#4b8bff] hover:shadow-[inset_0_0_0_1px_#4b8bff] md:min-h-[266px] md:rounded-b-none md:rounded-t-[12px] md:border-b-0 md:border-l-0 md:border-r md:border-t md:first:rounded-tl-none md:last:rounded-tr-none last:border-r-0"
              key={stat.label}
              transition={{ duration: 0.5, ease: "easeOut" }}
              variants={introReveal}
              whileHover={{ y: -6 }}
            >
              <div>
                <p className="text-base font-medium leading-[18.2px] tracking-[-0.28px] text-[#4b8bff]">{stat.label}</p>
                <p className="mt-4 text-[2.6rem] font-medium leading-[52px] tracking-[-0.018em] text-white sm:text-[45px]">
                  {stat.value}
                </p>
              </div>
              <p className="mt-10 text-pretty text-sm font-medium leading-[21px] tracking-[-0.28px] text-white">
                {stat.body}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
