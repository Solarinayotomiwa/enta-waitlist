"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

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
      <div className="mx-auto w-full max-w-[1200px]">
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="footer-cta-card relative isolate flex min-h-[300px] flex-col justify-center gap-9 overflow-hidden rounded-[30px] border border-[#394f90]/55 bg-[#0c111d] px-8 py-10 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-0"
          initial="hidden"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          variants={reveal}
        >
          <div aria-hidden="true" className="footer-cta-grid pointer-events-none absolute inset-y-0 left-0 w-[44%]" />
          <div aria-hidden="true" className="footer-cta-wash pointer-events-none absolute inset-0" />

          <h2 className="relative z-10 max-w-[540px] text-balance text-[2.8rem] font-medium leading-[1.08] tracking-[-0.037em] text-[#f5f5f6] sm:text-[3.625rem] sm:leading-[1.12] lg:w-[532px] lg:max-w-none lg:text-[58px] lg:leading-[67px] lg:tracking-[-2.16px]">
            Ready to move money differently?
          </h2>

          <div className="relative z-10 flex w-full max-w-[361px] flex-col items-start gap-7 text-left lg:mr-[6.6%] lg:w-[361px] lg:items-center lg:text-center">
            <p className="max-w-[335px] text-pretty text-lg leading-[25px] tracking-[-0.32px] text-white">
              Thousands of businesses and individuals across Africa and the GCC are already waiting.
              Join them.
            </p>
            <a
              className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold capitalize text-[#0c111d] outline-none transition duration-150 ease-out hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white lg:w-[151px]"
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
