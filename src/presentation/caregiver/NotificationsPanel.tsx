'use client';

import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Sheet } from '@/presentation/ui/Sheet';
import { cn } from '@/shared/lib/cn';
import type { AppNotification } from '@/domain/caregiver/caregiver.types';

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  isLoading: boolean;
  onMarkAllRead: () => void;
}

/**
 * Purely presentational slide-up / centered dialog for in-app notifications.
 * No hooks that touch the API or the token — state is injected via props.
 * When the panel opens and there are unread notifications, onMarkAllRead is
 * called once. The effect depends on [open, notifications, onMarkAllRead]:
 * notifications and onMarkAllRead are stable references (Zustand selectors
 * return stable callbacks; array reference only changes when store updates),
 * so this only re-fires when the panel transitions to open or the list changes
 * while the panel is already open — both desirable.
 */
export function NotificationsPanel({
  open,
  onClose,
  notifications,
  isLoading,
  onMarkAllRead,
}: NotificationsPanelProps) {
  useEffect(() => {
    if (!open) return;
    const hasUnread = notifications.some((n) => !n.isRead);
    if (hasUnread) {
      onMarkAllRead();
    }
  }, [open, notifications, onMarkAllRead]);

  return (
    <Sheet open={open} onClose={onClose} title="Notificaciones">
      {isLoading ? (
        /* ── Loading skeletons ─────────────────────────────────────────── */
        <ul aria-busy="true" aria-label="Cargando notificaciones" className="space-y-4 py-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-1/3 animate-pulse rounded-full bg-gray-100" />
              </div>
            </li>
          ))}
        </ul>
      ) : notifications.length === 0 ? (
        /* ── Empty state ───────────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Bell className="h-7 w-7 text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-brand-dark">Sin notificaciones</p>
          <p className="text-xs text-gray-text">Aquí aparecerán los avisos del sistema.</p>
        </div>
      ) : (
        /* ── Notification list ─────────────────────────────────────────── */
        <ul className="divide-y divide-gray-100">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                'flex gap-3 py-3',
                !n.isRead && 'bg-brand-primary-light/30 -mx-1 px-1 rounded-xl',
              )}
            >
              {/* Status dot */}
              <span
                aria-hidden="true"
                className={cn(
                  'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                  !n.isRead ? 'bg-warning' : 'bg-gray-200',
                )}
              />

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-brand-dark">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-text">{n.body}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
