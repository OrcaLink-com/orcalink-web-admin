import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Torna o card um link. */
  to?: string;
  onClick?: () => void;
}

/** Container padrão: borda + fundo card + sombra. Vira link/botão quando `to`/`onClick`. */
export function Card({ children, className = '', to, onClick }: CardProps) {
  const base = `rounded-large border border-border bg-card shadow-card ${className}`;
  if (to) {
    return (
      <Link to={to} className={`block transition-colors hover:bg-card-2 ${base}`}>
        {children}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button onClick={onClick} className={`block w-full text-left transition-colors hover:bg-card-2 ${base}`}>
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}
