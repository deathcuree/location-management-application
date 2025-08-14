import { useMemo, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';

export type FieldConfig = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
};

export type AuthFormProps = {
  title: string;
  description?: string;
  fields: FieldConfig[];
  initialValues?: Record<string, string>;
  isPending?: boolean;
  submitLabel: string;
  pendingLabel?: string;
  onSubmit: (values: Record<string, string>) => void;
  footer?: ReactNode;
  className?: string;
  formClassName?: string;
  fieldClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  submitButtonClassName?: string;
  containerVariant?: 'card' | 'plain';
};

const baseCardClass =
  'mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm';

const baseFieldClass = 'flex flex-col gap-1';
const baseLabelClass = 'text-sm font-medium text-slate-700';
const baseInputClass =
  'rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500';
const baseButtonClass =
  'mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70';

export default function AuthForm({
  title,
  description,
  fields,
  initialValues,
  isPending = false,
  submitLabel,
  pendingLabel,
  onSubmit,
  footer,
  className,
  formClassName,
  fieldClassName,
  inputClassName,
  labelClassName,
  submitButtonClassName,
  containerVariant = 'card',
}: AuthFormProps) {
  const initial = useMemo(() => {
    const base: Record<string, string> = {};
    for (const f of fields) {
      base[f.name] = initialValues?.[f.name] ?? '';
    }
    return base;
  }, [fields, initialValues]);

  const [values, setValues] = useState<Record<string, string>>(initial);

  const handleChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const containerClass =
    containerVariant === 'card'
      ? [baseCardClass, className].filter(Boolean).join(' ')
      : [className].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>

      <form onSubmit={handleSubmit} className={['flex flex-col gap-4', formClassName].filter(Boolean).join(' ')}>
        {fields.map((f) => (
          <div key={f.name} className={[baseFieldClass, fieldClassName].filter(Boolean).join(' ')}>
            <label htmlFor={f.name} className={[baseLabelClass, labelClassName].filter(Boolean).join(' ')}>
              {f.label}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type ?? 'text'}
              className={[baseInputClass, inputClassName].filter(Boolean).join(' ')}
              placeholder={f.placeholder}
              value={values[f.name] ?? ''}
              onChange={handleChange(f.name)}
              autoComplete={f.autoComplete}
              {...(f.inputProps ?? {})}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={isPending}
          className={[baseButtonClass, submitButtonClassName].filter(Boolean).join(' ')}
        >
          {isPending ? pendingLabel ?? submitLabel : submitLabel}
        </button>
      </form>

      {footer ? <div className="text-sm text-slate-600">{footer}</div> : null}
    </div>
  );
}