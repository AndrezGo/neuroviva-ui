'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccessibilityPreferences } from '@/domain/preferences/preferences.types';

interface PreferencesStoreActions {
  setLargeText: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
}

type PreferencesStore = AccessibilityPreferences & PreferencesStoreActions;

const initialState: AccessibilityPreferences = {
  largeText: true,
  highContrast: false,
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...initialState,

      setLargeText: (v) => set({ largeText: v }),

      setHighContrast: (v) => set({ highContrast: v }),
    }),
    {
      name: 'neuroviva-preferences',
    },
  ),
);
