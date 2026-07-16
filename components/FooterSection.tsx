"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

const expectations = [
  "Instant confirmation to your email",
  "Early access before public launch",
  "Onboarding support from the enta team",
  "Priority access to new assets and markets",
] as const;

const footerPattern = [
  figmaAssets.footerPattern01,
  figmaAssets.footerPattern02,
  figmaAssets.footerPattern03,
  figmaAssets.footerPattern04,
  figmaAssets.footerPattern05,
  figmaAssets.footerPattern06,
] as const;

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function FooterSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "220px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);
  const motionActive = isInView && !reducedMotion;

  return (
    <footer
      className={cn(
        "footer-section relative isolate overflow-hidden bg-[#0d101d] px-6 pt-24 text-white sm:pt-[120px] lg:px-0",
        motionActive && "motion-active",
      )}
      id="footer"
      ref={sectionRef}
    >
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-36 h-[43rem] w-1/2 opacity-45"
        src={figmaAssets.footerEllipseLeft}
      />
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-36 h-[43rem] w-1/2 opacity-45"
        src={figmaAssets.footerEllipseRight}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        <motion.div
          animate={contentVisible ? "visible" : "hidden"}
          className="relative"
          initial="hidden"
          transition={{ duration: 0.55, ease: "easeOut" }}
          variants={reveal}
        >
          <div className="footer-cta-card relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c111d] p-8 shadow-2xl shadow-black/20 sm:p-12 lg:min-h-[300px] lg:p-0">
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
              <h2 className="max-w-[560px] text-balance text-[2.65rem] font-medium leading-[1.08] tracking-[-0.037em] text-[#f5f5f6] sm:text-[3.625rem] sm:leading-[1.15]">
                Ready to move money differently?
              </h2>
              <div className="flex max-w-[361px] flex-col items-start gap-6 text-left lg:items-center lg:text-center">
                <p className="text-pretty text-lg leading-[1.34] tracking-[-0.018em] text-white">
                  Thousands of businesses and individuals across Africa and the GCC are already waiting. Join them.
                </p>
                <a
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-[#0c111d] transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-white/90"
                  href="/#waitlist"
                >
                  Join Our Waitlist
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_606px] lg:items-center lg:gap-[149px]">
          <motion.div
            animate={contentVisible ? "visible" : "hidden"}
            initial="hidden"
            transition={{ delay: 0.08, duration: 0.55, ease: "easeOut" }}
            variants={reveal}
          >
            <p className="text-2xl leading-[1.2] tracking-[-0.014em] text-white">What to expect:</p>
            <ul className="mt-8 flex max-w-[430px] flex-col gap-6">
              {expectations.map((item) => (
                <li className="flex items-center gap-6 text-lg leading-[1.06] tracking-[-0.018em] text-[#cecfd2]" key={item}>
                  <img alt="" className="size-6 shrink-0" src={figmaAssets.footerArrowRight} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.blockquote
            animate={contentVisible ? "visible" : "hidden"}
            className="border-l border-[#53b1fd] py-4 pl-8 sm:pl-12"
            initial="hidden"
            transition={{ delay: 0.14, duration: 0.55, ease: "easeOut" }}
            variants={reveal}
          >
            <p className="text-pretty text-2xl leading-[1.34] tracking-[-0.014em] text-white">
              “You&apos;re joining a growing list of people who believe money should move without borders.”
            </p>
            <footer className="mt-8 text-base tracking-[-0.018em] text-white/88">CEO and COO, Shiga Digital</footer>
          </motion.blockquote>
        </div>
      </div>

      <div className="relative z-0 mt-24 h-[264px] overflow-hidden" data-footer-pattern-wrap>
        <div className="absolute left-1/2 top-[41px] h-[410px] w-[1895.548px] -translate-x-1/2 overflow-hidden opacity-55">
          <div className="footer-pattern-track absolute left-[-4706.573px] top-[-1451.849px] flex h-[2061.861px] w-max items-start">
            {[...footerPattern, ...footerPattern].map((src, index) => (
              <img alt="" className="h-[2061.861px] w-[2061.85px] max-w-none" key={src + index} src={src} />
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 top-0 h-[184px] bg-gradient-to-b from-[#0c111d] via-[#0c111d] to-transparent" />
      </div>
    </footer>
  );
}
