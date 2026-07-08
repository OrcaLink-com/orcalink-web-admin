/** Gráficos leves em CSS/SVG puro — sem dependências (mantém o admin leve). */

/** Barras verticais de tendência (ex.: GMV por mês). */
export function BarsTrend({
  data,
  format,
}: {
  data: { label: string; value: number }[];
  format?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div className="flex h-40 items-end gap-2">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={i} className="group relative flex flex-1 items-end">
              <div
                className="w-full rounded-t bg-primary/70 transition-colors group-hover:bg-primary"
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-card-2 px-1.5 py-0.5 text-[10px] text-foreground opacity-0 shadow-card transition-opacity group-hover:opacity-100">
                {format ? format(d.value) : d.value}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-text-muted">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Funil horizontal com % de conversão entre etapas. */
export function FunnelBars({ stages }: { stages: { label: string; value: number }[] }) {
  const max = Math.max(1, ...stages.map((s) => s.value));
  return (
    <div className="space-y-2.5">
      {stages.map((s, i) => {
        const pct = (s.value / max) * 100;
        const prev = i > 0 ? stages[i - 1].value : null;
        const conv = prev && prev > 0 ? Math.round((s.value / prev) * 100) : null;
        return (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-text-muted">{s.label}</span>
              <span className="font-medium">
                {s.value}
                {conv != null && <span className="ml-1 font-normal text-text-muted">({conv}%)</span>}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-card-2">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(pct, 1)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
