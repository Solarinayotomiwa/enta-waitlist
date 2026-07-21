import { NextResponse } from "next/server";

const emailPattern = /^\S+@\S+\.\S+$/;
const siteUrl = "https://www.entashiga.io";

type WaitlistInfo = {
  position?: number;
  referralLink?: string;
  referralId?: string;
};

function envValue(value: string | undefined) {
  return value?.replace(/^\uFEFF/, "").trim() ?? "";
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
    return new URL(referralLink).searchParams.get("ref") ?? undefined;
  } catch {
    return undefined;
  }
}

/* LaunchList attributes referrals via the `ref` query parameter on the
   submission endpoint, exactly as the visitor's landing URL carried it. */
function getLaunchListAction(formKey: string, input: { fields: Record<string, string> }) {
  const endpoint = new URL(`https://getlaunchlist.com/s/${formKey}`);
  const params = new URLSearchParams(input.fields.launchlist_query ?? "");

  for (const key of ["ref", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = input.fields[key];
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

async function registerWithLaunchList(input: {
  email: string;
  name: string;
  fields: Record<string, string>;
}): Promise<WaitlistInfo | null> {
  const formKey = envValue(process.env.GETLAUNCHLIST_FORM_KEY) || "S8WkO8";

  try {
    const body = new URLSearchParams();

    for (const [key, value] of Object.entries(input.fields)) {
      if (!value || key === "website" || key === "launchlist_query" || key === "ref") continue;
      body.set(key, value);
    }

    body.set("email", input.email);
    if (input.name) body.set("name", input.name);

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
        console.error("LaunchList redirected without a location");
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
        console.error("LaunchList thank-you page responded", thankYouResponse.status, errorText.slice(0, 200));
        return null;
      }

      return parseLaunchListHtml(await thankYouResponse.text());
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("LaunchList responded", response.status, errorText.slice(0, 200));
      return null;
    }

    return parseLaunchListHtml(await response.text());
  } catch (error) {
    console.error("LaunchList registration failed", error);
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
    interested_in_apis: field("interested_in_apis"),
    utm_source: field("utm_source"),
    utm_medium: field("utm_medium"),
    utm_campaign: field("utm_campaign"),
    utm_content: field("utm_content"),
    utm_term: field("utm_term"),
    ref: field("ref"),
    launchlist_query: field("launchlist_query"),
  };

  const webhookUrl = envValue(process.env.SHEETS_WEBHOOK_URL);

  if (!webhookUrl) {
    console.error("SHEETS_WEBHOOK_URL is not set");
    return NextResponse.json({ error: "Waitlist is not configured yet" }, { status: 503 });
  }

  try {
    const waitlist = await registerWithLaunchList({ email, name: row.name, fields: row });

    const sheetResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        ...row,
        // `ref_id` is only the Google Sheet's existing column key for the
        // referral code — it is not sent to any waitlist service.
        ref_id: row.ref,
        waitlist_position: waitlist?.position ? String(waitlist.position) : "",
        referral_link: waitlist?.referralLink ?? "",
        referral_id: waitlist?.referralId ?? "",
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
