import { useMemo, useState } from 'react';
import { useQuotes, useQuote } from '../../lib/queries';
import { formatBRL } from '../../lib/format';
import type { AdminQuoteConversation } from '../../lib/types';

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Criado',
  WAITING_PROPOSALS: 'Aguardando propostas',
  IN_NEGOTIATION: 'Em negociação',
  PROVIDER_SELECTED: 'Profissional selecionado',
  WAITING_PAYMENT: 'Aguardando pagamento',
  PAID: 'Pago',
  ACCEPTED: 'Aceito',
  EM_ANDAMENTO: 'Em andamento',
  EXECUTION_SCHEDULED: 'Execução agendada',
  FINISHED: 'Concluído',
  CANCELED: 'Cancelado',
};

// Estados em que o cliente ainda está "esperando" algo acontecer.
const WAITING_STATUSES = new Set(['CREATED', 'WAITING_PROPOSALS', 'IN_NEGOTIATION']);
const STUCK_HOURS = 48;

function fmtWait(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  return h ? `${d}d ${h}h` : `${d}d`;
}

export function OperationsPage() {
  const { data, isLoading, isError, error } = useQuotes();
  const [filter, setFilter] = useState<'all' | 'waiting' | 'stuck'>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const quotes = useMemo(() => {
    const list = [...(data ?? [])].sort((a, b) => b.waitingHours - a.waitingHours);
    if (filter === 'waiting') return list.filter((q) => WAITING_STATUSES.has(q.status));
    if (filter === 'stuck')
      return list.filter((q) => WAITING_STATUSES.has(q.status) && q.waitingHours >= STUCK_HOURS);
    return list;
  }, [data, filter]);

  const stuckCount = (data ?? []).filter(
    (q) => WAITING_STATUSES.has(q.status) && q.waitingHours >= STUCK_HOURS,
  ).length;

  if (isLoading) return <p className="text-text-muted">Carregando orçamentos…</p>;
  if (isError) return <p className="text-danger">{(error as Error).message}</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operações</h1>
        <p className="text-sm text-text-muted">
          Acompanhe orçamentos, tempo de espera e as conversas de cada proposta.
        </p>
      </div>

      {stuckCount > 0 && (
        <div className="rounded-large border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          ⚠️ {stuckCount} cliente(s) esperando há mais de {STUCK_HOURS}h sem avançar.
        </div>
      )}

      <div className="flex gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Todos" count={data?.length ?? 0} />
        <FilterChip
          active={filter === 'waiting'}
          onClick={() => setFilter('waiting')}
          label="Esperando"
          count={(data ?? []).filter((q) => WAITING_STATUSES.has(q.status)).length}
        />
        <FilterChip active={filter === 'stuck'} onClick={() => setFilter('stuck')} label={`Travados (${STUCK_HOURS}h+)`} count={stuckCount} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* Lista */}
        <ul className="space-y-2.5">
          {quotes.map((q) => {
            const stuck = WAITING_STATUSES.has(q.status) && q.waitingHours >= STUCK_HOURS;
            return (
              <li key={q.id}>
                <button
                  onClick={() => setSelected(q.id)}
                  className={`w-full rounded-large border bg-card p-3.5 text-left shadow-card transition-colors hover:bg-card-2 ${
                    selected === q.id ? 'border-primary' : 'border-border'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-semibold">{q.categoryName}</span>
                    <span className={`text-xs font-medium ${stuck ? 'text-warning' : 'text-text-muted'}`}>
                      {fmtWait(q.waitingHours)} esperando
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-text-muted">{q.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                    <span className="rounded bg-primary/15 px-1.5 py-0.5 text-primary">
                      {STATUS_LABELS[q.status] ?? q.status}
                    </span>
                    <span>· {q.clientName}</span>
                    <span>· {q.proposalsCount} prop.</span>
                    <span>· {q.conversationsCount} conv.</span>
                  </div>
                </button>
              </li>
            );
          })}
          {quotes.length === 0 && <p className="py-6 text-center text-sm text-text-muted">Nada aqui.</p>}
        </ul>

        {/* Detalhe */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {selected ? (
            <QuoteDetail id={selected} onClose={() => setSelected(null)} />
          ) : (
            <div className="rounded-large border border-dashed border-border p-8 text-center text-sm text-text-muted">
              Selecione um orçamento para ver as conversas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-muted hover:bg-card-2'
      }`}
    >
      {label} <span className="opacity-70">{count}</span>
    </button>
  );
}

function QuoteDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: q, isLoading } = useQuote(id);

  if (isLoading || !q) {
    return <div className="rounded-large border border-border bg-card p-6 text-sm text-text-muted">Carregando…</div>;
  }

  return (
    <div className="space-y-4 rounded-large border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{q.categoryName}</h2>
          <p className="text-sm text-text-muted">
            {q.clientName}
            {q.clientEmail ? ` · ${q.clientEmail}` : ''}
            {q.clientPhone ? ` · ${q.clientPhone}` : ''}
          </p>
        </div>
        <button onClick={onClose} className="text-sm text-text-muted hover:text-foreground" aria-label="Fechar">
          ✕
        </button>
      </div>

      <div className="rounded-medium bg-bg p-3 text-sm">
        <p className="whitespace-pre-wrap">{q.description}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-muted">
          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-primary">{STATUS_LABELS[q.status] ?? q.status}</span>
          {q.budgetMaxCents != null && <span>Teto: {formatBRL(q.budgetMaxCents)}</span>}
          <span>Criado em {new Date(q.createdAt).toLocaleString('pt-BR')}</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Conversas ({q.conversations.length})</p>
        {q.conversations.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhuma conversa ainda.</p>
        ) : (
          <div className="space-y-3">
            {q.conversations.map((c) => (
              <ConversationBlock key={c.id} conversation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationBlock({ conversation: c }: { conversation: AdminQuoteConversation }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-medium border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-card-2"
      >
        <span className="font-medium">{c.providerName}</span>
        <span className="flex items-center gap-2 text-xs text-text-muted">
          {c.proposalAmountCents != null && (
            <span className="rounded bg-status-finished/20 px-1.5 py-0.5 text-status-finished">
              {formatBRL(c.proposalAmountCents)}
            </span>
          )}
          {c.messages.length} msg · {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-border px-3 py-3">
          {c.messages.map((m) => {
            const isProvider = m.senderRole === 'PROVIDER';
            const label = m.body ?? `[${m.type}]`;
            return (
              <div key={m.id} className={`text-sm ${isProvider ? 'text-right' : ''}`}>
                <span
                  className={`inline-block max-w-[85%] rounded-medium px-3 py-1.5 ${
                    m.senderName == null
                      ? 'bg-bg text-text-muted'
                      : isProvider
                        ? 'bg-primary/15 text-foreground'
                        : 'bg-card-2 text-foreground'
                  }`}
                >
                  {m.senderName && <span className="mr-1 text-[11px] font-medium text-text-muted">{m.senderName}:</span>}
                  {label}
                </span>
                <div className={`mt-0.5 text-[10px] text-text-muted ${isProvider ? 'text-right' : ''}`}>
                  {new Date(m.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>
            );
          })}
          {c.messages.length === 0 && <p className="text-sm text-text-muted">Sem mensagens.</p>}
        </div>
      )}
    </div>
  );
}
