import type {
  SurveyAnswerValue,
  SurveyAudience,
  SurveyCompletionPayload,
  SurveyStatus,
} from "@/lib/survey/surveyTypes";

/* The Google Sheet is the store. The extended Apps Script speaks a small action
   protocol (see docs/apps-script-survey.md) and lives behind its OWN env var:
   the existing SHEETS_WEBHOOK_URL script is append-only, so sending it an
   action payload would just append a junk row. Until
   SHEETS_SURVEY_WEBHOOK_URL is set, every call here reports "unavailable" and
   the survey degrades gracefully instead of corrupting the live sheet. */

function endpoint(): string | null {
  const value = process.env.SHEETS_SURVEY_WEBHOOK_URL?.replace(/^﻿/, "").trim();
  return value || null;
}

export function isSurveyStoreConfigured(): boolean {
  return endpoint() !== null;
}

/* The email-lookup and email-send actions can identify a person from just an
   address, so unlike the token-paired actions they are gated behind a shared
   key: the Apps Script rejects them unless the caller presents the same value
   it holds in its Script Properties. */
function surveyApiKey(): string | null {
  const value = process.env.SHEETS_SURVEY_API_KEY?.replace(/^﻿/, "").trim();
  return value || null;
}

export function isSurveyEmailConfigured(): boolean {
  return endpoint() !== null && surveyApiKey() !== null;
}

type SheetResult<T> = { ok: true; data: T } | { ok: false; reason: "unavailable" | "error" };

async function callSheet<T>(action: string, data: Record<string, unknown>): Promise<SheetResult<T>> {
  const url = endpoint();
  if (!url) return { ok: false, reason: "unavailable" };

  try {
    const response = await fetch(url, {
      method: "POST",
      /* text/plain keeps Apps Script from issuing a CORS preflight, matching
         how the existing signup webhook is called. */
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...data }),
      redirect: "follow",
    });

    if (!response.ok) return { ok: false, reason: "error" };

    const text = await response.text();
    const parsed = JSON.parse(text) as { ok?: boolean; data?: T; error?: string };

    if (parsed.ok === false) {
      console.error(`Sheet action ${action} failed`, parsed.error);
      return { ok: false, reason: "error" };
    }

    return { ok: true, data: (parsed.data ?? parsed) as T };
  } catch (error) {
    console.error(`Sheet action ${action} failed`, error);
    return { ok: false, reason: "error" };
  }
}

/* Named fields only — the Apps Script maps these onto fixed columns, so column
   order never depends on object key order. */
export type SignupUpsert = {
  userId: string;
  email: string;
  launchListSubmissionId?: string;
  referredByCode?: string;
  referralCode?: string;
  referralUrl?: string;
  surveyStatus?: SurveyStatus;
  surveySessionId?: string;
  surveyTokenHash?: string;
  surveyResponseId?: string;
  surveyStartedAt?: string;
  surveyCompletedAt?: string;
};

export function upsertSignupRow(input: SignupUpsert) {
  return callSheet<{ updated: boolean }>("signup.upsert", input);
}

export type StoredSurveySession = {
  userId: string;
  firstName?: string;
  /* Server-side only — used for the Survey Responses row, never returned to
     the survey client. */
  email?: string;
  audience?: SurveyAudience;
  country?: string;
  surveyStatus?: SurveyStatus;
  currentStep?: number;
  answers?: Record<string, SurveyAnswerValue>;
  launchListSubmissionId?: string;
  referredByCode?: string;
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPage?: string;
  attributionCapturedAt?: string;
  surveyResponseId?: string;
};

/* Looked up by the hashed token AND the userId from the verified token, so a
   row can only be read by someone holding a valid signed link for it. */
export function getSurveySession(input: { userId: string; surveyTokenHash: string }) {
  return callSheet<StoredSurveySession>("survey.session.get", input);
}

/* Email-link flow (server-side only; key-gated). The identity returned here is
   used to mint a fresh token which is then EMAILED to that address — it is
   never handed to the browser that typed the email, which is what keeps one
   person's link from ever opening another person's data. */
export type EmailLookup = {
  userId: string;
  surveySessionId?: string;
  firstName?: string;
  audience?: SurveyAudience;
};

export function getSessionByEmail(email: string) {
  return callSheet<EmailLookup>("survey.session.byemail", {
    email,
    apiKey: surveyApiKey() ?? "",
  });
}

export function sendSurveyLinkEmail(input: {
  email: string;
  surveyUrl: string;
  firstName?: string;
}) {
  return callSheet<{ sent: boolean; cooldown?: boolean }>("survey.email.send", {
    ...input,
    apiKey: surveyApiKey() ?? "",
  });
}

export function saveSurveyProgress(input: {
  userId: string;
  surveySessionId: string;
  surveyTokenHash: string;
  currentStep: number;
  answers: Record<string, SurveyAnswerValue>;
  audience?: SurveyAudience;
}) {
  return callSheet<{ saved: boolean }>("survey.progress.save", {
    ...input,
    answersJson: JSON.stringify(input.answers),
    surveyStatus: "in_progress" satisfies SurveyStatus,
    surveyStartedAt: new Date().toISOString(),
  });
}

/* Idempotent on responseId: a retry updates the same row rather than adding a
   second response. */
export function upsertSurveyResponse(input: {
  payload: SurveyCompletionPayload;
  firstName?: string;
  email?: string;
  country?: string;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  surveyTokenHash: string;
}) {
  const { payload, utm } = input;

  return callSheet<{ created: boolean }>("survey.response.upsert", {
    responseId: payload.responseId,
    userId: payload.userId,
    surveySessionId: payload.surveySessionId,
    surveyTokenHash: input.surveyTokenHash,
    launchListSubmissionId: payload.launchListSubmissionId ?? "",
    referredByCode: payload.referredByCode ?? "",
    referralCode: payload.referralCode ?? "",
    audience: payload.instrument,
    routedBy: payload.routedBy,
    firstName: input.firstName ?? "",
    email: input.email ?? "",
    country: input.country ?? "",
    utmSource: utm.source ?? "",
    utmMedium: utm.medium ?? "",
    utmCampaign: utm.campaign ?? "",
    utmContent: utm.content ?? "",
    utmTerm: utm.term ?? "",
    currencyUsed: payload.currencyUsedInExamples ?? "",
    readiness: payload.readiness ?? "",
    timing: payload.timing ?? "",
    cohort: payload.cohort ?? "",
    payIntent: payload.payIntent.join(", "),
    conceptFlag: payload.conceptFlag ?? "",
    intelligencePriority: payload.intelligencePriority.join(", "),
    custodyVerbatim: payload.verbatims.custody ?? "",
    costVerbatim: payload.verbatims.cost ?? "",
    answersJson: JSON.stringify(payload.answers),
    startedAt: "",
    completedAt: payload.completedAt,
  });
}
