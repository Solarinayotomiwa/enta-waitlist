import { NextResponse } from "next/server";
import { firstNameOf } from "@/lib/survey/surveyEngine";
import { getSurveySession, isSurveyStoreConfigured } from "@/lib/survey/surveyStore";
import { hashSurveyToken, verifySurveyToken } from "@/lib/survey/surveyToken";
import type { SurveyParticipant } from "@/lib/survey/surveyTypes";

/* Resolves a survey link into the minimum the client needs to render. Identity
   comes from the signed token; display details come from the Sheet. Nothing
   here returns an email, LaunchList id, token hash or another user's data. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t");
  const payload = verifySurveyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const participant: SurveyParticipant = {
    userId: payload.userId,
    audience: payload.audience,
    surveyStatus: "not_started",
  };

  if (!isSurveyStoreConfigured()) {
    /* Token-only mode: the survey still runs and completion is attempted, but
       there is no stored name or saved progress to return yet. */
    return NextResponse.json({ participant, store: "unavailable" });
  }

  const session = await getSurveySession({
    userId: payload.userId,
    surveyTokenHash: hashSurveyToken(token as string),
  });

  if (!session.ok) {
    return NextResponse.json({ participant, store: session.reason });
  }

  const stored = session.data;

  return NextResponse.json({
    store: "ok",
    participant: {
      userId: payload.userId,
      firstName: firstNameOf(stored.firstName) || undefined,
      audience: stored.audience ?? payload.audience,
      country: stored.country,
      surveyStatus: stored.surveyStatus ?? "not_started",
      currentStep: stored.currentStep,
      answers: stored.answers,
    } satisfies SurveyParticipant,
  });
}
