"use client";

import { SurveyProgress } from "@/components/survey/SurveyProgress";
import { figmaAssets } from "@/lib/figma-assets";

export function SurveyHeader({
  chip,
  progress,
}: {
  chip: string;
  progress: { asked: number; done: number; label: string; percent: number };
}) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center gap-4 px-[18px] py-4 sm:px-[30px] sm:py-5">
      {/* The official site logo (same asset as the footer). The SVG has no
          intrinsic size, so both dimensions are explicit — 83×22 keeps the
          footer logo's 196:52 ratio at header scale. */}
      <img
        alt="Enta"
        className="h-[22px] w-[83px] shrink-0 object-contain object-left"
        height={22}
        src={figmaAssets.entaLogoWhite}
        width={83}
      />
      <span className="whitespace-nowrap rounded-full bg-[color:var(--survey-accent-wash)] px-2.5 py-[5px] text-[11px] font-medium uppercase tracking-[.08em] text-[color:var(--survey-accent-text)] transition-colors duration-500">
        {chip}
      </span>
      <SurveyProgress {...progress} />
      {/* The header itself passes clicks through; the exit link opts back in. */}
      <a
        className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-[13px] font-medium text-[color:var(--survey-muted)] outline-none transition-colors duration-150 hover:text-[color:var(--survey-text)] focus-visible:ring-2 focus-visible:ring-[color:var(--survey-accent-text)]"
        href="/"
      >
        Exit
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </a>
    </header>
  );
}
