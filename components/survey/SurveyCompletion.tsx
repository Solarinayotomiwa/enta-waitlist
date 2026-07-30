"use client";

import { SurveyPrompt } from "@/components/survey/SurveyPrompt";

/* Approved close copy and a single onward action — no raw payload on screen. */
export function SurveyCompletion({
  closing,
  label,
  saved,
}: {
  closing: string;
  label: string;
  saved: boolean;
}) {
  return (
    <div>
      <SurveyPrompt onReady={() => {}} question={closing} stepLabel="Done" />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <span className="inline-flex items-baseline gap-3 rounded-[14px] border border-[color:var(--survey-accent)] bg-[color:var(--survey-surface)] px-5 py-[13px] shadow-[0_1px_2px_rgba(0,0,0,.24),0_10px_30px_-16px_rgba(0,0,0,.6)]">
          <b className="text-[15.5px] font-semibold">You&rsquo;re on the list</b>
          <span className="text-xs font-medium uppercase tracking-[.06em] text-[color:var(--survey-accent)]">
            {label}
          </span>
        </span>
        <a
          className="rounded-[11px] bg-[color:var(--survey-accent)] px-6 py-3.5 text-[15px] font-semibold text-white outline-none transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[color:var(--survey-accent-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d101d] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          href="/"
        >
          Back to ENTA
        </a>
      </div>
      {!saved ? (
        <p className="mt-5 text-[13px] text-[color:var(--survey-muted)]">
          Your answers reached us, but we couldn&rsquo;t file them just yet. Nothing more is needed
          from you.
        </p>
      ) : null}
    </div>
  );
}
