import { AnalyzePostResult, AIStyleLikelihood } from './types';

const HYPE_PHRASES = [
  'game changer',
  'changes everything',
  'this changes everything',
  '10x',
  '100x',
  'replace everyone',
  'the future is here',
  'wake-up call',
  'unbelievable',
  'massive',
  'revolutionary',
  'you are not ready',
  'must-read',
  'blowing my mind',
  'crushing it',
  'no one is talking about',
  'completely reshaping',
  'everyone will',
];

const EVIDENCE_PHRASES = [
  'benchmark',
  'measured',
  'experiment',
  'experimented',
  'tested',
  'result',
  'results',
  'dataset',
  'latency',
  'accuracy',
  'a/b',
  'retention',
  'conversion',
  'reference',
  'paper',
  'docs',
  'link',
  'source',
];

const SPECIFICITY_PHRASES = [
  'gpt-4',
  'gpt-4.1',
  'claude',
  'gemini',
  'llama',
  'rag',
  'eval',
  'prompt caching',
  'vector db',
  'typescript',
  'next.js',
  'python',
  'api',
  'agent',
  'workflow',
  'latency budget',
  'token',
  'fine-tune',
  'benchmark',
  'hallucination',
];

const OPERATOR_PHRASES = [
  'we shipped',
  'i shipped',
  'we deployed',
  'in production',
  'production',
  'we learned',
  'i learned',
  'we broke',
  'it failed',
  'we tested',
  'i tested',
  'customer',
  'users',
  'on-call',
  'incident',
  'rollback',
  'tradeoff',
  'constraint',
  'debug',
];

const AI_STYLE_PHRASES = [
  'here are',
  'in today\'s world',
  'unlock',
  'leverage',
  'delve into',
  'transform your business',
  'the key takeaway',
  'whether you are',
  'not only',
  'it\'s not just',
  'from x to y',
];

const SOFTENERS = ['might', 'may', 'could', 'in some cases', 'for our use case', 'so far'];

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const TOKEN_BOUNDARY = String.raw`(?<![a-z0-9])`;
const TOKEN_BOUNDARY_END = String.raw`(?![a-z0-9])`;
const METRIC_NUMBER_PATTERN = /(?:(?<=\b(?:by|from|to|at|over|under|up|down|vs|versus|within|in)\s)|(?<=[=~<>$€£¥#:+-]))\d+(?:[.,]\d+)?%?|\d+(?:[.,]\d+)?(?:%|ms|s|sec|secs|seconds|m|min|mins|minutes|h|hr|hrs|hours|x|k|m|b)\b|\$\d+(?:[.,]\d+)?(?:k|m|b)?\b/gi;

export function countPhraseMatches(text: string, phrases: string[]): number {
  const normalized = text.toLowerCase();
  return phrases.reduce((total, phrase) => {
    const escaped = escapeRegExp(phrase.toLowerCase());
    const pattern = phrase.includes(' ') || /[^a-z0-9]/i.test(phrase)
      ? escaped
      : `${TOKEN_BOUNDARY}${escaped}${TOKEN_BOUNDARY_END}`;
    const matches = normalized.match(new RegExp(pattern, 'g'));
    return total + (matches?.length ?? 0);
  }, 0);
}

export function containsNumber(text: string): boolean {
  return Array.from(text.matchAll(METRIC_NUMBER_PATTERN)).some((match) => {
    const value = match[0];
    const start = match.index ?? 0;
    const nextChar = text[start + value.length] ?? '';
    const prevChar = text[start - 1] ?? '';

    if ((prevChar === '' || /\s/.test(prevChar)) && /^[#]?\d+$/.test(value) && nextChar === '.') {
      return false;
    }

    return true;
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detectBulletLikeStructure(text: string): boolean {
  const lines = text.split(/\n+/).map((line) => line.trim());
  const bulletLines = lines.filter((line) => /^[-*•\d]+[.)\-\s]/.test(line));
  return bulletLines.length >= 3;
}

function computeAIStyleLikelihood(aiStyleScore: number): AIStyleLikelihood {
  if (aiStyleScore >= 65) return 'high';
  if (aiStyleScore >= 35) return 'medium';
  return 'low';
}

function sentenceCount(text: string): number {
  return text.split(/[.!?]+/).filter((part) => part.trim().length > 0).length;
}

function buildVerdict(hype: number, substance: number, evidence: number, operatorSignals: number): string {
  if (hype - substance >= 20 && evidence < 45) {
    return 'Mostly hype, low signal.';
  }
  if (substance - hype >= 15 && operatorSignals >= 45) {
    return 'Grounded and relatively substantive.';
  }
  if (evidence >= 60 && substance >= 55) {
    return 'Useful substance with concrete support.';
  }
  return 'Mixed signals: some insight, some performance.';
}

function buildExplanation(params: {
  hypeMatches: number;
  evidenceMatches: number;
  specificityMatches: number;
  operatorMatches: number;
  aiStyleMatches: number;
  text: string;
  hype: number;
  substance: number;
  evidence: number;
  specificity: number;
  operatorSignals: number;
  aiStyleLikelihood: AIStyleLikelihood;
}): string[] {
  const bullets: string[] = [];
  const { text } = params;

  if (params.hypeMatches > 0 || params.hype >= 65) {
    bullets.push('The post uses broad or emphatic language that raises the hype score more than the grounded signal.');
  }
  if (params.evidenceMatches > 0 || containsNumber(text)) {
    bullets.push('There are some evidence signals such as numbers, experiments, benchmarks, or references to measurable outcomes.');
  } else {
    bullets.push('It does not provide much concrete support, such as benchmarks, links, metrics, or cited experiments.');
  }
  if (params.specificity >= 55) {
    bullets.push('Specific tools, models, or implementation details make the writing more concrete and easier to evaluate.');
  } else {
    bullets.push('The post stays fairly general, with limited detail about tools, constraints, versions, or exact use cases.');
  }
  if (params.operatorSignals >= 50) {
    bullets.push('It shows some operator signals by describing firsthand testing, production experience, tradeoffs, or lessons learned.');
  } else {
    bullets.push('Operator signals are limited; it reads more like commentary than a report from someone who shipped or tested the work.');
  }
  if (params.aiStyleLikelihood !== 'low') {
    bullets.push(`The structure includes some generic or templated phrasing, so the AI-style phrasing likelihood reads as ${params.aiStyleLikelihood}.`);
  }

  return bullets.slice(0, 5);
}

function generateStrongerRewrite(text: string): string {
  const cleaned = text
    .replace(/\b(10x|100x|game changer|changes everything|revolutionary|unbelievable|massive)\b/gi, '')
    .replace(/!/g, '.')
    .replace(/\s+/g, ' ')
    .trim();

  const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0]?.trim() || cleaned;
  const base = firstSentence || 'We tested an AI workflow in a real setting.';

  return [
    'We tested this AI workflow in a specific context and saw some useful upside, but the results were conditional.',
    `Core observation: ${base.replace(/[.\s]+$/, '')}.`,
    'What matters most is where it worked, where it failed, and what constraints shaped the outcome.',
    'A stronger version of this post would include the setup, the metric that moved, and the tradeoffs or caveats that still remain.',
  ].join(' ');
}

export function analyzePost(text: string): AnalyzePostResult {
  const normalized = text.trim();
  const lowered = normalized.toLowerCase();
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const hypeMatches = countPhraseMatches(lowered, HYPE_PHRASES);
  const evidenceMatches = countPhraseMatches(lowered, EVIDENCE_PHRASES);
  const specificityMatches = countPhraseMatches(lowered, SPECIFICITY_PHRASES);
  const operatorMatches = countPhraseMatches(lowered, OPERATOR_PHRASES);
  const aiStyleMatches = countPhraseMatches(lowered, AI_STYLE_PHRASES);
  const softenerMatches = countPhraseMatches(lowered, SOFTENERS);
  const numberSignal = containsNumber(normalized) ? 1 : 0;
  const linkSignal = /https?:\/\//i.test(normalized) ? 1 : 0;
  const bulletSignal = detectBulletLikeStructure(normalized) ? 1 : 0;
  const exclamationCount = (normalized.match(/!/g) ?? []).length;
  const allCapsWords = words.filter((word) => /^[A-Z]{3,}$/.test(word)).length;

  // Hype grows with sweeping phrases and strong emotional presentation.
  const hype = clamp(20 + hypeMatches * 15 + exclamationCount * 4 + allCapsWords * 3 - evidenceMatches * 3 - softenerMatches * 5);

  // Substance grows with operational detail, evidence, and enough length to contain nuance.
  const substance = clamp(20 + operatorMatches * 12 + specificityMatches * 7 + evidenceMatches * 6 + Math.min(wordCount, 220) / 8 - hypeMatches * 4);

  // Evidence rewards measurable support and explicit references.
  const evidence = clamp(10 + evidenceMatches * 14 + numberSignal * 18 + linkSignal * 10 + operatorMatches * 4 - hypeMatches * 3);

  // Specificity rewards named tools, versions, contexts, and concrete nouns.
  const specificity = clamp(15 + specificityMatches * 12 + numberSignal * 8 + Math.min(sentenceCount(normalized), 8) * 2 - bulletSignal * 4);

  // Operator signals focus on firsthand experience and tradeoffs.
  const operatorSignals = clamp(10 + operatorMatches * 16 + evidenceMatches * 4 + softenerMatches * 6 - hypeMatches * 5);

  const aiStyleScore = clamp(15 + aiStyleMatches * 18 + bulletSignal * 15 + (wordCount > 180 ? 10 : 0) + (softenerMatches === 0 && hypeMatches > 1 ? 10 : 0) - operatorMatches * 6);
  const aiStyleLikelihood = computeAIStyleLikelihood(aiStyleScore);

  const verdict = buildVerdict(hype, substance, evidence, operatorSignals);
  const explanation = buildExplanation({
    hypeMatches,
    evidenceMatches,
    specificityMatches,
    operatorMatches,
    aiStyleMatches,
    text: normalized,
    hype,
    substance,
    evidence,
    specificity,
    operatorSignals,
    aiStyleLikelihood,
  });

  return {
    hype,
    substance,
    evidence,
    specificity,
    operatorSignals,
    aiStyleLikelihood,
    verdict,
    explanation,
    strongerRewrite: generateStrongerRewrite(normalized),
  };
}
