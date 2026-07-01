import { useMetrics } from '../../lib/queries';
import { formatBRL } from '../../lib/format';

function Card({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div
      className={`rounded-large border bg-card p-4 shadow-card transition-colors hover:bg-card-2 ${
        accent ? 'border-primary/40' : 'border-border'
      }`}
    >
      <p className={`text-2xl font-bold ${accent ? 'text-primary' : ''}`}>{value}</p>
      <p className="mt-0.5 text-sm text-text-muted">{label}</p>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  CREATED: 'Criado',
  WAITING_PROPOSALS: 'Aguardando propostas',
  IN_NEGOTIATION: 'Em negociação',
  PROVIDER_SELECTED: 'Profissional selecionado',
  WAITING_PAYMENT: 'Aguardando pagamento',
  PAID: 'Pago',
  EXECUTION_SCHEDULED: 'Execução agendada',
  FINISHED: 'Concluído',
  CANCELED: 'Cancelado',
};

export function DashboardPage() {
  const { data, isLoading, isError, error } = useMetrics();

  if (isLoading) return <p className="text-text-muted">Carregando métricas…</p>;
  if (isError) return <p className="text-danger">{(error as Error).message}</p>;
  const m = data!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-text-muted">Visão geral da operação.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="Clientes" value={m.clients} />
        <Card label="Prestadores" value={m.providersTotal} />
        <Card label="Aprovados" value={m.providersApproved} />
        <Card label="Pendentes" value={m.providersPending} />
        <Card label="Orçamentos" value={m.quotesTotal} />
        <Card label="Propostas" value={m.proposalsTotal} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card label="GMV" value={formatBRL(m.gmvCents)} />
        <Card label="Receita bruta" value={formatBRL(m.grossRevenueCents)} />
        <Card label="Lucro líquido" value={formatBRL(m.netProfitCents)} accent />
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Orçamentos por status</h2>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {Object.entries(m.quotesByStatus).map(([status, count]) => (
            <li key={status} className="flex items-center justify-between px-4 py-2">
              <span className="text-sm">{statusLabels[status] ?? status}</span>
              <span className="font-semibold">{count}</span>
            </li>
          ))}
          {Object.keys(m.quotesByStatus).length === 0 && (
            <li className="px-4 py-2 text-sm text-text-muted">Sem orçamentos.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
