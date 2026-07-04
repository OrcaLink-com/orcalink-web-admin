import { useMemo, useState } from 'react';
import { useContacts, useUpdateContact } from '../../lib/queries';
import type { ContactCategory, ContactMessage, ContactStatus } from '../../lib/types';

const STATUS_LABEL: Record<ContactStatus, string> = {
  NEW: 'Novo',
  IN_PROGRESS: 'Em atendimento',
  ANSWERED: 'Respondido',
  ARCHIVED: 'Arquivado',
};
const STATUS_CLASS: Record<ContactStatus, string> = {
  NEW: 'bg-sky-500/15 text-sky-300',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-300',
  ANSWERED: 'bg-emerald-500/15 text-emerald-300',
  ARCHIVED: 'bg-content2 text-text-muted',
};
const CATEGORY_LABEL: Record<ContactCategory, string> = {
  DUVIDA: 'Dúvida',
  SUPORTE: 'Suporte',
  SUGESTAO: 'Sugestão',
  PROBLEMA: 'Problema',
  FINANCEIRO: 'Financeiro',
  COMERCIAL: 'Comercial',
  OUTRO: 'Outro',
};
const STATUSES: ContactStatus[] = ['NEW', 'IN_PROGRESS', 'ANSWERED', 'ARCHIVED'];
const CATEGORIES: ContactCategory[] = ['DUVIDA', 'SUPORTE', 'SUGESTAO', 'PROBLEMA', 'FINANCEIRO', 'COMERCIAL', 'OUTRO'];

type Period = 'all' | 'today' | '7d' | '30d';
const PERIOD_DAYS: Record<Exclude<Period, 'all' | 'today'>, number> = { '7d': 7, '30d': 30 };

const control =
  'rounded-medium border border-border bg-content1 px-3 py-2 text-sm outline-none focus:border-primary';

export function ContactsPage() {
  const [status, setStatus] = useState<ContactStatus | ''>('');
  const [category, setCategory] = useState<ContactCategory | ''>('');
  const [period, setPeriod] = useState<Period>('all');
  const [q, setQ] = useState('');

  const { data, isLoading, isError, error } = useContacts({
    status: status || undefined,
    category: category || undefined,
    q: q || undefined,
  });

  const list = useMemo(() => {
    const all = data ?? [];
    if (period === 'all') return all;
    return all.filter((c) => {
      const created = new Date(c.createdAt).getTime();
      if (period === 'today') {
        const d = new Date();
        return created >= new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      }
      return created >= Date.now() - PERIOD_DAYS[period] * 86400_000;
    });
  }, [data, period]);

  const counts = useMemo(() => {
    const all = data ?? [];
    return {
      total: all.length,
      NEW: all.filter((c) => c.status === 'NEW').length,
      IN_PROGRESS: all.filter((c) => c.status === 'IN_PROGRESS').length,
    };
  }, [data]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Central de Contatos</h1>
        <p className="text-sm text-text-muted">
          Atendimento da OrcaLink — {counts.total} solicitação(ões)
          {counts.NEW > 0 && <span className="text-sky-300"> · {counts.NEW} nova(s)</span>}
          {counts.IN_PROGRESS > 0 && <span className="text-amber-300"> · {counts.IN_PROGRESS} em atendimento</span>}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, e-mail ou assunto…"
          className={`${control} min-w-48 flex-1`}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as ContactStatus | '')} className={control}>
          <option value="">Todos os status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value as ContactCategory | '')} className={control}>
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>
        <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className={control}>
          <option value="all">Qualquer data</option>
          <option value="today">Hoje</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
        </select>
      </div>

      {isLoading && <p className="text-text-muted">Carregando…</p>}
      {isError && <p className="text-danger">{(error as Error).message}</p>}

      {data && (
        <ul className="space-y-3">
          {list.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
          {list.length === 0 && (
            <li className="rounded-large border border-border bg-card p-8 text-center text-sm text-text-muted">
              Nenhuma solicitação encontrada.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function ContactCard({ contact }: { contact: ContactMessage }) {
  const update = useUpdateContact();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(contact.adminNotes ?? '');

  return (
    <li className="overflow-hidden rounded-large border border-border bg-card shadow-card">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-card-2">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
          {contact.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{contact.subject}</p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[contact.status]}`}>
              {STATUS_LABEL[contact.status]}
            </span>
          </div>
          <p className="truncate text-xs text-text-muted">
            {contact.name} · {contact.email} · {CATEGORY_LABEL[contact.category]}
            {contact.userId ? ' · cliente autenticado' : ' · visitante'}
          </p>
        </div>
        <span className="shrink-0 text-xs text-text-muted">
          {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border p-4">
          <p className="whitespace-pre-wrap rounded-medium bg-content1 p-3 text-sm">{contact.message}</p>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-text-muted">Status:</label>
            <select
              value={contact.status}
              onChange={(e) => update.mutate({ id: contact.id, status: e.target.value as ContactStatus })}
              className={`${control} py-1.5`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <a
              href={`mailto:${contact.email}?subject=${encodeURIComponent('Re: ' + contact.subject)}`}
              className="rounded-medium border border-border px-3 py-1.5 text-sm hover:bg-card-2"
            >
              Responder por e-mail
            </a>
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-muted">Observações internas (só admin)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anote o andamento do atendimento…"
              className={`${control} w-full`}
            />
            <button
              onClick={() => update.mutate({ id: contact.id, adminNotes: notes })}
              disabled={update.isPending}
              className="mt-2 rounded-medium bg-primary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Salvar observações
            </button>
            {update.isError && <p className="mt-1 text-xs text-danger">{(update.error as Error).message}</p>}
          </div>
        </div>
      )}
    </li>
  );
}
