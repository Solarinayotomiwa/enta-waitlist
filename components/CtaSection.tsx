"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { figmaAssets } from "@/lib/figma-assets";

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

/* CTA above the footer. Reconstructed as real, responsive DOM (no baked image)
   to match the Figma design: a 1200x300 dark card with a left grid pattern and
   a blue→lilac glow, the headline on the left and the waitlist prompt on the
   right. Below lg the two columns stack so the copy stays readable. */
export function CtaSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);

  return (
    <section
      className="relative isolate overflow-x-clip bg-[#0d101d] px-6 pb-6 pt-24 text-white sm:pt-[120px] lg:px-0"
      id="cta"
      ref={sectionRef}
    >
      <div className="mx-auto w-full max-w-[1200px] px-0 lg:px-6 xl:px-0">
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="footer-cta-card relative isolate flex flex-col justify-center gap-8 overflow-hidden rounded-[2rem] border border-[#0f1112] bg-[#0c111d] p-8 sm:p-12 lg:aspect-[4/1] lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:p-0 lg:pl-[5.25%] lg:pr-[6.75%]"
          initial="hidden"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          variants={reveal}
        >
          {/* Left grid pattern. */}
          <img
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-full w-[46%] object-cover opacity-50"
            src={figmaAssets.footerBgElement}
          />
          {/* Organic glow artwork drifting behind the copy. */}
          <img
            alt=""
            aria-hidden="true"
            className="footer-cta-pattern pointer-events-none absolute bottom-[-130%] right-[-20%] h-[360%] w-[110%] max-w-none opacity-70"
            src={figmaAssets.footerCtaPattern}
          />
          {/* Color wash tuned to the Figma palette: dark navy on the left, a blue
              core center-right, and a lilac bloom in the bottom-right corner. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_135%_at_100%_100%,rgba(176,126,196,0.6),rgba(120,84,163,0.4)_26%,rgba(60,66,140,0.26)_46%,transparent_66%),radial-gradient(95%_130%_at_68%_60%,rgba(23,45,110,0.82),rgba(16,30,80,0.48)_42%,transparent_68%),linear-gradient(100deg,#0c111d_0%,#0c111d_32%,#0c1428_54%,#0d1a3a_80%,#101d44_100%)]"
          />

          <h2 className="relative z-10 max-w-[560px] text-balance text-[2.65rem] font-medium leading-[1.08] tracking-[-0.037em] text-[#f5f5f6] sm:text-[3.625rem] sm:leading-[1.12] lg:w-[45%] lg:max-w-none lg:text-[clamp(2.6rem,4.5vw,58px)] lg:leading-[1.14] lg:tracking-[-0.037em]">
            Ready to move money differently?
          </h2>

          <div className="relative z-10 flex w-full max-w-[361px] flex-col items-start gap-6 text-left lg:w-[31%] lg:items-center lg:text-center">
            <p className="text-pretty text-lg leading-[1.34] tracking-[-0.018em] text-white lg:tracking-[-0.32px]">
              Thousands of businesses and individuals across Africa and the GCC are already waiting.
              Join them.
            </p>
            <a
              className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-[14px] text-sm font-semibold capitalize text-[#0c111d] outline-none transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white lg:w-[151px]"
              href="/#waitlist"
            >
              Join our waitlist
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
