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
      surveyTokenHash: hashSurveyToken(t),
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

  return <SurveyExperience participant={participant} token={t} />;
}

function InvalidLink() {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0d101d] px-6 text-center text-[#f9fafb]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(80%_100%_at_50%_0%,rgba(23,92,211,.3)_0%,transparent_72%)]"
      />
      <p className="text-[19px] font-semibold tracking-[-.02em]">
        ent<span className="text-[#a9e0fb]">a</span>
      </p>
      <h1 className="mt-6 max-w-[28ch] text-[clamp(24px,4vw,32px)] font-semibold leading-[1.22] tracking-[-.025em]">
        This survey link is no longer valid.
      </h1>
      <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.55] text-[#d0d5dd]">
        Links expire after 30 days. If you joined the waitlist and still want to answer, rejoin from
        the site and we&rsquo;ll send you a fresh link.
      </p>
      <a
        className="mt-8 rounded-[11px] bg-[#175cd3] px-6 py-3.5 text-[15px] font-semibold text-white outline-none transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#a9e0fb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d101d] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        href="/"
      >
        Back to ENTA
      </a>
    </main>
  );
}
