import { NextResponse } from "next/server";
import {
  getSessionByEmail,
  isSurveyEmailConfigured,
  sendSurveyLinkEmail,
  upsertSignupRow,
} from "@/lib/survey/surveyStore";
import {
  createSurveyToken,
  hashSurveyToken,
  newSurveySessionId,
  surveyUrl,
} from "@/lib/survey/surveyToken";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* "Email me my survey link." The response is identical whether or not the
   address is on the waitlist, so this endpoint can't be used to test which
   emails exist — and the minted link travels only to that inbox, never back
   to the browser that asked. The address itself is never logged. */
export async function POST(request: Request) {
  let body: { email?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 320);

  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const generic = NextResponse.json({ ok: true });

  if (!isSurveyEmailConfigured()) {
    console.error("Survey link requested but SHEETS_SURVEY_WEBHOOK_URL/SHEETS_SURVEY_API_KEY are not both set");
    return generic;
  }

  try {
    const lookup = await getSessionByEmail(email);
    if (!lookup.ok) return generic;

    const surveySessionId = lookup.data.surveySessionId || newSurveySessionId();
    const token = createSurveyToken({
      userId: lookup.data.userId,
      surveySessionId,
      audience: lookup.data.audience,
      firstName: lookup.data.firstName,
    });

    /* The fresh link becomes the row's active credential. If an older link is
       later opened, it still answers in token-only mode; the sheet session now
       belongs to the link the person actually asked for. */
    await upsertSignupRow({
      userId: lookup.data.userId,
      email,
      surveySessionId,
      surveyTokenHash: hashSurveyToken(token),
    });

    const origin = new URL(request.url).origin;
    await sendSurveyLinkEmail({
      email,
      surveyUrl: surveyUrl(origin, token),
      firstName: lookup.data.firstName,
    });
  } catch (error) {
    /* Same outward response on any failure; the detail stays server-side. */
    console.error("Survey link email failed", error instanceof Error ? error.message : error);
  }

  return generic;
}
