import { Link, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../auth/use-auth';

function GaugeMark() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5 shrink-0">
      <rect x="1" y="1" width="18" height="18" rx="4.5" fill="var(--color-accent)" />
      <rect x="4.5" y="12.5" width="11" height="2" rx="1" fill="var(--color-surface)" />
      <rect x="4.5" y="8" width="6.5" height="2" rx="1" fill="var(--color-surface)" opacity="0.5" />
    </svg>
  );
}

export function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    void navigate('/login');
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3.5">
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap text-[15px] font-semibold tracking-tight"
          >
            <GaugeMark />
            Consulta de Riesgo
          </Link>

          {isAuthenticated && user && (
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span className="hidden text-[13px] text-ink-soft sm:inline">
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
              {user.rut !== undefined && (
                <span className="hidden font-mono text-[13px] text-ink sm:inline">{user.rut}</span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost -mr-2 px-2.5 py-1.5"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <p className="mx-auto max-w-3xl px-5 py-4 text-[12px] text-ink-soft">
          Demo del desafío técnico. No hay persistencia y los datos no son reales.
        </p>
      </footer>
    </div>
  );
}
