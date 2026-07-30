"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getConsent, setConsent, type ConsentChoice } from "@/lib/consent";

/* Bottom-right consent banner. It gates the only non-essential storage the
   site uses — the first-touch marketing attribution in lib/tracking.ts — so
   declining genuinely stops that being written. The choice itself is
   remembered, so the banner appears once per visitor. */
export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Read after mount so the server and client markup always match.
    if (!getConsent()) setOpen(true);
  }, []);

  function choose(choice: ConsentChoice) {
    setConsent(choice);
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 z-[80] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px]"
          exit={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
          initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
          role="region"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
          transition={{ duration: reducedMotion ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-2xl border border-white/10 bg-[#182230] p-5 shadow-[0_18px_50px_rgba(3,7,18,0.55)] backdrop-blur-sm">
            <p className="text-base font-semibold leading-6 text-white">We use cookies</p>
            <p className="mt-2 text-sm leading-5 text-[#d0d5dd]">
              We store a little information in your browser to remember where your visit came from,
              so referrals are credited correctly. Decline and we&rsquo;ll only keep what the site
              needs to work.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#175cd3] text-sm font-semibold text-white outline-none transition duration-150 ease-out hover:bg-[#164caa] focus-visible:ring-2 focus-visible:ring-white active:scale-[0.99]"
                onClick={() => choose("accepted")}
                type="button"
              >
                Accept
              </button>
              <button
                className="flex h-10 flex-1 items-center justify-center rounded-lg border border-white/20 text-sm font-semibold text-white outline-none transition duration-150 ease-out hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white active:scale-[0.99]"
                onClick={() => choose("declined")}
                type="button"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
