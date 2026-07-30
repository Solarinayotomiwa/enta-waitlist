"use client";

import { useEffect } from "react";
import { CONSENT_EVENT } from "@/lib/consent";
import { captureAttribution } from "@/lib/tracking";

const formSectionId = "waitlist-form";

/* Scrolling to a section competes with images and animated sections still
   expanding the page, which can strand a smooth scroll partway — the form sits
   ~7,800px down, so a click from the navbar crosses every animated section on
   the way. Re-assert the position a couple of times until the target has
   settled near the top, but back off the moment the visitor scrolls or types
   themselves. The follow-ups are instant, so they also rescue the landing if
   the smooth scroll never ran at all. */
function scrollTargetIntoView(
  targetId: string,
  initialBehavior: ScrollBehavior,
  startDelay = 0,
) {
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  const cancelEvents = ["wheel", "touchstart", "keydown"] as const;

  for (const type of cancelEvents) {
    window.addEventListener(type, cancel, { once: true, passive: true });
  }

  const timers = [startDelay, startDelay + 700, startDelay + 1600].map((delay, index) =>
    window.setTimeout(() => {
      if (cancelled) return;

      const target = document.getElementById(targetId);
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
    /* Attribution is persisted before any scrolling or hash change happens —
       but only with consent (captureAttribution enforces that). Accepting the
       banner later re-runs it while the campaign is still in the URL. */
    captureAttribution();

    const onConsent = () => captureAttribution();
    window.addEventListener(CONSENT_EVENT, onConsent);

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
      /* The 80ms start lets a closing mobile menu release its scroll lock. */
      scrollTargetIntoView(targetId, "smooth", 80);
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
        releaseScroll = scrollTargetIntoView(formSectionId, "instant");
      }, 300);
      return () => {
        window.clearTimeout(settle);
        releaseScroll?.();
        document.removeEventListener("click", onClick);
        window.removeEventListener(CONSENT_EVENT, onConsent);
      };
    }

    if (hasFormHash) {
      const settle = window.setTimeout(() => {
        releaseScroll = scrollTargetIntoView(formSectionId, "smooth");
      }, 350);
      return () => {
        window.clearTimeout(settle);
        releaseScroll?.();
        document.removeEventListener("click", onClick);
        window.removeEventListener(CONSENT_EVENT, onConsent);
      };
    }

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener(CONSENT_EVENT, onConsent);
    };
  }, []);

  return null;
}
