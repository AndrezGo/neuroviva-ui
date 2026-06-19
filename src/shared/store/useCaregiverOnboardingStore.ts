'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CaregiverCondition,
  ReminderPreferences,
} from '@/domain/onboarding/onboarding.types';

interface CaregiverOnboardingState {
  patientName: string;
  relation: string | null;
  conditions: CaregiverCondition[];
  reminders: ReminderPreferences;
  onboardingCompleted: boolean;
}

interface CaregiverOnboardingActions {
  setPatientName: (name: string) => void;
  setRelation: (relation: string | null) => void;
  setConditions: (conditions: CaregiverCondition[]) => void;
  setReminders: (partial: Partial<ReminderPreferences>) => void;
  setOnboardingCompleted: (value: boolean) => void;
  reset: () => void;
}

type CaregiverOnboardingStore = CaregiverOnboardingState & CaregiverOnboardingActions;

const initialState: CaregiverOnboardingState = {
  patientName: '',
  relation: null,
  conditions: [],
  reminders: {
    medications: true,
    appointments: true,
  },
  onboardingCompleted: false,
};

export const useCaregiverOnboardingStore = create<CaregiverOnboardingStore>()(
  persist(
    (set) => ({
      ...initialState,

      setPatientName: (name) => set({ patientName: name }),

      setRelation: (relation) => set({ relation }),

      setConditions: (conditions) => set({ conditions }),

      setReminders: (partial) =>
        set((state) => ({ reminders: { ...state.reminders, ...partial } })),

      setOnboardingCompleted: (value) => set({ onboardingCompleted: value }),

      reset: () => set(initialState),
    }),
    {
      name: 'neuroviva-caregiver-onboarding',
    },
  ),
);
