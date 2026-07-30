"use client";

/* Progress is exposed to assistive technology as a real progressbar, not just a
   coloured line. */
export function SurveyProgress({
  asked,
  done,
  label,
  percent,
}: {
  asked: number;
  done: number;
  label: string;
  percent: number;
}) {
  return (
    <>
      <div
        aria-label="Survey progress"
        aria-valuemax={asked}
        aria-valuemin={0}
        aria-valuenow={done}
        aria-valuetext={label || undefined}
        className="relative h-0.5 flex-1 rounded-sm bg-[rgba(11,32,54,.09)]"
        role="progressbar"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-sm bg-[linear-gradient(90deg,#0891B2,var(--survey-accent))] transition-[width] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="hidden text-[11.5px] font-medium tracking-[.06em] text-[#7A93A5] tabular-nums sm:inline">
        {label}
      </span>
    </>
  );
}
