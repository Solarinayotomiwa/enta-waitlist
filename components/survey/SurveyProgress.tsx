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
        className="relative h-0.5 flex-1 rounded-sm bg-white/10"
        role="progressbar"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-sm bg-[linear-gradient(90deg,var(--survey-accent),var(--survey-accent-text))] transition-[width] duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="hidden text-[11.5px] font-medium tracking-[.06em] text-[color:var(--survey-muted)] tabular-nums sm:inline">
        {label}
      </span>
    </>
  );
}
