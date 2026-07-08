import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:opacity-90',
  secondary: 'border border-border bg-card-2 text-foreground hover:bg-card',
  ghost: 'text-text-muted hover:bg-card-2 hover:text-foreground',
  danger: 'bg-danger text-white hover:opacity-90',
};
const sizes: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  startContent?: ReactNode;
  children: ReactNode;
  className?: string;
}

function cls(variant: Variant, size: Size, full?: boolean, className = ''): string {
  return `inline-flex items-center justify-center gap-1.5 rounded-medium font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`;
}

export function Button({
  variant = 'primary',
  size = 'md',
  full,
  loading,
  startContent,
  children,
  className = '',
  disabled,
  ...rest
}: BaseProps & { loading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} disabled={disabled || loading} className={cls(variant, size, full, className)}>
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        startContent
      )}
      {children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  full,
  startContent,
  children,
  className = '',
}: BaseProps & { to: string }) {
  return (
    <Link to={to} className={cls(variant, size, full, className)}>
      {startContent}
      {children}
    </Link>
  );
}
