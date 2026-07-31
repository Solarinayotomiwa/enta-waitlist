"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SurveyCompletion } from "@/components/survey/SurveyCompletion";
import { SurveyHeader } from "@/components/survey/SurveyHeader";
import { SurveyOption } from "@/components/survey/SurveyOption";
import { SurveyPrompt } from "@/components/survey/SurveyPrompt";
import {
  expandInstrumentSteps,
  firstNameOf,
  forkStep,
  instruments,
  progressOf,
  rateExample,
  resolveCopy,
  welcomeStep,
} from "@/lib/survey/surveyEngine";
import type {
  SurveyAnswerValue,
  SurveyAudience,
  SurveyParticipant,
  SurveyStep,
} from "@/lib/survey/surveyTypes";

const DRAFT_PREFIX = "enta_survey_draft_";

type Answers = Record<string, SurveyAnswerValue>;

export function SurveyExperience({
  participant,
  token,
}: {
  participant: SurveyParticipant;
  token: string;
}) {
  const firstName = firstNameOf(participant.firstName);
  const draftKey = `${DRAFT_PREFIX}${participant.userId}`;

  const [audience, setAudience] = useState<SurveyAudience | undefined>(participant.audience);
  const [answers, setAnswers] = useState<Answers>(participant.answers ?? {});
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(participant.surveyStatus === "completed");
  /* null = save still in flight; the completion screen renders immediately and
     only admits a problem once the request has actually failed. */
  const [saved, setSaved] = useState<boolean | null>(true);
  const [ready, setReady] = useState(false);
  const completingRef = useRef(false);

  /* Local draft is a resume fallback for when the server store isn't available;
     server progress always wins when it exists. */
  useEffect(() => {
    if (participant.answers && Object.keys(participant.answers).length > 0) return;

    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as { index?: number; answers?: Answers; audience?: SurveyAudience };
      if (draft.answers) setAnswers(draft.answers);
      if (draft.audience) setAudience(draft.audience);
      if (typeof draft.index === "number") setIndex(draft.index);
    } catch {
      /* A corrupted draft simply starts the survey fresh. */
    }
  }, [draftKey, participant.answers]);

  useEffect(() => {
    if (typeof participant.currentStep === "number" && participant.currentStep > 0) {
      setIndex(participant.currentStep);
    }
  }, [participant.currentStep]);

  const instrument = audience ? instruments[audience] : instruments.individual;

  /* The queue is derived, never mutated in place: welcome, then either the
     known track or the fork, then that track's expanded steps. */
  const queue = useMemo<SurveyStep[]>(() => {
    const steps: SurveyStep[] = [welcomeStep(firstName)];

    if (audience) {
      steps.push(...expandInstrumentSteps(instruments[audience], participant.country));
    } else {
      steps.push(forkStep);
    }

    return steps;
  }, [audience, firstName, participant.country]);

  const step = queue[index];

  /* Before the fork resolves the queue holds only the fork, so a count would
     read "1 of 1" and then jump to "1 of 12". Withhold it until a track is
     known rather than showing a total we are about to contradict. */
  const counted = progressOf(queue, index);
  const progress = audience ? counted : { ...counted, label: "" };

  const persist = useCallback(
    (nextIndex: number, nextAnswers: Answers, nextAudience?: SurveyAudience) => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({ index: nextIndex, answers: nextAnswers, audience: nextAudience }),
        );
      } catch {
        /* Storage can be blocked; the survey still works in-session. */
      }

      void fetch("/api/survey/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, currentStep: nextIndex, answers: nextAnswers }),
      }).catch(() => undefined);
    },
    [draftKey, token],
  );

  const complete = useCallback(
    async (finalAnswers: Answers) => {
      if (completingRef.current) return;
      completingRef.current = true;

      try {
        const response = await fetch("/api/survey/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, answers: finalAnswers }),
        });

        const result = (await response.json()) as { stored?: boolean };
        setSaved(Boolean(result.stored));
      } catch {
        setSaved(false);
      } finally {
        try {
          localStorage.removeItem(draftKey);
        } catch {
          /* Nothing to clean up. */
        }
        setDone(true);
      }
    },
    [draftKey, token],
  );

  const commit = useCallback(
    (value: SurveyAnswerValue, prompt: string) => {
      const nextAnswers: Answers = { ...answers };
      let nextAudience = audience;

      if (value !== null && step.type !== "say") {
        nextAnswers[step.id] = value;
      }

      if (step.id === "fork" && typeof value === "string") {
        nextAudience = /business/i.test(value) ? "business" : "individual";
        nextAnswers.type = nextAudience;
        setAudience(nextAudience);
      }

      if (step.id === "currency_manual" && typeof value === "string") {
        nextAnswers.currency_manual = value.toLowerCase();
      }

      if (step.dynamic) nextAnswers.q4_example_shown = prompt;

      /* Answering the fork rebuilds the queue as [welcome, ...track], dropping
         the fork itself — so the next screen is index 1, the track's first
         question. Advancing to index + 1 would skip straight past it. */
      const nextIndex = step.id === "fork" ? 1 : index + 1;
      setAnswers(nextAnswers);
      setReady(false);

      /* The fork replaces the rest of the queue, so the next screen is the first
         real question of the chosen track. */
      const total = nextAudience
        ? 1 + expandInstrumentSteps(instruments[nextAudience], participant.country).length
        : queue.length;

      if (nextIndex >= total) {
        setIndex(nextIndex);
        /* Show the completion screen at once — the save round-trips through
           Apps Script and can take seconds; waiting rendered a blank page. */
        setSaved(null);
        setDone(true);
        void complete(nextAnswers);
        return;
      }

      setIndex(nextIndex);
      persist(nextIndex, nextAnswers, nextAudience);
    },
    [answers, audience, complete, index, participant.country, persist, queue.length, step],
  );

  if (done) {
    return (
      <SurveyShell chip={instrument.chip} instrumentKey={instrument.key} progress={{ ...progress, percent: 100 }}>
        <SurveyCompletion closing={instrument.close(firstName)} label={instrument.label} saved={saved} />
      </SurveyShell>
    );
  }

  if (!step) return null;

  const prompt = step.dynamic
    ? instrument.intelligenceLead(rateExample(instrument.key, participant.country, answers))
    : resolveCopy(step.q, firstName);

  return (
    <SurveyShell chip={instrument.chip} instrumentKey={instrument.key} progress={progress}>
      <SurveyPrompt
        ack={resolveCopy(step.ack, firstName) || undefined}
        hint={resolveCopy(step.hint, firstName) || undefined}
        key={`${step.id}-${index}`}
        onReady={() => setReady(true)}
        question={prompt}
        stepLabel={step.step}
      />
      {ready ? (
        <StepAnswers commit={(value) => commit(value, prompt)} step={step} />
      ) : (
        <div className="mt-[26px] min-h-[120px]" />
      )}
    </SurveyShell>
  );
}

function SurveyShell({
  children,
  chip,
  instrumentKey,
  progress,
}: {
  children: React.ReactNode;
  chip: string;
  instrumentKey: SurveyAudience;
  progress: { asked: number; done: number; label: string; percent: number };
}) {
  const accent = instruments[instrumentKey];

  /* ENTA's dark surface, matching the site's waitlist section (#0d101d) rather
     than the prototype's light sky. Every child reads these tokens, so the
     palette is declared once here. */
  return (
    <div
      className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#0d101d] text-[color:var(--survey-text)]"
      style={
        {
          "--survey-accent": accent.accent,
          "--survey-accent-wash": accent.accentWash,
          /* The solid accent is a button fill; on the dark surface small text
             and hairlines need a lighter blue to stay legible. */
          "--survey-accent-text": "#a9e0fb",
          "--survey-surface": "#141a2c",
          "--survey-border": "#1f242f",
          "--survey-border-strong": "#2c3560",
          "--survey-text": "#f9fafb",
          "--survey-text-soft": "#d0d5dd",
          "--survey-muted": "#8794ab",
        } as React.CSSProperties
      }
    >
      {/* A single accent glow keeps the dark canvas from reading as flat black. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(80%_100%_at_50%_0%,color-mix(in_srgb,var(--survey-accent)_26%,transparent)_0%,transparent_72%)]"
      />
      <SurveyHeader chip={chip} progress={progress} />
      <main className="flex flex-1 items-center justify-center px-[18px] pb-14 pt-[80px] sm:px-[26px] sm:pt-[104px]">
        <div className="w-full max-w-[610px]">{children}</div>
      </main>
    </div>
  );
}

function StepAnswers({ commit, step }: { commit: (value: SurveyAnswerValue) => void; step: SurveyStep }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");
  const firstOptionRef = useRef<HTMLDivElement | null>(null);
  const options = step.opts ?? [];

  /* Number keys pick an option, Enter continues — but never while the visitor is
     typing in the open-text field. */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement | null)?.tagName ?? "";
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;

      if (step.type === "say" && event.key === "Enter") {
        event.preventDefault();
        commit(true as unknown as SurveyAnswerValue);
        return;
      }

      const digit = Number(event.key);

      if (digit >= 1 && digit <= options.length) {
        event.preventDefault();
        const option = options[digit - 1];

        if (step.type === "single") {
          commit(option);
          return;
        }

        if (step.type === "multi") setPicked((current) => toggle(current, option, step));
        return;
      }

      if (event.key === "Enter" && step.type === "multi" && picked.length > 0) {
        event.preventDefault();
        commit(picked);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [commit, options, picked, step]);

  useEffect(() => {
    const target = firstOptionRef.current?.querySelector<HTMLElement>("button, textarea");
    const timer = window.setTimeout(() => target?.focus({ preventScroll: true }), 120);
    return () => window.clearTimeout(timer);
  }, [step.id]);

  if (step.type === "say") {
    return (
      <div className="survey-rise mt-[26px] flex flex-wrap items-center gap-4" ref={firstOptionRef}>
        <button className={goClass} onClick={() => commit(true as unknown as SurveyAnswerValue)} type="button">
          {step.cta ?? "Continue"}
        </button>
        <span className="text-[12.5px] text-[color:var(--survey-muted)]">or press Enter</span>
      </div>
    );
  }

  if (step.type === "open") {
    return (
      <div className="survey-rise mt-[26px] flex flex-col gap-4" ref={firstOptionRef}>
        <textarea
          aria-label={typeof step.q === "string" ? step.q : "Your answer"}
          className="w-full resize-none rounded-[14px] border border-[color:var(--survey-border)] bg-[color:var(--survey-surface)] px-[17px] py-4 text-base leading-[1.55] text-[color:var(--survey-text)] shadow-[0_1px_2px_rgba(0,0,0,.24),0_10px_30px_-16px_rgba(0,0,0,.6)] outline-none placeholder:text-[color:var(--survey-muted)] focus:border-[color:var(--survey-accent-text)]"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && text.trim().length >= 2) {
              event.preventDefault();
              commit(text.trim());
            }
          }}
          placeholder="Type here if you feel like it…"
          rows={4}
          value={text}
        />
        <div className="flex flex-wrap items-center gap-4">
          <button
            className={goClass}
            disabled={text.trim().length < 2}
            onClick={() => commit(text.trim())}
            type="button"
          >
            Send this
          </button>
          <button
            className="text-[14.5px] font-medium text-[color:var(--survey-text-soft)] underline underline-offset-4 outline-none hover:text-[color:var(--survey-text)] focus-visible:ring-2 focus-visible:ring-[color:var(--survey-accent-text)]"
            onClick={() => commit(null)}
            type="button"
          >
            Skip this question
          </button>
        </div>
      </div>
    );
  }

  const multi = step.type === "multi";

  return (
    <div className="mt-[26px] flex flex-col gap-2" ref={firstOptionRef}>
      <div
        aria-label={multi ? "Choose any that apply" : undefined}
        className="flex flex-col gap-2"
        role={multi ? "group" : undefined}
      >
        {options.map((option, optionIndex) => (
          <div
            className="survey-rise"
            key={option}
            style={{ animationDelay: `${optionIndex * 38}ms` }}
          >
            <SurveyOption
              dimmed={
                Boolean(step.exclusive) && picked.includes(step.exclusive as string) && option !== step.exclusive
              }
              index={optionIndex}
              label={option}
              multi={multi}
              onSelect={() =>
                multi ? setPicked((current) => toggle(current, option, step)) : commit(option)
              }
              selected={picked.includes(option)}
            />
          </div>
        ))}
      </div>
      {multi ? (
        <div
          className="survey-rise mt-2 flex flex-wrap items-center gap-4"
          style={{ animationDelay: `${options.length * 38}ms` }}
        >
          <button
            className={goClass}
            disabled={picked.length === 0}
            onClick={() => commit(picked)}
            type="button"
          >
            Continue
          </button>
          <span className="text-[12.5px] text-[color:var(--survey-muted)]">Tap any that apply</span>
        </div>
      ) : null}
    </div>
  );
}

const goClass =
  "rounded-[11px] bg-[color:var(--survey-accent)] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(23,92,211,.9)] outline-none transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[color:var(--survey-accent-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d101d] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function toggle(current: string[], option: string, step: SurveyStep): string[] {
  if (current.includes(option)) return current.filter((value) => value !== option);

  /* "I'd rather do it all myself" is mutually exclusive with everything else. */
  if (step.exclusive && option === step.exclusive) return [option];
  const next = step.exclusive ? current.filter((value) => value !== step.exclusive) : current;

  return [...next, option];
}
