import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types/models';

function linksByRole(role: UserRole, settingsLabel: string): Array<{ to: string; label: string }> {
  if (role === 'doctor') {
    return [
      { to: '/dashboard', label: 'Dashboard Docteur' },
      { to: '/appointments', label: 'Mes consultations' },
      { to: '/settings', label: 'Disponibilites' }
    ];
  }

  if (role === 'admin') {
    return [
      { to: '/admin', label: 'Dashboard Admin' },
      { to: '/dashboard', label: 'Vue globale' },
      { to: '/appointments', label: 'Rendez-vous' }
    ];
  }

  return [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/doctors', label: 'Docteurs' },
    { to: '/map', label: 'Carte' },
    { to: '/appointments', label: 'Mes rendez-vous' },
    { to: '/settings', label: settingsLabel }
  ];
}

export function AppShell(): React.JSX.Element {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const role = user?.role ?? 'user';
  const links = linksByRole(role, t('settings'));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff6f8,#f8fafc_35%,#eef2ff_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-black tracking-tight text-cyan-800">
            {t('appName')}
          </Link>
          <nav className="hidden gap-2 md:flex">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-cyan-700 text-white' : 'text-slate-700 hover:bg-white'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {user?.role === 'admin' ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-fuchsia-700 text-white' : 'text-slate-700 hover:bg-white'}`
                }
              >
                {t('admin')}
              </NavLink>
            ) : null}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm font-semibold text-slate-700 sm:block">{user.fullName} ({user.role})</span>
                <button
                  onClick={logout}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <Link className="rounded-xl bg-cyan-700 px-3 py-2 text-sm font-semibold text-white" to="/login">
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
