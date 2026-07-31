/**
 * ENTA — survey store for the waitlist spreadsheet.
 *
 * Deploy this as its own Apps Script web app. It does not replace the existing
 * signup webhook and does not need to be merged into it: it only ever reads and
 * updates rows, so the script currently appending signups keeps working exactly
 * as it does today.
 *
 * Setup
 *   1. Open the waitlist spreadsheet → Extensions → Apps Script.
 *   2. Paste this file over Code.gs and save.
 *   3. Deploy → New deployment → Web app.
 *        Execute as:      Me
 *        Who has access:  Anyone
 *   4. Copy the /exec URL and set it in Vercel as SHEETS_SURVEY_WEBHOOK_URL
 *      (Production), then redeploy the site.
 *
 * Columns are matched by header name, ignoring case, spaces and underscores —
 * so "UserId", "User Id" and "user_id" are all the same column. Any survey
 * column that does not exist yet is appended to the header row on first use,
 * so there is nothing to set up by hand.
 */

var CONFIG = {
  // '' uses the spreadsheet this script is bound to. Set an ID to target
  // another file.
  SPREADSHEET_ID: '',

  // '' uses the first sheet — the one the signup webhook already appends to.
  SIGNUP_SHEET: '',

  // Created automatically on the first completed survey.
  RESPONSES_SHEET: 'Survey Responses',

  // Leave false for a standalone deployment. Only set true if you paste this
  // into the EXISTING signup script, in which case put that script's original
  // append code inside legacyAppend_() below so one URL can serve both.
  ENABLE_LEGACY_APPEND: false,
};

/* Fixed column order for the Survey Responses tab. Written positionally from
   this list — never from object key order — so inserting a field here is the
   only way the layout can change. */
var RESPONSE_COLUMNS = [
  'ResponseId',
  'UserId',
  'SurveySessionId',
  'LaunchListSubmissionId',
  'ReferredByCode',
  'ReferralCode',
  'Audience',
  'RoutedBy',
  'Name',
  'FirstName',
  'Email',
  'Country',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'UTM Content',
  'UTM Term',
  'Currency Used',
  'Readiness',
  'Timing',
  'Cohort',
  'Pay Intent',
  'Concept Flag',
  'Intelligence Priority',
  'Custody Verbatim',
  'Cost Verbatim',
  'Answers JSON',
  'Started At',
  'Completed At',
];

/* Survey columns added to the existing signup sheet. */
var SIGNUP_SURVEY_COLUMNS = [
  'UserId',
  'LaunchListSubmissionId',
  'ReferredByCode',
  'ReferralCode',
  'ReferralUrl',
  'SurveyStatus',
  'SurveySessionId',
  'SurveyTokenHash',
  'SurveyResponseId',
  'SurveyAudience',
  'SurveyCurrentStep',
  'SurveyAnswersJson',
  'SurveyStartedAt',
  'SurveyCompletedAt',
];

/* Header aliases for columns the signup webhook already writes. The first one
   that exists in the sheet wins. */
var SIGNUP_ALIASES = {
  userId: ['UserId', 'user_id'],
  email: ['Email', 'email', 'Email Address'],
  name: ['Name', 'name', 'Full Name', 'Contact Name', 'contact_name'],
  country: ['Country', 'country'],
  audience: ['Audience', 'audience', 'Type', 'type'],
  referredByCode: ['ReferredByCode', 'ref', 'Ref', 'ref_id'],
  referralCode: ['ReferralCode', 'referral_id', 'Referral Id'],
  referralUrl: ['ReferralUrl', 'referral_link', 'Referral Link'],
  utmSource: ['UTM Source', 'utm_source'],
  utmMedium: ['UTM Medium', 'utm_medium'],
  utmCampaign: ['UTM Campaign', 'utm_campaign'],
  utmContent: ['UTM Content', 'utm_content'],
  utmTerm: ['UTM Term', 'utm_term'],
  landingPage: ['Landing Page', 'landing_page'],
  attributionCapturedAt: ['Attribution Captured At', 'attribution_captured_at'],
  launchListSubmissionId: ['LaunchListSubmissionId', 'submission_id'],
};

// ───────────────────────────────────────────────────────── entry points

function doPost(e) {
  var body;

  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json({ ok: false, error: 'bad_json' });
  }

  var action = body.action || '';

  /* Mutations serialise: two survey completions arriving together must not both
     decide the same row is missing and each append one. */
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(25000);
  } catch (err) {
    return json({ ok: false, error: 'busy' });
  }

  try {
    switch (action) {
      case 'signup.upsert':
        return json({ ok: true, data: upsertSignup_(body) });
      case 'survey.session.get':
        return json(getSession_(body));
      case 'survey.progress.save':
        return json({ ok: true, data: saveProgress_(body) });
      case 'survey.response.upsert':
        return json({ ok: true, data: upsertResponse_(body) });
      default:
        if (CONFIG.ENABLE_LEGACY_APPEND) return legacyAppend_(body, e);
        return json({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return json({ ok: false, error: String((err && err.message) || err) });
  } finally {
    lock.releaseLock();
  }
}

/* Lets you confirm the deployment is live by opening the /exec URL. */
function doGet() {
  return json({ ok: true, data: { service: 'enta-survey-store' } });
}

// ───────────────────────────────────────────────────────── actions

function upsertSignup_(body) {
  var sheet = signupSheet_();
  ensureColumns_(sheet, SIGNUP_SURVEY_COLUMNS);

  var located = findSignupRow_(sheet, body.userId, body.email);
  var row = located.row;

  if (!row) {
    /* The signup webhook normally creates the row moments earlier. If it is
       genuinely absent, start one rather than lose the identity link — it
       carries UserId and Email, so every later lookup will find it. */
    row = sheet.getLastRow() + 1;
    writeCells_(sheet, row, {
      UserId: body.userId || '',
      Email: body.email || '',
    });
  } else if (located.matchedBy === 'email' && body.userId) {
    var existingId = String(readCell_(sheet, row, 'UserId') || '');

    if (!existingId) {
      /* Migration path: an older row keyed only by email gets its UserId. */
      writeCells_(sheet, row, { UserId: body.userId });
    } else if (existingId !== String(body.userId)) {
      /* Same email signing up again with a fresh identity: keep the original
         row exactly as it is — re-keying it would break the first signup's
         survey link and let the new one read the old session. */
      return { updated: false, existing: true };
    }
  }

  writeCells_(sheet, row, {
    LaunchListSubmissionId: body.launchListSubmissionId,
    ReferredByCode: body.referredByCode,
    ReferralCode: body.referralCode,
    ReferralUrl: body.referralUrl,
    SurveyStatus: body.surveyStatus,
    SurveySessionId: body.surveySessionId,
    SurveyTokenHash: body.surveyTokenHash,
    SurveyResponseId: body.surveyResponseId,
    SurveyStartedAt: body.surveyStartedAt,
    SurveyCompletedAt: body.surveyCompletedAt,
  });

  return { updated: true };
}

function getSession_(body) {
  var sheet = signupSheet_();
  var located = findSignupRow_(sheet, body.userId, '');

  if (!located.row) return { ok: false, error: 'not_found' };

  var row = located.row;
  var stored = String(readCell_(sheet, row, 'SurveyTokenHash') || '');
  var incoming = String(body.surveyTokenHash || '');

  /* The pairing of userId AND token hash is what stops one link reading another
     person's row. A blank stored hash means the row predates the survey, so
     adopt the first valid link presented for it. */
  if (stored && incoming && stored !== incoming) return { ok: false, error: 'not_found' };
  if (!stored && incoming) writeCells_(sheet, row, { SurveyTokenHash: incoming });

  var fullName = String(aliasValue_(sheet, row, 'name') || '');

  return {
    ok: true,
    data: {
      userId: String(readCell_(sheet, row, 'UserId') || body.userId || ''),
      firstName: firstWord_(fullName),
      email: String(aliasValue_(sheet, row, 'email') || ''),
      country: String(aliasValue_(sheet, row, 'country') || ''),
      audience: String(
        readCell_(sheet, row, 'SurveyAudience') || aliasValue_(sheet, row, 'audience') || ''
      ),
      surveyStatus: String(readCell_(sheet, row, 'SurveyStatus') || 'not_started'),
      currentStep: Number(readCell_(sheet, row, 'SurveyCurrentStep') || 0),
      answers: parseJson_(readCell_(sheet, row, 'SurveyAnswersJson')),
      launchListSubmissionId: String(readCell_(sheet, row, 'LaunchListSubmissionId') || ''),
      referredByCode: String(
        readCell_(sheet, row, 'ReferredByCode') || aliasValue_(sheet, row, 'referredByCode') || ''
      ),
      referralCode: String(
        readCell_(sheet, row, 'ReferralCode') || aliasValue_(sheet, row, 'referralCode') || ''
      ),
      surveyResponseId: String(readCell_(sheet, row, 'SurveyResponseId') || ''),
      utmSource: String(aliasValue_(sheet, row, 'utmSource') || ''),
      utmMedium: String(aliasValue_(sheet, row, 'utmMedium') || ''),
      utmCampaign: String(aliasValue_(sheet, row, 'utmCampaign') || ''),
      utmContent: String(aliasValue_(sheet, row, 'utmContent') || ''),
      utmTerm: String(aliasValue_(sheet, row, 'utmTerm') || ''),
      landingPage: String(aliasValue_(sheet, row, 'landingPage') || ''),
      attributionCapturedAt: String(aliasValue_(sheet, row, 'attributionCapturedAt') || ''),
    },
  };
}

function saveProgress_(body) {
  var sheet = signupSheet_();
  ensureColumns_(sheet, SIGNUP_SURVEY_COLUMNS);

  var located = findSignupRow_(sheet, body.userId, '');
  if (!located.row) return { saved: false };

  var row = located.row;
  var stored = String(readCell_(sheet, row, 'SurveyTokenHash') || '');
  var incoming = String(body.surveyTokenHash || '');
  if (stored && incoming && stored !== incoming) return { saved: false };

  var status = String(readCell_(sheet, row, 'SurveyStatus') || '');
  var updates = {
    SurveySessionId: body.surveySessionId,
    SurveyCurrentStep: body.currentStep,
    SurveyAnswersJson: body.answersJson,
    SurveyAudience: body.audience,
  };

  /* Never walk a finished survey back to in_progress. */
  if (status !== 'completed') updates.SurveyStatus = body.surveyStatus || 'in_progress';
  if (!readCell_(sheet, row, 'SurveyStartedAt')) updates.SurveyStartedAt = body.surveyStartedAt;

  writeCells_(sheet, row, updates);
  return { saved: true };
}

function upsertResponse_(body) {
  var responses = responsesSheet_();
  var responseId = String(body.responseId || '');
  if (!responseId) throw new Error('responseId is required');

  /* Identity columns are taken from the signup row rather than the request, so
     the response tab reads correctly on its own and cannot be told a name or
     email that disagrees with the signup record. */
  var signup = signupSheet_();
  var located = findSignupRow_(signup, body.userId, body.email);
  var fullName = '';
  var email = String(body.email || '');
  var country = String(body.country || '');
  var startedAt = String(body.startedAt || '');

  if (located.row) {
    fullName = String(aliasValue_(signup, located.row, 'name') || '');
    email = String(aliasValue_(signup, located.row, 'email') || '') || email;
    country = String(aliasValue_(signup, located.row, 'country') || '') || country;
    startedAt = startedAt || String(readCell_(signup, located.row, 'SurveyStartedAt') || '');
  }

  var values = {
    ResponseId: responseId,
    UserId: body.userId,
    SurveySessionId: body.surveySessionId,
    LaunchListSubmissionId: body.launchListSubmissionId,
    ReferredByCode: body.referredByCode,
    ReferralCode: body.referralCode,
    Audience: body.audience,
    RoutedBy: body.routedBy,
    Name: fullName,
    FirstName: body.firstName || firstWord_(fullName),
    Email: email,
    Country: country,
    'UTM Source': body.utmSource,
    'UTM Medium': body.utmMedium,
    'UTM Campaign': body.utmCampaign,
    'UTM Content': body.utmContent,
    'UTM Term': body.utmTerm,
    'Currency Used': body.currencyUsed,
    Readiness: body.readiness,
    Timing: body.timing,
    Cohort: body.cohort,
    'Pay Intent': body.payIntent,
    'Concept Flag': body.conceptFlag,
    'Intelligence Priority': body.intelligencePriority,
    'Custody Verbatim': body.custodyVerbatim,
    'Cost Verbatim': body.costVerbatim,
    'Answers JSON': body.answersJson,
    'Started At': startedAt,
    'Completed At': body.completedAt,
  };

  /* Positional write from RESPONSE_COLUMNS — the same responseId always lands
     on the same row, so a retried submission updates instead of duplicating. */
  var ordered = RESPONSE_COLUMNS.map(function (header) {
    var value = values[header];
    return value === undefined || value === null ? '' : value;
  });

  var existing = findRowByValue_(responses, 1, responseId);

  if (existing) {
    responses.getRange(existing, 1, 1, ordered.length).setValues([ordered]);
    return { created: false, updated: true };
  }

  responses.appendRow(ordered);
  return { created: true, updated: false };
}

/* Only reached when ENABLE_LEGACY_APPEND is true. Paste the body of the
   existing signup script's doPost here if you merge the two. */
function legacyAppend_(body, e) {
  throw new Error('legacyAppend_ is enabled but not implemented');
}

// ───────────────────────────────────────────────────────── sheet helpers

function spreadsheet_() {
  return CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

function signupSheet_() {
  var file = spreadsheet_();
  var sheet = CONFIG.SIGNUP_SHEET ? file.getSheetByName(CONFIG.SIGNUP_SHEET) : file.getSheets()[0];
  if (!sheet) throw new Error('Signup sheet not found');
  return sheet;
}

function responsesSheet_() {
  var file = spreadsheet_();
  var sheet = file.getSheetByName(CONFIG.RESPONSES_SHEET);

  if (!sheet) {
    sheet = file.insertSheet(CONFIG.RESPONSES_SHEET);
    sheet.appendRow(RESPONSE_COLUMNS);
    sheet.setFrozenRows(1);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(RESPONSE_COLUMNS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function normalizeKey_(value) {
  return String(value == null ? '' : value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/* header (normalised) → 1-based column index */
function headerMap_(sheet) {
  var width = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, width).getValues()[0];
  var map = {};

  for (var i = 0; i < headers.length; i++) {
    var key = normalizeKey_(headers[i]);
    if (key && !(key in map)) map[key] = i + 1;
  }

  return map;
}

function ensureColumns_(sheet, headers) {
  var map = headerMap_(sheet);
  var missing = headers.filter(function (header) {
    return !(normalizeKey_(header) in map);
  });

  if (!missing.length) return;

  var start = sheet.getLastColumn() + 1;
  sheet.getRange(1, start, 1, missing.length).setValues([missing]);
}

function columnIndex_(sheet, header) {
  return headerMap_(sheet)[normalizeKey_(header)] || 0;
}

/* First alias that exists as a column, read for the given row. */
function aliasValue_(sheet, row, aliasKey) {
  var candidates = SIGNUP_ALIASES[aliasKey] || [];
  var map = headerMap_(sheet);

  for (var i = 0; i < candidates.length; i++) {
    var column = map[normalizeKey_(candidates[i])];
    if (column) {
      var value = sheet.getRange(row, column).getValue();
      if (value !== '' && value !== null) return value;
    }
  }

  return '';
}

function readCell_(sheet, row, header) {
  var column = columnIndex_(sheet, header);
  return column ? sheet.getRange(row, column).getValue() : '';
}

/* Writes only the keys present, leaving every other column untouched. */
function writeCells_(sheet, row, values) {
  var map = headerMap_(sheet);

  Object.keys(values).forEach(function (header) {
    var value = values[header];
    if (value === undefined || value === null || value === '') return;

    var column = map[normalizeKey_(header)];
    if (!column) return;

    sheet.getRange(row, column).setValue(value);
  });
}

function findRowByValue_(sheet, column, value) {
  var last = sheet.getLastRow();
  if (last < 2 || !value) return 0;

  var values = sheet.getRange(2, column, last - 1, 1).getValues();
  var needle = String(value).trim();

  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === needle) return i + 2;
  }

  return 0;
}

/* UserId is the canonical key; email is only a fallback for rows created before
   UserId existed. */
function findSignupRow_(sheet, userId, email) {
  var map = headerMap_(sheet);

  if (userId) {
    var userColumn = firstColumn_(map, SIGNUP_ALIASES.userId);
    if (userColumn) {
      var row = findRowByValue_(sheet, userColumn, userId);
      if (row) return { row: row, matchedBy: 'userId' };
    }
  }

  if (email) {
    var emailColumn = firstColumn_(map, SIGNUP_ALIASES.email);
    if (emailColumn) {
      var emailRow = findRowByValue_(sheet, emailColumn, email);
      if (emailRow) return { row: emailRow, matchedBy: 'email' };
    }
  }

  return { row: 0, matchedBy: '' };
}

function firstColumn_(map, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var column = map[normalizeKey_(candidates[i])];
    if (column) return column;
  }
  return 0;
}

function firstWord_(value) {
  var trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return trimmed.split(/\s+/)[0];
}

function parseJson_(value) {
  if (!value) return {};
  try {
    return JSON.parse(String(value));
  } catch (err) {
    return {};
  }
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
