import { type StoredAttribution, TRACKING_KEYS, trackingQueryString } from "@/lib/tracking";

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

type LaunchListPayload = Record<string, unknown>;

/* The paid plan answers the submission endpoint with JSON. Its exact field
   names aren't documented, so look for every plausible spelling — shallow
   first, then one level into a `data`/`user`/`signup` style wrapper. */
const POSITION_KEYS = ["position", "priority", "rank", "current_position", "waitlist_position"];
const LINK_KEYS = ["referral_link", "referral_url", "ref_link", "share_link", "share_url"];
const CODE_KEYS = ["ref_id", "referral_code", "referral_id", "ref", "code"];

function findValue(payload: LaunchListPayload, keys: readonly string[]) {
  for (const key of keys) {
    if (payload[key] !== undefined) return payload[key];
  }

  for (const value of Object.values(payload)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;

    for (const key of keys) {
      const nested = (value as LaunchListPayload)[key];
      if (nested !== undefined) return nested;
    }
  }

  return undefined;
}

function parseJsonPayload(payload: LaunchListPayload): WaitlistInfo {
  const positionValue = Number(findValue(payload, POSITION_KEYS));
  const linkValue = findValue(payload, LINK_KEYS);
  const codeValue = findValue(payload, CODE_KEYS);

  const rawLink = typeof linkValue === "string" ? decodeHtml(linkValue.trim()) : undefined;
  const referralId =
    typeof codeValue === "string" && codeValue.trim() ? codeValue.trim() : referralIdFromLink(rawLink);

  if (!Number.isFinite(positionValue) && !referralId) {
    // The signup itself succeeded, so let the visitor through — but record the
    // shape so the key list above can be corrected.
    console.error("LaunchList returned an unrecognised success payload", payload);
  }

  return {
    position: Number.isFinite(positionValue) ? positionValue : undefined,
    // Keep LaunchList's ref code, but build the share link from the domain the
    // visitor is actually on — the dashboard URL can lag behind the live site.
    referralLink: referralId ? `${window.location.origin}/?ref=${referralId}` : rawLink,
    referralId,
  };
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
    // which can lag behind the live domain — keep its ref code, but point the
    // share link at whatever domain the visitor is actually on.
    referralLink: referralId ? `${window.location.origin}/?ref=${referralId}` : rawLink,
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
  const formKey = process.env.NEXT_PUBLIC_GETLAUNCHLIST_FORM_KEY?.trim() || "csCEH5";

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
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    /* Read the body once and branch on what came back, so a signup is never
       submitted twice: paid plans answer with JSON, and anything else (e.g. a
       plan without API access) still returns the thank-you page. */
    const text = await response.text();
    let payload: LaunchListPayload | null = null;

    try {
      const parsed: unknown = JSON.parse(text);
      if (parsed && typeof parsed === "object") payload = parsed as LaunchListPayload;
    } catch {
      // Not JSON — fall through to the HTML parser below.
    }

    if (payload) {
      if (!response.ok || payload.ok === false) {
        console.error("LaunchList rejected the signup", payload.error ?? response.status);
        return null;
      }

      return parseJsonPayload(payload);
    }

    if (!response.ok) return null;
    return parseThankYouHtml(text);
  } catch {
    return null;
  }
}
