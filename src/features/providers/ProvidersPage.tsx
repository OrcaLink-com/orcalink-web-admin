import { useState } from 'react';
import { LuTicket } from 'react-icons/lu';
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
import {
  PageHeader,
  Card,
  Button,
  Badge,
  providerStatusTone,
  FilterChip,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  EmptyRow,
  Input,
  Spinner,
  ErrorState,
  InlineError,
} from '../../components/ui';

const FILTERS: { label: string; value?: ProviderStatus }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Pendentes', value: 'PENDING_APPROVAL' },
  { label: 'Aprovados', value: 'APPROVED' },
  { label: 'Rejeitados', value: 'REJECTED' },
];

const STATUS_LABEL: Record<ProviderStatus, string> = {
  INVITED: 'Convidado',
  PENDING_APPROVAL: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  SUSPENDED: 'Suspenso',
};

export function ProvidersPage() {
  const [filter, setFilter] = useState<ProviderStatus | undefined>(undefined);
  const { data, isLoading, isError, error } = useProviders(filter);

  return (
    <div className="space-y-5">
      <PageHeader title="Prestadores" subtitle="Curadoria, comissão e recebedor no gateway." />

      <InviteCreator />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <FilterChip key={f.label} active={filter === f.value} onClick={() => setFilter(f.value)} label={f.label} count={filter === f.value ? data?.length : undefined} />
        ))}
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} />}

      {data && (
        <Table>
          <THead>
            <TR>
              <TH>Nome</TH>
              <TH>E-mail</TH>
              <TH>Status</TH>
              <TH>Comissão</TH>
              <TH>Recebedor</TH>
              <TH className="text-right">Ações</TH>
            </TR>
          </THead>
          <TBody>
            {data.map((p) => (
              <ProviderRow key={p.id} provider={p} />
            ))}
            {data.length === 0 && <EmptyRow colSpan={6}>Nenhum prestador.</EmptyRow>}
          </TBody>
        </Table>
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
    <TR>
      <TD className="font-medium">{provider.name}</TD>
      <TD className="text-text-muted">{provider.email ?? '—'}</TD>
      <TD>
        <Badge tone={providerStatusTone(provider.status)}>{STATUS_LABEL[provider.status]}</Badge>
      </TD>
      <TD>
        {editing ? (
          <span className="flex items-center gap-1">
            <Input value={percent} onChange={(e) => setPercent(e.target.value)} className="w-16 px-2 py-1" />%
            <button onClick={save} className="ml-1 text-xs text-primary underline">
              salvar
            </button>
          </span>
        ) : (
          <button onClick={() => setEditing(true)} className="underline decoration-dotted">
            {bpsToPercent(provider.commissionBps)}%
          </button>
        )}
      </TD>
      <TD>
        {provider.asaasWalletId ? (
          <Badge tone="success">ativo</Badge>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => recebedor.mutate(provider.id)}
            loading={recebedor.isPending}
            disabled={provider.status !== 'APPROVED'}
          >
            Criar
          </Button>
        )}
      </TD>
      <TD>
        <div className="flex justify-end gap-2">
          {provider.status !== 'APPROVED' && (
            <Button size="sm" onClick={() => approve.mutate(provider.id)}>
              Aprovar
            </Button>
          )}
          {provider.status !== 'REJECTED' && (
            <Button variant="secondary" size="sm" onClick={() => reject.mutate(provider.id)}>
              Rejeitar
            </Button>
          )}
        </div>
      </TD>
    </TR>
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
    <Card className="p-4">
      <h2 className="mb-2 flex items-center gap-2 font-semibold">
        <LuTicket size={16} className="text-primary" /> Convidar prestador
      </h2>
      <form onSubmit={onCreate} className="flex flex-wrap gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@profissional.com"
          className="min-w-56 flex-1"
        />
        <Button type="submit" loading={loading}>
          Gerar convite
        </Button>
      </form>
      <InlineError message={error} />
      {result && (
        <div className="mt-2 break-all rounded-medium bg-card-2 p-2 text-xs">
          <span className="text-text-muted">Link do convite: </span>
          <code>{result}</code>
        </div>
      )}
    </Card>
  );
}
