"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/tracking";

export function AttributionTracker() {
  useEffect(() => {
    captureAttribution();

    // GetWaitlist referral links append the query after the hash
    // (/#waitlist?ref_id=XYZ), which breaks native anchor scrolling —
    // the browser looks for an element literally named "waitlist?ref_id=XYZ".
    if (window.location.hash.startsWith("#waitlist")) {
      window.setTimeout(() => {
        document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    }
  }, []);

  return null;
}
