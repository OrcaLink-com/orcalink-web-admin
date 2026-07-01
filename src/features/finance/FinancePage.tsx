import { useMetrics, usePayments } from '../../lib/queries';
import { formatBRL } from '../../lib/format';

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}

export function FinancePage() {
  const metricsQ = useMetrics();
  const paymentsQ = usePayments();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Financeiro</h1>

      {metricsQ.data && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card label="GMV (pago + liberado)" value={formatBRL(metricsQ.data.gmvCents)} />
          <Card label="Receita bruta (realizada)" value={formatBRL(metricsQ.data.grossRevenueCents)} />
          <Card label="Lucro líquido (realizado)" value={formatBRL(metricsQ.data.netProfitCents)} />
        </div>
      )}

      <div>
        <h2 className="mb-2 text-lg font-semibold">Pagamentos</h2>
        {paymentsQ.isLoading && <p className="text-text-muted">Carregando…</p>}
        {paymentsQ.isError && <p className="text-danger">{(paymentsQ.error as Error).message}</p>}
        {paymentsQ.data && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card text-left text-text-muted">
                <tr>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Profissional</th>
                  <th className="px-3 py-2">Categoria</th>
                  <th className="px-3 py-2">Modo</th>
                  <th className="px-3 py-2 text-right">Prestador</th>
                  <th className="px-3 py-2 text-right">Líquido</th>
                  <th className="px-3 py-2 text-right">Cliente</th>
                  <th className="px-3 py-2 text-right">Receita</th>
                  <th className="px-3 py-2 text-right">Lucro</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paymentsQ.data.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2">{p.clientName}</td>
                    <td className="px-3 py-2">{p.providerName ?? '—'}</td>
                    <td className="px-3 py-2 text-text-muted">{p.categoryName}</td>
                    <td className="px-3 py-2 text-text-muted">{p.mode}</td>
                    <td className="px-3 py-2 text-right">{formatBRL(p.providerAmountCents)}</td>
                    <td className="px-3 py-2 text-right">{formatBRL(p.providerNetCents)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatBRL(p.clientTotalCents)}</td>
                    <td className="px-3 py-2 text-right text-brand">{formatBRL(p.grossRevenueCents)}</td>
                    <td className="px-3 py-2 text-right font-semibold text-status-finished">
                      {formatBRL(p.netProfitCents)}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-status-canceled px-2 py-0.5 text-xs text-white">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {paymentsQ.data.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3 py-4 text-center text-text-muted">
                      Nenhum pagamento ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
