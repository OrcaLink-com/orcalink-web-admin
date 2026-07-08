import { Link, NavLink, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { brand } from '@orcalink/design-tokens/brand.config';
import {
  LuLayoutDashboard,
  LuActivity,
  LuUsers,
  LuUserCog,
  LuTags,
  LuWallet,
  LuStar,
  LuMessageSquare,
  LuGavel,
  LuLogOut,
} from 'react-icons/lu';
import { useAuth } from '../auth/AuthContext';
import { useProviders, useMediations, useContacts } from '../lib/queries';

const NAV = [
  { to: '/', label: 'Dashboard', icon: <LuLayoutDashboard size={19} />, end: true },
  { to: '/operacoes', label: 'Operações', icon: <LuActivity size={19} /> },
  { to: '/usuarios', label: 'Usuários', icon: <LuUserCog size={19} /> },
  { to: '/prestadores', label: 'Prestadores', icon: <LuUsers size={19} />, badgeKey: 'providers' as const },
  { to: '/categorias', label: 'Categorias', icon: <LuTags size={19} /> },
  { to: '/financeiro', label: 'Financeiro', icon: <LuWallet size={19} /> },
  { to: '/avaliacoes', label: 'Avaliações', icon: <LuStar size={19} /> },
  { to: '/mediacoes', label: 'Mediações', icon: <LuGavel size={19} />, badgeKey: 'mediations' as const },
  { to: '/contatos', label: 'Contatos', icon: <LuMessageSquare size={19} />, badgeKey: 'contacts' as const },
];

export function Layout() {
  const { logout, user } = useAuth();

  // Contagens acionáveis para "gestão num relance" nos itens de nav.
  const pending = useProviders('PENDING_APPROVAL');
  const mediations = useMediations();
  const contacts = useContacts({});
  const badges: Record<string, number> = {
    providers: pending.data?.length ?? 0,
    mediations: mediations.data?.length ?? 0,
    contacts: (contacts.data ?? []).filter((c) => c.status === 'NEW' || c.status === 'IN_PROGRESS').length,
  };

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-background px-3 py-5 md:flex">
        <Link to="/" className="flex items-center gap-1.5 px-2" aria-label={`${brand.name} Admin`}>
          <img src="/brand/logo.svg" alt={brand.name} className="h-10 w-auto" />
          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            Admin
          </span>
        </Link>

        <nav className="mt-7 space-y-1">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} badge={item.badgeKey ? badges[item.badgeKey] : undefined} />
          ))}
        </nav>

        <div className="mt-auto border-t border-border pt-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {(user?.name ?? '?').charAt(0).toUpperCase()}
            </div>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{user?.name ?? 'Admin'}</span>
            <button onClick={() => void logout()} aria-label="Sair" className="text-text-muted hover:text-danger">
              <LuLogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <Link to="/" aria-label={brand.name} className="flex items-center gap-1.5">
            <img src="/brand/logo.svg" alt={brand.name} className="h-9 w-auto" />
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Admin
            </span>
          </Link>
          <button onClick={() => void logout()} aria-label="Sair" className="text-text-muted hover:text-danger">
            <LuLogOut size={18} />
          </button>
        </header>

        {/* Nav horizontal (mobile) */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} compact badge={item.badgeKey ? badges[item.badgeKey] : undefined} />
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon,
  end,
  compact,
  badge,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  compact?: boolean;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex shrink-0 items-center gap-2.5 rounded-medium px-3 py-2.5 text-sm font-medium transition-colors ${
          compact ? 'whitespace-nowrap' : ''
        } ${
          isActive ? 'bg-primary/15 text-primary' : 'text-text-muted hover:bg-card-2 hover:text-foreground'
        }`
      }
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="min-w-[18px] rounded-full bg-danger px-1.5 text-center text-[10px] font-bold leading-[18px] text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </NavLink>
  );
}
