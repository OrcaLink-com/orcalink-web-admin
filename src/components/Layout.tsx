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
  LuLogOut,
} from 'react-icons/lu';
import { useAuth } from '../auth/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: <LuLayoutDashboard size={19} />, end: true },
  { to: '/operacoes', label: 'Operações', icon: <LuActivity size={19} /> },
  { to: '/usuarios', label: 'Usuários', icon: <LuUserCog size={19} /> },
  { to: '/prestadores', label: 'Prestadores', icon: <LuUsers size={19} /> },
  { to: '/categorias', label: 'Categorias', icon: <LuTags size={19} /> },
  { to: '/financeiro', label: 'Financeiro', icon: <LuWallet size={19} /> },
  { to: '/avaliacoes', label: 'Avaliações', icon: <LuStar size={19} /> },
];

export function Layout() {
  const { logout, user } = useAuth();

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
            <NavItem key={item.to} {...item} />
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
          <Link to="/" aria-label={brand.name}>
            <img src="/brand/logo.svg" alt={brand.name} className="h-10 w-auto" />
          </Link>
          <button onClick={() => void logout()} aria-label="Sair" className="text-text-muted hover:text-danger">
            <LuLogOut size={18} />
          </button>
        </header>

        {/* Nav horizontal (mobile) */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} compact />
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
}: {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  compact?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex shrink-0 items-center gap-2.5 rounded-medium px-3 py-2.5 text-sm font-medium transition-colors ${
          compact ? 'whitespace-nowrap' : ''
        } ${
          isActive
            ? 'bg-primary/15 text-primary'
            : 'text-text-muted hover:bg-card-2 hover:text-foreground'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
