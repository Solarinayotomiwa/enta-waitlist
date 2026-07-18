"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/tracking";

export function AttributionTracker() {
  useEffect(() => {
    function scrollToWaitlist() {
      document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const href = link.getAttribute("href") ?? "";
      if (href !== "#waitlist" && href !== "/#waitlist") return;

      event.preventDefault();
      if (window.location.hash !== "#waitlist") window.history.pushState(null, "", "/#waitlist");
      scrollToWaitlist();
    }

    captureAttribution();
    document.addEventListener("click", onClick);

    if (window.location.hash.startsWith("#waitlist")) {
      window.setTimeout(scrollToWaitlist, 350);
    }

    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
