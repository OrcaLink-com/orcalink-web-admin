import { useMemo, useState } from 'react';
import { useContacts, useUpdateContact } from '../../lib/queries';
import type { ContactCategory, ContactMessage, ContactStatus } from '../../lib/types';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Spinner,
  ErrorState,
  EmptyState,
  InlineError,
} from '../../components/ui';

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
  ARCHIVED: 'bg-card-2 text-text-muted',
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
      <PageHeader
        title="Central de Contatos"
        subtitle={`${counts.total} solicitação(ões)${counts.NEW ? ` · ${counts.NEW} nova(s)` : ''}${
          counts.IN_PROGRESS ? ` · ${counts.IN_PROGRESS} em atendimento` : ''
        }`}
      />

      <div className="flex flex-wrap gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, e-mail ou assunto…" className="min-w-48 flex-1" />
        <Select value={status} onChange={(e) => setStatus(e.target.value as ContactStatus | '')}>
          <option value="">Todos os status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <Select value={category} onChange={(e) => setCategory(e.target.value as ContactCategory | '')}>
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </Select>
        <Select value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
          <option value="all">Qualquer data</option>
          <option value="today">Hoje</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
        </Select>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} />}

      {data && (
        <div className="space-y-3">
          {list.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
          {list.length === 0 && <EmptyState title="Nenhuma solicitação encontrada." />}
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact }: { contact: ContactMessage }) {
  const update = useUpdateContact();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(contact.adminNotes ?? '');

  return (
    <Card className="overflow-hidden p-0">
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
        <span className="shrink-0 text-xs text-text-muted">{new Date(contact.createdAt).toLocaleDateString('pt-BR')}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border p-4">
          <p className="whitespace-pre-wrap rounded-medium bg-card-2 p-3 text-sm">{contact.message}</p>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-text-muted">Status:</label>
            <Select
              value={contact.status}
              onChange={(e) => update.mutate({ id: contact.id, status: e.target.value as ContactStatus })}
              className="py-1.5"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
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
              className="w-full rounded-medium border border-border bg-card-2 px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
            <Button size="sm" className="mt-2" onClick={() => update.mutate({ id: contact.id, adminNotes: notes })} loading={update.isPending}>
              Salvar observações
            </Button>
            <InlineError message={update.isError ? (update.error as Error).message : null} />
          </div>
        </div>
      )}
    </Card>
  );
}
