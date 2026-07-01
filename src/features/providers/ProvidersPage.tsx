import { useState } from 'react';
import {
  useApproveProvider,
  useCreateRecebedor,
  useProviders,
  useRejectProvider,
  useSetCommission,
} from '../../lib/queries';
import { api } from '../../lib/api';
import { bpsToPercent } from '../../lib/format';
import type { ProviderItem, ProviderStatus } from '../../lib/types';

const FILTERS: { label: string; value?: ProviderStatus }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Pendentes', value: 'PENDING_APPROVAL' },
  { label: 'Aprovados', value: 'APPROVED' },
  { label: 'Rejeitados', value: 'REJECTED' },
];

const statusColor: Record<ProviderStatus, string> = {
  INVITED: 'bg-status-canceled',
  PENDING_APPROVAL: 'bg-status-waiting',
  APPROVED: 'bg-status-finished',
  REJECTED: 'bg-danger',
  SUSPENDED: 'bg-status-canceled',
};

export function ProvidersPage() {
  const [filter, setFilter] = useState<ProviderStatus | undefined>(undefined);
  const { data, isLoading, isError, error } = useProviders(filter);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Prestadores</h1>

      <InviteCreator />

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.value)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              filter === f.value ? 'border-brand bg-brand text-white' : 'border-border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-text-muted">Carregando…</p>}
      {isError && <p className="text-danger">{(error as Error).message}</p>}

      {data && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-left text-text-muted">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">E-mail</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Comissão</th>
                <th className="px-3 py-2">Recebedor</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((p) => (
                <ProviderRow key={p.id} provider={p} />
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-text-muted">
                    Nenhum prestador.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProviderRow({ provider }: { provider: ProviderItem }) {
  const approve = useApproveProvider();
  const reject = useRejectProvider();
  const setCommission = useSetCommission();
  const recebedor = useCreateRecebedor();
  const [percent, setPercent] = useState(String(provider.commissionBps / 100));
  const [editing, setEditing] = useState(false);

  function save() {
    const bps = Math.round(parseFloat(percent.replace(',', '.')) * 100);
    if (Number.isFinite(bps) && bps >= 0 && bps <= 10000) {
      setCommission.mutate({ id: provider.id, commissionBps: bps });
      setEditing(false);
    }
  }

  return (
    <tr>
      <td className="px-3 py-2 font-medium">{provider.name}</td>
      <td className="px-3 py-2 text-text-muted">{provider.email ?? '—'}</td>
      <td className="px-3 py-2">
        <span className={`rounded px-2 py-0.5 text-xs text-white ${statusColor[provider.status]}`}>
          {provider.status}
        </span>
      </td>
      <td className="px-3 py-2">
        {editing ? (
          <span className="flex items-center gap-1">
            <input
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className="w-16 rounded border border-border px-1 py-0.5"
            />
            %
            <button onClick={save} className="ml-1 text-xs text-brand underline">
              salvar
            </button>
          </span>
        ) : (
          <button onClick={() => setEditing(true)} className="underline decoration-dotted">
            {bpsToPercent(provider.commissionBps)}%
          </button>
        )}
      </td>
      <td className="px-3 py-2">
        {provider.asaasWalletId ? (
          <span className="text-xs text-status-finished" title={provider.asaasWalletId}>
            ✓ ativo
          </span>
        ) : (
          <button
            onClick={() => recebedor.mutate(provider.id)}
            disabled={recebedor.isPending || provider.status !== 'APPROVED'}
            className="rounded border border-border px-2 py-1 text-xs disabled:opacity-40"
            title="Cria a subconta (recebedor) no gateway"
          >
            {recebedor.isPending ? '…' : 'Criar'}
          </button>
        )}
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-2">
          {provider.status !== 'APPROVED' && (
            <button
              onClick={() => approve.mutate(provider.id)}
              className="rounded bg-status-finished px-2 py-1 text-xs text-white"
            >
              Aprovar
            </button>
          )}
          {provider.status !== 'REJECTED' && (
            <button
              onClick={() => reject.mutate(provider.id)}
              className="rounded border border-border px-2 py-1 text-xs"
            >
              Rejeitar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function InviteCreator() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const inv = await api.createInvite({ email: email.trim() });
      setResult(inv.inviteUrl);
      setEmail('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-2 font-medium">Convidar prestador</h2>
      <form onSubmit={onCreate} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@profissional.com"
          className="flex-1 rounded-md border border-border bg-bg px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Gerar convite
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      {result && (
        <div className="mt-2 break-all rounded-md bg-bg p-2 text-xs">
          <span className="text-text-muted">Link do convite: </span>
          <code>{result}</code>
        </div>
      )}
    </div>
  );
}
