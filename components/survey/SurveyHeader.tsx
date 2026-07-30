"use client";

import { SurveyProgress } from "@/components/survey/SurveyProgress";

export function SurveyHeader({
  chip,
  progress,
}: {
  chip: string;
  progress: { asked: number; done: number; label: string; percent: number };
}) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center gap-4 px-[18px] py-4 sm:px-[30px] sm:py-5">
      <span className="text-[19px] font-semibold tracking-[-.02em] text-[#0B2036]">
        ent<span className="text-[color:var(--survey-accent)] transition-colors duration-500">a</span>
      </span>
      <span className="whitespace-nowrap rounded-full bg-[color:var(--survey-accent-wash)] px-2.5 py-[5px] text-[11px] font-medium uppercase tracking-[.08em] text-[color:var(--survey-accent)] transition-colors duration-500">
        {chip}
      </span>
      <SurveyProgress {...progress} />
    </header>
  );
}
