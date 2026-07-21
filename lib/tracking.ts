export const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
] as const;

export type TrackingKey = (typeof TRACKING_KEYS)[number];

export type TrackingData = Partial<Record<TrackingKey, string>>;

export type StoredAttribution = TrackingData & {
  landingPage?: string;
  capturedAt?: string;
};

const STORAGE_KEY = "enta_first_touch_attribution";
const LEGACY_STORAGE_KEY = "enta-attribution";

export function getTrackingData(searchParams: URLSearchParams): TrackingData {
  return TRACKING_KEYS.reduce<TrackingData>((result, key) => {
    const value = searchParams.get(key)?.trim();

    if (value) {
      result[key] = value.slice(0, 200);
    }

    return result;
  }, {});
}

export function trackingQueryString(tracking: TrackingData): string {
  const params = new URLSearchParams();

  for (const key of TRACKING_KEYS) {
    const value = tracking[key];
    if (value) params.set(key, value);
  }

  return params.toString();
}

export function getAttribution(): StoredAttribution {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as StoredAttribution;
  } catch {
    return {};
  }
}

/* Visitors from before the storage rename keep their attribution. */
function migrateLegacyAttribution() {
  try {
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw || localStorage.getItem(STORAGE_KEY)) return;

    const legacy = JSON.parse(legacyRaw) as Record<string, unknown>;
    const migrated: StoredAttribution = {};

    for (const key of TRACKING_KEYS) {
      if (typeof legacy[key] === "string" && legacy[key]) migrated[key] = legacy[key] as string;
    }

    if (typeof legacy.landed_at === "string") migrated.capturedAt = legacy.landed_at;
    if (Object.keys(migrated).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }

    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* Corrupted legacy data is simply dropped. */
  }
}

/* UTMs are first-touch (the campaign that brought the visitor here first
   keeps the credit), but the LaunchList referral code (`?ref=`) is
   last-touch so a shared referral link gets credit even if the visitor has
   been here before. */
export function captureAttribution(): StoredAttribution {
  try {
    migrateLegacyAttribution();

    const current = getTrackingData(new URLSearchParams(window.location.search));
    const stored = getAttribution();
    let changed = false;

    if (current.ref && stored.ref !== current.ref) {
      stored.ref = current.ref;
      changed = true;
    }

    for (const key of TRACKING_KEYS) {
      if (key === "ref") continue;

      const value = current[key];

      if (value && !stored[key]) {
        stored[key] = value;
        changed = true;
      }
    }

    if (changed) {
      if (!stored.landingPage) {
        stored.landingPage = `${window.location.origin}${window.location.pathname}${window.location.search}`.slice(
          0,
          500,
        );
      }

      if (!stored.capturedAt) stored.capturedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }

    return stored;
  } catch {
    return {};
  }
}
