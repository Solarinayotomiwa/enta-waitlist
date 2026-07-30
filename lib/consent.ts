export type ConsentChoice = "accepted" | "declined";

const CONSENT_KEY = "enta_cookie_consent";

/* Remembering the visitor's own choice is strictly necessary storage, so it is
   written regardless of the answer. Everything else (marketing attribution in
   lib/tracking.ts) waits for "accepted". */
export function getConsent(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

export function hasTrackingConsent(): boolean {
  return getConsent() === "accepted";
}

export const CONSENT_EVENT = "enta:consent";

export function setConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* Private browsing can block storage; the banner still closes for this
       visit and nothing is tracked. */
  }

  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: choice }));
}
