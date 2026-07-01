'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/core/routing/routes';

/**
 * Legacy patient placeholder — redirects to the new patient home at /paciente.
 * Kept to avoid breaking any existing links or bookmarks.
 */
export default function LegacyPatientPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(routes.patientHome());
  }, [router]);

  return null;
}
