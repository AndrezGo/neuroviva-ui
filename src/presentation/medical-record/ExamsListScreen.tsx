'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ClipboardList, Paperclip } from 'lucide-react';
import { useExams } from '@/application/medical-record/useExams';
import { Button } from '@/presentation/ui/Button';
import { UploadAttachmentSheet } from './UploadAttachmentSheet';
import { formatEventDate } from '@/shared/lib/formatEventDate';
import type { UploadExamInput } from '@/domain/medical-record/medicalRecord.types';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

// ── Props ─────────────────────────────────────────────────────────────────────

interface ExamsListScreenProps {
  patientId: string;
  mode: 'caregiver' | 'doctor';
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ExamsListScreen({ patientId, mode: _mode }: ExamsListScreenProps) {
  const { exams, isLoading, isError, error, reload, upload, isSaving, saveError, resetError } =
    useExams(patientId);

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredExams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return exams;
    return exams.filter((e) => e.description.toLowerCase().includes(q));
  }, [exams, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE));

  // Clamp page whenever the filtered list shrinks below the current page
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pagedExams = filteredExams.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const isEmpty = !isLoading && !isError && exams.length === 0;
  const noSearchResults =
    !isLoading && !isError && exams.length > 0 && filteredExams.length === 0;

  const handleSave = useCallback(
    async (input: {
      eventType: string | null;
      description: string;
      eventDate: string | null;
      attachments: File[];
    }) => {
      const examInput: UploadExamInput = {
        description: input.description,
        eventDate: input.eventDate,
        attachments: input.attachments,
      };
      const ok = await upload(examInput);
      if (ok) {
        setSheetOpen(false);
        reload();
      }
    },
    [upload, reload],
  );

  return (
    <>
      {/* Loading skeletons */}
      {isLoading && (
        <div
          className="space-y-0 divide-y divide-gray-100"
          aria-busy="true"
          aria-label="Cargando exámenes"
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-4">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-36 animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-52 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div
          role="alert"
          className="mb-4 animate-fade-in rounded-2xl border border-error-light bg-error-light px-4 py-4"
        >
          <p className="mb-3 text-sm font-medium text-error">
            {error ?? 'Ocurrió un error al cargar los exámenes.'}
          </p>
          <Button variant="primary" size="sm" onClick={reload}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center gap-3 py-16 text-center animate-fade-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary">
            <ClipboardList className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="text-base font-semibold text-brand-dark">Sin exámenes registrados</p>
          <p className="max-w-xs text-sm text-gray-text">
            Aquí aparecerán los exámenes del paciente. Sube el primero para empezar.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setSheetOpen(true)}
            className="mt-2"
          >
            Subir examen
          </Button>
        </div>
      )}

      {/* Populated state */}
      {!isLoading && !isError && !isEmpty && (
        <>
          {/* Top CTA */}
          <div className="mb-4">
            <Button variant="primary" size="md" onClick={() => setSheetOpen(true)}>
              Subir examen
            </Button>
          </div>

          {/* Search input */}
          <div className="relative mb-4">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por descripción"
              aria-label="Buscar exámenes"
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-brand-dark placeholder:text-gray-400 transition-colors focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {/* No search results */}
          {noSearchResults && (
            <div className="flex flex-col items-center gap-2 py-12 text-center animate-fade-up">
              <p className="text-sm font-semibold text-brand-dark">
                Sin resultados para &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-gray-text">Intenta con otras palabras.</p>
            </div>
          )}

          {/* Exam list */}
          {!noSearchResults && (
            <>
              <ul
                aria-label="Exámenes"
                className="mb-4 rounded-2xl border border-gray-200 shadow-sm px-4"
              >
                {pagedExams.map((exam) => (
                  <li
                    key={exam.id}
                    className="flex flex-col gap-1.5 py-4 border-b border-gray-100 last:border-b-0"
                  >
                    <p className="text-sm font-semibold text-brand-dark">{exam.description}</p>
                    <p className="text-xs text-gray-text">{formatEventDate(exam.eventDate)}</p>
                    {exam.attachments.length > 0 && (
                      <div className="mt-1 flex flex-col gap-1">
                        {exam.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.signedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary"
                          >
                            <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                            {att.fileName}
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* Pagination */}
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
        </>
      )}

      {/* Upload sheet */}
      <UploadAttachmentSheet
        open={sheetOpen}
        kind="exam"
        isSaving={isSaving}
        error={saveError}
        onClose={() => {
          resetError();
          setSheetOpen(false);
        }}
        onClearError={resetError}
        onSave={handleSave}
      />
    </>
  );
}
