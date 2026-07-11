'use client';

import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import type { PatientResource } from '@/domain/content/content.types';
import { formatRelativeTime } from '@/shared/lib/relativeTime';

interface NewsCardProps {
  resource: PatientResource;
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
 * No hooks, no fetching. Renders newspaper icon tile, source badge,
 * title, description, date, and optional primary CTA link.
 */
export function NewsCard({ resource }: NewsCardProps) {
  const [dateText, setDateText] = useState<string>(
    resource.publishedAt ? formatDate(resource.publishedAt) : formatDate(resource.createdAt),
  );

  useEffect(() => {
    if (resource.publishedAt) {
      setDateText(formatRelativeTime(resource.publishedAt));
    }
  }, [resource.publishedAt]);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
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
            {resource.title}
          </h3>

          {resource.description && (
            <p className="text-xs text-gray-text line-clamp-3">
              {resource.description}
            </p>
          )}

          <p className="text-xs text-gray-text">{dateText}</p>

          {/* Primary CTA — only when url is truthy */}
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              aria-label={`Ver la fuente completa de ${resource.title} (se abre en una nueva pestaña)`}
            >
              Ver fuente completa
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
