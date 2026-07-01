import { Link, NavLink, Outlet } from 'react-router-dom';
import { brand } from '@orcalink/design-tokens/brand.config';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { logout, user } = useAuth();
  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <Link to="/" className="text-lg font-bold text-brand">
          {brand.name} <span className="text-xs font-normal text-text-muted">Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-muted">{user?.name}</span>
          <button onClick={() => void logout()} className="text-sm text-text-muted underline">
            Sair
          </button>
        </div>
      </header>

      <nav className="flex gap-1 border-b border-border px-6">
        <Tab to="/" label="Dashboard" />
        <Tab to="/prestadores" label="Prestadores" />
        <Tab to="/categorias" label="Categorias" />
        <Tab to="/financeiro" label="Financeiro" />
        <Tab to="/avaliacoes" label="Avaliações" />
      </nav>

      <main className="flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}

function Tab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `px-4 py-2.5 text-sm font-medium ${
          isActive ? 'border-b-2 border-brand text-brand' : 'text-text-muted'
        }`
      }
    >
      {label}
    </NavLink>
  );
}
