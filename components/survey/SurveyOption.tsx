"use client";

import { cn } from "@/lib/cn";

/* Selection is conveyed by the checkmark, the aria state and the border — never
   by colour alone. */
export function SurveyOption({
  dimmed,
  index,
  label,
  multi,
  onSelect,
  selected,
}: {
  dimmed?: boolean;
  index: number;
  label: string;
  multi?: boolean;
  onSelect: () => void;
  selected?: boolean;
}) {
  return (
    <button
      aria-checked={multi ? Boolean(selected) : undefined}
      aria-pressed={multi ? undefined : Boolean(selected)}
      className={cn(
        "flex items-center gap-[13px] rounded-[14px] border bg-[color:var(--survey-surface)] px-[17px] py-[15px] text-left text-[15.5px] font-medium leading-[1.35] text-[color:var(--survey-text)] shadow-[0_1px_2px_rgba(0,0,0,.24),0_10px_30px_-16px_rgba(0,0,0,.6)] outline-none transition duration-150 hover:-translate-y-0.5 hover:border-[color:var(--survey-accent)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--survey-accent)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        selected
          ? "border-[color:var(--survey-accent)] bg-[color:var(--survey-accent-wash)]"
          : "border-[color:var(--survey-border)]",
        dimmed && "opacity-40",
      )}
      onClick={onSelect}
      role={multi ? "checkbox" : undefined}
      type="button"
    >
      <span
        aria-hidden="true"
        className={cn(
          "min-w-[25px] flex-none rounded-md px-[7px] py-[3px] text-center text-[11.5px] font-semibold tabular-nums",
          selected
            ? "bg-[color:var(--survey-accent)] text-white"
            : "bg-white/[.06] text-[color:var(--survey-muted)]",
        )}
      >
        {index + 1}
      </span>
      <span className="flex-1">{label}</span>
      {multi ? (
        <span
          aria-hidden="true"
          className="ml-auto text-sm font-semibold text-[color:var(--survey-accent-text)]"
        >
          {selected ? "✓" : ""}
        </span>
      ) : null}
    </button>
  );
}
