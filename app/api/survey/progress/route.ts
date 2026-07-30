import { NextResponse } from "next/server";
import { isSurveyStoreConfigured, saveSurveyProgress } from "@/lib/survey/surveyStore";
import { hashSurveyToken, verifySurveyToken } from "@/lib/survey/surveyToken";
import type { SurveyAnswerValue, SurveyAudience } from "@/lib/survey/surveyTypes";

/* Saves a checkpoint. The client sends only its token, step and answers — the
   canonical userId and session id are read from the verified token, so a
   browser can never write progress onto someone else's record. */
export async function POST(request: Request) {
  let body: { token?: string; currentStep?: number; answers?: Record<string, SurveyAnswerValue> };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const payload = verifySurveyToken(body.token);

  if (!payload) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  if (!isSurveyStoreConfigured()) {
    /* Nothing to write to yet — the client keeps its local draft. */
    return NextResponse.json({ ok: true, saved: false, store: "unavailable" });
  }

  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
  const audience =
    typeof answers.type === "string" ? (answers.type as SurveyAudience) : payload.audience;

  const saved = await saveSurveyProgress({
    userId: payload.userId,
    surveySessionId: payload.surveySessionId,
    surveyTokenHash: hashSurveyToken(body.token as string),
    currentStep: Number.isFinite(body.currentStep) ? Number(body.currentStep) : 0,
    answers,
    audience,
  });

  return NextResponse.json({ ok: true, saved: saved.ok });
}
