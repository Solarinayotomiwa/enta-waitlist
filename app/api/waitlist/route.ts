import { NextResponse } from "next/server";

const emailPattern = /^\S+@\S+\.\S+$/;
const siteUrl = "https://www.entashiga.io";

type WaitlistInfo = {
  position?: number;
  referralLink?: string;
};

async function registerWithGetWaitlist(input: {
  email: string;
  name: string;
  refId: string;
  metadata: Record<string, string>;
}): Promise<WaitlistInfo | null> {
  // Strip BOM/whitespace that shell pipelines can smuggle into the env value.
  const waitlistId = process.env.GETWAITLIST_ID?.replace(/^\uFEFF/, "").trim();

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
    };
  } catch (error) {
    // Referral tracking is best-effort: the signup itself must still succeed.
    console.error("GetWaitlist registration failed", error);
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

  // Honeypot: real users never fill this hidden field. Pretend success for bots.
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
    ref_id: field("ref_id"),
  };

  // Strip BOM/whitespace that shell pipelines can smuggle into the env value.
  const webhookUrl = process.env.SHEETS_WEBHOOK_URL?.replace(/^\uFEFF/, "").trim();

  if (!webhookUrl) {
    console.error("SHEETS_WEBHOOK_URL is not set");
    return NextResponse.json({ error: "Waitlist is not configured yet" }, { status: 503 });
  }

  try {
    const [sheetResponse, waitlist] = await Promise.all([
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(row),
        redirect: "follow",
      }),
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
        },
      }),
    ]);

    if (!sheetResponse.ok) {
      throw new Error(`Sheets webhook responded ${sheetResponse.status}`);
    }

    return NextResponse.json({ ok: true, waitlist });
  } catch (error) {
    console.error("Waitlist submission failed", error);
    return NextResponse.json({ error: "Submission failed, please try again" }, { status: 502 });
  }
}
