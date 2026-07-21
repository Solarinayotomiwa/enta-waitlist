"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/tracking";

const formSectionId = "waitlist-form";

/* Scrolling to the form right after load competes with images and animated
   sections still expanding the page, which can strand a smooth scroll partway.
   Re-assert the position a couple of times until the form has settled near the
   top — but back off the moment the visitor scrolls or types themselves. */
function scrollFormIntoView(initialBehavior: ScrollBehavior) {
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  const cancelEvents = ["wheel", "touchstart", "keydown"] as const;

  for (const type of cancelEvents) {
    window.addEventListener(type, cancel, { once: true, passive: true });
  }

  const timers = [0, 700, 1600].map((delay, index) =>
    window.setTimeout(() => {
      if (cancelled) return;

      const target = document.getElementById(formSectionId);
      if (!target) return;
      if (index > 0 && Math.abs(target.getBoundingClientRect().top) < 140) return;

      target.scrollIntoView({ behavior: index === 0 ? initialBehavior : "instant", block: "start" });
    }, delay),
  );

  return () => {
    for (const timer of timers) window.clearTimeout(timer);
    for (const type of cancelEvents) window.removeEventListener(type, cancel);
  };
}

export function AttributionTracker() {
  useEffect(() => {
    /* Attribution is persisted before any scrolling or hash change happens. */
    captureAttribution();

    /* Every in-page anchor ("#section" or "/#section") scrolls while
       PRESERVING the current query string, so pending ?ref= / UTM parameters
       are never erased by navigation. */
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank") return;

      const href = link.getAttribute("href") ?? "";
      const match = href.match(/^\/?#([a-z][\w-]*)$/i);
      if (!match) return;

      const targetId = match[1];

      if (window.location.pathname !== "/" && href.startsWith("/")) {
        /* From the blog pages, go home with the query string intact. */
        event.preventDefault();
        window.location.assign(`/${window.location.search}#${targetId}`);
        return;
      }

      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      if (window.location.hash !== `#${targetId}`) {
        const url = new URL(window.location.href);
        url.hash = targetId;
        window.history.pushState(null, "", url.toString());
      }
      /* Slight delay lets the closing mobile menu release its scroll lock. */
      window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }

    document.addEventListener("click", onClick);

    /* Initial-scroll precedence:
       1. LaunchList referral (?ref=...) → open at the waitlist form
       2. Deliberate #waitlist-form hash (with or without UTMs) → the form
       3. Any other hash → the browser's native anchor navigation
       4. Otherwise → hero (ScrollToTop guards scroll restoration). */
    const hasReferral = new URLSearchParams(window.location.search).has("ref");
    const hasFormHash =
      window.location.hash === `#${formSectionId}` || window.location.hash === "#waitlist";

    let releaseScroll: (() => void) | undefined;

    if (hasReferral) {
      const settle = window.setTimeout(() => {
        releaseScroll = scrollFormIntoView("instant");
      }, 300);
      return () => {
        window.clearTimeout(settle);
        releaseScroll?.();
        document.removeEventListener("click", onClick);
      };
    }

    if (hasFormHash) {
      const settle = window.setTimeout(() => {
        releaseScroll = scrollFormIntoView("smooth");
      }, 350);
      return () => {
        window.clearTimeout(settle);
        releaseScroll?.();
        document.removeEventListener("click", onClick);
      };
    }

    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
