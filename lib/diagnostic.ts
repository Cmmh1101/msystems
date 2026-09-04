import type { Locale } from "./i18n/dictionary";

export interface DiagnosticOption {
  label: Record<Locale, string>;
  points: number;
}

export interface DiagnosticQuestion {
  id: string;
  prompt: Record<Locale, string>;
  options: DiagnosticOption[];
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "tool-count",
    prompt: {
      en: "How many separate tools does your business rely on day-to-day (CRM, scheduling, invoicing, forms, email, spreadsheets, etc.)?",
      es: "¿En cuántas herramientas separadas depende tu negocio día a día (CRM, agenda, facturación, formularios, correo, hojas de cálculo, etc.)?",
    },
    options: [
      { label: { en: "1–3", es: "1–3" }, points: 0 },
      { label: { en: "4–6", es: "4–6" }, points: 1 },
      { label: { en: "7–10", es: "7–10" }, points: 2 },
      { label: { en: "11 or more", es: "11 o más" }, points: 3 },
    ],
  },
  {
    id: "lead-intake",
    prompt: {
      en: "When a new lead comes in, how does it get into your systems?",
      es: "Cuando llega un nuevo lead, ¿cómo entra a tus sistemas?",
    },
    options: [
      { label: { en: "Automatically, everywhere it needs to be", es: "Automáticamente, en todos lados donde debe estar" }, points: 0 },
      { label: { en: "Mostly automatic, with some manual entry", es: "Mayormente automático, con algo de entrada manual" }, points: 1 },
      { label: { en: "I manually copy it into a few places", es: "Lo copio manualmente en algunos lugares" }, points: 2 },
      { label: { en: "I re-type it into several different tools", es: "Lo vuelvo a escribir en varias herramientas distintas" }, points: 3 },
    ],
  },
  {
    id: "manual-hours",
    prompt: {
      en: "How much time per week do you (or your team) spend on manual data entry or copy-pasting between tools?",
      es: "¿Cuánto tiempo por semana pasas tú (o tu equipo) haciendo entrada manual de datos o copiando y pegando entre herramientas?",
    },
    options: [
      { label: { en: "Almost none", es: "Casi nada" }, points: 0 },
      { label: { en: "1–2 hours", es: "1–2 horas" }, points: 1 },
      { label: { en: "3–5 hours", es: "3–5 horas" }, points: 2 },
      { label: { en: "5+ hours", es: "5+ horas" }, points: 3 },
    ],
  },
  {
    id: "connected-systems",
    prompt: {
      en: "Are your scheduling, invoicing, and CRM connected to each other?",
      es: "¿Tu agenda, facturación y CRM están conectados entre sí?",
    },
    options: [
      { label: { en: "Yes, fully connected", es: "Sí, totalmente conectados" }, points: 0 },
      { label: { en: "Partially", es: "Parcialmente" }, points: 1 },
      { label: { en: "Barely", es: "Apenas" }, points: 2 },
      { label: { en: "Not at all — totally separate", es: "Para nada — totalmente separados" }, points: 3 },
    ],
  },
  {
    id: "dropped-balls",
    prompt: {
      en: "How often does something fall through the cracks — a missed follow-up, a forgotten invoice, a lost lead?",
      es: "¿Con qué frecuencia se te escapa algo — un seguimiento perdido, una factura olvidada, un lead perdido?",
    },
    options: [
      { label: { en: "Rarely or never", es: "Rara vez o nunca" }, points: 0 },
      { label: { en: "Occasionally", es: "Ocasionalmente" }, points: 1 },
      { label: { en: "Fairly often", es: "Bastante seguido" }, points: 2 },
      { label: { en: "All the time", es: "Todo el tiempo" }, points: 3 },
    ],
  },
  {
    id: "onboarding",
    prompt: {
      en: "If you had to onboard a new hire on your current systems tomorrow, how would that go?",
      es: "Si tuvieras que capacitar a alguien nuevo en tus sistemas actuales mañana, ¿cómo te iría?",
    },
    options: [
      { label: { en: "Smooth — it's documented and simple", es: "Sin problemas — está documentado y es simple" }, points: 0 },
      { label: { en: "Doable, but it'd take a while", es: "Se puede, pero tomaría tiempo" }, points: 1 },
      { label: { en: "Painful — lots of tribal knowledge", es: "Doloroso — mucho conocimiento no documentado" }, points: 2 },
      { label: { en: "I wouldn't know where to start explaining it", es: "No sabría ni por dónde empezar a explicarlo" }, points: 3 },
    ],
  },
];

export interface DiagnosticTier {
  id: string;
  label: Record<Locale, string>;
  min: number;
  max: number;
  summary: Record<Locale, string>;
  recommendation: Record<Locale, string>;
}

export const DIAGNOSTIC_TIERS: DiagnosticTier[] = [
  {
    id: "streamlined",
    label: { en: "Mostly Streamlined", es: "Mayormente Optimizado" },
    min: 0,
    max: 5,
    summary: {
      en: "You've already got the basics connected — most tools talk to each other and manual busywork is low.",
      es: "Ya tienes lo básico conectado — la mayoría de tus herramientas se comunican entre sí y el trabajo manual es bajo.",
    },
    recommendation: {
      en: "A focused Systems Build engagement would tighten the remaining gaps without a full overhaul.",
      es: "Un proyecto enfocado de Construcción de Sistemas cerraría los espacios restantes sin necesidad de una renovación completa.",
    },
  },
  {
    id: "patchworked",
    label: { en: "Patchworked", es: "Parcheado" },
    min: 6,
    max: 11,
    summary: {
      en: "Your systems mostly work, but manual glue — copy-pasting, re-entry, checking multiple places — is quietly costing you hours every week.",
      es: "Tus sistemas funcionan en su mayoría, pero el pegamento manual — copiar y pegar, volver a ingresar datos, revisar varios lugares — te está costando horas cada semana sin que lo notes.",
    },
    recommendation: {
      en: "A Systems Build engagement connects the gaps so information flows without you chasing it.",
      es: "Un proyecto de Construcción de Sistemas conecta los espacios para que la información fluya sin que tengas que perseguirla.",
    },
  },
  {
    id: "fragmented",
    label: { en: "Fragmented", es: "Fragmentado" },
    min: 12,
    max: 18,
    summary: {
      en: "Your business is running on real tool sprawl — enough that things are actively falling through the cracks.",
      es: "Tu negocio está operando con una dispersión real de herramientas — lo suficiente como para que se te estén escapando cosas activamente.",
    },
    recommendation: {
      en: "An Audit & Roadmap is the fastest way to see exactly what to fix first, before committing to a bigger build.",
      es: "Una Auditoría y Hoja de Ruta es la forma más rápida de ver exactamente qué arreglar primero, antes de comprometerte con un proyecto más grande.",
    },
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
