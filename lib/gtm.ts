/* Google Tag Manager helpers. The container itself is loaded in app/layout.tsx;
   this module only pushes structured events into the dataLayer, so components
   never touch window.dataLayer directly. */

export const GTM_CONTAINER_ID = "GTM-582LGN6S";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/* Fired at the moment the success popup opens — after LaunchList has accepted
   the signup. Spec: growth manager's GTM doc (waitlist_joined). UTM values come
   from the same first-touch attribution the signup row stores, so GTM and the
   sheet always agree on the source. */
export function trackWaitlistJoined(input: {
  audience: "individual" | "business";
  utmSource?: string;
  utmCampaign?: string;
}): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: "waitlist_joined",
    brand: "enta",
    waitlist_type: input.audience,
    utm_source: input.utmSource || "direct",
    utm_campaign: input.utmCampaign || "not_set",
  });
}
