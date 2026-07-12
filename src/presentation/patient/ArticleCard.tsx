'use client';

import { useState, useEffect, useMemo } from 'react';
import { FlaskConical, ExternalLink } from 'lucide-react';
import type { PatientResource } from '@/domain/content/content.types';
import { formatRelativeTime } from '@/shared/lib/relativeTime';
import { stripHtml } from '@/shared/lib/stripHtml';

interface ArticleCardProps {
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
 * Pure presentational card for a patient scientific article resource.
 * No fetching. Renders a flask icon tile, journal badge, title, authors,
 * description, and date. When `resource.url` is truthy, a "Ver artículo completo"
 * CTA anchor is rendered at the bottom of the card — it opens the article in a
 * new browser tab via a plain <a> element. No modal, no iframe, no embed viewer.
 * The card root is a plain <article> and is NOT itself interactive.
 */
export function ArticleCard({ resource }: ArticleCardProps) {
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
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-brand-primary/40 px-4 py-4">
      <div className="flex gap-3">
        {/* FlaskConical icon tile */}
        <div
          className="h-10 w-10 shrink-0 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center"
          aria-hidden="true"
        >
          <FlaskConical className="h-5 w-5" />
        </div>

        {/* Content column */}
        <div className="flex flex-col gap-2 min-w-0">
          {/* Journal badge — only when sourceName is truthy */}
          {resource.sourceName && (
            <span className="inline-flex items-center self-start rounded-full bg-brand-primary-light px-2 py-0.5 text-xs font-semibold text-brand-primary">
              {resource.sourceName}
            </span>
          )}

          <h3 className="text-sm font-bold text-brand-dark leading-snug">
            {strippedTitle}
          </h3>

          {/* Authors line — only when authors is truthy */}
          {resource.authors && (
            <p
              className="text-xs text-gray-text line-clamp-1"
              title={resource.authors}
            >
              {resource.authors}
            </p>
          )}

          {strippedDescription && (
            <p className="text-xs text-gray-text line-clamp-3">
              {strippedDescription}
            </p>
          )}

          <p className="text-xs text-gray-text">{dateText}</p>
        </div>
      </div>

      {/* CTA — only when a URL is available */}
      {resource.url && (
        <div className="mt-3 flex justify-end">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver el artículo completo de ${strippedTitle}`}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            Ver artículo completo
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      )}
    </article>
  );
}
