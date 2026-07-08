import type { ReactNode } from 'react';

type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger';

const valueTone: Record<Tone, string> = {
  default: '',
  primary: 'text-primary',
  success: 'text-status-finished',
  warning: 'text-warning',
  danger: 'text-danger',
};

/** Cartão de KPI: rótulo + valor grande + subtexto/ícone opcionais. */
export function StatCard({
  label,
  value,
  icon,
  sub,
  tone = 'default',
  accent,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-large border ${accent ? 'border-primary/40' : 'border-border'} bg-card p-4 shadow-card`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <p className={`mt-1.5 text-2xl font-bold ${valueTone[tone]}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-text-muted">{sub}</p>}
    </div>
  );
}
