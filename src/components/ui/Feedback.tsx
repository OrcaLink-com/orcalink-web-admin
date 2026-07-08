import type { ReactNode } from 'react';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
      {label ?? 'Carregando…'}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-large border border-dashed border-border p-10 text-center">
      {icon && <div className="mb-2 flex justify-center text-text-muted">{icon}</div>}
      <p className="font-medium">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-large border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{message}</div>
  );
}

export function InlineError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-sm text-danger">{message}</p>;
}
