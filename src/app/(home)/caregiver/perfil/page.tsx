'use client';

import { useAuthStore } from '@/shared/store/useAuthStore';
import { useSignOut } from '@/application/auth/useSignOut';
import { getFirstName } from '@/shared/lib/greeting';
import { CaregiverProfileScreen } from '@/presentation/caregiver/CaregiverProfileScreen';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';

export default function CaregiverPerfilPage() {
  const backendUser = useAuthStore((s) => s.backendUser);
  const user = useAuthStore((s) => s.user);

  const name = getFirstName(backendUser?.name ?? user?.fullName);
  const email = backendUser?.email ?? user?.email ?? '';

  const { signOut, isLoading } = useSignOut();

  return (
    <CaregiverShell activeTab="profile">
      <CaregiverProfileScreen
        name={name}
        email={email}
        onSignOut={signOut}
        isSigningOut={isLoading}
      />
    </CaregiverShell>
  );
}
