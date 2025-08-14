import type { ReactNode } from 'react';
import { useUIStore, type Toast, type ToastType } from '../store/ui';

type ToastsProps = {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  containerClassName?: string;
  toastClassName?: string;
  typeClassNames?: Partial<Record<ToastType, { bg?: string; border?: string }>>;
  renderToast?: (toast: Toast, close: (id: string) => void) => ReactNode;
  max?: number;
  closeButtonAriaLabel?: string;
};

const positionToClass: Record<
  NonNullable<ToastsProps['position']>,
  string
> = {
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

const defaultTypeClasses: Record<ToastType, { bg: string; border: string }> = {
  success: { bg: 'bg-emerald-600', border: 'border-emerald-700' },
  error: { bg: 'bg-rose-600', border: 'border-rose-700' },
  info: { bg: 'bg-slate-700', border: 'border-slate-600' },
};

export default function Toasts({
  position = 'top-right',
  containerClassName,
  toastClassName,
  typeClassNames,
  renderToast,
  max,
  closeButtonAriaLabel = 'Close',
}: ToastsProps = {}) {
  const toasts = useUIStore((s) => s.toasts);
  const remove = useUIStore((s) => s.remove);

  const displayed = typeof max === 'number' ? toasts.slice(-max) : toasts;

  return (
    <div
      className={[
        'pointer-events-none fixed z-50 flex w-80 max-w-[90vw] flex-col gap-2',
        positionToClass[position],
        containerClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="assertive"
      aria-atomic="true"
    >
      {displayed.map((t) => {
        if (renderToast) {
          return <div key={t.id} className="pointer-events-auto">{renderToast(t, remove)}</div>;
        }

        const merged = {
          ...defaultTypeClasses[t.type],
          ...(typeClassNames?.[t.type] ?? {}),
        };

        return (
          <div
            key={t.id}
            className={[
              'pointer-events-auto rounded border text-white shadow-lg',
              merged.border,
              merged.bg,
              toastClassName,
            ]
              .filter(Boolean)
              .join(' ')}
            role="alert"
          >
            <div className="flex items-start gap-3 p-3">
              <div className="flex-1 text-sm">{t.message}</div>
              <button
                onClick={() => remove(t.id)}
                className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label={closeButtonAriaLabel}
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