'use client';

import { usePatientFeed } from '@/application/patient/usePatientFeed';
import { ResourceFeedList } from './ResourceFeedList';

/**
 * Content-only screen for the patient Noticias tab.
 * PatientShell (header + tab bar) is owned by the page — this component
 * renders only the scrollable inner content.
 */
export function PatientNewsScreen() {
  const { resources, isLoading, isError, error, reload } = usePatientFeed('news');

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <h2 className="text-xl font-black tracking-tight text-brand-dark">Noticias</h2>
      <ResourceFeedList
        resources={resources}
        isLoading={isLoading}
        isError={isError}
        error={error}
        reload={reload}
        emptyMessage="Aún no hay noticias para tu condición."
      />
    </div>
  );
}
