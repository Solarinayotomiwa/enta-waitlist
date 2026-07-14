const STORAGE_KEY = "enta-attribution";

export type Attribution = {
  ref_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landed_at?: string;
};

const attributionKeys = [
  "ref_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

// First-touch attribution: the first UTM/ref values a visitor arrives with win,
// so the original source keeps credit even if they sign up on a later visit.
export function captureAttribution(): Attribution {
  try {
    const params = new URLSearchParams(window.location.search);
    const stored = getAttribution();
    let changed = false;

    for (const key of attributionKeys) {
      const value = params.get(key);

      if (value && !stored[key]) {
        stored[key] = value.slice(0, 200);
        changed = true;
      }
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
