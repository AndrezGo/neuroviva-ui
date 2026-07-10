'use client';

import { AdminShell } from '@/presentation/layout/AdminShell';
import { AdminCommunityScreen } from '@/presentation/admin/AdminCommunityScreen';

/**
 * Admin community management page — community group creation.
 */
export default function AdminCommunidadPage() {
  return (
    <AdminShell activeTab="community">
      <AdminCommunityScreen />
    </AdminShell>
  );
}
