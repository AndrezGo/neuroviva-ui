'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverOnboardingStore } from '@/shared/store/useCaregiverOnboardingStore';
import { usePreferencesStore } from '@/shared/store/usePreferencesStore';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { submitCaregiverOnboarding } from '@/infrastructure/api/caregiverApi.repository';
import { usePatientLookup } from '@/application/caregiver/usePatientLookup';
import { routes } from '@/core/routing/routes';
import type { CaregiverCondition } from '@/domain/onboarding/onboarding.types';
import type { PatientLookupStatus } from '@/application/caregiver/usePatientLookup';
import type { PatientLookupResult } from '@/domain/patient/patient.types';

export const TOTAL_STEPS = 6;

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

  // Step 1 — document number + lookup
  documentNumber: string;
  setDocumentNumber: (doc: string) => void;
  patientFound: boolean;
  setPatientFound: (found: boolean) => void;
  lookupStatus: PatientLookupStatus;
  lookupPatient: PatientLookupResult | null;
  lookupErrorMessage: string | null;

  // Step 1 + 2 — patient info
  patientName: string;
  setPatientName: (name: string) => void;
  patientDateOfBirth: string | null;
  setPatientDateOfBirth: (dob: string | null) => void;

  // Step 2 — relation
  relation: string | null;
  setRelation: (relation: string | null) => void;

  // Step 3 — condition (multi-select)
  conditions: CaregiverCondition[];
  setConditions: (conditions: CaregiverCondition[]) => void;

  // Step 4 — reading preferences
  largeText: boolean;
  highContrast: boolean;
  setLargeText: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;

  // Step 5 — reminders
  medications: boolean;
  appointments: boolean;
  setMedications: (value: boolean) => void;
  setAppointments: (value: boolean) => void;

  // Step 6 — done screen
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
  const documentNumber = useCaregiverOnboardingStore((s) => s.documentNumber);
  const patientFound = useCaregiverOnboardingStore((s) => s.patientFound);
  const patientName = useCaregiverOnboardingStore((s) => s.patientName);
  const relation = useCaregiverOnboardingStore((s) => s.relation);
  const conditions = useCaregiverOnboardingStore((s) => s.conditions);
  const reminders = useCaregiverOnboardingStore((s) => s.reminders);
  const onboardingCompleted = useCaregiverOnboardingStore((s) => s.onboardingCompleted);

  const setDocumentNumber = useCaregiverOnboardingStore((s) => s.setDocumentNumber);
  const setPatientFound = useCaregiverOnboardingStore((s) => s.setPatientFound);
  const setPatientName = useCaregiverOnboardingStore((s) => s.setPatientName);
  const patientDateOfBirth = useCaregiverOnboardingStore((s) => s.patientDateOfBirth);
  const setPatientDateOfBirth = useCaregiverOnboardingStore((s) => s.setPatientDateOfBirth);
  const setRelation = useCaregiverOnboardingStore((s) => s.setRelation);
  const setConditions = useCaregiverOnboardingStore((s) => s.setConditions);
  const setReminders = useCaregiverOnboardingStore((s) => s.setReminders);
  const setOnboardingCompleted = useCaregiverOnboardingStore((s) => s.setOnboardingCompleted);

  // Accessibility preferences — separate persisted store
  const largeText = usePreferencesStore((s) => s.largeText);
  const highContrast = usePreferencesStore((s) => s.highContrast);
  const storeLargeText = usePreferencesStore((s) => s.setLargeText);
  const storeHighContrast = usePreferencesStore((s) => s.setHighContrast);

  // Debounced patient lookup
  const { status: lookupStatus, patient: lookupPatient, errorMessage: lookupErrorMessage } =
    usePatientLookup(documentNumber);

  // Sync lookup results into the store
  useEffect(() => {
    if (lookupStatus === 'found' && lookupPatient) {
      setPatientName(lookupPatient.name);
      setPatientFound(true);
    } else if (lookupStatus === 'not-found' || lookupStatus === 'idle') {
      if (patientFound) {
        // Only clear patientName if it was previously auto-filled by a found result
        setPatientName('');
      }
      setPatientFound(false);
    }
    // 'searching' and 'error' states do not change the patientFound flag
  }, [lookupStatus, lookupPatient, patientFound, setPatientName, setPatientFound]);

  // Derived per-step canContinue flag
  const canContinue = useMemo(() => {
    switch (step) {
      case 1:
        // Block while searching; require document + name if patient not found
        if (lookupStatus === 'searching') return false;
        if (documentNumber.trim().length < 3) return false;
        if (patientFound) return true;
        return patientName.trim().length > 0;
      case 2:
        // Relation is optional — always can continue
        return true;
      case 3:
        return conditions.length > 0;
      case 4:
      case 5:
      default:
        return true;
    }
  }, [step, documentNumber, patientFound, patientName, conditions, lookupStatus]);

  // Progress 0–100; last step is always 100
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

  // Skip jumps directly to final step
  const skip = useCallback(() => {
    setStep(TOTAL_STEPS);
  }, []);

  const finish = useCallback(async () => {
    const token = await supabaseAuthRepository.getAccessToken();

    if (!token) {
      router.push(routes.login());
      return;
    }

    try {
      await submitCaregiverOnboarding(token, {
        documentNumber,
        patientName,
        patientDateOfBirth: patientDateOfBirth ?? null,
        patientAge: null,
        relation: relation ?? '',
        conditions: conditions.length > 0 ? conditions : ['other'],
      });
    } catch (err) {
      console.error(
        '[CaregiverOnboarding] submitCaregiverOnboarding failed:',
        err instanceof Error ? err.message : err,
      );
    }

    setOnboardingCompleted(true);
    router.push(routes.homeCaregiver());
  }, [router, documentNumber, patientName, patientDateOfBirth, relation, conditions, setOnboardingCompleted]);

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
    documentNumber,
    setDocumentNumber,
    patientFound,
    setPatientFound,
    lookupStatus,
    lookupPatient,
    lookupErrorMessage,
    patientName,
    setPatientName,
    patientDateOfBirth,
    setPatientDateOfBirth,
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
