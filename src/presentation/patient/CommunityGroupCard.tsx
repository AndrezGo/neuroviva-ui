'use client';

import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import type { CommunityGroup } from '@/domain/community/community.types';

interface CommunityGroupCardProps {
  group: CommunityGroup;
  href: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}

/**
 * Pure presentational card for a community group.
 * Displays avatar (image if available, else initials fallback) + name + description.
 * Keyboard-navigable and accessible via Link/focus-visible ring.
 */
export function CommunityGroupCard({ group, href }: CommunityGroupCardProps) {
  return (
    <Link
      href={href}
      aria-label={`Ir al grupo: ${group.name}`}
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm',
        'transition-all duration-150 hover:border-brand-primary/50 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
      )}
    >
      {/* Avatar: image if available, else coloured initials */}
      {group.avatarUrl ? (
        <img
          src={group.avatarUrl}
          alt=""
          aria-hidden="true"
          className="h-12 w-12 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary text-sm font-bold select-none"
        >
          {getInitials(group.name)}
        </div>
      )}

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-brand-dark leading-snug truncate">
          {group.name}
        </h3>
        {group.description && (
          <p className="mt-0.5 text-xs text-gray-text line-clamp-2">
            {group.description}
          </p>
        )}
      </div>
    </Link>
  );
}
