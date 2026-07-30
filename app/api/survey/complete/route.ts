import { NextResponse } from "next/server";
import { buildCompletionPayload } from "@/lib/survey/surveyPayload";
import {
  getSurveySession,
  isSurveyStoreConfigured,
  upsertSignupRow,
  upsertSurveyResponse,
} from "@/lib/survey/surveyStore";
import { hashSurveyToken, newResponseId, verifySurveyToken } from "@/lib/survey/surveyToken";
import type { SurveyAnswerValue, SurveyAudience } from "@/lib/survey/surveyTypes";

/* Completion. The browser sends only its token and answers; every identity and
   attribution field is resolved server-side from the token and the stored
   signup row. The responseId is derived from the session id, so submitting
   twice updates one response instead of creating a duplicate. */
export async function POST(request: Request) {
  let body: { token?: string; answers?: Record<string, SurveyAnswerValue> };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const payload = verifySurveyToken(body.token);

  if (!payload) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
  const surveyTokenHash = hashSurveyToken(body.token as string);
  const responseId = newResponseId(payload.surveySessionId);

  const forked = typeof answers.fork === "string";
  const audience: SurveyAudience =
    (typeof answers.type === "string" ? (answers.type as SurveyAudience) : undefined) ??
    payload.audience ??
    "individual";

  if (!isSurveyStoreConfigured()) {
    /* The response cannot be stored yet. Report it honestly so the client shows
       a completed state without pretending the data was saved. */
    console.error("Survey completed but SHEETS_SURVEY_WEBHOOK_URL is not configured", {
      responseId,
    });

    return NextResponse.json({ ok: true, stored: false, store: "unavailable", responseId });
  }

  const session = await getSurveySession({ userId: payload.userId, surveyTokenHash });
  const stored = session.ok ? session.data : null;

  const completion = buildCompletionPayload({
    responseId,
    userId: payload.userId,
    surveySessionId: payload.surveySessionId,
    launchListSubmissionId: stored?.launchListSubmissionId,
    /* Kept strictly apart: referredByCode belongs to whoever referred this
       user, referralCode is this user's own code. */
    referredByCode: stored?.referredByCode,
    referralCode: stored?.referralCode,
    audience,
    routedBy: forked ? "survey_fork" : "waitlist_tag",
    country: stored?.country,
    answers,
  });

  const response = await upsertSurveyResponse({
    payload: completion,
    firstName: stored?.firstName,
    email: stored?.email,
    country: stored?.country,
    utm: {
      source: stored?.utmSource,
      medium: stored?.utmMedium,
      campaign: stored?.utmCampaign,
      content: stored?.utmContent,
      term: stored?.utmTerm,
    },
    surveyTokenHash,
  });

  /* Link completion back onto the original signup row — same userId, no new
     signup row and no second LaunchList submission. */
  await upsertSignupRow({
    userId: payload.userId,
    email: stored?.email ?? "",
    surveyStatus: "completed",
    surveySessionId: payload.surveySessionId,
    surveyTokenHash,
    surveyResponseId: responseId,
    surveyCompletedAt: completion.completedAt,
  });

  return NextResponse.json({
    ok: true,
    stored: response.ok,
    responseId,
    cohort: completion.cohort,
    audience: completion.instrument,
  });
}
