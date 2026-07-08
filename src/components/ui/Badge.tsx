import type { ReactNode } from 'react';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'primary';

const tones: Record<Tone, string> = {
  neutral: 'bg-card-2 text-text-muted',
  success: 'bg-status-finished/20 text-status-finished',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  primary: 'bg-primary/15 text-primary',
};

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Tom por status de prestador. */
export function providerStatusTone(status: string): Tone {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING_APPROVAL':
      return 'warning';
    case 'REJECTED':
    case 'SUSPENDED':
      return 'danger';
    default:
      return 'neutral';
  }
}

/** Tom por status de pagamento/orçamento. */
export function paymentStatusTone(status: string): Tone {
  switch (status) {
    case 'RELEASED':
    case 'PAID':
    case 'FINISHED':
      return 'success';
    case 'PENDING':
    case 'WAITING_PAYMENT':
      return 'warning';
    case 'REFUNDED':
    case 'CANCELED':
      return 'danger';
    default:
      return 'neutral';
  }
}
