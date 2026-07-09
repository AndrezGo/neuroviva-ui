'use client';

import { Button } from '@/presentation/ui/Button';
import { ResourceCard } from './ResourceCard';
import type { PatientResource } from '@/domain/content/content.types';

interface ResourceFeedListProps {
  resources: PatientResource[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reload: () => void;
  emptyMessage: string;
}

/**
 * Pure presentational feed list for patient content.
 * Handles loading (skeleton), error (with retry), empty, and populated states.
 * All data and handlers come from props — no fetching logic inside.
 */
export function ResourceFeedList({
  resources,
  isLoading,
  isError,
  error,
  reload,
  emptyMessage,
}: ResourceFeedListProps) {
  if (isLoading) {
    return (
      <div
        className="flex flex-col gap-3"
        aria-busy="true"
        aria-label="Cargando contenido"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 w-full animate-pulse rounded-2xl bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center"
      >
        <p className="text-sm font-medium text-red-700">
          {error ?? 'Ocurrió un error al cargar el contenido.'}
        </p>
        <Button variant="primary" size="sm" onClick={reload}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-gray-text">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Lista de recursos">
      {resources.map((resource) => (
        <li key={resource.id}>
          <ResourceCard resource={resource} />
        </li>
      ))}
    </ul>
  );
}
