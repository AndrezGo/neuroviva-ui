'use client';

import { CaregiverComingSoon } from '@/presentation/caregiver/CaregiverComingSoon';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';

export default function CaregiverPerfilPacientePage() {
  return (
    <CaregiverShell activeTab="home">
      <CaregiverComingSoon title="Perfil del paciente" activeTab="home" />
    </CaregiverShell>
  );
}
