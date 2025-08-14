import { useState } from 'react';

export type LocationFormValues = {
  name: string;
  lat: string;
  lng: string;
};

export type LocationFormProps = {
  initialValues?: LocationFormValues;
  isPending?: boolean;
  onSubmit: (values: LocationFormValues) => Promise<boolean> | boolean;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  buttonLabel?: string;
  pendingLabel?: string;
};

const baseInput =
  'rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500';
const baseButton =
  'rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70';

export default function LocationForm({
  initialValues = { name: '', lat: '', lng: '' },
  isPending = false,
  onSubmit,
  className = 'mt-3 grid grid-cols-1 gap-3 md:grid-cols-4',
  inputClassName,
  buttonClassName,
  buttonLabel = 'Add',
  pendingLabel = 'Adding...',
}: LocationFormProps) {
  const [form, setForm] = useState<LocationFormValues>(initialValues);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await onSubmit(form);
    if (res) {
      setForm({ name: '', lat: '', lng: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={onChange}
        className={[baseInput, inputClassName].filter(Boolean).join(' ')}
      />
      <input
        name="lat"
        placeholder="Latitude"
        type="number"
        step="any"
        inputMode="decimal"
        value={form.lat}
        onChange={onChange}
        className={[baseInput, inputClassName].filter(Boolean).join(' ')}
      />
      <input
        name="lng"
        placeholder="Longitude"
        type="number"
        step="any"
        inputMode="decimal"
        value={form.lng}
        onChange={onChange}
        className={[baseInput, inputClassName].filter(Boolean).join(' ')}
      />
      <button
        type="submit"
        disabled={isPending}
        className={[baseButton, buttonClassName].filter(Boolean).join(' ')}
      >
        {isPending ? pendingLabel : buttonLabel}
      </button>
    </form>
  );
}