import { Link } from 'react-router-dom';
import {
  LuUserCheck,
  LuGavel,
  LuMessageSquare,
  LuTriangleAlert,
  LuArrowRight,
} from 'react-icons/lu';
import { useMetrics, useProviders, useMediations, useContacts, useQuotes } from '../../lib/queries';
import { formatBRL } from '../../lib/format';
import {
  PageHeader,
  StatCard,
  Card,
  Spinner,
  ErrorState,
  BarsTrend,
  FunnelBars,
} from '../../components/ui';

const WAITING_STATUSES = new Set(['CREATED', 'WAITING_PROPOSALS', 'IN_NEGOTIATION']);
const STUCK_HOURS = 48;

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

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function monthLabel(key: string): string {
  const m = Number(key.split('-')[1]);
  return MONTHS[m - 1] ?? key;
}
function pct(part: number, total: number): string {
  if (!total) return '—';
  return `${Math.round((part / total) * 100)}%`;
}

export function DashboardPage() {
  const { data: m, isLoading, isError, error } = useMetrics();
  const pending = useProviders('PENDING_APPROVAL');
  const mediations = useMediations();
  const contacts = useContacts({});
  const quotes = useQuotes();

  if (isLoading) return <Spinner label="Carregando métricas…" />;
  if (isError) return <ErrorState message={(error as Error).message} />;
  if (!m) return null;

  const openContacts = (contacts.data ?? []).filter((c) => c.status === 'NEW' || c.status === 'IN_PROGRESS').length;
  const stuck = (quotes.data ?? []).filter(
    (q) => WAITING_STATUSES.has(q.status) && q.waitingHours >= STUCK_HOURS,
  ).length;

  const takeRate = m.gmvCents > 0 ? (m.grossRevenueCents / m.gmvCents) * 100 : 0;
  const ticketCents = m.paidCount > 0 ? Math.round(m.gmvCents / m.paidCount) : 0;

  return (
    <div className="space-y-7">
      <PageHeader title="Dashboard" subtitle="Visão geral da operação e do marketplace." />

      {/* Filas de ação */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Precisa de você</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ActionCard to="/prestadores" icon={<LuUserCheck size={18} />} label="Prestadores pendentes" count={pending.data?.length ?? 0} />
          <ActionCard to="/mediacoes" icon={<LuGavel size={18} />} label="Mediações abertas" count={mediations.data?.length ?? 0} />
          <ActionCard to="/contatos" icon={<LuMessageSquare size={18} />} label="Contatos abertos" count={openContacts} />
          <ActionCard to="/operacoes" icon={<LuTriangleAlert size={18} />} label={`Travados (${STUCK_HOURS}h+)`} count={stuck} />
        </div>
      </section>

      {/* Financeiro */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Financeiro (realizado)</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="GMV" value={formatBRL(m.gmvCents)} sub="Pago + liberado" />
          <StatCard label="Receita bruta" value={formatBRL(m.grossRevenueCents)} />
          <StatCard label="Lucro líquido" value={formatBRL(m.netProfitCents)} tone="success" accent />
          <StatCard label="Take rate" value={`${takeRate.toFixed(1)}%`} sub="Receita / GMV" />
          <StatCard label="Ticket médio" value={formatBRL(ticketCents)} sub={`${m.paidCount} pagos`} />
        </div>
      </section>

      {/* Marketplace / liquidez */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Marketplace</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Clientes" value={m.clients} sub={`+${m.newClients30d} em 30d`} />
          <StatCard label="Prest. ativos" value={m.providersActive} sub="propuseram (30d)" tone="primary" />
          <StatCard label="Aprovados" value={m.providersApproved} sub={`${m.providersPending} pendentes`} />
          <StatCard
            label="1ª proposta"
            value={m.avgFirstProposalHours != null ? `${m.avgFirstProposalHours.toFixed(1)}h` : '—'}
            sub="tempo médio"
          />
          <StatCard label="Atendidos" value={pct(m.answeredQuotes, m.quotesTotal)} sub={`${m.answeredQuotes}/${m.quotesTotal}`} />
          <StatCard label="Orçamentos" value={m.quotesTotal} sub={`+${m.newQuotes30d} em 30d`} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Funil */}
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Funil de conversão</h3>
          <FunnelBars
            stages={[
              { label: 'Orçamentos abertos', value: m.quotesTotal },
              { label: 'Atendidos (com proposta)', value: m.answeredQuotes },
              { label: 'Pagos', value: m.paidCount },
              { label: 'Concluídos', value: m.finishedCount },
            ]}
          />
        </Card>

        {/* Tendência GMV */}
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold">GMV — últimos 6 meses</h3>
          {m.gmvMonthly.some((g) => g.gmvCents > 0) ? (
            <BarsTrend
              data={m.gmvMonthly.map((g) => ({ label: monthLabel(g.month), value: g.gmvCents }))}
              format={formatBRL}
            />
          ) : (
            <p className="py-10 text-center text-sm text-text-muted">Sem GMV no período ainda.</p>
          )}
        </Card>
      </div>

      {/* Orçamentos por status */}
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Orçamentos por status</h3>
        {Object.keys(m.quotesByStatus).length === 0 ? (
          <p className="text-sm text-text-muted">Sem orçamentos.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {Object.entries(m.quotesByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between border-b border-border/60 py-1.5 text-sm">
                <span className="text-text-muted">{statusLabels[status] ?? status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ActionCard({ to, icon, label, count }: { to: string; icon: React.ReactNode; label: string; count: number }) {
  const active = count > 0;
  return (
    <Link
      to={to}
      className={`group rounded-large border bg-card p-4 shadow-card transition-colors hover:bg-card-2 ${
        active ? 'border-warning/50' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={active ? 'text-warning' : 'text-text-muted'}>{icon}</span>
        <LuArrowRight size={15} className="text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className={`mt-2 text-2xl font-bold ${active ? 'text-warning' : ''}`}>{count}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </Link>
  );
}
