"use client";

import { useLayoutEffect } from "react";

/* Fresh loads and hard refreshes must start at the hero — browsers restore
   the previous scroll position on reload; this guard resets that. Deliberate
   hash links keep native anchor navigation, and LaunchList referral visits
   (?ref=...) are excluded because AttributionTracker sends them to the
   waitlist form instead. */
export function ScrollToTop() {
  useLayoutEffect(() => {
    const hasReferral = new URLSearchParams(window.location.search).has("ref");

    if (!window.location.hash && !hasReferral) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  return null;
}
