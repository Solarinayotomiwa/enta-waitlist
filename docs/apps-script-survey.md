# Survey store — Apps Script contract

The survey uses the Google Sheet as its datastore. The website talks to an
**extended** Apps Script over a small JSON action protocol.

## Why a second environment variable

The current `SHEETS_WEBHOOK_URL` script is append-only: it writes whatever it
receives as a new row. Sending it an action payload would append junk to the
live signup sheet. So the survey uses its own variable:

```
SHEETS_SURVEY_WEBHOOK_URL = <exec URL of the extended script>
```

Until that variable is set, the site never calls the protocol at all — the
survey still renders and completion is attempted, but nothing is written and
the API reports `store: "unavailable"`. Setting the variable switches
everything on. It may point at the **same** script as `SHEETS_WEBHOOK_URL`
once that script understands the actions below.

## Request shape

Every call is `POST` with `Content-Type: text/plain;charset=utf-8` and a JSON
body containing an `action` plus named fields:

```json
{ "action": "signup.upsert", "userId": "…", "email": "…" }
```

## Response shape

Always reply with JSON:

```json
{ "ok": true, "data": { } }
{ "ok": false, "error": "reason" }
```

`ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON)`

## Actions

### 1. `signup.upsert`

Find the row in the signup sheet by **`UserId`**; fall back to `Email` only for
rows created before UserId existed (then backfill UserId). Never insert a
second signup row for a user that already exists.

Fields sent (write only those present, leave others untouched):

`userId`, `email`, `launchListSubmissionId`, `referredByCode`, `referralCode`,
`referralUrl`, `surveyStatus`, `surveySessionId`, `surveyTokenHash`,
`surveyResponseId`, `surveyStartedAt`, `surveyCompletedAt`

Columns added to the signup sheet (the script appends any that are missing on
first use, so there is nothing to create by hand):

```
UserId | LaunchListSubmissionId | ReferredByCode | ReferralCode | ReferralUrl |
SurveyStatus | SurveySessionId | SurveyTokenHash | SurveyResponseId |
SurveyAudience | SurveyCurrentStep | SurveyAnswersJson |
SurveyStartedAt | SurveyCompletedAt
```

Headers are matched with case, spaces and underscores ignored, so an existing
`user_id` column is recognised as `UserId` and is not duplicated.

Return `{ "ok": true, "data": { "updated": true } }`.

### 2. `survey.session.get`

Sent `{ userId, surveyTokenHash }`. Look up the signup row by `userId` **and**
verify `SurveyTokenHash` matches — that pairing is what stops one link reading
another person's row. Return only:

```json
{ "ok": true, "data": {
  "userId": "…", "firstName": "…", "email": "…", "country": "…",
  "audience": "individual", "surveyStatus": "in_progress", "currentStep": 3,
  "answers": { }, "launchListSubmissionId": "…",
  "referredByCode": "…", "referralCode": "…",
  "utmSource": "…", "utmMedium": "…", "utmCampaign": "…",
  "utmContent": "…", "utmTerm": "…"
} }
```

`answers` is the parsed `AnswersJson` from the row (or `{}`). If no row
matches, return `{ "ok": false, "error": "not_found" }` — never another row.

### 3. `survey.progress.save`

Sent `{ userId, surveySessionId, surveyTokenHash, currentStep, answers,
answersJson, surveyStatus, surveyStartedAt, audience }`.

Update the signup row (matched as above): set `SurveyStatus` to `in_progress`
if it is not already `completed`, store `currentStep` and `answersJson`, and
set `SurveyStartedAt` only if empty. Return `{ "ok": true, "data": { "saved": true } }`.

### 4. `survey.response.upsert`

Writes to a separate tab named exactly **`Survey Responses`**. Match on
`ResponseId`: if it exists, update that row; otherwise append. This is what
makes double submission safe — the site sends the same `ResponseId` on retry.

Fixed column order (do not derive it from object keys):

```
ResponseId | UserId | SurveySessionId | LaunchListSubmissionId |
ReferredByCode | ReferralCode | Audience | RoutedBy |
Name | FirstName | Email | Country |
UTM Source | UTM Medium | UTM Campaign | UTM Content | UTM Term |
Currency Used | Readiness | Timing | Cohort | Pay Intent | Concept Flag |
Intelligence Priority | Custody Verbatim | Cost Verbatim | Answers JSON |
Started At | Completed At
```

`Name`, `Email` and `Country` are read from the signup row rather than taken
from the request, so the tab is readable on its own and cannot be told an
identity that disagrees with the signup record.

Incoming field names map 1:1 in camelCase (`responseId`, `userId`,
`launchListSubmissionId`, `referredByCode`, `referralCode`, `audience`,
`routedBy`, `firstName`, `email`, `country`, `utmSource`, `utmMedium`,
`utmCampaign`, `utmContent`, `utmTerm`, `currencyUsed`, `readiness`, `timing`,
`cohort`, `payIntent`, `conceptFlag`, `intelligencePriority`,
`custodyVerbatim`, `costVerbatim`, `answersJson`, `startedAt`, `completedAt`).

`Answers JSON` keeps the complete answer structure so no response is ever lost,
while the individual columns exist for filtering.

Return `{ "ok": true, "data": { "created": true } }`.

## Email-link actions (welcome-email flow)

The generic survey link in the LaunchList welcome email needs two extra,
**key-gated** actions — they can identify a person from just an email address,
so the script refuses them unless the caller presents a shared key:

- `survey.session.byemail` — `{ email, apiKey }` → minimal identity
  (`userId`, `surveySessionId`, `firstName`, `audience`) used by the site's
  server to mint that person's link. Never exposed to a browser.
- `survey.email.send` — `{ email, surveyUrl, firstName?, apiKey }` → sends the
  personal link TO THAT INBOX via MailApp, with a 10-minute per-address
  cooldown (`SurveyLinkSentAt` column) so a form can't bomb an inbox.

Setup for these two (in addition to the usual deploy):

1. In the Apps Script editor: **Project Settings → Script properties → Add**
   `API_KEY` = the same value the site holds as `SHEETS_SURVEY_API_KEY`.
   (Script properties survive re-pasting the code file.)
2. Until the property is set, both actions refuse and everything else works.

## The script

The complete implementation is [`apps-script-survey.gs`](./apps-script-survey.gs)
— paste it in whole, no editing required. It is standalone: it only reads and
updates rows, so the script currently appending signups keeps working untouched.

To run both from one URL instead, paste this file into the existing signup
script, set `ENABLE_LEGACY_APPEND: true` in its `CONFIG`, and move that script's
original append code into `legacyAppend_()`.

The script was verified against a mock Spreadsheet service before release —
30 checks covering row matching, the token-hash pairing, resume, idempotent
completion, `completed` never reverting to `in_progress`, and adopting a legacy
row that has an email but no UserId.

## The /thankyou landing page

`/thankyou` is the post-signup landing page. It accepts:

| URL | Greeting | Referral link | Survey CTA |
| --- | --- | --- | --- |
| `/thankyou?t=<signed token>` | by first name | yes | yes |
| `/thankyou?ref=<code>` | generic | yes | no |
| `/thankyou` | generic | no | no |

The signed token is what authorises the survey. A referral code cannot stand in
for it: referral codes are *published* by design — anyone holding someone's
share link would otherwise be able to open that person's survey and answer as
them. So the `?ref=` path offers the share link only and tells the visitor their
survey link will arrive by email.

In the LaunchList dashboard, set the thank-you/redirect URL to
`https://entashiga.io/thankyou`. LaunchList appends its own referral parameter,
which the page uses for the share link. Signups through ENTA's own form get the
fully personalised `?t=` variant, because the server mints that token itself.

## After deploying

1. Deploy the script as a **web app**, execute as *me*, access *anyone*.
2. Set `SHEETS_SURVEY_WEBHOOK_URL` in Vercel (Production) to the `/exec` URL.
3. Redeploy the site.
4. Submit one test signup and confirm: one signup row (not two), a survey link
   that opens with the first name, and one row in `Survey Responses` on
   completion — with a second completion updating that row rather than adding
   another.
