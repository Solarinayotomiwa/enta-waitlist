import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { SurveyAudience } from "@/lib/survey/surveyTypes";

/* Survey links carry an opaque, signed token — never a name, email, country or
   LaunchList id. The payload holds only ENTA's own opaque userId, the audience,
   the session id and an expiry, all covered by an HMAC so it cannot be edited
   or forged. Identity therefore resolves without a database round-trip, while
   the Sheet keeps the hashed token for session state and revocation. */

const TOKEN_TTL_DAYS = 30;
const TOKEN_VERSION = "v1";

export type SurveyTokenPayload = {
  userId: string;
  surveySessionId: string;
  audience?: SurveyAudience;
  expiresAt: number;
};

function secret(): string {
  const value = process.env.SURVEY_TOKEN_SECRET?.replace(/^﻿/, "").trim();

  /* Fail closed: a weak fallback would make tokens forgeable, so callers treat
     a missing secret as "survey unavailable" rather than issuing bad links. */
  if (!value || value.length < 32) {
    throw new Error("SURVEY_TOKEN_SECRET is missing or too short (needs 32+ chars)");
  }

  return value;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(value: string): Buffer {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(body: string): string {
  return base64url(createHmac("sha256", secret()).update(body).digest());
}

export function createSurveyToken(input: {
  userId: string;
  surveySessionId: string;
  audience?: SurveyAudience;
  ttlDays?: number;
}): string {
  const expiresAt = Date.now() + (input.ttlDays ?? TOKEN_TTL_DAYS) * 24 * 60 * 60 * 1000;
  const payload: SurveyTokenPayload = {
    userId: input.userId,
    surveySessionId: input.surveySessionId,
    audience: input.audience,
    expiresAt,
  };

  const body = `${TOKEN_VERSION}.${base64url(JSON.stringify(payload))}`;
  return `${body}.${sign(body)}`;
}

export function verifySurveyToken(token: string | null | undefined): SurveyTokenPayload | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [version, encodedPayload, signature] = parts;
  if (version !== TOKEN_VERSION) return null;

  try {
    const expected = sign(`${version}.${encodedPayload}`);
    const received = Buffer.from(signature);
    const computed = Buffer.from(expected);

    if (received.length !== computed.length || !timingSafeEqual(received, computed)) return null;

    const payload = JSON.parse(fromBase64url(encodedPayload).toString()) as SurveyTokenPayload;

    if (!payload.userId || !payload.surveySessionId) return null;
    if (typeof payload.expiresAt !== "number" || Date.now() > payload.expiresAt) return null;

    return payload;
  } catch {
    return null;
  }
}

/* The Sheet stores this instead of the token itself, so a leaked export cannot
   be replayed to open somebody's survey. */
export function hashSurveyToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newSurveySessionId(): string {
  return `ss_${randomBytes(12).toString("hex")}`;
}

export function newResponseId(surveySessionId: string): string {
  /* Deterministic per session: retrying completion reuses the same id, so the
     Sheet can no-op a duplicate instead of writing a second response. */
  return `sr_${createHash("sha256").update(surveySessionId).digest("hex").slice(0, 20)}`;
}

export function surveyUrl(origin: string, token: string): string {
  return `${origin}/interview?t=${encodeURIComponent(token)}`;
}
