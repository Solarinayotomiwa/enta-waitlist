"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { figmaAssets } from "@/lib/figma-assets";

const footerPattern = [
  figmaAssets.footerPattern01,
  figmaAssets.footerPattern02,
  figmaAssets.footerPattern03,
  figmaAssets.footerPattern04,
  figmaAssets.footerPattern05,
  figmaAssets.footerPattern06,
] as const;

const footerLinks = [
  { label: "Learn more", href: "/#how-it-works" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
  { label: "Join waitlist", href: "/#waitlist-form" },
] as const;

const socialLinks = [
  {
    label: "Instagram",
    href: "#",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0m0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84m0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4m7.85-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44",
  },
  {
    label: "X (Twitter)",
    href: "#",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Telegram",
    href: "https://t.me/AfriSignal",
    path: "M21.9 4.4 18.7 19.5c-.24 1.06-.87 1.32-1.76.82l-4.87-3.59-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.95L18.1 6.4c.39-.35-.09-.54-.61-.2L6.35 13.23l-4.8-1.5c-1.04-.33-1.06-1.04.22-1.54L20.55 3.1c.87-.32 1.63.2 1.35 1.3Z",
  },
  {
    label: "LinkedIn",
    href: "#",
    path: "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0",
  },
] as const;

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function FooterSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { margin: "0px 0px -35% 0px", once: true });
  const contentVisible = Boolean(reducedMotion || isInView);
  const motionActive = isInView && !reducedMotion;

  return (
    <footer
      className={cn(
        "footer-section relative isolate overflow-hidden bg-[#0d101d] text-white",
        motionActive && "motion-active",
      )}
      id="footer"
      ref={sectionRef}
    >
      <motion.div
        animate={contentVisible ? "visible" : "hidden"}
        className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-6 py-14 lg:flex-row lg:items-start lg:justify-between lg:px-0"
        initial="hidden"
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        variants={reveal}
      >
        <div className="flex max-w-[712px] flex-col items-start">
          <a aria-label="Enta home" href="/">
            <img
              alt="Enta"
              className="h-[52px] w-[196px] object-contain object-left"
              height={52}
              src={figmaAssets.entaLogoWhite}
              width={196}
            />
          </a>
          <p className="mt-8 max-w-[680px] text-base leading-6 text-[#8f9fa3]">
            Enta is a product of Shiga Digital Limited, incorporated in the DIFC, United Arab
            Emirates. Company number 11065. Licensed as a Virtual Asset Service Provider in the
            European Union. Enta offers its products and services in partnership with licensed
            transmitters in their respective jurisdictions.
          </p>
          <div className="mt-16 flex items-end gap-6 lg:mt-20">
            {socialLinks.map((social) => (
              <a
                aria-label={social.label}
                className="flex size-10 items-center justify-center text-white transition-opacity duration-200 ease-out hover:opacity-70"
                href={social.href}
                key={social.label}
                rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                target={social.href.startsWith("http") ? "_blank" : undefined}
              >
                <svg aria-hidden="true" className="size-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="flex min-h-[236px] flex-col items-start gap-8 lg:min-h-[236px] lg:items-end lg:pt-16">
          <nav className="flex flex-col gap-4">
            {footerLinks.map((link) => (
              <a
                className="w-[155px] whitespace-nowrap text-xl leading-[30px] text-white transition-opacity duration-200 ease-out hover:opacity-70"
                href={link.href}
                key={link.label}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-base leading-6 text-[#8f9fa3] lg:text-right">
            &copy; 2026 &mdash; Copyright All Rights reserved
          </p>
        </div>
      </motion.div>

      <div className="relative z-0 h-[264px] overflow-hidden" data-footer-pattern-wrap>
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
