import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { SurveyAudience } from "@/lib/survey/surveyTypes";

/* Survey links carry an opaque, signed token — never an email, phone number,
   country or LaunchList id. The payload holds ENTA's own opaque userId, the
   audience, the session id, an expiry and the participant's first name, all
   covered by an HMAC so it cannot be edited or forged. Identity therefore
   resolves without a database round-trip, while the Sheet keeps the hashed
   token for session state and revocation.

   On firstName: it rides in the token so the survey can greet people before the
   Sheet store exists. The token body is base64url, so a leaked link reveals a
   first name to whoever holds it — accepted deliberately, since the link is
   already a bearer credential for that person's own survey and a first name is
   the least identifying field we hold. Nothing else personal is included. */

const TOKEN_TTL_DAYS = 30;
const TOKEN_VERSION = "v1";

/* v2 packs the same payload as raw bytes instead of base64url'd JSON — the
   UUID becomes 16 bytes rather than a 36-char string, the expiry 4 bytes
   rather than a 13-digit millisecond number, and the HMAC is truncated to
   128 bits (standard practice; forging still requires the full secret). The
   result is a ~90-char link instead of ~260. v1 links already in inboxes keep
   verifying below. */
const V2_VERSION_BYTE = 2;
const V2_SIGNATURE_BYTES = 16;
const AUDIENCE_CODES: Record<string, number> = { individual: 1, business: 2 };
const AUDIENCE_FROM_CODE: Record<number, SurveyAudience | undefined> = {
  1: "individual" as SurveyAudience,
  2: "business" as SurveyAudience,
};

export type SurveyTokenPayload = {
  userId: string;
  surveySessionId: string;
  audience?: SurveyAudience;
  firstName?: string;
  referralCode?: string;
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

/* ── v2 binary helpers ─────────────────────────────────────────────────── */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION_PATTERN = /^ss_[0-9a-f]{24}$/i;

function signV2(payload: Buffer): Buffer {
  return createHmac("sha256", secret()).update(payload).digest().subarray(0, V2_SIGNATURE_BYTES);
}

function packString(value: string, maxBytes: number): Buffer {
  const bytes = Buffer.from(value, "utf8").subarray(0, maxBytes);
  return Buffer.concat([Buffer.from([bytes.length]), bytes]);
}

function encodeV2(payload: SurveyTokenPayload): string | null {
  /* Only canonical ids pack into fixed-width bytes; anything else (older test
     links, hand-minted ids) falls back to the JSON format. */
  if (!UUID_PATTERN.test(payload.userId) || !SESSION_PATTERN.test(payload.surveySessionId)) {
    return null;
  }

  const body = Buffer.concat([
    Buffer.from([V2_VERSION_BYTE]),
    Buffer.from(payload.userId.replace(/-/g, ""), "hex"),
    Buffer.from(payload.surveySessionId.slice(3), "hex"),
    Buffer.from([AUDIENCE_CODES[payload.audience ?? ""] ?? 0]),
    (() => {
      const expiry = Buffer.alloc(4);
      expiry.writeUInt32BE(Math.floor(payload.expiresAt / 1000));
      return expiry;
    })(),
    packString(payload.firstName ?? "", 64),
    packString(payload.referralCode ?? "", 64),
  ]);

  return `${base64url(body)}.${base64url(signV2(body))}`;
}

function decodeV2(token: string): SurveyTokenPayload | null {
  const [encodedBody, encodedSignature, extra] = token.split(".");
  if (!encodedBody || !encodedSignature || extra !== undefined) return null;

  const body = fromBase64url(encodedBody);
  const received = fromBase64url(encodedSignature);
  if (body.length < 23 || body[0] !== V2_VERSION_BYTE) return null;

  const computed = signV2(body);
  if (received.length !== computed.length || !timingSafeEqual(received, computed)) return null;

  const hex = (from: number, to: number) => body.subarray(from, to).toString("hex");
  const userId = `${hex(1, 5)}-${hex(5, 7)}-${hex(7, 9)}-${hex(9, 11)}-${hex(11, 17)}`;
  const surveySessionId = `ss_${hex(17, 29)}`;
  const audience = AUDIENCE_FROM_CODE[body[29]];
  const expiresAt = body.readUInt32BE(30) * 1000;
  if (Date.now() > expiresAt) return null;

  let offset = 34;
  const readString = (): string | undefined => {
    const length = body[offset];
    if (length === undefined || offset + 1 + length > body.length) return undefined;
    const value = body.subarray(offset + 1, offset + 1 + length).toString("utf8");
    offset += 1 + length;
    return value || undefined;
  };

  const firstName = readString();
  const referralCode = readString();

  return { userId, surveySessionId, audience, firstName, referralCode, expiresAt };
}

export function createSurveyToken(input: {
  userId: string;
  surveySessionId: string;
  audience?: SurveyAudience;
  firstName?: string;
  referralCode?: string;
  ttlDays?: number;
}): string {
  const expiresAt = Date.now() + (input.ttlDays ?? TOKEN_TTL_DAYS) * 24 * 60 * 60 * 1000;
  const payload: SurveyTokenPayload = {
    userId: input.userId,
    surveySessionId: input.surveySessionId,
    audience: input.audience,
    firstName: input.firstName || undefined,
    referralCode: input.referralCode || undefined,
    expiresAt,
  };

  const compact = encodeV2(payload);
  if (compact) return compact;

  const body = `${TOKEN_VERSION}.${base64url(JSON.stringify(payload))}`;
  return `${body}.${sign(body)}`;
}

export function verifySurveyToken(token: string | null | undefined): SurveyTokenPayload | null {
  if (!token) return null;

  const parts = token.split(".");

  /* Two segments → compact v2; three → the original JSON format, kept so links
     issued before the change stay valid until their own expiry. */
  if (parts.length === 2) {
    try {
      return decodeV2(token);
    } catch {
      return null;
    }
  }

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

/* The post-signup landing page. Same opaque token as the survey, so the page can
   greet the signup and hand them onward without any identifier in the URL. */
export function thankYouUrl(origin: string, token: string): string {
  return `${origin}/thankyou?t=${encodeURIComponent(token)}`;
}
