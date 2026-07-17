"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { figmaAssets } from "@/lib/figma-assets";

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const ctaMessage =
  "Ready to move money differently? Thousands of businesses and individuals across Africa and the GCC are already waiting. Join them.";

/* CTA above the footer. On desktop the section renders the exact design
   export (public/images/cta/cta-section.png, 2400x600 = 2x of the 1200x300
   card) with a real link overlaid on the button area; below lg the CTA is
   recreated as semantic responsive content so text stays readable. */
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
        {/* Desktop: the exported artwork, pixel-accurate. */}
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="relative hidden lg:block"
          initial="hidden"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          variants={reveal}
        >
          <img
            alt=""
            className="h-auto w-full"
            height={600}
            src="/images/cta/cta-section.png"
            width={1200}
          />
          <p className="sr-only">{ctaMessage}</p>
          <a
            aria-label="Join the Enta waitlist"
            className="absolute left-[71.5%] top-[58.5%] h-[14.3%] w-[13.3%] rounded-lg outline-none transition duration-150 ease-out hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
            href="/#waitlist"
          >
            <span className="sr-only">Join the Enta waitlist</span>
          </a>
        </motion.div>

        {/* Tablet/mobile: semantic recreation so the copy stays readable. */}
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="footer-cta-card relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c111d] p-8 shadow-2xl shadow-black/20 sm:p-12 lg:hidden"
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

          <div className="relative z-10 flex flex-col gap-8">
            <h2 className="max-w-[560px] text-balance text-[2.65rem] font-medium leading-[1.08] tracking-[-0.037em] text-[#f5f5f6] sm:text-[3.625rem] sm:leading-[1.15]">
              Ready to move money differently?
            </h2>
            <div className="flex max-w-[361px] flex-col items-start gap-6 text-left">
              <p className="text-pretty text-lg leading-[1.34] tracking-[-0.018em] text-white">
                Thousands of businesses and individuals across Africa and the GCC are already
                waiting. Join them.
              </p>
              <a
                className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-[#0c111d] outline-none transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white"
                href="/#waitlist"
              >
                Join Our Waitlist
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
