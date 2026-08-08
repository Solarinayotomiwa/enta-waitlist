import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { firstNameOf } from "@/lib/survey/surveyEngine";
import { isSurveyStoreConfigured, upsertSignupRow } from "@/lib/survey/surveyStore";
import {
  createSurveyToken,
  thankYouUrl,
  hashSurveyToken,
  newSurveySessionId,
  surveyUrl,
} from "@/lib/survey/surveyToken";
import type { SurveyAudience } from "@/lib/survey/surveyTypes";

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

  /* ENTA's own canonical id for this signup — opaque, server-generated, and the
     key that links the LaunchList submission, the sheet row, the survey session
     and the survey response. Never the email address. */
  const userId = randomUUID();
  const surveySessionId = newSurveySessionId();

  const row = {
    user_id: userId,
    survey_session_id: surveySessionId,
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
    landing_page: field("landing_page"),
    attribution_captured_at: field("attribution_captured_at"),
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

    /* Mint the survey session only after the signup itself is safely recorded,
       so a survey link never exists for a signup that failed. */
    let survey: {
      surveySessionId: string;
      surveyUrl: string;
      thankYouUrl: string;
    } | null = null;

    let issuedToken: string | null = null;

    try {
      /* The first name and the user's own referral code travel inside the signed
         token, so /thankyou and /interview can greet the signup and offer their
         share link without either value appearing in a URL. */
      const token = createSurveyToken({
        userId,
        surveySessionId,
        audience: audience as SurveyAudience,
        firstName: firstNameOf(row.name),
        referralCode: waitlistField("referralId"),
      });

      const origin = new URL(request.url).origin;

      issuedToken = token;
      survey = {
        surveySessionId,
        surveyUrl: surveyUrl(origin, token),
        thankYouUrl: thankYouUrl(origin, token),
      };

      /* Records the identity + referral columns against the row and stores the
         hashed token so the session can be resolved and revoked later. No-op
         until the extended Apps Script is configured. */
      if (isSurveyStoreConfigured()) {
        await upsertSignupRow({
          userId,
          email,
          launchListSubmissionId: waitlistField("submissionId"),
          referredByCode: row.ref,
          referralCode: waitlistField("referralId"),
          referralUrl: waitlistField("referralLink"),
          surveyStatus: "not_started",
          surveySessionId,
          surveyTokenHash: hashSurveyToken(token),
        });
      }
    } catch (error) {
      /* A missing SURVEY_TOKEN_SECRET must not fail a good signup — the modal
         shows its "couldn't open the survey just yet" state instead. */
      console.error("Survey session could not be created", error);
    }

    const response = NextResponse.json({
      ok: true,
      user: {
        userId,
        firstName: firstNameOf(row.name),
        audience,
      },
      referral: {
        referredByCode: row.ref || undefined,
        referralCode: waitlistField("referralId") || undefined,
        referralUrl: waitlistField("referralLink") || undefined,
      },
      survey,
    });

    /* Same-browser recognition for the generic survey link in the welcome
       email: /interview with no ?t= falls back to this cookie, so a signup
       who skipped the popup can still open their own survey later. HttpOnly —
       scripts on the page can never read the token. */
    if (issuedToken) {
      response.cookies.set("enta_survey", issuedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Waitlist submission failed", error);
    return NextResponse.json({ error: "Submission failed, please try again" }, { status: 502 });
  }
}
