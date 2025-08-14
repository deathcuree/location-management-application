import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type UIState = {
  toasts: Toast[];
  show: (message: string, type?: ToastType, durationMs?: number) => string;
  remove: (id: string) => void;
  clearAll: () => void;
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  show: (message, type = 'info', durationMs = 3000) => {
    const id = genId();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    if (durationMs > 0) {
      setTimeout(() => {
        const exists = get().toasts.some((t) => t.id === id);
        if (exists) {
          get().remove(id);
        }
      }, durationMs);
    }
    return id;
  },
  remove: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
}));