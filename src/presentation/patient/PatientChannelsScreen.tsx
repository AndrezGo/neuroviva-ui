'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePatientFeed } from '@/application/patient/usePatientFeed';
import { Button } from '@/presentation/ui/Button';
import { routes } from '@/core/routing/routes';

// UX decision: videos without a channelId are excluded from the directory.
// They have no channel identity to display a card for, so a catch-all "Otros
// videos" bucket would break the YouTube-style directory metaphor. Orphan
// videos may still surface via other content types if the backend adds them.

const PAGE_SIZE = 5;

/** Internal model for a channel card derived from grouped resources. */
interface ChannelCard {
  channelId: string;
  channelName: string;
  avatarUrl: string | null;
  videoCount: number;
}

/**
 * Content-only screen for the patient Canales tab — renders a directory of
 * channel cards (one per channel). Clicking a card navigates to the channel
 * detail page. PatientShell (header + tab bar) is owned by the page.
 */
export function PatientChannelsScreen() {
  const { resources, isLoading, isError, error, reload } = usePatientFeed('video');

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Build one ChannelCard per unique channelId. Orphan resources (channelId ===
  // null) are excluded intentionally — see UX decision comment above.
  const channels = useMemo<ChannelCard[]>(() => {
    const map = new Map<string, ChannelCard>();
    const order: string[] = [];

    for (const r of resources) {
      if (r.channelId === null) continue;

      if (!map.has(r.channelId)) {
        map.set(r.channelId, {
          channelId: r.channelId,
          channelName: r.channelName ?? r.channelId,
          avatarUrl: r.channelAvatarUrl,
          videoCount: 0,
        });
        order.push(r.channelId);
      }

      map.get(r.channelId)!.videoCount += 1;
    }

    return order.map((id) => map.get(id)!);
  }, [resources]);

  const filteredChannels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return channels;
    return channels.filter((c) => c.channelName.toLowerCase().includes(query));
  }, [channels, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredChannels.length / PAGE_SIZE));

  // Clamp page whenever the filtered list shrinks below the current page.
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pagedChannels = filteredChannels.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const isEmpty = !isLoading && !isError && channels.length === 0;
  const noSearchResults =
    !isLoading && !isError && channels.length > 0 && filteredChannels.length === 0;

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <h2 className="text-xl font-black tracking-tight text-brand-dark">Canales</h2>

      {/* Loading state — card-shaped skeletons */}
      {isLoading && (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          aria-busy="true"
          aria-label="Cargando canales"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
            >
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-gray-200" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-3.5 w-32 animate-pulse rounded-full bg-gray-200" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-gray-200" />
              </div>
            </div>
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

      {/* Empty state — no channels at all */}
      {isEmpty && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-gray-text">Aún no hay canales para tu condición.</p>
        </div>
      )}

      {/* Search input — only when there are channels to search through */}
      {!isLoading && !isError && channels.length > 0 && (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar canales"
            aria-label="Buscar canales"
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-brand-dark placeholder:text-gray-400 transition-colors focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
      )}

      {/* No search results */}
      {noSearchResults && (
        <div className="flex flex-col items-center gap-2 py-12 text-center animate-fade-up">
          <p className="text-sm font-semibold text-brand-dark">
            Sin resultados para &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-gray-text">Intenta con otras palabras.</p>
        </div>
      )}

      {/* Channel grid + pagination */}
      {!isLoading && !isError && !isEmpty && !noSearchResults && (
        <>
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            aria-label="Directorio de canales"
          >
            {pagedChannels.map((channel) => (
              <Link
                key={channel.channelId}
                href={routes.patientChannelDetail(channel.channelId)}
                aria-label={`Ver canal ${channel.channelName}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-brand-primary/40 hover:bg-brand-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                {/* Avatar */}
                {channel.avatarUrl !== null ? (
                  <img
                    src={channel.avatarUrl}
                    alt={channel.channelName}
                    loading="lazy"
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-primary-light text-xl font-bold text-brand-primary"
                  >
                    {channel.channelName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-brand-dark">
                    {channel.channelName}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-text">
                    {channel.videoCount === 1
                      ? '1 video'
                      : `${channel.videoCount} videos`}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination controls — only when more than one page */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
                className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-brand-primary disabled:cursor-not-allowed disabled:opacity-40 hover:bg-brand-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Anterior
              </button>

              <span className="text-xs font-medium text-gray-text">
                Página {page} de {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Página siguiente"
                className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-brand-primary disabled:cursor-not-allowed disabled:opacity-40 hover:bg-brand-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
