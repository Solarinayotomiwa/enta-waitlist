import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SurveyExperience } from "@/components/survey/SurveyExperience";
import { SurveyLinkRequest } from "@/components/survey/SurveyLinkRequest";
import { firstNameOf } from "@/lib/survey/surveyEngine";
import { getSurveySession, isSurveyStoreConfigured } from "@/lib/survey/surveyStore";
import { hashSurveyToken, verifySurveyToken } from "@/lib/survey/surveyToken";
import type { SurveyParticipant } from "@/lib/survey/surveyTypes";

export const metadata: Metadata = {
  title: "ENTA — Early access",
  description: "A few quick questions so we build ENTA around how you actually handle money.",
  robots: { index: false, follow: false },
};

/* The token is resolved on the server, so the participant's name reaches the
   client as rendered copy and never as a URL parameter. */
export default async function InterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;

  /* Resolution order: explicit link token first, then the signup cookie — so
     the GENERIC link in the welcome email opens the right survey in the
     browser the person signed up in, and an expired emailed link still works
     on that browser. With neither, offer to email a personal link. */
  let token = t;
  let payload = verifySurveyToken(token);

  if (!payload) {
    const cookieToken = (await cookies()).get("enta_survey")?.value;
    const cookiePayload = verifySurveyToken(cookieToken);

    if (cookiePayload) {
      token = cookieToken;
      payload = cookiePayload;
    }
  }

  if (!payload || !token) return <SurveyLinkRequest hadToken={Boolean(t)} />;

  /* The signed token already carries the first name, so the greeting is
     personalised even before the Sheet store is configured. */
  let participant: SurveyParticipant = {
    userId: payload.userId,
    firstName: firstNameOf(payload.firstName) || undefined,
    audience: payload.audience,
    surveyStatus: "not_started",
  };

  if (isSurveyStoreConfigured()) {
    const session = await getSurveySession({
      userId: payload.userId,
      surveyTokenHash: hashSurveyToken(token),
    });

    if (session.ok) {
      participant = {
        userId: payload.userId,
        /* The token's name comes from the form THIS link was minted for, so it
           wins; the stored row is the fallback. A duplicate-email signup adopts
           the older sheet row, and preferring the row would greet the new
           signup with the old row's name. */
        firstName:
          firstNameOf(payload.firstName) || firstNameOf(session.data.firstName) || undefined,
        audience: session.data.audience ?? payload.audience,
        country: session.data.country,
        surveyStatus: session.data.surveyStatus ?? "not_started",
        currentStep: session.data.currentStep,
        answers: session.data.answers,
      };
    }
  }

  return <SurveyExperience participant={participant} token={token} />;
}

