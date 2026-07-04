import { useState } from 'react';
import { useContacts, useUpdateContact } from '../../lib/queries';
import type { ContactCategory, ContactMessage, ContactStatus } from '../../lib/types';

const STATUS_LABEL: Record<ContactStatus, string> = {
  NEW: 'Novo',
  IN_PROGRESS: 'Em andamento',
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

export function ContactsPage() {
  const [status, setStatus] = useState<ContactStatus | ''>('');
  const [category, setCategory] = useState<ContactCategory | ''>('');
  const [q, setQ] = useState('');
  const { data, isLoading, isError, error } = useContacts({
    status: status || undefined,
    category: category || undefined,
    q: q || undefined,
  });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Contatos</h1>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, e-mail, assunto…"
          className="min-w-48 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as ContactStatus | '')} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">Todos os status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value as ContactCategory | '')} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-text-muted">Carregando…</p>}
      {isError && <p className="text-danger">{(error as Error).message}</p>}

      {data && (
        <ul className="space-y-3">
          {data.map((c) => (
            <ContactRow key={c.id} contact={c} />
          ))}
          {data.length === 0 && <li className="text-text-muted">Nenhuma solicitação encontrada.</li>}
        </ul>
      )}
    </div>
  );
}

function ContactRow({ contact }: { contact: ContactMessage }) {
  const update = useUpdateContact();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(contact.adminNotes ?? '');

  return (
    <li className="rounded-lg border border-border">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-3 py-3 text-left">
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[contact.status]}`}>
          {STATUS_LABEL[contact.status]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{contact.subject}</p>
          <p className="truncate text-xs text-text-muted">
            {contact.name} · {contact.email} · {CATEGORY_LABEL[contact.category]}
            {contact.userId ? ' · conta' : ' · visitante'}
          </p>
        </div>
        <span className="shrink-0 text-xs text-text-muted">
          {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border p-3">
          <p className="whitespace-pre-wrap text-sm">{contact.message}</p>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-text-muted">Status:</label>
            <select
              value={contact.status}
              onChange={(e) => update.mutate({ id: contact.id, status: e.target.value as ContactStatus })}
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <a
              href={`mailto:${contact.email}?subject=${encodeURIComponent('Re: ' + contact.subject)}`}
              className="rounded-lg border border-border px-2 py-1 text-sm hover:bg-content2"
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={() => update.mutate({ id: contact.id, adminNotes: notes })}
              disabled={update.isPending}
              className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Salvar observações
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
