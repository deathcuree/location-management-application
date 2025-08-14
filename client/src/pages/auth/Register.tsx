import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthForm, { type FieldConfig } from '../../components/AuthForm';
import { useRegister } from '../../hooks/useApi';
import { useUIStore } from '../../store/ui';
import { useAuthStore } from '../../store/auth';
import { validateRegister } from './validation';

export default function Register() {
  const navigate = useNavigate();
  const registerMut = useRegister();
  const show = useUIStore((s) => s.show);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  if (isAuthed) {
    return <Navigate to="/map" replace />;
  }

  const fields: FieldConfig[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Your name',
      autoComplete: 'name',
    },
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
      autoComplete: 'new-password',
    },
  ];

  const handleSubmit = (values: Record<string, string>) => {
    const err = validateRegister(values);
    if (err) {
      show(err, 'error');
      return;
    }
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    };
    registerMut.mutate(payload, {
      onSuccess: () => {
        show('Registered successfully', 'success');
        navigate('/map');
      },
      onError: (error: any) => {
        show(error?.message ?? 'Registration failed', 'error');
      },
    });
  };

  return (
    <AuthForm
      title="Create an account"
      description="Get started by creating your account."
      fields={fields}
      isPending={registerMut.isPending}
      submitLabel="Register"
      pendingLabel="Creating account..."
      onSubmit={handleSubmit}
      footer={
        <span>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-slate-900 underline">
            Login
          </Link>
        </span>
      }
    />
  );
}