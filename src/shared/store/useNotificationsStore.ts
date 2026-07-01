'use client';

import { create } from 'zustand';
import type { AppNotification } from '@/domain/caregiver/caregiver.types';

interface NotificationsState {
  notifications: AppNotification[];
  isLoading: boolean;
  panelOpen: boolean;
}

interface NotificationsActions {
  setNotifications: (notifications: AppNotification[]) => void;
  setLoading: (loading: boolean) => void;
  openPanel: () => void;
  closePanel: () => void;
  /** Optimistically mark a single notification as read in local state. */
  markReadLocal: (id: string) => void;
  /** Optimistically mark every notification as read in local state. */
  markAllReadLocal: () => void;
}

type NotificationsStore = NotificationsState & NotificationsActions;

/**
 * Single source of truth for in-app notifications.
 * The async fetch + API calls are owned by useNotifications (application layer).
 * This store holds the committed state so both CaregiverShell (desktop) and
 * page.tsx (mobile) can read from one place without double-fetching.
 */
export const useNotificationsStore = create<NotificationsStore>((set) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  notifications: [],
  isLoading: false,
  panelOpen: false,

  // ── Actions ────────────────────────────────────────────────────────────────
  setNotifications: (notifications) => set({ notifications }),

  setLoading: (loading) => set({ isLoading: loading }),

  openPanel: () => set({ panelOpen: true }),

  closePanel: () => set({ panelOpen: false }),

  markReadLocal: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
    })),

  markAllReadLocal: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
    })),
}));
