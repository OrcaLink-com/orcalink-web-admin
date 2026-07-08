import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={`w-full rounded-medium border border-border bg-card-2 px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none ${className}`}
    />
  );
}

export function Select({
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      {...rest}
      className={`rounded-medium border border-border bg-card-2 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none ${className}`}
    >
      {children}
    </select>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      {children}
    </label>
  );
}
