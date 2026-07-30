"use client";

import { useEffect, useState } from "react";

/* Both actions live here together: the referral link stays available alongside
   the survey, rather than one replacing the other. The referral URL is built on
   the client so it always points at the site the visitor is actually on. */
export function ThankYouActions({
  referralCode,
  surveyPath,
}: {
  referralCode: string;
  surveyPath: string | null;
}) {
  const [copied, setCopied] = useState(false);

  /* Read the origin after mount so the server and first client render agree —
     the path alone renders first, then the absolute URL fills in. */
  const [base, setBase] = useState("");
  useEffect(() => setBase(window.location.origin), []);

  const referralUrl = referralCode ? `${base}/?ref=${encodeURIComponent(referralCode)}` : "";

  async function copyReferral() {
    if (!referralUrl) return;

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      /* Clipboard can be blocked; the link is on screen to copy by hand. */
    }
  }

  async function shareReferral() {
    if (!referralUrl) return;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Join the ENTA waitlist",
          text: "Join me on the ENTA early-access waitlist.",
          url: referralUrl,
        });
        return;
      } catch {
        /* A cancelled share is not an error — fall through to copying. */
      }
    }

    await copyReferral();
  }

  return (
    <div className="mt-9 flex flex-col gap-6">
      {referralUrl ? (
        <div>
          <p className="text-[13px] font-medium text-[#8794ab]">
            Want to move up the list? Every friend who joins bumps you up.
          </p>
          <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 truncate rounded-[11px] border border-[#1f242f] bg-[#141a2c] px-4 py-3 text-[14px] text-[#d0d5dd]">
              {referralUrl}
            </code>
            <button
              className="shrink-0 rounded-[11px] border border-[#2c3560] bg-transparent px-5 py-3 text-[14.5px] font-semibold text-[#a9e0fb] outline-none transition hover:border-[#a9e0fb] focus-visible:ring-2 focus-visible:ring-[#a9e0fb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d101d] motion-reduce:transition-none"
              onClick={shareReferral}
              type="button"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[13px] text-[#8794ab]">
          Your referral link is still being set up — we&rsquo;ll email it to you shortly.
        </p>
      )}

      {surveyPath ? (
        <div>
          <a
            className="inline-flex h-12 items-center justify-center rounded-[11px] bg-[#175cd3] px-6 text-[15px] font-semibold text-white outline-none transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#a9e0fb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d101d] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            href={surveyPath}
          >
            Answer a few quick questions
          </a>
          <p className="mt-2.5 text-[13.5px] leading-[1.5] text-[#8794ab]">
            Help us shape ENTA around how you actually manage money. It takes about 90 seconds.
          </p>
        </div>
      ) : (
        /* Reached without a signed token — a public referral code is not proof of
           identity, so it must never open somebody's survey. */
        <p className="text-[13.5px] leading-[1.5] text-[#8794ab]">
          We&rsquo;ll email you a link to a few quick questions shortly — answering helps us shape
          ENTA around how you actually manage money.
        </p>
      )}

      <a
        className="text-[14.5px] font-medium text-[#d0d5dd] underline underline-offset-4 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#a9e0fb]"
        href="/"
      >
        Back to ENTA
      </a>
    </div>
  );
}
