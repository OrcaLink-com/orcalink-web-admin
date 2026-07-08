import { useState } from 'react';
import { LuGavel } from 'react-icons/lu';
import { useMediations, useReleaseQuote } from '../../lib/queries';
import { formatBRL } from '../../lib/format';
import type { Mediation } from '../../lib/types';
import { PageHeader, Card, Button, Badge, Spinner, ErrorState, EmptyState, InlineError } from '../../components/ui';

export function MediationsPage() {
  const { data, isLoading, isError, error } = useMediations();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mediação de conclusões"
        subtitle="Serviços concluídos pelo prestador aguardando o cliente. Sem confirmação, o admin libera o pagamento."
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} />}

      {data && (
        <div className="space-y-3">
          {data.map((m) => (
            <MediationCard key={m.quoteId} item={m} />
          ))}
          {data.length === 0 && <EmptyState icon={<LuGavel size={26} />} title="Nenhuma conclusão pendente de mediação." />}
        </div>
      )}
    </div>
  );
}

function MediationCard({ item }: { item: Mediation }) {
  const release = useReleaseQuote();
  const [confirming, setConfirming] = useState(false);
  const daysWaiting = Math.floor((Date.now() - new Date(item.providerDoneAt).getTime()) / 86400_000);

  return (
    <Card className="p-4">
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
        <Badge tone="warning">{item.status}</Badge>
        <span className="text-text-muted">
          Concluído há {daysWaiting} dia(s) ({new Date(item.providerDoneAt).toLocaleDateString('pt-BR')})
        </span>
      </div>

      <InlineError message={release.isError ? (release.error as Error).message : null} />

      <div className="mt-3 flex justify-end gap-2">
        {!confirming ? (
          <Button variant="secondary" size="sm" onClick={() => setConfirming(true)}>
            Liberar pagamento…
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={release.isPending}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => release.mutate(item.quoteId)} loading={release.isPending}>
              Confirmar liberação
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
