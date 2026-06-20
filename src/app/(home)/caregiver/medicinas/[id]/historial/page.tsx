'use client';

import { useParams, useRouter } from 'next/navigation';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';
import { MedicationHistoryScreen } from '@/presentation/caregiver/MedicationHistoryScreen';
import { useMedicationLogs } from '@/application/caregiver/useMedicationLogs';

export default function MedicationHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { logs, isLoading, isError, error, reload } = useMedicationLogs(id);

  return (
    <CaregiverShell activeTab="meds">
      <MedicationHistoryScreen
        logs={logs}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReload={reload}
        onBack={() => router.back()}
      />
    </CaregiverShell>
  );
}
