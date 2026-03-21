import { AlertIcon, BrainIcon, FlaskIcon, RadarIcon, WrenchIcon } from './icons';
import { AnalyzePostResult } from '../lib/types';
import { cn } from '../lib/utils';
import { ScoreCard } from './ScoreCard';

interface ResultPanelProps {
  result: AnalyzePostResult;
}

const likelihoodStyles = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function ResultPanel({ result }: ResultPanelProps) {
  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-panel sm:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Analysis</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{result.verdict}</h2>
        </div>
        <div className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium', likelihoodStyles[result.aiStyleLikelihood])}>
          <BrainIcon className="h-4 w-4" />
          AI-style phrasing likelihood: {result.aiStyleLikelihood}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ScoreCard label="Hype" score={result.hype} tone="warning" />
        <ScoreCard label="Substance" score={result.substance} tone="primary" />
        <ScoreCard label="Evidence" score={result.evidence} tone="success" />
        <ScoreCard label="Specificity" score={result.specificity} tone="primary" />
        <ScoreCard label="Operator signals" score={result.operatorSignals} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-slate-50 p-5">
          <div className="flex items-center gap-2">
            <RadarIcon className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Why it scored this way</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            {result.explanation.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-slate-50 p-5">
            <div className="flex items-center gap-2">
              <FlaskIcon className="h-4 w-4 text-accent" />
              <h3 className="text-lg font-semibold">Interpretation</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Higher hype does not mean false, and lower AI-style phrasing likelihood does not mean human authorship.
              These are writing signals designed to help you separate strong claims from grounded operating detail.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-slate-50 p-5">
            <div className="flex items-center gap-2">
              <WrenchIcon className="h-4 w-4 text-success" />
              <h3 className="text-lg font-semibold">Rewrite as a serious post</h3>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{result.strongerRewrite}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <AlertIcon className="mt-0.5 h-4 w-4 text-slate-500" />
          <p>HypeOmeter evaluates writing signals, not factual truth or personal credibility.</p>
        </div>
      </div>
    </section>
  );
}
