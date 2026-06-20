'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverOnboardingStore } from '@/shared/store/useCaregiverOnboardingStore';
import { usePreferencesStore } from '@/shared/store/usePreferencesStore';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { submitCaregiverOnboarding } from '@/infrastructure/api/caregiverApi.repository';
import { routes } from '@/core/routing/routes';
import type { CaregiverCondition } from '@/domain/onboarding/onboarding.types';

export const TOTAL_STEPS = 5;

export interface UseCaregiverOnboardingReturn {
  // Navigation
  step: number;
  total: number;
  progress: number;
  goNext: () => void;
  goBack: () => void;
  skip: () => void;
  finish: () => void;
  canContinue: boolean;

  // Step 1 — patient info
  patientName: string;
  setPatientName: (name: string) => void;
  relation: string | null;
  setRelation: (relation: string | null) => void;

  // Step 2 — condition (multi-select)
  conditions: CaregiverCondition[];
  setConditions: (conditions: CaregiverCondition[]) => void;

  // Step 3 — reading preferences
  largeText: boolean;
  highContrast: boolean;
  setLargeText: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;

  // Step 4 — reminders
  medications: boolean;
  appointments: boolean;
  setMedications: (value: boolean) => void;
  setAppointments: (value: boolean) => void;

  // Step 5 — done screen
  userName: string;

  // Onboarding gate
  onboardingCompleted: boolean;
}

export function useCaregiverOnboarding(): UseCaregiverOnboardingReturn {
  const router = useRouter();

  // Ephemeral step state — not persisted (refresh restarts at step 1)
  const [step, setStep] = useState(1);

  // Auth store — user's display name for the done screen
  const user = useAuthStore((s) => s.user);
  const userName = user?.fullName ?? '';

  // Onboarding persisted store
  const patientName = useCaregiverOnboardingStore((s) => s.patientName);
  const relation = useCaregiverOnboardingStore((s) => s.relation);
  const conditions = useCaregiverOnboardingStore((s) => s.conditions);
  const reminders = useCaregiverOnboardingStore((s) => s.reminders);
  const onboardingCompleted = useCaregiverOnboardingStore((s) => s.onboardingCompleted);

  const setPatientName = useCaregiverOnboardingStore((s) => s.setPatientName);
  const setRelation = useCaregiverOnboardingStore((s) => s.setRelation);
  const setConditions = useCaregiverOnboardingStore((s) => s.setConditions);
  const setReminders = useCaregiverOnboardingStore((s) => s.setReminders);
  const setOnboardingCompleted = useCaregiverOnboardingStore((s) => s.setOnboardingCompleted);

  // Accessibility preferences — separate persisted store
  const largeText = usePreferencesStore((s) => s.largeText);
  const highContrast = usePreferencesStore((s) => s.highContrast);
  const storeLargeText = usePreferencesStore((s) => s.setLargeText);
  const storeHighContrast = usePreferencesStore((s) => s.setHighContrast);

  // Derived per-step canContinue flag
  const canContinue = useMemo(() => {
    switch (step) {
      case 1:
        return patientName.trim().length > 0;
      case 2:
        return conditions.length > 0;
      case 3:
      case 4:
        return true;
      default:
        return true;
    }
  }, [step, patientName, conditions]);

  // Progress 0-100; step 5 is always 100
  const progress = useMemo(() => {
    if (step >= TOTAL_STEPS) return 100;
    return Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);
  }, [step]);

  const goNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    if (step === 1) {
      router.push(routes.roleSelection());
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
  }, [step, router]);

  // Skip jumps directly to final step (confirmation shown by rendering step 5)
  const skip = useCallback(() => {
    setStep(TOTAL_STEPS);
  }, []);

  const finish = useCallback(async () => {
    // Retrieve access token for authenticated backend call
    const token = await supabaseAuthRepository.getAccessToken();

    if (!token) {
      // No active session — redirect to login
      router.push(routes.login());
      return;
    }

    try {
      await submitCaregiverOnboarding(token, {
        patientName,
        relation: relation ?? '',
        condition: conditions.join(','),
      });
    } catch (err) {
      // Backend error — log but do not trap the user; home handles the missing-patient state
      console.error('[CaregiverOnboarding] submitCaregiverOnboarding failed:', err instanceof Error ? err.message : err);
    }

    setOnboardingCompleted(true);
    router.push(routes.homeCaregiver());
  }, [router, patientName, relation, conditions, setOnboardingCompleted]);

  const setLargeText = useCallback(
    (value: boolean) => storeLargeText(value),
    [storeLargeText],
  );

  const setHighContrast = useCallback(
    (value: boolean) => storeHighContrast(value),
    [storeHighContrast],
  );

  const setMedications = useCallback(
    (value: boolean) => setReminders({ medications: value }),
    [setReminders],
  );

  const setAppointments = useCallback(
    (value: boolean) => setReminders({ appointments: value }),
    [setReminders],
  );

  return {
    step,
    total: TOTAL_STEPS,
    progress,
    goNext,
    goBack,
    skip,
    finish,
    canContinue,
    patientName,
    setPatientName,
    relation,
    setRelation,
    conditions,
    setConditions,
    largeText,
    highContrast,
    setLargeText,
    setHighContrast,
    medications: reminders.medications,
    appointments: reminders.appointments,
    setMedications,
    setAppointments,
    userName,
    onboardingCompleted,
  };
}
