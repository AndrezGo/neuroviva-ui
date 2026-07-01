'use client';

import { Pencil, Stethoscope, User } from 'lucide-react';
import { Button } from '@/presentation/ui/Button';
import { CaregiverTabBar } from './CaregiverTabBar';
import { EditPatientBirthDateSheet } from './EditPatientAgeSheet';
import { AssignDoctorSheet } from './AssignDoctorSheet';
import { formatBirthDateES, calculateAge } from '@/shared/lib/date';
import type { CaregiverPatient } from '@/domain/caregiver/caregiver.types';
import type { DoctorListItem, PatientDoctor } from '@/domain/doctor/doctor.types';

const CONDITION_LABELS: Record<string, string> = {
  alzheimer: 'Alzheimer',
  parkinson: 'Parkinson',
  dementia_mci: 'Demencia (DCL)',
  als: 'ELA',
  huntington: 'Huntington',
  other: 'Otra',
};

function conditionLabel(raw: string): string {
  return CONDITION_LABELS[raw.toLowerCase()] ?? raw;
}

// ── Avatar gradient helper (reused from AssignDoctorSheet logic) ──────────────

const DOCTOR_GRADIENTS = [
  'from-violet-400 to-purple-600',
  'from-blue-400 to-indigo-600',
  'from-teal-400 to-cyan-600',
  'from-emerald-400 to-green-600',
  'from-orange-400 to-amber-600',
  'from-rose-400 to-pink-600',
  'from-sky-400 to-blue-600',
  'from-fuchsia-400 to-violet-600',
];

function getDoctorAvatarGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash += seed.charCodeAt(i);
  }
  return DOCTOR_GRADIENTS[hash % DOCTOR_GRADIENTS.length];
}

interface CaregiverPatientProfileScreenProps {
  patient: CaregiverPatient | null;
  patientMissing: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  onReload: () => void;
  onGoToOnboarding: () => void;
  onEditProfile?: () => void;
  editProfileSheetOpen?: boolean;
  onCloseEditProfile?: () => void;
  onSaveProfile?: (name: string, dob: string | null, condition: string) => void;
  isSavingProfile?: boolean;
  saveProfileError?: string | null;
  onClearProfileError?: () => void;
  // Doctor assignment
  doctors?: DoctorListItem[];
  currentDoctor?: PatientDoctor | null;
  assignSheetOpen?: boolean;
  onOpenAssignSheet?: () => void;
  onCloseAssignSheet?: () => void;
  onSelectDoctor?: (doctorId: string) => void;
  isDoctorsLoading?: boolean;
  isAssigning?: boolean;
}

export function CaregiverPatientProfileScreen({
  patient,
  patientMissing,
  isLoading,
  isError,
  error,
  onReload,
  onGoToOnboarding,
  onEditProfile,
  editProfileSheetOpen,
  onCloseEditProfile,
  onSaveProfile,
  isSavingProfile,
  saveProfileError,
  onClearProfileError,
  doctors = [],
  currentDoctor,
  assignSheetOpen,
  onOpenAssignSheet,
  onCloseAssignSheet,
  onSelectDoctor,
  isDoctorsLoading,
  isAssigning = false,
}: CaregiverPatientProfileScreenProps) {
  return (
    <>
      <main className="flex flex-1 flex-col px-5 lg:px-8 pt-6 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-6xl lg:mx-auto lg:w-full">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-dark mb-6">
          Perfil del paciente
        </h1>

        {/* Error state */}
        {isError && (
          <div
            role="alert"
            className="mb-4 animate-fade-in rounded-2xl border border-error-light bg-error-light px-4 py-4"
          >
            <p className="mb-3 text-sm font-medium text-error">
              {error ?? 'Ocurrió un error al cargar el perfil del paciente.'}
            </p>
            <Button variant="primary" size="sm" onClick={onReload}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Loading skeleton */}
        {!isError && isLoading && (
          <div
            aria-busy="true"
            aria-label="Cargando perfil del paciente"
            className="flex flex-col items-center gap-4 pt-4"
          >
            <div className="h-20 w-20 rounded-full bg-gray-100 animate-pulse" />
            <div className="h-4 w-40 animate-pulse rounded-full bg-gray-100" />
            <div className="mt-4 w-full space-y-4">
              <div className="h-3.5 w-full animate-pulse rounded-full bg-gray-100" />
              <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-gray-100" />
              <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-gray-100" />
            </div>
          </div>
        )}

        {/* Empty / onboarding pending */}
        {!isError && !isLoading && patientMissing && (
          <div className="flex flex-col items-center gap-3 py-16 text-center animate-fade-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary">
              <User className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-brand-dark">
              Aún no hay un paciente vinculado
            </p>
            <p className="max-w-xs text-sm text-gray-text">
              Completa el registro del paciente para ver su perfil aquí.
            </p>
            <Button variant="primary" size="md" onClick={onGoToOnboarding} className="mt-2">
              Completar registro
            </Button>
          </div>
        )}

        {/* Populated state */}
        {!isError && !isLoading && !patientMissing && patient !== null && (
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary text-3xl font-bold text-white"
              aria-hidden="true"
            >
              {patient.name.charAt(0).toUpperCase()}
            </div>

            {/* Patient name */}
            <p className="mt-4 text-xl font-black text-brand-dark">{patient.name}</p>

            {/* Info list */}
            <dl className="mt-8 w-full rounded-2xl border border-gray-200 shadow-sm px-4 divide-y divide-gray-100">
              {/* Fecha de nacimiento */}
              <div className="flex items-center justify-between py-4">
                <dt className="text-sm font-medium text-gray-text">Fecha de nacimiento</dt>
                <dd className="text-sm font-semibold text-brand-dark">
                  {(() => {
                    const formatted = formatBirthDateES(patient.dateOfBirth);
                    const age = calculateAge(patient.dateOfBirth);
                    if (formatted) {
                      const ageLabel = age !== null && age > 0 ? ` (${age} años)` : '';
                      return `${formatted}${ageLabel}`;
                    }
                    return <span className="text-gray-400 font-normal">Sin registrar</span>;
                  })()}
                </dd>
              </div>

              {/* Condición */}
              <div className="flex items-center justify-between py-4">
                <dt className="text-sm font-medium text-gray-text">Condición</dt>
                <dd className="text-sm font-semibold text-brand-dark">
                  {conditionLabel(patient.condition)}
                </dd>
              </div>

              {/* Etapa */}
              {patient.conditionStage !== null &&
                patient.conditionStage !== undefined &&
                patient.conditionStage.trim() !== '' && (
                  <div className="flex items-center justify-between py-4">
                    <dt className="text-sm font-medium text-gray-text">Etapa</dt>
                    <dd className="text-sm font-semibold text-brand-dark">
                      {patient.conditionStage}
                    </dd>
                  </div>
                )}
            </dl>

            {/* Visible edit button */}
            {onEditProfile && (
              <button
                type="button"
                onClick={onEditProfile}
                className="mt-5 flex items-center gap-2 rounded-2xl border border-brand-primary/30 bg-brand-primary-light px-5 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Editar información del paciente
              </button>
            )}

            {/* Edit sheet */}
            {onSaveProfile && onCloseEditProfile && (
              <EditPatientBirthDateSheet
                open={editProfileSheetOpen ?? false}
                currentName={patient.name}
                currentDateOfBirth={patient.dateOfBirth}
                currentCondition={patient.condition}
                isSaving={isSavingProfile ?? false}
                error={saveProfileError ?? null}
                onClose={onCloseEditProfile}
                onSave={onSaveProfile}
                onClearError={onClearProfileError}
              />
            )}

            {/* ── Médico tratante ───────────────────────────────────────── */}
            <div className="mt-8 w-full">
              <h2 className="mb-4 text-base font-black text-brand-dark">Médico tratante</h2>

              {currentDoctor ? (
                /* Doctor card */
                <div className="flex items-center gap-4 rounded-2xl border border-gray-200 px-4 py-4 shadow-sm">
                  {/* Avatar */}
                  <div
                    aria-hidden="true"
                    className={`h-11 w-11 flex-shrink-0 rounded-full bg-gradient-to-br ${getDoctorAvatarGradient(currentDoctor.name)} flex items-center justify-center text-white font-bold text-base`}
                  >
                    {currentDoctor.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-bold text-brand-dark truncate">
                      {currentDoctor.name}
                    </span>
                    {currentDoctor.specialty && (
                      <span className="text-xs text-gray-text truncate">
                        {currentDoctor.specialty}
                      </span>
                    )}
                  </div>

                  {/* Change button */}
                  {onOpenAssignSheet && (
                    <button
                      type="button"
                      onClick={onOpenAssignSheet}
                      className="flex-shrink-0 rounded-2xl border border-brand-primary/30 bg-brand-primary-light px-4 py-2 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                    >
                      Cambiar médico
                    </button>
                  )}
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 py-10 text-center shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary">
                    <Stethoscope className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-brand-dark">Sin médico asignado</p>
                  {onOpenAssignSheet && (
                    <Button variant="primary" size="sm" onClick={onOpenAssignSheet}>
                      Asignar médico
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Assign doctor sheet */}
            {onSelectDoctor && onCloseAssignSheet && (
              <AssignDoctorSheet
                open={assignSheetOpen ?? false}
                onClose={onCloseAssignSheet}
                doctors={doctors}
                currentDoctorId={currentDoctor?.doctorId ?? null}
                isLoading={isDoctorsLoading}
                isAssigning={isAssigning}
                onSelect={onSelectDoctor}
              />
            )}
          </div>
        )}
      </main>

      <CaregiverTabBar activeTab="home" />
    </>
  );
}
