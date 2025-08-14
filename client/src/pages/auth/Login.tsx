import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthForm, { type FieldConfig } from '../../components/AuthForm';
import { useLogin } from '../../hooks/useApi';
import { useUIStore } from '../../store/ui';
import { useAuthStore } from '../../store/auth';
import { validateLogin } from './validation';

export default function Login() {
  const navigate = useNavigate();
  const login = useLogin();
  const show = useUIStore((s) => s.show);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  if (isAuthed) {
    return <Navigate to="/map" replace />;
  }

  const fields: FieldConfig[] = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      autoComplete: 'email',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '••••••••',
      autoComplete: 'current-password',
    },
  ];

  const handleSubmit = (values: Record<string, string>) => {
    const err = validateLogin(values);
    if (err) {
      show(err, 'error');
      return;
    }
    const email = values.email.trim();
    const password = values.password;

    login.mutate(
      { email, password },
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
    <AuthForm
      title="Login"
      description="Welcome back. Please enter your credentials."
      fields={fields}
      isPending={login.isPending}
      submitLabel="Login"
      pendingLabel="Logging in..."
      onSubmit={handleSubmit}
      footer={
        <span>
          {"Don't have an account? "}
          <Link to="/register" className="font-medium text-slate-900 underline">
            Register
          </Link>
        </span>
      }
    />
  );
}