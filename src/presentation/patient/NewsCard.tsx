'use client';

import { useState, useEffect, useMemo } from 'react';
import { Newspaper } from 'lucide-react';
import type { PatientResource } from '@/domain/content/content.types';
import { formatRelativeTime } from '@/shared/lib/relativeTime';
import { stripHtml } from '@/shared/lib/stripHtml';

interface NewsCardProps {
  resource: PatientResource;
  onSelect?: (resource: PatientResource) => void;
}

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return `${date.getDate()} ${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Pure presentational card for a patient news resource.
 * No fetching. Renders newspaper icon tile, source badge, title, description,
 * and date. Clicking the card fires the optional `onSelect` callback so the
 * parent can open a detail sheet.
 */
export function NewsCard({ resource, onSelect }: NewsCardProps) {
  const [dateText, setDateText] = useState<string>(
    resource.publishedAt ? formatDate(resource.publishedAt) : formatDate(resource.createdAt),
  );

  useEffect(() => {
    if (resource.publishedAt) {
      setDateText(formatRelativeTime(resource.publishedAt));
    }
  }, [resource.publishedAt]);

  const strippedTitle = useMemo(() => stripHtml(resource.title), [resource.title]);
  const strippedDescription = useMemo(
    () => stripHtml(resource.description),
    [resource.description],
  );

  return (
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-brand-primary/40">
      <button
        type="button"
        onClick={() => onSelect?.(resource)}
        aria-label={`Abrir la noticia: ${strippedTitle}`}
        className="w-full text-left px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-2xl"
      >
        <div className="flex gap-3">
          {/* Newspaper icon tile */}
          <div
            className="h-10 w-10 shrink-0 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center"
            aria-hidden="true"
          >
            <Newspaper className="h-5 w-5" />
          </div>

          {/* Content column */}
          <div className="flex flex-col gap-2 min-w-0">
            {/* Source badge — only when sourceName is truthy */}
            {resource.sourceName && (
              <span className="inline-flex items-center self-start rounded-full bg-brand-primary-light px-2 py-0.5 text-xs font-semibold text-brand-primary">
                {resource.sourceName}
              </span>
            )}

            <h3 className="text-sm font-bold text-brand-dark leading-snug">
              {strippedTitle}
            </h3>

            {strippedDescription && (
              <p className="text-xs text-gray-text line-clamp-3">
                {strippedDescription}
              </p>
            )}

            <p className="text-xs text-gray-text">{dateText}</p>
          </div>
        </div>
      </button>
    </article>
  );
}
