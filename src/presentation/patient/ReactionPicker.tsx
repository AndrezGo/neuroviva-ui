'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';
import { REACTION_TYPES, REACTION_LABELS } from '@/domain/community/community.types';
import type { ReactionType } from '@/domain/community/community.types';

interface ReactionPickerProps {
  /** Aggregate reaction counts from the server (e.g. { "apoyo": 3 }). Missing keys = 0. */
  reactions: Record<string, number>;
  /**
   * Reaction types the current user has selected this session.
   * BACKEND GAP: The feed does not expose per-user reaction state, so this is
   * tracked locally in useGroupFeed and passed down as a prop.
   */
  selectedReactions: ReactionType[];
  onToggle: (type: ReactionType) => void;
  disabled?: boolean;
}

/**
 * Qualitative reaction chip strip for a community post.
 * NOT a like button — each chip represents a specific emotional response.
 * Active state is derived from the locally-tracked selectedReactions prop.
 * Memoized to prevent re-renders when sibling posts update.
 */
export const ReactionPicker = React.memo(function ReactionPicker({
  reactions,
  selectedReactions,
  onToggle,
  disabled,
}: ReactionPickerProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Reacciones a esta publicación"
    >
      {REACTION_TYPES.map((type) => {
        const count = reactions[type] ?? 0;
        const isSelected = selectedReactions.includes(type);
        const label = REACTION_LABELS[type];

        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            disabled={disabled}
            aria-pressed={isSelected}
            aria-label={count > 0 ? `${label}: ${count}` : label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
              'transition-all duration-150 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isSelected
                ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-text hover:border-brand-primary/50 hover:text-brand-primary',
            )}
          >
            <span>{label}</span>
            {count > 0 && (
              <span className={cn('font-normal tabular-nums', isSelected ? 'text-white/80' : 'text-gray-text/70')}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});
