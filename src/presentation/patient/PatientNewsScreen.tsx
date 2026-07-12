'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePatientFeed } from '@/application/patient/usePatientFeed';
import type { PatientResource } from '@/domain/content/content.types';
import { NewsCard } from './NewsCard';
import { NewsDetailSheet } from './NewsDetailSheet';
import { Button } from '@/presentation/ui/Button';

const PAGE_SIZE = 5;

/**
 * Content-only screen for the patient Noticias tab.
 * PatientShell (header + tab bar) is owned by the page — this component
 * renders only the scrollable inner content.
 */
export function PatientNewsScreen() {
  const { resources, isLoading, isError, error, reload } = usePatientFeed('news');

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedResource, setSelectedResource] = useState<PatientResource | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return resources;
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        (r.description ?? '').toLowerCase().includes(query),
    );
  }, [resources, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / PAGE_SIZE));

  // Clamp the current page whenever the filtered set shrinks below the current page.
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pagedResources = filteredResources.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleSelectResource = useCallback((resource: PatientResource) => {
    setSelectedResource(resource);
    setIsSheetOpen(true);
  }, []);

  // Keep selectedResource set on close so the sheet content does not blank
  // out during the exit animation — only clear the open flag.
  const handleCloseSheet = useCallback(() => setIsSheetOpen(false), []);

  const isEmpty = !isLoading && !isError && resources.length === 0;
  const noSearchResults =
    !isLoading && !isError && resources.length > 0 && filteredResources.length === 0;

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <h2 className="text-xl font-black tracking-tight text-brand-dark">Noticias</h2>

      {/* Error state */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center"
        >
          <p className="text-sm font-medium text-red-700">
            {error ?? 'Ocurrió un error al cargar las noticias.'}
          </p>
          <Button variant="primary" size="sm" onClick={reload}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div
          className="flex flex-col gap-3"
          aria-busy="true"
          aria-label="Cargando noticias"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 w-full animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {/* Empty state — no news at all */}
      {isEmpty && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-gray-text">
            Aún no hay noticias para tu condición.
          </p>
        </div>
      )}

      {/* Search input — only when there are news to search through */}
      {!isLoading && !isError && resources.length > 0 && (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar noticias"
            aria-label="Buscar noticias"
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

      {/* Populated list + pagination */}
      {!isLoading && !isError && !isEmpty && !noSearchResults && (
        <>
          <ul className="flex flex-col gap-3" aria-label="Lista de noticias">
            {pagedResources.map((resource) => (
              <li key={resource.id}>
                <NewsCard resource={resource} onSelect={handleSelectResource} />
              </li>
            ))}
          </ul>

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

      {/* Detail sheet — always mounted so the enter/exit animation plays */}
      <NewsDetailSheet
        resource={selectedResource}
        open={isSheetOpen}
        onClose={handleCloseSheet}
      />
    </div>
  );
}
