'use client';

import { useParams, useRouter } from 'next/navigation';
import { DoctorShell } from '@/presentation/layout/DoctorShell';
import { DoctorTabBar } from '@/presentation/doctor/DoctorTabBar';
import { MedicalRecordScreen } from '@/presentation/medical-record/MedicalRecordScreen';

export default function DoctorPatientHistoriaPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const router = useRouter();

  return (
    <DoctorShell activeTab="patients">
      <MedicalRecordScreen
        patientId={patientId}
        mode="doctor"
        onBack={() => router.back()}
      />
      <DoctorTabBar activeTab="patients" />
    </DoctorShell>
  );
}
