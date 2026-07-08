import { useEffect, useMemo, useState } from 'react';
import { useUsers, useUpdateUserRole } from '../../lib/queries';
import { useAuth } from '../../auth/AuthContext';
import type { AdminUser, Role } from '../../lib/types';
import {
  PageHeader,
  Card,
  Input,
  Select,
  FilterChip,
  Badge,
  Spinner,
  ErrorState,
  EmptyState,
  InlineError,
} from '../../components/ui';

const ROLE_META: Record<Role, { label: string; className: string }> = {
  CLIENT: { label: 'Cliente', className: 'bg-card-2 text-text-muted' },
  PROVIDER: { label: 'Prestador', className: 'bg-sky-500/15 text-sky-300' },
  ADMIN: { label: 'Admin', className: 'bg-amber-500/15 text-amber-300' },
  SUPER_ADMIN: { label: 'Super Admin', className: 'bg-violet-500/15 text-violet-300' },
};

const FILTERS: { key: '' | Role; label: string }[] = [
  { key: '', label: 'Todos' },
  { key: 'CLIENT', label: 'Clientes' },
  { key: 'PROVIDER', label: 'Prestadores' },
  { key: 'ADMIN', label: 'Admins' },
];

export function UsersPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'SUPER_ADMIN';

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [role, setRole] = useState<'' | Role>('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading, isError, error } = useUsers({
    q: debouncedQ || undefined,
    role: role || undefined,
  });

  const counts = useMemo(() => {
    const list = data ?? [];
    return {
      total: list.length,
      admins: list.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
    };
  }, [data]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Usuários"
        subtitle={`Acessos e permissões.${!canManage ? ' Alterar papéis é restrito ao Super Admin.' : ''}`}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone…" className="flex-1" />
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <FilterChip key={f.key} active={role === f.key} onClick={() => setRole(f.key)} label={f.label} />
          ))}
        </div>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message={(error as Error).message} />}

      {data && (
        <>
          <p className="text-xs text-text-muted">
            {counts.total} usuário(s) · {counts.admins} com acesso admin
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            {data.map((u) => (
              <UserCard key={u.id} user={u} canManage={canManage} isSelf={u.id === user?.id} />
            ))}
          </div>
          {data.length === 0 && <EmptyState title="Nenhum usuário encontrado." />}
        </>
      )}
    </div>
  );
}

function UserCard({ user: u, canManage, isSelf }: { user: AdminUser; canManage: boolean; isSelf: boolean }) {
  const setRole = useUpdateUserRole();
  const meta = ROLE_META[u.role];
  const locked = u.role === 'SUPER_ADMIN' || isSelf;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
          {u.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{u.name}</p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}>{meta.label}</span>
            {!u.isActive && <Badge tone="danger">Inativo</Badge>}
          </div>
          <p className="truncate text-sm text-text-muted">{u.email ?? u.phone ?? '—'}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-text-muted">
            <span>Desde {new Date(u.createdAt).toLocaleDateString('pt-BR')}</span>
            {u.providerStatus && <span>· Prestador: {u.providerStatus}</span>}
            {u.email && <span>· {u.emailVerified ? 'e-mail ✓' : 'e-mail não verif.'}</span>}
          </div>
        </div>
      </div>

      {canManage && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
          <span className="text-xs text-text-muted">Papel</span>
          {locked ? (
            <span className="text-xs text-text-muted">{isSelf ? 'Você' : 'Protegido'}</span>
          ) : (
            <Select
              value={u.role}
              disabled={setRole.isPending}
              onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value as 'CLIENT' | 'PROVIDER' | 'ADMIN' })}
            >
              <option value="CLIENT">Cliente</option>
              <option value="PROVIDER">Prestador</option>
              <option value="ADMIN">Admin</option>
            </Select>
          )}
        </div>
      )}
      <InlineError message={setRole.isError ? (setRole.error as Error).message : null} />
    </Card>
  );
}
