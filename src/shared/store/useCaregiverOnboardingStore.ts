'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CaregiverCondition,
  ReminderPreferences,
} from '@/domain/onboarding/onboarding.types';

interface CaregiverOnboardingState {
  documentNumber: string;
  patientFound: boolean;
  patientName: string;
  patientDateOfBirth: string | null;
  relation: string | null;
  conditions: CaregiverCondition[];
  reminders: ReminderPreferences;
  onboardingCompleted: boolean;
}

interface CaregiverOnboardingActions {
  setDocumentNumber: (doc: string) => void;
  setPatientFound: (found: boolean) => void;
  setPatientName: (name: string) => void;
  setPatientDateOfBirth: (dob: string | null) => void;
  setRelation: (relation: string | null) => void;
  setConditions: (conditions: CaregiverCondition[]) => void;
  setReminders: (partial: Partial<ReminderPreferences>) => void;
  setOnboardingCompleted: (value: boolean) => void;
  reset: () => void;
}

type CaregiverOnboardingStore = CaregiverOnboardingState & CaregiverOnboardingActions;

const initialState: CaregiverOnboardingState = {
  documentNumber: '',
  patientFound: false,
  patientName: '',
  patientDateOfBirth: null,
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

      setDocumentNumber: (documentNumber) => set({ documentNumber }),

      setPatientFound: (patientFound) => set({ patientFound }),

      setPatientName: (name) => set({ patientName: name }),

      setPatientDateOfBirth: (dob) => set({ patientDateOfBirth: dob }),

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
