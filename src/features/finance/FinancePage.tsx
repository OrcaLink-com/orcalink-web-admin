import { LuDownload } from 'react-icons/lu';
import { useMetrics, usePayments } from '../../lib/queries';
import { formatBRL } from '../../lib/format';
import type { AdminPayment } from '../../lib/types';
import {
  PageHeader,
  StatCard,
  Button,
  Badge,
  paymentStatusTone,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  EmptyRow,
  Spinner,
  ErrorState,
} from '../../components/ui';

function toCsv(rows: AdminPayment[]): string {
  const header = ['Cliente', 'Profissional', 'Categoria', 'Modo', 'Prestador', 'Liquido', 'Cliente', 'Receita', 'Lucro', 'Status', 'Data'];
  const body = rows.map((p) =>
    [
      p.clientName,
      p.providerName ?? '',
      p.categoryName,
      p.mode,
      (p.providerAmountCents / 100).toFixed(2),
      (p.providerNetCents / 100).toFixed(2),
      (p.clientTotalCents / 100).toFixed(2),
      (p.grossRevenueCents / 100).toFixed(2),
      (p.netProfitCents / 100).toFixed(2),
      p.status,
      new Date(p.createdAt).toLocaleDateString('pt-BR'),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header.join(','), ...body].join('\n');
}

function downloadCsv(rows: AdminPayment[]) {
  const blob = new Blob(['﻿' + toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orcalink-pagamentos-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function FinancePage() {
  const metricsQ = useMetrics();
  const paymentsQ = usePayments();
  const m = metricsQ.data;
  const takeRate = m && m.gmvCents > 0 ? (m.grossRevenueCents / m.gmvCents) * 100 : 0;
  const ticket = m && m.paidCount > 0 ? Math.round(m.gmvCents / m.paidCount) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        subtitle="GMV, receita, repasses e conciliação de pagamentos."
        action={
          paymentsQ.data && paymentsQ.data.length > 0 ? (
            <Button variant="secondary" size="sm" startContent={<LuDownload size={15} />} onClick={() => downloadCsv(paymentsQ.data!)}>
              Exportar CSV
            </Button>
          ) : undefined
        }
      />

      {m && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="GMV" value={formatBRL(m.gmvCents)} sub="Pago + liberado" />
          <StatCard label="Receita bruta" value={formatBRL(m.grossRevenueCents)} />
          <StatCard label="Lucro líquido" value={formatBRL(m.netProfitCents)} tone="success" accent />
          <StatCard label="Take rate" value={`${takeRate.toFixed(1)}%`} />
          <StatCard label="Ticket médio" value={formatBRL(ticket)} sub={`${m.paidCount} pagos`} />
        </div>
      )}

      <div>
        <h2 className="mb-2 text-lg font-semibold">Pagamentos</h2>
        {paymentsQ.isLoading && <Spinner />}
        {paymentsQ.isError && <ErrorState message={(paymentsQ.error as Error).message} />}
        {paymentsQ.data && (
          <Table>
            <THead>
              <TR>
                <TH>Cliente</TH>
                <TH>Profissional</TH>
                <TH>Categoria</TH>
                <TH>Modo</TH>
                <TH className="text-right">Prestador</TH>
                <TH className="text-right">Líquido</TH>
                <TH className="text-right">Cliente</TH>
                <TH className="text-right">Receita</TH>
                <TH className="text-right">Lucro</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {paymentsQ.data.map((p) => (
                <TR key={p.id}>
                  <TD>{p.clientName}</TD>
                  <TD>{p.providerName ?? '—'}</TD>
                  <TD className="text-text-muted">{p.categoryName}</TD>
                  <TD className="text-text-muted">{p.mode}</TD>
                  <TD className="text-right">{formatBRL(p.providerAmountCents)}</TD>
                  <TD className="text-right">{formatBRL(p.providerNetCents)}</TD>
                  <TD className="text-right font-medium">{formatBRL(p.clientTotalCents)}</TD>
                  <TD className="text-right text-primary">{formatBRL(p.grossRevenueCents)}</TD>
                  <TD className="text-right font-semibold text-status-finished">{formatBRL(p.netProfitCents)}</TD>
                  <TD>
                    <Badge tone={paymentStatusTone(p.status)}>{p.status}</Badge>
                  </TD>
                </TR>
              ))}
              {paymentsQ.data.length === 0 && <EmptyRow colSpan={10}>Nenhum pagamento ainda.</EmptyRow>}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
