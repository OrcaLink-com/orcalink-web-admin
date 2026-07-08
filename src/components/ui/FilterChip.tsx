/** Chip de filtro (pill) com contagem opcional. */
export function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border text-text-muted hover:bg-card-2 hover:text-foreground'
      }`}
    >
      {label}
      {count != null && <span className="ml-1 opacity-70">{count}</span>}
    </button>
  );
}
