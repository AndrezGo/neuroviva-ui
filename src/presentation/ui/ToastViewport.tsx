'use client';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useToastStore } from '@/shared/store/useToastStore';
import { cn } from '@/shared/lib/cn';

export function ToastViewport() {
  const { toasts, removeToast } = useToastStore();

  if (typeof document === 'undefined' || toasts.length === 0) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-label="Notificaciones"
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0 lg:max-w-xs"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-lg text-sm font-medium animate-fade-in',
            toast.type === 'success'
              ? 'bg-success text-white'
              : 'bg-error text-white',
          )}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Cerrar notificación"
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
