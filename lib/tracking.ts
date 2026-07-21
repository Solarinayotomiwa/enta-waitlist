const STORAGE_KEY = "enta-attribution";

export type Attribution = {
  ref?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landed_at?: string;
  launchlist_query?: string;
};

const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/* UTMs stay first-touch, but the LaunchList referral code (`?ref=`) is
   last-touch so a shared referral link gets credit even if the visitor has
   been here before. */
export function captureAttribution(): Attribution {
  try {
    const params = new URLSearchParams(window.location.search);
    const stored = getAttribution();
    let changed = false;
    const currentRef = params.get("ref");

    if (currentRef) {
      const ref = currentRef.slice(0, 200);

      if (stored.ref !== ref) {
        stored.ref = ref;
        changed = true;
      }
    }

    for (const key of utmKeys) {
      const value = params.get(key);

      if (value && !stored[key]) {
        stored[key] = value.slice(0, 200);
        changed = true;
      }
    }

    const launchlistQuery = params.toString();

    if (launchlistQuery && (currentRef || !stored.launchlist_query)) {
      stored.launchlist_query = launchlistQuery.slice(0, 500);
      changed = true;
    }

    if (changed) {
      if (!stored.landed_at) stored.landed_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }

    return stored;
  } catch {
    return {};
  }
}

export function getAttribution(): Attribution {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Attribution;
  } catch {
    return {};
  }
}
