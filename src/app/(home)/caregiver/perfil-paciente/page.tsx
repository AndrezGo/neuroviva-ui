'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCaregiverPatient } from '@/application/caregiver/useCaregiverPatient';
import { useUpdatePatientBirthDate } from '@/application/caregiver/useUpdatePatientAge';
import { useAssignDoctor } from '@/application/caregiver/useAssignDoctor';
import { CaregiverPatientProfileScreen } from '@/presentation/caregiver/CaregiverPatientProfileScreen';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';
import { routes } from '@/core/routing/routes';

export default function CaregiverPerfilPacientePage() {
  const router = useRouter();
  const { patient, patientMissing, isLoading, isError, error, reload } =
    useCaregiverPatient();
  const { updateProfile, isSaving, error: saveProfileError, resetError } =
    useUpdatePatientBirthDate();
  const {
    doctors,
    currentDoctor,
    isLoading: isDoctorsLoading,
    isAssigning,
    assignDoctor,
  } = useAssignDoctor();

  const [editProfileSheetOpen, setEditProfileSheetOpen] = useState(false);
  const [assignSheetOpen, setAssignSheetOpen] = useState(false);

  const handleGoToOnboarding = useCallback(() => {
    router.push(routes.onboardingCaregiver());
  }, [router]);

  const handleEditProfile = useCallback(() => {
    resetError();
    setEditProfileSheetOpen(true);
  }, [resetError]);

  const handleCloseEditProfile = useCallback(() => {
    setEditProfileSheetOpen(false);
    resetError();
  }, [resetError]);

  const handleSaveProfile = useCallback(
    async (name: string, dob: string | null, condition: string) => {
      if (!patient) return;
      const ok = await updateProfile(patient, name, dob, condition);
      if (ok) {
        setEditProfileSheetOpen(false);
        reload();
      }
    },
    [patient, updateProfile, reload],
  );

  const handleOpenAssignSheet = useCallback(() => {
    setAssignSheetOpen(true);
  }, []);

  const handleCloseAssignSheet = useCallback(() => {
    setAssignSheetOpen(false);
  }, []);

  const handleSelectDoctor = useCallback(
    async (doctorId: string) => {
      await assignDoctor(doctorId);
      setAssignSheetOpen(false);
    },
    [assignDoctor],
  );

  return (
    <CaregiverShell activeTab="home">
      <CaregiverPatientProfileScreen
        patient={patient}
        patientMissing={patientMissing}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReload={reload}
        onGoToOnboarding={handleGoToOnboarding}
        onEditProfile={handleEditProfile}
        editProfileSheetOpen={editProfileSheetOpen}
        onCloseEditProfile={handleCloseEditProfile}
        onSaveProfile={handleSaveProfile}
        isSavingProfile={isSaving}
        saveProfileError={saveProfileError}
        onClearProfileError={resetError}
        doctors={doctors}
        currentDoctor={currentDoctor}
        assignSheetOpen={assignSheetOpen}
        onOpenAssignSheet={handleOpenAssignSheet}
        onCloseAssignSheet={handleCloseAssignSheet}
        onSelectDoctor={handleSelectDoctor}
        isDoctorsLoading={isDoctorsLoading}
        isAssigning={isAssigning}
      />
    </CaregiverShell>
  );
}
