import { businessInstrument } from "@/lib/survey/businessQuestions";
import { individualInstrument } from "@/lib/survey/individualQuestions";
import type {
  SurveyAnswerValue,
  SurveyAudience,
  SurveyCopy,
  SurveyInstrument,
  SurveyStep,
} from "@/lib/survey/surveyTypes";

export const instruments: Record<SurveyAudience, SurveyInstrument> = {
  individual: individualInstrument,
  business: businessInstrument,
};

/* Strips anything that isn't a letter, number, apostrophe or hyphen so a name
   can never inject markup into the greeting. */
export function firstNameOf(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .split(/\s+/)[0]
    .replace(/[^\p{L}\p{N}'-]/gu, "")
    .slice(0, 40);
}

export function resolveCopy(copy: SurveyCopy | undefined, firstName: string): string {
  if (!copy) return "";
  return typeof copy === "function" ? copy(firstName) : copy;
}

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  nigeria: "naira",
  ghana: "cedis",
  kenya: "shillings",
  "south africa": "rand",
  "united kingdom": "pounds",
  uk: "pounds",
  "united arab emirates": "dirhams",
  uae: "dirhams",
  tanzania: "shillings",
  uganda: "shillings",
  rwanda: "francs",
  egypt: "pounds",
  "united states": "dollars",
  usa: "dollars",
  canada: "Canadian dollars",
};

const DIASPORA = [
  "united kingdom",
  "uk",
  "united arab emirates",
  "uae",
  "united states",
  "usa",
  "canada",
];

export function localCurrency(country: string | undefined): string | null {
  return CURRENCY_BY_COUNTRY[(country ?? "").trim().toLowerCase()] ?? null;
}

function isDiaspora(country: string | undefined): boolean {
  return DIASPORA.includes((country ?? "").trim().toLowerCase());
}

/* The dynamic intelligence question leads with an example in the participant's
   own currency, shaped by what they said they use money for. */
export function rateExample(
  audience: SurveyAudience,
  country: string | undefined,
  answers: Record<string, SurveyAnswerValue>,
): string {
  const manual = typeof answers.currency_manual === "string" ? answers.currency_manual : null;
  const currency = manual ?? localCurrency(country) ?? "your currency";

  if (audience === "individual") {
    const purposes = Array.isArray(answers.q1_purpose) ? answers.q1_purpose : [];
    const crossBorder = purposes.some((value) => /across borders/i.test(value));

    if (crossBorder && isDiaspora(country)) return `Say you earn in ${currency} but send money home`;
    if (crossBorder) return `Say you earn in ${currency} but need to move value out`;
    return `Say you earn in ${currency} but want to hold dollars or gold`;
  }

  const handling = Array.isArray(answers.q1_handling) ? answers.q1_handling : [];
  const outbound = handling.some((value) => /across borders|Paying suppliers/i.test(value));

  return outbound
    ? `Say the business earns in ${currency} but pays out in dollars or euros`
    : `Say the business is paid in ${currency} and needs those balances to hold their value`;
}

const currencyStep: SurveyStep = {
  id: "currency_manual",
  theme: "context",
  step: "One quick thing",
  type: "single",
  ack: (name) =>
    name
      ? `Before the next one, ${name} — so the examples make sense.`
      : "Before the next one — so the examples make sense.",
  q: "Which currency do you mostly earn or hold in?",
  opts: ["Naira", "Cedis", "Shillings", "Rand", "Dollars", "Pounds", "Euros", "Something else"],
};

export const forkStep: SurveyStep = {
  id: "fork",
  theme: "meta",
  step: "Which one",
  type: "single",
  ack: (name) =>
    name ? `Just so I ask you the right things, ${name}.` : "Just so I ask the right things.",
  q: "Which of these is you?",
  opts: ["I’m here for myself", "I’m here for my business"],
};

export function welcomeStep(firstName: string): SurveyStep {
  return {
    id: "hello",
    theme: "meta",
    step: "Welcome",
    type: "say",
    q: firstName
      ? `Welcome, ${firstName} — really glad you joined.`
      : "Welcome — really glad you joined.",
    hint: "A few quick taps so we build ENTA around how you actually handle money. About 90 seconds, and there are no wrong answers.",
    cta: "Let’s go",
  };
}

/* Each optional "say more" prompt becomes its own screen, and the currency
   question is only inserted when the country didn't give us one. */
export function expandInstrumentSteps(
  instrument: SurveyInstrument,
  country: string | undefined,
): SurveyStep[] {
  const steps: SurveyStep[] = [];

  for (const step of instrument.steps) {
    steps.push(step);

    if (step.more) {
      steps.push({
        id: `${step.id}_note`,
        theme: step.theme,
        step: step.step,
        type: "open",
        parent: step.id,
        ack: step.more.ack,
        q: step.more.q,
        hint: step.more.hint,
      });
    }
  }

  if (!localCurrency(country)) {
    const insertAt = steps.findIndex((step) => step.id === "q4_intel");
    if (insertAt >= 0) steps.splice(insertAt, 0, currencyStep);
  }

  return steps;
}

/* Questions only — the welcome screen shouldn't inflate the progress count. */
export function progressOf(queue: SurveyStep[], index: number) {
  const asked = queue.filter((step) => step.type !== "say").length;
  const done = queue.slice(0, index).filter((step) => step.type !== "say").length;

  return {
    asked,
    done,
    percent: Math.round((done / Math.max(asked, 1)) * 100),
    label: asked > 0 ? `${Math.min(done + 1, asked)} of ${asked}` : "",
  };
}
