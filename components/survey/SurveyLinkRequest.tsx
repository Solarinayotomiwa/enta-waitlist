"use client";

import { FormEvent, useState } from "react";

/* Shown at /interview when no valid token is present (no ?t=, expired link,
   or a different browser than the signup). Asks for the waitlist email and
   has the server send that inbox its personal survey link — the confirmation
   copy is identical whether or not the address exists. */
export function SurveyLinkRequest({ hadToken }: { hadToken: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    try {
      const response = await fetch("/api/survey/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0d101d] px-6 text-center text-[#f9fafb]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(80%_100%_at_50%_0%,rgba(23,92,211,.3)_0%,transparent_72%)]"
      />
      <p className="text-[19px] font-semibold tracking-[-.02em]">
        ent<span className="text-[#a9e0fb]">a</span>
      </p>
      <h1 className="mt-6 max-w-[30ch] text-[clamp(24px,4vw,32px)] font-semibold leading-[1.22] tracking-[-.025em]">
        {hadToken ? "This survey link is no longer valid." : "Open your ENTA survey."}
      </h1>

      {status === "sent" ? (
        <p aria-live="polite" className="mt-4 max-w-[46ch] text-[15px] leading-[1.55] text-[#d0d5dd]">
          If that email is on the waitlist, your personal survey link is on its way — check your
          inbox.
        </p>
      ) : (
        <>
          <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.55] text-[#d0d5dd]">
            Enter the email you joined the waitlist with and we&rsquo;ll send your personal survey
            link straight to your inbox.
          </p>
          <form className="mt-8 flex w-full max-w-[420px] flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="survey-link-email">
              Email address
            </label>
            <input
              autoComplete="email"
              className="h-12 flex-1 rounded-[11px] border border-[#2c3560] bg-[#141a2c] px-4 text-[15px] text-[#f9fafb] outline-none placeholder:text-[#8794ab] focus:border-[#175cd3]"
              id="survey-link-email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
            <button
              className="h-12 rounded-[11px] bg-[#175cd3] px-6 text-[15px] font-semibold text-white outline-none transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#a9e0fb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d101d] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              disabled={status === "sending"}
              type="submit"
            >
              {status === "sending" ? "Sending…" : "Email me my link"}
            </button>
          </form>
          {status === "error" ? (
            <p className="mt-3 text-sm text-[#f97066]" role="alert">
              Something went wrong — please try again.
            </p>
          ) : null}
        </>
      )}

      <a
        className="mt-10 text-sm text-[#8794ab] underline underline-offset-4 outline-none hover:text-[#d0d5dd] focus-visible:ring-2 focus-visible:ring-[#a9e0fb]"
        href="/"
      >
        Back to ENTA
      </a>
    </main>
  );
}
