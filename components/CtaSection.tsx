"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { figmaAssets } from "@/lib/figma-assets";

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

/* CTA card from Figma node 749-2561: "Ready to move money differently?" with
   the decorative pattern background, sitting directly above the footer. */
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
          className="footer-cta-card relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c111d] p-8 shadow-2xl shadow-black/20 sm:p-12 lg:min-h-[300px] lg:p-0"
          initial="hidden"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          variants={reveal}
        >
          <img
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-full w-[48%] object-cover opacity-45"
            src={figmaAssets.footerBgElement}
          />
          <img
            alt=""
            aria-hidden="true"
            className="footer-cta-pattern pointer-events-none absolute inset-[-70%_-22%] size-auto max-w-none opacity-70"
            src={figmaAssets.footerCtaPattern}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_58%,rgba(238,170,253,0.34),transparent_22rem),radial-gradient(circle_at_56%_52%,rgba(28,83,223,0.42),transparent_28rem)]" />

          <div className="relative z-10 grid gap-10 lg:min-h-[300px] lg:grid-cols-[1fr_361px] lg:items-center lg:gap-[160px] lg:px-[63px]">
            <motion.h2
              animate={contentVisible ? "visible" : "hidden"}
              className="max-w-[560px] text-balance text-[2.65rem] font-medium leading-[1.08] tracking-[-0.037em] text-[#f5f5f6] sm:text-[3.625rem] sm:leading-[1.15]"
              initial="hidden"
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              variants={reveal}
            >
              Ready to move money differently?
            </motion.h2>
            <motion.div
              animate={contentVisible ? "visible" : "hidden"}
              className="flex max-w-[361px] flex-col items-start gap-6 text-left lg:items-center lg:text-center"
              initial="hidden"
              transition={{ delay: 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              variants={reveal}
            >
              <p className="text-pretty text-lg leading-[1.34] tracking-[-0.018em] text-white">
                Thousands of businesses and individuals across Africa and the GCC are already
                waiting. Join them.
              </p>
              <a
                className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-[#0c111d] transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-white/90"
                href="/#waitlist"
              >
                Join Our Waitlist
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
