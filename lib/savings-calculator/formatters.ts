const wholeNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatNgn(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `₦${wholeNumber.format(Math.round(value))}`;
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `$${wholeNumber.format(Math.round(value))}`;
}

export function formatPlainNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return wholeNumber.format(Math.round(value));
}

/* "1 yr", "1 yr 1 mo", "2 yrs", "5 yrs 6 mos" */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];

  if (years > 0) parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
  if (rest > 0) parts.push(`${rest} ${rest === 1 ? "mo" : "mos"}`);
  if (parts.length === 0) parts.push("0 mos");

  return parts.join(" ");
}

/* "2021-01" → "Jan 2021" */
export function formatMonthLabel(isoMonth: string): string {
  const [year, month] = isoMonth.split("-").map(Number);
  if (!year || !month) return isoMonth;

  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
