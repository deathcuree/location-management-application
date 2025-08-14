import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useApi';
import { useUIStore } from '../store/ui';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const navigate = useNavigate();
  const login = useLogin();
  const show = useUIStore((s) => s.show);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthed) {
    // Already logged in, redirect to map
    navigate('/map');
  }

  function validate(): string | null {
    if (!email.trim() || !password.trim()) return 'Email and password are required';
    // Basic email shape check
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email';
    return null;
    }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      show(err, 'error');
      return;
    }
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          show('Logged in successfully', 'success');
          navigate('/map');
        },
        onError: (error: any) => {
          show(error?.message ?? 'Login failed', 'error');
        },
      }
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Login</h1>
        <p className="mt-1 text-sm text-slate-600">Welcome back. Please enter your credentials.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
        >
          {login.isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="text-sm text-slate-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-slate-900 underline">
          Register
        </Link>
      </div>
    </div>
  );
}