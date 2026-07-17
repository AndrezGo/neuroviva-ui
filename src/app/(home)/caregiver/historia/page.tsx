'use client';

import { useCaregiverPatient } from '@/application/caregiver/useCaregiverPatient';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';
import { CaregiverTabBar } from '@/presentation/caregiver/CaregiverTabBar';
import { MedicalRecordScreen } from '@/presentation/medical-record/MedicalRecordScreen';
import { Button } from '@/presentation/ui/Button';

/**
 * Caregiver "Historia" tab — resolves the active patient, then delegates to
 * the shared MedicalRecordScreen. No onBack: the user reaches this screen via
 * the tab bar, so there is nothing to navigate back to.
 */
export default function CaregiverHistoriaPage() {
  const { patient, patientMissing, isLoading, isError, error, reload } = useCaregiverPatient();

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </main>
    );
  } else if (isError) {
    content = (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-12">
        <div
          role="alert"
          className="w-full rounded-2xl border border-error-light bg-error-light px-4 py-4 text-center"
        >
          <p className="mb-3 text-sm font-medium text-error">
            {error ?? 'Ocurrió un error al cargar la información del paciente.'}
          </p>
          <Button variant="primary" size="sm" onClick={reload}>
            Reintentar
          </Button>
        </div>
      </main>
    );
  } else if (patientMissing || !patient) {
    content = (
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <p className="text-sm text-gray-text">Aún no hay un paciente vinculado.</p>
      </main>
    );
  } else {
    content = <MedicalRecordScreen patientId={patient.id} mode="caregiver" />;
  }

  return (
    <CaregiverShell activeTab="history">
      {content}
      <CaregiverTabBar activeTab="history" />
    </CaregiverShell>
  );
}
