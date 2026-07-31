import type { Metadata } from "next";
import { SurveyExperience } from "@/components/survey/SurveyExperience";
import { ThankYouActions } from "@/components/survey/ThankYouActions";
import { firstNameOf } from "@/lib/survey/surveyEngine";
import { getSurveySession, isSurveyStoreConfigured } from "@/lib/survey/surveyStore";
import { hashSurveyToken, verifySurveyToken } from "@/lib/survey/surveyToken";
import type { SurveyParticipant } from "@/lib/survey/surveyTypes";

export const metadata: Metadata = {
  title: "ENTA — You're on the waitlist",
  description: "Your spot is confirmed. A few quick questions so we build ENTA around you.",
  robots: { index: false, follow: false },
};

/* The post-signup page. With a valid signed token it IS the survey — the modal
   CTA lands straight on the first question, personalised from the token, with
   nothing identifying in the URL. Without one (a bare LaunchList ?ref=
   redirect, an expired link) it falls back to a landing that still confirms
   the spot and offers the share link, because the signup itself has already
   succeeded by the time anyone lands here. */
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; ref?: string; ref_id?: string }>;
}) {
  const params = await searchParams;
  const token = params.t;
  const payload = verifySurveyToken(token);

  if (payload && token) {
    /* The token's name comes from the form THIS link was minted for, so it
       wins; the stored row fills gaps (country, resume state). A duplicate
       email adopts the older sheet row, and preferring the row would greet the
       new signup with the old row's name. */
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

  const referralCode = params.ref ?? params.ref_id ?? "";

  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0d101d] px-6 py-20 text-[#f9fafb]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(80%_100%_at_50%_0%,rgba(23,92,211,.32)_0%,transparent_72%)]"
      />

      <div className="w-full max-w-[560px]">
        <p className="text-[19px] font-semibold tracking-[-.02em]">
          ent<span className="text-[#a9e0fb]">a</span>
        </p>

        <h1 className="mt-7 text-[clamp(30px,5vw,42px)] font-semibold leading-[1.14] tracking-[-.03em]">
          You&rsquo;re on the list.
        </h1>

        <p className="mt-4 max-w-[46ch] text-[16px] leading-[1.6] text-[#d0d5dd]">
          Thank you for joining. We&rsquo;ll be in touch with your onboarding details before public
          launch.
        </p>

        <ThankYouActions referralCode={referralCode} surveyPath={null} />
      </div>
    </main>
  );
}
