'use client';

import { useParams, useRouter } from 'next/navigation';
import { PatientShell } from '@/presentation/layout/PatientShell';
import { PatientChannelDetailScreen } from '@/presentation/patient/PatientChannelDetailScreen';

/**
 * Dynamic page for a single channel's video feed.
 * Mirrors the PatientGroupFeedPage pattern: routing params and navigation are
 * handled here; the screen component owns only presentation logic.
 */
export default function PatientChannelDetailPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const router = useRouter();

  return (
    <PatientShell activeTab="channels">
      <PatientChannelDetailScreen
        channelId={channelId}
        onBack={() => router.back()}
      />
    </PatientShell>
  );
}
