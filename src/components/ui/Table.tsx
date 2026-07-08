import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-large border border-border ${className}`}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-card-2 text-left text-xs uppercase tracking-wide text-text-muted">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TR({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <tr className={`transition-colors hover:bg-card-2/40 ${className}`}>{children}</tr>;
}

export function TH({ children, className = '', ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-3 py-2.5 font-medium ${className}`} {...rest}>
      {children}
    </th>
  );
}

export function TD({ children, className = '', ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-3 py-2.5 align-middle ${className}`} {...rest}>
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children?: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-8 text-center text-sm text-text-muted">
        {children ?? 'Nada aqui.'}
      </td>
    </tr>
  );
}
