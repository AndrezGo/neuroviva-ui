'use client';

import { usePatientFeed } from '@/application/patient/usePatientFeed';
import { Button } from '@/presentation/ui/Button';
import type { PatientResource } from '@/domain/content/content.types';

/**
 * Content-only screen for the patient Canales (video) tab.
 * PatientShell (header + tab bar) is owned by the page — this component
 * renders only the scrollable inner content.
 *
 * Resources with a null embedUrl are skipped defensively; only those with a
 * ready-to-use YouTube embed URL are rendered in the responsive grid.
 */
export function PatientChannelsScreen() {
  const { resources, isLoading, isError, error, reload } = usePatientFeed('video');

  // Defensive: only render items that have a valid embed URL.
  const channels: PatientResource[] = resources.filter((r) => r.embedUrl !== null);

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <h2 className="text-xl font-black tracking-tight text-brand-dark">Canales</h2>

      {/* Loading state — aspect-video shaped skeleton cards */}
      {isLoading && (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          aria-busy="true"
          aria-label="Cargando canales"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-video w-full animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center"
        >
          <p className="text-sm font-medium text-red-700">
            {error ?? 'Ocurrió un error al cargar los canales.'}
          </p>
          <Button variant="primary" size="sm" onClick={reload}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && channels.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-gray-text">Aún no hay canales para tu condición.</p>
        </div>
      )}

      {/* Populated state — responsive grid of YouTube embeds */}
      {!isLoading && !isError && channels.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {channels.map((resource) => (
            <div key={resource.id} className="flex flex-col gap-2">
              {/* 16:9 iframe wrapper */}
              <div className="aspect-video w-full overflow-hidden rounded-2xl">
                <iframe
                  src={resource.embedUrl!}
                  title={resource.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <p className="text-sm font-semibold leading-snug text-brand-dark">
                {resource.title}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
