import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, selectIsAuthed, selectUser } from '../store/auth';
import { useLogout } from '../hooks/useApi';

function NavItem({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'block rounded px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-slate-700 text-white' : 'text-slate-200 hover:bg-slate-800 hover:text-white',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const isAuthed = useAuthStore(selectIsAuthed);
  const user = useAuthStore(selectUser);
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-slate-200 bg-slate-900 text-slate-100">
      <div className="px-4 py-4">
        <div className="text-lg font-bold">Location Manager</div>
        <div className="mt-1 text-xs text-slate-300">
          {isAuthed ? (user ? `Hello, ${user.name}` : 'Authenticated') : 'Guest'}
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {isAuthed ? (
          <>
            <NavItem to="/map" label="Map" />
            <NavItem to="/upload" label="Upload" />
          </>
        ) : (
          <>
            <NavItem to="/login" label="Login" />
            <NavItem to="/register" label="Register" />
          </>
        )}
      </nav>

      <div className="px-3 py-4">
        {isAuthed ? (
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full rounded bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
          >
            {logout.isPending ? 'Logging out...' : 'Logout'}
          </button>
        ) : (
          <div className="text-xs text-slate-400">Please login to access the app.</div>
        )}
      </div>
    </aside>
  );
}