'use client';

import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { Sheet } from '@/presentation/ui/Sheet';
import type { PatientResource } from '@/domain/content/content.types';
import { stripHtml } from '@/shared/lib/stripHtml';
import { formatRelativeTime } from '@/shared/lib/relativeTime';

interface NewsDetailSheetProps {
  resource: PatientResource | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-up sheet that shows the full detail of a patient news resource.
 * Always mounted by the parent so Sheet's enter/exit animation plays correctly.
 * The body is empty when `resource` is null (sheet is closing or never opened).
 */
export function NewsDetailSheet({ resource, open, onClose }: NewsDetailSheetProps) {
  const strippedTitle = useMemo(
    () => stripHtml(resource?.title),
    [resource?.title],
  );

  const strippedDescription = useMemo(
    () => stripHtml(resource?.description),
    [resource?.description],
  );

  return (
    <Sheet open={open} onClose={onClose} title="Noticia">
      {resource === null ? null : (
        <div className="flex flex-col gap-3">
          {/* Source badge — only when sourceName is truthy */}
          {resource.sourceName && (
            <span className="inline-flex items-center self-start rounded-full bg-brand-primary-light px-2 py-0.5 text-xs font-semibold text-brand-primary">
              {resource.sourceName}
            </span>
          )}

          {/* Full article title */}
          <h3 className="text-base font-bold text-brand-dark leading-snug">
            {strippedTitle}
          </h3>

          {/* Full description — only when non-empty after stripping */}
          {strippedDescription && (
            <p className="text-sm text-gray-text leading-relaxed whitespace-pre-line">
              {strippedDescription}
            </p>
          )}

          {/* Date */}
          <p className="text-xs text-gray-text">
            {formatRelativeTime(resource.publishedAt ?? resource.createdAt)}
          </p>

          {/* "Read full article" CTA — only when url is truthy */}
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Leer el artículo completo de ${strippedTitle} (se abre en una nueva pestaña)`}
              className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              Leer artículo completo
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </Sheet>
  );
}
