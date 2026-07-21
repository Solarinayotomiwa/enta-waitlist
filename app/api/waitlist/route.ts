import { NextResponse } from "next/server";

const emailPattern = /^\S+@\S+\.\S+$/;

function envValue(value: string | undefined) {
  return value?.replace(/^\uFEFF/, "").trim() ?? "";
}

/* This route only records the signup in the Google Sheet. The LaunchList
   registration happens in the visitor's browser (lib/launchlist.ts) because
   LaunchList's Cloudflare protection rejects requests from Vercel's
   datacenter IPs — the client sends the parsed result along for the sheet. */
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

  const waitlist =
    data.waitlist && typeof data.waitlist === "object"
      ? (data.waitlist as Record<string, unknown>)
      : {};
  const waitlistField = (key: string) => String(waitlist[key] ?? "").trim().slice(0, 500);

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
    // `ref_id` is only the Google Sheet's existing column key for the
    // referral code — it is not sent to any waitlist service.
    ref_id: field("ref"),
    waitlist_position: waitlistField("position"),
    referral_link: waitlistField("referralLink"),
    referral_id: waitlistField("referralId"),
  };

  const webhookUrl = envValue(process.env.SHEETS_WEBHOOK_URL);

  if (!webhookUrl) {
    console.error("SHEETS_WEBHOOK_URL is not set");
    return NextResponse.json({ error: "Waitlist is not configured yet" }, { status: 503 });
  }

  try {
    const sheetResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(row),
      redirect: "follow",
    });

    if (!sheetResponse.ok) {
      throw new Error(`Sheets webhook responded ${sheetResponse.status}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Waitlist submission failed", error);
    return NextResponse.json({ error: "Submission failed, please try again" }, { status: 502 });
  }
}
