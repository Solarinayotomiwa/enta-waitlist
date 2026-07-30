import type { Metadata } from "next";
import { SurveyExperience } from "@/components/survey/SurveyExperience";
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
  const payload = verifySurveyToken(t);

  if (!payload || !t) return <InvalidLink />;

  let participant: SurveyParticipant = {
    userId: payload.userId,
    audience: payload.audience,
    surveyStatus: "not_started",
  };

  if (isSurveyStoreConfigured()) {
    const session = await getSurveySession({
      userId: payload.userId,
      surveyTokenHash: hashSurveyToken(t),
    });

    if (session.ok) {
      participant = {
        userId: payload.userId,
        firstName: firstNameOf(session.data.firstName) || undefined,
        audience: session.data.audience ?? payload.audience,
        country: session.data.country,
        surveyStatus: session.data.surveyStatus ?? "not_started",
        currentStep: session.data.currentStep,
        answers: session.data.answers,
      };
    }
  }

  return <SurveyExperience participant={participant} token={t} />;
}

function InvalidLink() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[linear-gradient(180deg,#CFE8F6_0%,#E8F4FA_42%,#FAFCF7_100%)] px-6 text-center text-[#0B2036]">
      <p className="text-[19px] font-semibold tracking-[-.02em]">
        ent<span className="text-[#0D9488]">a</span>
      </p>
      <h1 className="mt-6 max-w-[28ch] text-[clamp(24px,4vw,32px)] font-semibold leading-[1.22] tracking-[-.025em]">
        This survey link is no longer valid.
      </h1>
      <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.55] text-[#39566B]">
        Links expire after 30 days. If you joined the waitlist and still want to answer, rejoin from
        the site and we&rsquo;ll send you a fresh link.
      </p>
      <a
        className="mt-8 rounded-[11px] bg-[#0D9488] px-6 py-3.5 text-[15px] font-semibold text-white outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#0B2036] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        href="/"
      >
        Back to ENTA
      </a>
    </main>
  );
}
