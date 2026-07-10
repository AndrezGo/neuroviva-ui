'use client';

import { AdminShell } from '@/presentation/layout/AdminShell';
import { AdminContentScreen } from '@/presentation/admin/AdminContentScreen';

/**
 * Admin content management page — resource creation and curation queue.
 */
export default function AdminHomePage() {
  return (
    <AdminShell activeTab="content">
      <AdminContentScreen />
    </AdminShell>
  );
}
