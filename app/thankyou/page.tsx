import type { Metadata } from "next";
import { ThankYouActions } from "@/components/survey/ThankYouActions";
import { firstNameOf } from "@/lib/survey/surveyEngine";
import { getSurveySession, isSurveyStoreConfigured } from "@/lib/survey/surveyStore";
import { hashSurveyToken, surveyUrl, verifySurveyToken } from "@/lib/survey/surveyToken";

export const metadata: Metadata = {
  title: "ENTA — You're on the waitlist",
  description: "Your spot is confirmed. Share your referral link or answer a few quick questions.",
  robots: { index: false, follow: false },
};

/* The post-signup landing page. It is reached two ways:

   1. /thankyou?t=<signed token> — our own form, and the LaunchList dashboard's
      redirect when configured with a token. Fully personalised: the first name
      and the user's own referral code come out of the signed token, so nothing
      identifying sits in the URL.
   2. /thankyou?ref=<code> — a bare LaunchList redirect, which carries only the
      new signup's referral code. Enough to offer the share link; the greeting
      stays generic unless the Sheet store can resolve the name.

   Anything else still renders a usable page rather than an error, because the
   signup itself has already succeeded by the time anyone lands here. */
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; ref?: string; ref_id?: string }>;
}) {
  const params = await searchParams;
  const token = params.t;
  const payload = verifySurveyToken(token);

  let firstName = firstNameOf(payload?.firstName);
  let referralCode = payload?.referralCode ?? params.ref ?? params.ref_id ?? "";
  let survey: string | null = null;

  if (payload && token) {
    survey = surveyUrl("", token);

    if (isSurveyStoreConfigured()) {
      const session = await getSurveySession({
        userId: payload.userId,
        surveyTokenHash: hashSurveyToken(token),
      });

      if (session.ok) {
        firstName = firstNameOf(session.data.firstName) || firstName;
        referralCode = session.data.referralCode || referralCode;
      }
    }
  }

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
          {firstName ? `You're on the list, ${firstName}.` : "You're on the list."}
        </h1>

        <p className="mt-4 max-w-[46ch] text-[16px] leading-[1.6] text-[#d0d5dd]">
          Thank you for joining. We&rsquo;ll be in touch with your onboarding details before public
          launch.
        </p>

        <ThankYouActions referralCode={referralCode} surveyPath={survey} />
      </div>
    </main>
  );
}
