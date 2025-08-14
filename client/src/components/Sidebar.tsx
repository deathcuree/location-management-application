import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, selectIsAuthed, selectUser } from '../store/auth';
import { useLogout } from '../hooks/useApi';
import type { User } from '../types/api';
import type { ReactNode } from 'react';

export type NavItemProps = {
  to: string;
  label: string;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
};

export function NavItem({ to, label, className, activeClassName, inactiveClassName }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'block rounded px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-slate-700 text-white' : 'text-slate-200 hover:bg-slate-800 hover:text-white',
          className,
          isActive ? activeClassName : inactiveClassName,
        ]
          .filter(Boolean)
          .join(' ')
      }
    >
      {label}
    </NavLink>
  );
}

export type SidebarLink = { to: string; label: string };

type SidebarProps = {
  title?: string;
  className?: string;
  headerClassName?: string;
  navClassName?: string;
  footerClassName?: string;
  authedLinks?: SidebarLink[];
  guestLinks?: SidebarLink[];
  showGreeting?: boolean;
  logoutLabel?: string;
  logoutPendingLabel?: string;
  onLogout?: () => void;
  logoutDisabled?: boolean;
  renderHeaderExtra?: (ctx: { isAuthed: boolean; user: User | null }) => ReactNode;
};

export default function Sidebar({
  title = 'Location Manager',
  className,
  headerClassName,
  navClassName,
  footerClassName,
  authedLinks,
  guestLinks,
  showGreeting = true,
  logoutLabel = 'Logout',
  logoutPendingLabel = 'Logging out...',
  onLogout,
  logoutDisabled,
  renderHeaderExtra,
}: SidebarProps = {}) {
  const isAuthed = useAuthStore(selectIsAuthed);
  const user = useAuthStore(selectUser);
  const navigate = useNavigate();
  const logout = useLogout();

  const doDefaultLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };
  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    else doDefaultLogout();
  };

  const authed = authedLinks ?? [
    { to: '/map', label: 'Map' },
    { to: '/upload', label: 'Upload' },
  ];
  const guest = guestLinks ?? [
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
  ];

  return (
    <aside
      className={[
        'flex h-screen w-60 flex-col border-r border-slate-200 bg-slate-900 text-slate-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={['px-4 py-4', headerClassName].filter(Boolean).join(' ')}>
        <div className="text-lg font-bold">{title}</div>
        {showGreeting && (
          <div className="mt-1 text-xs text-slate-300">
            {isAuthed ? (user ? `Hello, ${user.name}` : 'Authenticated') : 'Guest'}
          </div>
        )}
        {renderHeaderExtra?.({ isAuthed, user })}
      </div>

      <nav className={['mt-2 flex-1 space-y-1 px-3', navClassName].filter(Boolean).join(' ')}>
        {(isAuthed ? authed : guest).map((link) => (
          <NavItem key={link.to} to={link.to} label={link.label} />
        ))}
      </nav>

      <div className={['px-3 py-4', footerClassName].filter(Boolean).join(' ')}>
        {isAuthed ? (
          <button
            onClick={handleLogoutClick}
            disabled={onLogout ? !!logoutDisabled : logout.isPending}
            className="w-full rounded bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
          >
            {onLogout ? logoutLabel : logout.isPending ? logoutPendingLabel : logoutLabel}
          </button>
        ) : (
          <div className="text-xs text-slate-400">Please login to access the app.</div>
        )}
      </div>
    </aside>
  );
}