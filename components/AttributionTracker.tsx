"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/tracking";

export function AttributionTracker() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
