'use client';

import { toast as sonnerToast, Toaster } from 'sonner';

type ToastApi = {
  error: (message: string) => void;
  warning: (message: string) => void;
  success: (message: string) => void;
};

const api: ToastApi = {
  error: (m) => sonnerToast.error(m),
  warning: (m) => sonnerToast.warning(m),
  success: (m) => sonnerToast.success(m),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        duration={4000}
        richColors
        closeButton
        expand
      />
    </>
  );
}

export function useToast(): ToastApi {
  return api;
}
