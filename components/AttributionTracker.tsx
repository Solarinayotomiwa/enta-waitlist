"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/tracking";

const formSectionId = "waitlist-form";

function scrollToWaitlistForm(behavior: ScrollBehavior) {
  document.getElementById(formSectionId)?.scrollIntoView({ behavior, block: "start" });
}

export function AttributionTracker() {
  useEffect(() => {
    captureAttribution();

    /* "Join Waitlist" anchors scroll to the form while PRESERVING the current
       query string, so a pending ?ref=... referral code is never erased. */
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const href = link.getAttribute("href") ?? "";
      if (href !== "#waitlist-form" && href !== "/#waitlist-form") return;

      event.preventDefault();
      const target = `${window.location.search}#${formSectionId}`;
      if (window.location.hash !== `#${formSectionId}`) {
        window.history.pushState(null, "", `/${target}`);
      }
      scrollToWaitlistForm("smooth");
    }

    document.addEventListener("click", onClick);

    /* Initial-scroll precedence:
       1. LaunchList referral (?ref=...) → jump to the waitlist form
       2. Deliberate hash → the browser's native anchor navigation
       3. Otherwise → hero (ScrollToTop guards scroll restoration). */
    const referralCode = new URLSearchParams(window.location.search).get("ref");

    if (referralCode) {
      const settle = window.setTimeout(() => scrollToWaitlistForm("instant"), 300);
      return () => {
        window.clearTimeout(settle);
        document.removeEventListener("click", onClick);
      };
    }

    if (window.location.hash === `#${formSectionId}` || window.location.hash === "#waitlist") {
      window.setTimeout(() => scrollToWaitlistForm("smooth"), 350);
    }

    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
