'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDoctorOnboardingStore } from '@/shared/store/useDoctorOnboardingStore';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { submitDoctorOnboarding } from '@/infrastructure/api/doctorApi.repository';
import { ApiError } from '@/infrastructure/api/apiClient';
import { routes } from '@/core/routing/routes';

export interface UseDoctorOnboardingReturn {
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  specialty: string;
  setSpecialty: (v: string) => void;
  /** True when the user has selected the "other" specialty option. */
  isOtherSpecialty: boolean;
  customSpecialty: string;
  setCustomSpecialty: (v: string) => void;
  medicalLicense: string;
  setMedicalLicense: (v: string) => void;
  /** True when the form has enough data to be submitted. */
  canSubmit: boolean;
  isSubmitting: boolean;
  error: string | null;
  finish: () => Promise<void>;
  onboardingCompleted: boolean;
}

export function useDoctorOnboarding(): UseDoctorOnboardingReturn {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persisted store selectors
  const firstName = useDoctorOnboardingStore((s) => s.firstName);
  const lastName = useDoctorOnboardingStore((s) => s.lastName);
  const specialty = useDoctorOnboardingStore((s) => s.specialty);
  const customSpecialty = useDoctorOnboardingStore((s) => s.customSpecialty);
  const medicalLicense = useDoctorOnboardingStore((s) => s.medicalLicense);
  const onboardingCompleted = useDoctorOnboardingStore((s) => s.onboardingCompleted);

  const setFirstName = useDoctorOnboardingStore((s) => s.setFirstName);
  const setLastName = useDoctorOnboardingStore((s) => s.setLastName);
  const setSpecialty = useDoctorOnboardingStore((s) => s.setSpecialty);
  const setCustomSpecialty = useDoctorOnboardingStore((s) => s.setCustomSpecialty);
  const setMedicalLicense = useDoctorOnboardingStore((s) => s.setMedicalLicense);
  const setOnboardingCompleted = useDoctorOnboardingStore((s) => s.setOnboardingCompleted);

  // Derived flag — true when user picks the free-text specialty option
  const isOtherSpecialty = specialty === 'other';

  // The effective specialty value used for submission and validation
  const effectiveSpecialty = isOtherSpecialty ? customSpecialty.trim() : specialty;

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    effectiveSpecialty.length > 0 &&
    medicalLicense.trim().length >= 4;

  // Guard anti-flash: if already completed, redirect immediately
  useEffect(() => {
    if (onboardingCompleted) {
      router.replace(routes.homeDoctor());
    }
  }, [onboardingCompleted, router]);

  const finish = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await supabaseAuthRepository.getAccessToken();

      if (!token) {
        router.push(routes.login());
        return;
      }

      await submitDoctorOnboarding(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        specialty: effectiveSpecialty,
        medicalLicense: medicalLicense.trim(),
      });

      setOnboardingCompleted(true);
      router.push(routes.homeDoctor());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  }, [firstName, lastName, effectiveSpecialty, medicalLicense, router, setOnboardingCompleted]);

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    specialty,
    setSpecialty,
    isOtherSpecialty,
    customSpecialty,
    setCustomSpecialty,
    medicalLicense,
    setMedicalLicense,
    canSubmit,
    isSubmitting,
    error,
    finish,
    onboardingCompleted,
  };
}
