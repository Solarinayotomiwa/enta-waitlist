"use client";

import { useLayoutEffect } from "react";

/* Fresh loads and hard refreshes must start at the hero. The History mount
   scroll was fixed at its source, but browsers also restore the previous
   scroll position on reload — this guard resets that. Deliberate hash links
   are left untouched so deep-linking keeps working. */
export function ScrollToTop() {
  useLayoutEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  return null;
}
