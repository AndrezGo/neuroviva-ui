'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePatientFeed } from '@/application/patient/usePatientFeed';
import { Button } from '@/presentation/ui/Button';

const PAGE_SIZE = 5;

interface PatientChannelDetailScreenProps {
  channelId: string;
  onBack: () => void;
}

/**
 * Content-only screen for a single channel's video feed.
 * Shows a YouTube-style header (avatar, name, video count) followed by a
 * paginated, searchable grid of videos belonging to that channel.
 * PatientShell (header + tab bar) is owned by the page.
 */
export function PatientChannelDetailScreen({
  channelId,
  onBack,
}: PatientChannelDetailScreenProps) {
  const { resources, isLoading, isError, error, reload } = usePatientFeed(
    'video',
    undefined,
    channelId,
  );

  // Defensively filter out any video without a valid embed URL.
  const videos = useMemo(
    () => resources.filter((r) => r.embedUrl !== null),
    [resources],
  );

  // Derive channel header data from the first resource — all items in the feed
  // share the same channel metadata since we fetched by channelId.
  const channelName = videos[0]?.channelName ?? resources[0]?.channelName ?? 'Canal';
  const channelAvatarUrl =
    videos[0]?.channelAvatarUrl ?? resources[0]?.channelAvatarUrl ?? null;
  const totalVideoCount = videos.length;

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const filteredVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return videos;
    return videos.filter((v) => v.title.toLowerCase().includes(query));
  }, [videos, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE));

  // Clamp page whenever the filtered list shrinks below the current page.
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pagedVideos = filteredVideos.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const isEmpty = !isLoading && !isError && videos.length === 0;
  const noSearchResults =
    !isLoading && !isError && videos.length > 0 && filteredVideos.length === 0;

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      {/* Back navigation */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-text hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md"
          aria-label="Volver a canales"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </button>

        {/* Channel header */}
        <div className="flex items-center gap-4">
          {channelAvatarUrl !== null ? (
            <img
              src={channelAvatarUrl}
              alt={channelName}
              loading="lazy"
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-primary-light text-2xl font-bold text-brand-primary"
            >
              {channelName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-xl font-black tracking-tight text-brand-dark">
              {channelName}
            </h2>
            {!isLoading && !isError && (
              <p className="mt-0.5 text-sm text-gray-text">
                {totalVideoCount === 1
                  ? '1 video'
                  : `${totalVideoCount} videos`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loading state — aspect-video shaped skeletons */}
      {isLoading && (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          aria-busy="true"
          aria-label="Cargando videos"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-2"
            >
              <div className="aspect-video w-full animate-pulse rounded-2xl bg-gray-100" />
              <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-gray-100" />
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
            {error ?? 'Ocurrió un error al cargar los videos.'}
          </p>
          <Button variant="primary" size="sm" onClick={reload}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty state — channel exists but has no embeddable videos */}
      {isEmpty && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-gray-text">
            Este canal aún no tiene videos disponibles.
          </p>
        </div>
      )}

      {/* Search input — only when there are videos to search through */}
      {!isLoading && !isError && videos.length > 0 && (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar videos"
            aria-label="Buscar videos"
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

      {/* Video grid + pagination */}
      {!isLoading && !isError && !isEmpty && !noSearchResults && (
        <>
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            aria-label={`Videos de ${channelName}`}
          >
            {pagedVideos.map((resource) => (
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
