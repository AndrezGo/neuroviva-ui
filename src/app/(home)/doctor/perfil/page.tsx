'use client';

import { useAuthStore } from '@/shared/store/useAuthStore';
import { useSignOut } from '@/application/auth/useSignOut';
import { getFirstName } from '@/shared/lib/greeting';
import { DoctorShell } from '@/presentation/layout/DoctorShell';
import { DoctorProfileScreen } from '@/presentation/doctor/DoctorProfileScreen';

/**
 * Doctor profile page.
 * Reads identity from useAuthStore; passes null for specialty/medicalLicense (MVP).
 * isScientificCommittee is hardcoded false for MVP.
 */
export default function DoctorPerfilPage() {
  const isScientificCommittee = false;

  const backendUser = useAuthStore((s) => s.backendUser);
  const user = useAuthStore((s) => s.user);

  const firstName = getFirstName(backendUser?.name ?? user?.fullName);
  const email = backendUser?.email ?? user?.email ?? '';

  const { signOut, isLoading: isSigningOut } = useSignOut();

  return (
    <DoctorShell activeTab="profile" isScientificCommittee={isScientificCommittee}>
      <DoctorProfileScreen
        firstName={firstName}
        email={email}
        specialty={null}
        medicalLicense={null}
        onSignOut={signOut}
        isSigningOut={isSigningOut}
        isScientificCommittee={isScientificCommittee}
      />
    </DoctorShell>
  );
}
