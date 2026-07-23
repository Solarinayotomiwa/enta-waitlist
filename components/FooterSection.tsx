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
  { label: "Learn more", href: "/#assets" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
  { label: "Join waitlist", href: "/#waitlist-form" },
] as const;

/* Brand glyphs exported from Figma node 830:3074 (viewBox 0 0 40 40). */
const socialLinks = [
  {
    label: "Instagram",
    href: "#",
    path: "M27.5 3.75H12.5C10.1801 3.75248 7.95596 4.67515 6.31556 6.31556C4.67515 7.95596 3.75248 10.1801 3.75 12.5V27.5C3.75248 29.8199 4.67515 32.044 6.31556 33.6844C7.95596 35.3249 10.1801 36.2475 12.5 36.25H27.5C29.8199 36.2475 32.044 35.3249 33.6844 33.6844C35.3249 32.044 36.2475 29.8199 36.25 27.5V12.5C36.2475 10.1801 35.3249 7.95596 33.6844 6.31556C32.044 4.67515 29.8199 3.75248 27.5 3.75ZM20 27.5C18.5166 27.5 17.0666 27.0601 15.8332 26.236C14.5999 25.4119 13.6386 24.2406 13.0709 22.8701C12.5032 21.4997 12.3547 19.9917 12.6441 18.5368C12.9335 17.082 13.6478 15.7456 14.6967 14.6967C15.7456 13.6478 17.082 12.9335 18.5368 12.6441C19.9917 12.3547 21.4997 12.5032 22.8701 13.0709C24.2406 13.6386 25.4119 14.5999 26.236 15.8332C27.0601 17.0666 27.5 18.5166 27.5 20C27.4979 21.9885 26.7071 23.8949 25.301 25.301C23.8949 26.7071 21.9885 27.4979 20 27.5ZM29.375 12.5C29.0042 12.5 28.6416 12.39 28.3333 12.184C28.025 11.978 27.7846 11.6851 27.6427 11.3425C27.5008 10.9999 27.4637 10.6229 27.536 10.2592C27.6084 9.89549 27.787 9.5614 28.0492 9.29917C28.3114 9.03695 28.6455 8.85837 29.0092 8.78603C29.3729 8.71368 29.7499 8.75081 30.0925 8.89273C30.4351 9.03464 30.728 9.27496 30.934 9.58331C31.14 9.89165 31.25 10.2542 31.25 10.625C31.25 11.1223 31.0525 11.5992 30.7008 11.9508C30.3492 12.3025 29.8723 12.5 29.375 12.5ZM25 20C25 20.9889 24.7068 21.9556 24.1573 22.7779C23.6079 23.6001 22.827 24.241 21.9134 24.6194C20.9998 24.9978 19.9945 25.0969 19.0245 24.9039C18.0546 24.711 17.1637 24.2348 16.4645 23.5355C15.7652 22.8363 15.289 21.9454 15.0961 20.9755C14.9031 20.0055 15.0022 19.0002 15.3806 18.0866C15.759 17.173 16.3999 16.3921 17.2221 15.8427C18.0444 15.2932 19.0111 15 20 15C21.3261 15 22.5979 15.5268 23.5355 16.4645C24.4732 17.4021 25 18.6739 25 20Z",
  },
  {
    label: "X (Twitter)",
    href: "#",
    path: "M33.5944 34.3516C33.4867 34.5476 33.3285 34.7112 33.1361 34.8252C32.9437 34.9393 32.7243 34.9996 32.5006 35H25.0006C24.7902 34.9999 24.5833 34.9468 24.3989 34.8454C24.2145 34.7441 24.0587 34.5979 23.9459 34.4203L17.6194 24.4781L8.42561 34.5906C8.20149 34.8314 7.89151 34.9741 7.56287 34.9878C7.23423 35.0016 6.91342 34.8852 6.67 34.664C6.42658 34.4428 6.28016 34.1345 6.26249 33.8061C6.24482 33.4776 6.35732 33.1554 6.57561 32.9094L16.2272 22.2844L6.44592 6.92188C6.32545 6.73288 6.25802 6.51497 6.25067 6.29097C6.24333 6.06697 6.29634 5.84511 6.40417 5.64863C6.51199 5.45215 6.67066 5.28827 6.86356 5.17416C7.05645 5.06004 7.27648 4.99989 7.50061 5H15.0006C15.211 5.00007 15.4179 5.05323 15.6023 5.15456C15.7867 5.25589 15.9425 5.40212 16.0553 5.57969L22.3819 15.5219L31.5756 5.40937C31.7997 5.16862 32.1097 5.02591 32.4383 5.01218C32.767 4.99845 33.0878 5.11481 33.3312 5.33602C33.5746 5.55724 33.7211 5.86549 33.7387 6.19394C33.7564 6.52239 33.6439 6.84457 33.4256 7.09063L23.774 17.7078L33.5553 33.0797C33.6751 33.2688 33.7419 33.4866 33.7488 33.7103C33.7556 33.934 33.7023 34.1555 33.5944 34.3516Z",
  },
  {
    label: "Telegram",
    href: "https://t.me/AfriSignal",
    path: "M35.7616 4.0919C35.5679 3.92466 35.3322 3.81344 35.08 3.77021C34.8278 3.72698 34.5686 3.75339 34.3303 3.84659L2.66468 16.2388C2.2159 16.4133 1.83596 16.7289 1.58206 17.138C1.32815 17.5471 1.21403 18.0276 1.25686 18.5072C1.29969 18.9868 1.49716 19.4395 1.81954 19.7972C2.14193 20.1549 2.57177 20.3981 3.04436 20.4903L11.2491 22.1013V31.2497C11.2474 31.748 11.3955 32.2353 11.6741 32.6485C11.9527 33.0616 12.349 33.3816 12.8116 33.5669C13.2734 33.7555 13.7813 33.8008 14.2693 33.6968C14.7572 33.5929 15.2026 33.3445 15.5475 32.9841L19.5037 28.881L25.7803 34.3747C26.2331 34.7764 26.8172 34.9987 27.4225 34.9997C27.6877 34.9995 27.9513 34.9579 28.2037 34.8763C28.6162 34.7454 28.9871 34.5088 29.2796 34.19C29.5721 33.8711 29.776 33.4812 29.8709 33.0591L36.2131 5.46846C36.2698 5.21963 36.2578 4.96006 36.1782 4.71756C36.0987 4.47506 35.9547 4.25878 35.7616 4.0919ZM27.4256 32.4997L14.5069 21.1716L33.1006 7.84503L27.4256 32.4997Z",
  },
  {
    label: "LinkedIn",
    href: "#",
    path: "M33.75 3.75H6.25C5.58696 3.75 4.95107 4.01339 4.48223 4.48223C4.01339 4.95107 3.75 5.58696 3.75 6.25V33.75C3.75 34.413 4.01339 35.0489 4.48223 35.5178C4.95107 35.9866 5.58696 36.25 6.25 36.25H33.75C34.413 36.25 35.0489 35.9866 35.5178 35.5178C35.9866 35.0489 36.25 34.413 36.25 33.75V6.25C36.25 5.58696 35.9866 4.95107 35.5178 4.48223C35.0489 4.01339 34.413 3.75 33.75 3.75ZM15 27.5C15 27.8315 14.8683 28.1495 14.6339 28.3839C14.3995 28.6183 14.0815 28.75 13.75 28.75C13.4185 28.75 13.1005 28.6183 12.8661 28.3839C12.6317 28.1495 12.5 27.8315 12.5 27.5V17.5C12.5 17.1685 12.6317 16.8505 12.8661 16.6161C13.1005 16.3817 13.4185 16.25 13.75 16.25C14.0815 16.25 14.3995 16.3817 14.6339 16.6161C14.8683 16.8505 15 17.1685 15 17.5V27.5ZM13.75 15C13.3792 15 13.0166 14.89 12.7083 14.684C12.4 14.478 12.1596 14.1851 12.0177 13.8425C11.8758 13.4999 11.8387 13.1229 11.911 12.7592C11.9834 12.3955 12.162 12.0614 12.4242 11.7992C12.6864 11.537 13.0205 11.3584 13.3842 11.286C13.7479 11.2137 14.1249 11.2508 14.4675 11.3927C14.8101 11.5346 15.103 11.775 15.309 12.0833C15.515 12.3916 15.625 12.7542 15.625 13.125C15.625 13.6223 15.4275 14.0992 15.0758 14.4508C14.7242 14.8025 14.2473 15 13.75 15ZM28.75 27.5C28.75 27.8315 28.6183 28.1495 28.3839 28.3839C28.1495 28.6183 27.8315 28.75 27.5 28.75C27.1685 28.75 26.8505 28.6183 26.6161 28.3839C26.3817 28.1495 26.25 27.8315 26.25 27.5V21.875C26.25 21.0462 25.9208 20.2513 25.3347 19.6653C24.7487 19.0792 23.9538 18.75 23.125 18.75C22.2962 18.75 21.5013 19.0792 20.9153 19.6653C20.3292 20.2513 20 21.0462 20 21.875V27.5C20 27.8315 19.8683 28.1495 19.6339 28.3839C19.3995 28.6183 19.0815 28.75 18.75 28.75C18.4185 28.75 18.1005 28.6183 17.8661 28.3839C17.6317 28.1495 17.5 27.8315 17.5 27.5V17.5C17.5016 17.1938 17.6154 16.8989 17.82 16.6711C18.0246 16.4433 18.3057 16.2985 18.61 16.2642C18.9142 16.2299 19.2205 16.3085 19.4707 16.485C19.7208 16.6615 19.8975 16.9237 19.9672 17.2219C20.8128 16.6482 21.7987 16.3158 22.819 16.2602C23.8393 16.2046 24.8554 16.428 25.7584 16.9063C26.6613 17.3847 27.4169 18.1 27.9439 18.9754C28.471 19.8508 28.7497 20.8532 28.75 21.875V27.5Z",
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
        <div className="flex max-w-[712px] flex-col items-start gap-12 lg:gap-20">
          <div className="flex flex-col items-start">
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
              Emirates. Company number 11065. Enta offers its products and services in partnership
              with licensed transmitters in their respective jurisdictions.
            </p>
            <div className="mt-8 flex items-center gap-6">
              {socialLinks.map((social) => (
                <a
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center text-[#cecfd2] transition-colors duration-200 ease-out hover:text-white"
                  href={social.href}
                  key={social.label}
                  rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                >
                  <svg aria-hidden="true" className="size-10" fill="currentColor" viewBox="0 0 40 40">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <p className="text-base leading-6 text-[#8f9fa3]">
            &copy; 2026 &mdash; Copyright All Rights reserved
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end lg:pt-16">
          <nav className="flex flex-col gap-4 lg:items-end">
            {footerLinks.map((link) => (
              <a
                className="whitespace-nowrap text-xl leading-[30px] text-white transition-opacity duration-200 ease-out hover:opacity-70 lg:text-right"
                href={link.href}
                key={link.label}
              >
                {link.label}
              </a>
            ))}
          </nav>
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
