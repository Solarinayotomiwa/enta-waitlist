"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/* The prototype's typing effect, made accessible: the visible text types out
   for sighted users while the full sentence is exposed once to assistive
   technology, so nothing is announced character by character. Reduced-motion
   users get the finished sentence immediately. */

/* Reading pace. The duration is the target and the per-character delay is
   derived from it, so a long question doesn't drag. Tuned so a typical question
   lands in well under a second and the longest note screen caps at 2s — the
   earlier ladder let a long prompt run past six seconds before its options
   appeared. Punctuation still gets a slight pause, just a subtler one. */
const PACE = {
  base: 200,
  perChar: 15,
  min: 520,
  max: 1900,
  ackPerChar: 11,
  ackMin: 240,
  ackMax: 560,
  punctuationWeight: 4,
};

/* Beat between the spoken acknowledgement and the question typing in. */
const ACK_GAP_MS = 130;

function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value));
}

export function useTypedText(text: string, kind: "question" | "ack", onDone?: () => void) {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState("");
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    /* An empty string is the "not my turn yet" state — the question is held back
       until the acknowledgement finishes typing. Reporting completion for it
       would release the answer options before the question had been asked. */
    if (!text) {
      setShown("");
      return;
    }

    if (reducedMotion) {
      setShown(text);
      doneRef.current?.();
      return;
    }

    setShown("");

    const target =
      kind === "ack"
        ? clamp(text.length * PACE.ackPerChar, PACE.ackMin, PACE.ackMax)
        : clamp(PACE.base + text.length * PACE.perChar, PACE.min, PACE.max);

    const weights = [...text].map((char) => (/[.,—?!:;]/.test(char) ? PACE.punctuationWeight : 1));
    const unit = target / weights.reduce((total, weight) => total + weight, 0);

    let index = 0;
    let timer = 0;

    const tick = () => {
      if (index >= text.length) {
        doneRef.current?.();
        return;
      }

      const pause = weights[index] * unit;
      index += 1;
      setShown(text.slice(0, index));
      timer = window.setTimeout(tick, pause);
    };

    timer = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timer);
  }, [kind, reducedMotion, text]);

  return { shown, complete: shown.length >= text.length };
}

export function SurveyPrompt({
  ack,
  hint,
  onReady,
  question,
  stepLabel,
}: {
  ack?: string;
  hint?: string;
  onReady: () => void;
  question: string;
  stepLabel: string;
}) {
  const [ackDone, setAckDone] = useState(!ack);
  const ackTyped = useTypedText(ack ?? "", "ack", () =>
    window.setTimeout(() => setAckDone(true), ACK_GAP_MS),
  );
  const questionTyped = useTypedText(ackDone ? question : "", "question", onReady);

  return (
    <>
      {ack ? (
        <p
          aria-hidden="true"
          className="mb-3 min-h-[1.4em] text-[15px] font-medium text-[color:var(--survey-text-soft)]"
        >
          {ackTyped.shown}
        </p>
      ) : null}

      <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[.13em] text-[color:var(--survey-accent-text)]">
        {stepLabel}
      </p>

      {/* The live region carries the finished sentence; the typed copy is
          hidden from screen readers to avoid per-character announcements. */}
      <h1 className="m-0 min-h-[1.3em] text-[clamp(25px,4.1vw,35px)] font-semibold leading-[1.22] tracking-[-.025em] text-balance">
        <span className="sr-only">{ack ? `${ack} ${question}` : question}</span>
        <span aria-hidden="true">
          {questionTyped.shown}
          {!questionTyped.complete && ackDone ? (
            <span className="ml-[3px] inline-block h-[.95em] w-0.5 -translate-y-[.1em] animate-pulse bg-[color:var(--survey-accent-text)] align-[-.1em]" />
          ) : null}
        </span>
      </h1>

      {hint && questionTyped.complete ? (
        <p className="mt-3.5 max-w-[54ch] text-[15px] leading-[1.55] text-[color:var(--survey-text-soft)]">
          {hint}
        </p>
      ) : null}
    </>
  );
}
