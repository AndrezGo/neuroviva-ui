'use client';

import { useMemo } from 'react';
import { usePatientFeed } from '@/application/patient/usePatientFeed';
import { Button } from '@/presentation/ui/Button';
import type { PatientResource } from '@/domain/content/content.types';

/** Internal shape for a grouped set of videos. */
interface VideoGroup {
  key: string;
  channelName: string | null;
  items: PatientResource[];
}

const NO_CHANNEL_KEY = '__sin_canal__';

/**
 * Content-only screen for the patient Canales (video) tab.
 * PatientShell (header + tab bar) is owned by the page — this component
 * renders only the scrollable inner content.
 *
 * Resources with a null embedUrl are skipped defensively; only those with a
 * ready-to-use YouTube embed URL are rendered in the responsive grid.
 *
 * Videos are grouped by channel (named groups first in first-seen order,
 * then a trailing "Otros videos" bucket for uncategorised resources).
 */
export function PatientChannelsScreen() {
  const { resources, isLoading, isError, error, reload } = usePatientFeed('video');

  // Defensive: only render items that have a valid embed URL.
  const channels: PatientResource[] = resources.filter((r) => r.embedUrl !== null);

  /**
   * Build an ordered array of groups preserving first-seen channel order.
   * Named channel groups come first; the no-channel bucket is always last.
   */
  const groups = useMemo<VideoGroup[]>(() => {
    const map = new Map<string, VideoGroup>();
    const order: string[] = [];

    for (const item of channels) {
      const key = item.channelId ?? NO_CHANNEL_KEY;

      if (!map.has(key)) {
        map.set(key, {
          key,
          channelName: item.channelId !== null ? item.channelName : null,
          items: [],
        });
        order.push(key);
      }

      map.get(key)!.items.push(item);
    }

    // Named groups first (preserving first-seen order), no-channel bucket last.
    const named = order.filter((k) => k !== NO_CHANNEL_KEY);
    const hasNoChannel = order.includes(NO_CHANNEL_KEY);

    const result: VideoGroup[] = named.map((k) => map.get(k)!);
    if (hasNoChannel) {
      result.push(map.get(NO_CHANNEL_KEY)!);
    }

    return result;
  }, [channels]);

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

      {/* Populated state — grouped by channel */}
      {!isLoading && !isError && channels.length > 0 && (
        <div className="flex flex-col gap-8">
          {groups.map((group) => {
            const headingId = `channel-group-${group.key}`;
            const headingText = group.channelName ?? 'Otros videos';

            return (
              <section key={group.key} aria-labelledby={headingId}>
                <h3
                  id={headingId}
                  className="mb-3 text-base font-bold tracking-tight text-brand-dark"
                >
                  {headingText}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {group.items.map((resource) => (
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
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
