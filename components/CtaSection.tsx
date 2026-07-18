"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

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
      <motion.div
        animate={contentVisible ? "visible" : "hidden"}
        className="footer-cta-card group relative mx-auto w-full max-w-[1200px] overflow-hidden rounded-[30px]"
        initial="hidden"
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        variants={reveal}
      >
        <img
          alt="Ready to move money differently? Thousands of businesses and individuals across Africa and the GCC are already waiting. Join them."
          className="footer-cta-image block aspect-[4/1] min-h-[180px] w-full object-cover object-center"
          src="/images/cta/cta-section.png"
        />
        <a
          aria-label="Join our waitlist"
          className="footer-cta-hotspot absolute left-[72%] top-[58.5%] h-[14%] min-h-10 w-[12.7%] min-w-[150px] -translate-x-1/2 rounded-lg outline-none"
          href="/#waitlist"
        >
          <span className="sr-only">Join our waitlist</span>
        </a>
      </motion.div>
    </section>
  );
}
