export interface DiagnosticOption {
  label: string;
  points: number;
}

export interface DiagnosticQuestion {
  id: string;
  prompt: string;
  options: DiagnosticOption[];
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "tool-count",
    prompt:
      "How many separate tools does your business rely on day-to-day (CRM, scheduling, invoicing, forms, email, spreadsheets, etc.)?",
    options: [
      { label: "1–3", points: 0 },
      { label: "4–6", points: 1 },
      { label: "7–10", points: 2 },
      { label: "11 or more", points: 3 },
    ],
  },
  {
    id: "lead-intake",
    prompt: "When a new lead comes in, how does it get into your systems?",
    options: [
      { label: "Automatically, everywhere it needs to be", points: 0 },
      { label: "Mostly automatic, with some manual entry", points: 1 },
      { label: "I manually copy it into a few places", points: 2 },
      { label: "I re-type it into several different tools", points: 3 },
    ],
  },
  {
    id: "manual-hours",
    prompt: "How much time per week do you (or your team) spend on manual data entry or copy-pasting between tools?",
    options: [
      { label: "Almost none", points: 0 },
      { label: "1–2 hours", points: 1 },
      { label: "3–5 hours", points: 2 },
      { label: "5+ hours", points: 3 },
    ],
  },
  {
    id: "connected-systems",
    prompt: "Are your scheduling, invoicing, and CRM connected to each other?",
    options: [
      { label: "Yes, fully connected", points: 0 },
      { label: "Partially", points: 1 },
      { label: "Barely", points: 2 },
      { label: "Not at all — totally separate", points: 3 },
    ],
  },
  {
    id: "dropped-balls",
    prompt: "How often does something fall through the cracks — a missed follow-up, a forgotten invoice, a lost lead?",
    options: [
      { label: "Rarely or never", points: 0 },
      { label: "Occasionally", points: 1 },
      { label: "Fairly often", points: 2 },
      { label: "All the time", points: 3 },
    ],
  },
  {
    id: "onboarding",
    prompt: "If you had to onboard a new hire on your current systems tomorrow, how would that go?",
    options: [
      { label: "Smooth — it's documented and simple", points: 0 },
      { label: "Doable, but it'd take a while", points: 1 },
      { label: "Painful — lots of tribal knowledge", points: 2 },
      { label: "I wouldn't know where to start explaining it", points: 3 },
    ],
  },
];

export interface DiagnosticTier {
  id: string;
  label: string;
  min: number;
  max: number;
  summary: string;
  recommendation: string;
}

export const DIAGNOSTIC_TIERS: DiagnosticTier[] = [
  {
    id: "streamlined",
    label: "Mostly Streamlined",
    min: 0,
    max: 5,
    summary:
      "You've already got the basics connected — most tools talk to each other and manual busywork is low.",
    recommendation:
      "A focused Systems Build engagement would tighten the remaining gaps without a full overhaul.",
  },
  {
    id: "patchworked",
    label: "Patchworked",
    min: 6,
    max: 11,
    summary:
      "Your systems mostly work, but manual glue — copy-pasting, re-entry, checking multiple places — is quietly costing you hours every week.",
    recommendation: "A Systems Build engagement connects the gaps so information flows without you chasing it.",
  },
  {
    id: "fragmented",
    label: "Fragmented",
    min: 12,
    max: 18,
    summary: "Your business is running on real tool sprawl — enough that things are actively falling through the cracks.",
    recommendation:
      "An Audit & Roadmap is the fastest way to see exactly what to fix first, before committing to a bigger build.",
  },
];

export const MAX_SCORE = DIAGNOSTIC_QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.points)),
  0
);

export function scoreDiagnostic(answerIndexes: number[]): { score: number; tier: DiagnosticTier } {
  const score = DIAGNOSTIC_QUESTIONS.reduce((sum, question, i) => {
    const option = question.options[answerIndexes[i]];
    return sum + (option ? option.points : 0);
  }, 0);

  const tier =
    DIAGNOSTIC_TIERS.find((t) => score >= t.min && score <= t.max) ?? DIAGNOSTIC_TIERS[DIAGNOSTIC_TIERS.length - 1];

  return { score, tier };
}
