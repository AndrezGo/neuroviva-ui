'use client';

import { useParams, useRouter } from 'next/navigation';
import { PatientShell } from '@/presentation/layout/PatientShell';
import { PatientGroupFeedScreen } from '@/presentation/patient/PatientGroupFeedScreen';
import { useGroupFeed } from '@/application/patient/useGroupFeed';

/**
 * Dynamic page for a community group's post feed.
 * Mirrors the MedicationHistoryPage pattern: hook is called here and data/handlers
 * are passed down as props to the pure screen component.
 */
export default function PatientGroupFeedPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const feedState = useGroupFeed(groupId);

  return (
    <PatientShell activeTab="community">
      <PatientGroupFeedScreen
        onBack={() => router.back()}
        feedState={feedState}
      />
    </PatientShell>
  );
}
