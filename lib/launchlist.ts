import { type StoredAttribution, TRACKING_KEYS, trackingQueryString } from "@/lib/tracking";

const siteUrl = "https://www.entashiga.io";

export type WaitlistInfo = {
  position?: number;
  referralLink?: string;
  referralId?: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function referralIdFromLink(referralLink: string | undefined) {
  if (!referralLink) return undefined;

  try {
    return new URL(referralLink).searchParams.get("ref") ?? undefined;
  } catch {
    return undefined;
  }
}

function parseThankYouHtml(html: string): WaitlistInfo {
  const positionMatch =
    html.match(/current position is[\s\S]*?#([\d,]+)/i) ??
    html.match(/thank-you-position[\s\S]*?#([\d,]+)/i);
  const referralMatch =
    html.match(/data-clipboard-text="([^"]+)"/i) ??
    html.match(/class="[^"]*refer-url[^"]*"[^>]*>\s*([^<\s][^<]*)/i);
  const rawLink = referralMatch ? decodeHtml(referralMatch[1].trim()) : undefined;
  const referralId = referralIdFromLink(rawLink);

  return {
    position: positionMatch ? Number(positionMatch[1].replace(/,/g, "")) : undefined,
    // LaunchList builds the link from the website URL saved in its dashboard,
    // which can lag behind the live domain — keep its ref code, use our host.
    referralLink: referralId ? `${siteUrl}/?ref=${referralId}` : rawLink,
    referralId,
  };
}

/* LaunchList credits referrers via the `ref` query param on the submission
   endpoint. Its Cloudflare protection rejects requests from datacenter IPs
   (Vercel functions get a 403 challenge page), so this must run in the
   visitor's browser — the endpoint allows cross-origin fetch. */
export async function submitToLaunchList(input: {
  email: string;
  name: string;
  fields: Record<string, string>;
  tracking: StoredAttribution;
}): Promise<WaitlistInfo | null> {
  const formKey = process.env.NEXT_PUBLIC_GETLAUNCHLIST_FORM_KEY?.trim() || "S8WkO8";

  try {
    const endpoint = new URL(`https://getlaunchlist.com/s/${formKey}`);

    /* `ref` and the UTMs ride the endpoint query for LaunchList's native
       referral + campaign capture… */
    for (const [key, value] of new URLSearchParams(trackingQueryString(input.tracking))) {
      endpoint.searchParams.set(key, value);
    }

    const body = new URLSearchParams();
    body.set("email", input.email);
    if (input.name) body.set("name", input.name);

    for (const [key, value] of Object.entries(input.fields)) {
      if (value) body.set(key, value);
    }

    /* …and are also submitted as custom fields so every UTM (notably
       utm_content and utm_term) shows on the signup in the dashboard. */
    for (const key of TRACKING_KEYS) {
      if (key === "ref") continue;

      const value = input.tracking[key];
      if (value) body.set(key, value);
    }

    if (input.tracking.landingPage) body.set("landing_page", input.tracking.landingPage);
    if (input.tracking.capturedAt) body.set("attribution_captured_at", input.tracking.capturedAt);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) return null;
    return parseThankYouHtml(await response.text());
  } catch {
    return null;
  }
}
