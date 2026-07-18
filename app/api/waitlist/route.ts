import { NextResponse } from "next/server";

const emailPattern = /^\S+@\S+\.\S+$/;
const siteUrl = "https://www.entashiga.io";

type WaitlistInfo = {
  position?: number;
  referralLink?: string;
  referralId?: string;
  provider?: "getwaitlist" | "getlaunchlist";
};

function envValue(value: string | undefined) {
  return value?.replace(/^\uFEFF/, "").trim() ?? "";
}

async function registerWithGetWaitlist(input: {
  email: string;
  name: string;
  refId: string;
  metadata: Record<string, string>;
}): Promise<WaitlistInfo | null> {
  const waitlistId = envValue(process.env.GETWAITLIST_ID);

  if (!waitlistId) return null;

  try {
    const response = await fetch("https://api.getwaitlist.com/api/v1/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        waitlist_id: Number(waitlistId),
        first_name: input.name || undefined,
        referral_link: input.refId ? `${siteUrl}/?ref_id=${encodeURIComponent(input.refId)}` : undefined,
        metadata: input.metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`GetWaitlist responded ${response.status}`);
    }

    const result = (await response.json()) as {
      priority?: number;
      referral_link?: string;
    };

    return {
      position: typeof result.priority === "number" ? result.priority : undefined,
      referralLink: typeof result.referral_link === "string" ? result.referral_link : undefined,
      provider: "getwaitlist",
    };
  } catch (error) {
    console.error("GetWaitlist registration failed", error);
    return null;
  }
}

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
    const url = new URL(referralLink);
    return url.searchParams.get("ref") ?? url.searchParams.get("ref_id") ?? undefined;
  } catch {
    return undefined;
  }
}

function getLaunchListAction(formKey: string, input: { fields: Record<string, string>; refId: string }) {
  const endpoint = new URL(`https://getlaunchlist.com/s/${formKey}`);
  const params = new URLSearchParams(input.fields.launchlist_query ?? "");

  for (const key of [
    "ref_id",
    "ref",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ]) {
    const value = input.fields[key] || (key === "ref_id" ? input.refId : "");
    if (value && !params.has(key)) params.set(key, value);
  }

  for (const [key, value] of params) endpoint.searchParams.set(key, value);
  return endpoint;
}

function parseLaunchListHtml(html: string): WaitlistInfo {
  const positionMatch =
    html.match(/current position is[\s\S]*?#([\d,]+)/i) ??
    html.match(/thank-you-position[\s\S]*?#([\d,]+)/i);
  const referralMatch =
    html.match(/data-clipboard-text="([^"]+)"/i) ??
    html.match(/class="[^"]*refer-url[^"]*"[^>]*>\s*([^<\s][^<]*)/i);
  const referralLink = referralMatch ? decodeHtml(referralMatch[1].trim()) : undefined;

  return {
    position: positionMatch ? Number(positionMatch[1].replace(/,/g, "")) : undefined,
    referralLink,
    referralId: referralIdFromLink(referralLink),
    provider: "getlaunchlist",
  };
}

async function registerWithGetLaunchList(input: {
  email: string;
  name: string;
  refId: string;
  fields: Record<string, string>;
}): Promise<WaitlistInfo | null> {
  const formKey =
    envValue(process.env.GETLAUNCHLIST_FORM_KEY) || envValue(process.env.LAUNCHLIST_KEY) || "S8WkO8";

  if (!formKey) return null;

  try {
    const body = new URLSearchParams();

    for (const [key, value] of Object.entries(input.fields)) {
      if (!value || key === "website" || key === "launchlist_query") continue;
      body.set(key, value);
    }

    body.set("email", input.email);
    if (input.name) body.set("name", input.name);
    if (input.refId) body.set("ref_id", input.refId);

    const response = await fetch(getLaunchListAction(formKey, input), {
      method: "POST",
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: siteUrl,
        Referer: `${siteUrl}/`,
        "User-Agent": "Mozilla/5.0",
      },
      body: body.toString(),
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        console.error("GetLaunchList redirected without a location");
        return null;
      }

      const thankYouUrl = new URL(location, "https://getlaunchlist.com");
      const thankYouResponse = await fetch(thankYouUrl, {
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          Referer: `${siteUrl}/`,
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!thankYouResponse.ok) {
        const errorText = await thankYouResponse.text().catch(() => "");
        console.error("GetLaunchList thank-you page responded", thankYouResponse.status, errorText.slice(0, 200));
        return null;
      }

      return parseLaunchListHtml(await thankYouResponse.text());
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("GetLaunchList responded", response.status, errorText.slice(0, 200));
      return null;
    }

    return parseLaunchListHtml(await response.text());
  } catch (error) {
    console.error("GetLaunchList registration failed", error);
    return null;
  }
}

export async function POST(request: Request) {
  let data: Record<string, unknown>;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof data.website === "string" && data.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const field = (key: string) => String(data[key] ?? "").trim().slice(0, 500);

  const audience = field("audience") === "business" ? "business" : "individual";
  const email = audience === "business" ? field("businessEmail") : field("email");

  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const row = {
    audience,
    name: audience === "business" ? field("contactName") : field("name"),
    company: field("companyName"),
    role: field("role"),
    volume: field("volume"),
    email,
    whatsapp: audience === "business" ? field("whatsapp") : field("contact"),
    country: field("country"),
    problem: field("problem"),
    utm_source: field("utm_source"),
    utm_medium: field("utm_medium"),
    utm_campaign: field("utm_campaign"),
    utm_content: field("utm_content"),
    utm_term: field("utm_term"),
    ref: field("ref"),
    ref_id: field("ref_id") || field("ref"),
    launchlist_query: field("launchlist_query"),
  };

  const webhookUrl = envValue(process.env.SHEETS_WEBHOOK_URL);

  if (!webhookUrl) {
    console.error("SHEETS_WEBHOOK_URL is not set");
    return NextResponse.json({ error: "Waitlist is not configured yet" }, { status: 503 });
  }

  try {
    const [getWaitlist, launchList] = await Promise.all([
      registerWithGetWaitlist({
        email,
        name: row.name,
        refId: row.ref_id,
        metadata: {
          audience,
          country: row.country,
          utm_source: row.utm_source,
          utm_medium: row.utm_medium,
          utm_campaign: row.utm_campaign,
          utm_content: row.utm_content,
          utm_term: row.utm_term,
        },
      }),
      registerWithGetLaunchList({ email, name: row.name, refId: row.ref_id, fields: row }),
    ]);

    const waitlist: WaitlistInfo | null = launchList || getWaitlist
      ? {
          position: launchList?.position ?? getWaitlist?.position,
          referralLink: launchList?.referralLink ?? getWaitlist?.referralLink,
          referralId: launchList?.referralId ?? getWaitlist?.referralId,
          provider: launchList?.provider ?? getWaitlist?.provider,
        }
      : null;

    const sheetResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        ...row,
        waitlist_provider: waitlist?.provider ?? "",
        waitlist_position: waitlist?.position ? String(waitlist.position) : "",
        referral_link: waitlist?.referralLink ?? "",
        referral_id: waitlist?.referralId ?? "",
        getlaunchlist_position: launchList?.position ? String(launchList.position) : "",
        getlaunchlist_referral_link: launchList?.referralLink ?? "",
        getlaunchlist_referral_id: launchList?.referralId ?? "",
        getwaitlist_position: getWaitlist?.position ? String(getWaitlist.position) : "",
        getwaitlist_referral_link: getWaitlist?.referralLink ?? "",
        getwaitlist_referral_id: getWaitlist?.referralId ?? "",
      }),
      redirect: "follow",
    });

    if (!sheetResponse.ok) {
      throw new Error(`Sheets webhook responded ${sheetResponse.status}`);
    }

    return NextResponse.json({ ok: true, waitlist });
  } catch (error) {
    console.error("Waitlist submission failed", error);
    return NextResponse.json({ error: "Submission failed, please try again" }, { status: 502 });
  }
}
