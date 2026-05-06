'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type ToastVariant = 'error' | 'warning' | 'success';

type Toast = {
  id: number;
  variant: ToastVariant;
  message: string;
};

type ToastApi = {
  error: (message: string) => void;
  warning: (message: string) => void;
  success: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);
const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant: ToastVariant, message: string) => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((prev) => [...prev, { id, variant, message }]);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      error: (m) => push('error', m),
      warning: (m) => push('warning', m),
      success: (m) => push('success', m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const styles = VARIANT_STYLES[toast.variant];

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${styles.container}`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center ${styles.icon}`}>
        {VARIANT_ICONS[toast.variant]}
      </span>
      <p className={`flex-1 text-sm ${styles.text}`}>{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className={`-mr-1 -mt-1 rounded p-1 ${styles.close}`}
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 11-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: string; text: string; close: string }
> = {
  error: {
    container: 'border-red-200 bg-red-50',
    icon: 'text-red-600',
    text: 'text-red-800',
    close: 'text-red-500 hover:bg-red-100 hover:text-red-700',
  },
  warning: {
    container: 'border-amber-200 bg-amber-50',
    icon: 'text-amber-600',
    text: 'text-amber-900',
    close: 'text-amber-600 hover:bg-amber-100 hover:text-amber-800',
  },
  success: {
    container: 'border-emerald-200 bg-emerald-50',
    icon: 'text-emerald-600',
    text: 'text-emerald-800',
    close: 'text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800',
  },
};

const VARIANT_ICONS: Record<ToastVariant, React.ReactNode> = {
  error: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 102 0 1 1 0 00-2 0zm0-7a1 1 0 012 0v4a1 1 0 11-2 0V6z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8.485 2.495a1.75 1.75 0 013.03 0l6.28 10.875A1.75 1.75 0 0116.28 16H3.72a1.75 1.75 0 01-1.515-2.63L8.485 2.495zM10 7a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0110 7zm0 7a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
};
