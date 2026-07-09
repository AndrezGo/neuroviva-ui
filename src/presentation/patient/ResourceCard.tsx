'use client';

import type { PatientResource } from '@/domain/content/content.types';

interface ResourceCardProps {
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
 * Pure presentational card for a patient resource (news or scientific article).
 * No fetching, no hooks. Renders title, description, date and optional external link.
 */
export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm flex flex-col gap-2">
      <h3 className="text-sm font-bold text-brand-dark leading-snug">{resource.title}</h3>

      {resource.description && (
        <p className="text-xs text-gray-text line-clamp-3">{resource.description}</p>
      )}

      <p className="text-xs text-gray-text">{formatDate(resource.createdAt)}</p>

      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center self-start rounded-xl bg-brand-primary-light px-3 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1"
          aria-label={`Ver ${resource.title} (se abre en una nueva pestaña)`}
        >
          Ver recurso
        </a>
      )}
    </article>
  );
}
