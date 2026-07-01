'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DoctorOnboardingState {
  firstName: string;
  lastName: string;
  specialty: string;
  customSpecialty: string;
  medicalLicense: string;
  onboardingCompleted: boolean;
}

interface DoctorOnboardingActions {
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setSpecialty: (specialty: string) => void;
  setCustomSpecialty: (customSpecialty: string) => void;
  setMedicalLicense: (medicalLicense: string) => void;
  setOnboardingCompleted: (value: boolean) => void;
  reset: () => void;
}

type DoctorOnboardingStore = DoctorOnboardingState & DoctorOnboardingActions;

const initialState: DoctorOnboardingState = {
  firstName: '',
  lastName: '',
  specialty: '',
  customSpecialty: '',
  medicalLicense: '',
  onboardingCompleted: false,
};

export const useDoctorOnboardingStore = create<DoctorOnboardingStore>()(
  persist(
    (set) => ({
      ...initialState,

      setFirstName: (firstName) => set({ firstName }),

      setLastName: (lastName) => set({ lastName }),

      setSpecialty: (specialty) => set({ specialty }),

      setCustomSpecialty: (customSpecialty) => set({ customSpecialty }),

      setMedicalLicense: (medicalLicense) => set({ medicalLicense }),

      setOnboardingCompleted: (value) => set({ onboardingCompleted: value }),

      reset: () => set(initialState),
    }),
    {
      name: 'neuroviva-doctor-onboarding',
    },
  ),
);
