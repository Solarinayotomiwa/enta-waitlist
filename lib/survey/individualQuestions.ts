import type { SurveyInstrument } from "@/lib/survey/surveyTypes";

const EXCLUSIVE = "I’d rather do it all myself";

export const individualInstrument: SurveyInstrument = {
  key: "individual",
  label: "Individual",
  accent: "#0D9488",
  accentWash: "rgba(13,148,136,.10)",
  chip: "Early access",
  steps: [
    {
      id: "q1_tool",
      theme: "behaviour",
      step: "How you handle money now",
      type: "multi",
      ack: (name) => (name ? `Let’s start easy, ${name}.` : "Let’s start easy."),
      q: "How do you mostly handle and hold your money right now?",
      hint: "Tap any that fit — most people pick more than one.",
      opts: [
        "A traditional bank",
        "A fintech app",
        "Crypto or stablecoins",
        "Cash or informal channels",
        "I’m new to this",
      ],
    },
    {
      id: "q1_purpose",
      theme: "behaviour",
      step: "How you handle money now",
      type: "multi",
      ack: "Good to know.",
      q: "And mostly for…?",
      opts: [
        "Saving or protecting it at home",
        "Getting paid",
        "Sending or receiving across borders",
        "A bit of everything",
      ],
    },
    {
      id: "q2_value",
      theme: "value",
      step: "What matters most",
      type: "single",
      ack: (name) =>
        name
          ? `Here’s the one I really want your answer on, ${name}.`
          : "Here’s the one I really want your answer on.",
      q: (name) =>
        `When it comes to your money right now${name ? `, ${name}` : ""} — what matters most to you?`,
      opts: [
        "Protecting it from losing value",
        "Moving and spending it freely",
        "Fully owning and controlling it myself",
      ],
    },
    {
      id: "q3_custody",
      theme: "comprehension / comfort",
      step: "How that sits with you",
      type: "multi",
      q: "With ENTA, only you can move your money — no one can freeze it or reverse it. How does that sit with you?",
      hint: "You can feel more than one of these at once.",
      opts: [
        "Reassuring — I like it",
        "Good, but I’d worry about losing access",
        "I’m not sure I fully get it",
        "It makes me nervous",
      ],
      more: {
        ack: (name) => (name ? `Thanks, ${name} — that’s useful.` : "Thanks — that’s useful."),
        q: "Anything you want to say about that in your own words?",
        hint: "Completely optional. Skip it and we’ll move on.",
      },
    },
    {
      id: "q4_intel",
      theme: "intelligence / enabler",
      step: "What would actually help",
      type: "multi",
      ack: (name) => (name ? `Nearly there, ${name}.` : "Nearly there."),
      dynamic: true,
      hint: "Pick as many as feel right.",
      opts: [
        "Watch the rate and tell me a good time to convert",
        "Alert me when a rate moves in my favour",
        "Tell me when a rate beats last time",
        "Quietly protect my money’s value",
        "Flag things before they go wrong",
        EXCLUSIVE,
      ],
      exclusive: EXCLUSIVE,
    },
    {
      id: "q5_trust",
      theme: "trust",
      step: "What would hold you back",
      type: "multi",
      q: "What would make you hesitate to keep your savings somewhere that isn’t a traditional bank?",
      opts: [
        "Getting my money back if something goes wrong",
        "Whether it’s regulated",
        "What if the company disappears",
        "Nothing really — I’m comfortable",
      ],
    },
    {
      id: "q6_cost",
      theme: "pain → pay-intent",
      step: "What it has cost you",
      type: "multi",
      ack: (name) => (name ? `Last real question, ${name}.` : "Last real question."),
      q: "Over the past year, which of these has actually cost you — in money, time, or worry?",
      opts: [
        "My savings losing value to the currency",
        "Getting paid or holding money at home",
        "A transfer abroad that was slow, costly or stuck",
        "Having to sell something to raise cash",
        "Not being able to reach my own money",
        "None, really",
      ],
      more: {
        ack: "This is the bit our team reads out loud to each other.",
        q: "If one of those stands out, what happened?",
        hint: "Optional — a couple of lines is plenty.",
      },
    },
    {
      id: "ready",
      theme: "qualify",
      step: "Early access",
      type: "single",
      ack: "Two quick ones and we’re done.",
      q: "If we opened early access to you before public launch, would you be ready to move real money through ENTA?",
      opts: ["Ready now", "Yes, but I’d start small", "Not yet — I’d watch first"],
    },
    {
      id: "timing",
      theme: "qualify",
      step: "Early access",
      type: "single",
      q: "And how soon are you looking to get started?",
      opts: ["This month", "This quarter", "Just exploring for now"],
    },
  ],
  intelligenceLead: () =>
    "Our intelligence tracks what you’d normally monitor manually — you always have the final say. Whether you’re managing currency mismatches, tracking rate shifts, or comparing payment costs, it keeps you ahead. Which of these features would help you most?",
  payIntent: {
    "My savings losing value to the currency": "preservation",
    "Getting paid or holding money at home": "local banking + stablecoin acceptance",
    "A transfer abroad that was slow, costly or stuck": "cross-border",
    "Having to sell something to raise cash": "lending",
    "Not being able to reach my own money": "self-custody",
  },
  close: (name) =>
    `That’s everything${name ? `, ${name}` : ""} — thank you. You’re on the list, and if you’re a fit for early access we’ll be in touch before public launch.`,
};
