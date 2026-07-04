import { useState } from 'react';
import { useMediations, useReleaseQuote } from '../../lib/queries';
import { formatBRL } from '../../lib/format';
import type { Mediation } from '../../lib/types';

const control =
  'rounded-medium border border-border bg-content1 px-3 py-2 text-sm outline-none focus:border-primary';

export function MediationsPage() {
  const { data, isLoading, isError, error } = useMediations();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mediação de conclusões</h1>
        <p className="text-sm text-text-muted">
          Serviços marcados como concluídos pelo prestador aguardando confirmação do cliente. Se o cliente não
          confirmar, o admin pode liberar o pagamento manualmente.
        </p>
      </div>

      {isLoading && <p className="text-text-muted">Carregando…</p>}
      {isError && <p className="text-danger">{(error as Error).message}</p>}

      {data && (
        <ul className="space-y-3">
          {data.map((m) => (
            <MediationCard key={m.quoteId} item={m} />
          ))}
          {data.length === 0 && (
            <li className="rounded-large border border-border bg-card p-8 text-center text-sm text-text-muted">
              Nenhuma conclusão pendente de mediação.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function MediationCard({ item }: { item: Mediation }) {
  const release = useReleaseQuote();
  const [confirming, setConfirming] = useState(false);

  const daysWaiting = Math.floor((Date.now() - new Date(item.providerDoneAt).getTime()) / 86400_000);

  return (
    <li className="rounded-large border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{item.categoryName}</p>
          <p className="truncate text-xs text-text-muted">{item.description}</p>
          <p className="mt-1 text-xs text-text-muted">
            Cliente: {item.clientName} · Profissional: {item.providerName}
          </p>
        </div>
        <span className="shrink-0 font-semibold text-primary">{formatBRL(item.providerNetCents)}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-300">{item.status}</span>
        <span className="text-text-muted">
          Marcado como concluído há {daysWaiting} dia(s) ({new Date(item.providerDoneAt).toLocaleDateString('pt-BR')})
        </span>
      </div>

      {release.isError && <p className="mt-2 text-xs text-danger">{(release.error as Error).message}</p>}

      <div className="mt-3 flex justify-end gap-2">
        {!confirming ? (
          <button onClick={() => setConfirming(true)} className={control}>
            Liberar pagamento…
          </button>
        ) : (
          <>
            <button onClick={() => setConfirming(false)} className={control} disabled={release.isPending}>
              Cancelar
            </button>
            <button
              onClick={() => release.mutate(item.quoteId)}
              disabled={release.isPending}
              className="rounded-medium bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {release.isPending ? 'Liberando…' : 'Confirmar liberação'}
            </button>
          </>
        )}
      </div>
    </li>
  );
}
