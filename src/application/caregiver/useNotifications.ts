'use client';

import { useEffect, useCallback } from 'react';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import {
  getNotifications,
  markNotificationRead,
} from '@/infrastructure/api/caregiverApi.repository';
import { useNotificationsStore } from '@/shared/store/useNotificationsStore';
import type { AppNotification } from '@/domain/caregiver/caregiver.types';

export interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  reload: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

/**
 * Owns the async fetch + API calls for in-app notifications.
 * All state is committed into useNotificationsStore so both the desktop
 * shell and the mobile page can read from a single source without double-fetching.
 * Errors are caught silently — the bell must never break the page.
 *
 * Call this hook ONLY in CaregiverShell (single mount point).
 */
export function useNotifications(): UseNotificationsReturn {
  const setNotifications = useNotificationsStore((s) => s.setNotifications);
  const setLoading = useNotificationsStore((s) => s.setLoading);
  const markReadLocal = useNotificationsStore((s) => s.markReadLocal);
  const markAllReadLocal = useNotificationsStore((s) => s.markAllReadLocal);
  const notifications = useNotificationsStore((s) => s.notifications);
  const isLoading = useNotificationsStore((s) => s.isLoading);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchAndCommit = useCallback(async (active: { current: boolean }): Promise<void> => {
    setLoading(true);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        // No token — bail silently; notifications simply stay empty.
        return;
      }

      const data = await getNotifications(token);

      if (!active.current) return;
      setNotifications(data);
    } catch {
      // Silent failure — bell must not break the page.
    } finally {
      if (active.current) {
        setLoading(false);
      }
    }
  }, [setNotifications, setLoading]);

  const reload = useCallback((): Promise<void> => {
    const active = { current: true };
    return fetchAndCommit(active);
  }, [fetchAndCommit]);

  useEffect(() => {
    const active = { current: true };
    fetchAndCommit(active);
    return () => {
      active.current = false;
    };
  }, [fetchAndCommit]);

  const markRead = useCallback(
    async (id: string) => {
      try {
        const token = await supabaseAuthRepository.getAccessToken();
        if (!token) return;
        await markNotificationRead(token, id);
        markReadLocal(id);
      } catch {
        // Silent failure.
      }
    },
    [markReadLocal],
  );

  const markAllRead = useCallback(async () => {
    try {
      const token = await supabaseAuthRepository.getAccessToken();
      if (!token) return;

      const unread = useNotificationsStore
        .getState()
        .notifications.filter((n) => !n.isRead);

      await Promise.allSettled(
        unread.map((n) => markNotificationRead(token, n.id)),
      );

      markAllReadLocal();
    } catch {
      // Silent failure.
    }
  }, [markAllReadLocal]);

  return {
    notifications,
    unreadCount,
    isLoading,
    reload,
    markRead,
    markAllRead,
  };
}
