import { cn } from '../lib/utils';

interface ScoreCardProps {
  label: string;
  score: number;
  tone?: 'neutral' | 'primary' | 'success' | 'warning';
}

const toneStyles = {
  neutral: 'from-slate-200 to-slate-300 text-slate-800',
  primary: 'from-blue-500 to-indigo-500 text-white',
  success: 'from-emerald-500 to-teal-500 text-white',
  warning: 'from-amber-400 to-orange-500 text-white',
};

export function ScoreCard({ label, score, tone = 'neutral' }: ScoreCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{score}</p>
        </div>
        <div className="relative h-16 w-16 shrink-0">
          <div className="absolute inset-0 rounded-full bg-slate-100" />
          <div
            className={cn(
              'absolute inset-1 flex items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold shadow-sm',
              toneStyles[tone],
            )}
          >
            {score}
          </div>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={cn('h-full rounded-full bg-gradient-to-r', toneStyles[tone])} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
