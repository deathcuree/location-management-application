import { useUIStore } from '../store/ui';

export default function Toasts() {
  const toasts = useUIStore((s) => s.toasts);
  const remove = useUIStore((s) => s.remove);

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2"
      aria-live="assertive"
      aria-atomic="true"
    >
      {toasts.map((t) => {
        const color =
          t.type === 'success'
            ? 'bg-emerald-600'
            : t.type === 'error'
            ? 'bg-rose-600'
            : 'bg-slate-700';
        const border =
          t.type === 'success'
            ? 'border-emerald-700'
            : t.type === 'error'
            ? 'border-rose-700'
            : 'border-slate-600';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto rounded border ${border} ${color} text-white shadow-lg`}
            role="alert"
          >
            <div className="flex items-start gap-3 p-3">
              <div className="flex-1 text-sm">{t.message}</div>
              <button
                onClick={() => remove(t.id)}
                className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}