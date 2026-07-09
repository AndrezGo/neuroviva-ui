'use client';

import { usePatientFeed } from '@/application/patient/usePatientFeed';
import { ResourceFeedList } from './ResourceFeedList';

/**
 * Content-only screen for the patient Artículos científicos tab.
 * PatientShell (header + tab bar) is owned by the page — this component
 * renders only the scrollable inner content.
 */
export function PatientArticlesScreen() {
  const { resources, isLoading, isError, error, reload } =
    usePatientFeed('scientific_article');

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <h2 className="text-xl font-black tracking-tight text-brand-dark">
        Artículos científicos
      </h2>
      <ResourceFeedList
        resources={resources}
        isLoading={isLoading}
        isError={isError}
        error={error}
        reload={reload}
        emptyMessage="Aún no hay artículos para tu condición."
      />
    </div>
  );
}
