import { instruments } from "@/lib/survey/surveyEngine";
import { localCurrency } from "@/lib/survey/surveyEngine";
import type {
  SurveyAnswerValue,
  SurveyAudience,
  SurveyCompletionPayload,
} from "@/lib/survey/surveyTypes";

function asArray(value: SurveyAnswerValue | undefined): string[] {
  if (Array.isArray(value)) return value;
  return typeof value === "string" && value ? [value] : [];
}

function asText(value: SurveyAnswerValue | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function cohortOf(readiness: string | undefined, timing: string | undefined): string {
  const readyNow = /Ready now/i.test(readiness ?? "");
  const soon = /This month|This quarter/i.test(timing ?? "");

  if (readyNow && soon) return "First contact";
  if (readyNow || soon) return "Pilot pool";
  return "Nurture — revisit at launch";
}

/* Themes come from the question definitions, so the payload keeps the research
   framing even as copy changes. */
function themeMap(audience: SurveyAudience): Record<string, string> {
  const map: Record<string, string> = {};

  for (const step of instruments[audience].steps) {
    map[step.id] = step.theme;
    if (step.more) map[`${step.id}_note`] = step.theme;
  }

  map.currency_manual = "context";
  map.fork = "meta";

  return map;
}

/* Identity fields are passed in from the verified session — never from the
   browser — so a client cannot claim someone else's userId or referral code. */
export function buildCompletionPayload(input: {
  responseId: string;
  userId: string;
  surveySessionId: string;
  launchListSubmissionId?: string;
  referredByCode?: string;
  referralCode?: string;
  audience: SurveyAudience;
  routedBy: "waitlist_tag" | "survey_fork";
  country?: string;
  answers: Record<string, SurveyAnswerValue>;
}): SurveyCompletionPayload {
  const { answers, audience } = input;
  const instrument = instruments[audience];
  const themes = themeMap(audience);

  const readiness = asText(answers.ready);
  const timing = asText(answers.timing);
  const costs = asArray(answers.q6_cost);
  const custody = asArray(answers.q3_custody);

  return {
    responseId: input.responseId,
    userId: input.userId,
    surveySessionId: input.surveySessionId,
    launchListSubmissionId: input.launchListSubmissionId,
    referredByCode: input.referredByCode,
    referralCode: input.referralCode,
    instrument: audience,
    routedBy: input.routedBy,
    currencyUsedInExamples:
      asText(answers.currency_manual) ?? localCurrency(input.country) ?? undefined,
    readiness,
    timing,
    cohort: cohortOf(readiness, timing),
    payIntent: costs.map((cost) => instrument.payIntent[cost]).filter(Boolean),
    conceptFlag: custody.some((value) => /not sure/i.test(value)) ? "comprehension gap" : undefined,
    intelligencePriority: asArray(answers.q4_intel),
    verbatims: {
      custody: asText(answers.q3_custody_note),
      cost: asText(answers.q6_cost_note),
    },
    answers: Object.keys(answers).reduce<SurveyCompletionPayload["answers"]>((result, key) => {
      result[key] = { value: answers[key] ?? null, theme: themes[key] ?? "meta" };
      return result;
    }, {}),
    completedAt: new Date().toISOString(),
  };
}
