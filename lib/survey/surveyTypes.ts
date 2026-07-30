export type SurveyAudience = "individual" | "business";

export type SurveyStatus = "not_started" | "in_progress" | "completed";

export type SurveyAnswerValue = string | string[] | null;

/* A follow-up "say more" prompt attached to a question. The engine expands it
   into its own always-skippable screen. */
export type SurveyFollowUp = {
  ack?: SurveyCopy;
  q: SurveyCopy;
  hint?: SurveyCopy;
};

/* Copy is either fixed or resolved against the participant's first name, so
   the same question set works with and without personalisation. */
export type SurveyCopy = string | ((firstName: string) => string);

export type SurveyStepType = "say" | "single" | "multi" | "open";

export type SurveyStep = {
  id: string;
  theme: string;
  step: string;
  type: SurveyStepType;
  ack?: SurveyCopy;
  q?: SurveyCopy;
  hint?: SurveyCopy;
  cta?: string;
  opts?: readonly string[];
  /* Selecting this option clears every other choice (and vice versa). */
  exclusive?: string;
  /* The prompt is generated at runtime from the participant's currency. */
  dynamic?: boolean;
  more?: SurveyFollowUp;
  /* Set on expanded follow-up screens so the answer can be traced back. */
  parent?: string;
};

export type SurveyInstrument = {
  key: SurveyAudience;
  label: string;
  /* Accent + chip drive the two visual tracks (Early access / Closed pilot). */
  accent: string;
  accentWash: string;
  chip: string;
  steps: readonly SurveyStep[];
  intelligenceLead: (example: string) => string;
  payIntent: Record<string, string>;
  close: (firstName: string) => string;
};

/* Only what the survey client legitimately needs to render. No email, no
   LaunchList ids, no token hashes. */
export type SurveyParticipant = {
  userId: string;
  firstName?: string;
  audience?: SurveyAudience;
  country?: string;
  surveyStatus: SurveyStatus;
  currentStep?: number;
  answers?: Record<string, SurveyAnswerValue>;
};

export type SurveyCompletionPayload = {
  responseId: string;
  userId: string;
  surveySessionId: string;
  launchListSubmissionId?: string;
  referredByCode?: string;
  referralCode?: string;
  instrument: SurveyAudience;
  routedBy: "waitlist_tag" | "survey_fork";
  currencyUsedInExamples?: string;
  readiness?: string;
  timing?: string;
  cohort?: string;
  payIntent: string[];
  conceptFlag?: string;
  intelligencePriority: string[];
  verbatims: {
    custody?: string;
    cost?: string;
  };
  answers: Record<string, { value: SurveyAnswerValue; theme: string }>;
  completedAt: string;
};
